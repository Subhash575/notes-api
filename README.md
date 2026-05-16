# 📝 Notes API

A multi-user notes backend service built with Node.js, TypeScript, Prisma 7, and PostgreSQL. Think backend for Google Keep or Apple Notes.

**Live URL:** https://notes-api-01.onrender.com/about

---

## Tech Stack

| Layer      | Technology        |
| ---------- | ----------------- |
| Runtime    | Node.js           |
| Language   | TypeScript (ESM)  |
| Framework  | Express           |
| ORM        | Prisma 7          |
| Database   | PostgreSQL (Neon) |
| Auth       | JWT + bcrypt      |
| Deployment | Render.com        |

---

## Features

- User registration and login with JWT authentication
- Create, read, update, and delete notes
- Share notes with other users
- **Custom feature — Note Links:** attach reference URLs to any note with an optional label
- Full-text search across notes (`GET /search?q=keyword`)
- Paginated notes list (`GET /notes?page=1&limit=10`)
- OpenAPI 3.0 documentation

---

## Project Structure

```
notes-api/
├── prisma/
│   └── schema.prisma       ← database schema
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── notesController.ts
│   │   ├── linksController.ts
│   │   ├── searchController.ts
│   │   └── metaController.ts
│   ├── middleware/
│   │   └── auth.ts         ← JWT verification
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── notes.ts
│   │   ├── search.ts
│   │   └── meta.ts
│   ├── lib/
│   │   └── prisma.ts ← Prisma singleton
│   ├── types/
│   │   └── index.ts        ← global Express type augmentation
│   └── app.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

```
User         — stores members (email + hashed password)
Note         — stores notes (each note belongs to one owner)
NoteShare    — join table (which notes are shared with which users)
NoteLink     — stores reference URLs attached to a note
```

---

## API Endpoints

### Auth

| Method | Endpoint    | Description             | Auth |
| ------ | ----------- | ----------------------- | ---- |
| POST   | `/register` | Register a new user     | No   |
| POST   | `/login`    | Login and get JWT token | No   |

### Notes

| Method | Endpoint           | Description               | Auth |
| ------ | ------------------ | ------------------------- | ---- |
| GET    | `/notes`           | Get all notes (paginated) | Yes  |
| GET    | `/notes/:id`       | Get a specific note       | Yes  |
| POST   | `/notes`           | Create a new note         | Yes  |
| PUT    | `/notes/:id`       | Update a note             | Yes  |
| DELETE | `/notes/:id`       | Delete a note             | Yes  |
| POST   | `/notes/:id/share` | Share a note with a user  | Yes  |

### Note Links (Custom Feature)

| Method | Endpoint                   | Description              | Auth |
| ------ | -------------------------- | ------------------------ | ---- |
| POST   | `/notes/:id/links`         | Add a link to a note     | Yes  |
| GET    | `/notes/:id/links`         | Get all links for a note | Yes  |
| DELETE | `/notes/:id/links/:linkId` | Delete a link            | Yes  |

### Search & Docs

| Method | Endpoint            | Description             | Auth |
| ------ | ------------------- | ----------------------- | ---- |
| GET    | `/search?q=keyword` | Search notes by keyword | Yes  |
| GET    | `/about`            | Developer info          | No   |
| GET    | `/openapi.json`     | OpenAPI 3.0 spec        | No   |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/notes-api.git
cd notes-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL and JWT_SECRET
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_long_random_secret_here"
PORT=3000
```

### Run Migrations

```bash
npx prisma migrate dev
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## Usage Examples

### Register

```bash
curl -X POST https://notes-api-01.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```

### Login

```bash
curl -X POST https://notes-api-01.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```

### Create a Note

```bash
curl -X POST https://notes-api-01.onrender.com/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Hello world"}'
```

### Search Notes

```bash
curl "https://notes-api-01.onrender.com/search?q=hello" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add a Link to a Note

```bash
curl -X POST https://notes-api-01.onrender.com/notes/1/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://prisma.io","label":"Prisma Docs"}'
```

---

## Access Control Rules

| Action       | Owner | Shared User |
| ------------ | ----- | ----------- |
| View note    | ✅    | ✅          |
| Update note  | ✅    | ❌          |
| Delete note  | ✅    | ❌          |
| Share note   | ✅    | ❌          |
| View links   | ✅    | ✅          |
| Add links    | ✅    | ❌          |
| Delete links | ✅    | ❌          |

---

## Scripts

```bash
npm run dev          # start development server with hot reload
npm run build        # compile TypeScript to JavaScript
npm start            # run compiled production server
npm run migrate      # apply database migrations (production)
```

---

## Author

**Subhash Rana**
subhash09468@email.com
