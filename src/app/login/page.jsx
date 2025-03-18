"use client";
 
import { useState } from "react";
import LoginDrawer from "@/components/Login/LoginDrawer";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { redirect } from "next/navigation";
import AnimatedText from "@/components/Common/AnimatedText";
 
export default function LoginPage() {
  const [open, setOpen] = useState(false);
 
  const handleLogin = (username,password) => {
    console.log("Logging in with:", { username, password });
    if(username == 'admin' && password == "admin"){
      redirect("/");
    }
  };
 
  return (
    <div
    className="relative flex justify-center items-center h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >      
    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10 flex flex-col items-center text-center text-white w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-2 whitespace-nowrap">
          Welcome to Agent Studio
        </h1>
        <AnimatedText texts={["Build and Orchestrate Seamless Workflows With AI Agents"]} />
        <button
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all transform hover:translate-x-1"
          onClick={() => setOpen(true)}
        >
          Login
          <ArrowForwardIosIcon className="text-white" />
        </button>
      </div>
 
      <LoginDrawer open={open} setOpen={setOpen} handleLogin={handleLogin} />
    </div>
  );
}