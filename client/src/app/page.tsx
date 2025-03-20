"use client";

import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(-1);

  const features = [
    {
      title: "Empathetic Conversations",
      description: "Chat with an AI that listens and responds with care and understanding.",
      icon: "💬",
    },
    {
      title: "Personalized Guidance",
      description: "Receive tailored advice and exercises for your mental well-being.",
      icon: "🌟",
    },
    {
      title: "Crisis Support",
      description: "Access immediate help and calming techniques during tough times.",
      icon: "🛟",
    },
  ];

  const testimonials = [
    {
      name: "Priya K.",
      role: "Student",
      feedback: "Saathi has been a lifesaver during exam stress. The guided breathing exercises are amazing!",
      icon: "📚",
    },
    {
      name: "Rahul M.",
      role: "Software Developer",
      feedback: "I love how Saathi helps me reflect on my emotions. It's like journaling but better!",
      icon: "💻",
    },
    {
      name: "Anjali S.",
      role: "Healthcare Professional",
      feedback: "The crisis support feature is so comforting during tough days. Highly recommend it!",
      icon: "🩺",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 text-gray-800 font-sans flex flex-col items-center">
      <Head>
        <title>Saathi | Your AI Wellness Buddy</title>
        <meta name="description" content="Saathi - Your playful and soothing AI mental wellness companion." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="w-full bg-white shadow-md sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-teal-600">Saathi</span>
          <div className="flex space-x-4">
            {typeof window !== 'undefined' && localStorage.getItem('accessToken') ? (
              <button
                onClick={() => router.push('/')}
                className="text-sm bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-teal-600 hover:underline">
                  Log In
                </Link>
                <Link href="/signup" className="text-sm bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-teal-700 mb-4">
          Meet <span className="text-blue-600">Saathi</span>, Your Wellness Buddy
        </h1>
        <p className="text-gray-600 mb-8">
          A playful and soothing AI companion to help you navigate your mental well-being journey.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/signup" className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition">
            Get Started
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="w-full bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-teal-700 mb-8">Why Choose Saathi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg shadow-md transition-all duration-300 transform 
                  ${activeFeature === index ? "scale-105 bg-teal-50 border-2 border-teal-300" : "bg-white hover:shadow-lg hover:translate-y-[-5px]"}
                  cursor-pointer relative`}
                onClick={() => setActiveFeature(activeFeature === index ? -1 : index)}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">{feature.title}</h3>
                
                {/* "Click to learn more" indicator that shows when not expanded */}
                {activeFeature !== index && (
                  <div className="text-xs text-teal-500 mt-2 flex items-center justify-center">
                    <span>Click to learn more</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
                
                {/* Description that appears when clicked */}
                {activeFeature === index && (
                  <>
                    <p className="text-gray-600 mt-3">{feature.description}</p>
                    <div className="text-xs text-teal-500 mt-3 flex items-center justify-center">
                      <span>Click to collapse</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </>
                )}
                
                {/* Subtle button-like appearance */}
                {activeFeature !== index && (
                  <div className="absolute inset-0 rounded-lg border border-gray-200 opacity-50 pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-gradient-to-b from-teal-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-teal-700 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Sign Up</h3>
              <div className="text-3xl mt-2 mb-2">📝</div>
              <p className="text-sm text-gray-600 mt-2">Create your account in minutes. Tell us a bit about yourself so we can personalize your experience.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Connect</h3>
              <div className="text-3xl mt-2 mb-2">💬</div>
              <p className="text-sm text-gray-600 mt-2">Chat with Saathi anytime. Share your thoughts, feelings, or concerns in a safe, judgment-free space.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Grow</h3>
              <div className="text-3xl mt-2 mb-2">🌱</div>
              <p className="text-sm text-gray-600 mt-2">Track your progress and develop healthy mental habits with personalized exercises and insights.</p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <div className="w-12 h-1 bg-teal-300"></div>
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <div className="w-12 h-1 bg-teal-300"></div>
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-teal-700 mb-8">What People Are Saying</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-teal-50 rounded-lg shadow-md">
                <div className="text-4xl mb-4">{testimonial.icon}</div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">{testimonial.name}</h3>
                <p className="text-sm text-gray-600 italic">"{testimonial.feedback}"</p>
                <p className="text-xs text-teal-500 mt-2">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-b from-teal-50 to-blue-50 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-teal-700 mb-4">Start Your Journey Today</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of others taking steps toward better mental well-being with Saathi.
          </p>
          <Link href="/signup" className="bg-teal-500 text-white px-8 py-3 rounded-full hover:bg-teal-600 transition">
            Sign Up for Free
          </Link>
        </div>
      </section>

    </div>
  );
}