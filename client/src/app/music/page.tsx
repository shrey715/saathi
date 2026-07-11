"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle, Heart,
  ListMusic, Music2,
  BookOpen, Flower2, Wind, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type MoodTone, moodTint, moodVar } from "@/lib/mood-tone";

// Music data from props or imported
const musicData: {
  id: number;
  title: string;
  artist: string;
  tone: MoodTone;
  file: string;
  duration: number;
  category: string;
  icon: LucideIcon;
}[] = [
  {
    id: 0,
    title: "Lofi Study",
    artist: "Chill_Beats",
    tone: "focus",
    file: "/assets/stock_music/lofi-background-music-2-309039.mp3",
    duration: 98,
    category: "Focus",
    icon: BookOpen
  },
  {
    id: 1,
    title: "Path to Harmony",
    artist: "Grand_Project",
    tone: "calm",
    file: "/assets/stock_music/path-to-harmony-313385.mp3",
    duration: 633,
    category: "Meditation",
    icon: Wind
  },
  {
    id: 2,
    title: "Pure Love",
    artist: "Top-Flow",
    tone: "tender",
    file: "/assets/stock_music/pure-love-304010.mp3",
    duration: 78,
    category: "Romantic",
    icon: Heart
  },
  {
    id: 3,
    title: "Zen Garden",
    artist: "Grand_Project",
    tone: "growth",
    file: "/assets/stock_music/zen-garden-310599.mp3",
    duration: 624,
    category: "Meditation",
    icon: Flower2
  },
  {
    id: 4,
    title: "Relaxing Piano",
    artist: "Grand_Project",
    tone: "joy",
    file: "/assets/stock_music/relaxing-piano-310597.mp3",
    duration: 226,
    category: "Meditation",
    icon: Music2
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isLoading } = useAuthGuard();

  // Get current track from index
  const currentTrack = musicData[currentTrackIndex];

  // Check if current track is in favorites
  const isFavorite = favorites.includes(currentTrack.id);

  // Format time in MM:SS
  const formatTime = (time: number) => {
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
  const coverVariants: Variants = {
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
      <div className="min-h-full bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Preparing your music...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full p-4 transition-colors duration-700"
      style={{ backgroundColor: moodTint(currentTrack.tone, 30) }}
    >
      <div className="w-full max-w-xl">
        <Card className="p-6 shadow-neu-lg backdrop-blur-sm bg-card/90 rounded-2xl">
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
                className="w-56 h-56 rounded-full flex items-center justify-center shadow-lg text-white"
                style={{ backgroundColor: moodVar(currentTrack.tone) }}
                animate={isPlaying ? "playing" : "paused"}
                variants={coverVariants}
              >
                <currentTrack.icon className="h-20 w-20" />
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
              <Card className="p-4 shadow-neu-lg backdrop-blur-sm bg-card/90 rounded-2xl">
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
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white shadow-neu-sm"
                        style={{ backgroundColor: moodVar(track.tone) }}
                      >
                        <track.icon className="h-5 w-5" />
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