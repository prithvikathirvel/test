"use client"

import { BookOpen, Github, FileText, Video, Lightbulb, PlayCircle, ArrowRight, ChevronRight, Plus } from "lucide-react"
import AnimatedText from "@/components/Common/AnimatedText"

const resources = [
  {
    title: "Documentation",
    description: "Comprehensive guides and API references to help you get started quickly.",
    icon: BookOpen,
    link: "#",
  },
  {
    title: "GitHub",
    description: "Explore our open-source repositories, contribute, and stay updated with the latest code.",
    icon: Github,
    link: "#",
  },
  {
    title: "Blogs",
    description: "Read the latest articles, tutorials, and insights from our engineering team.",
    icon: FileText,
    link: "#",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides to learn how to use Sify Aurora effectively.",
    icon: Video,
    link: "#",
  },
  {
    title: "Explore Use Cases",
    description: "Discover how other companies are leveraging Sify Aurora for their business needs.",
    icon: Lightbulb,
    link: "#",
  },
  {
    title: "Try Demo",
    description: "Get hands-on experience with our interactive demo environment.",
    icon: PlayCircle,
    link: "#",
  },
]

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="w-full bg-white text-black shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Sify Aurora</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-blue-600 transition-all">
              Docs
            </a>
            <a href="#" className="hover:text-blue-600 transition-all">
              Blog
            </a>
            <a href="#" className="hover:text-blue-600 transition-all">
              Community
            </a>
            <a href="#" className="hover:text-blue-600 transition-all">
              Pricing
            </a>
          </nav>

          <div className="md:hidden">
            <button className="text-black focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>


      <section className="pt-40 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Welcome to Sify Aurora</h2>
          <AnimatedText texts={["Build and Orchestrate Seamless Workflows With AI Agents"]} />
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* <button
            onClick={() => {}}
            className={`px-5 py-2.5 !bg-[var(--primary-color)] hover:cursor-pointer text-white rounded-lg flex items-center font-medium`}
          >
            Get Started <ChevronRight size={20} />
          </button> */}
          </div>
        </div>
      </section>

      <section className="py-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Explore Our Resources</h3>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((res, idx) => (
              <div
                key={idx}
                className="bg-white shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 rounded-xl p-6 flex flex-col h-full"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 text-blue-600 mb-4">
                  <res.icon size={28} className="text-[var(--primary-color)]" />
                </div>
                <h4 className="text-xl font-semibold text-slate-800 mb-2">{res.title}</h4>
                <p className="text-slate-600 flex-grow mb-4">{res.description}</p>
                <a
                  href={res.link}
                  className="inline-flex items-center text-[var(--primary-color)] font-medium hover:underline"
                >
                  Explore {res.title} <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ready to Transform Your Business?</h3>
          <p className="text-lg text-slate-600 mb-6">
            Join thousands of companies that trust Sify Aurora for their cloud-native solutions and digital
            transformation journey.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => { }}
              className={`px-5 py-2.5 !bg-[var(--primary-color)] hover:cursor-pointer text-white rounded-lg flex items-center font-medium justify-center`}
            >
              Start your Free Trail <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded" />
              <h4 className="text-lg font-bold text-slate-800">Sify Aurora</h4>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="text-slate-600 hover:text-slate-800">Docs</button>
              <button className="text-slate-600 hover:text-slate-800">Blog</button>
              <button className="text-slate-600 hover:text-slate-800">Community</button>
              <button className="text-slate-600 hover:text-slate-800">GitHub</button>
              <button className="text-slate-600 hover:text-slate-800">Twitter</button>
            </div>
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">© {new Date().getFullYear()} Sify Aurora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}