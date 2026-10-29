import { API, money, ICT, type Court, type Slot, type Venue } from '../../../lib/api'
import { book } from '../../../lib/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const ERRORS: Record<string, string> = {
  'slot-taken': 'Khung giờ vừa bị người khác đặt, chọn giờ khác giúp mình.',
  'registry-expired': 'Phiên đăng nhập hết hạn, đăng nhập lại nhé.',
  error: 'Có lỗi xảy ra, thử lại.',
}

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string; err?: string }>
}) {
  const { id } = await params
  const { date, err } = await searchParams
  const day = date || new Date().toLocaleDateString('en-CA', ICT) // yyyy-mm-dd in ICT

  const detail = (await (await fetch(`${API}/venues/${id}`, { cache: 'no-store' })).json()) as Venue & { courts: Court[] }
  if (!detail.id) {
    return <p>Sân không tồn tại hoặc chưa duyệt.</p>
  }

  const active = detail.courts.filter(c => c.active)
  const slotRows = await Promise.all(active.map(async court => {
    const res = await fetch(`${API}/courts/${court.id}/slots?date=${day}`, { cache: 'no-store' })
    return { court, slots: res.ok ? ((await res.json()) as { slots: Slot[] }).slots : [] }
  }))

  return (
    <>
      <h1>{detail.name}</h1>
      <p>{detail.address}</p>
      {err && <p className="error">{ERRORS[err] ?? err}</p>}

      <form method="get">
        <input type="date" name="date" defaultValue={day} />
        <button>Lọc theo ngày</button>
      </form>

      {slotRows.map(({ court, slots }) => (
        <section key={court.id}>
          <h2>{court.name} <i>({court.sport})</i></h2>
          {court.price_rules && court.price_rules.length > 0 && (
            <p>
              Bảng giá:{' '}
              {court.price_rules
                .map(r => `T${r.weekday} ${vnd(r.start_minute)}–${vnd(r.end_minute)} ${money(r.price_per_hour)}/h`)
                .join(' · ')}
            </p>
          )}
          {slots.length === 0
            ? <p>Hết slot trong ngày này.</p>
            : (
              <ul>
                {slots.map(s => (
                  <li key={s.start_at}>
                    <form action={book}>
                      <input type="hidden" name="court_id" value={court.id} />
                      <input type="hidden" name="start_at" value={s.start_at} />
                      <input type="hidden" name="end_at" value={s.end_at} />
                      <input type="hidden" name="back" value={`/venues/${id}?date=${day}`} />
                      <button>{`${s.start_at.slice(11, 16)}–${s.end_at.slice(11, 16)} — ${money(s.price)}`}</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
        </section>
      ))}
      <p><Link href="/">← Về danh sách sân</Link></p>
    </>
  )
}

function vnd(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}
