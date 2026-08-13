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
    // The admin console manages its own (separate) authentication and must not
    // be gated by the regular user session.
    if (path === "/admin" || path.startsWith("/admin/")) return;
    if (!isAuthenticated && !PUBLIC_PATHS.has(path)) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoader, pathname, router]);

  return children;
};

export default ProtectedRoute;
