# sports-frontend

Frontend Next.js 15 (App Router) cho hệ thống đặt sân thể thao; API backend nằm ở repo `Cuong20c2-CNPM/sports field`.

## Chạy nhanh

```bash
# Backend + dịch vụ (Postgres/Redis/MinIO/Keycloak) chạy trước từ repo backend:
#   podman compose -f deploy/compose.yaml up -d && go run ./cmd/api

npm install
npm run dev     # http://localhost:3000
```

`.env` mặc định khớp compose backend:

```
KEYCLOAK_URL=http://localhost:8081
API_URL=http://localhost:8080
```

## Trang

| Route | Chức năng |
|---|---|
| `/` | Danh sách sân (lọc theo môn) — public |
| `/venues/{id}` | Chi tiết venue/sân, bảng giá, chọn ngày + đặt slot (nút từng khung giờ) |
| `/bookings` | Booking của tôi (cần đăng nhập): link "Thanh toán" cho booking ĐANG_hold đến `pay_url` (link stub hoặc VietQR), nút huỷ |
| `/api/auth/login?return=…` | Bắt đầu login Keycloak (PKCE, client public `sports-api`) |
| `/api/auth/callback` | Nhận code, đổi token, set cookie phiên (`auth_token`, httpOnly, 1 giờ) |
| `/api/auth/logout` | Xoá cookie app (SSO session Keycloak không bị kill) |

Không có thành phần client nào — toàn bộ dữ liệu fetch server-side; đặt/huỷ là server action; không token nào xuất hiện trong HTML.

## Những gì chưa có (cố tình)

- Trang admin (duyệt venue, hoàn tiền) — endpoint backend có sẵn, UI pending.
- Refresh token: cookie phiên 1 giờ (Keycloak token lifespan được nâng trong realm.json). Phần cookie hết hạn cần login lại; có thể thêm refresh token sau.
- Trang admin đăng nhập bằng Google vẫn dùng chung keycloak; `go` đăng nhập từ nút ở Keycloak hoặc `kc_idp_hint=google`.
