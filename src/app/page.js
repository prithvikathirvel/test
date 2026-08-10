"use client"

import { useState } from "react"
import { Box, Container } from "@mui/material"
import {
  BookOpen,
  Github,
  FileText,
  Video,
  Lightbulb,
  PlayCircle,
  Sparkles,
  Menu,
  X,
  Workflow,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  Bot,
  BrainCircuit,
  MessageSquare,
  BarChart3,
  Mail,
  Twitter,
  Linkedin
} from "lucide-react"

import LoginDrawer from "@/components/Drawer/LoginDrawer"
import HeroSection from "@/components/Dashboard/HeroSection"
import CustomGradientButton from "@/components/Common/CustomGradientButton"
import { useDispatch, useSelector } from "react-redux"
import { loginUser } from "@/redux/slices/authSlice"
import { useRouter } from "next/navigation"
import BlurredLoader from "@/components/Common/BlurredLoader"

const features = [
  {
    icon: Workflow,
    title: "Visual Flow Builder",
    description: "Design complex AI workflows with an intuitive drag-and-drop canvas. Connect nodes, configure logic, and see your agent come to life in real time.",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Go from prototype to production in seconds. Deploy your agents with a single click and scale automatically based on demand.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Built-in encryption, role-based access, and audit logging keep your data and workflows safe at every stage.",
  },
  {
    icon: Layers,
    title: "Multi-Model Support",
    description: "Seamlessly switch between LLM providers—OpenAI, Anthropic, Gemini, and more—without changing your workflow.",
  },
  {
    icon: BrainCircuit,
    title: "Knowledge Integration",
    description: "Connect your documents, databases, and APIs to give your agents domain-specific knowledge and context.",
  },
  {
    icon: MessageSquare,
    title: "Built-in Chat Interface",
    description: "Test and interact with your agents through an embedded chat interface. Share conversational endpoints with your users instantly.",
  },
]

const steps = [
  {
    number: "01",
    title: "Design Your Flow",
    description: "Use the visual canvas to drag and drop AI nodes, tools, and logic blocks into a workflow that matches your use case.",
  },
  {
    number: "02",
    title: "Configure & Connect",
    description: "Set parameters, connect to your data sources, and choose which AI models power each step of your agent.",
  },
  {
    number: "03",
    title: "Test & Iterate",
    description: "Run your agent in the built-in playground, review outputs, and fine-tune behavior until it's exactly right.",
  },
  {
    number: "04",
    title: "Deploy & Monitor",
    description: "Publish your agent with one click. Monitor performance, usage analytics, and logs from a centralized dashboard.",
  },
]

const useCases = [
  {
    icon: Bot,
    title: "Customer Support Agents",
    description: "Automate Tier-1 support with agents that understand context, retrieve knowledge, and escalate intelligently.",
  },
  {
    icon: BarChart3,
    title: "Data Analysis Pipelines",
    description: "Build agents that ingest, transform, and summarize data from multiple sources into actionable insights.",
  },
  {
    icon: FileText,
    title: "Document Processing",
    description: "Extract, classify, and route information from invoices, contracts, and reports at scale.",
  },
  {
    icon: BrainCircuit,
    title: "Research Assistants",
    description: "Create agents that search, synthesize, and summarize academic papers, internal wikis, or web content.",
  },
]

