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
- [ ] Final Tailwind styling pass across every page (Login/Register/Footer/etc.)
