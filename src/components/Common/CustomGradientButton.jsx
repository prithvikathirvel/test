"use client"

import { Button } from "@mui/material" 
import { ArrowRight } from "lucide-react"

export default function CustomGradientButton({ text, onClick }) {
  return (
    <Button
    variant="contained"
      className="h-8 !normal-case !bg-gradient-to-r from-blue-700 to-blue-900"
      onClick={onClick}
    >
     {text}
     <ArrowRight size={15} className="ml-2" />
    </Button>
  );
}
