import os
import uuid
import json
import random
import bcrypt
import psycopg2
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Use absolute path to ensure .env is found from any CWD
load_dotenv(r"c:\Users\Darshdeep\Desktop\Desktop\Trial And Error\ChildSafety_V1.0\V 2.0\backend\server\.env")

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
    
    print(f"🚀 Starting Precision Seeding for: {email}")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    conn = get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                # 1. Verification of parent existence
                cur.execute("SELECT id FROM public.parents WHERE email = %s", (email,))
                parent_row = cur.fetchone()
                if parent_row:
                    parent_id = parent_row[0]
                else:
                    cur.execute(
                        "INSERT INTO public.parents (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id",
                        (email, password_hash, "Darshdeep")
                    )
                    parent_id = cur.fetchone()[0]
                
                # 2. Insert Children
                def gen_code():
                    import string
                    return "-".join(["".join(random.choices(string.ascii_uppercase + string.digits, k=4)) for _ in range(3)])

                print("Creating children Tanmay and Varad...")
                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, NOW()) RETURNING id",
                    (parent_id, "Tanmay", gen_code(), True)
                )
                tanmay_id = cur.fetchone()[0]
                
                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, NOW()) RETURNING id",
                    (parent_id, "Varad", gen_code(), True)
                )
                varad_id = cur.fetchone()[0]
                
                # 3. Register Devices
                cur.execute(
                    "INSERT INTO public.devices (parent_id, device_id, device_name, child_age) VALUES (%s, %s, %s, %s) ON CONFLICT (device_id) DO NOTHING",
                    (parent_id, "PC-TANMAY-01", "Tanmay's Gaming PC", 14)
                )
                cur.execute(
                    "INSERT INTO public.devices (parent_id, device_id, device_name, child_age) VALUES (%s, %s, %s, %s) ON CONFLICT (device_id) DO NOTHING",
                    (parent_id, "PC-VARAD-02", "Varad's Study Laptop", 10)
                )

                # First, clear old events and alerts for this parent to reset the testing state.
                cur.execute("DELETE FROM public.alerts WHERE parent_id = %s", (parent_id,))
                cur.execute("DELETE FROM public.events WHERE parent_id = %s", (parent_id,))

                # 4. Generate Realistic, Safe Events for Tanmay (0% alert rate)
                apps_tanmay = [
                    ("Discord", ["Voice call with friends", "Chatting in Gaming Server", "Screen sharing Minecraft"]),
                    ("Chrome", ["Watching Educational YouTube", "Researching for Science Project", "Math homework help"]),
                    ("YouTube", ["Minecraft gameplay video", "Lofi girl music", "Science experiment tutorial"]),
                    ("Roblox", ["Playing Adopt Me", "Playing Blox Fruits", "Roblox Studio editing"]),
                    ("Steam", ["Store page", "Downloading updates", "Chatting"])
                ]
                
                start_time = datetime.now(timezone.utc) - timedelta(days=7)
                
                print("Generating 80 realistic activity events for Tanmay...")
                for i in range(80):
                    captured_at = start_time + timedelta(minutes=i * 60 + random.randint(0, 30))
                    process_choice = random.choice(apps_tanmay)
                    process = process_choice[0]
                    window_title = random.choice(process_choice[1])
                    
                    # 0% alert match.
                    is_alert = False
                    risk_score = random.uniform(0.01, 0.15)
                    risk_label = "safe"
                    threat_cat = "none"
                    
                    duration = random.randint(600, 3600)

                    event_id = str(uuid.uuid4())
                    
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags,
                            verdict_enc, duration_seconds
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        event_id, parent_id, tanmay_id, "PC-TANMAY-01", captured_at, window_title, process,
                        0.9, risk_label, risk_score, risk_label, is_alert,
                        threat_cat, "Normal", "monitor",
                        "[]", 
                        "encrypted_payload_data", duration
                    ))

                # 5. Generate Realistic, Study-Heavy Events for Varad (0% alert rate)
                print("Generating 60 study-heavy events for Varad...")
                apps_varad = [
                    ("Notion", ["Writing essay draft", "Reading class notes", "Task management"]),
                    ("Calculator", ["Scientific mode", "Standard calculator"]),
                    ("Word", ["History Paper.docx - Word", "Book Report.docx - Word"]),
                    ("OneNote", ["Biology Notes - OneNote", "Math Formulas - OneNote"]),
                    ("Chrome", ["Wikipedia - World War II", "Dictionary.com", "School portal"])
                ]
                for i in range(60):
                    captured_at = start_time + timedelta(minutes=i * 100 + random.randint(0, 45))
                    process_choice = random.choice(apps_varad)
                    process = process_choice[0]
                    window_title = random.choice(process_choice[1])
                    duration = random.randint(1200, 5400) # Long study sessions

                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags,
                            verdict_enc, duration_seconds
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        str(uuid.uuid4()), parent_id, varad_id, "PC-VARAD-02", captured_at, window_title, process,
                        0.95, "safe", 0.02, "safe", False,
                        "none", "Normal", "monitor", "[]", 
                        "encrypted_safe_content", duration
                    ))
                    
        print("✅ Success! Database seeded with Safe, Realistic Data (0 alerts).")
        print(f"   - Tanmay: 80 events (0 alerts + realistic game/chat)")
        print(f"   - Varad:  60 events (0 alerts + heavy study time)")
    finally:
        conn.close()

if __name__ == "__main__":
    seed()
