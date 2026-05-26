import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const adminAuthenticated = request.cookies.get('admin_authenticated')?.value;

    // If not authenticated, redirect to login
    if (adminAuthenticated !== 'true') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/rewrites/:path*', '/admin/users/:path*'],
};
