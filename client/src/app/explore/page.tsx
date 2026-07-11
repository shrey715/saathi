"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { chatApi, exploreApi, type BookRecommendation, type ExploreContent } from "@/lib/api";
import {
  Search,
  X,
  Film,
  Library,
  PersonStanding,
  Quote,
  Lightbulb,
  Play,
  Bookmark,
  Wind,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoryIcon, getCategoryTone } from "@/lib/category-icons";
import { getExploreIcon } from "@/lib/explore-icons";
import { type MoodTone, moodMix, moodVar } from "@/lib/mood-tone";

// The backend guarantees `tone` is one of the seven MoodTone values (see
// server/explore_seed.py) — this is just a type-level acknowledgment of
// that contract at the one place each fetched item's tone gets used.
const asTone = (tone: string): MoodTone => tone as MoodTone;

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [bookRecommendations, setBookRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(true);
  const [content, setContent] = useState<ExploreContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);
  const [currentMood, setCurrentMood] = useState<string>("anxiety");
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [randomQuoteIndex, setRandomQuoteIndex] = useState(0);
  const [randomFactIndex, setRandomFactIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useAuthGuard();

  // All non-personalized explore content (yoga, breathing, quotes, facts,
  // mood-based movies) is real seeded data served from the database — see
  // server/routers/explore.py — not hardcoded in this file.
  useEffect(() => {
    if (isLoading) return;
    exploreApi
      .content()
      .then(setContent)
      .catch((error) => console.error("Error fetching explore content:", error))
      .finally(() => setIsLoadingContent(false));
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const fetchBooks = async () => {
      setIsLoadingBooks(true);
      try {
        const data = await chatApi.books();
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
  }, [searchQuery, activeCategory, isLoading]);


  // Cycle to a new random quote and fact periodically, once content has loaded
  useEffect(() => {
    if (!content) return;

    const quoteInterval = setInterval(() => {
      setRandomQuoteIndex(Math.floor(Math.random() * content.quotes.length));
    }, 40000); // Every 40 seconds

    const factInterval = setInterval(() => {
      setRandomFactIndex(Math.floor(Math.random() * content.facts.length));
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(quoteInterval);
      clearInterval(factInterval);
    };
  }, [content]);

  // Toggle bookmarked status for an item
  const toggleBookmark = (itemId: number, type: string): void => {
    const bookmarkKey = `${type}-${itemId}`;

    if (bookmarkedItems.includes(bookmarkKey)) {
      setBookmarkedItems(prev => prev.filter(item => item !== bookmarkKey));
    } else {
      setBookmarkedItems(prev => [...prev, bookmarkKey]);
    }
  };

  // Check if an item is bookmarked
  const isBookmarked = (itemId: number, type: string): boolean => {
    return bookmarkedItems.includes(`${type}-${itemId}`);
  };

  // Get filtered content based on search query
  const getFilteredContent = <T extends Record<string, any>>(content: T[], fields: string[]): T[] => {
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

  // Loading state while checking authentication or fetching seeded content
  if (isLoading || isLoadingContent || !content) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-medium">Loading ...</p>
      </div>
    );
  }

  // Filtered data based on search
  const filteredYoga = getFilteredContent(content.yoga, ['name', 'description', 'level', 'benefits']);
  const filteredBreathing = getFilteredContent(content.breathing, ['name', 'description', 'benefits']);
  const filteredBooks = getFilteredContent(bookRecommendations, ['title', 'author', 'description', 'category', 'mood']);
  const randomQuote = content.quotes[randomQuoteIndex % content.quotes.length] ?? content.quotes[0];
  const randomFact = content.facts[randomFactIndex % content.facts.length] ?? content.facts[0];

  // Get filtered movies based on current mood
  const getFilteredMovies = () => {
    let movies = content.movies[currentMood] || [];

    if (searchQuery) {
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return movies;
  };

  const filteredMovies = getFilteredMovies();
  const RandomQuoteIcon = randomQuote ? getExploreIcon(randomQuote.icon) : null;
  const RandomFactIcon = randomFact ? getExploreIcon(randomFact.icon) : null;

  return (
    <div ref={containerRef} className="min-h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 px-3 py-3 flex justify-between items-center bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">
            Explore Wellness
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto">
        {/* Search */}
        <div className="px-3 py-3 sticky top-14 z-10 bg-background/80 backdrop-blur-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              type="text"
              placeholder="Search for wellness resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-full text-foreground placeholder:text-muted-foreground text-sm bg-muted/80
                focus:ring focus:ring-primary/30 focus:ring-opacity-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-muted rounded-full p-1 hover:bg-accent"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Categories/Tabs */}
        <div className="px-3 pt-1 pb-4">
          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
            <TabsList className="w-full p-1 rounded-full bg-card  grid grid-cols-4 h-auto">
              <TabsTrigger value="all" className="rounded-full text-foreground text-xs py-1.5">All</TabsTrigger>
              <TabsTrigger value="movement" className="rounded-full text-foreground text-xs py-1.5">Movement</TabsTrigger>
              <TabsTrigger value="mind" className="rounded-full text-foreground text-xs py-1.5">Mind</TabsTrigger>
              <TabsTrigger value="media" className="rounded-full text-foreground text-xs py-1.5">Media</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content sections */}
        <div className="px-3 space-y-8">
          {/* Quote of the day */}
          {randomQuote && RandomQuoteIcon && (
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
                    backgroundColor: moodMix(asTone(randomQuote.tone), 22),
                    borderLeft: `4px solid ${moodVar(asTone(randomQuote.tone))}`,
                  }}
                >
                  <RandomQuoteIcon className="absolute top-2 right-2 h-10 w-10 opacity-20" style={{ color: moodVar(asTone(randomQuote.tone)) }} />
                  <div className="p-5">
                    <div className="flex items-start gap-2 mb-2">
                      <Quote className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                      <p className="text-foreground text-lg leading-relaxed italic font-serif">
                        "{randomQuote.quote}"
                      </p>
                    </div>
                    <p className="text-right text-muted-foreground text-sm">— {randomQuote.author}</p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Yoga Exercises - visible when on "all" or "movement" tab */}
          {(activeCategory === 'all' || activeCategory === 'movement') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground flex items-center">
                  <span className="mr-2">Yoga Practices</span>
                  <PersonStanding className="h-5 w-5 text-primary" />
                </h2>
              </div>
              <div className="flex overflow-x-auto md:flex-wrap md:overflow-visible gap-3 pb-2 hide-scrollbar">
                {filteredYoga.map(exercise => {
                  const ExerciseIcon = getExploreIcon(exercise.icon);
                  return (
                  <Card key={`yoga-${exercise.id}`} className="flex-shrink-0 bg-card w-60 overflow-hidden">
                    <div
                      className="h-24 relative flex items-center justify-center"
                      style={{ backgroundColor: moodVar(asTone(exercise.tone)) }}
                    >
                      <ExerciseIcon className="h-10 w-10 text-white" />
                      <button
                        onClick={() => toggleBookmark(exercise.id, 'yoga')}
                        className="absolute top-2 right-2 z-10 bg-card/30 backdrop-blur-sm p-1.5 rounded-full"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isBookmarked(exercise.id, 'yoga') ? 'fill-primary text-primary' : 'text-white'}`}
                        />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-foreground">{exercise.name}</h3>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-muted-foreground">{exercise.level}</span>
                        <span className="text-muted-foreground">{exercise.duration}</span>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {exercise.benefits.slice(0, 1).map((benefit, index) => (
                            <span
                              key={index}
                              className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                          {exercise.benefits.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{exercise.benefits.length - 1}</span>
                          )}
                        </div>

                        <Button size="sm" variant="ghost" className="rounded-full p-0 w-8 h-8 flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Random Wellness Fact */}
          {randomFact && RandomFactIcon && (
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
                  className="rounded-2xl overflow-hidden shadow-neu-md"
                  style={{ backgroundColor: moodMix(asTone(randomFact.tone), 18) }}
                >
                  <div className="p-4 flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: moodMix(asTone(randomFact.tone), 30), color: moodVar(asTone(randomFact.tone)) }}
                    >
                      <RandomFactIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-mood-joy" />
                        <h3 className="font-medium text-foreground text-sm">Wellness Fact</h3>
                      </div>
                      <p className="text-muted-foreground">{randomFact.fact}</p>
                      <p className="text-xs text-muted-foreground">Source: {randomFact.source}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Breathing Exercises - visible when on "all" or "mind" tab */}
          {(activeCategory === 'all' || activeCategory === 'mind') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground flex items-center">
                  <span className="mr-2">Breathing Techniques</span>
                  <Wind className="h-5 w-5 text-primary" />
                </h2>
              </div>
              <div className="space-y-3">
                {filteredBreathing.slice(0, 2).map(exercise => {
                  const ExerciseIcon = getExploreIcon(exercise.icon);
                  return (
                  <Card key={`breathing-${exercise.id}`} className="overflow-hidden">
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: moodMix(asTone(exercise.tone), 20), color: moodVar(asTone(exercise.tone)) }}
                          >
                            <ExerciseIcon className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium text-foreground">{exercise.name}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{exercise.duration}</span>
                          <button
                            onClick={() => toggleBookmark(exercise.id, 'breathing')}
                            className="flex items-center justify-center p-1 rounded-full hover:bg-muted"
                          >
                            <Bookmark
                              className={`h-4 w-4 ${isBookmarked(exercise.id, 'breathing') ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                            />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2">{exercise.description}</p>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {exercise.benefits.slice(0, 1).map((benefit, index) => (
                            <span
                              key={index}
                              className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                          {exercise.benefits.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{exercise.benefits.length - 1}</span>
                          )}
                        </div>

                        <Button size="sm" variant="ghost" className="rounded-full p-0 w-8 h-8 flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </section>
          )}


          {/* Book Recommendations - visible when on "all" or "media" tab */}
          {(activeCategory === 'all' || activeCategory === 'media') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground flex items-center">
                  <span className="mr-2">Book Recommendations</span>
                  <Library className="h-5 w-5 text-primary" />
                </h2>
              </div>

              {isLoadingBooks ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <span className="ml-3 text-primary">Loading recommendations...</span>
                </div>
              ) : bookRecommendations.length > 0 ? (
                <div className="flex overflow-x-auto md:flex-wrap md:overflow-visible gap-3 pb-2 hide-scrollbar">
                  {bookRecommendations.map(book => {
                    const bookTone = getCategoryTone(book.category);
                    const CategoryIcon = getCategoryIcon(book.category);
                    return (
                    <Card key={`book-${book.id}`} className="flex-shrink-0 w-60 overflow-hidden bg-card">
                      <div
                        className="h-24 relative flex items-center justify-center"
                        style={{ backgroundColor: moodVar(bookTone) }}
                      >
                        <CategoryIcon className="h-10 w-10 relative z-10 text-white" />
                        <button
                          onClick={() => toggleBookmark(book.id, 'book')}
                          className="absolute top-2 right-2 z-10 bg-card/30 backdrop-blur-sm p-1.5 rounded-full hover:bg-card/50 transition-colors"
                        >
                          <Bookmark
                            className={`h-4 w-4 ${isBookmarked(book.id, 'book') ? 'fill-primary text-primary' : 'text-white'}`}
                          />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-foreground">{book.title}</h3>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                        <p className="text-sm text-muted-foreground mt-2">{book.description}</p>
                      </div>
                    </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-4 text-center text-muted-foreground">
                  No book recommendations found. Try a different search.
                </div>
              )}
            </section>
          )}

          {/* Mood-based Movie Recommendations - visible when on "all" or "media" tab */}
          {(activeCategory === 'all' || activeCategory === 'media') && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground flex items-center">
                  <span className="mr-2">Movies for Your Mood</span>
                  <Film className="h-5 w-5 text-primary" />
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {Object.keys(content.movies).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setCurrentMood(mood)}
                    className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                      currentMood === mood
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <div className="flex overflow-x-auto md:flex-wrap md:overflow-visible gap-3 pb-2 hide-scrollbar">
                {filteredMovies.map(movie => {
                  const MovieIcon = getExploreIcon(movie.icon);
                  return (
                  <Card key={`movie-${movie.id}`} className="flex-shrink-0 w-60 overflow-hidden bg-card backdrop-blur-sm">
                    <div
                      className="h-24 relative flex items-center justify-center"
                      style={{ backgroundColor: moodVar(asTone(movie.tone)) }}
                    >
                      <MovieIcon className="h-10 w-10 text-white" />
                      <button
                        onClick={() => toggleBookmark(movie.id, 'movie')}
                        className="absolute top-2 right-2 z-10 bg-card/30 backdrop-blur-sm p-1.5 rounded-full"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isBookmarked(movie.id, 'movie') ? 'fill-primary text-primary' : 'text-white'}`}
                        />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-foreground">{movie.title}</h3>
                      <p className="text-xs text-muted-foreground">{movie.year}</p>
                      <p className="text-sm text-muted-foreground mt-2">{movie.description}</p>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
