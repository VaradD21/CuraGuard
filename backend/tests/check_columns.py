import psycopg2
import os
from dotenv import load_dotenv

# Load .env from the server directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "server", ".env"))

def check_columns():
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
            port=port
        )
        cur = conn.cursor()
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'events' AND table_schema = 'public';")
        columns = [row[0] for row in cur.fetchall()]
        print(f"Columns in 'public.events': {columns}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    check_columns()
