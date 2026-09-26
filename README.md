# KALA CART — Frontend Marketplace

A phone-friendly, zero-build static marketplace starter for **KALA CART — Where Art Finds a Home.**

## Included
- Luxury black / warm-gold UI
- Responsive mobile-first design
- Home, artworks, artists, sell-your-art, about and admin routes
- Artwork detail modal
- Wishlist + cart using localStorage
- Demo checkout form
- Artist listing form with localStorage persistence
- 25% KALA CART / 75% artist commission model shown in UI
- Phase 1 direct artist-to-buyer shipping messaging
- Search and category filtering

## Deploy
Upload the ZIP contents to GitHub Pages, Netlify, Cloudflare Pages, or Vercel as a static site. No npm install/build is required.

## Production next step
For a real marketplace, connect:
1. Supabase Auth + Postgres
2. Supabase Storage for artwork images
3. Server/serverless functions for orders and Razorpay payment verification
4. Admin role-based access
5. Email/order notifications
6. Real shipping/tracking and refunds

**Never put a Razorpay Secret Key in `app.js`, `index.html`, GitHub, or any browser-visible code.**


## KALA CART setup
1. Create the Supabase project.
2. Run `sql/schema.sql` once in Supabase SQL Editor.
3. Deploy this project to Vercel.
4. Add server-only environment variables in Vercel: `RAZORPAY_KEY_SECRET` (or `RAZORPAY_SECRET`), `SUPABASE_SERVICE_ROLE_KEY`, and optionally `KALA_ADMIN_EMAILS`.
5. The Supabase URL, publishable key and Razorpay Key ID are already configured as browser-safe values; they may also be supplied through environment variables.

**Never commit a Razorpay Secret Key or Supabase service-role key.**
