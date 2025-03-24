import { Work_Sans } from "next/font/google"
import "@/app/globals.css"
import ReduxProvider from "@/components/providers/ReduxProvider"
import Header from "@/components/layout/Header"
import Sidenav from "@/components/layout/Sidenav"
import WelcomeMessage from "@/components/WelcomeMessage"
import { Box } from "@mui/material"
import './globals.css'
const workSans = Work_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic']
})

export const metadata = {
  title: "Agent Studio",
  description: "AI Agent Development Platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${workSans.className} h-full`}>
        <ReduxProvider>
          <Box className="flex h-full !bg-dark-purple">
            <Sidenav open={false} />
            <Box className="flex-1 flex flex-col min-h-0">
              <Header title="Sify Aurora" />
              <Box className="flex-1 overflow-hidden">
                {children}
              </Box>
            </Box>
          </Box>
        </ReduxProvider>
      </body>
    </html>
  )
}
