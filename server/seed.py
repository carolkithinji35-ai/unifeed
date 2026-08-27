from app import create_app
from app.extensions import db
from app.models import Comment, Post, User


SEED_USERS = [
    ("amina_k", "amina@unifeed.local"),
    ("brian_ots", "brian@unifeed.local"),
    ("wambui_njoroge", "wambui@unifeed.local"),
    ("johan_m", "johan@unifeed.local"),
    ("maya_w", "maya@unifeed.local"),
    ("kevo_campus", "kevin@unifeed.local"),
]


SEED_POSTS = [
    (
        "amina_k",
        "The lecturer said the deadline is flexible, then opened the submission portal for exactly 14 minutes. We move.",
    ),
    (
        "brian_ots",
        "Library floor three is officially a silent study zone, except for the group project discussion happening since Tuesday.",
    ),
    (
        "wambui_njoroge",
        "A reminder that submitting the assignment before the last ten minutes is a personality trait worth celebrating.",
    ),
    (
        "johan_m",
        "The common room playlist has entered its afrobeats era. Nobody knows who is in charge, but morale has improved.",
    ),
    (
        "maya_w",
        "Who else is attending the campus social this weekend? I need a friend before I pretend I came for the networking.",
    ),
    (
        "kevo_campus",
        "The computer lab is open late today. This is your sign to finish that project before midnight stress begins.",
    ),
    (
        "amina_k",
        "Our study group started with one whiteboard and ended with three snacks, two deadlines, and a new group chat.",
    ),
    (
        "brian_ots",
        "Campus rain has cancelled every outdoor plan, but somehow the cafeteria is busier than ever.",
    ),
    (
        "wambui_njoroge",
        "The student market has the best affordable snacks near campus. Please share your recommendations.",
    ),
    (
        "maya_w",
        "Small campus win: someone returned my charger after finding it in the lecture hall. Good people still exist.",
    ),
]


SEED_COMMENTS = [
    (
        0,
        "brian_ots",
        "Fourteen minutes is not a deadline; it is a challenge.",
    ),
    (
        0,
        "maya_w",
        "This happened to our class too. We need a campus support group.",
    ),
    (
        1,
        "wambui_njoroge",
        "The library group project deserves its own community.",
    ),
    (
        2,
        "amina_k",
        "That is the kind of campus win we need to celebrate.",
    ),
    (
        4,
        "johan_m",
        "You should come with us. We are meeting near the courtyard.",
    ),
    (
        5,
        "kevo_campus",
        "The late-night lab sessions are saving this semester.",
    ),
    (
        7,
        "maya_w",
        "The cafeteria is always the real campus social.",
    ),
    (
        9,
        "brian_ots",
        "A rare and beautiful campus moment.",
    ),
]


def get_or_create_user(username, email):
    """Return an existing seed user by email or create it once."""
    user = User.query.filter_by(email=email).first()

    if user is None:
        user = User(username=username, email=email)
        db.session.add(user)
        db.session.flush()
    else:
        user.username = username

    return user


def seed_database():
    """Insert repeat-safe development data into UniFeed."""
    users = {
        username: get_or_create_user(username, email)
        for username, email in SEED_USERS
    }
    db.session.commit()

    posts = []

    for username, content in SEED_POSTS:
        post = Post.query.filter_by(content=content).first()

        if post is None:
            post = Post(
                content=content,
                author_id=users[username].id,
            )
            db.session.add(post)
            db.session.flush()

        posts.append(post)

    db.session.commit()

    comments_added = 0

    for post_index, username, content in SEED_COMMENTS:
        post = posts[post_index]
        author = users[username]

        existing_comment = Comment.query.filter_by(
            post_id=post.id,
            author_id=author.id,
            content=content,
        ).first()

        if existing_comment is None:
            db.session.add(
                Comment(
                    content=content,
                    author_id=author.id,
                    post_id=post.id,
                )
            )
            comments_added += 1

    db.session.commit()

    print("UniFeed seed completed successfully.")
    print(f"Users available: {len(users)}")
    print(f"Posts available: {len(posts)}")
    print(f"New comments added: {comments_added}")


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        seed_database()
