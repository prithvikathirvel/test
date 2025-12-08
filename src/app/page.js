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
  X
} from "lucide-react"

import LoginDrawer from "@/components/Drawer/LoginDrawer"
import HeroSection from "@/components/Dashboard/HeroSection"
import CustomGradientButton from "@/components/Common/CustomGradientButton"
import { useDispatch,useSelector  } from "react-redux"
import { loginUser } from "@/redux/slices/authSlice"
import { useRouter } from "next/navigation"
import BlurredLoader from "@/components/Common/BlurredLoader"

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
      <LoginDrawer open={open} setOpen={setOpen} handleLogin={handleLogin} error ={error}/>


      <header className="sticky top-0 z-50 bg-transparent">
      
        <Container className="!px-4">
          <Box className="flex items-center justify-between py-3">

            <Box className="flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--primary-color)]" />
              <span className="text-slate-800 font-bold text-lg">
                Sify Aurora
              </span>
            </Box>


            <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-700">
              <button className="hover:text-slate-900 transition-colors">Pricing</button>
              <button className="hover:text-slate-900 transition-colors">Features</button>
              <button className="hover:text-slate-900 transition-colors">Blogs</button>
              <button className="hover:text-slate-900 transition-colors">Community</button>
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
                <button className="text-left px-2 py-2 rounded hover:bg-slate-100">Pricing</button>
                <button className="text-left px-2 py-2 rounded hover:bg-slate-100">Features</button>
                <button className="text-left px-2 py-2 rounded hover:bg-slate-100">Blogs</button>
                <button className="text-left px-2 py-2 rounded hover:bg-slate-100">Community</button>
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


      <HeroSection handleDrawerOpen={handleDrawerOpen} />
    </div>
    )}
    </>
   
  )
}
