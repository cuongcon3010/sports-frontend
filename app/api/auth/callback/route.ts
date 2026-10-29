import { NextRequest, NextResponse } from 'next/server'
import { REALM, CLIENT_ID, CALLBACK_URL } from '../../../../lib/api'

// GET /api/auth/callback — exchanges the code for tokens and sets the session cookie.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const verifier = req.cookies.get('pkce')?.value ?? ''
  const [codeVerifier, state] = verifier.split('|')
  const code = url.searchParams.get('code')
  if (!code || !state || url.searchParams.get('state') !== state) {
    return new NextResponse('bad oauth state', { status: 400 })
  }

  const res = await fetch(`${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: new URL(CALLBACK_URL, req.nextUrl.origin).toString(),
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }).toString(),
  })
  if (!res.ok) {
    return new NextResponse(await res.text(), { status: 401 })
  }
  const tok = (await res.json()) as { access_token?: string }

  const out = NextResponse.redirect(new URL(req.cookies.get('return')?.value || '/', req.nextUrl.origin))
  out.cookies.set('auth_token', tok.access_token ?? '', {
    httpOnly: true,
    path: '/',
    maxAge: 3600, // realm access token lifespan; matches realm.json
  })
  out.cookies.delete('pkce')
  out.cookies.delete('return')
  return out
}
