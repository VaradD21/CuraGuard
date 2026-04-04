import psycopg2
import os
from dotenv import load_dotenv

# Load .env from the server directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "server", ".env"))

def test_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT")
        )
        print("✅ SUCCESS: Connected to Supabase PostgreSQL!")
        cur = conn.cursor()
        cur.execute("SELECT version();")
        print(f"DB Version: {cur.fetchone()}")
        
        # Check if tables exist
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cur.fetchall()
        print(f"Tables in 'public' schema: {[t[0] for t in tables]}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ ERROR: Failed to connect: {e}")

if __name__ == "__main__":
    test_connection()
