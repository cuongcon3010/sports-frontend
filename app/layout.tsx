import { cookies } from 'next/headers'
import Link from 'next/link'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const logged = Boolean(jar.get('auth_token')?.value)
  return (
    <html lang="vi">
      <body>
        <nav>
          <Link href="/">Đặt sân</Link>
          {' · '}
          <Link href="/bookings">Booking của tôi</Link>
          <span className="spacer" />
          {logged
            ? <a href="/api/auth/logout">Đăng xuất</a>
            : <a href={`/api/auth/login?return=${encodeURIComponent('/')}`}>Đăng nhập</a>}
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
