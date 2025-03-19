"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Filter,
  BookOpen,
  Film,
  Dumbbell,
  Wind,
  Quote,
  Lightbulb,
  Heart,
  ChevronRight,
  Play,
  Bookmark,
  Check,
  Calendar,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Sample data for yoga exercises
const yogaExercises = [
  {
    id: 1,
    name: "Mountain Pose (Tadasana)",
    description: "A foundational standing pose that improves posture, balance, and calm focus.",
    duration: "5 min",
    level: "Beginner",
    benefits: ["Improves posture", "Reduces anxiety", "Increases body awareness"],
    image: "/yoga/mountain-pose.jpg",
    color: "#8A6FE8", // Purple
    emoji: "🧘‍♀️"
  },
  {
    id: 2,
    name: "Child's Pose (Balasana)",
    description: "A restful pose that gently stretches the hips, thighs, and ankles while calming the mind.",
    duration: "3 min",
    level: "Beginner",
    benefits: ["Relieves stress", "Calms the nervous system", "Stretches the back"],
    image: "/yoga/childs-pose.jpg",
    color: "#4AD295", // Green
    emoji: "🧘"
  },
  {
    id: 3,
    name: "Downward-Facing Dog (Adho Mukha Svanasana)",
    description: "An energizing pose that stretches and strengthens the whole body.",
    duration: "5 min",
    level: "Intermediate",
    benefits: ["Strengthens arms and legs", "Stretches shoulders and hamstrings", "Increases energy"],
    image: "/yoga/downward-dog.jpg",
    color: "#FF9F5A", // Orange
    emoji: "🐕"
  },
  {
    id: 4,
    name: "Corpse Pose (Savasana)",
    description: "A rejuvenating pose of complete relaxation to integrate the benefits of practice.",
    duration: "10 min",
    level: "Beginner",
    benefits: ["Deep relaxation", "Reduces blood pressure", "Calms the mind"],
    image: "/yoga/corpse-pose.jpg",
    color: "#5AA9FF", // Blue
    emoji: "😌"
  },
];

// Sample data for breathing exercises
const breathingExercises = [
  {
    id: 1,
    name: "Box Breathing",
    description: "Inhale, hold, exhale, and hold again for equal counts to reduce stress and improve focus.",
    duration: "5 min",
    steps: [
      "Inhale through nose for 4 counts",
      "Hold breath for 4 counts",
      "Exhale through mouth for 4 counts",
      "Hold breath for 4 counts",
      "Repeat cycle"
    ],
    benefits: ["Reduces stress", "Improves concentration", "Manages anxiety"],
    color: "#4AD295", // Green
    emoji: "🧠"
  },
  {
    id: 2,
    name: "4-7-8 Breathing",
    description: "A relaxing breath pattern that acts as a natural tranquilizer for the nervous system.",
    duration: "3 min",
    steps: [
      "Inhale quietly through nose for 4 counts",
      "Hold breath for 7 counts",
      "Exhale completely through mouth for 8 counts",
      "Repeat cycle 3-4 times"
    ],
    benefits: ["Reduces anxiety", "Helps with sleep", "Manages cravings"],
    color: "#8A6FE8", // Purple
    emoji: "😴"
  },
  {
    id: 3,
    name: "Alternate Nostril Breathing",
    description: "Balances the left and right hemispheres of the brain for improved well-being.",
    duration: "7 min",
    steps: [
      "Close right nostril, inhale through left",
      "Close left nostril, exhale through right",
      "Inhale through right nostril",
      "Close right, exhale through left",
      "Continue alternating"
    ],
    benefits: ["Balances nervous system", "Enhances mental clarity", "Reduces stress"],
    color: "#FF9F5A", // Orange
    emoji: "👃"
  }
];

