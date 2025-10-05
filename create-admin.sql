-- =================================================================
-- ADMIN USER SETUP INSTRUCTIONS
-- =================================================================
--
-- STEP 1: Create a user in Supabase Dashboard
-- --------------------------------------------
-- 1. Go to: https://supabase.com/dashboard
-- 2. Sign in and select your project
-- 3. Click "Authentication" in the left sidebar
-- 4. Click "Users"
-- 5. Click "Add user" button (top right)
-- 6. Select "Create new user"
-- 7. Enter:
--    Email: admin@proshop.com (or your email)
--    Password: Admin123! (or your own secure password)
-- 8. Click "Create user"
-- 9. **IMPORTANT**: Copy the User ID that appears
--    (looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
--
-- STEP 2: Run this SQL query
-- ---------------------------
-- 1. In Supabase Dashboard, click "SQL Editor"
-- 2. Click "New query"
-- 3. Replace YOUR_USER_ID_HERE below with the User ID you copied
-- 4. Replace the email with the email you used
-- 5. Click "Run"
--
-- =================================================================

INSERT INTO admin_users (id, email, full_name, role)
VALUES
(
  'YOUR_USER_ID_HERE',           -- Replace with the User ID from Step 1
  'admin@proshop.com',           -- Replace with your email
  'Admin User',                  -- Replace with your name
  'super_admin'
);

-- =================================================================
-- EXAMPLE (DO NOT USE THIS - Use your actual User ID):
-- =================================================================
-- INSERT INTO admin_users (id, email, full_name, role)
-- VALUES
-- (
--   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
--   'admin@proshop.com',
--   'John Doe',
--   'super_admin'
-- );
-- =================================================================

-- After running this query successfully, you can login at:
-- http://localhost:5173/admin-login.html
-- Use the email and password you created in Step 1
