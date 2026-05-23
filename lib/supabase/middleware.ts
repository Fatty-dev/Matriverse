import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected and public routes
  const protectedRoutes = ["/dashboard"];
  const onboardingRoutes = ["/signup/step-2", "/signup/step-3", "/signup/verify"];
  const path = request.nextUrl.pathname;

  // Check if user is trying to access protected routes without auth
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isOnboardingRoute = onboardingRoutes.some((route) => path.startsWith(route));

  // Protect dashboard routes - require authentication
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Onboarding routes require authentication
  if (isOnboardingRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    return NextResponse.redirect(url);
  }

  // Don't redirect from auth pages - let users access login/signup freely
  // The dashboard layout will handle redirecting incomplete profiles back to onboarding

  return supabaseResponse;
}
