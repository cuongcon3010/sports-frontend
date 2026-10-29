import { NextRequest, NextResponse } from 'next/server'

// GET /api/auth/logout — clears the app session (Keycloak SSO session stays).
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.nextUrl.origin))
  res.cookies.delete('auth_token')
  return res
}
