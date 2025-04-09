import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { motion } from 'framer-motion';
import AnimatedText from '@/components/Common/AnimatedText'
import PrimaryButton from '../Common/PrimaryButton';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({handleDrawerOpen}
) {


  const motionCards =[
    { title: "AI-Powered", desc: "Advanced artificial intelligence" },
    { title: "Seamless Integration", desc: "Works with your existing tools" },
    { title: "Powerful Automation", desc: "Save time and resources" }
  ]

  return (
    <Box 
      component="section" 
      className="pt-40 pb-20"
    >
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-200 mix-blend-multiply filter blur-xl opacity-100"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-purple-100 mix-blend-multiply filter blur-xl opacity-100"></div>
      <Container maxWidth="lg" className="relative z-10">
        <Box className="max-w-4xl mx-auto px-4 text-center">

        <Typography 
              variant="h2" 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 tracking-tight"
            >
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[var(--primary-color)]">Sify Aurora</span>
            </Typography>
          
          <Box className='h-10'>
            <AnimatedText texts={["Build and Orchestrate Seamless Workflows With AI Agents"]} />
          </Box>
          
          <Box className="flex flex-col sm:flex-row justify-center gap-4 mt-6 mb-30">

              <PrimaryButton
                onClick={handleDrawerOpen}
                text="Get Started"
                icon={<ArrowRight size={14}/>}
                width="150px"
                height="50px"
                textColor="#ffffff"
                hoverColor="#0056b3"
                className="bg-[var(--primary-color)] "
              />
              
            </Box>
          
          {/* Added feature highlights */}
        {/* <Box className='mt-16 flex flex-row justify-between items-center'>
        {motionCards.map((item, index) => (
              <Box key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <Typography variant="h6" className="font-bold text-slate-800 mb-2">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="text-slate-600">
                  {item.desc}
                </Typography>
              </Box>
            ))}
        </Box> */}
        </Box>
      </Container>

    </Box>
  );
}