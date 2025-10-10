import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Skip API routes we want to allow
  const publicApiRoutes = ['/api/signin', '/api/signup', '/admin'];
  if (publicApiRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Otherwise, run Supabase session logic
  return await updateSession(request);
}

// Match everything except Next.js internals and static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
