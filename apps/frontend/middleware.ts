import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')
    const { pathname } = request.nextUrl

    //protected routes for logged in users
    const isAdminPath = pathname.startsWith('/admin')
    const isAccountDashboardPath =
        pathname.startsWith('/account') &&
        !pathname.startsWith('/account/login') &&
        !pathname.startsWith('/account/register')

    if (isAdminPath && !token) {
        //user is on admin dashboard but not logged in -> redirect to admin login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAccountDashboardPath && !token) {
        //user is on account dashboard but not logged in -> redirect to account login
        return NextResponse.redirect(new URL('/account/login', request.url))
    }

    // NOTE: intentionally no "logged-in user on /account/login -> /account"
    // redirect here. Middleware can only check cookie *existence*, not validity
    // (expired/invalid JWT, deleted or suspended user). Redirecting on existence
    // alone ping-pongs with AccountAuthGuard when the token is stale:
    // middleware pushes to /account, guard pushes back to /account/login.
    // Auth validity is resolved client-side via useMe() + server 401 handling.

    return NextResponse.next()
}

//Only run middleware on account routes to keep the site fast
export const config = {
    matcher: ['/account/:path*', '/admin/:path*'],
};
