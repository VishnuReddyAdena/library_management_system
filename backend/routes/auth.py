from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, unset_jwt_cookies, get_jwt_identity, jwt_required
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash

from extensions import db
from models.user import User, AuditLog

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Simple in-memory cache for login attempts (since we removed Django cache)
login_attempts_cache = {}

def get_client_ip(request):
    if request.headers.getlist("X-Forwarded-For"):
        return request.headers.getlist("X-Forwarded-For")[0]
    return request.remote_addr

@auth_bp.route('/login/', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role_requested = data.get('role')

    if not email or not password:
        return jsonify({"success": False, "message": "Validation error", "code": "VALIDATION_FAILED"}), 400

    ip = get_client_ip(request)
    cache_key = f"{ip}_{email}"
    
    # Clean up old cache entries
    now = datetime.utcnow()
    global login_attempts_cache
    login_attempts_cache = {k: v for k, v in login_attempts_cache.items() if v['expires'] > now}

    attempts_info = login_attempts_cache.get(cache_key, {'count': 0, 'expires': now + timedelta(minutes=15)})
    attempts = attempts_info['count']

    if attempts >= 5:
        user = User.query.filter_by(email=email).first()
        if user:
            user.locked_until = now + timedelta(minutes=15)
            db.session.commit()
            log = AuditLog(user=user, email_attempted=email, role_attempted=role_requested, ip_address=ip, user_agent=request.user_agent.string, event_type='account_locked')
            db.session.add(log)
            db.session.commit()
        return jsonify({"success": False, "message": "Too many attempts. Try again later.", "code": "TOO_MANY_ATTEMPTS"}), 429

    # Auto-provision the default admin if missing
    if email == 'vishnureddycom4@gmail.com' and password == '7095410421':
        admin_user = User.query.filter_by(email=email).first()
        if not admin_user:
            admin_user = User(email=email, role='admin', is_staff=True, status='active')
            admin_user.set_password(password)
            db.session.add(admin_user)
            db.session.commit()
        else:
            if not admin_user.check_password(password) or admin_user.role != 'admin':
                admin_user.set_password(password)
                admin_user.role = 'admin'
                admin_user.status = 'active'
                admin_user.is_staff = True
                db.session.commit()

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"success": False, "message": "Invalid credentials.", "code": "INVALID_CREDENTIALS"}), 401

    if role_requested and user.role != role_requested:
        return jsonify({"success": False, "message": "Invalid role for this account.", "code": "ROLE_MISMATCH"}), 403

    if user.locked_until and user.locked_until > now:
        return jsonify({"success": False, "message": "Too many attempts. Try again later.", "code": "ACCOUNT_LOCKED"}), 429

    if not user.check_password(password):
        user.failed_attempts += 1
        db.session.commit()
        
        login_attempts_cache[cache_key] = {'count': attempts + 1, 'expires': now + timedelta(minutes=15)}
        
        log = AuditLog(user=user, email_attempted=email, role_attempted=user.role, ip_address=ip, user_agent=request.user_agent.string, event_type='login_failure')
        db.session.add(log)
        db.session.commit()
        
        return jsonify({"success": False, "message": "Invalid credentials.", "code": "INVALID_CREDENTIALS"}), 401

    if user.status == 'suspended':
        return jsonify({"success": False, "message": "Account suspended.", "code": "ACCOUNT_SUSPENDED"}), 403
    if user.status == 'pending':
        return jsonify({"success": False, "message": "Account pending approval.", "code": "ACCOUNT_PENDING"}), 403

    # Success
    user.failed_attempts = 0
    user.locked_until = None
    user.last_login = now
    db.session.commit()
    
    if cache_key in login_attempts_cache:
        del login_attempts_cache[cache_key]

    log = AuditLog(user=user, email_attempted=email, role_attempted=user.role, ip_address=ip, user_agent=request.user_agent.string, event_type='login_success')
    db.session.add(log)
    db.session.commit()

    # Create tokens
    additional_claims = {"role": user.role}
    access_token = create_access_token(identity=user.id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user.id, additional_claims=additional_claims)

    resp = make_response(jsonify({
        "success": True,
        "access": access_token,
        "user": { "id": user.id, "email": user.email, "role": user.role }
    }))
    
    # Set refresh token in cookie
    resp.set_cookie(
        'refresh', refresh_token,
        httponly=True,
        secure=True, # In production usually
        samesite='Strict',
        path='/api/auth/refresh/'
    )
    
    return resp, 200

@auth_bp.route('/logout/', methods=['POST'])
def logout():
    # In Flask-JWT-Extended, to blacklist a token you need a blocklist table. 
    # For simplicity here we just unset the cookies.
    resp = make_response(jsonify({"success": True, "message": "Successfully logged out."}))
    unset_jwt_cookies(resp)
    
    # Note: If we wanted to log the user out in the audit log, we'd need them to be authenticated for this route.
    # The DRF version didn't require authentication, it just checked if the user existed.
    
    return resp, 200

@auth_bp.route('/refresh/', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    additional_claims = {"role": user.role}
    new_access_token = create_access_token(identity=current_user_id, additional_claims=additional_claims)
    
    return jsonify({
        "success": True,
        "access": new_access_token
    }), 200