// Sample data for book recommendations
// const bookRecommendations = [
//   {
//     id: 1,
//     title: "Atomic Habits",
//     author: "James Clear",
//     description: "Tiny changes, remarkable results. Learn how small habits lead to big transformations.",
//     category: "Personal Development",
//     mood: ["growth", "motivation"],
//     image: "/books/atomic-habits.jpg",
//     color: "#5AA9FF", // Blue
//     emoji: "📊"
//   },
//   {
//     id: 2,
//     title: "The Comfort Book",
//     author: "Matt Haig",
//     description: "A collection of consolations and stories to give hope through difficult times.",
//     category: "Mental Wellness",
//     mood: ["comfort", "healing"],
//     image: "/books/comfort-book.jpg",
//     color: "#4AD295", // Green
//     emoji: "☕"
//   },
//   {
//     id: 3,
//     title: "The Subtle Art of Not Giving a F*ck",
//     author: "Mark Manson",
//     description: "A counterintuitive approach to living a good life by focusing on what truly matters.",
//     category: "Self-Help",
//     mood: ["perspective", "clarity"],
//     image: "/books/subtle-art.jpg",
//     color: "#FF9F5A", // Orange
//     emoji: "🤔"
//   },
//   {
//     id: 4,
//     title: "Why Has Nobody Told Me This Before?",
//     author: "Dr. Julie Smith",
//     description: "A toolkit of simple strategies for managing anxiety, low mood, and other common mental health issues.",
//     category: "Psychology",
//     mood: ["understanding", "anxiety", "depression"],
//     image: "/books/why-has-nobody.jpg",
//     color: "#8A6FE8", // Purple
//     emoji: "💡"
//   }
// ];

// Sample data for inspiring quotes
const inspiringQuotes = [
  {
    id: 1,
    quote: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    theme: "Progress",
    color: "#4AD295", // Green
    emoji: "🪜"
  },
  {
    id: 2,
    quote: "The most beautiful things in the world cannot be seen or even touched, they must be felt with the heart.",
    author: "Helen Keller",
    theme: "Beauty",
    color: "#F355A0", // Pink
    emoji: "💖"
  },
  {
    id: 3,
    quote: "It is never too late to be what you might have been.",
    author: "George Eliot",
    theme: "Possibility",
    color: "#5AA9FF", // Blue
    emoji: "✨"
  },
  {
    id: 4,
    quote: "The way I see it, if you want the rainbow, you gotta put up with the rain.",
    author: "Dolly Parton",
    theme: "Resilience",
    color: "#8A6FE8", // Purple
    emoji: "🌈"
  },
  {
    id: 5,
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    theme: "Dreams",
    color: "#FF9F5A", // Orange
    emoji: "🌟"
  }
];

// Sample data for random wellness facts
const wellnessFacts = [
  {
    id: 1,
    fact: "Spending just 20 minutes in nature can significantly lower stress hormone levels.",
    source: "Frontiers in Psychology",
    category: "Nature",
    color: "#4AD295", // Green
    emoji: "🌳"
  },
  {
    id: 2,
    fact: "Hugging for 20 seconds or more releases oxytocin, which can reduce stress and create a sense of bonding.",
    source: "Journal of Psychosomatic Research",
    category: "Connection",
    color: "#F355A0", // Pink
    emoji: "🤗"
  },
  {
    id: 3,
    fact: "Singing releases endorphins, serotonin and dopamine, promoting feelings of pleasure and well-being.",
    source: "Evolution and Human Behavior",
    category: "Expression",
    color: "#FFC837", // Gold
    emoji: "🎵"
  },
  {
    id: 4,
    fact: "Keeping a gratitude journal can increase long-term well-being by more than 10%.",
    source: "Harvard Health",
    category: "Gratitude",
    color: "#5AA9FF", // Blue
    emoji: "📝"
  },
  {
    id: 5,
    fact: "Dancing combines the benefits of physical exercise with social connection and has been shown to reduce the risk of dementia by 76%.",
    source: "New England Journal of Medicine",
    category: "Movement",
    color: "#8A6FE8", // Purple
    emoji: "💃"
  }
];

// Sample data for mood-based movie recommendations
const moodMovies = {
  anxiety: [
    {
      id: 1,
      title: "Inside Out",
      description: "A heartwarming animated film that explores emotions in a thoughtful way, helping viewers understand and process their feelings.",
      year: 2015,
      genre: "Animation/Comedy",
      color: "#5AA9FF", // Blue
      emoji: "😊"
    },
    {
      id: 2,
      title: "The Secret Life of Walter Mitty",
      description: "An uplifting adventure that inspires viewers to embrace life's uncertainties and find courage.",
      year: 2013,
      genre: "Adventure/Comedy",
      color: "#4AD295", // Green
      emoji: "🌍"
    }
  ],
  sadness: [
    {
      id: 3,
      title: "Soul",
      description: "A moving exploration of what makes life worth living, perfect for finding meaning during difficult times.",
      year: 2020,
      genre: "Animation/Adventure",
      color: "#8A6FE8", // Purple
      emoji: "✨"
    },
    {
      id: 4,
      title: "Amélie",
      description: "A whimsical French film about finding joy in small things and spreading happiness to others.",
      year: 2001,
      genre: "Comedy/Romance",
      color: "#FF9F5A", // Orange
      emoji: "❤️"
    }
  ],
  stress: [
    {
      id: 5,
      title: "My Neighbor Totoro",
      description: "A gentle, comforting film with beautiful animation that provides an escape from life's pressures.",
      year: 1988,
      genre: "Animation/Fantasy",
      color: "#4AD295", // Green
      emoji: "🌿"
    },
    {
      id: 6,
      title: "The Mitchells vs. the Machines",
      description: "A fun, chaotic adventure that will have you laughing and forgetting your worries.",
      year: 2021,
      genre: "Animation/Comedy",
      color: "#F355A0", // Pink
      emoji: "🤖"
    }
  ],
  inspiration: [
    {
      id: 7,
      title: "Wonder",
      description: "An inspiring story about kindness, acceptance, and the impact we have on each other's lives.",
      year: 2017,
      genre: "Drama/Family",
      color: "#FFC837", // Gold
      emoji: "⭐"
    },
    {
      id: 8,
      title: "The Pursuit of Happyness",
      description: "Based on a true story of perseverance and determination through extreme hardship.",
      year: 2006,
      genre: "Biography/Drama",
      color: "#5AA9FF", // Blue
      emoji: "💼"
    }
  ]
};

