import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ROUTES = {
  HOME: '/',
  HISTORY: '/history',
};

export default async function middleware(req: NextRequest) {
  // const accessToken = req.cookies.get('accessToken')?.value;
  // console.log('accessToken', accessToken);zz

  const authUser = false;

  if (!authUser) return NextResponse.redirect(new URL('/', req.url), req);

  return NextResponse.next();
}

export const config = {
  matcher: ['/history'],
};
