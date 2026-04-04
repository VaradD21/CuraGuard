import os
import time
import uuid
import random
from datetime import datetime, timedelta, timezone
import httpx
import asyncio
import psycopg2
from dotenv import load_dotenv

load_dotenv()

BRAIN_URL = "http://127.0.0.1:8000"

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "guardian")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "botvecna")
DB_PORT = os.getenv("DB_PORT", "5432")

async def simulate_api_traffic():
    print("🚀 Triggering Deep API-Level Simulation...")
    print("Connecting directly to the Brain /analyze endpoint...")

    # Set up DB connection to manipulate timestamps (since API just logs as NOW())
    print("🔧 Connecting to DB to enable historical time-shifting...")
    
    async with httpx.AsyncClient(base_url=BRAIN_URL, timeout=30.0) as client:
        email = "parent@example.com"
        pwd = "password123"
        print("🔑 Logging in to Brain API...")
        resp = await client.post("/login", json={"email": email, "password": pwd})
        if resp.status_code != 200:
            print("Registering parent...")
            resp = await client.post("/register", json={"email": email, "password": pwd})
            if resp.status_code != 200:
                print(f"❌ Auth Failed: {resp.text}")
                return
        
        auth_data = resp.json()
        token = auth_data["access_token"]
        parent_id = auth_data["parent_id"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Connect to Postgres
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT)
        
        # Cleanup
        with conn.cursor() as cur:
            cur.execute("DELETE FROM public.alerts WHERE parent_id = %s", (parent_id,))
            cur.execute("DELETE FROM public.events WHERE parent_id = %s", (parent_id,))
            cur.execute("DELETE FROM public.devices WHERE parent_id = %s", (parent_id,))
            cur.execute("INSERT INTO public.devices (parent_id, device_id, device_name, child_age) VALUES (%s, %s, %s, %s), (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
                        (parent_id, "Aarav-PC", "Aarav (Decent)", 14, parent_id, "Kabir-Phone", "Kabir (Naughty)", 12))
        conn.commit()

        children = [
            {"id": "Aarav-PC", "age": 14, "personality": "decent"},
            {"id": "Kabir-Phone", "age": 12, "personality": "naughty"}
        ]

        now = datetime.now(timezone.utc)
        print("\n⏳ Commencing 1-week data generation via ML Model...")

        for child in children:
            print(f"\n👤 Seeding child: {child['id']}")
            
            # Application pools based on personality
            if child['personality'] == "decent":
                app_pools = [
                    ("msedge.exe", "Khan Academy - Calculus", "Watching video on limits.", 10),
                    ("winword.exe", "History Essay.docx", "Drafting an essay on the Industrial Revolution. Progress has been steady.", 20),
                    ("code.exe", "VS Code - Python Project", "def calculate_area(): return length * width", 10),
                    ("spotify.exe", "Lo-Fi Beats", "Playing soft study music from playlist.", 5)
                ]
                threat_pool = [
                    ("chrome.exe", "Google Search", "how to skip school stomach ache fake", -3) # Mild threat 3 days ago
                ]
            else:
                app_pools = [
                    ("chrome.exe", "YouTube - Minecraft", "Watching Minecraft survival series part 4.", 15),
                    ("roblox.exe", "Roblox - Bloxburg", "Building a virtual house with friends.", 15),
                    ("discord.exe", "Gaming Chat", "Bro come online we are starting the match in 5.", 10)
                ]
                threat_pool = [
                    ("discord.exe", "Direct Message - Unknown", "Stranger: hey cutie dont tell anyone we are talking. send me a pic right now.", -1),
                    ("chrome.exe", "Search", "how to bypass parental controls windows 10 registry", -5),
                    ("instagram.exe", "Instagram DMs", "Hater: you are literally the worst player ever, just log off and never play again loser", -4),
                    ("telegram.exe", "Telegram Desktop", "Opening unofficial messaging app.", -2)
                ]

            total_days = 7
            for d in range(total_days, 0, -1):
                day_target = now - timedelta(days=d)
                
                # Everyday safe traffic
                for i in range(5):
                    app, window, text, _ = random.choice(app_pools)
                    ts = day_target.replace(hour=random.randint(9, 21), minute=random.randint(0, 59))
                    
                    payload = {
                        "device_id": child["id"],
                        "captured_at": ts.isoformat(),
                        "process_name": app,
                        "window_title": window,
                        "text": text,
                        "child_age": child["age"],
                        "conversation_context": [],
                        "region_hash": str(uuid.uuid4())
                    }
                    
                    r = await client.post("/analyze", json=payload, headers=headers)
                    if r.status_code == 200:
                        res = r.json()
                        event_id = res.get("id")
                        if event_id:
                            # Manually shift the timestamp in DB
                            with conn.cursor() as cur:
                                cur.execute("UPDATE public.events SET captured_at = %s WHERE id = %s", (ts, event_id))
                            conn.commit()

                # Add specific threat for the day if it matches
                for app, window, text, t_day in threat_pool:
                    if t_day == -d:
                        ts = day_target.replace(hour=18, minute=30)
                        payload = {
                            "device_id": child["id"],
                            "captured_at": ts.isoformat(),
                            "process_name": app,
                            "window_title": window,
                            "text": text,
                            "child_age": child["age"],
                            "conversation_context": [],
                            "region_hash": str(uuid.uuid4())
                        }
                        r = await client.post("/analyze", json=payload, headers=headers)
                        if r.status_code == 200:
                            v = r.json()
                            event_id = v.get("id")
                            print(f"   ⚠️ [THREAT] Risk: {v.get('risk_level')} - {v.get('threat_category')} -> {v.get('action_recommended')}")
                            if event_id:
                                with conn.cursor() as cur:
                                    cur.execute("UPDATE public.events SET captured_at = %s WHERE id = %s", (ts, event_id))
                                conn.commit()
                            
    conn.close()
    print("\n✅ API SIMULATION COMPLETE. Data is securely stored using the REAL MODEL and PIPELINE!")

if __name__ == "__main__":
    asyncio.run(simulate_api_traffic())
