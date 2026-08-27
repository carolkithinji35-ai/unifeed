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


def post_to_dict(post):
    """Convert a Post model instance into a JSON-friendly dictionary."""
    return {
        "id": post.id,
        "content": post.content,
        "image_url": post.image_url,
        "author_id": post.author_id,
        "created_at": post.created_at.isoformat(),
    }
