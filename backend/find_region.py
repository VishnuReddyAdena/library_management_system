import psycopg2
import os

project_refs = ["zrcosnvxxluptjfpuzxl", "zrcosnvxxluptjfpnzxl"]
password = ".GKE9%2BFpbU9zSZ7"

regions = [
    "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
    "sa-east-1", "ca-central-1"
]

print("Scanning all global Supabase networks...")

success = False

for ref in project_refs:
    for region in regions:
        host = f"aws-0-{region}.pooler.supabase.com"
        user = f"postgres.{ref}"
        try:
            conn = psycopg2.connect(
                host=host,
                database="postgres",
                user=user,
                password=".GKE9+FpbU9zSZ7", # raw password without url encoding for psycopg2
                port=6543,
                connect_timeout=2
            )
            print(f"\n[SUCCESS] Found your database! Region: {region}, Project Ref: {ref}")
            conn.close()
            
            # Automatically update the .env file
            env_path = ".env"
            with open(env_path, "r") as f:
                content = f.read()
            
            new_url = f"DATABASE_URL=postgresql://{user}:{password}@{host}:6543/postgres"
            
            import re
            new_content = re.sub(r"DATABASE_URL=.*", new_url, content)
            
            with open(env_path, "w") as f:
                f.write(new_content)
                
            print("Successfully updated backend/.env automatically!")
            success = True
            break
        except Exception as e:
            continue
    if success:
        break

if not success:
    print("\n[FAILED] Could not connect to any Supabase region. Your database might be Paused or Deleted.")
