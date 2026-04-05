"""
Project Guardian — FastAPI Brain V3
  - AES-256 encrypted verdict storage (no raw text/images ever stored)
  - Email alerts (Gmail SMTP)
  - Heartbeat endpoint + 3-minute watchdog
  - /decrypt endpoint (only Brain can decrypt)
  - /analytics endpoint (daily/weekly/monthly)
  - Aggressive intervention flag propagation
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import smtplib
import uuid
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import bcrypt
import httpx
import jwt
import psycopg2
import psycopg2.extras
import psycopg2.pool
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

load_dotenv()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("guardian.brain")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Project Guardian Brain", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)
vader_analyzer = SentimentIntensityAnalyzer()

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-parent-jwt-token")
CHILD_JWT_SECRET = os.getenv("CHILD_JWT_SECRET", "super-secret-child-jwt-token")
MODEL_URL  = os.getenv("MODEL_URL", "http://127.0.0.1:8001")

# ── AES-256 Fernet Encryption ──────────────────────────────────────────────────
# Generate a key once: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Then set GUARDIAN_FIELD_KEY in brain/.env
_FIELD_KEY_RAW = os.getenv("GUARDIAN_FIELD_KEY", "")
if _FIELD_KEY_RAW:
    _fernet = Fernet(_FIELD_KEY_RAW.encode())
else:
    _auto_key = Fernet.generate_key()
    _fernet = Fernet(_auto_key)
    log.warning("GUARDIAN_FIELD_KEY not set — using ephemeral key. Set in .env to persist decryption!")


def _encrypt(data: Any) -> str:
    """Encrypt any JSON-serialisable object → hex-encoded Fernet ciphertext."""
    return _fernet.encrypt(json.dumps(data, default=str).encode()).hex()


def _decrypt(hex_ciphertext: str) -> Any:
    """Decrypt hex-encoded Fernet ciphertext → Python object."""
    return json.loads(_fernet.decrypt(bytes.fromhex(hex_ciphertext)).decode())


def _text_hash(text: str) -> str:
    """SHA-256 of text — for deduplication only, never reveals content."""
    return hashlib.sha256(text.encode()).hexdigest()


# ── Heartbeat Tracking ─────────────────────────────────────────────────────────
_heartbeat_registry: dict[str, datetime] = {}
_HEARTBEAT_TIMEOUT = 180  # seconds (3 minutes)


# ── Email Dispatcher ───────────────────────────────────────────────────────────
ALERT_EMAIL_FROM = os.getenv("ALERT_EMAIL_FROM", "")
ALERT_EMAIL_TO   = os.getenv("ALERT_EMAIL_TO", "")
GMAIL_APP_PASS   = os.getenv("GMAIL_APP_PASSWORD", "")


def send_email_alert(subject: str, body_html: str) -> None:
    """Send HTML email via Gmail SMTP. Silently fails if not configured."""
    if not all([ALERT_EMAIL_FROM, ALERT_EMAIL_TO, GMAIL_APP_PASS]):
        log.debug("Email not configured — skipping.")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 Guardian Alert: {subject}"
        msg["From"]    = ALERT_EMAIL_FROM
        msg["To"]      = ALERT_EMAIL_TO
        msg.attach(MIMEText(body_html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(ALERT_EMAIL_FROM, GMAIL_APP_PASS)
            server.sendmail(ALERT_EMAIL_FROM, ALERT_EMAIL_TO, msg.as_string())
        log.info("Email alert sent: %s", subject)
    except Exception as exc:
        log.warning("Email alert failed: %s", exc)


def _threat_email_html(device_id: str, threat_cat: str, risk_level: str,
                        ai_judgment: str, action: str, process_name: str) -> str:
    color = {"hazardous": "#dc2626", "dangerous": "#ea580c",
             "warning": "#d97706", "mild": "#ca8a04"}.get(risk_level, "#6b7280")
    return f"""
    <html><body style="font-family:sans-serif;background:#0f172a;color:#f1f5f9;padding:24px">
      <div style="max-width:600px;margin:auto;background:#1e293b;border-radius:12px;
                  padding:24px;border:1px solid #334155">
        <h2 style="color:{color};margin:0 0 16px">🚨 Guardian Safety Alert</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#94a3b8">Device</td>
              <td style="padding:8px">{device_id}</td></tr>
          <tr><td style="padding:8px;color:#94a3b8">App</td>
              <td style="padding:8px">{process_name}</td></tr>
          <tr><td style="padding:8px;color:#94a3b8">Threat</td>
              <td style="padding:8px;color:{color};font-weight:bold">{threat_cat.upper()}</td></tr>
          <tr><td style="padding:8px;color:#94a3b8">Risk Level</td>
              <td style="padding:8px">{risk_level}</td></tr>
          <tr><td style="padding:8px;color:#94a3b8">Action Taken</td>
              <td style="padding:8px">{action}</td></tr>
        </table>
        <div style="margin:16px 0;padding:12px;background:#0f172a;border-radius:8px">
          <p style="color:#94a3b8;margin:0 0 8px;font-size:12px">AI JUDGMENT</p>
          <p style="margin:0">{ai_judgment}</p>
        </div>
        <p style="color:#64748b;font-size:11px">
          Project Guardian &mdash; {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        </p>
      </div>
    </body></html>"""


def _termination_email_html(device_id: str, last_seen: datetime) -> str:
    return f"""
    <html><body style="font-family:sans-serif;background:#0f172a;color:#f1f5f9;padding:24px">
      <div style="max-width:600px;margin:auto;background:#450a0a;border-radius:12px;
                  padding:24px;border:2px solid #dc2626">
        <h2 style="color:#dc2626">🔴 CRITICAL: Monitoring Disabled</h2>
        <p>The safety monitoring app on device <strong>{device_id}</strong> has not responded
           since <strong>{last_seen.strftime('%Y-%m-%d %H:%M:%S UTC')}</strong>.</p>
        <p>Your child may have <strong>terminated the monitoring process</strong>.</p>
        <p style="color:#94a3b8">Please investigate immediately and restart the monitoring app.</p>
      </div>
    </body></html>"""


# ── Background watchdog: fire alert for missed heartbeats ──────────────────────
async def _heartbeat_watchdog():
    while True:
        await asyncio.sleep(60)
        now = datetime.now(timezone.utc)
        for device_id, last_seen in list(_heartbeat_registry.items()):
            if (now - last_seen).total_seconds() > _HEARTBEAT_TIMEOUT:
                log.warning("HEARTBEAT MISSED: %s — last seen %s", device_id, last_seen)
                await asyncio.to_thread(
                    send_email_alert,
                    f"CRITICAL: Monitoring stopped on {device_id}",
                    _termination_email_html(device_id, last_seen),
                )
                del _heartbeat_registry[device_id]


def _run_daily_reports():
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # Calculate stats for all parents in one query
                cur.execute("""
                    SELECT parent_id, 
                           COUNT(*) as total_events, 
                           SUM(CASE WHEN alert THEN 1 ELSE 0 END) as total_alerts 
                    FROM public.events 
                    WHERE captured_at >= NOW() - INTERVAL '1 day'
                    GROUP BY parent_id
                """)
                stats_by_parent = {str(row["parent_id"]): row for row in cur.fetchall()}
                
                # Fetch all parents
                cur.execute("SELECT id, email FROM public.parents")
                parents = cur.fetchall()
                
                for p in parents:
                    pid = str(p["id"])
                    stats = stats_by_parent.get(pid, {"total_events": 0, "total_alerts": 0})
                    
                    html = f"""
                    <html><body style="font-family:sans-serif;background:#0f172a;color:#f1f5f9;padding:24px">
                      <div style="max-width:600px;margin:auto;background:#1e293b;border-radius:12px;
                                  padding:24px;border:1px solid #334155">
                        <h2 style="color:#38bdf8;margin:0 0 16px">📅 Daily Guardian Report</h2>
                        <p>Here is your daily summary for the past 24 hours.</p>
                        <ul>
                            <li>Total Activity Captured: {stats['total_events']}</li>
                            <li>Interventions / Alerts Triggered: <strong>{stats['total_alerts']}</strong></li>
                        </ul>
                        <p>Log into your Guardian Dashboard to see detailed analytics.</p>
                      </div>
                    </body></html>
                    """
                    # Blocking send_email_alert since this is running in asyncio.to_thread
                    send_email_alert("Daily Guardian Activity Report", html)
    finally:
        pool.putconn(conn)


async def _daily_report_watchdog():
    """Phase 15: Daily email report scheduler."""
    while True:
        now = datetime.now()
        # Sleep until 8 AM the next day if we're past 8 AM
        target_time = now.replace(hour=8, minute=0, second=0, microsecond=0)
        if now >= target_time:
            target_time += timedelta(days=1)
        
        sleep_seconds = (target_time - now).total_seconds()
        log.info("Next daily report scheduled in %.1f seconds", sleep_seconds)
        await asyncio.sleep(sleep_seconds)
        
        # Run the synchronous report generation off the main async event loop
        try:
            await asyncio.to_thread(_run_daily_reports)
        except Exception as e:
            log.error("Failed to generate daily reports: %s", e)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(_heartbeat_watchdog())
    asyncio.create_task(_daily_report_watchdog())


# ── Database Pool ──────────────────────────────────────────────────────────────
_pg_pool: psycopg2.pool.ThreadedConnectionPool | None = None


def _get_pg_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _pg_pool
    if _pg_pool is None:
        host = os.getenv("DB_HOST")
        user = os.getenv("DB_USER")
        pwd  = os.getenv("DB_PASSWORD")
        name = os.getenv("DB_NAME", "postgres")
        port = int(os.getenv("DB_PORT", "5432"))

        if not all([host, user, pwd]):
            log.error("CRITICAL: Missing Database Environment Variables (DB_HOST, DB_USER, or DB_PASSWORD)")
            raise RuntimeError("Database configuration incomplete.")

        log.info("Attempting database connection to %s as user %s...", host, user[:10] + "...")
        try:
            _pg_pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=1, maxconn=20,
                host=host, dbname=name, user=user, password=pwd, port=port
            )
            log.info("✅ Database connection pool initialized successfully.")
        except Exception as exc:
            log.error("❌ Database connection failed: %s", exc)
            raise
    return _pg_pool


def _pg_exec(sql: str, params: list) -> None:
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
    finally:
        pool.putconn(conn)


def _pg_fetch(sql: str, params: list) -> list:
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, params)
                return cur.fetchall()
    finally:
        pool.putconn(conn)


def db_insert(row: dict[str, Any]) -> None:
    cols = ", ".join(row.keys())
    placeholders = ", ".join(["%s"] * len(row))
    _pg_exec(f"INSERT INTO public.events ({cols}) VALUES ({placeholders})", list(row.values()))


def db_insert_alert(parent_id: str, child_id: str | None, device_id: str, reason: str) -> None:
    _pg_exec("""
        INSERT INTO public.alerts (parent_id, child_id, event_id, reason)
        SELECT %s, %s, id, %s FROM public.events
        WHERE device_id = %s ORDER BY captured_at DESC LIMIT 1
    """, [parent_id, child_id, reason, device_id])


# ── JWT Auth ───────────────────────────────────────────────────────────────────
def _get_token_sub(token: str, secret: str) -> str:
    payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_exp": False})
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")
    return sub

def require_jwt(creds: HTTPAuthorizationCredentials | None = Depends(security)) -> str:
    if creds is None:
        raise HTTPException(status_code=401, detail="Missing Bearer Token")
    try:
        return _get_token_sub(creds.credentials, JWT_SECRET)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid Parent JWT: {exc}")

def require_child_jwt(creds: HTTPAuthorizationCredentials | None = Depends(security)) -> dict[str, str]:
    """Returns {parent_id: str, child_id: str}"""
    if creds is None:
        raise HTTPException(status_code=401, detail="Missing Child Agent Token")
    try:
        payload = jwt.decode(creds.credentials, CHILD_JWT_SECRET, algorithms=["HS256"], options={"verify_exp": False})
        p_id = payload.get("parent_id")
        c_id = payload.get("sub")
        if not p_id or not c_id:
            raise HTTPException(status_code=401, detail="Invalid Child Token payload")
        return {"parent_id": p_id, "child_id": c_id}
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid Child JWT: {exc}")


# ── Pydantic Models ────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    device_id: str
    captured_at: datetime
    window_title: str = ""
    process_name: str = ""
    text: str = ""
    region_hash: str = ""
    image_b64: str | None = None
    child_age: int = 12
    conversation_context: list[str] = []
    screen_time: dict[str, float] = {}   # app_name -> seconds
    duration_seconds: int = 0           # [NEW] focus time for the current app

class ChildCreateRequest(BaseModel):
    name: str
    age: int | None = None
    email: str | None = None
    mobile_number: str | None = None
    student_id: str | None = None
    grade: str | None = None

class ActivateRequest(BaseModel):
    access_code: str
    device_id: str


class AnalyzeResponse(BaseModel):
    id: str = ""
    sentiment_label: str = "neutral"
    sentiment_score: float = 0.0
    risk_label: str = "safe"
    risk_score: float = 0.0
    alert: bool = False
    threat_category: str = "unknown"
    detected_phase: str = "Normal"
    ai_judgment: str = ""
    action_recommended: str = ""
    behavioral_flags: list[str] = []
    flagged_messages: list[int] = []
    ai_judgment: str = ""
    action_recommended: str = "monitor"
    behavioral_flags: list[str] = []
    flagged_messages: list[int] = []


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    parent_id: str
    email: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class AgeUpdateRequest(BaseModel):
    child_age: int


class HeartbeatRequest(BaseModel):
    device_id: str
    parent_id: str | None = None


class DecryptRequest(BaseModel):
    verdict_enc_hex: str


# ── Helper ─────────────────────────────────────────────────────────────────────
def _heuristic_risk(text: str) -> tuple[str, float]:
    keywords = ("meet", "secret", "dont tell", "don't tell", "alone", "pics", "address",
                 "come over", "our secret", "delete this")
    hits = sum(1 for k in keywords if k in text.lower())
    score = min(1.0, hits * 0.15)
    return ("elevated" if score > 0.3 else "low"), score


def calculate_relationship_score(text: str) -> float:
    vs = vader_analyzer.polarity_scores(text)
    return float((vs["compound"] * max(vs["pos"], vs["neg"])) + (1.2 * 0.8))


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok", "version": "0.3.0"}


# ── Auth ───────────────────────────────────────────────────────────────────────
@app.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM public.parents WHERE email = %s", (req.email,))
                if cur.fetchone():
                    raise HTTPException(status_code=400, detail="Email already registered")
                hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
                cur.execute(
                    "INSERT INTO public.parents (email, password_hash) VALUES (%s, %s) RETURNING id",
                    (req.email, hashed)
                )
                parent_id = str(cur.fetchone()[0])
                token = jwt.encode({"sub": parent_id, "email": req.email}, JWT_SECRET, algorithm="HS256")
                return AuthResponse(access_token=token, parent_id=parent_id, email=req.email)
    except psycopg2.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")
    finally:
        pool.putconn(conn)


@app.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, password_hash FROM public.parents WHERE email = %s", (req.email,))
                row = cur.fetchone()
                if not row or not bcrypt.checkpw(req.password.encode(), row[1].encode()):
                    raise HTTPException(status_code=401, detail="Invalid email or password")
                parent_id = str(row[0])
                token = jwt.encode({"sub": parent_id, "email": req.email}, JWT_SECRET, algorithm="HS256")
                return AuthResponse(access_token=token, parent_id=parent_id, email=req.email)
    except psycopg2.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")
    finally:
        pool.putconn(conn)


@app.post("/change_password")
def change_password(req: ChangePasswordRequest, parent_id: str = Depends(require_jwt)):
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT password_hash FROM public.parents WHERE id = %s", (parent_id,))
                row = cur.fetchone()
                if not row or not bcrypt.checkpw(req.old_password.encode(), row[0].encode()):
                    raise HTTPException(status_code=401, detail="Incorrect current password")
                new_hash = bcrypt.hashpw(req.new_password.encode(), bcrypt.gensalt()).decode()
                cur.execute("UPDATE public.parents SET password_hash = %s WHERE id = %s",
                            (new_hash, parent_id))
                return {"status": "success"}
    except psycopg2.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")
    finally:
        pool.putconn(conn)


@app.get("/devices")
def get_devices(parent_id: str = Depends(require_jwt)):
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("SELECT device_id, device_name, child_age FROM public.devices WHERE parent_id = %s", (parent_id,))
                return {"devices": cur.fetchall()}
    except psycopg2.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")
    finally:
        pool.putconn(conn)


@app.post("/devices/{device_id}/age")
def update_device_age(device_id: str, req: AgeUpdateRequest, parent_id: str = Depends(require_jwt)):
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM public.devices WHERE device_id = %s AND parent_id = %s", (device_id, parent_id))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Device not found")
                
                cur.execute("UPDATE public.devices SET child_age = %s WHERE device_id = %s AND parent_id = %s", (req.child_age, device_id, parent_id))
                return {"status": "success", "child_age": req.child_age}
    except psycopg2.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")
    finally:
        pool.putconn(conn)


# ── Children & Activation ──────────────────────────────────────────────────────
def _generate_access_code() -> str:
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    return "-".join(["".join(random.choices(chars, k=4)) for _ in range(3)])

@app.post("/children")
def create_child(req: ChildCreateRequest, parent_id: str = Depends(require_jwt)):
    code = _generate_access_code()
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO public.children (parent_id, name, age, email, mobile_number, student_id, grade, access_code) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                    "RETURNING id, name, access_code",
                    (parent_id, req.name, req.age, req.email, req.mobile_number, req.student_id, req.grade, code)
                )
                return cur.fetchone()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        pool.putconn(conn)

@app.get("/children")
def get_children(parent_id: str = Depends(require_jwt)):
    children = _pg_fetch(
        "SELECT id, name, age, email, mobile_number, student_id, grade, access_code, is_activated, activated_at FROM public.children WHERE parent_id = %s ORDER BY created_at DESC",
        [parent_id]
    )
    return {"children": children}

@app.get("/dashboard")
def get_dashboard(parent_id: str = Depends(require_jwt)):
    """Returns events, alerts, and children summary for the parent portal."""
    events = _pg_fetch(
        "SELECT id, child_id, device_id, window_title, process_name, risk_label, threat_category, duration_seconds, captured_at FROM public.events WHERE parent_id = %s ORDER BY captured_at DESC LIMIT 50",
        [parent_id]
    )
    alerts = _pg_fetch(
        "SELECT id, child_id, reason, created_at FROM public.alerts WHERE parent_id = %s ORDER BY created_at DESC LIMIT 20",
        [parent_id]
    )
    # Screen time per app (last 7 days)
    screen_time = _pg_fetch(
        "SELECT process_name, SUM(duration_seconds) as total_seconds FROM public.events WHERE parent_id = %s AND captured_at > now() - interval '7 days' GROUP BY process_name ORDER BY total_seconds DESC LIMIT 10",
        [parent_id]
    )
    return {"events": events, "alerts": alerts, "screen_time": screen_time}



@app.post("/activate")
def activate_child(req: ActivateRequest):
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, parent_id, name FROM public.children WHERE access_code = %s",
                    (req.access_code,)
                )
                child = cur.fetchone()
                if not child:
                    raise HTTPException(status_code=404, detail="Invalid access code")
                
                # Mark as activated
                cur.execute(
                    "UPDATE public.children SET is_activated = true, activated_at = NOW() WHERE id = %s",
                    (child["id"],)
                )
                
                token = jwt.encode({
                    "sub": str(child["id"]),
                    "parent_id": str(child["parent_id"]),
                    "name": child["name"],
                    "device_id": req.device_id
                }, CHILD_JWT_SECRET, algorithm="HS256")
                
                return {
                    "child_id": child["id"],
                    "parent_id": child["parent_id"],
                    "child_name": child["name"],
                    "access_token": token
                }
    finally:
        pool.putconn(conn)

# ── Heartbeat ──────────────────────────────────────────────────────────────────
@app.post("/heartbeat")
def heartbeat(req: HeartbeatRequest) -> dict:
    now = datetime.now(timezone.utc)
    _heartbeat_registry[req.device_id] = now
    log.debug("Heartbeat: %s @ %s", req.device_id, now)
    return {"status": "alive", "timestamp": now.isoformat()}


@app.get("/heartbeat/status")
def heartbeat_status() -> dict:
    now = datetime.now(timezone.utc)
    dead = {
        d: last.isoformat()
        for d, last in _heartbeat_registry.items()
        if (now - last).total_seconds() > _HEARTBEAT_TIMEOUT
    }
    return {"dead_devices": dead, "checked_at": now.isoformat()}


# ── Decrypt ────────────────────────────────────────────────────────────────────
@app.post("/decrypt", dependencies=[Depends(require_jwt)])
def decrypt_verdict(req: DecryptRequest) -> dict:
    """Only callable by authenticated parents. Brain-side decryption only."""
    try:
        return {"verdict": _decrypt(req.verdict_enc_hex)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {exc}")


# ── Analytics ──────────────────────────────────────────────────────────────────
@app.get("/analytics")
def analytics(
    period: str = "daily",   # daily | weekly | monthly
    device_id: str | None = None,
    parent_id: str = Depends(require_jwt),
):
    """Aggregated risk/threat statistics for the dashboard analytics tab."""
    if period == "weekly":
        interval = "7 days"
    elif period == "monthly":
        interval = "30 days"
    else:
        interval = "1 day"

    query = """
        SELECT
            DATE_TRUNC('day', captured_at) AS day,
            COUNT(*)                        AS total_events,
            SUM(CASE WHEN alert THEN 1 ELSE 0 END) AS alerts,
            AVG(risk_score)                 AS avg_risk,
            threat_category,
            process_name
        FROM public.events
        WHERE parent_id = %s
          AND captured_at >= NOW() - INTERVAL %s
    """
    params = [parent_id, interval]
    if device_id:
        query += " AND device_id = %s"
        params.append(device_id)
    query += " GROUP BY day, threat_category, process_name ORDER BY day DESC"

    rows = _pg_fetch(query, params)
    return {"period": period, "data": [dict(r) for r in rows]}


@app.get("/analytics/screen_time")
def screen_time_analytics(device_id: str | None = None, parent_id: str = Depends(require_jwt)):
    """Per-app total focus duration aggregated from screen_time data."""
    query = """
        SELECT process_name, 
               COUNT(*) AS captures, 
               AVG(risk_score) AS avg_risk, 
               SUM(duration_seconds) AS total_seconds
        FROM public.events
        WHERE parent_id = %s
    """
    params = [parent_id]
    if device_id:
        query += " AND device_id = %s"
        params.append(device_id)
        
    query += " GROUP BY process_name ORDER BY total_seconds DESC"
    rows = _pg_fetch(query, params)
    return {"apps": [dict(r) for r in rows]}


@app.get("/keystrokes/{device_id}")
def behavioral_summary(device_id: str, parent_id: str = Depends(require_jwt)):
    """Phase 15: Behavioral pattern summary based on metadata."""
    rows = _pg_fetch("""
        SELECT behavioral_flags 
        FROM public.events 
        WHERE parent_id = %s AND device_id = %s AND behavioral_flags != '[]'
        ORDER BY captured_at DESC LIMIT 100
    """, [parent_id, device_id])
    
    flag_counts = {}
    for r in rows:
        try:
            flags = json.loads(r["behavioral_flags"])
            for f in flags:
                flag_counts[f] = flag_counts.get(f, 0) + 1
        except:
            pass
            
    return {"device_id": device_id, "behavioral_flags": flag_counts}


@app.get("/events/{device_id}")
def recent_events(device_id: str, limit: int = 20, parent_id: str = Depends(require_jwt)):
    """Returns the most recent flagged events for a device — used to populate the threat hint feed."""
    rows = _pg_fetch("""
        SELECT captured_at, threat_category, action_recommended, process_name, risk_label, alert
        FROM public.events
        WHERE parent_id = %s AND device_id = %s AND alert = true
        ORDER BY captured_at DESC
        LIMIT %s
    """, [parent_id, device_id, min(limit, 50)])
    return {"device_id": device_id, "events": [dict(r) for r in rows]}


# ── Main Analyze ───────────────────────────────────────────────────────────────
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(body: AnalyzeRequest, auth: dict = Depends(require_child_jwt)) -> AnalyzeResponse:
    parent_id = auth["parent_id"]
    child_id = auth["child_id"]
    
    log.info("Analyze parent=%s child=%s device=%s", parent_id, child_id, body.device_id)
    event_id = uuid.uuid4()

    # Build conversation for the model
    convo_entries = list(body.conversation_context) + ([body.text] if body.text else [])
    conversation = [{"sender": "child", "text": e, "image_base64": None} for e in convo_entries]
    if body.image_b64 and conversation:
        conversation[-1]["image_base64"] = body.image_b64

    # Lookup configured child_age from DB and auto-register the device if first seen
    configured_age = body.child_age or 14
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT child_age FROM public.devices WHERE device_id = %s AND parent_id = %s", (body.device_id, parent_id))
                row = cur.fetchone()
                if row:
                    if row[0] is not None:
                        configured_age = row[0]
                else:
                    # First time we see this device — register it automatically
                    # so it shows up in GET /devices on the parent app
                    try:
                        cur.execute(
                            "INSERT INTO public.devices (parent_id, device_id, device_name, child_age) "
                            "VALUES (%s, %s, %s, %s) ON CONFLICT (device_id) DO NOTHING",
                            (parent_id, body.device_id, body.device_id[:20], configured_age)
                        )
                        log.info("Auto-registered new device: %s for parent: %s", body.device_id, parent_id)
                    except Exception as reg_exc:
                        log.warning("Device auto-register failed (non-fatal): %s", reg_exc)
    finally:
        pool.putconn(conn)

    metadata = {
        "sender_id": body.device_id,
        "conversation_id": body.region_hash or body.device_id,
        "friendship_duration_days": 0,
        "sender_age": configured_age,
        "receiver_age": 25,   # conservative default — unknown stranger
    }

    model_result: dict = {}
    media_result: dict = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Text / conversation analysis
        try:
            r = await client.post(f"{MODEL_URL}/analyze",
                                  json={"conversation": conversation, "metadata": metadata})
            if r.status_code == 200:
                model_result = r.json()
            else:
                log.warning("Model /analyze returned %s", r.status_code)
        except Exception as exc:
            log.warning("Model unreachable (%s) — using heuristic fallback", exc)
            _, fallback_score = _heuristic_risk(body.text)
            model_result = {
                "risk_level": "mild" if fallback_score > 0.3 else "safe",
                "confidence": fallback_score,
                "reason": "Fallback heuristic (model unreachable)",
                "threat_category": "unknown",
                "detected_phase": "Normal",
                "ai_judgment": "Model offline — heuristic used.",
                "action_recommended": "monitor",
                "behavioral_flags": [],
                "flagged_messages": [],
            }

        # 2. Image / media analysis
        if body.image_b64:
            try:
                r2 = await client.post(f"{MODEL_URL}/analyze_media",
                                       json={"media_base64": body.image_b64, "media_type": "image"})
                if r2.status_code == 200:
                    media_result = r2.json()
            except Exception as exc:
                log.warning("Model /analyze_media failed: %s", exc)

    # 3. Map model result → Guardian response
    risk_level     = model_result.get("risk_level", "safe").lower()
    confidence     = float(model_result.get("confidence", 0.0))
    ai_judgment    = model_result.get("ai_judgment") or model_result.get("reason", "")
    threat_cat     = model_result.get("threat_category", "unknown")
    detected_phase = model_result.get("detected_phase", "Normal")
    action         = model_result.get("action_recommended", "monitor").lower()
    beh_flags      = model_result.get("behavioral_flags", [])
    flagged_msgs   = model_result.get("flagged_messages", [])

    # Boost on NSFW image
    if media_result.get("is_adult") and float(media_result.get("confidence", 0)) > 0.6:
        action     = "block"
        risk_level = "dangerous" if risk_level in ("safe", "mild", "moderate") else risk_level
        threat_cat = "nsfw_image"
        ai_judgment += " [NSFW image detected by vision model]"

    ALERT_LEVELS = {"dangerous", "critical", "hazardous"}
    alert = risk_level in ALERT_LEVELS or action in ("block", "alert")

    rel_score = calculate_relationship_score(body.text) if body.text else 0.0

    resp = AnalyzeResponse(
        id=str(event_id),
        sentiment_label=risk_level,
        sentiment_score=rel_score,
        risk_label=risk_level,
        risk_score=confidence,
        alert=alert,
        threat_category=threat_cat,
        detected_phase=detected_phase,
        ai_judgment=ai_judgment,
        action_recommended=action,
        behavioral_flags=beh_flags,
        flagged_messages=flagged_msgs,
    )

    # 4. Persist — PRIVACY: encrypt verdict, NEVER store raw text or images
    verdict_payload = {
        "threat_category":    threat_cat,
        "detected_phase":     detected_phase,
        "ai_judgment":        ai_judgment,
        "action_recommended": action,
        "behavioral_flags":   beh_flags,
        "risk_level":         risk_level,
        "confidence":         confidence,
    }
    row = {
        "id":                 str(event_id),
        "parent_id":          parent_id,
        "child_id":           child_id,
        "device_id":          body.device_id,
        "captured_at":        body.captured_at.replace(tzinfo=timezone.utc),
        "window_title":       body.window_title[:500],
        "process_name":       body.process_name[:200],
        # Privacy: store ONLY a hash of the text, never the actual content
        "text_hash":          _text_hash(body.text) if body.text else "",
        "sentiment_score":    rel_score,
        "sentiment_label":    risk_level,
        "relationship_score": rel_score,
        "risk_score":         confidence,
        "risk_label":         risk_level,
        "alert":              alert,
        # Non-sensitive summary (for dashboard quick-view without decryption)
        "threat_category":    threat_cat,
        "detected_phase":     detected_phase,
        "action_recommended": action,
        "behavioral_flags":   json.dumps(beh_flags),
        # AES-256 encrypted full verdict — decrypt only via /decrypt endpoint
        "verdict_enc":        _encrypt(verdict_payload),
        "duration_seconds":   body.duration_seconds,
    }
    try:
        db_insert(row)
        if alert:
            db_insert_alert(parent_id, child_id, body.device_id, f"{threat_cat}: {risk_level}")
            # Fire email asynchronously (non-blocking)
            asyncio.create_task(asyncio.to_thread(
                send_email_alert,
                f"{threat_cat} — {risk_level}",
                _threat_email_html(body.device_id, threat_cat, risk_level,
                                   ai_judgment, action, body.process_name)
            ))
    except Exception as exc:
        log.exception("DB insert failed: %s", exc)

    return resp

@app.post("/seed")
def seed_database():
    """Temporary endpoint to seed database on deployed environment."""
    import random
    import uuid
    import json
    import string
    
    email = "admin@curaguard.com"
    password = "password"
    
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    pool = _get_pg_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM public.parents WHERE email = %s", (email,))
                parent_row = cur.fetchone()
                if parent_row:
                    parent_id = parent_row[0]
                    cur.execute("DELETE FROM public.alerts WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.events WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.children WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.devices WHERE parent_id = %s", (parent_id,))
                    cur.execute("DELETE FROM public.parents WHERE id = %s", (parent_id,))
                
                cur.execute(
                    "INSERT INTO public.parents (email, password_hash) VALUES (%s, %s) RETURNING id",
                    (email, password_hash)
                )
                parent_id = cur.fetchone()[0]
                
                def gen_code():
                    return "-".join(["".join(random.choices(string.ascii_uppercase + string.digits, k=4)) for _ in range(3)])

                child3_access = gen_code()

                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, NOW()) RETURNING id",
                    (parent_id, "Abhay", gen_code(), True)
                )
                abhay_id = cur.fetchone()[0]
                
                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, NOW()) RETURNING id",
                    (parent_id, "Nitin", gen_code(), True)
                )
                nitin_id = cur.fetchone()[0]

                cur.execute(
                    "INSERT INTO public.children (parent_id, name, access_code, is_activated, activated_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (parent_id, "Third Child", child3_access, False, None)
                )
                
                apps = ["Discord", "Chrome", "YouTube", "Roblox", "WhatsApp", "Zoom"]
                threats = ["grooming_attempt", "toxic_behavior", "self_harm_intent", "nsfw_image", "cyberbullying"]
                
                for i in range(120):
                    is_alert = (i % 7 == 0)
                    risk_score = random.uniform(0.75, 0.98) if is_alert else random.uniform(0.01, 0.15)
                    risk_label = "hazardous" if is_alert else "safe"
                    threat_cat = random.choice(threats) if is_alert else "none"
                    duration_sec = random.randint(30, 600)
                    process = random.choice(apps)
                    
                    event_id = str(uuid.uuid4())
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags, verdict_enc, duration_seconds
                        ) VALUES (%s, %s, %s, %s, NOW() - INTERVAL '%s minute', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        event_id, parent_id, nitin_id, "PC-NITIN", str(i * 80 + random.randint(0,40)), f"Watching {process}", process,
                        0.5, risk_label, risk_score, risk_label, is_alert,
                        threat_cat, "Escalation" if is_alert else "Normal", "block" if is_alert else "monitor",
                        json.dumps(["suspicious_link"] if is_alert else []), 
                        "6865785f63697068657274657874", duration_sec
                    ))
                    if is_alert:
                        cur.execute("INSERT INTO public.alerts (parent_id, child_id, event_id, reason) VALUES (%s, %s, %s, %s)",
                                    (parent_id, nitin_id, event_id, f"Detected {threat_cat}"))
                                    
                for i in range(80):
                    duration_sec = random.randint(30, 900)
                    process = random.choice(apps)
                    
                    cur.execute("""
                        INSERT INTO public.events (
                            id, parent_id, child_id, device_id, captured_at, window_title, process_name,
                            sentiment_score, sentiment_label, risk_score, risk_label, alert,
                            threat_category, detected_phase, action_recommended, behavioral_flags, verdict_enc, duration_seconds
                        ) VALUES (%s, %s, %s, %s, NOW() - INTERVAL '%s minute', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        str(uuid.uuid4()), parent_id, abhay_id, "PC-ABHAY", str(i * 120 + random.randint(0,60)), f"Studying on {process}", process,
                        0.8, "safe", 0.05, "safe", False,
                        "none", "Normal", "monitor", "[]", 
                        "6865785f63697068657274657874", duration_sec
                    ))
        return {"status": "success", "message": "Database seeded with Abhay and Nitin", "child3_access": child3_access}
    finally:
        pool.putconn(conn)
