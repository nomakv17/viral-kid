import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the base URL dynamically from request headers or environment variables.
 * Works on any port in development and production.
 * Properly handles reverse proxies (Railway, Vercel, etc.) that set x-forwarded-* headers.
 */
export function getBaseUrl(request?: Request): string {
  // If we have a request, extract URL from headers
  if (request) {
    // Check x-forwarded-host first (set by reverse proxies like Railway)
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";

    if (host) {
      return `${protocol}://${host}`;
    }
  }

  // Railway deployment
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Explicit configuration
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Fallback for development
  return "http://localhost:3000";
}
