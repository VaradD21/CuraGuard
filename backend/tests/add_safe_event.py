import psycopg2
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load .env from the server directory
env_path = os.path.join(os.path.dirname(__file__), "..", "server", ".env")
load_dotenv(env_path)

def add_safe_event():
    host = os.getenv("DB_HOST", "").strip()
    dbname = os.getenv("DB_NAME", "").strip()
    user = os.getenv("DB_USER", "").strip()
    password = os.getenv("DB_PASSWORD", "").strip()
    port = os.getenv("DB_PORT", "").strip()

    try:
        conn = psycopg2.connect(
            host=host,
            dbname=dbname,
            user=user,
            password=password,
            port=port,
            connect_timeout=10
        )
        cur = conn.cursor()
        
        # 1. Find or Create a parent ID (ensure one exists for testing)
        cur.execute("SELECT id FROM public.parents LIMIT 1;")
        parent = cur.fetchone()
        if not parent:
            print("INFO: No parents found. Creating a test parent...")
            parent_id = str(uuid.uuid4())
            cur.execute("INSERT INTO public.parents (id, email, password_hash) VALUES (%s, %s, %s)", 
                        (parent_id, "test_parent@example.com", "dummy_hash"))
        else:
            parent_id = parent[0]
        
        # 2. Define a device ID
        device_id = "CuraGuard-Child-01"
        
        # 3. Insert a safe event
        event_id = str(uuid.uuid4())
        captured_at = datetime.now(timezone.utc)
        
        cur.execute("""
            INSERT INTO public.events (
                id, parent_id, device_id, captured_at, window_title, 
                process_name, text_snippet, sentiment_score, 
                sentiment_label, risk_score, risk_label, alert
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            event_id, parent_id, device_id, captured_at, 
            "Educational Site", "chrome.exe", "How to build a solar system model",
            0.9, "positive", 0.05, "safe", False
        ))
        
        conn.commit()
        print(f"✅ SUCCESS: Added a 'safe' event (ID: {event_id}) for Parent {parent_id}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    add_safe_event()
