"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  User,
  Plus,
  Search,
  X,
  Users,
  SendHorizonal,
  Frown,
  Heart,
  Loader2,
  EyeOff,
  VenetianMask
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { communityApi, ApiError } from "@/lib/api";
import { getMoodIcon, getMoodTone } from "@/lib/mood-icons";
import { toneClasses } from "@/lib/mood-tone";

// Add these models for typing
type Post = {
  id: string;
  content: string;
  timePosted: string | Date;
  color: string;
  emoji: string;
  mood: string;
  // Null when the author posted anonymously and this isn't the viewer's
  // own post — the server never sends the real username in that case.
  username: string | null;
  is_anonymous: boolean;
  likes: number;
  liked: boolean;
};

// Mood options for new posts — emoji/color here are still sent to the API
// as the post's stored tag (unchanged storage format), but the UI renders
// getMoodIcon(mood)/getMoodTone(mood) instead of these raw values.
const moodOptions = [
  { name: "Happy", emoji: "😊", color: "#4AD295" },
  { name: "Peaceful", emoji: "✨", color: "#8A6FE8" },
  { name: "Proud", emoji: "🎉", color: "#FF9F5A" },
  { name: "Reflective", emoji: "🧠", color: "#F355A0" },
  { name: "Tired", emoji: "😴", color: "#5AA9FF" },
  { name: "Anxious", emoji: "😰", color: "#FFC837" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState(moodOptions[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const { isLoading } = useAuthGuard();

  // Fetch posts once authenticated
  useEffect(() => {
    if (isLoading) return;

    communityApi
      .list()
      .then(setPosts)
      .catch((error) => {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load community posts');
      });
  }, [isLoading]);

  const filteredPosts = posts.filter(post => {
    return searchQuery.trim() === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.mood.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      setIsSubmitting(true);

      const postData = {
        content: newPost,
        mood: selectedMood.name.toLowerCase(),
        emoji: selectedMood.emoji,
        color: selectedMood.color,
        is_anonymous: isAnonymous,
      };

      const createdPost = await communityApi.create(postData);
      setPosts(prevPosts => [createdPost, ...prevPosts]);
      setNewPost("");
      setIsAnonymous(false);
      setIsExpanded(false);
      toast.success(isAnonymous ? 'Your post has been shared anonymously!' : 'Your post has been shared!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');

      if (error instanceof ApiError && error.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const result = await communityApi.like(postId);

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

      if (error instanceof ApiError && error.status === 401) {
        router.push('/login');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading community posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 px-3 py-3 flex justify-between items-center bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl w-full mx-auto flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">
            Saathi Community
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-3">
        {/* Post creation box */}
        <div className="pt-3 pb-2">
          <Card className={`overflow-hidden p-3 transition-all duration-300 ${isExpanded ? 'shadow-neu-lg' : ''}`}>
            <div className="flex items-start">
              <div className="mr-2 mt-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <Textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onClick={() => setIsExpanded(true)}
                  className={`text-sm border-0 shadow-none resize-none p-1 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all ${isExpanded ? 'min-h-[100px]' : 'h-[40px]'}`}
                />

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pt-2 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {moodOptions.map((mood) => {
                          const MoodIcon = getMoodIcon(mood.name);
                          const tone = toneClasses(getMoodTone(mood.name));
                          const isSelected = selectedMood.name === mood.name;
                          return (
                            <button
                              key={mood.name}
                              type="button"
                              onClick={() => setSelectedMood(mood)}
                              aria-label={mood.name}
                              className={`rounded-full w-8 h-8 flex items-center justify-center transition-transform border ${tone.soft} ${tone.text} ${isSelected ? `scale-125 shadow-sm ${tone.border}` : 'border-transparent'}`}
                            >
                              <MoodIcon className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAnonymous((prev) => !prev)}
                          aria-pressed={isAnonymous}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                            isAnonymous
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {isAnonymous ? <VenetianMask className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          Anonymous
                        </button>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsExpanded(false);
                              setNewPost("");
                              setIsAnonymous(false);
                            }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleCreatePost}
                            disabled={!newPost.trim() || isSubmitting}
                            className="rounded-full"
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
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search community posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 w-full rounded-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Community Posts Feed */}
        <div className="space-y-3 pb-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const tone = toneClasses(getMoodTone(post.mood));
              const PostMoodIcon = getMoodIcon(post.mood);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.005 }}
                  className="relative"
                >
                  <Card className="overflow-hidden hover:shadow-neu-lg transition-all">
                    {/* Post mood indicator */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${tone.soft}`}></div>

                    <div className="p-3 pt-4">
                      {/* Post header with mood icon and time */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tone.soft} ${tone.text}`}>
                          <PostMoodIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium capitalize inline-flex items-center gap-1 ${tone.text}`}>
                              {post.is_anonymous && <VenetianMask className="h-3 w-3" />}
                              {post.username ?? 'Anonymous'} · Feeling {post.mood}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.timePosted), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-foreground whitespace-pre-wrap mb-2 leading-relaxed">
                        {post.content}
                      </div>

                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-mood-tender transition-colors mt-1 p-1 rounded-full hover:bg-mood-tender-soft"
                      >
                        <Heart
                          className={`h-4 w-4 ${post.liked ? 'fill-mood-tender text-mood-tender' : ''}`}
                        />
                        <span>{post.likes ? post.likes : "Like"}</span>
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                {searchQuery ? (
                  <Frown className="h-7 w-7 text-primary" />
                ) : (
                  <MessageCircle className="h-7 w-7 text-primary" />
                )}
              </div>
              <h3 className="font-medium text-foreground">{searchQuery ? "No matching posts found" : "No posts yet"}</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
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
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Create First Post</span>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
