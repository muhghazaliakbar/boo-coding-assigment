# Boo Coding Assignment

A Node.js/Express server for personality profiles (Soulverse-style) with commenting and voting. Profiles are stored in MongoDB; the app uses [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) for an in-memory database (no external MongoDB required).

## Features

- **Profiles** – View profile pages by ID; create profiles via API. All profiles share a default image.
- **Users** – Create users (name only) for commenting and voting.
- **Comments** – Post comments on a profile with optional MBTI, Enneagram, and Zodiac tags; list with sort (best/recent) and filter (all/mbti/enneagram/zodiac); like/unlike.
- **Votes** – Vote on a profile’s personality (MBTI, Enneagram, Zodiac); one vote per user per profile; optional per system.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)

## Installation

```bash
npm install
```

## Running the app

```bash
npm start
```

Server runs at **http://localhost:3000** (or `PORT` env). First run may take a moment while mongodb-memory-server downloads the MongoDB binary.

- **http://localhost:3000/** – Redirects to the first profile’s page.
- **http://localhost:3000/:profileId** – Profile page (HTML).

## API

Base path: **/api**

### Users

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/users | Create user. Body: `{ "name": "string" }` |
| GET | /api/users/:id | Get user by id |

### Profiles (comments & votes)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/profiles/:profileId/comments | Create comment. Body: `{ userId, title, body?, mbti?, enneagram?, zodiac? }` |
| GET | /api/profiles/:profileId/comments | List comments. Query: `sort=best\|recent`, `filter=all\|mbti\|enneagram\|zodiac` |
| POST | /api/profiles/:profileId/comments/:commentId/like | Like comment. Body: `{ userId }` |
| DELETE | /api/profiles/:profileId/comments/:commentId/like | Unlike comment. Body or query: `userId` |
| POST | /api/profiles/:profileId/votes | Create/update vote. Body: `{ userId, mbti?, enneagram?, zodiac? }` |
| GET | /api/profiles/:profileId/votes | Aggregated vote counts and top type per system |
| GET | /api/profiles/:profileId/votes/me?userId= | Current user’s vote for this profile |

**Personality options**

- **MBTI:** INFP, INFJ, ENFP, ENFJ, INTJ, INTP, ENTP, ENTJ, ISFP, ISFJ, ESFP, ESFJ, ISTP, ISTJ, ESTP, ESTJ  
- **Enneagram:** 1w2, 2w3, 3w2, 3w4, 4w3, 4w5, 5w4, 5w6, 6w5, 6w7, 7w6, 7w8, 8w7, 8w9, 9w8, 9w1  
- **Zodiac:** Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces  

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm test` | Run tests (Jest) |
| `npm run lint` | Run ESLint |

## Testing

```bash
npm test
```

Tests use mongodb-memory-server and cover profile routes and the full API (users, comments, votes). Run with `--runInBand` so the in-memory DB is used correctly.

## CI

GitHub Actions runs on push and pull requests to `main`/`master`:

1. Checkout
2. Node.js 20, npm cache
3. `npm ci`
4. `npm run lint`
5. `npm test`

## License

ISC
