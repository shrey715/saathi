"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Sun, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import router from 'next/router';

// Define the UserType interface
interface UserType {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  dob?: string;
  age?: number | null;
  journalCount?: number;
  joinDate?: Date | null;
  created_at?: string;
  createdAt?: string;
  journals?: any[];
}

const HomePage = () => {
  const [currentDay, setCurrentDay] = useState(7);
  const [totalDays, setTotalDays] = useState(30);
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication before fetching user details
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        router.push('/login');
        return;
      }

      // If token exists, proceed with fetching user details
      const userDetails = await fetchUserDetails();
      console.log('User details:', userDetails);
      if (userDetails) {
        setUser(userDetails);
      } else {
        // If user details fetch fails, it might be due to an invalid token
        console.log('Failed to fetch user details, redirecting to login');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
  if (!user) {
    // Loading state while checking authentication
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading ...</p>
      </div>
    );

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 overflow-hidden font-sans">
      <MobileHeader />

      {/* Hero section with vibrant gradient and sunshine effect */}
      <div className="bg-gradient-to-br from-indigo-300 via-purple-200 to-pink-200 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-300 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 rounded-full opacity-50 blur-3xl"></div>
        <MobileHero user={user} />
      </div>

      {/* Journey Path section - redesigned for mobile */}
      <JourneyPath currentDay={currentDay} totalDays={totalDays} />

      <MobileFeatures />
    </div>
  );
};

// Vibrant colors palette
const vibrantColors = {
  sunny: "#FFD700",      // Bright sunshine yellow
  coral: "#FF6B6B",      // Cheerful coral red
  emerald: "#2ECC71",    // Fresh emerald green
  ocean: "#3498DB",      // Bright ocean blue
  lavender: "#9B59B6",   // Happy lavender purple
  tangerine: "#F39C12",  // Fun tangerine orange
};

// Enhanced emojis and motivational phrases
const dayEmojis = ["🌈", "⭐", "🌟", "✨", "🌻", "🦋", "🎈", "🎯", "🚀", "💫", "🍀", "🌞"];
const motivationalPhrases = [
  "You're awesome!",
  "Keep shining!",
  "Great job!",
  "You rock!",
  "Fantastic!",
  "Superstar!",
  "Keep going!",
  "You got this!",
  "Woo-hoo!",
  "Brilliant!",
  "Epic progress!",
  "Unstoppable!"
];

const calculateAge = (dob?: string): number | null => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// User details fetching function that follows the same pattern as fetchJournals
const fetchUserDetails = async (): Promise<UserType | null> => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('Authentication token not found');
      return null;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/get-user-details';
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch user details');
    }

    // If we have valid user data
    if (data) {
      // Transform the data based on your backend response
      const enhancedUserData: UserType = {
        ...data,
        // Use username as display name
        name: data.username,
        // Calculate age from DOB if available
        age: data.dob ? calculateAge(data.dob) : null,
        // Count journal entries if available
        journalCount: Array.isArray(data.journals) ? data.journals.length : 0,
        // MongoDB typically uses createdAt or created_at
        joinDate: data.created_at || data.createdAt ? new Date(data.created_at || data.createdAt) : null,
      };
      return enhancedUserData;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Fetch user details error:', err);
    return null;
  }
};


// Mental health facts - keeping this for content
const mentalHealthFacts = [
  {
    fact: "Regular meditation can reduce anxiety by up to 39%.",
    source: "JAMA Internal Medicine",
    icon: "🧘‍♀️"
  },
  {
    fact: "Just 30 minutes of physical activity can improve your mood for up to 12 hours.",
    source: "American Psychological Association",
    icon: "🏃‍♂️"
  },
  {
    fact: "Keeping a gratitude journal can increase happiness by 25%.",
    source: "Harvard Health",
    icon: "📝"
  },
  {
    fact: "Deep breathing can reduce stress hormones in the blood within minutes.",
    source: "Mayo Clinic",
    icon: "😌"
  },
  {
    fact: "Getting 7-9 hours of sleep improves mental performance by 35%.",
    source: "Sleep Foundation",
    icon: "😴"
  },
  {
    fact: "Social connections can improve your chances of longevity by 50%.",
    source: "National Institute on Aging",
    icon: "👥"
  },
  {
    fact: "Spending just 20 minutes in nature decreases stress hormone levels.",
    source: "Frontiers in Psychology",
    icon: "🌳"
  },
  {
    fact: "Mindfulness practice can actually change the structure of your brain.",
    source: "Harvard Neuroscience",
    icon: "🧠"
  }
];

