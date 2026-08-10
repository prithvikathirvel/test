"use client"
import "@/app/globals.css"
import ReduxProvider from "@/components/providers/ReduxProvider"
import Header from "@/components/layout/Header"
import Sidenav from "@/components/layout/Sidenav"
import { Box } from "@mui/material"
import { usePathname } from 'next/navigation'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from "@/components/Routes/ProtectedRoute"

const pathsWithoutNav = [
  '/login',
  '/', 
  '/test'
];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Requirement 2: Hide main Sidenav (and general Header) when inside individual Studio flow builder canvas (/studio/[id])
  const isStudioCanvas = pathname.startsWith('/studio/') && pathname !== '/studio';
  const shouldShowNav = !pathsWithoutNav.includes(pathname) && !isStudioCanvas;
  const shouldShowHeader = !pathsWithoutNav.includes(pathname) && !isStudioCanvas;

  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-[#fafafa] text-[#18181b] antialiased">
        <ReduxProvider>
          <Box className="flex h-full bg-[#fafafa]">
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
            
            {shouldShowNav && <Sidenav />}
            <Box className="flex-1 flex flex-col h-full overflow-hidden">
              {shouldShowHeader && <Header title="Sify Aurora" />}
              <Box className="flex-1 overflow-y-auto">
                <ProtectedRoute>{children}</ProtectedRoute>
              </Box>
            </Box>
          </Box>
        </ReduxProvider>
      </body>
    </html>
  );
}
