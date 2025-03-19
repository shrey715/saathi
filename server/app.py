import os
import uvicorn
from datetime import datetime, timedelta
from typing import Optional, List

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId

# Import agent system components
from moya.tools.tool_registry import ToolRegistry
from moya.registry.agent_registry import AgentRegistry
from moya.orchestrators.multi_agent_orchestrator import MultiAgentOrchestrator
from moya.orchestrators.simple_orchestrator import SimpleOrchestrator
from moya.tools.ephemeral_memory import EphemeralMemory
from agents.agent_classifier import create_classifier_agent
from agents.emotional_validator import create_emotional_validator_agent
from agents.crisis_agent import create_crisis_agent
from agents.multidisciplinary_agents import create_psychological_agent, create_wellness_agent, create_behavioral_health_agent
from agents.guided_helper import create_guided_helper_agent
from agents.emotion_detector_agent import create_emotion_detector_agent
from agents.book_agent import create_book_recommender_agent

# MongoDB setup
load_dotenv()

# MongoDB setup
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["database_zero"]
users_collection = db["users"]
# Add posts collection
posts_collection = db["community_posts"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT setup
SECRET_KEY = "YOUR_SECRET_KEY"  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240

app = FastAPI()

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://saathi-eight.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize agent system
tool_registry = ToolRegistry()
EphemeralMemory.configure_memory_tools(tool_registry)
agent_registry = AgentRegistry()

# Create and register agents
emotional_validator = create_emotional_validator_agent(tool_registry)
crisis_agent = create_crisis_agent(tool_registry)
psychological_agent = create_psychological_agent(tool_registry)
wellness_agent = create_wellness_agent(tool_registry)
behavioral_health_agent = create_behavioral_health_agent(tool_registry)
guided_helper = create_guided_helper_agent(tool_registry)
emotion_detector = create_emotion_detector_agent(tool_registry)
book_recommender = create_book_recommender_agent(tool_registry)

# Register agents
agent_registry.register_agent(emotional_validator)
agent_registry.register_agent(crisis_agent)
agent_registry.register_agent(psychological_agent)
agent_registry.register_agent(wellness_agent)
agent_registry.register_agent(behavioral_health_agent)
agent_registry.register_agent(guided_helper)
agent_registry.register_agent(emotion_detector)
agent_registry.register_agent(book_recommender)

# Create classifier
classifier = create_classifier_agent()

# Create orchestrator
orchestrator = MultiAgentOrchestrator(
    agent_registry=agent_registry,
    classifier=classifier,
    default_agent_name="guided_helper"
)

# Create simple orchestrator specifically for emotion detection
emotion_orchestrator = SimpleOrchestrator(
    agent_registry=agent_registry,
    default_agent_name="emotion_detector"
)

content_orchestrator = SimpleOrchestrator(
    agent_registry=agent_registry,
    default_agent_name="book_recommender"
)

# Thread storage - mapping username to thread_id
user_threads = {}

class MoodEntry(BaseModel):
    emotion: str
    timestamp: datetime
    message: Optional[str] = None
    
    class Config:
        orm_mode = True

class UserSignup(BaseModel):
    username: str
    password: str
    sex: str
    dob: str  # Date of birth as string "YYYY-MM-DD"

class UserLogin(BaseModel):
    username: str
    password: str

class JournalDeleteRequest(BaseModel):
    id: str

class ChatMessage(BaseModel):
    message: str

# Add models for community posts
class PostBase(BaseModel):
    content: str
    mood: str
    emoji: str
    color: str

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    id: str

class PostInDB(PostBase):
    id: str
    username: str
    timePosted: datetime
    likes: int = 0
    
    class Config:
        orm_mode = True

class CommunityPostDeleteRequest(BaseModel):
    id: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/api/get-books")
async def get_books(query: dict = Body(...), token: str = Depends(oauth2_scheme)):
    """Get book recommendations from the book recommender agent"""
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Get the user's latest mood from the database
        user_data = users_collection.find_one({"username": username})
        latest_mood = None
        mood_context = ""
        
        if user_data and "mood_history" in user_data and user_data["mood_history"]:
            # Sort mood history by timestamp (descending) and take the most recent one
            mood_history = sorted(user_data["mood_history"], 
                                 key=lambda x: x["timestamp"] if isinstance(x["timestamp"], datetime) else datetime.fromisoformat(x["timestamp"]), 
                                 reverse=True)
            if mood_history:
                latest_mood = mood_history[0]
                mood_context = f"User's latest recorded emotion is '{latest_mood['emotion']}'. "
                if "message" in latest_mood and latest_mood["message"]:
                    mood_context += f"Context for this emotion: '{latest_mood['message']}'. "
        
        # Generate a thread ID for this request
        thread_id = f"books_{username}_{datetime.now().timestamp()}"
        
        # Construct the prompt for the book agent including mood information
        prompt = f"{mood_context}Recommend books for the user that will help improve their mood."
        
        print(f"Book recommendation prompt: {prompt}")
        
        # Call the book recommender agent through the content orchestrator
        response = content_orchestrator.orchestrate(
            thread_id=thread_id,
            user_message=prompt,
            agent_name="book_recommender"
        )
        print("Book recommender response:")
        print(response)
        
        # Parse the response as JSON
        import json
        try:
            books = json.loads(response)
            return books
        except json.JSONDecodeError:
            # If parsing fails, return an error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to parse book recommendations"
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching book recommendations: {str(e)}"
        )

