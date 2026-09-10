# Blog App

A full-stack blogging platform built with **React (Vite) + Tailwind CSS** on the frontend and **Node.js / Express + MySQL** on the backend. Supports authentication, draft/publish workflow, likes, nested comments, bookmarks, search & filtering, user profiles, and an admin dashboard.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router, Tailwind CSS, Axios, React Quill (rich text editor) |
| Backend | Node.js, Express 5, MySQL (`mysql` driver) |
| Auth | JWT stored in an httpOnly cookie, bcrypt password hashing |
| File uploads | Multer (cover images, profile pictures) |

---

## Features

### Authentication
- Register / Login / Logout
- JWT-based sessions (httpOnly cookie, 7-day expiry)
- Role-based access (`user` / `admin`)

### Blog
- Create / Edit / Delete / View posts
- Draft and Publish workflow
- Auto-generated URL slugs (with automatic de-duplication)
- View counter

### Interaction
- Like (toggle)
- Comment
- Threaded replies (unlimited nesting)
- Bookmark / Save posts

### Discovery
- Full-text search (title + content)
- Category filtering
- Sort by newest, oldest, most viewed, most liked
- Pagination
- Related posts (same category)

### Profile
- Public user profile page
- Editable bio and profile picture
- "My Posts" (drafts + published) and "Saved" tabs

### Admin
- Dashboard with site-wide stats
- Manage users (change role, delete)
- Manage posts (delete any post)
- Manage comments (delete any comment)
- Manage categories (create, rename, delete)

---

## Folder structure

```
Blog-App/
├── api/                      # Express backend
│   ├── controllers/          # Route handler logic (one file per resource)
│   ├── routes/                # Express routers
│   ├── middleware/            # JWT auth middleware
│   ├── utils/                 # Small helpers (e.g. slugify)
│   ├── sql/
│   │   ├── schema.sql         # Fresh install schema
│   │   └── schema_reset.sql   # Drops + recreates tables (dev use)
│   ├── db.js                  # MySQL connection (reads .env)
│   ├── index.js               # App entry point
│   └── .env.example           # Copy to .env and fill in your values
│
└── client/                   # React (Vite) frontend
    ├── src/
    │   ├── components/         # Navbar, Menu, Comments, PostActions, etc.
    │   ├── pages/               # Home, Single, Write, Profile, AdminDashboard, etc.
    │   ├── context/             # AuthContext (login/logout/current user)
    │   └── index.css            # Tailwind entry point
    ├── tailwind.config.js
    └── vite.config.js           # Proxies /api requests to the backend in dev
```

---

## Getting started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MySQL server running locally

