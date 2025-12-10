'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BlurredLoader from '../Common/BlurredLoader';
// Public pages under your basePath
const publicPaths = ['/agent-studio/']; 

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, authLoader } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authLoader) return;
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    // Protect everything except login page
    if (!isAuthenticated && !isPublicPath) {
      router.push('/');  // ✅ Correct redirect
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, authLoader, pathname, router]);

  

  return children;
};

export default ProtectedRoute;