// Background shape generator for the explore page - more subtle
const generateBackgroundShapes = () => {
  const shapes = [];
  for (let i = 0; i < 12; i++) {
    shapes.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 50 + 10,
      color: [
        "#8A6FE8", "#4AD295", "#FF9F5A", "#5AA9FF", "#F355A0", "#FFC837"
      ][Math.floor(Math.random() * 6)],
      opacity: Math.random() * 0.06 + 0.02,
      rotation: Math.random() * 360,
    });
  }
  return shapes;
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookRecommendations, setBookRecommendations] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [currentMood, setCurrentMood] = useState("anxiety");
  const [backgroundShapes, setBackgroundShapes] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [footerHeight, setFooterHeight] = useState(80);
  const [randomQuote, setRandomQuote] = useState(inspiringQuotes[0]);
  const [randomFact, setRandomFact] = useState(wellnessFacts[0]);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check authentication
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

        // If token exists, proceed with fetching user details to verify auth
        // You can reuse the fetchUserDetails function or implement a simpler check here
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/get-user-details', {
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
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoadingBooks(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No authentication token found');
          setIsLoadingBooks(false);
          return;
        }

        // Get book recommendations from the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-books`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: searchQuery,
            mood: activeCategory === 'all' ? '' : activeCategory,
            category: ''
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.statusText}`);
        }

        const data = await response.json();
        setBookRecommendations(data);
      } catch (error) {
        console.error('Error fetching book recommendations:', error);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    // Debounce the search query to avoid too many requests
    const debounceTimer = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeCategory]);

  // Calculate viewport heights
  useEffect(() => {
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

  // Generate background shapes with a subtle aesthetic
  useEffect(() => {
    setBackgroundShapes(generateBackgroundShapes());
  }, []);

  // Select a new random quote and fact periodically
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const newQuoteIndex = Math.floor(Math.random() * inspiringQuotes.length);
      setRandomQuote(inspiringQuotes[newQuoteIndex]);
    }, 40000); // Every 40 seconds

    const factInterval = setInterval(() => {
      const newFactIndex = Math.floor(Math.random() * wellnessFacts.length);
      setRandomFact(wellnessFacts[newFactIndex]);
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(quoteInterval);
      clearInterval(factInterval);
    };
  }, []);



  // Toggle bookmarked status for an item
  const toggleBookmark = (itemId, type) => {
    const bookmarkKey = `${type}-${itemId}`;

    if (bookmarkedItems.includes(bookmarkKey)) {
      setBookmarkedItems(prev => prev.filter(item => item !== bookmarkKey));
    } else {
      setBookmarkedItems(prev => [...prev, bookmarkKey]);
    }
  };

  // Check if an item is bookmarked
  const isBookmarked = (itemId, type) => {
    return bookmarkedItems.includes(`${type}-${itemId}`);
  };

  // Get filtered content based on search query
  const getFilteredContent = (content, fields) => {
    if (!searchQuery) return content;

    return content.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        } else if (Array.isArray(value)) {
          return value.some(v =>
            typeof v === 'string' && v.toLowerCase().includes(searchLower)
          );
        }
        return false;
      });
    });
  };

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading ...</p>
      </div>
    );
  }



  // Filtered data based on search
  const filteredYoga = getFilteredContent(yogaExercises, ['name', 'description', 'level', 'benefits']);
  const filteredBreathing = getFilteredContent(breathingExercises, ['name', 'description', 'benefits']);
  const filteredBooks = getFilteredContent(bookRecommendations, ['title', 'author', 'description', 'category', 'mood']);
  const filteredQuotes = getFilteredContent(inspiringQuotes, ['quote', 'author', 'theme']);

  // Get filtered movies based on current mood
  const getFilteredMovies = () => {
    let movies = moodMovies[currentMood] || [];

    if (searchQuery) {
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return movies;
  };

  const filteredMovies = getFilteredMovies();

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
              filter: 'blur(30px)',
            }}
          />
        ))}
      </div>

      {/* Overlay for readability */}
      <div className="fixed inset-0 backdrop-blur-lg bg-white/60 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 px-3 py-3 flex justify-between items-center bg-white/70 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-indigo-700">
            Explore Wellness
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto hide-scrollbar pb-24">
        {/* Search */}
        <div className="px-3 py-3 sticky top-0 z-10 bg-white/70 backdrop-blur-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
            <Input
              type="text"
              placeholder="Search for wellness resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-full border-gray-200 text-gray-800 placeholder:text-gray-400 text-sm bg-gray-50/80
                focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Categories/Tabs */}
        <div className="px-3 pt-1 pb-4">
          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
            <TabsList className="w-full p-1 rounded-full bg-white  grid grid-cols-4 h-auto">
              <TabsTrigger value="all" className="rounded-full text-black text-xs py-1.5">All</TabsTrigger>
              <TabsTrigger value="movement" className="rounded-full text-black text-xs py-1.5">Movement</TabsTrigger>
              <TabsTrigger value="mind" className="rounded-full text-black text-xs py-1.5">Mind</TabsTrigger>
              <TabsTrigger value="media" className="rounded-full text-black text-xs py-1.5">Media</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content sections */}
        <div className="px-3 space-y-8">
          {/* Quote of the day */}
          <AnimatePresence mode="wait">
            <motion.div
              key={randomQuote.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <motion.div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${randomQuote.color}40, ${randomQuote.color}15)`,
                  borderLeft: `4px solid ${randomQuote.color}`
                }}
              >
                <div className="absolute top-2 right-2 text-4xl opacity-20">{randomQuote.emoji}</div>
                <div className="p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <Quote className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 text-lg leading-relaxed italic font-serif">
                      "{randomQuote.quote}"
                    </p>
                  </div>
                  <p className="text-right text-gray-500 text-sm">— {randomQuote.author}</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Yoga Exercises - visible when on "all" or "movement" tab */}
          {(activeCategory === 'all' || activeCategory === 'movement') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="mr-2">Yoga Practices</span>
                  <span className="text-xl">🧘‍♀️</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                {filteredYoga.map(exercise => (
                  <Card key={`yoga-${exercise.id}`} className="flex-shrink-0 bg-white w-60 overflow-hidden border-0 shadow-lg">
                    <div
                      className="h-24 bg-gradient-to-r relative flex items-center justify-center"
                      style={{
                        backgroundColor: exercise.color,
                        backgroundImage: `linear-gradient(135deg, ${exercise.color}, ${exercise.color}99)`
                      }}
                    >
                      <span className="text-4xl">{exercise.emoji}</span>
                      <button
                        onClick={() => toggleBookmark(exercise.id, 'yoga')}
                        className="absolute top-2 right-2 z-10 bg-white/30 backdrop-blur-sm p-1.5 rounded-full"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isBookmarked(exercise.id, 'yoga') ? 'fill-indigo-600 text-indigo-600' : 'text-white'}`}
                        />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800">{exercise.name}</h3>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-gray-500">{exercise.level}</span>
                        <span className="text-gray-500">{exercise.duration}</span>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {exercise.benefits.slice(0, 1).map((benefit, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                          {exercise.benefits.length > 1 && (
                            <span className="text-xs text-gray-500">+{exercise.benefits.length - 1}</span>
                          )}
                        </div>

                        <Button size="sm" variant="ghost" className="rounded-full p-0 w-8 h-8 flex items-center justify-center">
                          <Play className="h-4 w-4 text-indigo-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Random Wellness Fact */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`fact-${randomFact.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <motion.div
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${randomFact.color}15, ${randomFact.color}30)`,
                  border: `1px solid ${randomFact.color}40`
                }}
              >
                <div className="p-4 flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${randomFact.color}30` }}
                  >
                    <span className="text-xl">{randomFact.emoji}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <h3 className="font-medium text-gray-700 text-sm">Wellness Fact</h3>
                    </div>
                    <p className="text-gray-600">{randomFact.fact}</p>
                    <p className="text-xs text-gray-400">Source: {randomFact.source}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Breathing Exercises - visible when on "all" or "mind" abab */}
          {(activeCategory === 'all' || activeCategory === 'mind') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="mr-2">Breathing Techniques</span>
                  <span className="text-xl">🌬️</span>
                </h2>
              </div>
              <div className="space-y-3">
                {filteredBreathing.slice(0, 2).map(exercise => (
                  <Card key={`breathing-${exercise.id}`} className="overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${exercise.color}20` }}
                          >
                            <span className="text-lg">{exercise.emoji}</span>
                          </div>
                          <h3 className="font-medium text-gray-800">{exercise.name}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{exercise.duration}</span>
                          <button
                            onClick={() => toggleBookmark(exercise.id, 'breathing')}
                            className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
                          >
                            <Bookmark
                              className={`h-4 w-4 ${isBookmarked(exercise.id, 'breathing') ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`}
                            />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {exercise.benefits.slice(0, 1).map((benefit, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                          {exercise.benefits.length > 1 && (
                            <span className="text-xs text-gray-500">+{exercise.benefits.length - 1}</span>
                          )}
                        </div>

                        <Button size="sm" variant="ghost" className="rounded-full p-0 w-8 h-8 flex items-center justify-center">
                          <Play className="h-4 w-4 text-indigo-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          
          {/* Book Recommendations - visible when on "all" or "media" tab */}
          {(activeCategory === 'all' || activeCategory === 'media') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="mr-2">Book Recommendations</span>
                  <span className="text-xl">📚</span>
                </h2>
              </div>
              
              {isLoadingBooks ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-8 h-8 border-2 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
                  <span className="ml-3 text-indigo-600">Loading recommendations...</span>
                </div>
              ) : bookRecommendations.length > 0 ? (
                <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                  {bookRecommendations.map(book => (
                    <Card key={`book-${book.id}`} className="flex-shrink-0 w-60 overflow-hidden border-0 shadow-lg bg-white">
                      <div
                        className="h-24 relative flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundColor: book.color,
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: `radial-gradient(circle at 30% 107%, ${book.color}88 0%, ${book.color}55 5%, ${book.color}aa 45%, ${book.color}66 60%, ${book.color}33 90%)`,
                            backgroundSize: '150% 150%',
                            mixBlendMode: 'soft-light',
                          }}
                        />
                        <div
                          className="absolute top-0 left-0 w-full h-full"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                            backgroundSize: '30px 30px',
                          }}
                        />
                        <span className="text-4xl relative z-10 drop-shadow-md">{book.emoji}</span>
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"
                        />
                        <button
                          onClick={() => toggleBookmark(book.id, 'book')}
                          className="absolute top-2 right-2 z-10 bg-white/30 backdrop-blur-sm p-1.5 rounded-full hover:bg-white/50 transition-colors"
                        >
                          <Bookmark
                            className={`h-4 w-4 ${isBookmarked(book.id, 'book') ? 'fill-indigo-600 text-indigo-600' : 'text-white'}`}
                          />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800">{book.title}</h3>
                        <p className="text-xs text-gray-500">{book.author}</p>
                        <p className="text-sm text-gray-600 mt-2">{book.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  No book recommendations found. Try a different search.
                </div>
              )}
            </section>
          )}

          {/* Mood-based Movie Recommendations - visible when on "all" or "media" tab */}
          {(activeCategory === 'all' || activeCategory === 'media') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="mr-2">Movies for Your Mood</span>
                  <span className="text-xl">🎬</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                {filteredMovies.map(movie => (
                  <Card key={`movie-${movie.id}`} className="flex-shrink-0 w-60 overflow-hidden border-0 shadow-lg bg-white backdrop-blur-sm ">
                    <div
                      className="h-24 bg-gradient-to-r relative flex items-center justify-center"
                      style={{
                        backgroundColor: movie.color,
                        backgroundImage: `linear-gradient(135deg, ${movie.color}33, ${movie.color}15)`
                      }}
                    >
                      <span className="text-4xl">{movie.emoji}</span>
                      <button
                        onClick={() => toggleBookmark(movie.id, 'movie')}
                        className="absolute top-2 right-2 z-10 bg-white/30 backdrop-blur-sm p-1.5 rounded-full"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isBookmarked(movie.id, 'movie') ? 'fill-indigo-600 text-indigo-600' : 'text-white'}`}
                        />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800">{movie.title}</h3>
                      <p className="text-xs text-gray-500">{movie.year}</p>
                      <p className="text-sm text-gray-600 mt-2">{movie.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}