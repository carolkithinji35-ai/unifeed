# UniFeed

UniFeed is a campus-first social platform designed for university communities. It gives students a focused space to share campus moments, discover peers, explore campus conversations, and stay connected without the noise of generic social media.

UniFeed is designed as a university community platform: universities can provide the space for their student communities, while students use it to participate in campus conversations and activities.

## The problem it solves

Students participate in many campus communities through lectures, residences, clubs, societies, course groups, and events. However, these conversations are often scattered across messaging apps and general-purpose social platforms.

UniFeed brings campus conversations into one focused space where students can discover relevant posts, engage with comments, view student profiles, and participate in a more organized campus community.

## Preview
![UniFeed application preview](assets/uni-feed-preview.png)

## Current features

- Lens-inspired dark campus feed with charcoal and lime-green styling
- User registration with password hashing
- Session-based login, logout, and current-user authentication
- PostgreSQL-backed users, posts, and comments
- Full CRUD endpoints for posts
- Create, read, update, and delete endpoints for comments
- Ownership enforcement for post and comment updates and deletes
- Users can edit or delete only their own posts
- Users can delete or update only their own comments
- Real author usernames and comment counts
- React post composer connected to the Flask API
- Comment loading and submission from the feed
- Browser-level bookmarks using local storage
- Student search and profile pages
- Responsive interface for desktop and smaller screens
- Future routes for events, communities, notifications, messages, and bookmarks

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
- Werkzeug password hashing
- Flask-CORS
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

The frontend uses API routing to communicate with the hosted Flask API. Database credentials and the Flask secret key remain private inside the Render backend environment variables.



## Authentication and ownership

UniFeed uses Flask sessions for authentication. When a user registers or logs in successfully, the API creates a session containing the authenticated user ID. Passwords are stored as secure hashes rather than plain text.

Create, update, and delete operations use the authenticated session on the server. The client does not decide which user owns a record. A user can update or delete only their own posts and comments. Unauthenticated requests receive a `401` response, while attempts to modify another user’s records receive a `403` response.

## API endpoints

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user and start a session |
| POST | `/api/auth/login` | Authenticate a user and start a session |
| GET | `/api/auth/me` | Return the current authenticated user |
| POST | `/api/auth/logout` | End the current session |

### Posts

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/posts` | List posts, newest first |
| GET | `/api/posts/<id>` | Retrieve one post |
| POST | `/api/posts` | Create a post for the authenticated user |
| PATCH | `/api/posts/<id>` | Update a post owned by the authenticated user |
| DELETE | `/api/posts/<id>` | Delete a post owned by the authenticated user |

### Comments

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/posts/<id>/comments` | List comments for a post |
| POST | `/api/posts/<id>/comments` | Create a comment for the authenticated user |
| PATCH | `/api/comments/<id>` | Update a comment owned by the authenticated user |
| DELETE | `/api/comments/<id>` | Delete a comment owned by the authenticated user |

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

Open the local Vite URL shown in the terminal, usually:

```text
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

```text
http://127.0.0.1:5000
```

The Vite development proxy forwards `/api` requests to the Flask API during local development.

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

The backend uses a private environment file at:

```text
server/.env
```

Example backend structure:

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/unifeed_dev
SECRET_KEY=your-private-secret-key
FLASK_DEBUG=1
```

The frontend may use a root `.env` file for local API configuration. When using the Vite proxy, leave the API base empty:

```dotenv
VITE_API_BASE_URL=
```

Do not commit either `.env` file to GitHub. Production values are configured privately in Render.

## Project structure

```text
unifeed/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── assets/
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

- Persist likes, reposts, and bookmarks per user
- Add image upload and storage
- Add campus communities and membership flows
- Add event creation and RSVP functionality
- Add messaging and notifications
- Add moderation and university verification
- Introduce university administration tools for the B2B2C platform model

## Project status

UniFeed is a deployed full-stack educational project with a React frontend, Flask API, SQLAlchemy models, PostgreSQL persistence, migrations, seeded development data, session authentication, and ownership-protected CRUD operations for posts and comments.

The current focus is completing the campus social experience while keeping authentication and server-side ownership enforcement central to the application architecture.

## License

This project is intended for educational, demonstration, and portfolio use.

