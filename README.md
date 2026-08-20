# UniFeed

UniFeed is a campus-only social space inspired by the simplicity of X (formerly Twitter), built exclusively for university students. It gives students a place to share quick thoughts, see what's happening around campus, discover peers, and connect within their own community.

## Why UniFeed?

Most social platforms are too broad. UniFeed narrows the focus to campus life, the conversations, announcements, and moments that matter to students.

## Features

- Scroll through a live campus feed
- Search and explore fellow students
- View student profiles
- Like, repost, and comment on posts
- Clean, minimal, mobile-friendly UI
- Fast and simple to use

## API Integration

### Base URL

https://randomuser.me/api/

### Endpoints Used

#### 1. Get Students for Feed

Fetches a list of students to populate the feed.

GET https://randomuser.me/api/?results=10

#### 2. Get Students for Explore Page

Fetches a larger set of students for search and discovery.

GET https://randomuser.me/api/?results=20

#### 3. Get a Specific Student Profile

Fetches a single student by ID.

GET https://randomuser.me/api/?uuid={student-uuid}

### Future Endpoints (When Backend is Added)

#### Create a New Post

POST /api/posts

#### Like a Post

POST /api/posts/:id/like

#### Repost a Post

POST /api/posts/:id/repost

#### Add a Comment

POST /api/posts/:id/comments

## Tech Stack

- React
- React Router
- Tailwind CSS
- Lucide Icons
- Random User API (for real external data)

## Setup

### Prerequisites

- Node.js installed
- npm or yarn

### Installation

1. Clone the repository:

git clone https://github.com/yourusername/unifeed.git

2. Navigate into the project folder:

cd unifeed

3. Install dependencies:

npm install

4. Start the development server:

npm run dev

5. Open your browser and visit:

http://localhost:5173

## Challenges

- Handling dynamic data from an external API
- Filtering and searching users in real time
- Managing state across routes
- Simulating interactions (likes, reposts) without a backend

## Future Improvements

- Real authentication using student emails or registration numbers
- Backend with database for posts, comments, and user profiles
- Direct messaging between students
- Campus clubs and events feed
