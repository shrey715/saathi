"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { journalApi } from "@/lib/api";
import { getJournalIcon, getJournalTone, randomJournalTag } from "@/lib/journal-icons";
import { toneClasses } from "@/lib/mood-tone";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  color: string;
  emoji: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editableTitle, setEditableTitle] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'title'
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading } = useAuthGuard();

  // Fetch journal entries once authenticated
  useEffect(() => {
    if (isLoading) return;

    journalApi
      .list()
      .then((data) => {
        const journalEntries = (data || []).map((entry) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(journalEntries);
      })
      .catch((err) => console.error('Fetch Journals error:', err));
  }, [isLoading]);

  const createNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: "New Journal Entry",
      content: "",
      date: new Date(),
      color: "",
      emoji: randomJournalTag()
    };
    setEntries([newEntry, ...entries]);
    setCurrentEntry(newEntry);
    setEditableTitle(newEntry.title);
    setEditableContent(newEntry.content);
    setIsEditing(true);
  };

  const openEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEditableTitle(entry.title);
    setEditableContent(entry.content);
    setIsEditing(false);
  };

  const deleteEntry = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    try {
      await journalApi.remove(id);
      setEntries(entries.filter(entry => entry.id !== id));
      if (currentEntry && currentEntry.id === id) {
        setCurrentEntry(null);
      }
    } catch (err) {
      console.error('Delete Journal error:', err);
    }
  };

  const saveChanges = async (e: React.MouseEvent) => {
    if (!currentEntry) return;

    const updatedEntries = entries.map(entry =>
      entry.id === currentEntry.id
        ? { ...entry, title: editableTitle, content: editableContent, date: new Date() }
        : entry
    );
    setEntries(updatedEntries);
    setCurrentEntry({ ...currentEntry, title: editableTitle, content: editableContent, date: new Date() });
    setIsEditing(false);

    try {
      await journalApi.add({
        id: currentEntry.id,
        title: editableTitle,
        content: editableContent,
        date: new Date().toISOString(),
        color: currentEntry.color,
        emoji: currentEntry.emoji,
      });
    } catch (err) {
      console.error('Add Journal error:', err);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(lowerCaseQuery) ||
      entry.content.toLowerCase().includes(lowerCaseQuery)
    );
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading your journal...</p>
      </div>
    );
  }

  const entryTone = currentEntry ? toneClasses(getJournalTone(currentEntry.emoji)) : null;

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-3 flex justify-between items-center bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            {currentEntry ? (
              <Button variant="ghost" size="sm" onClick={() => setCurrentEntry(null)} className="rounded-full p-1">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            ) : (
              <Book className="h-5 w-5 text-primary" />
            )}

            <h1 className="text-lg font-bold text-foreground truncate">
              {currentEntry ? (isEditing ? "Edit Entry" : currentEntry.title) : "My Journal"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {currentEntry && (
              <>
                {isEditing ? (
                  <Button variant="ghost" size="sm" onClick={saveChanges} className="rounded-full text-mood-growth hover:text-mood-growth">
                    <Save className="h-5 w-5 mr-1" />
                    <span className="text-sm">Save</span>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="rounded-full text-primary">
                    <Pencil className="h-5 w-5 mr-1" />
                    <span className="text-sm">Edit</span>
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={() => deleteEntry(currentEntry.id)} className="rounded-full text-destructive ml-1">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-3 md:p-6">
        {currentEntry ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`entry-${currentEntry.id}-${isEditing ? 'edit' : 'view'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                {/* Entry Header */}
                <div className={cn("py-3 px-4 flex items-center gap-3 border-b border-border", entryTone?.soft)}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-neu-sm shrink-0", entryTone?.text, "bg-card")}>
                    {(() => {
                      const EntryIcon = getJournalIcon(currentEntry.emoji);
                      return <EntryIcon className="h-5 w-5" />;
                    })()}
                  </div>

                  {isEditing ? (
                    <Input
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      placeholder="Entry Title"
                      className={cn("flex-1 border-0 bg-transparent text-lg font-medium focus-visible:ring-0 p-0", entryTone?.text)}
                    />
                  ) : (
                    <h2 className={cn("text-lg font-medium flex-1 truncate", entryTone?.text)}>
                      {currentEntry.title}
                    </h2>
                  )}

                  <div className="text-xs text-muted-foreground whitespace-nowrap">
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
                      className="min-h-[300px] border-0 focus-visible:ring-1 p-2 leading-relaxed resize-none"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                      {currentEntry.content || (
                        <p className="text-muted-foreground italic">No content yet. Click edit to start writing.</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div>
            {/* Search and Sort Bar */}
            <div className="mb-4 flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 py-2 rounded-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2.5">
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "date" ? "title" : "date")}
                className="rounded-full flex items-center gap-1"
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
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {sortedEntries.length > 0 ? (
                sortedEntries.map(entry => {
                  const tone = toneClasses(getJournalTone(entry.emoji));
                  const EntryIcon = getJournalIcon(entry.emoji);
                  return (
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
                        className="overflow-hidden hover:shadow-neu-lg transition-all cursor-pointer"
                        onClick={() => openEntry(entry)}
                      >
                        <div className="flex p-3 items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", tone.soft, tone.text)}>
                            <EntryIcon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-medium text-foreground mb-1 truncate">{entry.title}</h3>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {format(new Date(entry.date), 'MMM d')}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.content || "No content"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="md:col-span-2 flex flex-col items-center justify-center p-10 text-center bg-muted/50 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Smile className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No entries found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first journal entry to get started"}
                  </p>
                  <Button variant="outline" size="sm" onClick={createNewEntry} className="rounded-full">
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
              className="fixed bottom-24 md:bottom-8 right-4 md:right-8 rounded-full w-12 h-12 shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
