import authService from '../services/authService';

export const addAuditLog = (action, level = 'info', user = 'System') => {
  const newLog = {
    id: Date.now() + Math.random(),
    user: user,
    action: action,
    time: 'Just now',
    level: level,
    timestamp: Date.now()
  };

  // Save to localStorage (fallback/instant sync)
  try {
    const stored = localStorage.getItem('admin_audit_logs');
    const logs = stored ? JSON.parse(stored) : [];
    const updated = [newLog, ...logs];
    localStorage.setItem('admin_audit_logs', JSON.stringify(updated));
    // Dispatch custom event to notify listeners on the same tab
    window.dispatchEvent(new Event('storage_updated'));
  } catch (e) {
    console.error("Failed to add audit log to localStorage", e);
  }

  // Save to backend database if authenticated
  const token = localStorage.getItem('access_token');
  if (token) {
    authService.post('/api/audit-logs/', { action, level, user })
      .catch(err => {
        console.error("Failed to send audit log to database:", err);
      });
  }
};

