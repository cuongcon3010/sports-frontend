'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API } from './api'

// book a slot; on success go to /bookings (payment link lives there).
// Not logged in → start the OAuth flow and come back.
export async function book(formData: FormData) {
  const courtID = String(formData.get('court_id'))
  const startAt = String(formData.get('start_at'))
  const endAt = String(formData.get('end_at'))
  const back = String(formData.get('back'))

  const token = (await cookies()).get('auth_token')?.value
  if (!token) redirect(`/api/auth/login?return=${encodeURIComponent(back)}`)

  const res = await fetch(API + '/bookings', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ court_id: courtID, start_at: startAt, end_at: endAt }),
  })
  if (!res.ok) {
    const msg = res.status === 401
      ? 'registry-expired'        // token hết hạn qua 1h, login lại
      : res.status === 409 ? 'slot-taken'
      : 'error'
    if (res.status === 401) (await cookies()).delete('auth_token')
    redirect(`${back}${back.includes('?') ? '&' : '?'}err=${msg}`)
  }
  redirect('/bookings')
}

export async function cancel(formData: FormData) {
  const id = String(formData.get('id'))
  const token = (await cookies()).get('auth_token')?.value
  if (token) await fetch(`${API}/bookings/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
}
