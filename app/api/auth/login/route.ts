import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { REALM, CLIENT_ID, CALLBACK_URL } from '../../../../lib/api'

// GET /api/auth/login?return=/bookings — starts the PKCE authorization-code flow.
export function GET(req: NextRequest) {
  const back = new URL(req.url).searchParams.get('return') || '/'
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest().toString('base64url')
  const state = crypto.randomBytes(16).toString('base64url')

  const q = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'openid',
    redirect_uri: new URL(CALLBACK_URL, req.nextUrl.origin).toString(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  }).toString()

  const res = NextResponse.redirect(`${REALM}/protocol/openid-connect/auth?${q}`)
  const opt = { httpOnly: true, path: '/', maxAge: 600, sameSite: 'lax' as const }
  res.cookies.set('pkce', `${verifier}|${state}`, opt)
  res.cookies.set('return', back, opt)
  return res
}
