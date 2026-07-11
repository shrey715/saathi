import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from db import get_session
from models import CommunityPost, PostLike
from schemas import PostCreate, PostInDB, PostLikeRequest
from security import get_current_username

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/community", tags=["community"])


@router.post("/posts", response_model=PostInDB)
def create_post(post: PostCreate, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    try:
        db_post = CommunityPost(
            id=uuid.uuid4().hex,
            content=post.content,
            mood=post.mood,
            emoji=post.emoji,
            color=post.color,
            username=username,
            is_anonymous=post.is_anonymous,
        )
        session.add(db_post)
        session.commit()
        session.refresh(db_post)
        return PostInDB(
            id=db_post.id,
            content=db_post.content,
            mood=db_post.mood,
            emoji=db_post.emoji,
            color=db_post.color,
            # The author still sees their own name on a post they just
            # made anonymously — masking only applies to other viewers,
            # in get_posts below.
            username=db_post.username,
            is_anonymous=db_post.is_anonymous,
            timePosted=db_post.time_posted,
            likes=db_post.likes,
            liked=False,
        )
    except Exception as exc:
        logger.exception("Error creating post")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating post: {exc}")


@router.get("/posts")
def get_posts(username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    try:
        posts = session.exec(select(CommunityPost).order_by(CommunityPost.time_posted.desc())).all()
        liked_post_ids = {
            like.post_id
            for like in session.exec(select(PostLike).where(PostLike.username == username)).all()
        }
        return [
            {
                "id": p.id,
                "content": p.content,
                "mood": p.mood,
                "emoji": p.emoji,
                "color": p.color,
                # Never reveal the real author to anyone but themselves —
                # otherwise "anonymous" posting wouldn't actually hide
                # identity, and other users could still correlate a
                # username with the (potentially sensitive) mood/content.
                "username": p.username if (not p.is_anonymous or p.username == username) else None,
                "is_anonymous": p.is_anonymous,
                "timePosted": p.time_posted.isoformat(),
                "likes": p.likes,
                "liked": p.id in liked_post_ids,
            }
            for p in posts
        ]
    except Exception as exc:
        logger.exception("Error fetching posts")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching posts: {exc}")


@router.post("/posts/like")
def like_post(request: PostLikeRequest, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    post = session.get(CommunityPost, request.id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with ID {request.id} not found")

    existing_like = session.get(PostLike, (request.id, username))
    if existing_like:
        session.delete(existing_like)
        post.likes = max(0, post.likes - 1)
        liked = False
    else:
        session.add(PostLike(post_id=request.id, username=username))
        post.likes += 1
        liked = True

    session.add(post)
    session.commit()
    return {"id": request.id, "likes": post.likes, "liked": liked}
