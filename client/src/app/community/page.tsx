"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, 
  User, 
  Plus, 
  ChevronLeft,
  Search, 
  X, 
  Users,
  Award, 
  UserCircle2,
  Sparkles,
  Lightbulb,
  SendHorizonal,
  Frown,
  Heart,
  PartyPopper,
  Star,
  CloudRain,
  Sun,
  Smile,
  Music,
  Coffee,
  HeartHandshake,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";

// Add these models for typing
type Post = {
  id: string;
  content: string;
  timePosted: string | Date;
  color: string;
  emoji: string;
  mood: string;
  username?: string;
  likes: number;
  liked?: boolean; // Add this field to track if current user liked the post
  likedBy?: string[];
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Mood options for new posts
const moodOptions = [
  { name: "Happy", emoji: "😊", color: "#4AD295" },
  { name: "Peaceful", emoji: "✨", color: "#8A6FE8" },
  { name: "Proud", emoji: "🎉", color: "#FF9F5A" },
  { name: "Reflective", emoji: "🧠", color: "#F355A0" },
  { name: "Tired", emoji: "😴", color: "#5AA9FF" },
  { name: "Anxious", emoji: "�", color: "#FFC837" },
];

// Background shape generator - more playful with smaller, bouncy shapes
const generateBackgroundShapes = (color) => {
  const shapes = [];
  for (let i = 0; i < 20; i++) {
    shapes.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 10, // Smaller shapes
      color: color || moodOptions[Math.floor(Math.random() * moodOptions.length)].color,
      opacity: Math.random() * 0.15 + 0.05,
      rotation: Math.random() * 360,
      animationDuration: 2 + Math.random() * 5, // Random animation duration
    });
  }
  return shapes;
};

// API functions
const fetchPosts = async (): Promise<Post[]> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await fetch(`${backendURL}/api/community/posts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = response.json();
  console.log(data);
  return data;
};

const createPost = async (post: { 
  content: string; 
  mood: string; 
  emoji: string; 
  color: string; 
}): Promise<Post> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await fetch(`${backendURL}/api/community/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
};

