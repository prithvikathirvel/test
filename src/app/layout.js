"use client"
import {Geist} from "next/font/google"
import "@/app/globals.css"
import ReduxProvider from "@/components/providers/ReduxProvider"
import Header from "@/components/layout/Header"
import Sidenav from "@/components/layout/Sidenav"
import WelcomeMessage from "@/components/WelcomeMessage"
import { Box } from "@mui/material"
import { usePathname } from 'next/navigation'
import './globals.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Geist({ 
  subsets: ["latin"],
  weight: ['400'],
  style: ['normal']
})




// export const metadata = {
//   title: "Agent Studio",
//   description: "AI Agent Development Platform",
// }

// Define paths that should not show navigation components
const pathsWithoutNav = [
  '/login',
  '/', 
  '/test'
];

const pathsWitoutHeader =[
  'login', 
  '/studio/:id',

]

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const shouldShowNav = !pathsWithoutNav.includes(pathname);
  const shouldShowHeader = pathsWitoutHeader.includes(pathname);

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <ReduxProvider>
          <Box className="flex h-full !bg-dark-purple">
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            
            {shouldShowNav && <Sidenav open={false} />}
            <Box className="flex-1 flex flex-col h-full">
              {shouldShowHeader && <Header title="Sify Aurora" />}
              <Box className="flex-1 overflow-y-auto">
                {children}
              </Box>
            </Box>
          </Box>
        </ReduxProvider>
      </body>
    </html>
  );
}
