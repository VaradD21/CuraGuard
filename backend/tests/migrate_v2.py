import psycopg2
import os
from dotenv import load_dotenv

# Load .env from the server directory
env_path = os.path.join(os.path.dirname(__file__), "..", "server", ".env")
load_dotenv(env_path)

def migrate_db():
    host = os.getenv("DB_HOST")
    dbname = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    port = os.getenv("DB_PORT")

    print(f"Connecting to {host}...")
    
    try:
        conn = psycopg2.connect(
            host=host, dbname=dbname, user=user, password=password, port=port
        )
        cur = conn.cursor()
        
        print("🔄 Running Migration for Multi-Child Support...")
        
        # 1. Create children table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.children (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                parent_id uuid NOT NULL REFERENCES public.parents (id) ON DELETE CASCADE,
                name text NOT NULL,
                access_code text UNIQUE NOT NULL,
                is_activated boolean DEFAULT false,
                activated_at timestamptz,
                created_at timestamptz DEFAULT now()
            );
        """)
        
        # 2. Add child_id column to events if it doesn't exist
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='child_id') THEN
                    ALTER TABLE public.events ADD COLUMN child_id uuid REFERENCES public.children (id) ON DELETE CASCADE;
                END IF;
            END $$;
        """)

        # 3. Add child_id column to alerts if it doesn't exist
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='child_id') THEN
                    ALTER TABLE public.alerts ADD COLUMN child_id uuid REFERENCES public.children (id) ON DELETE CASCADE;
                END IF;
            END $$;
        """)

        # 4. Enable RLS on children
        cur.execute("ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;")
        
        conn.commit()
        print("✅ Migration Successful!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Migration Error: {e}")

if __name__ == "__main__":
    migrate_db()