### 2. Configure environment variables
```bash
cd api
cp .env.example .env
```
Edit `.env` and set:
- `DB_PASSWORD` — your MySQL password
- `JWT_SECRET` — any long random string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from a free [Cloudinary](https://cloudinary.com) account (Dashboard → these three values are shown right at the top). Cover images and profile pictures are uploaded straight to Cloudinary — nothing is saved to the server's disk, which is required for deploying to hosts with no persistent filesystem (e.g. Render, Vercel).

### 3. Create the database
```bash
mysql -u root -p < sql/schema.sql
```
> If you already have an older `posts`/`users` table from before, use `sql/schema_reset.sql` instead — it drops and recreates everything (development use only, this deletes existing data).

### 4. Install dependencies
```bash
cd api && npm install
cd ../client && npm install
```

### 5. Run the app (two terminals)
```bash
# Terminal 1 — backend (http://localhost:8800)
cd api
npm start

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

### 6. Make yourself an admin (optional)
Register a normal account first, then run:
```sql
UPDATE users SET role='admin' WHERE username='your_username';
```
Log out and log back in afterwards — the role is embedded in the login token.

---

## API reference

All routes are prefixed with `/api`. Routes marked 🔒 require a logged-in user; 🔒👑 require the `admin` role.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Log in, sets the auth cookie |
| POST | `/auth/logout` | Clears the auth cookie |
| GET | `/auth/me` 🔒 | Get the current logged-in user |

### Posts
| Method | Route | Description |
|---|---|---|
| GET | `/posts` | Published posts feed — supports `?cat=`, `?search=`, `?sort=newest\|oldest\|popular\|mostliked`, `?page=`, `?limit=`, `?author=` |
| GET | `/posts/mine` 🔒 | The logged-in user's own posts (any status) |
| GET | `/posts/:id` | Single post by id or slug |
| POST | `/posts` 🔒 | Create a post (defaults to draft) |
| PUT | `/posts/:id` 🔒 | Update a post (owner or admin) |
| DELETE | `/posts/:id` 🔒 | Delete a post (owner or admin) |
| PATCH | `/posts/:id/status` 🔒 | Toggle draft ⇄ published |

### Comments
| Method | Route | Description |
|---|---|---|
| GET | `/comments/:postId` | List comments (flat list; frontend builds the reply tree) |
| POST | `/comments` 🔒 | Add a comment or reply (`parentId` optional) |
| DELETE | `/comments/:id` 🔒 | Delete a comment (owner or admin) |

### Likes / Bookmarks
| Method | Route | Description |
|---|---|---|
| GET | `/likes/:postId` | Like count + whether the current user liked it |
| POST | `/likes/:postId` 🔒 | Toggle like |
| GET | `/bookmarks/:postId` 🔒 | Whether the current user bookmarked it |
| POST | `/bookmarks/:postId` 🔒 | Toggle bookmark |
| GET | `/bookmarks/mine/all` 🔒 | The logged-in user's saved posts |

### Categories
| Method | Route | Description |
|---|---|---|
| GET | `/categories` | List all categories |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/users/:username` | Public profile |
| PUT | `/users/me` 🔒 | Update bio / profile image / username / email / password |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/admin/stats` 🔒👑 | Site-wide counts |
| GET | `/admin/users` 🔒👑 | All users |
| PATCH | `/admin/users/:id/role` 🔒👑 | Change a user's role |
| DELETE | `/admin/users/:id` 🔒👑 | Delete a user |
| GET | `/admin/posts` 🔒👑 | All posts, any status/author |
| DELETE | `/admin/posts/:id` 🔒👑 | Delete any post |
| GET | `/admin/comments` 🔒👑 | Recent comments (all posts) |
| DELETE | `/admin/comments/:id` 🔒👑 | Delete any comment |
| POST | `/admin/categories` 🔒👑 | Create a category |
| PUT | `/admin/categories/:id` 🔒👑 | Rename a category |
| DELETE | `/admin/categories/:id` 🔒👑 | Delete a category |

---

## Roadmap
- [x] Final Tailwind styling pass across every page (Login/Register/Footer/etc.)
- [x] Cloudinary for image uploads (no local disk dependency)
- [x] CORS + cross-domain cookies + mysql2/TLS for production hosting

---

## Deployment (Vercel + Render + TiDB Cloud)

The frontend (static React build) goes on **Vercel**. The backend (a normal
long-running Express server) goes on **Render**, since Vercel's serverless
functions aren't a good fit for a persistent `mysql` connection. The
database goes on **TiDB Cloud Starter**, a free MySQL-compatible host
(PlanetScale no longer has a free tier).

### 1. Push to GitHub
Commit everything and push, if you haven't already. Both Vercel and Render
deploy directly from a GitHub repo.

### 2. Create the database (TiDB Cloud)
1. Sign up free at [tidbcloud.com](https://tidbcloud.com), create a **Starter** cluster.
2. Open the cluster's **Connect** panel, copy the host, port (usually `4000`), username and password.
3. Run `sql/schema.sql` against it (the "Chat2Query"/SQL editor in the TiDB Cloud console works, or connect with the `mysql` CLI using the credentials from step 2).

### 3. Deploy the backend (Render)
1. On [render.com](https://render.com), **New → Web Service**, connect your GitHub repo.
2. **Root Directory**: `api`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add all the variables from `api/.env.example` under **Environment**, using your real values:
   - `DB_HOST`, `DB_PORT` (4000), `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true` (from TiDB)
   - `JWT_SECRET` — any long random string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `NODE_ENV=production`
   - `CLIENT_URL` — your Vercel URL (fill this in after step 4, then redeploy)
6. Deploy. Once live, copy the Render URL (e.g. `https://blog-app-api.onrender.com`).

> Render's free tier spins down after 15 minutes of inactivity — the first request after that takes ~30-60s to wake back up. That's normal.

### 4. Deploy the frontend (Vercel)
1. On [vercel.com](https://vercel.com), **New Project**, import the same repo.
2. **Root Directory**: `client`
3. Framework preset: Vite (auto-detected).
4. Add an environment variable: `VITE_API_URL` = your Render URL from step 3 (no trailing slash).
5. Deploy. Copy the resulting Vercel URL.

### 5. Connect them
Go back to the Render service's environment variables and set `CLIENT_URL` to your Vercel URL, then redeploy the backend (Render redeploys automatically when env vars change, or trigger it manually). This is what CORS uses to allow the frontend's requests.

### 6. Make yourself an admin
Same as local setup — register an account on the live site, then run this against your TiDB database:
```sql
UPDATE users SET role='admin' WHERE username='your_username';
```
Log out and back in on the live site afterwards.
