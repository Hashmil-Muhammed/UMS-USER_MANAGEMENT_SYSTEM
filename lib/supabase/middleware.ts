import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Supabase credentials not yet configured
    return response;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect User and Admin Routes
  const isUserRoute = path.startsWith("/user");
  const isAdminRoute = path.startsWith("/admin") && path !== "/admin/login";
  const isAuthRoute = path === "/login" || path === "/register" || path === "/admin/login";
  const isAccountStatusRoute = path === "/account-status";

  if (!user && (isUserRoute || isAdminRoute)) {
    // Unauthenticated user trying to access protected route
    const redirectUrl = new URL(isAdminRoute ? "/admin/login" : "/login", request.url);
    redirectUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    // Fetch profile to verify role and account status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .single();

    if (profile) {
      const { role, account_status } = profile;

      // Status restrictions for non-approved accounts
      if (account_status !== "approved" && (isUserRoute || isAdminRoute)) {
        const statusUrl = new URL("/account-status", request.url);
        statusUrl.searchParams.set("status", account_status);
        return NextResponse.redirect(statusUrl);
      }

      // Role check for Admin route
      if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }

      // Role check for User route: Admins should not access User Panel
      if (isUserRoute && role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      // If user is already logged in and visiting login/register/account-status
      if (isAuthRoute) {
        if (account_status !== "approved") {
          const statusUrl = new URL("/account-status", request.url);
          statusUrl.searchParams.set("status", account_status);
          return NextResponse.redirect(statusUrl);
        }
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/user/dashboard", request.url)
        );
      }

      // If approved user visits /account-status, redirect to dashboard
      if (isAccountStatusRoute && account_status === "approved") {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/user/dashboard", request.url)
        );
      }
    } else if (isUserRoute || isAdminRoute) {
      // User authenticated but profile not yet found or created
      const statusUrl = new URL("/account-status", request.url);
      statusUrl.searchParams.set("status", "pending");
      return NextResponse.redirect(statusUrl);
    }
  }

  return response;
}
