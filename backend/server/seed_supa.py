import os
import uuid
import json
import random
import bcrypt
import psycopg2
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

def seed():
    email = "sdsdmyself@gmail.com"
    password = "darsh@05"
    
    print(f"Seeding parent: {email}")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    conn = get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                # 1. Clear existing data for this email to avoid duplicates
                cur.execute("SELECT id FROM public.parents WHERE email = %s", (email,))
                parent_row = cur.fetchone()
                if parent_row:
                    parent_id = parent_row[0]
                    print(f"Deleting existing data for parent ID: {parent_id}")
                    cur.execute("DELETE FROM public.alerts WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.events WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.children WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.parents WHERE id = %s", (parent_id,))
                
                # 2. Insert Parent
                cur.execute(
                    "INSERT INTO public.parents (email, password_hash) VALUES (%s, %s) RETURNING id",
                    (email, password_hash)
                )
                parent_id = cur.fetchone()[0]
                
                # 3. Insert Children
                def gen_code():
                    import string
                    return "-".join(["".join(random.choices(string.ascii_uppercase + string.digits, k=4)) for _ in range(3)])

                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (parent_id, "Tanmay", gen_code(), True, datetime.now(timezone.utc))
                )
                tanmay_id = cur.fetchone()[0]
                
                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (parent_id, "Varad", gen_code(), True, datetime.now(timezone.utc))
                )
                varad_id = cur.fetchone()[0]
                
                # 4. Generate Events
                apps = ["Discord", "Chrome", "YouTube", "Roblox", "Notepad", "WhatsApp", "Zoom"]
                threats = ["grooming_attempt", "toxic_behavior", "self_harm_intent", "cyberbullying"]
                
                start_time = datetime.now(timezone.utc) - timedelta(days=7)
                
                print("Generating events for Tanmay (Naughty: ~10% alerts)...")
                for i in range(100):
                    captured_at = start_time + timedelta(minutes=i * 100 + random.randint(0, 50))
                    process = random.choice(apps)
                    
                    is_alert = (i % 10 == 0) # Exactly 10%
                    risk_score = random.uniform(0.7, 0.95) if is_alert else random.uniform(0.05, 0.3)
                    risk_label = "hazardous" if is_alert else "safe"
                    threat_cat = random.choice(threats) if is_alert else "none"
                    
                    event_id = str(uuid.uuid4())
                    
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags, verdict_enc
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        event_id, parent_id, tanmay_id, "PC-TANMAY-01", captured_at, f"Watching {process}", process,
                        0.5, risk_label, risk_score, risk_label, is_alert,
                        threat_cat, "Escalation" if is_alert else "Normal", "block" if is_alert else "monitor",
                        json.dumps(["suspicious_link"] if is_alert else []), 
                        "6865785f63697068657274657874" # Mock hex
                    ))
                    
                    if is_alert:
                        cur.execute(
                            "INSERT INTO public.alerts (parent_id, child_id, event_id, reason) VALUES (%s, %s, %s, %s)",
                            (parent_id, tanmay_id, event_id, f"Detected {threat_cat}")
                        )

                print("Generating events for Varad (Docile: 0% alerts)...")
                for i in range(50):
                    captured_at = start_time + timedelta(minutes=i * 200 + random.randint(0, 100))
                    process = random.choice(apps)
                    
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags, verdict_enc
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        str(uuid.uuid4()), parent_id, varad_id, "PC-VARAD-02", captured_at, f"Studying {process}", process,
                        0.8, "safe", 0.1, "safe", False,
                        "none", "Normal", "monitor", "[]", 
                        "6865785f63697068657274657874" # Mock hex
                    ))
                    
        print("Successfully seeded all data!")
        print(f"Parent Email: {email}")
        print(f"Parent Password: {password}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed()
