import Link from 'next/link'
import { API, type Venue } from '../lib/api'

const SPORTS = ['', 'football', 'tennis', 'badminton', 'pickleball']

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const { sport = '' } = await searchParams
  const res = await fetch(`${API}/venues${sport ? `?sport=${sport}` : ''}`, { cache: 'no-store' })
  const venues = ((await res.json()) as { venues: Venue[] }).venues

  return (
    <>
      <h1>Sân thể thao</h1>
      <p>
        {SPORTS.map(s => (
          <Link key={s} href={s ? `/?sport=${s}` : '/'} style={{ margin: '0 8px' }}>
            {s === '' ? 'Tất cả' : s}
          </Link>
        ))}
      </p>
      <ul>
        {venues.map(v => (
          <li key={v.id}>
            <Link href={`/venues/${v.id}`}>{v.name}</Link>
            {' — '}{v.address}
            {' — '}<i>{v.sports.join(', ')}</i>
          </li>
        ))}
        {venues.length === 0 && <li>Không có sân nào.</li>}
      </ul>
    </>
  )
}
