// Shared server-side helpers: backend + Keycloak config, authed fetch.
import { cookies } from 'next/headers'

export const API = process.env.API_URL || 'http://localhost:8080'
const KC = process.env.KEYCLOAK_URL || 'http://localhost:8081'
export const REALM = `${KC}/realms/sports`
export const CLIENT_ID = 'sports-api'
export const CALLBACK_URL = '/api/auth/callback'

export const ICT = { timeZone: 'Asia/Ho_Chi_Minh' }

// authed fetches backend with the app cookie; a 401 clears the session so
// the next render shows the login link again.
export async function authed(path: string): Promise<Response> {
  const jar = await cookies()
  const token = jar.get('auth_token')?.value
  if (!token) return new Response('unauthenticated', { status: 401 })
  const res = await fetch(API + path, {
    headers: { Authorization: 'Bearer ' + token },
    cache: 'no-store',
  })
  if (res.status === 401) jar.delete('auth_token')
  return res
}

export type Venue = {
  id: string
  name: string
  address: string
  status: string
  sports: string[]
  distance_km?: number
}

export type PriceRule = {
  weekday: number
  start_minute: number
  end_minute: number
  price_per_hour: number
}

export type Court = {
  id: string
  name: string
  sport: string
  active: boolean
  price_rules?: PriceRule[]
}

export type Slot = { start_at: string; end_at: string; price: number }

export type Booking = {
  id: string
  court_id: string
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'
  start_at: string
  end_at: string
  total_price: number
}

export type Payment = {
  id: string
  amount: number
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED'
  pay_url: string
}

export function money(v: number): string {
  return v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}


