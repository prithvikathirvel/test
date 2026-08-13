"use client";
import { Geist } from "next/font/google";
import "@/app/globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Sidenav from "@/components/layout/Sidenav";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
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
  "/signup",
  "/",
  "/test",
];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const normalizedPath = (pathname || "/").replace(/\/+$/, "") || "/";

  // Studio Canvas route (/studio/[id]) manages its own full-screen canvas and should NOT display the global sidebar
  const isStudioCanvas = normalizedPath.startsWith("/studio/") && normalizedPath !== "/studio";
  const shouldShowNav = !pathsWithoutNav.includes(normalizedPath) && !isStudioCanvas;

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden bg-[#f8fafc] text-slate-900 antialiased`}>
        <ReduxProvider>
          <Box className="flex h-full w-full bg-[#f8fafc]">
            <Toaster 
              position="top-right"
              richColors
              closeButton
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
