def validate_post_data(data):
    """Validate the JSON data needed to create a post."""
    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object."}

    content = data.get("content")

    if not isinstance(content, str) or not content.strip():
        return {"error": "Content is required and must be a non-empty string."}

    image_url = data.get("image_url")

    if image_url is not None and not isinstance(image_url, str):
        return {"error": "image_url must be a string or null."}

    return None


def validate_post_update_data(data):
    """Validate fields supplied when updating a post."""
    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object."}

    if not data:
        return {"error": "At least one field is required for an update."}

    allowed_fields = {"content", "image_url"}
    unknown_fields = set(data) - allowed_fields

    if unknown_fields:
        return {"error": "Only content and image_url can be updated."}

    if "content" in data:
        if not isinstance(data["content"], str) or not data["content"].strip():
            return {"error": "Content must be a non-empty string."}

    if "image_url" in data:
        if data["image_url"] is not None and not isinstance(data["image_url"], str):
            return {"error": "image_url must be a string or null."}

    return None


def post_to_dict(post, current_user_id=None):
    """Convert a Post model instance into a JSON-friendly dictionary."""
    return {
        "id": post.id,
        "content": post.content,
        "image_url": post.image_url,
        "author_id": post.author_id,
        "author": {
            "username": post.author.username,
        }
        if post.author
        else None,
        "comment_count": len(post.comments),
        "like_count": len(post.likes),
        "repost_count": len(post.reposts),
        "bookmark_count": len(post.bookmarks),
        "liked_by_current_user": (
            any(like.user_id == current_user_id for like in post.likes)
            if current_user_id is not None
            else False
        ),
        "reposted_by_current_user": (
            any(repost.user_id == current_user_id for repost in post.reposts)
            if current_user_id is not None
            else False
        ),
        "bookmarked_by_current_user": (
            any(
                bookmark.user_id == current_user_id
                for bookmark in post.bookmarks
            )
            if current_user_id is not None
            else False
        ),
        "created_at": post.created_at.isoformat(),
    }