const likePost = async (postId: string): Promise<{
  id: string;
  likes: number;
  liked: boolean;
}> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Not authenticated');
  }

  console.log(postId)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/community/posts/like';
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"id": postId}),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to like post');
  }

  const data = response.json();
  console.log(data);
  return data;
};

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [footerHeight, setFooterHeight] = useState(80);
  const [backgroundShapes, setBackgroundShapes] = useState([]);
  const [selectedMood, setSelectedMood] = useState(moodOptions[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

    // Authentication check
    useEffect(() => {
      const checkAuth = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            console.log('No authentication token found, redirecting to login');
            router.push('/login');
            return;
          }
  
          // Verify token validity by making a request to get user details
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/get-user-details';
          const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
  
          if (!response.ok) {
            console.log('Authentication failed, redirecting to login');
            router.push('/login');
            return;
          }
  
          const userData = await response.json();
          setUser(userData);
  
          // Now that we're authenticated, fetch posts
          const fetchedPosts = await fetchPosts();
          setPosts(fetchedPosts);
          
          setIsLoading(false);
        } catch (error) {
          console.error('Authentication check error:', error);
          router.push('/login');
        }
      };
      
      checkAuth();
    }, [router]);
    
  
  // Calculate viewport heights
  useEffect(() => {
    if (isLoading) return; // Skip if still authenticating

    const footer = document.querySelector('footer');
    
    const updateHeight = () => {
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        setFooterHeight(footerRect.height + 16);
      }
    };
    
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);
  
  // Generate background shapes with a more playful mood
  useEffect(() => {
    if (isLoading) return; // Skip if still authenticating

    setBackgroundShapes(generateBackgroundShapes());
  }, []);

  // // Fetch posts from API
  // useEffect(() => {
  //   const loadPosts = async () => {
  //     try {
  //       // Check if user is authenticated
  //       const token = localStorage.getItem('accessToken');
  //       if (!token) {
  //         router.push('/login');
  //         return;
  //       }
        
  //       setIsLoading(true);
  //       const fetchedPosts = await fetchPosts();
  //       setPosts(fetchedPosts);
  //     } catch (error) {
  //       console.error('Error fetching posts:', error);
  //       toast.error('Failed to load community posts');
  //       if (error.message === 'Not authenticated') {
  //         router.push('/login');
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
    
  //   loadPosts();
  // }, [router]);

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    return searchQuery.trim() === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.mood.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Create post via API
      const postData = {
        content: newPost,
        mood: selectedMood.name.toLowerCase(),
        emoji: selectedMood.emoji,
        color: selectedMood.color
      };
      
      const createdPost = await createPost(postData);
      
      // Add new post to the beginning of the list
      setPosts(prevPosts => [createdPost, ...prevPosts]);
      
      // Reset form
      setNewPost("");
      setIsExpanded(false);
      
      // Show success message
      toast.success('Your post has been shared!');
      
      // Show a little celebration animation
      const confetti = document.createElement('div');
      confetti.className = 'confetti-container';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      
      if (error.message === 'Not authenticated') {
        router.push('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle liking a post
  const handleLikePost = async (postId) => {
    try {
      const result = await likePost(postId);

      setPosts(currentPosts =>
        currentPosts.map(post =>
          post.id === postId
            ? { ...post, likes: result.likes, liked: result.liked }
            : post
        )
      );

    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');

      if (error.message === 'Not authenticated') {
        router.push('/login');
      }
    }
  };
  

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading community posts...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-white text-foreground relative"
      style={{ 
        height: `calc(100vh - ${footerHeight}px)`,
        maxHeight: `calc(100vh - ${footerHeight}px)`,
        overflow: 'hidden'
      }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {backgroundShapes.map(shape => (
          <div
            key={shape.id}
            className="absolute rounded-full"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              backgroundColor: shape.color,
              opacity: shape.opacity,
              transform: `rotate(${shape.rotation}deg)`,
              filter: 'blur(15px)',
              animation: `float ${shape.animationDuration}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>
      
      {/* Overlay for readability */}
      <div className="fixed inset-0 backdrop-blur-lg bg-white/60 pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-20 px-3 py-3 flex justify-between items-center bg-white/70 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-indigo-700">
            Saathi Community
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-indigo-50 rounded-full p-1">
            <UserCircle2 className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto hide-scrollbar pb-6">
        {/* Post creation box */}
        <div className="px-3 pt-3 pb-2">
          <Card className={`overflow-hidden border border-gray-200 shadow-sm p-3 transition-all duration-300 bg-white ${isExpanded ? 'shadow-md' : ''}`}>
            <div className="flex items-start">
              <div className="mr-2 mt-1">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <Textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onClick={() => setIsExpanded(true)}
                  className={`text-sm border-0 shadow-none resize-none p-1 bg-white text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all ${isExpanded ? 'min-h-[100px]' : 'h-[40px]'}`}
                />
                
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pt-2 flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {moodOptions.map((mood) => (
                          <button
                            key={mood.name}
                            onClick={() => setSelectedMood(mood)}
                            className={`rounded-full w-8 h-8 flex items-center justify-center transition-transform ${selectedMood.name === mood.name ? 'transform scale-125 shadow-sm' : ''}`}
                            style={{ 
                              backgroundColor: `${mood.color}20`,
                              border: selectedMood.name === mood.name ? `2px solid ${mood.color}` : '1px solid transparent'
                            }}
                          >
                            <span role="img" aria-label={mood.name}>{mood.emoji}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsExpanded(false);
                            setNewPost("");
                          }}
                          className="text-gray-600 hover:bg-gray-100"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleCreatePost}
                          disabled={!newPost.trim() || isSubmitting}
                          className={`rounded-full ${!newPost.trim() || isSubmitting ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <SendHorizonal className="h-4 w-4 mr-1" />
                          )}
                          Post
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search community posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-full border-gray-200 text-gray-800 placeholder:text-gray-400 text-sm bg-gray-50/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* Community Posts Feed */}
        <div className="px-3 space-y-3 mb-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Loading posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                <Card
                  className="overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-default bg-white/95 relative"
                >
                  {/* Post mood indicator */}
                  <div 
                    className="absolute top-0 left-0 w-full h-1 rounded-t"
                    style={{ backgroundColor: post.color }}
                  ></div>
                  
                  <div className="p-3 pt-4">
                    {/* Post header with emoji and time */}
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${post.color}20` }}
                      >
                        <span role="img" aria-label="mood" className="text-lg">{post.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-xs font-medium capitalize"
                            style={{ color: post.color }}
                          >
                            Feeling {post.mood}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(post.timePosted), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post content with improved contrast */}
                    <div className="text-sm text-gray-800 whitespace-pre-wrap mb-2 leading-relaxed">
                      {post.content}
                    </div>
                    
                    {/* Like button instead of support */}
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-rose-600 transition-colors mt-1 p-1 rounded-full hover:bg-rose-50"
                    >
                      <Heart
                        className={`h-4 w-4 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`}
                        fill={post.liked ? 'currentColor' : 'none'}
                      />
                      <span>{post.likes ? post.likes : "Like"}</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                {searchQuery ? (
                  <Frown className="h-8 w-8 text-indigo-400" />
                ) : (
                  <MessageCircle className="h-8 w-8 text-indigo-400" />
                )}
              </div>
              <h3 className="font-medium text-gray-700">{searchQuery ? "No matching posts found" : "No posts yet"}</h3>
              <p className="text-sm text-gray-500 text-center mt-1 mb-4">
                {searchQuery 
                  ? "Try a different search term" 
                  : "Be the first to share something with the community!"
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  textareaRef.current?.focus();
                  setIsExpanded(true);
                }}
                className="rounded-full bg-indigo-50 text-indigo-600 border-indigo-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Create First Post</span>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Style */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(5px, -5px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(-100vh); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          overflow: hidden;
        }
        
        .confetti-container::before {
          content: "";
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 230%;
          height: 200px;
          background-image: 
            radial-gradient(circle, #FF9F5A 2px, transparent 2px),
            radial-gradient(circle, #8A6FE8 3px, transparent 3px),
            radial-gradient(circle, #4AD295 2px, transparent 2px),
            radial-gradient(circle, #F355A0 3px, transparent 3px),
            radial-gradient(circle, #5AA9FF 2px, transparent 2px),
            radial-gradient(circle, #FFC837 3px, transparent 3px);
          background-size: 
            5% 5%, 7% 7%, 5% 5%, 7% 7%, 5% 5%, 7% 7%;
          animation: confetti 2s ease-out forwards;
        }

        /* Improve text selection highlighting */
        ::selection {
          background-color: rgba(99, 102, 241, 0.2); /* light indigo */
          color: #4338ca; /* indigo-700 */
        }
        
        /* Make sure input text is visible */
        input, textarea {
          color: #1f2937 !important; /* gray-800 */
        }
        
        /* Fix placeholder color */
        input::placeholder, textarea::placeholder {
          color: #9ca3af !important; /* gray-400 */
          opacity: 1;
        }

        /* Improve text contrast */
        textarea::placeholder {
          color: #6b7280 !important; /* gray-500 for better contrast */
          opacity: 1;
        }
        
        /* Ensure textarea text is visible */
        textarea {
          color: #1f2937 !important; /* gray-800 */
          background-color: white !important;
        }
      `}</style>
    </div>
  );
}