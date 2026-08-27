def validate_comment_data(data):
    """Validate the JSON data needed to create a comment."""
    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object."}

    content = data.get("content")

    if not isinstance(content, str) or not content.strip():
        return {"error": "Content is required and must be a non-empty string."}

    return None


def comment_to_dict(comment):
    """Convert a Comment model instance into a JSON-friendly dictionary."""
    return {
        "id": comment.id,
        "content": comment.content,
        "author_id": comment.author_id,
        "post_id": comment.post_id,
        "created_at": comment.created_at.isoformat(),
    }
