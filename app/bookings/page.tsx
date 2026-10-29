import { authed, money, type Booking, type Payment } from '../../lib/api'
import { cancel } from '../../lib/actions'

export const dynamic = 'force-dynamic'

const PAYED: Record<string, string> = {
  HELD: 'Chưa trả tiền',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã huỷ',
  EXPIRED: 'Hết hạn',
}

export default async function MyBookings() {
  let bookings: Booking[] = []
  const res = await authed('/bookings/me')
  if (!res.ok) {
    return <p>Cần <a href="/api/auth/login?return=/bookings">đăng nhập</a> để xem booking.</p>
  }
  bookings = ((await res.json()) as { bookings: Booking[] }).bookings
    .sort((a, b) => b.start_at.localeCompare(a.start_at))

  // payment link for a not-yet-paid booking
  const links = await Promise.all(bookings.map(async b => {
    if (b.status !== 'HELD') return ''
    const p = (await (await authed('/payments/' + b.id)).json()) as Payment
    return p.pay_url ?? ''
  }))

  return (
    <>
      <h1>Booking của tôi</h1>
      <ul>
        {bookings.map((b, i) => (
          <li key={b.id}>
            {b.start_at.slice(0, 16).replace('T', ' ')} — {PAYED[b.status]} — {money(b.total_price)}
            {links[i] && (
              <>
                {' — '}<a href={links[i]}>Thanh toán</a>
              </>
            )}
            {(b.status === 'HELD' || b.status === 'CONFIRMED') && (
              <form action={cancel} style={{ display: 'inline' }}>
                <input type="hidden" name="id" value={b.id} />
                <button> Huỷ</button>
              </form>
            )}
          </li>
        ))}
        {bookings.length === 0 && <li>Chưa có booking nào.</li>}
      </ul>
    </>
  )
}
