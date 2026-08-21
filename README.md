# UniFeed

UniFeed is a campus-first social platform built for students who want connection without the noise of generic social media.

It gives university communities a dedicated space to share campus moments, discover peers, explore events, and stay connected around what matters most to student life.

## The problem it solves

Students already live in many communities; lectures, residences, clubs, societies, course groups, and campus events, but those conversations are scattered across different apps and chats.

UniFeed brings that energy into one focused space so students can:

- find relevant campus communities
- discover people with shared interests
- follow campus conversations
- view student profiles and activity
- stay in touch with what is happening around them

## Preview
<img width="1892" height="850" alt="unifeed preview" src="https://github.com/user-attachments/assets/db9b4a70-5577-4d23-9cb9-37be511eb9d1" />

## Live demo
https://unifeed-seven.vercel.app/

## What the app includes

- campus-style feed with community prompts
- search for students by name, username, or location
- student profile pages
- auth screens for sign in, sign up, and password recovery
- future pages for notifications, bookmarks, events, and communities
- responsive dark-mode interface designed for campus engagement

## Tech stack

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React Icons
- RandomUser API for demo data



## Run locally

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Start the app

```bash
npm run dev
```

Then open the local Vite URL in your browser, usually:

```bash
http://localhost:5173
```

If the port is busy, Vite will show the next available one.

## Environment variables

If you connect the app to a real backend, add this to a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

The auth helpers in `src/lib/authApi.js` are already structured for this pattern.

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

## Roadmap

- connect real authentication
- add backend for posts and profiles
- implement likes, reposts, and comments
- support messaging and campus communities
- add event creation and RSVP flows
- improve moderation and university verification

## License

This project is currently a frontend prototype and is intended for educational and portfolio use.


