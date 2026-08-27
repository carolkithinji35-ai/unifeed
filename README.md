# UniFeed

UniFeed is a campus-first social platform designed for university communities. It gives students a focused space to share campus moments, discover peers, explore future campus features, and stay connected without the noise of generic social media.

UniFeed follows a **B2B2C model**: universities provide the platform for their student communities, while students use it to participate in campus conversations and activities.

## The problem it solves

Students participate in many campus communities through lectures, residences, clubs, societies, course groups, and events. However, these conversations are often scattered across different messaging apps and social platforms.

UniFeed brings campus conversations into one focused space where students can discover relevant posts, engage with comments, explore student profiles, and eventually participate in verified university communities and events.

## preview


![UniFeed application preview](assets/uni-feed-preview.png)
 

## Current features

- Lens-inspired dark campus feed with charcoal and lime-green styling
- Real posts loaded from a Flask API
- PostgreSQL-backed users, posts, and comments
- Create, read, update, and delete post endpoints
- Create and retrieve comments for posts
- Real author usernames and comment counts
- React post composer connected to the API
- Comment loading and submission from the feed
- Browser-level bookmarks using local storage
- Student search and profile pages
- Sign-in, sign-up, and password-recovery screens prepared for the authentication phase
- Future routes for events, communities, notifications, messages, and bookmarks
- Responsive interface for desktop and smaller screens

## Technology stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React Icons

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- SQLAlchemy ORM
- Flask-Migrate and Alembic
- PostgreSQL
- Gunicorn for production hosting

### Deployment

- React frontend hosted on Vercel
- Flask API hosted on Render
- PostgreSQL database hosted on Render

## Live application

Frontend:

<https://unifeed-seven.vercel.app/>

Backend health check:

<https://unifeed-api.onrender.com/api/health>

Posts API:

<https://unifeed-api.onrender.com/api/posts>

The frontend uses a Vercel rewrite to forward `/api/*` requests to the hosted Flask API. Database credentials remain private inside the Render backend environment variables.





## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API availability |
| GET | `/api/posts` | List posts, newest first |
| GET | `/api/posts/<id>` | Retrieve one post |
| POST | `/api/posts` | Create a post |
| PATCH | `/api/posts/<id>` | Update a post |
| DELETE | `/api/posts/<id>` | Delete a post |
| GET | `/api/posts/<id>/comments` | List comments for a post |
| POST | `/api/posts/<id>/comments` | Create a comment |

Authentication is not included in the current API checkpoint. Until Phase 3, development requests use a temporary author ID. Authentication and authorization will replace this temporary behavior.

## Run locally

### Prerequisites

- Node.js 18 or newer
- npm
- Python 3.12 or newer
- PostgreSQL

### Install frontend dependencies

Run these commands from the project root:

```bash
npm install
npm run dev
```

Open the local Vite URL, usually:

```bash
http://localhost:5173
```

### Start the backend

Open a second terminal:

```bash
cd server
source .venv/bin/activate
python3 run.py
```

The Flask API runs locally at:

```bash
http://127.0.0.1:5000
```

The local frontend uses the Vite proxy to forward `/api` requests to Flask.

### Database commands

Create the local database if it does not already exist:

```bash
createdb unifeed_dev
```

Apply database migrations:

```bash
cd server
source .venv/bin/activate
python3 -m flask --app run.py db upgrade
```

Populate development data:

```bash
python3 seed.py
```

Run backend tests:

```bash
python3 -m pytest
```

Build the frontend for production:

```bash
cd ..
npm run build
```

## Environment variables

The backend uses a private file at:

```text
server/.env
```

Example structure:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/unifeed_dev
FLASK_DEBUG=1
```

Do not commit `server/.env` to GitHub. Production values are configured privately in Render.

## Project structure

```text
unifeed/
├── src/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── server/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── config.py
│   │   ├── extensions.py
│   │   └── __init__.py
│   ├── migrations/
│   ├── tests/
│   ├── .env
│   ├── requirements.txt
│   ├── run.py
│   └── seed.py
├── vercel.json
├── vite.config.js
├── package.json
└── README.md
```

## Roadmap

- Implement authentication and authorization
- Replace the temporary development author with the logged-in user
- Persist likes, reposts, and bookmarks per user
- Add image upload and storage
- Add campus communities and membership flows
- Add event creation and RSVP functionality
- Add messaging and notifications
- Add moderation and university verification
- Introduce university administration tools for the B2B2C platform model

## Project status

UniFeed currently has a working full-stack foundation with a React frontend, Flask API, SQLAlchemy models, PostgreSQL persistence, migrations, seeded development data, and live deployment.

Authentication, user-specific permissions, persistent social interactions, and production image storage are planned for the next development phase.

## License

This project is currently intended for educational, demonstration, and portfolio use.
