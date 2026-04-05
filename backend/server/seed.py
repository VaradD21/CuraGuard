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
        host=os.getenv("DB_HOST", "localhost"),
        dbname=os.getenv("DB_NAME", "curaguard"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        port=os.getenv("DB_PORT", "5432")
    )

def seed():
    email = "admin@curaguard.com"
    password = "password"
    
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

                child3_access = gen_code()

                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (parent_id, "Abhay", gen_code(), True, datetime.now(timezone.utc))
                )
                abhay_id = cur.fetchone()[0]
                
                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (parent_id, "Nitin", gen_code(), True, datetime.now(timezone.utc))
                )
                nitin_id = cur.fetchone()[0]

                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (parent_id, "Third Child", child3_access, False, None)
                )
                child3_id = cur.fetchone()[0]
                
                # 4. Generate Events
                apps = ["Discord", "Chrome", "YouTube", "Roblox", "WhatsApp", "Zoom"]
                threats = ["grooming_attempt", "toxic_behavior", "self_harm_intent", "nsfw_image", "cyberbullying"]
                
                start_time = datetime.now(timezone.utc) - timedelta(days=7)
                
                print("Generating events for Nitin (Naughty: ~15% alerts)...")
                for i in range(120):
                    captured_at = start_time + timedelta(minutes=i * 80 + random.randint(0, 40))
                    process = random.choice(apps)
                    
                    is_alert = (i % 7 == 0) # About 15%
                    risk_score = random.uniform(0.75, 0.98) if is_alert else random.uniform(0.01, 0.15)
                    risk_label = "hazardous" if is_alert else "safe"
                    threat_cat = random.choice(threats) if is_alert else "none"
                    duration_sec = random.randint(30, 600)
                    
                    event_id = str(uuid.uuid4())
                    
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags, verdict_enc, duration_seconds
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        event_id, parent_id, nitin_id, "PC-NITIN", captured_at, f"Watching {process}", process,
                        0.5, risk_label, risk_score, risk_label, is_alert,
                        threat_cat, "Escalation" if is_alert else "Normal", "block" if is_alert else "monitor",
                        json.dumps(["suspicious_link"] if is_alert else []), 
                        "6865785f63697068657274657874", # Mock hex
                        duration_sec
                    ))
                    
                    if is_alert:
                        cur.execute(
                            "INSERT INTO public.alerts (parent_id, child_id, event_id, reason) VALUES (%s, %s, %s, %s)",
                            (parent_id, nitin_id, event_id, f"Detected {threat_cat}")
                        )

                print("Generating events for Abhay (Docile: 0% alerts)...")
                for i in range(80):
                    captured_at = start_time + timedelta(minutes=i * 120 + random.randint(0, 60))
                    process = random.choice(apps)
                    duration_sec = random.randint(30, 900)
                    
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags, verdict_enc, duration_seconds
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        str(uuid.uuid4()), parent_id, abhay_id, "PC-ABHAY", captured_at, f"Studying on {process}", process,
                        0.8, "safe", 0.05, "safe", False,
                        "none", "Normal", "monitor", "[]", 
                        "6865785f63697068657274657874", # Mock hex
                        duration_sec
                    ))
                    
        print("Successfully seeded all data!")
        print("-" * 30)
        print(f"Parent Email: {email}")
        print(f"Parent Password: {password}")
        print(f"Third Child Access Code: {child3_access}")
        print("-" * 30)
    finally:
        conn.close()

if __name__ == "__main__":
    seed()
