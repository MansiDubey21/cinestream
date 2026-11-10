# 🎬 CineStream

A full-stack, Netflix-style movie and TV streaming platform. Browse trending shows, find trailers, search, and keep a personal **My List**. It's built with **Spring Boot microservice-style REST APIs**, **React + TypeScript**, **PostgreSQL** and **Redis caching**, all containerised with **Docker** and checked by **GitHub Actions CI**.

> Portfolio project. Show data comes from the free [TVmaze API](https://www.tvmaze.com/api) (no API key needed). No real video content is streamed; trailers open on YouTube.

---

## ✨ Features

| Area | What it does |
|---|---|
| 🔐 **Auth** | Register / login with **JWT** (stateless), BCrypt-hashed passwords, protected routes, session restore on refresh |
| 🏠 **Browse** | Hero banner + horizontally scrolling rows (Trending, Top Rated, genres…) |
| 🎞️ **Details modal** | Rating, seasons, cast, genres, trailer link, *More Like This* |
| 🔎 **Search** | Debounced multi-search across movies & TV |
| ➕ **My List** | Add/remove titles, persisted per user in **PostgreSQL**, with **optimistic UI updates** |
| ⚡ **Performance** | **Redis cache** for all TVmaze responses and computed rows (TTL per cache), route-level **code splitting**, rows **lazy-load** on scroll (IntersectionObserver), lazy images |
| 🛡️ **Security** | Whitelisted categories, input validation, global error handler, CORS config, BCrypt + JWT |

## 🏗️ Architecture

```
┌────────────────────┐   /api/*   ┌───────────────────────┐      ┌──────────────┐
│  React + TS (Vite) │ ─────────▶ │  Spring Boot REST API │ ───▶ │  TVmaze API  │
│  Redux Toolkit     │    JWT     │  Spring Security/JWT  │      └──────────────┘
│  Tailwind CSS      │ ◀───────── │  Spring Data JPA      │
└────────────────────┘            │  Spring Cache         │
        nginx                     └────────┬───────┬──────┘
                                           │       │
                                  ┌────────▼──┐ ┌──▼──────┐
                                  │PostgreSQL │ │  Redis  │
                                  │users,     │ │ TVmaze  │
                                  │watchlist  │ │ cache   │
                                  └───────────┘ └─────────┘
```

## 🧰 Tech Stack

**Backend:** Java 17, Spring Boot 3, Spring Security, JWT (jjwt), Spring Data JPA, Spring Cache, PostgreSQL, Redis, JUnit 5
**Frontend:** React 18, TypeScript, Redux Toolkit, React Router, Axios, Tailwind CSS, Vite
**DevOps:** Docker, Docker Compose, nginx, Git

## 🚀 Run it

### Option A: Docker (one command)

```bash
cp .env.example .env        # set a JWT_SECRET (any long random text)
docker compose up --build
```

Open **http://localhost:3000**, create an account and start browsing.

### Option B: Without Docker (uses your installed PostgreSQL, no Redis needed)

Needs Java 17+, Node.js 20+ and PostgreSQL.

1. Create the database once:
   `psql -U postgres -c "CREATE DATABASE cinestream;"`
2. Copy `backend/src/main/resources/application-local.example.yml` to `application-local.yml` and fill in your PostgreSQL password.
3. Start the backend: open `CineStreamApplication.java` in VS Code and click **Run**.
4. Start the frontend: `cd frontend && npm install && npm run dev`, then open http://localhost:5173.

The `local` profile swaps Redis for an in-memory cache, so everything works without Redis.

### Option C: Local dev with Docker for Postgres + Redis

```bash
# 1. Start Postgres + Redis
docker compose up -d postgres redis

# 2. Backend  (http://localhost:8080)
cd backend
export SPRING_PROFILES_ACTIVE=docker   # use the Docker Postgres (5433) + Redis (6380)
mvn spring-boot:run

# 3. Frontend (http://localhost:5173), Vite proxies /api to :8080
cd frontend
npm install
npm run dev
```

Run the backend tests with `cd backend && mvn test`.

## 📡 REST API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create account → returns JWT |
| POST | `/api/auth/login` | ❌ | Login → returns JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/movies/category/{category}?page=` | ✅ | `trending`, `originals`, `top_rated`, `popular`, `now_playing`, `upcoming`, `popular_tv` |
| GET | `/api/movies/genres` | ✅ | Genre list |
| GET | `/api/movies/genre/{name}?page=` | ✅ | Shows by genre |
| GET | `/api/movies/tv/{id}` | ✅ | Details + cast + seasons + similar |
| GET | `/api/movies/search?q=` | ✅ | Search shows |
| GET | `/api/my-list` | ✅ | User's list |
| POST | `/api/my-list` | ✅ | Add a title |
| DELETE | `/api/my-list/{movie\|tv}/{id}` | ✅ | Remove a title |

## 📁 Project Structure

```
cinestream/
├── backend/                     Spring Boot API
│   └── src/main/java/com/cinestream/
│       ├── config/              Security, CORS, Redis cache config
│       ├── controller/          REST controllers
│       ├── dto/                 Request/response records
│       ├── entity/              JPA entities (User, WatchlistItem)
│       ├── exception/           Global error handling
│       ├── repository/          Spring Data repositories
│       ├── security/            JWT service + filter
│       └── service/             Auth, Watchlist, Catalog + TVmaze client (cached)
├── frontend/                    React + TypeScript app
│   └── src/
│       ├── api/                 Axios client + JWT interceptor
│       ├── components/          Navbar, Hero, Row, TitleCard, DetailModal
│       ├── pages/               Home, Genres, TV, Search, My List, Auth
│       ├── store/               Redux Toolkit slices
│       └── hooks.ts             useFetch, useDebounce, useInView, useMyList
└── docker-compose.yml
```

## 🗺️ Roadmap ideas
- Multiple user profiles per account
- "Continue Watching" with progress tracking
- Rate-limiting on the API gateway layer
- End-to-end tests with Playwright

---

Show data and images © [TVmaze](https://www.tvmaze.com/), licensed CC BY-SA.
