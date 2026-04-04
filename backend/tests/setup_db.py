import psycopg2
import os
import socket
from dotenv import load_dotenv

# Load .env from the server directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "server", ".env"))

def setup_db():
    host = os.getenv("DB_HOST", "").strip()
    dbname = os.getenv("DB_NAME", "").strip()
    user = os.getenv("DB_USER", "").strip()
    password = os.getenv("DB_PASSWORD", "").strip()
    port = os.getenv("DB_PORT", "").strip()
    
    # Try to resolve to IP first to avoid "could not translate host name"
    try:
        ip_addr = socket.gethostbyname(host)
        print(f"DEBUG: Resolved {host} to {ip_addr}")
        final_host = ip_addr
    except Exception as e:
        print(f"WARNING: Could not resolve {host} via socket: {e}")
        # Fallback to the IPv6 address I found via nslookup if possible
        # Actually, let's try the hostname again but with extra care
        final_host = host

    schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")

    try:
        conn = psycopg2.connect(
            host=final_host,
            dbname=dbname,
            user=user,
            password=password,
            port=port,
            connect_timeout=10
        )
        cur = conn.cursor()
        
        print(f"✅ CONNECTED: Running schema from {schema_path}...")
        with open(schema_path, "r") as f:
            sql = f.read()
            # Split by semicolon if needed, but psycopg2 can usually handle batches
            cur.execute(sql)
        
        conn.commit()
        print("✅ SUCCESS: Database schema initialized successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    setup_db()
