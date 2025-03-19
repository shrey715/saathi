"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Save,
  Trash2,
  Plus,
  Book,
  ChevronLeft,
  PenLine,
  Search,
  Calendar,
  Bookmark,
  X,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define interfaces for our types
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  color: string;
  emoji: string;
}

interface BackgroundShape {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  // Add any other user properties you need
}

// Sample journal entries with vibrant colors
const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    title: "Morning Reflections",
    content: "Today I woke up feeling refreshed. The sunrise was beautiful and I took some time to meditate before starting my day. I'm grateful for...",
    date: new Date(2023, 10, 15),
    color: "#8A6FE8", // Purple
    emoji: "🌅"
  },
  {
    id: "2",
    title: "New Exercise Routine",
    content: "I tried a new workout today. 30 minutes of cardio followed by strength training. I feel energized and proud of myself for staying consistent this week.",
    date: new Date(2023, 10, 12),
    color: "#4AD295", // Green
    emoji: "💪"
  },
  {
    id: "3",
    title: "Goals for Next Month",
    content: "1. Read two books\n2. Practice meditation daily\n3. Start the painting project\n4. Call family more often\n5. Try a new recipe each week",
    date: new Date(2023, 10, 8),
    color: "#FF9F5A", // Orange
    emoji: "🎯"
  },
  {
    id: "4",
    title: "Feeling Grateful",
    content: "Sometimes I need to remind myself of all the things I'm grateful for:\n- My health\n- My supportive friends\n- A roof over my head\n- Access to clean water\n- The opportunity to learn and grow",
    date: new Date(2023, 10, 5),
    color: "#5AA9FF", // Blue
    emoji: "🙏"
  }
];

