# Tina Beauty Studio Website - Development History

## 2026-08-12 — Reconnect to Supabase + security hardening
**Status**: Complete (pending: Alessandro creates the new Supabase project and GitHub repo)

- **Root cause of the broken site**: the Supabase project referenced in `js/config.js`
  (`vttysxftkxosuueicpxk.supabase.co`) no longer exists (DNS doesn't resolve), and its
  anon key's JWT `ref` claim didn't even match that URL - stale/mismatched leftovers
  from a Genspark sandbox session. A fresh Supabase project is required; there was
  nothing to "revive."
- **Security redesign** (this site is 100% static with no backend, so the anon key is
  always visible in page source - RLS has to do all the real work):
  - Admin login moved from a custom `users` table with plaintext password comparison
    to **Supabase Auth** (`supabaseClient.auth.signInWithPassword`). No password is
    stored in the app's own database anymore. Admin accounts are created directly in
    the Supabase dashboard (Authentication → Users), not from the app.
  - Dropped the `user_sessions` table and the `password_hash`/`role`/`last_login`
    columns on `users` - all vestigial once Supabase Auth owns sessions.
  - Rewrote RLS from `USING (true)` on every table (full public read/write/delete,
    including the admin password) to per-table, per-operation policies:
    `services`/`staff` public-read-if-active + admin-write; `business_settings`
    public-read + admin-write; `customers`/`appointments` public-**insert-only**
    (no public read at all, since they hold PII) + admin full access; `users` has
    **zero** public policies.
  - Added a `public_appointment_slots` view (date/time/status/service/staff only,
    no customer link) so the homepage availability calendar doesn't need read access
    to the real `appointments` table.
  - Added two `SECURITY DEFINER` SQL functions (`upsert_customer_account`,
    `is_promotional_subscriber`) as the only path the public site has into `users` -
    narrower than granting the table itself any public policy.
  - `js/config.js`'s request headers now use the logged-in admin's Supabase Auth
    session JWT (when present) instead of always sending the static anon key, so the
    new `authenticated`-only RLS policies actually take effect for the dashboard.
- **Functional bugs fixed along the way** (unrelated to security, found while wiring
  this up - see file diffs for detail):
  - `dashboard.js` had 6 handlers (service/staff edit+pause, appointment edit+delete)
    still calling a dead `fetch('tables/...')` endpoint left over from Genspark's
    pre-Supabase local Table API - these silently failed even with working credentials.
  - `SupabaseAPI.query()`'s filter builder silently dropped boolean filters (e.g.
    `{active: true}`), so "active only" filtering never actually worked.
  - `Config.getHeaders()` only added the `Prefer: return=representation` header for
    POST, not PATCH - every `SupabaseAPI.update()` call got an empty 204 response and
    threw trying to parse it as JSON, making every dashboard edit look like it failed.
  - Appointment edit form sent the literal string `'unassigned'` into a `staff_id UUID`
    column - fixed to send `null`.
  - `saveSettings()` set `settings.id = 'main'` on every save, trying to overwrite the
    `business_settings` UUID primary key with a non-UUID string.
  - Two `formData` references in `booking.js`/`main.js` pointed at an undefined
    variable (ReferenceError, silently swallowed by a try/catch) - the "create/upsert
    user account" step had never actually run.
- **Not changed**: WhatsApp/Line "backend" notifications remain a client-side
  simulation (as they were before) - no real messaging API is wired up.
- **Next steps for Alessandro**: create a new Supabase project, run
  `supabase-schema.sql` then `supabase-sample-data.sql`, create an admin user under
  Authentication → Users, paste the project URL + anon key into `js/config.js`, then
  push to a new GitHub repo and enable Pages (no build step needed - pure static site).
