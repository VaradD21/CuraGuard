import os
import json
import uuid
import random
import bcrypt
import psycopg2
from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Load env
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "guardian")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "botvecna")
DB_PORT = os.getenv("DB_PORT", "5432")
FIELD_KEY = os.getenv("GUARDIAN_FIELD_KEY")

if not FIELD_KEY:
    exit(1)

fernet = Fernet(FIELD_KEY.encode())

def encrypt_verdict(data):
    return fernet.encrypt(json.dumps(data).encode()).hex()

def run_multi_child_simulation():
    print("🚀 Running Multi-Child Professional Presentation Simulation...")
    
    conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT)
    cur = conn.cursor()

    try:
        # 1. Setup Parent
        email = "parent@example.com"
        password = "password123"
        cur.execute("SELECT id FROM public.parents WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row:
            hpwd = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            cur.execute("INSERT INTO public.parents (email, password_hash) VALUES (%s, %s) RETURNING id", (email, hpwd))
            parent_id = cur.fetchone()[0]
        else:
            parent_id = row[0]

        # 2. Define Children
        children = [
            {"id": "Aarav-PC", "name": "Aarav (Decent)", "age": 14, "personality": "decent"},
            {"id": "Kabir-Phone", "name": "Kabir (Naughty)", "age": 12, "personality": "stubborn"}
        ]
        
        # 3. Cleanup parent data
        cur.execute("DELETE FROM public.alerts WHERE parent_id = %s", (parent_id,))
        cur.execute("DELETE FROM public.events WHERE parent_id = %s", (parent_id,))
        cur.execute("DELETE FROM public.devices WHERE parent_id = %s", (parent_id,))
        
        now = datetime.now(timezone.utc)
        
        for child in children:
            print(f"👤 Seeding data for {child['name']}...")
            cur.execute("INSERT INTO public.devices (parent_id, device_id, device_name, child_age) VALUES (%s, %s, %s, %s)", 
                        (parent_id, child['id'], child['name'], child['age']))
            
            # Application pools based on personality
            if child['personality'] == "decent":
                app_pools = [
                    ("msedge.exe", "Khan Academy - Algebra", "safe", 0.0),
                    ("winword.exe", "History Project.docx", "safe", 0.0),
                    ("code.exe", "Visual Studio Code - Python Project", "safe", 0.0),
                    ("spotify.exe", "Focus Music", "safe", 0.0),
                    ("chrome.exe", "National Geographic", "safe", 0.05),
                    ("zoom.exe", "Online School Session", "safe", 0.0)
                ]
                daily_events = random.randint(40, 60)
            else:
                app_pools = [
                    ("chrome.exe", "YouTube - Pranks", "safe", 0.1),
                    ("discord.exe", "Gaming Chat", "safe", 0.2),
                    ("instagram.exe", "Instagram Feed", "safe", 0.3),
                    ("roblox.exe", "Roblox Obby", "safe", 0.1),
                    ("msedge.exe", "Minecraft Wiki", "safe", 0.05),
                    ("chrome.exe", "Twitch Live Stream", "safe", 0.2)
                ]
                daily_events = random.randint(70, 90)

            # Generate 7 days of data
            for day_idx in range(7):
                day_ts = now - timedelta(days=day_idx)
                for _ in range(daily_events):
                    app, window, label, base_risk = random.choice(app_pools)
                    ts = day_ts.replace(hour=random.randint(9, 21), minute=random.randint(0, 59))
                    risk = min(1.0, base_risk + random.uniform(0, 0.1))
                    
                    v = {"risk_level": label, "reason": "Consistent with usage profile.", "threat_category": "None", "behavioral_flags": []}
                    cur.execute("""
                        INSERT INTO public.events 
                        (parent_id, device_id, captured_at, window_title, process_name, risk_score, sentiment_label, alert, threat_category, verdict_enc, behavioral_flags)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (parent_id, child['id'], ts, window, app, risk, "neutral", False, "None", encrypt_verdict(v), "[]"))

            # Personality-specific alerts for Kabir (the naughty one)
            if child['personality'] == "stubborn":
                # Alert 1: Social Distraction
                v_distraction = {"risk_level": "mild", "reason": "Excessive social media during school hours.", "threat_category": "Distraction", "behavioral_flags": ["Time Management"]}
                cur.execute("""
                    INSERT INTO public.events (parent_id, device_id, captured_at, window_title, process_name, risk_score, sentiment_label, alert, threat_category, verdict_enc, text_snippet, behavioral_flags)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (parent_id, child['id'], now - timedelta(days=2, hours=3), "Instagram", "chrome.exe", 0.4, "neutral", True, "Distraction", encrypt_verdict(v_distraction), "Scrolling feed for 2 consecutive hours.", '["Time Management"]'))
                
                # Alert 2: Blocked App Attempt (Minor bypass)
                v_bypass = {"risk_level": "dangerous", "reason": "Attempted to launch unapproved chat app.", "threat_category": "Policy Violation", "behavioral_flags": ["Unauthorized App"]}
                cur.execute("""
                    INSERT INTO public.events (parent_id, device_id, captured_at, window_title, process_name, risk_score, sentiment_label, alert, threat_category, verdict_enc, text_snippet, behavioral_flags)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (parent_id, child['id'], now - timedelta(hours=2), "Telegram", "telegram.exe", 0.8, "neutral", True, "Policy Violation", encrypt_verdict(v_bypass), "Child attempted to launch Telegram Desktop.", '["Unauthorized App"]'))

        conn.commit()
        print(f"\n✅ PROFESIONAL SIMULATION READY.")
        print(f"Parent: {email} / password123")
        print(f"Children: Aarav (Decent) & Kabir (Naughty)")

    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_multi_child_simulation()
