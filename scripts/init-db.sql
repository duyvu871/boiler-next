-- Initialize Next.js 16 template database
-- This script runs automatically when the PostgreSQL container starts

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database user for application (if needed)
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'user') THEN
--         CREATE USER user WITH PASSWORD 'secure_password_here';
--     END IF;
-- END
-- $$;

-- Grant permissions
-- GRANT ALL PRIVILEGES ON DATABASE db TO user;
-- GRANT ALL PRIVILEGES ON DATABASE db_dev TO user;

-- Set timezone
SET timezone = 'Asia/Bangkok';

-- Log initialization
SELECT 'Next.js 16 template database initialized successfully!' AS status;



