"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@mui/material";
import {
  Menu,
  X,
  Workflow,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Bot,
  BrainCircuit,
  MessageSquare,
  BarChart3,
  Mail,
  Twitter,
  Linkedin,
  Github,
  Server,
  FileCode,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import LoginDrawer from "@/components/Drawer/LoginDrawer";
import HeroSection from "@/components/Dashboard/HeroSection";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import BlurredLoader from "@/components/Common/BlurredLoader";

const features = [
  {
    icon: Workflow,
    title: "Visual Node Builder",
    description: "Design multi-step agentic pipelines with intuitive node connections, state management, and real-time execution graphs.",
  },
  {
    icon: Server,
    title: "Model Context Protocol (MCP)",
    description: "Native support for MCP tools. Connect your local filesystem, database engines, and external API services effortlessly.",
  },
  {
    icon: Layers,
    title: "Multi-Model Orchestration",
    description: "Switch seamlessly between OpenAI, Anthropic Claude, Google Gemini, and open-source models per individual node.",
  },
  {
    icon: BrainCircuit,
    title: "Contextual Knowledge Retrieval",
    description: "Ingest documents, PDFs, and relational tables to power your agents with high-accuracy vector embeddings and hybrid RAG.",
  },
  {
    icon: Zap,
    title: "Instant Execution & Testing",
    description: "Run nodes in isolation with simulated variable payloads, inspect intermediate JSON outputs, and iterate rapidly.",
  },
  {
    icon: Shield,
    title: "Enterprise Governance",
    description: "Built-in role-based access, secret management, sanitized variable masking, and comprehensive audit logs.",
  },
];

const steps = [
  {
    number: "01",
    title: "Define Node Graph",
    description: "Drag AI reasoning models, tools, and decision branches onto the visual canvas.",
  },
  {
    number: "02",
    title: "Configure Parameters",
    description: "Map variables, system prompts, database URIs, and knowledge base sources.",
  },
  {
    number: "03",
    title: "Test & Inspect",
    description: "Simulate runs in the built-in playground and inspect step-by-step token latencies.",
  },
  {
    number: "04",
    title: "Deploy Production Endpoints",
    description: "Publish your autonomous workflow with one-click REST and WebSocket APIs.",
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
      await dispatch(loginUser({ username, password })).unwrap();
      router.push("/studio");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
    setError(null);
  };

  return (
    <>
      {authLoader && <BlurredLoader title="Authenticating..." />}

      <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-900">
        <LoginDrawer open={open} setOpen={setOpen} handleLogin={handleLogin} error={error} />

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
          <Container maxWidth="lg" className="!px-4">
            <div className="flex items-center justify-between py-3.5">
              {/* Brand Logo */}
              <div className="flex items-center gap-2.5">
                <Image
                  src="/agent-studio/branding/aurora-logo.png"
                  alt="Sify Aurora"
                  width={100}
                  height={40}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
                <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-slate-900 transition-colors">Architecture</a>
                <a href="#integrations" className="hover:text-slate-900 transition-colors">Integrations</a>
                <a href="#cta" className="hover:text-slate-900 transition-colors">Documentation</a>
              </nav>

              {/* Action Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={handleDrawerOpen}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleDrawerOpen}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition-colors"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
              <div className="md:hidden py-4 border-t border-slate-100 flex flex-col gap-3 text-sm font-medium text-slate-700">
                <a href="#features" onClick={() => setMobileOpen(false)} className="px-2 py-1.5 rounded hover:bg-slate-100">Features</a>
                <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="px-2 py-1.5 rounded hover:bg-slate-100">Architecture</a>
                <a href="#integrations" onClick={() => setMobileOpen(false)} className="px-2 py-1.5 rounded hover:bg-slate-100">Integrations</a>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileOpen(false); handleDrawerOpen(); }}
                    className="w-full py-2 text-center text-xs font-semibold text-white bg-indigo-600 rounded-lg"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </Container>
        </header>

        {/* Hero Section */}
        <HeroSection handleDrawerOpen={handleDrawerOpen} />

        {/* Metrics Strip */}
        <section className="py-12 bg-white border-y border-slate-200/80">
          <Container maxWidth="lg" className="!px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-900 font-mono">10M+</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Node Executions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 font-mono">99.99%</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 font-mono">&lt;240ms</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Median Latency</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 font-mono">50+</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">MCP Integrations</div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Bento Section */}
        <section id="features" className="py-20 bg-[#f8fafc]">
          <Container maxWidth="lg" className="!px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Capabilities
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
                Everything required to ship production agent workflows
              </h2>
              <p className="text-slate-500 text-sm mt-3">
                From visual prototyping to scalable containerized execution, Aurora streamlines agent operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
          <Container maxWidth="lg" className="!px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Workflow
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
                From architecture to deployment in minutes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative"
                >
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100 inline-block">
                    {s.number}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">{s.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Bottom CTA Banner */}
        <section id="cta" className="py-20 bg-[#f8fafc]">
          <Container maxWidth="md" className="!px-4">
            <div className="p-10 sm:p-14 bg-slate-900 text-white rounded-3xl shadow-xl text-center space-y-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />

              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
                Start Building Today
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-lg mx-auto leading-tight">
                Ready to orchestrate intelligent AI agents?
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Join engineering teams shipping autonomous automation with Sify Aurora.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDrawerOpen}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Get Started Free
                </button>
                <button
                  onClick={handleDrawerOpen}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </Container>
        </section>

        {/* Multi-Column Footer */}
        <footer className="mt-auto py-12 bg-white border-t border-slate-200/80 text-xs text-slate-500">
          <Container maxWidth="lg" className="!px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
              <div className="col-span-2 space-y-3">
                <div className="flex items-center">
                  <Image
                    src="/agent-studio/branding/aurora-logo.png"
                    alt="Sify Aurora"
                    width={100}
                    height={36}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Enterprise visual AI agent builder and workflow orchestration platform.
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Product</h5>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#features" className="hover:text-slate-900 transition-colors">Visual Studio</a></li>
                  <li><a href="#features" className="hover:text-slate-900 transition-colors">MCP Servers</a></li>
                  <li><a href="#features" className="hover:text-slate-900 transition-colors">Knowledge RAG</a></li>
                  <li><a href="#features" className="hover:text-slate-900 transition-colors">Integrations</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Resources</h5>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Node Catalog</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Changelog</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Company</h5>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
              <p>&copy; 2026 Sify Aurora. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Twitter size={15} className="hover:text-slate-600 cursor-pointer" />
                <Linkedin size={15} className="hover:text-slate-600 cursor-pointer" />
                <Github size={15} className="hover:text-slate-600 cursor-pointer" />
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </>
  );
}
