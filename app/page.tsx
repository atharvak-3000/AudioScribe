"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Play, Mic, Video, FileText, CheckCircle2, LayoutDashboard, Calendar, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B1120] text-slate-50 overflow-hidden relative font-sans">

      {/* 
        ========================================
        LIVE BACKGROUND (Animated Gradients)
        ========================================
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[80vw] h-[80vw] rounded-full bg-blue-600/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-blue-400/5 blur-[150px]"
        />
        <div className="absolute inset-0 bg-[#0B1120]/60 backdrop-blur-[50px]" />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12 relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Video className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">AudioScribe</span>
          </Link>
          <div className="flex items-center gap-6">
            <SignedIn>
              <Link href="/dashboard" className="hidden sm:block text-sm font-semibold hover:text-blue-400 transition">Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-sm font-semibold text-slate-300 hover:text-white transition hidden sm:block">Log in</Link>
              <Link href="/sign-in" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500">
                Get Started
              </Link>
            </SignedOut>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="relative pt-16 pb-15 lg:pt-28 lg:pb-16">
          <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Copy */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
                Meetings<br />
                Captured.<br />
                <span className="text-blue-500">Insights<br />Delivered.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-400 max-w-lg leading-relaxed">
                Record, transcribe, and summarize your meetings automatically with AI. Get to the core of every conversation instantly.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/sign-in" className="flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                  Start Recording Free
                </Link>
              </div>
            </motion.div>

            {/* Right Mockup (Animated Audio Widget) */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mx-auto w-full max-w-sm">
              <div className="rounded-3xl border border-slate-800 bg-[#151E32] p-6 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-3 items-center">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <Video className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">Weekly Sync.mp4</h3>
                      <p className="text-xs text-slate-400">1:42 • Processing...</p>
                    </div>
                  </div>
                  <div className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded">LIVE</div>
                </div>

                {/* Animated Audio Bars */}
                <div className="flex items-end justify-between h-32 gap-1 mb-8">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["20%", "80%", "40%", "100%", "30%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: i * 0.05
                      }}
                      className={`w-full rounded-t-sm ${i % 3 === 0 ? 'bg-blue-500' : 'bg-slate-700'}`}
                      style={{ height: "20%" }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <div className="size-6 rounded-full bg-slate-700" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 bg-slate-700 rounded w-1/3" />
                      <div className="h-2 bg-slate-800 rounded w-full" />
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="size-6 rounded-full bg-slate-700" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 bg-slate-700 rounded w-1/4" />
                      <div className="h-2 bg-slate-800 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 lg:py-16 relative z-10">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Precision<br />Intelligence</h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                Built for teams that value clarity and speed. Our clinical approach to AI ensures every transcript is a source of truth.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-3xl border border-slate-800 bg-[#151E32] p-8 flex flex-col">
                <div className="mb-6 inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-400 self-start">
                  <Video className="size-6" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-white">Record & Transcribe</h3>
                <p className="text-slate-400 mb-8 flex-1">
                  High-quality video capture with real-time speaker identification. Our engine filters background noise and recognizes industry-specific terminology with 99% accuracy.
                </p>
                {/* Mini Mockup inside Card 1 */}
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-2 overflow-hidden h-32 relative">
                  <div className="w-full h-full bg-slate-800 rounded flex flex-col gap-2 p-3">
                    <div className="h-2 w-1/2 bg-slate-700 rounded" />
                    <div className="h-2 w-3/4 bg-blue-500/50 rounded" />
                    <div className="h-2 w-full bg-slate-700 rounded" />
                    <div className="h-2 w-5/6 bg-slate-700 rounded" />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl border border-slate-800 bg-[#151E32] p-8 flex flex-col">
                <div className="mb-6 inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-400 self-start">
                  <FileText className="size-6" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-white">AI Summarization</h3>
                <p className="text-slate-400 mb-8 flex-1">
                  Get concise, actionable summaries and key takeaways automatically generated by our fine-tuned LLMs.
                </p>
                <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  {['Automatic action items', 'Key decisions reached', 'Sentiment analysis'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span className="text-sm text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl border border-slate-800 bg-[#151E32] p-8 flex flex-col">
                <div className="mb-6 inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-400 self-start">
                  <LayoutDashboard className="size-6" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-white">Actionable Results</h3>
                <p className="text-slate-400 mb-8 flex-1">
                  Searchable transcripts and summaries delivered directly to your dashboard or inbox. Integration ready for Slack, Notion, and Jira.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2">
                    <Users className="size-4 text-blue-400" />
                    <div className="h-1 w-1/2 bg-slate-600 rounded" />
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2">
                    <Calendar className="size-4 text-blue-400" />
                    <div className="h-1 w-2/3 bg-slate-600 rounded" />
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2">
                    <CheckCircle2 className="size-4 text-blue-400" />
                    <div className="h-1 w-1/2 bg-slate-600 rounded" />
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2">
                    <Settings className="size-4 text-blue-400" />
                    <div className="h-1 w-3/4 bg-slate-600 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800/50 blur-3xl rounded-full" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                  Ready<br />to upgrade<br />your workflow?
                </h2>
                <p className="text-blue-100 text-lg mb-10 max-w-sm mx-auto">
                  Join 10,000+ professionals who save 5+ hours a week on meeting documentation.
                </p>
                <Link href="/sign-in" className="inline-block rounded-xl bg-white px-10 py-4 text-lg font-bold text-blue-600 transition hover:bg-slate-100 hover:scale-105">
                  Start Your Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1120] py-12 relative z-10">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="bg-blue-600 p-1 rounded transition group-hover:bg-blue-500">
              <Video className="size-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white transition group-hover:text-blue-400">AudioScribe</span>
          </Link>
          <p className="text-slate-500 text-sm mb-8">&copy; {new Date().getFullYear()} AudioScribe Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition">Product</Link>
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition">Pricing</Link>
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition">Security</Link>
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