@app.get("/api/test")
async def test():
    return {"message": "Hello, World!"}

@app.post("/api/signup")
async def signup(user: UserSignup):
    # Check if user already exists
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Hash the password
    hashed_password = pwd_context.hash(user.password)
    
    # Store user in database
    user_data = {
        "username": user.username,
        "password": hashed_password,
        "sex": user.sex,
        "dob": user.dob,
        "journals": [],
        "mood_history": [],  # Initialize empty mood history
        "created_at": datetime.now()  # Use naive datetime to avoid timezone issues
    }
    users_collection.insert_one(user_data)
    return {"message": "User created successfully"}

@app.post("/api/login")
async def login(user: UserLogin):
    # Find user in database
    db_user = users_collection.find_one({"username": user.username})
    print(db_user)
    
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/update-user")
async def update_user(user: dict, token: str = Depends(oauth2_scheme)):
    """Update user details"""
    try:
        # Verify token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Debug the incoming data
        print(f"Received update data: {user}")
        
        # Update user details
        user_data = users_collection.find_one({"username": username})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create an update dictionary with only the fields that need updating
        update_fields = {}
        
        # Handle password update specially
        if "current_password" in user and "new_password" in user:
            print("Processing password update")
            # Debug password verification
            current_pwd = user["current_password"]
            stored_hash = user_data["password"]
            verification = pwd_context.verify(current_pwd, stored_hash)
            print(f"Password verification result: {verification}")
            
            if not verification:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password"
                )
            
            # Generate new password hash
            new_hash = pwd_context.hash(user["new_password"])
            print(f"Generated new password hash")
            update_fields["password"] = new_hash
        
        # Add all other fields (excluding password fields)
        for key, value in user.items():
            if key not in ["currentPassword", "newPassword"]:
                update_fields[key] = value
        
        print(f"Fields to update: {update_fields}")
        
        # Only update if there are fields to update
        if update_fields:
            print(f"Updating document for user: {username}")
            result = users_collection.update_one(
                {"username": username}, 
                {"$set": update_fields}
            )

            print(f"MongoDB update result: matched={result.matched_count}, modified={result.modified_count}")
            
            if result.modified_count == 0:
                if result.matched_count > 0:
                    print("Document found but not modified - may be identical to existing data")
                else:
                    print("No documents matched the query")
                
        return {"message": "User details updated successfully"}
    
    except Exception as e:
        # Catch any other exceptions and return a 500 error
        print(f"Error in update_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/api/chat")
async def chat(chat_data: ChatMessage, token: str = Depends(oauth2_scheme)):
    """Process a user message through the agent system and return a response"""
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get or create thread ID for this user
    if username not in user_threads:
        user_threads[username] = f"thread_{username}_{datetime.now().timestamp()}"
    
    thread_id = user_threads[username]
    # Process the user message through the orchestrator
    try:
        EphemeralMemory.store_message(thread_id, sender="user", content=chat_data.message)
        session_summary = EphemeralMemory.get_thread_summary(thread_id)
        enriched_input = session_summary + f"\nUser just said: {chat_data.message}"

        response = orchestrator.orchestrate(
            thread_id=thread_id, 
            user_message=enriched_input,
        )
    
        # Process the response through the emotion detector using the simple orchestrator
        emotion_thread_id = f"{thread_id}_emotion"
        emotion = emotion_orchestrator.orchestrate(
            thread_id=emotion_thread_id,
            user_message=response,
            agent_name="emotion_detector"
        ).strip().lower()
        
        # Validate emotion response - default to "default" if invalid
        valid_emotions = [
            "default", "thinking", "supportive", "celebration", "concern", 
            "calm", "motivated", "curious", "empathetic", "hopeful",
            "gentle", "confident", "reflective", "respectful", "warm"
        ]
        if emotion not in valid_emotions:
            emotion = "default"
            
        # Store the detected emotion in the user's mood history
        current_time = datetime.now()
        mood_entry = {
            "emotion": emotion,
            "timestamp": current_time,
            "message": chat_data.message  # Optionally store the message that triggered this emotion
        }
        
        # Update the user's mood_history in the database
        users_collection.update_one(
            {"username": username},
            {"$push": {"mood_history": mood_entry}}
        )
            
        return {"response": response, "emotion": emotion}
    except Exception as e:
        print(f"Error processing chat message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent processing error: {str(e)}"
        )

