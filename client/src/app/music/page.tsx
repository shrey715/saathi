"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle, Heart,
  Share2, ListMusic, Waves, Music2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AnimatePresence, motion } from "framer-motion";

// Music data from props or imported
const musicData = [

  {
    id: 0,
    title: "Lofi Study",
    artist: "Chill_Beats",
    cover: "none",
    coverColor: "#6ED2EE", // Light blue
    file: "/assets/stock_music/lofi-background-music-2-309039.mp3",
    duration: 98,
    category: "Focus",
    colorKey: "primary",
    emoji: "📚"
  },
  {
    id: 1,
    title: "Path to Harmony",
    artist: "Grand_Project",
    cover: "none",
    coverColor: "#8A6FE8", // Lighter purple
    file: "/assets/stock_music/path-to-harmony-313385.mp3",
    duration: 633,
    category: "Meditation",
    colorKey: "primary",
    emoji: "🧘‍♀️"
  },
  {
    id: 2,
    title: "Pure Love",
    artist: "Top-Flow",
    cover: "none",
    coverColor: "#FFA500", // Lighter orange
    file: "/assets/stock_music/pure-love-304010.mp3",
    duration: 78,
    category: "Romantic",
    colorKey: "primary",
    emoji: "❤️"
  },
  {
    id: 3,
    title: "Zen Garden",
    artist: "Grand_Project",
    cover: "none",
    coverColor: "#00BFFF", // Lighter blue
    file: "/assets/stock_music/zen-garden-310599.mp3",
    duration: 624,
    category: "Meditation",
    colorKey: "primary",
    emoji: "🌸"
  },
  {
    id: 4,
    title: "Relaxing Piano",
    artist: "Grand_Project",
    cover: "none",
    coverColor: "#FF6347", // Lighter red
    file: "/assets/stock_music/relaxing-piano-310597.mp3",
    duration: 226,
    category: "Meditation",
    colorKey: "primary",
    emoji: "🎹"
  }
];

const MusicPlayerPage = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

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

        // Verify token validity with a backend request
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
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Get current track from index
  const currentTrack = musicData[currentTrackIndex];

  // Check if current track is in favorites
  const isFavorite = favorites.includes(currentTrack.id);

  // Format time in MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // Handle playback
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(err => console.error("Playback error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    setCurrentTime(currentTime);
  }, []);

  // Also wrap changeTrack in useCallback
  const changeTrack = useCallback((direction: "next" | "prev") => {
    if (isLoading) return; // Prevent changing track while loading
    let newIndex;

    if (isShuffle) {
      // Random track
      newIndex = Math.floor(Math.random() * musicData.length);
      while (newIndex === currentTrackIndex && musicData.length > 1) {
        newIndex = Math.floor(Math.random() * musicData.length);
      }
    } else {
      // Next or previous track
      if (direction === "next") {
        newIndex = (currentTrackIndex + 1) % musicData.length;
      } else {
        newIndex = (currentTrackIndex - 1 + musicData.length) % musicData.length;
      }
    }

    setCurrentTrackIndex(newIndex);
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(err => console.error("Playback error:", err));
      }, 100);
    }
  }, [currentTrackIndex, isShuffle, isPlaying, isLoading]);

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  }

  // Add the complete toggleFavorite function
  const toggleFavorite = useCallback(() => {
    if (isLoading) return; // Prevent changes while loading

    setFavorites(prevFavorites => {
      if (prevFavorites.includes(currentTrack.id)) {
        // Remove from favorites
        return prevFavorites.filter(id => id !== currentTrack.id);
      } else {
        // Add to favorites
        return [...prevFavorites, currentTrack.id];
      }
    });
  }, [currentTrack.id, isLoading]);

  // Add the missing selectTrack function
  const selectTrack = useCallback((index: number) => {
    if (isLoading) return; // Prevent track changes while loading
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    // Start playing the selected track
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.error("Playback error:", err));
        setIsPlaying(true);
      }
    }, 100);
  }, [isLoading]);

  // Handle track end
  const handleTrackEnd = useCallback(() => {
    if (isLoading) return; // Prevent changes while loading

    if (isRepeat && audioRef.current) {
      // Repeat current track
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Playback error:", err));
    } else {
      // Play next track
      changeTrack("next");
    }
  }, [isRepeat, changeTrack, isLoading]);

  // Set up audio element - updated with proper dependencies
  useEffect(() => {
    if (isLoading) return; // Skip audio setup while loading

    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleTrackEnd);
    }

    return () => {
      // Cleanup event listeners
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [volume, handleTimeUpdate, handleTrackEnd, isLoading]);

  // Reset current time when track changes
  useEffect(() => {
    if (!isLoading) {
      setCurrentTime(0);
    }
  }, [currentTrackIndex, isLoading]);

  // Animation variants
  const coverVariants = {
    playing: {
      rotate: 360,
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity
      }
    },
    paused: {
      rotate: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Preparing your music...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
      <div className="w-full max-w-xl">
        <Card className="p-6 shadow-lg backdrop-blur-sm bg-card/90 rounded-xl border border-border/50">
          <div className="flex flex-col gap-6">
            {/* Audio element */}
            <audio
              ref={audioRef}
              src={currentTrack.file}
              preload="metadata"
            />

            {/* Cover and track info */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                className="w-56 h-56 rounded-full flex items-center justify-center text-6xl shadow-lg"
                style={{ backgroundColor: currentTrack.coverColor }}
                animate={isPlaying ? "playing" : "paused"}
                variants={coverVariants}
              >
                <span>{currentTrack.emoji}</span>
              </motion.div>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">{currentTrack.title}</h2>
                <p className="text-muted-foreground">{currentTrack.artist}</p>
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs mt-2">
                  {currentTrack.category}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                min={0}
                max={currentTrack.duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsShuffle(!isShuffle)}
                className={cn(isShuffle && "text-primary")}
              >
                <Shuffle size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTrack("prev")}
              >
                <SkipBack size={20} />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="rounded-full h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTrack("next")}
              >
                <SkipForward size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRepeat(!isRepeat)}
                className={cn(isRepeat && "text-primary")}
              >
                <Repeat size={20} />
              </Button>
            </div>

            {/* Volume and playlist controls */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2 w-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className={cn(isFavorite && "text-destructive")}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={cn(showPlaylist && "text-primary")}
                >
                  <ListMusic size={20} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Playlist */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4"
            >
              <Card className="p-4 shadow-lg backdrop-blur-sm bg-card/90 rounded-xl border border-border/50">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Music2 size={16} />
                  Playlist ({musicData.length} tracks)
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {musicData.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(index)}
                      className={cn(
                        "flex items-center p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                        currentTrackIndex === index && "bg-accent"
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center mr-3"
                        style={{ backgroundColor: track.coverColor }}
                      >
                        <span>{track.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{track.title}</p>
                        <p className="text-xs text-muted-foreground">{track.artist}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(track.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MusicPlayerPage;