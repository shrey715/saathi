"use client";

import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [floating, setFloating] = useState({ x: 0, y: 0 });

  // Add subtle mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setFloating({
        x: e.clientX / window.innerWidth * 15,
        y: e.clientY / window.innerHeight * 15
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      title: "Active Listening & Emotional Reflection",
      description: "Experience conversations with an AI that truly understands your emotions and responds with genuine empathy.",
      icon: "🌸"
    },
    {
      title: "Guided Coping & Resilience",
      description: "Access evidence-based strategies tailored to your specific challenges and emotional state.",
      icon: "🍃"
    },
    {
      title: "Multi-Disciplinary Advisory",
      description: "Receive holistic well-being guidance that considers all aspects of your mental health journey.",
      icon: "🌱"
    },
    {
      title: "CRISIS Mode",
      description: "Immediate support during difficult moments, with calming techniques and connections to professional resources.",
      icon: "💫"
    },
    {
      title: "Local Support & Resources",
      description: "Connect with community resources and support groups in your area when you need additional help.",
      icon: "🌿"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 text-gray-800 font-['Quicksand'] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-2/3 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Head>
        <title>Saathi | Your AI Mental Wellness Companion</title>
        <meta name="description" content="Saathi - Thoughtfully designed AI-powered mental wellness companion providing personalized, empathetic support through specialized AI agents." />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          {`
            @keyframes blob {
              0% { transform: scale(1) translate(0px, 0px); }
              33% { transform: scale(1.1) translate(20px, -30px); }
              66% { transform: scale(0.9) translate(-20px, 30px); }
              100% { transform: scale(1) translate(0px, 0px); }
            }
            .animate-blob {
              animation: blob 15s infinite ease-in-out;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}
        </style>
      </Head>

      <header className="bg-white/80 backdrop-blur-sm shadow-sm text-gray-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">✨ Saathi</span>
          </div>
          <div className="flex items-center space-x-4">
            {typeof window !== 'undefined' && localStorage.getItem('accessToken') ? (
              // User is logged in
              <button
                onClick={() => {
                  router.push('/');
                }}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2 rounded-full hover:from-teal-600 hover:to-blue-600 font-medium transition-all shadow-sm hover:shadow-md hover:scale-105"
              >
                Log Out
              </button>
            ) : (
              // User is not logged in
              <>
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium transition-all hover:scale-105">
                  Log In
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2 rounded-full hover:from-teal-600 hover:to-blue-600 font-medium transition-all shadow-sm hover:shadow-md hover:scale-105">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div style={{ transform: `translate(${-floating.x / 2}px, ${-floating.y / 2}px)` }} className="transition-transform duration-300">
              <h1 className="text-4xl sm:text-5xl font-bold text-teal-800 leading-tight mb-6 relative">
                Your Gentle <span className="text-blue-600 relative inline-block hover:animate-pulse cursor-pointer">Mental Wellness
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-200 rounded-full"></span>
                </span> Companion
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Saathi brings calm, supportive guidance through our thoughtful AI companions, making mental wellness accessible and engaging.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full hover:from-teal-600 hover:to-blue-600 font-medium text-center text-lg transition-all shadow-md hover:shadow-lg hover:scale-105 group">
                  Begin Your Journey <span className="inline-block transition-transform group-hover:rotate-12 group-hover:translate-x-1">✨</span>
                </Link>
                <Link href="/learn-more" className="border-2 border-dashed border-teal-400 text-teal-600 px-8 py-3 rounded-full hover:bg-teal-50 font-medium text-center text-lg transition-all hover:border-solid group">
                  Learn More <span className="inline-block transition-transform group-hover:scale-125">🌱</span>
                </Link>
              </div>
            </div>
            <div className="flex justify-center transition-transform duration-300" style={{ transform: `translate(${floating.x}px, ${floating.y}px)` }}>
              <div className="w-full max-w-md bg-white/90 shadow-lg rounded-2xl p-6 border border-teal-100 transform hover:rotate-1 transition-all hover:shadow-xl">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl mb-4 shadow-sm relative">
                  {/* Animated decorative floating bubbles */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-100 rounded-full opacity-40 animate-[pulse_3s_ease-in-out_infinite]"></div>
                  <div className="absolute top-10 -right-4 w-6 h-6 bg-blue-100 rounded-full opacity-40 animate-[bounce_4s_ease-in-out_infinite]"></div>
                  <div className="absolute -top-4 right-10 w-5 h-5 bg-purple-100 rounded-full opacity-40 animate-[bounce_5s_ease-in-out_infinite]"></div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl animate-pulse">
                      S
                    </div>
                    <div className="ml-3 font-medium text-teal-800">Saathi</div>
                  </div>
                  <div className="mt-4 bg-white p-4 rounded-lg shadow-sm transform -rotate-1 hover:rotate-0 transition-transform">
                    <p className="text-gray-700">Hello there <span className="inline-block animate-bounce">👋</span> I'm Saathi. How are you feeling today? I'm here to listen and support you.</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-50 p-4 rounded-lg max-w-xs transform rotate-1 hover:rotate-0 transition-transform">
                    <p className="text-gray-700">I've been feeling a bit overwhelmed lately with work...</p>
                  </div>
                </div>
                <div className="mt-4">
                  <input type="text" placeholder="Share what's on your mind..." className="w-full p-3 border-2 border-dashed border-teal-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-300 hover:border-teal-300 transition-colors" disabled />
                  <p className="text-sm text-teal-600 mt-2 text-center">Create an account to start your wellness journey</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features with wavy top */}
        <section className="bg-gradient-to-r from-teal-500 to-blue-500 py-16 text-white relative">
          {/* Wavy top border with animation */}
          <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden -translate-y-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full animate-[pulse_15s_ease-in-out_infinite]" preserveAspectRatio="none">
              <path fill="url(#features-gradient)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,165.3C960,171,1056,149,1152,133.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              <defs>
                <linearGradient id="features-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="animate-pulse inline-block mr-2">✨</span> Mindful Support Just For You <span className="animate-pulse inline-block ml-2">✨</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center p-6 rounded-xl text-center transition-all cursor-pointer transform hover:rotate-2 ${activeFeature === index
                      ? 'bg-white text-teal-800 shadow-lg scale-105'
                      : 'bg-teal-400/20 hover:bg-teal-400/30 text-white hover:shadow-md'
                    }`}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(-1)}
                >
                  <div className={`text-4xl mb-4 ${activeFeature === index ? 'animate-bounce' :
                      hoverIndex === index ? 'animate-pulse' : ''
                    }`}>{feature.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>

                  {/* Show description directly underneath when active */}
                  <div className={`transition-all duration-300 ${activeFeature === index ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                    <p className={`text-sm ${activeFeature === index ? 'text-teal-700' : 'text-white'}`}>
                      {feature.description}
                    </p>
                  </div>

                  {/* Visual indicator that it's clickable */}
                  <div className={`mt-2 text-xs ${activeFeature === index ? 'text-teal-500' : 'text-white/70'}`}>
                    {activeFeature === index ? '✨ Click to collapse ✨' : '✨ Click to learn more ✨'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works with tilting cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-800 relative">
            <span className="relative z-10">How Saathi Supports Your Journey</span>
            <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gradient-to-r from-teal-200 to-blue-200 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-rotate-2 group">
              <div className="w-14 h-14 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 transform -rotate-3 group-hover:rotate-12 transition-transform">1</div>
              <h3 className="text-xl font-medium mb-3 text-teal-700">Begin Your Journey</h3>
              <p className="text-gray-600">Create your personal space and connect with your AI companion to start your wellness journey.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-rotate-2 group">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 transform -rotate-3 group-hover:rotate-12 transition-transform">2</div>
              <h3 className="text-xl font-medium mb-3 text-purple-700">Receive Personalized Support</h3>
              <p className="text-gray-600">Get tailored guidance, exercises, and resources that adapt to your unique wellness needs.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:rotate-2 relative group">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 transform rotate-3 group-hover:rotate-12 transition-transform">3</div>
              <h3 className="text-xl font-medium mb-3 text-blue-700">Share & Connect</h3>
              <p className="text-gray-600">Express your thoughts and feelings in a safe, judgment-free environment.</p>
              {/* Animated decorative element */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-100 rounded-full opacity-70 group-hover:animate-ping"></div>
            </div>
          </div>
        </section>

        {/* Testimonials with tilted cards */}
        <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-16 text-gray-800 relative">
          {/* Curved top border */}
          <div className="absolute top-0 left-0 right-0 h-10 overflow-hidden -translate-y-full">
            <div className="w-full h-40 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-[100%]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-teal-800 relative">
              <span className="relative z-10">What Our Community Says</span>
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gradient-to-r from-teal-200 to-blue-200 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md text-gray-800 border-l-4 border-teal-400 transition-all hover:shadow-lg transform hover:-rotate-2 hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-300 to-blue-400 rounded-full flex items-center justify-center text-white text-lg">P</div>
                  <div className="ml-3">
                    <div className="font-medium text-teal-700">Priya K.</div>
                    <div className="text-sm text-teal-500">Student</div>
                  </div>
                </div>
                <p className="text-gray-600">"Saathi has been incredibly helpful during my exam stress. The breathing techniques and mindfulness exercises have really helped me manage my anxiety."</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md text-gray-800 border-l-4 border-blue-400 transition-all hover:shadow-lg transform hover:rotate-2 hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center text-white text-lg">R</div>
                  <div className="ml-3">
                    <div className="font-medium text-blue-700">Rahul M.</div>
                    <div className="text-sm text-blue-500">Software Developer</div>
                  </div>
                </div>
                <p className="text-gray-600">"The journaling prompts have transformed how I process my emotions. I've become more self-aware and better at handling work stress."</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md text-gray-800 border-l-4 border-purple-400 transition-all hover:shadow-lg transform hover:-rotate-2 hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full flex items-center justify-center text-white text-lg">A</div>
                  <div className="ml-3">
                    <div className="font-medium text-purple-700">Anjali S.</div>
                    <div className="text-sm text-purple-500">Healthcare Professional</div>
                  </div>
                </div>
                <p className="text-gray-600">"Working in healthcare can be intense. Saathi connects me with local resources when I need additional support. It's like having a supportive friend available anytime."</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with a fun container */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-800 relative">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-100 rounded-full animate-[pulse_10s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-100 rounded-full animate-[pulse_13s_ease-in-out_infinite]"></div>
            <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-purple-100 rounded-full animate-[pulse_7s_ease-in-out_infinite]"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg border-2 border-dashed border-teal-200 relative z-10 transform hover:rotate-1 transition-all hover:border-solid group">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Begin Your Wellness Journey Today</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Mental health support should be accessible, comforting, and free from stigma. Join our community of individuals taking positive steps toward emotional wellbeing with Saathi.
            </p>
            <Link href="/signup" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-10 py-4 rounded-full hover:from-teal-600 hover:to-blue-600 font-medium text-lg inline-block transition-all shadow-md hover:shadow-lg hover:scale-105 group">
              Start Your Free Journey <span className="inline-block transition-transform group-hover:rotate-90">✨</span>
            </Link>
            <div className="mt-4 text-sm text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">No pressure, move at your own pace</div>
          </div>
        </section>
      </main>
    </div>
  );
}