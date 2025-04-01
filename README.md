# 🔧 Firebase + Next.js Boilerplate Readiness Checklist

A practical checklist to help you turn your app into a polished, reusable boilerplate.

---

## 🔐 1. Authentication & User System

- [x] Firebase Auth is fully integrated
- [x] Firestore user document created on signup
- [x] Role-based access (e.g., admin/user) with custom claims
- [x] Email verification flow
- [x] Password reset flow
- [x] Server-side session validation (`auth()` utility or similar)
- [ ] Prebuilt authentication forms:
  - [ ] Sign In
  - [ ] Register
  - [ ] Reset Password
  - [ ] Change Password
- [ ] Optional: Anonymous user support

---

## 🧠 2. Typing & Validation

- [x] Centralized types (e.g., `User`, `LoginState`, `UserRole`)
- [x] Zod schemas for form validation
- [x] Type-safe Firebase interaction types (`UserDocumentData`, etc.)
- [x] No use of `any` in core logic
- [ ] All utility functions fully typed
- [ ] Shared types usable across client and server

---

## 🗂️ 3. Project Layout & Structure

- [x] Organized folders: `/actions`, `/firebase`, `/types`, `/schemas`, `/components`, etc.
- [x] `firebase/admin.ts` and `firebase/client.ts` separation
- [x] Centralized and reusable utilities
- [x] Proper use of `use server` and `use client`
- [ ] No unused/dead/test code
- [ ] `.env.example` file available

---

## 🧰 4. Tooling & Developer Experience

- [x] ESLint + Prettier configured
- [x] TypeScript in strict mode
- [ ] Husky or Git hooks (optional)
- [ ] VS Code workspace settings (optional)
- [ ] Clear `README.md` with setup instructions

---

## 🔥 5. Optional Extras (Boilerplate Enhancers)

- [x] Activity logging system
- [ ] API logging/debug utilities
- [ ] Protected route wrapper or layout (e.g., `withAuth`)
- [ ] Admin dashboard scaffold
- [ ] Dark mode toggle or theme switcher
- [ ] Tailwind preconfigured with design tokens (spacing, colors, etc.)

---

## 🧪 6. Testing the Boilerplate

- [ ] Clone into a new project folder and run it
- [ ] Verify that app name, routes, and text are generic
- [ ] Check for hardcoded project-specific logic
- [ ] Test adding a new route/page/component
- [ ] Confirm easy customization of layout, auth, and config

---

Once all of the above is ✅, you've got yourself a scalable, production-ready boilerplate! 🚀

Product Admin Dashboard – TODO Checklist
🔧 Setup & Integration
Connect ProductCarousel to Firestore using getAllProducts

Create Firebase addProduct function

Build ProductForm.tsx with image upload support (/api/upload)

Create actions/products/add-product.ts to call Firebase logic

Fix carousel + build errors (Embla, headers, type issues)

Successfully deployed to Vercel

📦 Product CRUD
➕ Add Product
Create /admin/products/new page

Render <ProductForm /> on this page

Add admin-only access using auth() and role check

🧾 Manage Products
Build AdminProductTable with columns:

Name

Price

In Stock

Created At

View / Edit / Delete actions

Load data via getAllProducts()

Add this table to /admin/products

🖊 Edit Product
Create /admin/products/[id]/page.tsx

Load product by ID using getProductById(id)

Reuse <ProductForm /> with pre-filled values

Create updateProduct() action in /actions/products/update-product.ts

🗑 Delete Product
Create deleteProduct() Firebase function

Add delete button with confirm modal in AdminProductTable

🧼 Dev & UI Cleanup
Move /products and /carousel into (dev) folder if not already

Add if (process.env.NODE_ENV === "production") notFound() to block dev pages

Clean up EmblaOptionsType references

🔐 Route Protection
Add auth() and redirect() to all admin/user pages

Mark routes using headers() with export const dynamic = "force-dynamic"

🧪 Bonus Improvements
Add form validation (required fields, number check)

Add toast or alert feedback on form success/error

Add badge color selector (e.g. New, Sale, Limited)

Add optional category or tag system (filtering later)

Add loading indicator while submitting or fetching data