// New mobile-optimized Journey Path Component with vibrant design
const JourneyPath = ({ currentDay, totalDays }) => {
  const [currentFact, setCurrentFact] = useState(0);
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Activity types that repeat through days with vibrant colors
  const activities = [
    { type: "meditation", emoji: "🧘", color: vibrantColors.lavender, name: "Meditation", accent: "🌌" },
    { type: "journal", emoji: "📝", color: vibrantColors.ocean, name: "Journaling", accent: "🖋️" },
    { type: "exercise", emoji: "🏃", color: vibrantColors.emerald, name: "Exercise", accent: "💪" },
    { type: "mood", emoji: "😊", color: vibrantColors.sunny, name: "Mood Check", accent: "🌞" },
    { type: "gratitude", emoji: "🙏", color: vibrantColors.coral, name: "Gratitude", accent: "💖" },
    { type: "mindfulness", emoji: "🧠", color: vibrantColors.tangerine, name: "Mindfulness", accent: "🕊️" },
    { type: "music", emoji: "🎵", color: vibrantColors.sunny, name: "Music", accent: "🎶" },
  ];

  // Generate all days data with enhanced properties
  const generateDays = () => {
    return Array.from({ length: totalDays }, (_, i) => {
      const activity = activities[i % activities.length];
      const dayNumber = i + 1;
      const completed = dayNumber <= currentDay;
      const isCurrent = dayNumber === currentDay;
      const isSpecial = dayNumber % 5 === 0; // Every 5th day is a milestone
      const emoji = dayEmojis[i % dayEmojis.length];
      const phrase = motivationalPhrases[i % motivationalPhrases.length];

      return {
        day: dayNumber,
        completed,
        isCurrent,
        isSpecial,
        activity,
        emoji,
        phrase,
        waveFactor: Math.sin(dayNumber * 0.5) * 10, // Creates a wavy pattern
      };
    });
  };

  const days = generateDays();

  // Rotate through emoji and motivational phrases
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % dayEmojis.length);
      setCurrentPhrase((prev) => (prev + 1) % motivationalPhrases.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to center the current day when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentDayElement = container.querySelector('.current-day');

      if (currentDayElement) {
        const containerWidth = container.clientWidth;
        const elementLeft = (currentDayElement as HTMLElement).offsetLeft;
        const elementWidth = (currentDayElement as HTMLElement).clientWidth;

        // Center the element in the container
        const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [currentDay]);

  {/* Change wellness tip every 2-3 seconds */ }
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % mentalHealthFacts.length);
    }, 4000); // Change tip every 2.5 seconds

    return () => clearInterval(tipTimer);
  }, []);

  // Get visible days for the UI (current day +/- 2)
  const getVisibleDays = () => {
    const startIdx = Math.max(0, currentDay - 3);
    const endIdx = Math.min(totalDays - 1, currentDay + 2);
    return days.slice(startIdx, endIdx + 1);
  };

  const visibleDays = getVisibleDays();
  const currentFocus = currentDay - Math.max(0, currentDay - 3) - 1;

  // Function to get appropriate star emoji for the day
  const getStarEmoji = (day) => {
    if (day % 10 === 0) return "🌟"; // Major milestone
    if (day % 5 === 0) return "⭐"; // Mini milestone
    if (day % 3 === 0) return "✨"; // Special day
    return ""; // Regular day
  };

  return (
    <div className="py-8 px-4">
      <motion.h2
        className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Journey {dayEmojis[currentEmoji]}
      </motion.h2>

      {/* Current Day Celebration Card */}
      <motion.div
        className="bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 rounded-xl p-5 shadow-lg mb-8 border-2 border-purple-200 relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 h-24 w-24 opacity-10">
          <Sun className="w-full h-full text-purple-400" />
        </div>
        <div className="absolute bottom-0 left-0 h-16 w-16 opacity-10">
          <Star className="w-full h-full text-blue-400" />
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-xl font-bold text-indigo-600 flex items-center">
              Day {currentDay} <span className="ml-2 text-2xl">{days[currentDay - 1].emoji}</span>
            </h3>
            <motion.p
              className="text-sm text-purple-600 font-medium"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {motivationalPhrases[currentPhrase]}
            </motion.p>
          </div>
          <motion.div
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center relative">
              <div className="text-3xl font-bold">{currentDay}</div>
              <div className="text-xs uppercase tracking-wider">Day</div>
              <span className="absolute -top-1 -right-1 text-lg">🏆</span>
            </div>
          </motion.div>
        </div>

        <div className="relative h-6 w-full bg-white/50 rounded-full p-1 mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 rounded-full"
            style={{ width: `${(currentDay / totalDays) * 100}%` }}
          >
            {/* Progress bar glow effect */}
            <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-pulse"></div>

            {/* Animated star at progress end */}
            <motion.div
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⭐
            </motion.div>
          </div>
        </div>

        <div className="flex justify-between text-xs font-medium">
          <span className="text-indigo-600">Streak: {currentDay} days</span>
          <span className="text-purple-600">{totalDays - currentDay} days to go!</span>
        </div>
      </motion.div>

      {/* Daily Activity Card - Vibrant version */}
      <motion.div
        className="bg-white rounded-xl p-5 shadow-lg mb-8 border-2 border-teal-100 relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{
          background: `radial-gradient(circle at top right, ${days[currentDay - 1].activity.color}15, white)`
        }}
      >
        <div className="absolute top-2 right-2 text-xl opacity-50">{days[currentDay - 1].activity.accent}</div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-teal-100 to-transparent opacity-40 blur-xl"></div>

        <h3 className="text-lg font-bold text-teal-700 mb-4 flex items-center">
          <span className="mr-2">Today's Magic</span>
          <motion.span
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
          >
            ✨
          </motion.span>
        </h3>

        <div className="flex items-center gap-4">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md"
            style={{ backgroundColor: `${days[currentDay - 1].activity.color}30` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {days[currentDay - 1].activity.emoji}
          </motion.div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-lg">{days[currentDay - 1].activity.name}</h4>
            <p className="text-sm text-gray-600">
              Brighten your day with a {days[currentDay - 1].activity.name.toLowerCase()} session. You'll feel amazing!
            </p>
          </div>
        </div>

        <motion.button
          className="mt-4 w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-lg text-center shadow-md relative overflow-hidden group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (days[currentDay - 1].activity.name.toLowerCase() === 'music') {
              console.log('Redirecting to music page');
              window.location.href = '/music';
            }
          }}
        >
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="flex items-center justify-center">
            Start Magic <span className="ml-2">✨</span>
          </span>
        </motion.button>
      </motion.div>

      {/* Day path visualization - Redesigned with wavy banners */}
      <div className="mb-12 mt-10">
        <h3 className="text-lg font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-transparent bg-clip-text">Your wellness trail</h3>

        <div className="relative">
          {/* Left shadow indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>

          {/* Right shadow indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-10 pt-6 hide-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Path connecting line - wavy pattern */}
            <svg className="absolute top-[72px] left-0 w-full h-4 z-0" width="100%" height="10">
              <path
                d="M0,5 Q30,12 60,5 T120,5 T180,5 T240,5 T300,5 T360,5 T420,5"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1 2"
                strokeDashoffset="0"
                strokeOpacity="0.5"
                style={{
                  animation: "dash 20s linear infinite",
                }}
              />
            </svg>

            {/* All days with wavy flag design */}
            <div className="flex space-x-1 px-10 relative">
              {days.map((day, index) => {
                // Determine colors based on completion and status
                const flagColor = day.completed
                  ? day.activity.color
                  : day.isCurrent
                    ? vibrantColors.sunny
                    : "#d1d5db"; // gray-300

                const textColor = day.completed || day.isCurrent
                  ? "text-white"
                  : "text-gray-500";

                // Generate wavy position
                const offsetY = day.waveFactor;

                return (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center z-10 ${day.isCurrent ? 'current-day' : ''}`}
                    style={{
                      marginTop: `${day.isCurrent ? -15 : offsetY}px`,
                      transition: "all 0.3s ease"
                    }}
                  >
                    {/* Flag Pole */}
                    <div
                      className={`relative w-10 mb-1 transition-all duration-300 ${day.isCurrent ? 'scale-110' : ''}`}
                      style={{ height: day.isCurrent ? '85px' : '70px' }}
                    >
                      {/* Pole */}
                      <div
                        className={`absolute left-1/2 bottom-0 w-1.5 rounded-full -translate-x-1/2 ${day.completed ? 'bg-gradient-to-b from-yellow-600 to-yellow-400' : 'bg-gray-300'
                          }`}
                        style={{ height: day.isCurrent ? '85px' : '70px' }}
                      ></div>

                      {/* Flag - Wavy design */}
                      <motion.div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-14 overflow-visible"
                        whileHover={{ scale: 1.1 }}
                        style={{ perspective: '600px' }}
                      >
                        {/* Wavy flag background with gradient */}
                        <svg width="40" height="50" viewBox="0 0 40 50" className="drop-shadow-md">
                          <path
                            d="M1,5 Q10,2 20,5 T40,5 V25 Q30,22 20,25 T1,25 Z"
                            fill={`url(#gradient-${day.day})`}
                            stroke={day.completed ? "white" : "#d1d5db"}
                            strokeWidth="1"
                            className="transition-all duration-300"
                          >
                            {/* Wave animation for current day */}
                            {day.isCurrent && (
                              <animate
                                attributeName="d"
                                dur="3s"
                                repeatCount="indefinite"
                                values="
                                  M1,5 Q10,2 20,5 T40,5 V25 Q30,22 20,25 T1,25 Z;
                                  M1,5 Q10,8 20,5 T40,5 V25 Q30,28 20,25 T1,25 Z;
                                  M1,5 Q10,2 20,5 T40,5 V25 Q30,22 20,25 T1,25 Z"
                              />
                            )}
                          </path>
                          <defs>
                            <linearGradient id={`gradient-${day.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={flagColor} />
                              <stop offset="100%" stopColor={`${flagColor}CC`} />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Flag content */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center flex-col ${textColor}`}
                          style={{ top: '0px' }} // Changed from 2px to 0px to move numbers up
                        >
                          <span className="font-bold text-sm">{day.day}</span>
                          <span className="text-xs">{day.emoji}</span>
                        </div>
                      </motion.div>

                      {/* Star for special days or milestones */}
                      {(day.isSpecial || day.isCurrent) && (
                        <motion.div
                          className="absolute -top-3 -right-3"
                          animate={day.isCurrent ? { rotate: [0, 20, 0, -20, 0] } : {}}
                          transition={day.isCurrent ? { duration: 2, repeat: Infinity } : {}}
                        >
                          <span className="text-lg">{getStarEmoji(day.day)}</span>
                        </motion.div>
                      )}

                      {/* Bottom emoji */}
                      <motion.div
                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-full rounded-full w-6 h-6 flex items-center justify-center ${day.completed || day.isCurrent ? 'opacity-100' : 'opacity-40'
                          }`}
                        whileHover={{
                          scale: 1.1,
                          rotate: 10,
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {day.emoji}
                      </motion.div>
                    </div>

                    {/* Day label */}
                    <span className={`text-xs mt-1 font-medium ${day.isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                      Day {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation indicators
            <div className="absolute inset-y-0 left-0 flex items-center">
            <button 
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600"
              onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: -100, behavior: 'smooth' });
              }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center">
            <button 
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600"
              onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: 100, behavior: 'smooth' });
              }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            </div> */}
        </div>
      </div>

      {/* Mental Health Tip Card with improved transitions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm mb-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-start space-x-3"
          >
            <div className="text-3xl">{mentalHealthFacts[currentFact].icon}</div>
            <div>
              <h3 className="text-lg font-bold text-indigo-700 mb-2">Wellness Tip</h3>
              <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                {mentalHealthFacts[currentFact].fact}
              </p>
              <div className="text-xs text-gray-500">
                Source: {mentalHealthFacts[currentFact].source}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tip indicator dots */}
        <div className="flex justify-center mt-4">
          {mentalHealthFacts.map((_, index) => (
            <motion.div
              key={index}
              className={`w-1.5 h-1.5 rounded-full mx-0.5`}
              initial={false}
              animate={{
                backgroundColor: index === currentFact ? '#6366f1' : '#d1d5db',
                scale: index === currentFact ? 1.2 : 1
              }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

// Mobile Header component with profile dropdown
const MobileHeader = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user details on component mount
  useEffect(() => {
    const getUserInfo = async () => {
      const userDetails = await fetchUserDetails();
      if (userDetails) {
        setUser(userDetails);
      }
    };

    getUserInfo();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "US";

    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }

    return nameParts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">S</div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 inline-block text-transparent bg-clip-text">Saathi</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 flex items-center justify-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User profile with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium hover:bg-indigo-200 transition-colors"
          >
            {getUserInitials()}
          </button>

          {/* Profile dropdown */}
          {isDropdownOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* User info section */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
              </div>

              {/* Menu items - removed Account and Preferences, kept only Profile Settings */}
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
                Profile Settings
              </a>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  window.location.href = '/login';
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

// Mobile Hero component
const MobileHero = ({ user }: { user: UserType | null }) => {
  // Handle cases where user data might not be available yet
  const displayName = user?.username || "Friend";

  return (
    <div className="text-center relative z-10 p-4 rounded-2xl overflow-hidden">
      {/* Enhanced background with multiple layers and better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-300/70 via-emerald-300/70 to-teal-300/70 opacity-80 rounded-xl"></div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-400 rounded-full opacity-20 blur-2xl"></div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:12px_12px]"></div>

      {/* Content with improved contrast */}
      <motion.h1
        className="text-3xl font-bold mb-3 bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-700 text-transparent bg-clip-text relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome Back, {displayName}!
      </motion.h1>

      <motion.p
        className="text-sm text-teal-900 mb-6 max-w-xs mx-auto font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Continue your wellness journey and reach new milestones today.
      </motion.p>

      {/* Glowing accent border */}
      <div className="absolute inset-x-4 bottom-0 h-1 bg-gradient-to-r from-teal-500/50 via-emerald-500/50 to-teal-500/50 rounded-full blur-sm"></div>
    </div>
  );
};

// Mobile Features component
const MobileFeatures = () => {
  const router = useRouter();
  return (
    <section className="px-4 py-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      <div className="flex justify-center mb-8">
        <button
          className="text-xl font-bold text-center text-indigo-700 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          onClick={() => router.push('/explore')}
        >
          Explore More
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: "Meditate",
            description: "Find your inner peace",
            icon: "🧘‍♀️",
            color: "from-teal-400 to-teal-600"
          },
          {
            title: "Journal",
            description: "Express your thoughts",
            icon: "📝",
            color: "from-emerald-400 to-emerald-600"
          },
          {
            title: "Community",
            description: "Connect with others",
            icon: "👋",
            color: "from-blue-400 to-blue-600"
          },
          {
            title: "Exercises",
            description: "Move your body",
            icon: "🏃",
            color: "from-yellow-400 to-yellow-600"
          }
        ].map((feature, index) => (
          <div key={index} className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
            <div className="text-2xl mb-2 bg-white/30 w-10 h-10 rounded-full flex items-center justify-center">
              {feature.icon}
            </div>
            <h3 className="text-base font-semibold mb-1 text-white">{feature.title}</h3>
            <p className="text-xs text-white/80">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomePage;