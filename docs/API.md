# 행로 API 계약 (데모)

기본 URL: 데모 서버 `http://127.0.0.1:9090` · 정적 서버만 쓸 때는 `portal-api.js`가 **localStorage 폴백**.

## 공통

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api/health` | `{ ok: true, service: "hangro-demo" }` |

## 상담 (회사)

| 메서드 | 경로 | body | 응답 |
| --- | --- | --- | --- |
| POST | `/api/inquiries` | `name`, `phone`, `email?`, `date?`, `time?`, `type`, `message?` | `{ ok, inquiry }` |
| GET | `/api/inquiries` | — | `{ ok, inquiries: [] }` |

## 예약

| 메서드 | 경로 | body / query | 응답 |
| --- | --- | --- | --- |
| GET | `/api/bookings` | `?guestId=&hostId=` | `{ ok, bookings }` |
| POST | `/api/bookings` | `propertyId`, `checkIn`, `checkOut`, `guests`, `guestName`, `phone?`, `note?` | `{ ok, booking }` |
| PATCH | `/api/bookings/:id` | `{ status: "confirmed"|"rejected"|"pending" }` | `{ ok, booking }` |

Booking 객체: `id`, `propertyId`, `guestId`, `guestName`, `checkIn`, `checkOut`, `status`, `note?`, `createdAt`

## 숙소 편집 (집주인)

| 메서드 | 경로 | body | 응답 |
| --- | --- | --- | --- |
| PATCH | `/api/properties/:id` | partial patch (`name`, `summary`, `stayGuide`, …) | `{ ok, propertyId, patch }` |
| GET | `/api/properties/:id/edits` | — | `{ ok, patch }` |

## 오프라인 키 (localStorage)

| 키 | 용도 |
| --- | --- |
| `hangro_api_bookings` | 예약 목록 |
| `hangro_api_inquiries` | 상담 신청 |
| `hangro_api_property_edits` | 숙소 편집 |
| `hangro_host_filter_day` | 집주인 예약 일자 필터 |
