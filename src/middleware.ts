import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/simple(.*)',
  '/test(.*)',
  '/api/webhooks(.*)',
  '/api/internal(.*)',
  '/api/promotions(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth for public routes
  if (isPublicRoute(req)) return;

  // Protect all other routes — redirects unauthenticated users to /sign-in
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
