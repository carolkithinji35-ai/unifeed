# UniFeed

UniFeed is a campus-first social platform designed for students who want to feel connected without the noise of generic social media.

Instead of a world-sized feed full of influencers, politics, and endless scrolling, UniFeed gives students one focused place to:

- share campus moments
- discover people around them
- find communities and events
- keep up with what matters in student life

Think of it as a social home for university life: a cleaner, friendlier, more relevant version of the social timeline.

## The problem UniFeed solves

Students are already living in communities — class groups, residences, clubs, societies, course chats, and campus events — but those conversations are scattered across different apps, group chats, and random platforms.

The result:

- information gets lost in noisy feeds
- students feel disconnected from their own campus network
- it is hard to discover people with shared interests or classes
- campus announcements and social moments are not organized in one place

UniFeed solves that by creating a dedicated social space for university life, where the focus stays on people, communities, and campus moments.

## Why this exists

Social media is built for everyone. Students need something built for them.

UniFeed is about reducing friction between students and the communities they already belong to. It creates a social layer that feels local, personal, and useful — not overwhelming.

## What the product looks like

The app includes:

- a personalized campus feed
- searchable student discovery
- profile pages
- message, notifications, bookmarks, and events placeholders
- community-oriented sections for campus conversations
- an auth flow for sign in, sign up, and password recovery

## Current project status

This repository is currently a polished frontend prototype for the experience, with a dark modern UI and a campus-focused social layout.

It includes:

- mock data and realistic campus content
- explore and profile flows
- auth views and route structure
- placeholder API helpers ready for a backend integration

The app is structured so a real student backend can be plugged in later without rewriting the full user experience.

## Core features

- Campus feed with student activity and community prompts
- Search by student name, username, and location
- Student profile pages with social-style layouts
- Auth screens for login, sign up, and password reset
- Future pages for notifications, bookmarks, events, and communities
- Mobile-first responsive design for campus life on the move

## Tech stack

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React Icons
- RandomUser API for demo data

## Project structure

```bash
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
├── pages/
├── data/
├── lib/
└── ...
```

## Setup

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local Vite URL in your browser.

## Environment variables

If you connect the app to a real backend, create a `.env` file and add:

```env
VITE_API_BASE_URL=http://localhost:5000
```

The auth service in `src/lib/authApi.js` is already structured to work with that pattern.

## Roadmap

### Near term

- connect real authentication
- add student registration and login backend
- save and fetch real posts
- implement comments, likes, and reposts

### Longer term

- campus rooms and communities
- event discovery and RSVP flow
- messaging between students
- admin moderation and safety tools
- student verification for university-only access

## Why it matters

Campus life is rich, social, and fast-moving. Students deserve a digital space that reflects that energy without turning it into noise.

UniFeed is a step toward building a more intentional, campus-aware social experience — one that helps students connect with the right people, at the right time, in the right place.

## License

This project is currently for educational and prototype use.
