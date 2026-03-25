-- Run this script in your PostgreSQL database (via pgAdmin or Coolify Database UI)

-- 1. Add the column (defaults to current time for existing books)
ALTER TABLE "Books" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create function to auto-update the timestamp whenever a row is modified
CREATE OR REPLACE FUNCTION update_books_modtime()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to the Books table
DROP TRIGGER IF EXISTS trg_books_update ON "Books";
CREATE TRIGGER trg_books_update
BEFORE UPDATE ON "Books"
FOR EACH ROW EXECUTE PROCEDURE update_books_modtime();
