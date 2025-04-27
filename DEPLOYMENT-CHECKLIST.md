# 🎉 Deployment Checklist for Raymondo Projects

A personal checklist to guarantee safe, smooth, professional deployments!

---

# ✅ Build & Type Check

- [ ] Run `npm run build` locally
  - Ensure **"Compiled successfully"** message
  - Ensure **"Checking validity of types"** passes

---

# ✅ Server / Client Boundary Check

- [ ] No `server-only` imports inside client components
- [ ] No `firebase-admin` imports inside client code
- [ ] API routes do **not** use `useRouter` or other client-only hooks

---

# ✅ Environment Variables

- [ ] `.env.local` contains all required keys (especially `NEXT_PUBLIC_` and `FIREBASE_` variables)
- [ ] Vercel Project Settings ✔️ all environment variables properly set

---

# ✅ Middleware, API Routes, Dynamic Pages

- [ ] Middleware (if used) detected and running
- [ ] Dynamic routes (like `/products/[id]`, `/users/[id]`) loading correctly
- [ ] API endpoints (`/api/`) return correct data with no 500 errors

---

# ✅ Visual QA (Quick Testing)

- [ ] Login / Registration tested
- [ ] Add / Edit / Delete Product flows tested
- [ ] Add / Edit / Delete User flows tested
- [ ] Cart functionality (if ecommerce) tested:
  - Add to cart
  - Update quantity
  - Remove item
  - Clear cart
- [ ] Admin dashboard overview loads correctly
- [ ] Product pages load with all new fields (category, color, sticky side)
- [ ] Mobile responsiveness OK (basic)

---

# ✨ Bonus Checks (Optional but Awesome)

- [ ] No console errors in browser DevTools
- [ ] Lighthouse audit score >90% (Performance / Best Practices)
- [ ] Favicon and metadata properly configured
- [ ] 404 and error pages display nicely

---

# 🚀 Final Pre-Deploy Ritual

> 1. Run `npm run build`
> 2. Smoke test app locally
> 3. Push to GitHub main branch
> 4. Watch Vercel deploy and verify production!

---

# 🚀 You are ready to deploy like a PRO.

---

_This checklist was handcrafted by ChatGPT 💚 and customized for Raymondo's awesome projects._

Let's build some incredible apps! 🚀🌟