export default function Home() {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [error, setError] = useState(null)

  const router = useRouter()
  const dispatch = useDispatch()

  const { authLoader, authError } = useSelector((state) => state.auth);

  const handleLogin = async (username, password) => {
    try {
      console.log('Attempting login...');
      const result = await dispatch(loginUser({ username, password })).unwrap();
      console.log('Login successful:', result);
      router.push("/studio");
    } catch (error) {
      setError(error.message || "Login failed");
      console.log('Error state after setting:', error);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true)
    setError(null)
  }

  return (
    <>
      {authLoader ? <BlurredLoader title="Logging in..." /> : (
        <div className="min-h-screen bg-[#f5f8fb] flex flex-col">
          <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[var(--primary-color)]/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 w-72 h-72 rounded-full bg-[var(--primary-color)]/10 blur-3xl" />
          <LoginDrawer open={open} setOpen={setOpen} handleLogin={handleLogin} error={error} />

          {/* Header */}
          <header className="sticky top-0 z-50 bg-[#f5f8fb]/80 backdrop-blur-md border-b border-slate-200/50">
            <Container className="!px-4">
              <Box className="flex items-center justify-between py-3">
                <Box className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[var(--primary-color)]" />
                  <span className="text-slate-800 font-bold text-lg">
                    Sify Aurora
                  </span>
                </Box>

                <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-700">
                  <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                  <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
                  <a href="#use-cases" className="hover:text-slate-900 transition-colors">Use Cases</a>
                  <a href="#cta" className="hover:text-slate-900 transition-colors">Community</a>
                </nav>

                <Box className="hidden md:flex">
                  <CustomGradientButton text="Sign in" onClick={handleDrawerOpen} />
                </Box>

                <button
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </Box>

              {mobileOpen && (
                <Box className="md:hidden pb-3">
                  <div className="flex flex-col gap-2 text-[14px] font-medium text-slate-700">
                    <a href="#features" className="text-left px-2 py-2 rounded hover:bg-slate-100">Features</a>
                    <a href="#how-it-works" className="text-left px-2 py-2 rounded hover:bg-slate-100">How It Works</a>
                    <a href="#use-cases" className="text-left px-2 py-2 rounded hover:bg-slate-100">Use Cases</a>
                    <a href="#cta" className="text-left px-2 py-2 rounded hover:bg-slate-100">Community</a>
                    <div className="pt-2">
                      <CustomGradientButton
                        text="Sign in"
                        onClick={() => {
                          setMobileOpen(false)
                          handleDrawerOpen()
                        }}
                      />
                    </div>
                  </div>
                </Box>
              )}
            </Container>
          </header>

          {/* Hero */}
          <HeroSection handleDrawerOpen={handleDrawerOpen} />

          {/* Features Section */}
          <section id="features" className="relative py-20 overflow-hidden">
            <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-100/60 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-[100px]" />
            <Container maxWidth="lg" className="!px-4 relative z-10">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-3 py-1 rounded-full mb-4">
                  <Sparkles size={14} />
                  <span className="text-xs font-semibold tracking-wide">Powerful Capabilities</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Everything you need to build
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[var(--primary-color)]">
                    production-ready AI agents
                  </span>
                </h2>
                <p className="text-[15px] text-slate-600 mt-4 max-w-2xl mx-auto">
                  A complete platform that takes you from idea to deployed agent—without writing a single line of code.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="group p-6 rounded-2xl border border-slate-200 bg-[#f5f8fb] hover:bg-white hover:shadow-lg hover:border-[var(--primary-color)]/20 transition-all duration-300"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[var(--primary-color)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--primary-color)]/15 transition-colors">
                        <Icon size={20} className="text-[var(--primary-color)]" />
                      </div>
                      <h3 className="text-[16px] font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-[14px] text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </Container>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="relative py-20 bg-gradient-to-b from-[#f5f8fb] to-white overflow-hidden">
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-50/80 blur-[80px]" />
            <Container maxWidth="lg" className="!px-4 relative z-10">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-3 py-1 rounded-full mb-4">
                  <PlayCircle size={14} />
                  <span className="text-xs font-semibold tracking-wide">Simple Process</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  From idea to deployment
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[var(--primary-color)]">
                    in four easy steps
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative p-6 rounded-2xl bg-white border border-slate-200">
                    <span className="text-4xl font-extrabold text-[var(--primary-color)]/10">{step.number}</span>
                    <h3 className="text-[16px] font-semibold text-slate-900 mt-2 mb-2">{step.title}</h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed">{step.description}</p>
                    {index < steps.length - 1 && (
                      <ArrowRight size={20} className="hidden lg:block absolute top-1/2 -right-3.5 text-[var(--primary-color)]/30" />
                    )}
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Use Cases Section */}
          <section id="use-cases" className="relative py-20 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 right-0 w-[450px] h-[450px] rounded-full bg-sky-50/70 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 -left-20 w-[350px] h-[350px] rounded-full bg-indigo-50/50 blur-[80px]" />
            <Container maxWidth="lg" className="!px-4 relative z-10">
              <div className="text-center mt-10 mb-14">
                <div className="inline-flex items-center gap-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-3 py-1 rounded-full mb-4">
                  <Lightbulb size={14} />
                  <span className="text-xs font-semibold tracking-wide">Use Cases</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Built for every
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[var(--primary-color)]"> industry </span>
                  and team
                </h2>
                <p className="text-[15px] text-slate-600 mt-4 max-w-2xl mx-auto">
                  See how teams across industries use Sify Aurora to automate complex workflows and unlock new capabilities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {useCases.map((useCase, index) => {
                  const Icon = useCase.icon
                  return (
                    <div
                      key={index}
                      className="flex gap-5 p-6 rounded-2xl border border-slate-200 bg-[#f5f8fb] hover:bg-white hover:shadow-lg hover:border-[var(--primary-color)]/20 transition-all duration-300"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-[var(--primary-color)]/10 flex items-center justify-center">
                        <Icon size={22} className="text-[var(--primary-color)]" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold text-slate-900 mb-1">{useCase.title}</h3>
                        <p className="text-[14px] text-slate-600 leading-relaxed">{useCase.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Container>
          </section>

          {/* Stats Bar */}
          <section className="relative py-14 bg-gradient-to-r from-blue-800 via-[var(--primary-color)] to-blue-900 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
            <div className="pointer-events-none absolute -top-20 left-1/4 w-80 h-80 rounded-full bg-white/5 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 right-1/3 w-96 h-96 rounded-full bg-blue-400/10 blur-[100px]" />
            <Container maxWidth="lg" className="!px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-blue-200 mt-1">Agents Deployed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-blue-200 mt-1">Enterprise Teams</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm text-blue-200 mt-1">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm text-blue-200 mt-1">Integrations</div>
                </div>
              </div>
            </Container>
          </section>

          {/* CTA Section */}
          <section id="cta" className="relative py-24 overflow-hidden">
            {/* Full-width gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[var(--primary-color)] to-blue-900" />
            {/* Mesh overlay pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 180, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(100, 150, 255, 0.2) 0%, transparent 40%), radial-gradient(circle at 60% 80%, rgba(140, 200, 255, 0.2) 0%, transparent 45%)' }} />
            {/* Animated floating shapes */}
            <div className="pointer-events-none absolute top-10 left-[10%] w-24 h-24 rounded-full border border-white/10 animate-float" />
            <div className="pointer-events-none absolute bottom-16 right-[15%] w-16 h-16 rounded-full border border-white/10 animate-float-slow" />
            <div className="pointer-events-none absolute top-1/3 right-[8%] w-3 h-3 rounded-full bg-white/20 animate-float" />
            <div className="pointer-events-none absolute bottom-1/4 left-[20%] w-2 h-2 rounded-full bg-white/15 animate-float-slow" />

            <Container maxWidth="md" className="!px-4 relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full mb-6 border border-white/10">
                  <Sparkles size={14} />
                  <span className="text-xs font-semibold tracking-wide">Start for free — No credit card required</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
                  Ready to build your first
                  <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">AI agent?</span>
                </h2>
                <p className="text-[16px] text-blue-100/80 mb-10 max-w-lg mx-auto leading-relaxed">
                  Join thousands of teams already using Sify Aurora to ship intelligent automation faster than ever.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleDrawerOpen}
                    className="px-8 py-3 rounded-lg bg-white text-[var(--primary-color)] font-semibold text-[15px] shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 transition-all duration-200"
                  >
                    Get Started Free
                  </button>
                  <button className="px-8 py-3 rounded-lg border border-white/25 text-white font-medium text-[15px] hover:bg-white/10 transition-all duration-200">
                    Talk to Sales
                  </button>
                </div>
              </div>
            </Container>
          </section>

          {/* Footer */}
          <footer className="relative py-10 bg-slate-50 border-t border-slate-200 overflow-hidden">
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-blue-50/50 blur-[80px]" />
            <Container maxWidth="lg" className="!px-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-[var(--primary-color)]" />
                    <span className="text-slate-800 font-bold text-[15px]">Sify Aurora</span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    The visual AI agent builder for teams that move fast.
                  </p>
                </div>

                <div>
                  <h4 className="text-[13px] font-semibold text-slate-800 mb-3 uppercase tracking-wider">Product</h4>
                  <ul className="space-y-2 text-[13px] text-slate-500">
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Features</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Pricing</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Integrations</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Changelog</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[13px] font-semibold text-slate-800 mb-3 uppercase tracking-wider">Resources</h4>
                  <ul className="space-y-2 text-[13px] text-slate-500">
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Documentation</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">API Reference</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Blog</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Tutorials</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[13px] font-semibold text-slate-800 mb-3 uppercase tracking-wider">Company</h4>
                  <ul className="space-y-2 text-[13px] text-slate-500">
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">About</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Careers</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Privacy Policy</li>
                    <li className="hover:text-slate-700 cursor-pointer transition-colors">Terms of Service</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between mt-10 pt-6 border-t border-slate-100">
                <p className="text-[12px] text-slate-400">&copy; 2026 Sify Aurora. All rights reserved.</p>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <Twitter size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                  <Linkedin size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                  <Github size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                  <Mail size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                </div>
              </div>
            </Container>
          </footer>
        </div>
      )}
    </>
  )
}
