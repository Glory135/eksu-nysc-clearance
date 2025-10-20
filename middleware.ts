import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = ["/login", "/register"]
const roleRoutes = {
  student: ["/student"],
  hod: ["/hod"],
  admissions_officer: ["/admissions"],
  super_admin: ["/admin"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get the token from the request
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
  })

  const isLoggedIn = !!token
  const userRole = token?.role as string

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn && pathname === "/login") {
      // Redirect logged-in users away from login
      const redirectPath = userRole === "student" ? "/student/dashboard" : `/${userRole}/dashboard`
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
    return NextResponse.next()
  }

  // Require authentication for protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (userRole === "admissions_officer" && pathname.startsWith("/admissions")) {
    // The auth check in authorize() already validates isActiveOfficer and admission code
    // This is just an additional layer to ensure only active officers can access
    // The actual validation happens during login in the authorize function
  }

  // Check role-based access
  if (userRole) {
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || []
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route))

    if (!hasAccess && pathname !== "/") {
      // Super admins can access admin routes
      if (userRole === "super_admin" && pathname.startsWith("/admin")) {
        return NextResponse.next()
      }
      const redirectPath =
        userRole === "student" ? "/student/dashboard"
          : userRole === "super_admin" ? "/admin/dashboard"
            : userRole === "admissions_officer" ? "/admissions/dashboard"
              : userRole === "hod" ? "/hod/dashboard"
                : `/${userRole}/dashboard`
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Exclude API and Next internals as well as common static asset extensions
  // so requests for images, svgs, etc. (served from /public) are not
  // intercepted by the auth middleware and redirected to /login.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)"],
}
