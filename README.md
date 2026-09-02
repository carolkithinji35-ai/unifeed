# UniFeed

UniFeed is a campus-first social platform for university communities. It gives students one focused place to share updates, discover peers, participate in campus conversations, and stay connected.

The platform is designed for university communities, with students at the center of everyday campus interaction and universities providing the broader community space.

## The problem it solves

Campus information is constantly being created, but it is rarely organized in one place. A student may find an event in one group chat, a course update in another, a club announcement on a social platform, and a useful peer recommendation somewhere else. Important information becomes difficult to discover, conversations are separated from the people and communities they concern, and students have limited visibility into what is happening around them.

UniFeed addresses this fragmentation with a dedicated campus feed and social layer. Students can discover relevant posts, respond through likes and comments, save useful content, follow peers, view public profiles, and continue conversations privately; all within one university-focused experience.

## Preview

![UniFeed application preview](assets/uni-feed-preview.png)

## Current features

- Campus-first social feed with charcoal and lime-green styling

- User registration with password hashing

- Session-based login, logout, and current-user authentication

- PostgreSQL-backed users, posts, comments, likes, reposts, bookmarks, follows, notifications, conversations, and messages

- Full CRUD endpoints for posts

- Create, read, update, and delete endpoints for comments

- Server-side ownership enforcement for post and comment updates and deletes

- Users can edit or delete only their own posts

- Users can delete or update only their own comments

- Real author usernames, profile details, post timestamps, and interaction counts

- Persistent likes, reposts, and bookmarks stored in the database

- Dedicated Bookmarks page showing a user’s saved posts

- React post creation page with edit and delete actions

- Comment loading, submission, and deletion from the feed

- Public student profiles with first name, last name, bio, location, posts, followers, and following information

- Profile editing restricted to the authenticated profile owner

- Follow and unfollow functionality with persistent follower relationships

- Real database users in Explore, follow suggestions, and messaging suggestions

- Notifications for likes, comments, and new followers

- Persistent notification history with unread counts and read-state handling

- Private one-to-one conversations with message history

- Unread message counts and conversation read-state handling

- Responsive desktop, tablet, and mobile layouts

- Fixed mobile header and bottom navigation for Home, Explore, Notifications, Messages, and Bookmarks

- Mobile-friendly post action controls with accessible icon labels

- Independent desktop scrolling for the feed and right sidebar

- Database migrations managed through Flask-Migrate and Alembic

## Technology stack

### Frontend

- React 19

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

[https://unifeed-seven.vercel.app/](https://unifeed-seven.vercel.app/)

Backend health check:

[https://unifeed-api.onrender.com/api/health](https://unifeed-api.onrender.com/api/health)

Posts API:

[https://unifeed-api.onrender.com/api/posts](https://unifeed-api.onrender.com/api/posts)

The frontend uses API routing to communicate with the hosted Flask API. Database credentials and the Flask secret key remain private inside the Render backend environment variables.

## Authentication and ownership

UniFeed uses Flask sessions for authentication. When a user registers or logs in successfully, the API creates a session containing the authenticated user ID. Passwords are stored as secure hashes rather than plain text.

Create, update, and delete operations use the authenticated session on the server. The client does not decide which user owns a record. A user can update or delete only their own posts and comments. Unauthenticated requests receive a `401` response, while attempts to modify another user’s records receive a `403` response.

Social interactions and communication data are stored in PostgreSQL, allowing activity to remain available across sessions and devices.

## API endpoints

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user and start a session |
| POST | `/api/auth/login` | Authenticate a user and start a session |
| GET | `/api/auth/me` | Return the current authenticated user |
| PATCH | `/api/auth/profile` | Update the authenticated user’s profile |
| POST | `/api/auth/logout` | End the current session |

### Users and profiles

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/users` | List available UniFeed users |
| GET | `/api/users/<id>` | Retrieve a public user profile and the user’s posts |
| GET | `/api/users/<id>/follow-status` | Return the current follow status |
| POST | `/api/users/<id>/follow` | Follow another user |
| DELETE | `/api/users/<id>/follow` | Unfollow another user |

### Posts

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/posts` | List posts, newest first |
| GET | `/api/posts/<id>` | Retrieve one post |
| POST | `/api/posts` | Create a post for the authenticated user |
| PATCH | `/api/posts/<id>` | Update a post owned by the authenticated user |
| DELETE | `/api/posts/<id>` | Delete a post owned by the authenticated user |
| POST | `/api/posts/<id>/like` | Like a post |
| DELETE | `/api/posts/<id>/like` | Remove a like from a post |
| POST | `/api/posts/<id>/repost` | Repost a post |
| DELETE | `/api/posts/<id>/repost` | Remove a repost |
| POST | `/api/posts/<id>/bookmark` | Bookmark a post |
| DELETE | `/api/posts/<id>/bookmark` | Remove a bookmark |

### Comments

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/posts/<id>/comments` | List comments for a post |
| POST | `/api/posts/<id>/comments` | Create a comment for the authenticated user |
| PATCH | `/api/comments/<id>` | Update a comment owned by the authenticated user |
| DELETE | `/api/comments/<id>` | Delete a comment owned by the authenticated user |

### Notifications

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/notifications` | List notifications for the authenticated user |
| GET | `/api/notifications/unread-count` | Return the unread notification count |
| POST | `/api/notifications/<id>/read` | Mark one notification as read |
| POST | `/api/notifications/read-all` | Mark all notifications as read |

### Messaging

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/conversations` | List the authenticated user’s conversations |
| POST | `/api/conversations` | Start or retrieve a conversation with another user |
| GET | `/api/conversations/<id>/messages` | Retrieve conversation messages |
| POST | `/api/conversations/<id>/messages` | Send a private message |
| POST | `/api/conversations/<id>/read` | Mark a conversation’s messages as read |
| GET | `/api/messages/unread-count` | Return the unread message count |

### Bookmarks

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/bookmarks` | List the authenticated user’s bookmarked posts |

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

```
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

```
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

```
server/.env
```

Example backend structure:

```
DATABASE_URL=postgresql+psycopg://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/unifeed_dev
SECRET_KEY=your-private-secret-key
FLASK_DEBUG=1
```

The frontend may use a root `.env` file for local API configuration. When using the Vite proxy, leave the API base empty:

```
VITE_API_BASE_URL=
```

Do not commit either `.env` file to GitHub. Production values are configured privately in Render.

## Project structure

```
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
│   │   ├── services/
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

- Add image upload and storage for richer campus posts

- Add fully functional campus communities and membership flows

- Add event creation, RSVP, and calendar functionality

- Add moderation tools and reporting workflows

- Add university verification and administration tools

- Improve search, feed filtering, and recommendation controls

- Add email verification and account recovery enhancements

- Introduce university administration tools for the B2B2C platform model

## Project status

UniFeed is a deployed full-stack educational project and presentation-ready MVP. It combines a campus social feed, public profiles, follows, persistent social interactions, notifications, private messaging, bookmarks, and responsive desktop and mobile layouts. The architecture can be extended with richer communities, events, moderation, and university administration tools.

## Contact

Email: [carolkithinji35@gmail.com](mailto:carolkithinji35@gmail.com)