@app.post("/api/reset-chat")
async def reset_chat(token: str = Depends(oauth2_scheme)):
    """Reset the chat thread for a user"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create a new thread ID for this user
        user_threads[username] = f"thread_{username}_{datetime.now().timestamp()}"
        return {"message": "Chat thread reset successfully"}
    
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )



@app.get("/api/get-mood-history")
async def get_mood_history(token: str = Depends(oauth2_scheme)):
    """Get the user's mood history"""
    try:
        # Verify token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user details from database
        user = users_collection.find_one({"username": username})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get mood history or return empty list if it doesn't exist
        mood_history = user.get("mood_history", [])
        
        # Convert datetime objects to strings for JSON serialization
        for entry in mood_history:
            if "timestamp" in entry and isinstance(entry["timestamp"], datetime):
                entry["timestamp"] = entry["timestamp"].isoformat()
        
        return mood_history

    except Exception as e:
        # Catch any other exceptions and return a 500 error
        print(f"Error in get_mood_history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/api/get-user-details")
async def get_user_details(token: str = Depends(oauth2_scheme)):
    """Get the current user's details"""
    try:
        # Verify token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user details from database
        user = users_collection.find_one({"username": username})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Remove sensitive information
        user.pop("_id")
        user.pop("password")
        
        return user

    except Exception as e:
        # Catch any other exceptions and return a 500 error
        print(f"Error in get_user_details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/api/add-journal")
async def add_journal(journal: dict, token: str = Depends(oauth2_scheme)):
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Add journal to database
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if "journals" not in user:
        user["journals"] = []
    
    for jnl in user["journals"]:
        if jnl["id"] == journal["id"]:
            jnl.update(journal)
            users_collection.update_one({"username": username}, {"$set": user})
            return {"message": "Journal updated successfully"}
    
    user["journals"].append(journal)
    users_collection.update_one({"username": username}, {"$set": user})
    return {"message": "Journal added successfully"}

@app.get("/api/get-journals")
async def get_journals(token: str = Depends(oauth2_scheme)):
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get journals from database
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if "journals" not in user:
        user["journals"] = []
    return user["journals"]

@app.delete("/api/delete-journal")
async def delete_journal(request: JournalDeleteRequest, token: str = Depends(oauth2_scheme)):
    print("Received delete request")
    
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Delete journal from database
    journal_id = request.id
    print(f"Deleting journal with ID: {journal_id}")
    
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if "journals" not in user:
        user["journals"] = []
    
    # Store original length to check if anything was deleted
    original_length = len(user["journals"])
    user["journals"] = [jnl for jnl in user["journals"] if jnl["id"] != journal_id]
    
    if len(user["journals"]) == original_length:
        print(f"No journal found with ID: {journal_id}")
        return {"message": "No journal found with that ID"}
    
    users_collection.update_one({"username": username}, {"$set": {"journals": user["journals"]}})
    print(f"Journal deleted successfully: {journal_id}")
    return {"message": "Journal deleted successfully"}

@app.post("/api/community/posts", response_model=PostInDB)
async def create_post(post: PostCreate, token: str = Depends(oauth2_scheme)):
    """Create a new community post"""
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new post
    now = datetime.now()
    post_id = str(ObjectId())
    
    post_data = {
        "id": post_id,
        "content": post.content,
        "mood": post.mood,
        "emoji": post.emoji,
        "color": post.color,
        "username": username,
        "timePosted": now,
        "likes": 0
    }
    
    try:
        posts_collection.insert_one(post_data)
        
        # Convert MongoDB datetime to string for JSON response
        post_data["timePosted"] = post_data["timePosted"].isoformat()
        
        return post_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating post: {str(e)}"
        )

@app.get("/api/community/posts")
async def get_posts(token: str = Depends(oauth2_scheme)):
    """Get all community posts"""
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get posts from database
    try:
        posts = list(posts_collection.find().sort("timePosted", -1))  # Sort by most recent
        
        # Process posts for JSON response
        for post in posts:
            if "_id" in post:
                post.pop("_id")  # Remove MongoDB ObjectId
            
            # Convert datetime to string for JSON serialization
            if "timePosted" in post and isinstance(post["timePosted"], datetime):
                post["timePosted"] = post["timePosted"].isoformat()
        
        return posts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching posts: {str(e)}"
        )

@app.post("/api/community/posts/like")
async def like_post(post_id: dict, token: str = Depends(oauth2_scheme)):
    """Like or unlike a post (toggle)"""
    print(post_id)
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if post exists
    post = posts_collection.find_one({"id": post_id["id"]})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found"
        )
    
    # Check if user has already liked this post by checking likes array
    if "likedBy" not in post:
        post["likedBy"] = []
    
    # Toggle like status
    if username in post["likedBy"]:
        # Unlike the post
        post["likedBy"].remove(username)
        new_likes = max(0, post.get("likes", 0) - 1)  # Ensure likes don't go below 0
        posts_collection.update_one(
            {"id": post_id}, 
            {"$set": {"likedBy": post["likedBy"], "likes": new_likes}}
        )
        return {"id": post_id, "likes": new_likes, "liked": False}
    else:
        # Like the post
        post["likedBy"].append(username)
        new_likes = post.get("likes", 0) + 1
        posts_collection.update_one(
            {"id": post_id}, 
            {"$set": {"likedBy": post["likedBy"], "likes": new_likes}}
        )
        return {"id": post_id, "likes": new_likes, "liked": True}
    

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Get port from environment
    uvicorn.run(app, host="0.0.0.0", port=port)  # Listen on all interfaces