"use client"
import { motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles, Zap, Code, Brain, Rocket, BookOpen, Github, FileText, Video, Lightbulb, PlayCircle } from "lucide-react";
import { Typography } from "@mui/material";
import { Box, Container } from "@mui/material";
import PrimaryButton from "@/components/Common/PrimaryButton";

const AIAgentLanding = () => {

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
  return (
    <div className={`h-[200vh] bg-black text-foreground p-2`}>



      <div className="w-[80%] mx-auto">

        {/* <header className="bg-[#1b1b1b] text-white p-3 w-[80%] mx-auto rounded-4xl flex justify-between items-center">
          <Typography variant="body2" fontWeight="bold">Sify Aurora</Typography>

          <ul className="flex justify-center gap-4 cursor-pointer">
            <Typography variant="caption" className=" text-[#a3a3a3]">Features</Typography>
            <Typography variant="caption" className=" text-[#a3a3a3]">Pricing</Typography>
            <Typography variant="caption" className=" text-[#a3a3a3]">Blog</Typography>
          </ul>
        </header> */}

        <Container className="!w-full !h-full flex flex-row  justify-between !items-center  !text-white  !p-3">

          <Box className='flex items-center'>
            <Typography variant="h6" className="!font-bold text-slate-500">Sify Aurora</Typography>
          </Box>

          <Box className='flex flex-row gap-12 items-center text-white cursor-pointer'>
            <Typography variant="body2" className="hover:text-slate-500">Pricing</Typography>
            <Typography variant="body2" className="hover:text-slate-500">Features</Typography>
            {/* <Typography variant="body2" className="hover:text-slate-500">Blogs</Typography> */}
            <Typography variant="body2" className="hover:text-slate-500">Community</Typography>
            <PrimaryButton
              onClick={() => { }}
              text="Sign in"
              icon={''}
              width="80px"
              height="30px"
              textColor="#ffffff"
              hoverColor="#0056b3"
              className="!rounded-4xl text-[12px] !font-bold"
            />
          </Box>



        </Container>



        <div className="h-[80vh]">
          <p>ji</p>


          <div className="border border-white h-[70vh] w-auto whitespace-normal p-4 flex flex-col justify-center">
            <div className="bg-[#ffffff0d] w-[220px] p-1.5 rounded-4xl flex items-center gap-2 mb-4">
              <Sparkles size={12} color="white" />
              <p className="text-[12px] text-white text-center font-geist">
                Future of AI Agent Development
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl text-white  leading-tight">
              Build Intelligent
            </h1>
            <h2 className="text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-[var(--primary-color)] mb-4">
              AI Agents Effortlessly
            </h2>
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[var(--primary-color)]">Sify Aurora</span> */}

            <p className="text-[15px] text-white mb-1">
              Transform your ideas into powerful AI agents with our intuitive visual builder.
            </p>
            <p className="text-[15px] text-white mb-4">
              No coding required—just drag, drop, and deploy intelligent automation solutions.
            </p>

            <button className="bg-blue-500 w-[180px] text-white font-bold py-2 px-4 rounded">
              Get Started
            </button>

            {/* <aclassName="text-blue-500 hover:text-blue-600 transition-all">
              Learn More
            </a> */}
          </div>


          <div className="border border-white h-[70vh] w-auto whitespace-normal p-4 flex flex-col justify-center">
            
          <h1 className="text-4xl sm:text-5xl text-white  leading-tight">
          Revolutionary Features
            </h1>
            <h2 className="text-4xl sm:text-5xl text-white  mb-4">
            for Modern AI Agents
            </h2>

            <p className="text-[15px] text-white mb-1">
            Empower your business with cutting-edge tools designed for the next
            </p>
            <p className="text-[15px] text-white mb-4">generation of AI automation.</p>
            
          </div>

          {/* <section className="py-10">
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
                </section> */}

        </div>
      </div>
    </div>
  );
};

export default AIAgentLanding;