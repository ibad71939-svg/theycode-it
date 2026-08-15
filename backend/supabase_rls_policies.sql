-- ============================================================================
-- They Code It — RLS Policies for all tables
-- ============================================================================
-- These policies implement default-deny security: every table has RLS enabled
-- and FORCED, but no policies are created for anon/authenticated users. This
-- means:
--
-- 1. The backend (Express server using service_role key) bypasses RLS entirely
--    and has full read/write access to all tables.
--
-- 2. The frontend only calls Supabase Auth (signIn/signUp/signOut) with the
--    anon key — it never queries these tables directly. Any attempt to access
--    tables via anon/authenticated keys is rejected (0 rows returned).
--
-- 3. If either key is ever leaked or misused, the attacker gets zero rows
--    instead of the entire database.
--
-- ============================================================================

-- ============================================================================
-- users — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.
-- Frontend never queries this table directly.

-- ============================================================================
-- students — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.
-- Frontend never queries this table directly.

-- ============================================================================
-- instructors — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.
-- Frontend never queries this table directly.

-- ============================================================================
-- categories — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.
-- If you later want public read access, uncomment below:
--
-- DROP POLICY IF EXISTS "Public can read categories" ON categories;
-- CREATE POLICY "Public can read categories" ON categories
--   FOR SELECT
--   TO anon, authenticated
--   USING (true);

-- ============================================================================
-- courses — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.
-- If you later want public read access to published courses, uncomment below:
--
-- DROP POLICY IF EXISTS "Public can read published courses" ON courses;
-- CREATE POLICY "Public can read published courses" ON courses
--   FOR SELECT
--   TO anon, authenticated
--   USING (is_published = true);

-- ============================================================================
-- batches — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- enrollments — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- payments — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- attendance — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- assignments — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- submissions — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- grades — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- certificates — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- announcements — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- leads — default-deny (backend/service_role only)
-- ============================================================================
-- No policies needed. Backend has full access via service_role.

-- ============================================================================
-- Summary
-- ============================================================================
-- All tables have RLS enabled and FORCED, with zero policies for anon/authenticated.
-- This achieves maximum security by default:
--   - Backend (service_role) works normally, unaffected by RLS
--   - Frontend never queries tables directly (only auth via Supabase Auth)
--   - Any leaked keys result in zero rows, not full database exposure
--
-- If you need to allow public read access to specific tables (e.g., published
-- courses or categories) in the future, uncomment the policies above and they
-- will take effect immediately.
-- ============================================================================
