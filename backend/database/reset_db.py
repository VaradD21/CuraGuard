import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(r"c:\Users\Darshdeep\Desktop\Desktop\Trial And Error\ChildSafety_V1.0\V 2.0\backend\server\.env")

def reset_db():
    host = os.getenv("DB_HOST")
    dbname = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    port = os.getenv("DB_PORT")

    print(f"Connecting to {host}...")
    conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password, port=port)
    try:
        with conn:
            with conn.cursor() as cur:
                print("Dropping existing tables for clean reset...")
                cur.execute("DROP TABLE IF EXISTS public.alerts CASCADE;")
                cur.execute("DROP TABLE IF EXISTS public.events CASCADE;")
                cur.execute("DROP TABLE IF EXISTS public.devices CASCADE;")
                cur.execute("DROP TABLE IF EXISTS public.children CASCADE;")
                cur.execute("DROP TABLE IF EXISTS public.parents CASCADE;")
                
                print("Reading schema.sql...")
                schema_path = r"c:\Users\Darshdeep\Desktop\Desktop\Trial And Error\ChildSafety_V1.0\V 2.0\backend\database\schema.sql"
                with open(schema_path, "r") as f:
                    schema_sql = f.read()
                
                print("Applying new production schema...")
                cur.execute(schema_sql)
        print("✅ Database reset and production schema applied successfully!")
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_db()
