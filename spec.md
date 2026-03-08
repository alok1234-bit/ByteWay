# ByteWay Blog App

## Current State
- ByteWay blog app with Home, Blog list, Blog post detail pages.
- Admin dashboard at `/admin` route, guarded by Internet Identity (blockchain login).
- Hidden admin route — no button in nav, accessed only by typing `/admin` in URL.
- BlogPostsPanel handles blog post creation, approval, rejection.
- No photo/pics management section in admin.
- No username/password login — only Internet Identity.

## Requested Changes (Diff)

### Add
- **Secret admin button in nav**: A hidden trigger in the header (e.g. clicking the ByteWay logo 5 times, or a tiny invisible tap zone) that reveals an "Admin" nav link only after the secret interaction. The button must be invisible/hidden in normal UI.
- **Password-based admin login page**: When navigating to `/admin`, show a custom login form with Username field (expects "ALOK") and Password field (expects "134221"). On success, store session in localStorage and grant access to admin dashboard. No Internet Identity required.
- **Pics/Photos management tab in Admin Dashboard**: New "Photos" tab alongside Blog Posts tab, allowing admin to upload, view, and delete photo posts. Photos tab shows a grid of uploaded images with title and description. Admin can add new photos (title, description, image URL).
- **AdminLoginForm component**: Standalone login form component for admin authentication.
- **useAdminAuth hook**: Simple localStorage-based auth hook checking ALOK/134221 credentials.

### Modify
- **AdminGuard**: Replace Internet Identity guard with password-based auth using useAdminAuth hook.
- **AdminDashboardPage**: Add Photos tab alongside Blog Posts, Subscribers, Site Config, Auth tabs.
- **ByteWayHeader**: Add secret click-counter on logo (5 clicks in quick succession reveals Admin link in nav temporarily or persistently in session).

### Remove
- Internet Identity dependency for admin access (replace with username/password).

## Implementation Plan
1. Create `useAdminAuth` hook — manages localStorage session, validates ALOK/134221.
2. Create `AdminLoginForm` component — username + password form, calls useAdminAuth.
3. Modify `AdminGuard` to use useAdminAuth instead of Internet Identity.
4. Create `PhotosPanel` component — grid view of photo posts, add/delete photos (stored in local state or backend if available).
5. Modify `AdminDashboardPage` to add Photos tab.
6. Modify `ByteWayHeader` to add secret logo click counter (5 rapid clicks shows Admin link).
7. Validate and build.
