"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Sparkles,
  LifeBuoy,
  UserPlus,
  Sprout,
  GraduationCap,
  Code2,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { MoodFace } from "@/components/MoodFace";
import { type MoodTone, toneClasses } from "@/lib/mood-tone";

const features: { title: string; description: string; icon: LucideIcon; tone: MoodTone }[] = [
  {
    title: "Empathetic Conversations",
    description: "Chat with an AI that listens and responds with care and understanding.",
    icon: MessageCircle,
    tone: "tender",
  },
  {
    title: "Personalized Guidance",
    description: "Receive tailored advice and exercises for your mental well-being.",
    icon: Sparkles,
    tone: "joy",
  },
  {
    title: "Crisis Support",
    description: "Access immediate help and calming techniques during tough times.",
    icon: LifeBuoy,
    tone: "alert",
  },
];

const steps: { title: string; description: string; icon: LucideIcon; tone: MoodTone }[] = [
  {
    title: "Sign Up",
    description: "Create your account in minutes. Tell us a bit about yourself so we can personalize your experience.",
    icon: UserPlus,
    tone: "growth",
  },
  {
    title: "Connect",
    description: "Chat with Saathi anytime. Share your thoughts, feelings, or concerns in a safe, judgment-free space.",
    icon: MessageCircle,
    tone: "calm",
  },
  {
    title: "Grow",
    description: "Track your progress and develop healthy mental habits with personalized exercises and insights.",
    icon: Sprout,
    tone: "focus",
  },
];

const testimonials: { name: string; role: string; feedback: string; icon: LucideIcon; tone: MoodTone }[] = [
  {
    name: "Priya K.",
    role: "Student",
    feedback: "Saathi has been a lifesaver during exam stress. The guided breathing exercises are amazing!",
    icon: GraduationCap,
    tone: "focus",
  },
  {
    name: "Rahul M.",
    role: "Software Developer",
    feedback: "I love how Saathi helps me reflect on my emotions. It's like journaling but better!",
    icon: Code2,
    tone: "calm",
  },
  {
    name: "Anjali S.",
    role: "Healthcare Professional",
    feedback: "The crisis support feature is so comforting during tough days. Highly recommend it!",
    icon: Stethoscope,
    tone: "tender",
  },
];

export default function Home() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("accessToken")));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <nav className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-display font-bold">
              S
            </div>
            <span className="text-lg font-display font-bold text-foreground">Saathi</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthed ? (
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  setIsAuthed(false);
                  router.push("/");
                }}
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-primary hover:underline py-2">
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none -z-10" style={{ background: 'var(--mood-joy)' }} />
        <div className="absolute top-10 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none -z-10" style={{ background: 'var(--mood-focus)' }} />

        <div className="flex justify-center mb-6">
          <MoodFace tone="joy" size={100} />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-foreground mb-4 text-balance">
          Meet <span className="text-primary">Saathi</span>, Your Wellness Buddy
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl mx-auto text-balance">
          A playful and soothing AI companion to help you navigate your mental well-being journey.
        </p>
        <div className="flex justify-center">
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-neu-sm hover:bg-primary/90 hover:scale-105 active:scale-95 transition-transform"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="w-full py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">Why Choose Saathi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature) => {
              const tone = toneClasses(feature.tone);
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-card shadow-neu-md hover:-translate-y-1 transition-transform duration-300 text-left"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${tone.soft} ${tone.text}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const tone = toneClasses(step.tone);
              return (
                <div
                  key={step.title}
                  className="p-6 rounded-2xl bg-card shadow-neu-md hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${tone.soft} ${tone.text}`}>
                    <span className="text-base font-bold">{index + 1}</span>
                  </div>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto my-3 ${tone.soft} ${tone.text}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-10 flex justify-center items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <div className="w-10 h-0.5 bg-primary/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <div className="w-10 h-0.5 bg-primary/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">What People Are Saying</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => {
              const tone = toneClasses(testimonial.tone);
              return (
                <div
                  key={testimonial.name}
                  className="p-6 rounded-2xl bg-card shadow-neu-md text-left"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${tone.soft} ${tone.text}`}>
                    <testimonial.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{testimonial.feedback}&rdquo;</p>
                  <h3 className="text-sm font-semibold text-foreground mt-4">{testimonial.name}</h3>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 bg-muted/30 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Start Your Journey Today</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-balance">
            Join thousands of others taking steps toward better mental well-being with Saathi.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-neu-sm hover:bg-primary/90 hover:scale-105 active:scale-95 transition-transform"
          >
            Sign Up for Free
          </Link>
        </div>
      </section>
    </div>
  );
}
