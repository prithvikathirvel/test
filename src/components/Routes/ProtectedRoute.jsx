"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

const normalizePath = (pathname = "") => {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
};

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoader } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authLoader) return;
    const path = normalizePath(pathname);
    if (!isAuthenticated && !PUBLIC_PATHS.has(path)) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoader, pathname, router]);

  return children;
};

export default ProtectedRoute;
