"use client";

import { useState } from "react";
import { Box, Container } from "@mui/material";
import {
  ArrowRight,
  Bot,
  Sparkles,
  Menu,
  X,
  Check,
  Minus,
  Command
} from "lucide-react";
import LoginDrawer from "@/components/Drawer/LoginDrawer";
import HeroSection from "@/components/Dashboard/HeroSection";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import BlurredLoader from "@/components/Common/BlurredLoader";

const steps = [
  {
    step: "1",
    time: "~2 minutes",
    title: "Connect your documents or APIs",
    description: "Upload PDFs, help docs, or REST API schemas into your Sify Aurora workspace.",
  },
  {
    step: "2",
    time: "Automatic",
    title: "Vector & graph indexing",
    description: "Sify Aurora chunks text for semantic search and maps entities into Neo4j graph schemas.",
  },
  {
    step: "3",
    time: "~3 minutes",
    title: "Orchestrate visual agent flow",
    description: "Connect ReAct nodes, condition routers, and LLMs in an intuitive drag-and-drop canvas.",
  },
  {
    step: "4",
    time: "~1 minute",
    title: "Deploy HTTP endpoint or webhook",
    description: "Publish your agent instantly with automatic scaling and cited source references.",
  },
];

const faqs = [
  {
    q: "I am not technical. Can I really set this up myself?",
    a: "Yes. If you can upload a file and connect visual blocks on a canvas, you can launch Sify Aurora. Most users finish their first agent in under ten minutes.",
  },
  {
    q: "What if the agent makes something up?",
    a: "Sify Aurora answers from your connected RAG documents and Neo4j graph, citing the exact file and page.",
  },
  {
    q: "Where does my data live and who can see it?",
    a: "Your documents stay inside your tenant workspace. Tokens never reach the browser, and you can delete any source anytime.",
  },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const { authLoader } = useSelector((state) => state.auth);

  const handleLogin = async (username, password) => {
    try {
      await dispatch(loginUser({ username: username || "admin", password: password || "admin" })).unwrap();
      router.push("/studio");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
    setError(null);
  };

  return (
    <>
      {authLoader ? (
        <BlurredLoader title="Signing in..." />
      ) : (
        <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900">
          <LoginDrawer
            open={open}
            setOpen={setOpen}
            handleLogin={handleLogin}
            error={error}
          />

          {/* Minimal Header */}
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
            <Container maxWidth="lg" className="!px-4 sm:!px-6 lg:!px-8">
              <Box className="flex items-center justify-between py-3">
                <Box className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#0d47a1] flex items-center justify-center shadow-sm">
                    <Command size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">
                    Sify Aurora
                  </span>
                </Box>

                <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-600">
                  <a href="#steps" className="hover:text-[#0d47a1] transition-colors">How it works</a>
                  <a href="#comparison" className="hover:text-[#0d47a1] transition-colors">Why switch</a>
                  <a href="#faq" className="hover:text-[#0d47a1] transition-colors">FAQ</a>
                </nav>

                <Box className="hidden md:flex items-center gap-2.5">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={handleDrawerOpen}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0d47a1] hover:bg-[#0a3880] text-white font-medium text-xs transition-colors shadow-sm"
                  >
                    Start free
                  </button>
                </Box>

                <button
                  className="md:hidden p-2 text-zinc-600"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </Box>

              {mobileOpen && (
                <Box className="md:hidden pb-4 pt-2 border-t border-zinc-100">
                  <div className="flex flex-col gap-2 text-xs font-medium text-zinc-700">
                    <a href="#steps" className="px-3 py-2 rounded-lg hover:bg-zinc-100">How it works</a>
                    <a href="#comparison" className="px-3 py-2 rounded-lg hover:bg-zinc-100">Why switch</a>
                    <a href="#faq" className="px-3 py-2 rounded-lg hover:bg-zinc-100">FAQ</a>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={handleDrawerOpen}
                        className="w-full py-2.5 rounded-lg bg-[#0d47a1] text-white font-medium text-xs"
                      >
                        Start free
                      </button>
                    </div>
                  </div>
                </Box>
              )}
            </Container>
          </header>

          {/* Minimal Hero Section */}
          <HeroSection handleDrawerOpen={handleDrawerOpen} />

          {/* 4 Short Steps Section */}
          <section id="steps" className="py-20 bg-white border-b border-zinc-200">
            <Container maxWidth="lg" className="!px-4 sm:!px-6 lg:!px-8">
              <div className="max-w-xl mb-12">
                <p className="text-xs font-semibold text-[#0d47a1] uppercase tracking-widest mb-2">
                  Getting started
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  You are four short steps from a live agent workflow.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="h-7 w-7 rounded-full bg-[#0d47a1]/10 text-[#0d47a1] text-xs font-semibold flex items-center justify-center">
                          {s.step}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {s.time}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                        {s.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* What Changes On Day One */}
          <section id="comparison" className="py-20 bg-[#fafafa] border-b border-zinc-200">
            <Container maxWidth="lg" className="!px-4 sm:!px-6 lg:!px-8">
              <div className="max-w-xl mb-12">
                <p className="text-xs font-semibold text-[#0d47a1] uppercase tracking-widest mb-2">
                  Why teams switch
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  What changes on day one.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Without */}
                <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-500 mb-4 pb-3 border-b border-zinc-100">
                    Without Sify Aurora
                  </h3>
                  <ul className="space-y-3 text-xs text-zinc-600">
                    <li className="flex items-start gap-2.5">
                      <Minus size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                      <span>Engineers write custom boilerplate for every LLM and tool integration</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Minus size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                      <span>RAG pipelines hallucinate without structured graph validation</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Minus size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                      <span>Adding multi-agent orchestration takes weeks of custom scripting</span>
                    </li>
                  </ul>
                </div>

                {/* With */}
                <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4 pb-3 border-b border-zinc-100">
                    With Sify Aurora
                  </h3>
                  <ul className="space-y-3 text-xs text-zinc-800">
                    <li className="flex items-start gap-2.5">
                      <Check size={15} className="text-[#0d47a1] shrink-0 mt-0.5" />
                      <span>Visual node canvas connects LLMs, ReAct agents, and REST tools instantly</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={15} className="text-[#0d47a1] shrink-0 mt-0.5" />
                      <span>Hybrid Vector + Neo4j Graph RAG ensures accurate, cited responses</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={15} className="text-[#0d47a1] shrink-0 mt-0.5" />
                      <span>Deploy HTTP endpoints or webhook consumers in one click</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Container>
          </section>

          {/* Minimal FAQ Section */}
          <section id="faq" className="py-20 bg-white border-b border-zinc-200">
            <Container maxWidth="md" className="!px-4 sm:!px-6">
              <div className="mb-12">
                <p className="text-xs font-semibold text-[#0d47a1] uppercase tracking-widest mb-2">
                  Before you sign up
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  The questions new customers ask us.
                </h2>
              </div>

              <div className="space-y-6">
                {faqs.map((f, i) => (
                  <div key={i} className="pb-6 border-b border-zinc-100 last:border-0">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                      {f.q}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Minimal CTA */}
          <section className="py-20 bg-[#fafafa] border-b border-zinc-200">
            <Container maxWidth="md" className="!px-4 sm:!px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">
                Your first agent workflow is ten minutes away.
              </h2>
              <p className="text-xs text-zinc-500 mb-8">
                Create an enterprise workspace, connect a knowledge source, and launch your agent.
              </p>
              <button
                onClick={handleDrawerOpen}
                className="px-6 py-3 rounded-lg bg-[#0d47a1] hover:bg-[#0a3880] text-white font-medium text-sm transition-colors shadow-sm"
              >
                Create free workspace
              </button>
            </Container>
          </section>

          {/* Minimal Footer */}
          <footer className="py-10 bg-white text-xs text-zinc-500">
            <Container maxWidth="lg" className="!px-4 sm:!px-6 lg:!px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900">Sify Aurora</span>
                  <span>•</span>
                  <span>Enterprise AI Agent Platform</span>
                </div>
                <div>
                  &copy; {new Date().getFullYear()} Sify Aurora. All rights reserved.
                </div>
              </div>
            </Container>
          </footer>
        </div>
      )}
    </>
  );
}
