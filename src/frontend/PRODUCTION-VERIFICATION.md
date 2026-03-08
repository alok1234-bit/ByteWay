# ByteWay Production Verification Checklist

Use this checklist to verify your ByteWay deployment is working correctly in production.

## Environment Setup

- [ ] Record your production frontend URL: `https://<FRONTEND_CANISTER_ID>.icp0.io/`
- [ ] Record your production backend canister ID: `<BACKEND_CANISTER_ID>`
- [ ] Confirm you have an Internet Identity for admin access

## 1. Home Page Verification

**URL**: `https://<FRONTEND_CANISTER_ID>.icp0.io/`

- [ ] Page loads without errors
- [ ] Hero section displays with background image
- [ ] Welcome message and branding are visible
- [ ] Subscription form is present
- [ ] Enter a test email address
- [ ] Click "Subscribe" button
- [ ] Success message appears
- [ ] Site details (contact info, social links) display correctly
- [ ] Footer displays with Caffeine.ai attribution

**Expected Result**: Home page fully functional, subscription form submits successfully.

## 2. Blog List Page Verification

**URL**: `https://<FRONTEND_CANISTER_ID>.icp0.io/blog`

- [ ] Page loads without errors
- [ ] Blog list displays (or shows empty state if no posts)
- [ ] Navigation from Home to Blog works
- [ ] Each blog post card shows title, author, date
- [ ] Click on a blog post card

**Expected Result**: Blog list page loads and displays approved posts.

## 3. Blog Post Detail Page Verification

**URL**: `https://<FRONTEND_CANISTER_ID>.icp0.io/blog/{post-id}`

- [ ] Individual blog post page loads
- [ ] Post title, author, and date display
- [ ] Post content renders correctly
- [ ] Cover image displays (if present)
- [ ] Tags display (if present)
- [ ] "Back to Blog" navigation works
- [ ] **Deep link test**: Open this URL in a new tab/window
- [ ] Deep link loads the correct post (not 404)

**Expected Result**: Blog post detail page works via navigation and direct deep link.

## 4. Admin Dashboard - Login Flow

**URL**: `https://<FRONTEND_CANISTER_ID>.icp0.io/admin`

### First-time Admin Setup

- [ ] Navigate directly to `/admin` URL
- [ ] Page loads (not 404)
- [ ] Login prompt appears
- [ ] Click "Login" button
- [ ] Internet Identity authentication flow starts
- [ ] Complete authentication
- [ ] Profile setup modal appears (first login)
- [ ] Enter your name
- [ ] Submit profile
- [ ] Admin dashboard loads successfully

**Expected Result**: First user to log in becomes admin automatically.

### Admin Access Verification

- [ ] Admin dashboard displays with tabs
- [ ] "Blog Posts" tab is accessible
- [ ] "Subscribers" tab is accessible
- [ ] "Site Configuration" tab is accessible
- [ ] "User Roles" tab is accessible

**Expected Result**: All admin features are accessible.

## 5. Admin Workflow - Create and Approve Post

### Create Post

- [ ] Navigate to "Blog Posts" tab
- [ ] Click "Create Post" button
- [ ] Dialog opens with form
- [ ] Fill in title: "Test Production Post"
- [ ] Fill in author name
- [ ] Fill in content (use rich text editor)
- [ ] Add tags (optional)
- [ ] Submit form
- [ ] Success message appears
- [ ] New post appears in list with "Pending" status

### Approve Post

- [ ] Find the newly created post in the list
- [ ] Click "Approve" button
- [ ] Status changes to "Approved"
- [ ] Success message appears

**Expected Result**: Post creation and approval workflow works end-to-end.

## 6. Public Visibility of Approved Post

- [ ] Log out from admin (or open incognito window)
- [ ] Navigate to `/blog` page
- [ ] Newly approved post appears in the list
- [ ] Click on the post
- [ ] Post detail page displays correctly
- [ ] Content matches what was created in admin

**Expected Result**: Approved posts are immediately visible to public users.

## 7. Admin Access Control

### Non-Admin User Test

- [ ] Log out from admin account
- [ ] Log in with a different Internet Identity
- [ ] Navigate to `/admin`
- [ ] "Access Denied" message displays
- [ ] Cannot access admin features

**Expected Result**: Only the admin user can access the admin dashboard.

### Anonymous User Test

- [ ] Log out completely
- [ ] Navigate to `/admin`
- [ ] Login prompt appears
- [ ] Cannot access admin features without authentication

**Expected Result**: Anonymous users are prompted to log in.

## 8. Deep Link Verification

Test direct navigation (fresh page load) to each route:

- [ ] Open new tab: `https://<FRONTEND_CANISTER_ID>.icp0.io/`
  - [ ] Home page loads correctly
- [ ] Open new tab: `https://<FRONTEND_CANISTER_ID>.icp0.io/blog`
  - [ ] Blog list page loads correctly
- [ ] Open new tab: `https://<FRONTEND_CANISTER_ID>.icp0.io/blog/{post-id}`
  - [ ] Specific blog post loads correctly
- [ ] Open new tab: `https://<FRONTEND_CANISTER_ID>.icp0.io/admin`
  - [ ] Admin page loads (with appropriate auth behavior)

**Expected Result**: All deep links work without 404 errors.

## 9. Responsive Design

- [ ] Test on desktop browser (1920x1080)
- [ ] Test on tablet size (768px width)
- [ ] Test on mobile size (375px width)
- [ ] Navigation menu adapts to screen size
- [ ] Content is readable on all sizes
- [ ] Forms are usable on mobile

**Expected Result**: Site is fully responsive across devices.

## 10. Theme Switching

- [ ] Toggle between light and dark mode
- [ ] Theme persists across page navigation
- [ ] All pages respect theme setting
- [ ] Colors and contrast are appropriate in both modes

**Expected Result**: Theme switching works correctly.

## Final Checklist

- [ ] All public pages load without errors
- [ ] Subscription form works
- [ ] Blog posts display correctly
- [ ] Admin can create and approve posts
- [ ] Approved posts appear publicly
- [ ] Admin access control works
- [ ] Deep links work for all routes
- [ ] Site is responsive
- [ ] No console errors in browser

## Troubleshooting

If any checks fail, refer to `DEPLOYMENT.md` for troubleshooting steps.

## Sign-off

- **Verified by**: _______________
- **Date**: _______________
- **Production URL**: _______________
- **Notes**: _______________
