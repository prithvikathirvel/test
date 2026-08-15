"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/demo"]);

const normalizePath = (pathname = "") => {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
};

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, sessionHydrated } = useSelector((state) => state.auth);

  const path = normalizePath(pathname);
  const isPublic =
    PUBLIC_PATHS.has(path) ||
    path === "/admin" ||
    path.startsWith("/admin/");

  useEffect(() => {
    if (!sessionHydrated) return;
    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    }
  }, [isAuthenticated, sessionHydrated, isPublic, router]);

  if (!sessionHydrated) return null;
  if (!isAuthenticated && !isPublic) return null;

  return children;
};

export default ProtectedRoute;
