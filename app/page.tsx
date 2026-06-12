"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function LandingPage() {
  const [currentExpert, setCurrentExpert] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Detect scroll position for logo color change
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8;
      setScrolledPastHero(window.scrollY > heroHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const experts = [
    {
      name: "Fatiha Odusiji",
      title: "Developer",
      image: "/odusiji1.jpeg",
      bio: "Full-stack developer with 5+ years of experience in building scalable web applications.",
      email: "fatiha.o@matriverse.com"
    },
    {
      name: "Fathia Bello",
      title: "Project Manager",
      image: "/bello.jpeg",
      bio: "Experienced project manager specializing in healthcare technology and agile methodologies.",
      email: "fathia.b@matriverse.com"
    },
    {
      name: "Kushimo Adeyosola",
      title: "Founder & Registered Nurse",
      image: "/Kushimo.jpeg",
      bio: "Board-certified physician with expertise in maternal health and prenatal care.",
      email: "kushimo.a@matriverse.com"
    }
  ];

  const testimonials = [
    {
      name: "Adaeze O.",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop",
      rating: 5,
      date: "February 12, 2024",
      title: "First-Time Mom, Fully Prepared!",
      review: "\"As a first-time mom, I was terrified of labor. MatriVerse helped me understand every stage and I felt so confident on D-Day!\""
    },
    {
      name: "Chioma A.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      rating: 5,
      date: "February 20, 2024",
      title: "The Support I Needed!",
      review: "\"Being pregnant for the first time is overwhelming. My MatriVerse coach was there every step, answering questions at 2am!\""
    },
    {
      name: "Funke B.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      rating: 5,
      date: "March 1, 2024",
      title: "Knew Exactly What to Expect!",
      review: "\"The educational videos and labor rehearsals made me feel like I had done this before. No surprises on delivery day!\""
    },
    {
      name: "Ngozi M.",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
      rating: 5,
      date: "February 12, 2024",
      title: "MatriVerse Changed My Journey!",
      review: "\"From tracking symptoms to practicing breathing techniques, everything was personalized to my pregnancy. Highly recommend!\""
    },
    {
      name: "Blessing K.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      rating: 5,
      date: "March 15, 2024",
      title: "Best Decision for My First Baby!",
      review: "\"From my first trimester to D-Day, MatriVerse guided me through it all. The AR position training is incredible!\""
    },
    {
      name: "Amara T.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      rating: 4.5,
      date: "March 20, 2024",
      title: "My Coach Understood Me!",
      review: "\"The coaches adjusted my plan based on how I was feeling each trimester. They truly understand first-time mom anxiety.\""
    },
    {
      name: "Ifunanya D.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      rating: 5,
      date: "April 2, 2024",
      title: "Breathed Through Labor!",
      review: "\"The breathing exercises saved me! I practiced daily and when contractions came, I knew exactly what to do.\""
    },
    {
      name: "Yetunde S.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop",
      rating: 5,
      date: "April 10, 2024",
      title: "AR Training Was a Game Changer!",
      review: "\"Practicing labor positions at home with AR guidance gave me muscle memory. My midwife was impressed with my form!\""
    }
  ];

  const detailedPrograms = [
    {
      title: "Labor Preparation.",
      description: "Build confidence and physical readiness for your delivery day. Practice positions, breathing techniques, and mental preparation with AR-guided training.",
      features: [
        "AR-assisted position practice",
        "Guided breathing exercises",
        "D-Day mental preparation"
      ],
      image: "/Image 1 → FitFlow.svg",
      gradient: "from-purple-400 to-purple-500",
      imagePosition: "left"
    },
    {
      title: "Trimester Wellness.",
      description: "Personalized programs designed for each stage of your pregnancy. Safe exercises, symptom management, and AI-powered guidance tailored to your trimester.",
      features: [
        "Trimester-specific exercises",
        "Symptom tracking & management",
        "AI coach check-ins"
      ],
      image: "/Image 3 → FitFlow.png",
      gradient: "from-brand-accent to-brand-mid",
      imagePosition: "right"
    },
    {
      title: "Breathing & Relaxation.",
      description: "Master breathing techniques for labor and everyday comfort. Reduce stress, manage pain, and stay calm through guided relaxation sessions.",
      features: [
        "Labor breathing mastery",
        "Stress relief techniques",
        "Guided relaxation sessions"
      ],
      image: "/Image 2 → FitFlow.svg",
      gradient: "from-purple-400 to-brand-dark",
      imagePosition: "left"
    }
  ];

  const faqs = [
    {
      question: "What is MatriVerse?",
      answer: "MatriVerse is an AI-powered coaching platform specifically designed for first-time pregnant women. We help you prepare for labor and delivery with personalized AI guidance, smart programs, AR-assisted position practice, and 24/7 support."
    },
    {
      question: "Is this only for first-time moms?",
      answer: "While we specialize in supporting first-time mothers, our programs benefit any expectant mom who wants personalized AI guidance. We understand the unique anxieties and questions that come with your first pregnancy."
    },
    {
      question: "How does the AI coach work?",
      answer: "Our AI coach is trained on extensive maternal health knowledge and provides personalized guidance based on your pregnancy journey. It's available 24/7 to answer questions, provide support, and guide you through exercises and preparation."
    },
    {
      question: "How does the coaching work?",
      answer: "You'll get a personalized plan based on your due date, trimester, and medical history. Access AR training sessions, educational videos, breathing exercises, and get direct support from your AI coach—all from your device."
    },
    {
      question: "What is AR training?",
      answer: "AR (Augmented Reality) training uses your phone camera to guide you through labor positions in real-time. You'll see visual feedback on your form so you can practice correctly at home and build muscle memory for D-Day."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up, complete your health profile with your due date and medical history, and your AI coach will create the best personalized program for your current stage of pregnancy."
    },
    {
      question: "Can I reach my AI coach anytime?",
      answer: "Yes! Your AI coach is available 24/7 for instant answers and support. Many first-time moms have questions at 2am—we're here for that too."
    }
  ];

  const sectionLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About Us', href: '#about' },
    { name: 'AR Experience', href: '#ar' },
    { name: 'Training Programs', href: '#programs' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  // Smooth scroll function
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  // Bouncing animation variants
  const bounceAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={scrolledPastHero ? "/matriverse_logo_purple.png" : "/matriverse_logo_white.png"}
                alt="MatriVerse"
                className="h-8 sm:h-12 transition-all duration-300"
              />
              <span className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${scrolledPastHero ? 'text-brand-accent' : 'text-white'}`}>MatriVerse</span>
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              className={`px-6 sm:px-10 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shadow-lg hover:shadow-xl ${
                scrolledPastHero
                  ? 'bg-brand-accent text-white hover:opacity-90'
                  : 'bg-purple-400 text-white hover:bg-purple-500 shadow-purple-400/25'
              }`}
            >
              MENU
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Modal Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-purple-500 via-purple-400 to-purple-600 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 max-w-lg w-full mx-4 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Menu Links */}
              <nav className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                {sectionLinks.map((link, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left text-white text-xl sm:text-3xl font-bold hover:text-white/80 transition-colors py-1.5 sm:py-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {link.name}
                  </motion.button>
                ))}
              </nav>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 sm:mt-10"
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-brand-accent rounded-full font-semibold text-base sm:text-lg hover:bg-brand-surface transition-all shadow-xl"
                >
                  Get Started
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-end overflow-hidden bg-cover"
        style={{ backgroundImage: "url('/Transform_the_woman_from_the_202606031518.jpeg')", backgroundPosition: 'center 40%' }}
      >
        {/* Blur gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/40 via-transparent to-transparent backdrop-blur-sm pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pb-12 sm:pb-20 pt-24 sm:pt-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">
            {/* Left Side - Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.95]">
                <span className="text-white">Prepared.</span>
                <br />
                <span className="text-brand-accent">Confident.</span>
                <br />
                <span className="text-white">You.</span>
              </h1>
            </motion.div>

            {/* Right Side - Description & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 flex flex-col justify-end items-start lg:items-end"
            >
              <div className="max-w-md">
                <p className="text-base sm:text-lg text-white mb-6 leading-relaxed" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <span className="font-semibold">Your first pregnancy</span> is a journey that deserves personalized guidance. AI-powered coaching, AR-assisted labor preparation, and <span className="font-semibold">24/7 support</span> — all in one place.
                </p>

                <button
                  onClick={() => window.location.href = '/signup'}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-brand-accent rounded-full font-semibold text-sm sm:text-base hover:bg-brand-surface transition-all shadow-xl hover:shadow-2xl flex items-center gap-3"
                >
                  Dive into the MatriVerse
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AR Experience Section */}
      <section id="ar" className="py-16 sm:py-28 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold text-brand-accent uppercase tracking-wider mb-3">AR TECHNOLOGY</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 leading-tight text-text">
                Train with <span className="text-brand-accent">AR Guidance</span>
              </h2>
              <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Practice labor positions and breathing techniques with real-time visual feedback from your phone.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { title: "Posture Correction", desc: "Real-time feedback" },
                  { title: "Breathing Exercises", desc: "Guided sessions" },
                  { title: "Progress Tracking", desc: "See your growth" },
                  { title: "Video Coaching", desc: "AI guidance" }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                    <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-full font-semibold hover:opacity-90 transition-all"
              >
                <button className= "text-white flex items-center gap-3 ">
                Try AR Experience
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                </button>
              </Link>
            </motion.div>

            {/* Right Side - Video/Image Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] max-w-sm mx-auto lg:max-w-md">
                {/* Main container */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl" />
                <div className="absolute inset-3 bg-white rounded-2xl shadow-xl overflow-hidden">
                  <img
                    src="/Link - Image Container.svg"
                    alt="AR Training Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-6 h-6 text-brand-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white font-medium text-sm">AR Position Training</p>
                    <p className="text-white/70 text-xs">Interactive guidance session</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section with Expert Carousel */}
      <section id="about" className="relative py-16 sm:py-32 overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[6rem] sm:text-[10rem] lg:text-[18rem] font-black text-white select-none text-center leading-[0.85]">
            Meet
            <br />
            The Team
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-sm font-semibold text-brand-accent uppercase tracking-wider mb-4">ABOUT US</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-text">First Time Mom? </span>
              <span className="text-brand-accent">We've Got You.</span>
            </h2>
            <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto leading-relaxed px-2">
              At MatriVerse, we specialize in guiding first-time mothers through pregnancy with confidence.
              From understanding your body's changes to mastering labor techniques, our AI coach
              provides personalized support so you feel prepared, informed, and empowered for your D-Day.
            </p>
          </motion.div>

          {/* Expert Carousel - Stacked Full Image Cards */}
          <div className="relative max-w-lg mx-auto mb-16 sm:mb-24 h-[450px] sm:h-[540px]">
            <div className="relative h-full w-[300px] sm:w-[380px] mx-auto">
              {/* Stacked Cards */}
              {experts.map((expert, idx) => {
                const position = (idx - currentExpert + experts.length) % experts.length;
                const isFlipped = flippedCard === idx;

                return (
                  <motion.div
                    key={idx}
                    className="absolute inset-0 cursor-pointer"
                    animate={{
                      x: position * 25,
                      y: position * 20,
                      scale: 1 - position * 0.06,
                      zIndex: experts.length - position,
                      opacity: position > 2 ? 0 : 1 - position * 0.2,
                      rotateZ: position * 2
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ pointerEvents: position === 0 ? 'auto' : 'none' }}
                    onClick={() => position === 0 && setFlippedCard(isFlipped ? null : idx)}
                  >
                    {/* Card Container with Flip */}
                    <div
                      className="relative w-full h-[400px] sm:h-[500px] transition-transform duration-700"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* Front of Card - Full Image */}
                      <div
                        className="absolute inset-0 rounded-[2rem] shadow-2xl overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {/* Full Image */}
                        <img
                          src={expert.image}
                          alt={expert.name}
                          className="w-full h-full object-cover"
                        />

                        {/* Gradient Overlay at Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Name & Title at Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <h3 className="text-2xl font-bold text-white mb-1">{expert.name}</h3>
                          <p className="text-purple-300 font-medium">{expert.title}</p>
                        </div>

                        {/* Plus Button - Top Right */}
                        {position === 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFlippedCard(idx);
                            }}
                            className="absolute top-5 right-5 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-10"
                          >
                            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Back of Card - Modal Style */}
                      <div
                        className="absolute inset-0 rounded-[2rem] shadow-2xl overflow-hidden bg-white border border-gray-200"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="relative w-full h-full p-8 flex flex-col">
                          {/* Header with Text Logo and Close Button */}
                          <div className="flex items-center justify-between mb-auto">
                            {/* MatriVerse Text */}
                            <span className="text-xl font-bold text-black">MatriVerse</span>

                            {/* Close Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlippedCard(null);
                              }}
                              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Expert Info - Positioned at Bottom */}
                          <div className="mt-auto">
                            <h3 className="text-3xl font-bold text-black mb-2">{expert.name}</h3>
                            <p className="text-black/80 font-medium mb-6">{expert.title}</p>

                            {/* Bio */}
                            <p className="text-black/60 leading-relaxed text-base">
                              {expert.bio}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Navigation Arrows */}
              <button
                onClick={() => {
                  setFlippedCard(null);
                  setCurrentExpert((prev) => (prev - 1 + experts.length) % experts.length);
                }}
                className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-50"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setFlippedCard(null);
                  setCurrentExpert((prev) => (prev + 1) % experts.length);
                }}
                className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-50"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Detailed Programs Section */}
      <section id="programs" className="py-16 sm:py-32" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">COACHING PROGRAMS</p>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-text">Your Pregnancy. </span>
              <span className="text-brand-accent">Your Journey.</span>
            </h2>
            <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto leading-relaxed px-2">
              Every first-time mom's journey is unique. Whether you're in your first trimester or counting
              down to D-Day, our AI coach designs personalized programs to help you feel confident,
              prepared, and supported every step of the way.
            </p>
          </motion.div>

          {/* Detailed Program Cards */}
          <div className="space-y-10 sm:space-y-16 max-w-4xl mx-auto">
            {detailedPrograms.map((program, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative px-2 sm:px-8 lg:px-16"
              >
                {/* Decorative Image on Left Edge - Bouncing */}
                {program.imagePosition === 'left' && (
                  <motion.div
                    {...bounceAnimation}
                    className="absolute -left-4 sm:-left-8 lg:-left-16 top-0 sm:top-1/2 sm:-translate-y-1/2 w-20 sm:w-44 lg:w-52 h-auto pointer-events-none z-10"
                  >
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-contain drop-shadow-lg opacity-60 sm:opacity-100"
                      style={{ maxHeight: '240px' }}
                    />
                  </motion.div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-10 lg:p-12 relative">
                  {/* Content */}
                  <div className={`relative z-10 ${program.imagePosition === 'left' ? 'md:ml-12 lg:ml-16' : 'md:mr-12 lg:mr-16'}`}>
                    {/* Arrow icon in top right */}
                    <div className="absolute -top-2 -right-2 hidden sm:block">
                      <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-4 sm:mb-5 leading-tight pr-0 sm:pr-8">{program.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-7 leading-relaxed">
                      {program.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 sm:space-y-4">
                      {program.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${program.gradient} flex items-center justify-center shrink-0 mt-0.5`}>
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Decorative Image on Right Edge - Bouncing */}
                {program.imagePosition === 'right' && (
                  <motion.div
                    {...bounceAnimation}
                    className="absolute -right-4 sm:-right-8 lg:-right-16 top-0 sm:top-1/2 sm:-translate-y-1/2 w-24 sm:w-52 lg:w-60 h-auto pointer-events-none z-10"
                  >
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-contain drop-shadow-lg opacity-50 sm:opacity-100"
                      style={{ maxHeight: '260px' }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Designed For You CTA */}
      <section className="py-16 sm:py-32" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 mb-4 text-sm sm:text-base">First pregnancy? We specialize in guiding new moms</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
              <span className="text-brand-accent">Designed for First-Time Moms.</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
              Join hundreds of first-time mothers who felt confident and prepared for their D-Day with MatriVerse.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-brand-accent text-white rounded-full font-semibold text-base sm:text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl"
            >
             <button className= "text-white flex items-center gap-3 ">
                Start your Journey
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works - 4 Card Grid */}
      <section id="how-it-works" className="py-16 sm:py-24" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="text-text">How It Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {/* Card 1: Choose Your Program - Wider */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden p-6 sm:p-8 lg:p-10 min-h-[240px] sm:min-h-[320px] flex flex-col justify-between bg-gradient-to-br from-purple-400 to-purple-500 sm:col-span-2 lg:col-span-3"
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10"
              >
                <img src="/Image 1 → FitFlow.svg" alt="" className="w-24 h-24 sm:w-44 sm:h-44 lg:w-48 lg:h-48 object-contain opacity-70 sm:opacity-85 drop-shadow-2xl" />
              </motion.div>

              <div className="relative z-10 max-w-xs">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight">Choose<br />Your Program</h3>
                <p className="text-white/90 text-sm lg:text-base leading-relaxed">
                  Select the plan that fits your trimester—labor prep, breathing, or full pregnancy coaching.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Get Your Personalized Plan - Narrower */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden p-6 sm:p-8 lg:p-10 min-h-[240px] sm:min-h-[320px] flex flex-col justify-between bg-gradient-to-br from-purple-300 to-purple-400 lg:col-span-2"
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 z-10"
              >
                <img src="/Image 2 → FitFlow.svg" alt="" className="w-28 h-28 sm:w-56 sm:h-56 lg:w-60 lg:h-60 object-contain opacity-50 sm:opacity-70" />
              </motion.div>

              <div className="relative z-10 max-w-xs">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight">Get Your<br />Personalized Plan</h3>
                <p className="text-white/90 text-sm lg:text-base leading-relaxed">
                  Your AI coach designs a custom preparation plan based on your due date and medical history.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Train Anytime, Anywhere - Narrower */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden p-6 sm:p-8 lg:p-10 min-h-[240px] sm:min-h-[320px] flex flex-col justify-between bg-gradient-to-br from-purple-300 to-purple-400 lg:col-span-2"
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <div className="relative z-10 max-w-xs">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight">Practice<br />At Home</h3>
                <p className="text-white/90 text-sm lg:text-base leading-relaxed">
                  Use AR training, guided videos, and breathing exercises from the comfort of your home.
                </p>
              </div>
            </motion.div>

            {/* Card 4: See & Feel the Results - Wider */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden p-6 sm:p-8 lg:p-10 min-h-[240px] sm:min-h-[320px] flex flex-col justify-between bg-gradient-to-br from-blue-300 to-blue-400 sm:col-span-2 lg:col-span-3"
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 z-10"
              >
                <img src="/Image 3 → FitFlow.png" alt="" className="w-32 h-32 sm:w-64 sm:h-64 lg:w-72 lg:h-72 object-contain opacity-60 sm:opacity-80" />
              </motion.div>

              <div className="relative z-10 max-w-xs">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight">Feel Ready<br />for D-Day</h3>
                <p className="text-white/90 text-sm lg:text-base leading-relaxed">
                  Track your progress, build confidence, and feel fully prepared for your delivery day!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Auto-scrolling Carousel */}
      <section id="testimonials" className="py-16 sm:py-24 relative overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[5rem] sm:text-[8rem] lg:text-[14rem] font-black text-white select-none text-center leading-[0.85] opacity-80">
            What Our...
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-brand-accent">Real Mothers.</span>
              <span className="text-text"> Real Results.</span>
            </h2>
          </motion.div>

          {/* Testimonial Marquee */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: [0, -1920] }}
              transition={{
                x: {
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            >
              {[...testimonials, ...testimonials].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow min-w-[220px] max-w-[220px] flex-shrink-0"
                >
                  {/* Header with Photo and Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                      {/* Star Rating */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${star <= Math.floor(testimonial.rating) ? 'text-purple-400' : star - 0.5 <= testimonial.rating ? 'text-purple-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h5 className="font-bold text-gray-900 text-xs mb-1.5 line-clamp-1">{testimonial.title}</h5>

                  {/* Review */}
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{testimonial.review}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section - No Image */}
      <section id="faq" className="py-16 sm:py-32" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-3">
              <span className="text-text">Questions?</span>
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-brand-accent mb-6 sm:mb-8">
              We've got answers.
            </h3>
            <p className="text-text-muted text-sm sm:text-base px-2">
              Find answers to the most common questions about MatriVerse, including
              features, pricing, and how to get started.
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-text pr-3 sm:pr-4 text-sm sm:text-base">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-text-muted leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section with Newsletter */}
      <footer className="py-12 sm:py-24" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
            {/* Left Side - Newsletter */}
            <div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 leading-tight">
                <span className="text-brand-accent">Join our newsletter </span>
                <span className="text-text">for pregnancy tips & first-mom advice!</span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-5 sm:px-6 py-3 sm:py-4 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full sm:max-w-xs text-gray-700 text-sm sm:text-base"
                />
                <button className="px-5 sm:px-6 py-3 sm:py-4 bg-purple-400 text-white rounded-full font-medium hover:bg-purple-500 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
                  Subscribe
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                By signing up to receive emails from MatriVerse, you agree to our{' '}
                <Link href="#" className="text-purple-500 hover:underline">Privacy Policy</Link>.
                We treat your info responsibly. Unsubscribe anytime.
              </p>

              <p className="text-gray-900 font-medium mb-6 sm:mb-8 text-sm sm:text-base">
                Contact us: <a href="mailto:hello@matriverse.live" className="text-purple-500 hover:underline">hello@matriverse.live</a>
              </p>

{/* Social Icons - commented out
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
              </div>
              */}
            </div>

            {/* Right Side - Sitemap (Landing Page Sections Only) */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">SITEMAP</h4>
              <ul className="space-y-3 sm:space-y-4">
                {sectionLinks.map((link, idx) => (
                  <li key={idx} className="border-b border-gray-200 pb-3 sm:pb-4">
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="flex items-center justify-between w-full text-purple-500 hover:text-purple-600 transition-colors font-medium text-sm sm:text-base"
                    >
                      {link.name}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 sm:mt-16 flex items-center justify-center">
            <p className="text-gray-400 text-xs sm:text-sm text-center">
              Copyright 2026 MatriVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
