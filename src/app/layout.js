"use client";
import { Geist } from "next/font/google";
import "@/app/globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Header from "@/components/layout/Header";
import Sidenav from "@/components/layout/Sidenav";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "@/components/Routes/ProtectedRoute";
import { useState } from "react";

const inter = Geist({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
});

// Paths that should not show the global navigation sidebar
const pathsWithoutNav = [
  "/login",
  "/", 
  "/test"
];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const shouldShowNav = !pathsWithoutNav.includes(pathname);

  // Derive title from pathname
  const getPageTitle = () => {
    if (pathname.startsWith("/studio/")) return "Flow Editor";
    if (pathname === "/studio") return "Flow Studio";
    if (pathname === "/knowledge") return "Knowledge Base";
    if (pathname === "/knowledge-graph") return "Knowledge Graph";
    if (pathname === "/settings") return "Settings";
    return "Sify Aurora";
  };

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden bg-[#f8fafc] text-slate-900 antialiased`}>
        <ReduxProvider>
          <Box className="flex h-full w-full bg-[#f8fafc]">
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
            
            {shouldShowNav && (
              <Sidenav open={sidebarOpen} onToggle={setSidebarOpen} />
            )}
            
            <Box className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#f8fafc]">
              <Box className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
                <ProtectedRoute>{children}</ProtectedRoute>
              </Box>
            </Box>
          </Box>
        </ReduxProvider>
      </body>
    </html>
  );
}