// Background shape generator
const generateBackgroundShapes = (color: string): BackgroundShape[] => {
  const shapes: BackgroundShape[] = [];
  for (let i = 0; i < 15; i++) {
    shapes.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      color: color || "#8A6FE8",
      opacity: Math.random() * 0.1 + 0.05,
      rotation: Math.random() * 360,
    });
  }
  return shapes;
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editableTitle, setEditableTitle] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'title'
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();


  // Check authentication before loading any data
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

        // Now that we're authenticated, fetch journal entries
        await fetchJournals(token);

        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Move journals fetching to a separate function to be called after authentication
  const fetchJournals = async (token: string) => {
    try {
      if (!token) {
        console.error('Authentication token not found');
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/get-journals';
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch journal entries');
      }

      if (data && Array.isArray(data)) {
        // Transform the entries to ensure dates are Date objects
        const journalEntries = data.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));

        setEntries(journalEntries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Fetch Journals error:', err);
    }
  };

  // Handle creating a new entry
  const createNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: "New Journal Entry",
      content: "",
      date: new Date(),
      color: ["#8A6FE8", "#4AD295", "#FF9F5A", "#5AA9FF", "#F355A0"][
        Math.floor(Math.random() * 5)
      ],
      emoji: ["📝", "✨", "🌟", "💭", "📌"][Math.floor(Math.random() * 5)]
    };
    setEntries([newEntry, ...entries]);
    setCurrentEntry(newEntry);
    setEditableTitle(newEntry.title);
    setEditableContent(newEntry.content);
    setIsEditing(true);
  };



  // // Handle creating a new entry

  // Handle opening an entry
  // Other functions remain mostly unchanged
  const openEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEditableTitle(entry.title);
    setEditableContent(entry.content);
    setIsEditing(false);
  };
  // Handle deleting an entry
  const deleteEntry = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return; // Exit if user cancels deletion

    try {
      // Get the auth token from localStorage or wherever you store it
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Authentication token not found');
        return;
      }

      console.log('Deleting journal entry:', id);
      // Match the backend API endpoint format
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/delete-journal';

      const response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: id }), // Send the journal ID in the request body
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.detail || 'Failed to delete journal entry');
      }

      // Update state after successful deletion
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      if (currentEntry && currentEntry.id === id) {
        setCurrentEntry(null);
      }

      console.log('Journal entry deleted successfully');
    } catch (err) {
      console.error('Delete Journal error:', err);
    }
  };

  // Handle saving edits
  const saveChanges = async (e: React.MouseEvent) => {
    if (!currentEntry) return;

    const updatedEntries = entries.map(entry =>
      entry.id === currentEntry.id
        ? {
          ...entry,
          title: editableTitle,
          content: editableContent,
          date: new Date()
        }
        : entry
    );
    setEntries(updatedEntries);
    setCurrentEntry({ ...currentEntry, title: editableTitle, content: editableContent, date: new Date() });
    setIsEditing(false);

    try {
      // Create journal entry object to send to backend
      const newEntry: JournalEntry = {
        id: currentEntry.id,
        title: editableTitle,
        content: editableContent,
        date: new Date(),
        color: currentEntry.color,
        emoji: currentEntry.emoji
      };

      // Get the auth token from localStorage or wherever you store it
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Authentication token not found');
        // Handle unauthenticated state - maybe redirect to login
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/add-journal';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the authorization header
        },
        body: JSON.stringify(newEntry), // Send the actual entry data
        credentials: 'include' // Include cookies if you're using cookie-based auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save journal entry');
      }

      // Show success notification or feedback to user
      console.log('Journal entry saved successfully');
    } catch (err) {
      console.error('Add Journal error:', err);
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(lowerCaseQuery) ||
      entry.content.toLowerCase().includes(lowerCaseQuery)
    );
  });

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading your journal...</p>
      </div>
    );
  }


  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-white text-foreground relative min-h-screen"
    >
      {/* Header */}
      <header className="sticky top-0 z-20 px-3 py-3 flex justify-between items-center bg-white/70 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          {currentEntry ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentEntry(null)}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full p-1"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          ) : (
            <Book className="h-5 w-5 text-indigo-600" />
          )}

          <h1 className="text-lg font-bold text-indigo-700">
            {currentEntry ? (isEditing ? "Edit Entry" : currentEntry.title) : "My Journal"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {currentEntry && (
            <>
              {isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveChanges}
                  className="rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Save className="h-5 w-5 mr-1" />
                  <span className="text-sm">Save</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <Pencil className="h-5 w-5 mr-1" />
                  <span className="text-sm">Edit</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteEntry(currentEntry.id)}
                className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 ml-1"
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto hide-scrollbar p-2">
        {currentEntry ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`entry-${currentEntry.id}-${isEditing ? 'edit' : 'view'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col p-2"
            >
              <Card
                className={cn(
                  "mb-3 overflow-hidden border-0 shadow-md",
                  isEditing ? "bg-white" : "bg-white/80 backdrop-blur-md"
                )}
              >
                {/* Entry Header */}
                <div
                  className="py-3 px-4 flex items-center gap-3"
                  style={{
                    backgroundColor: `${currentEntry.color}20`,
                    borderBottom: `2px solid ${currentEntry.color}40`
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm"
                    style={{ backgroundColor: currentEntry.color }}
                  >
                    {currentEntry.emoji || "📝"}
                  </div>

                  {isEditing ? (
                    <Input
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      placeholder="Entry Title"
                      className="flex-1 border-0 bg-transparent text-lg font-medium focus-visible:ring-0 p-0"
                      style={{ color: currentEntry.color }}
                    />
                  ) : (
                    <h2
                      className="text-lg font-medium flex-1"
                      style={{ color: currentEntry.color }}
                    >
                      {currentEntry.title}
                    </h2>
                  )}

                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(currentEntry.date), 'PPP')}
                  </div>
                </div>

                {/* Entry Content */}
                <div className="p-4">
                  {isEditing ? (
                    <Textarea
                      ref={textareaRef}
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      placeholder="Write your thoughts here..."
                      className="min-h-[300px] border-0 focus-visible:ring-1 focus-visible:ring-gray-200 p-2 text-gray-800 leading-relaxed"
                      style={{ resize: "none", height: "calc(100vh - 280px)" }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                      {currentEntry.content || (
                        <p className="text-gray-400 italic">No content yet. Click edit to start writing.</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col p-2">
            {/* Search and Sort Bar - Fixed text color and highlight styles */}
            <div className="mb-3 flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-full border-gray-200 text-gray-800 placeholder:text-gray-400 
                  focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-30"
                  style={{
                    caretColor: "#6366F1" // Indigo cursor color
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5"
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "date" ? "title" : "date")}
                className="rounded-full border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"
              >
                {sortBy === "date" ? (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Date</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span className="text-xs">Title</span>
                  </>
                )}
              </Button>
            </div>

            {/* Journal Entries List */}
            <div className="grid gap-3 grid-cols-1">
              {sortedEntries.length > 0 ? (
                sortedEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card
                      className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white/90 backdrop-blur-sm"
                      onClick={() => openEntry(entry)}
                    >
                      <div className="flex p-3 items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-sm"
                          style={{ backgroundColor: entry.color }}
                        >
                          {entry.emoji || "📝"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3
                              className="font-medium text-gray-800 mb-1 truncate"
                              style={{ color: entry.color }}
                            >
                              {entry.title}
                            </h3>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                              {format(new Date(entry.date), 'MMM d')}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {entry.content || "No content"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                    <Smile className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="font-medium text-gray-700 mb-1">No entries found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first journal entry to get started"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewEntry}
                    className="rounded-full border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  >
                    <PenLine className="h-4 w-4 mr-1" />
                    <span>Start Writing</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Fixed Action Button */}
            <Button
              variant="default"
              size="icon"
              onClick={createNewEntry}
              className="fixed bottom-24 right-4 rounded-full w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </main>

      {/* Style */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
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
        
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 1rem);
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
      `}</style>
    </div>
  );
}
