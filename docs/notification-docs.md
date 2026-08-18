# Desain Database — Notification (HRIS)

Dokumen ini menjelaskan struktur data untuk modul notifikasi pada sistem HRIS. Prinsip utamanya:

- **Isi notifikasi terpisah dari penerima** — satu notifikasi bisa dikirim ke satu orang atau ribuan orang tanpa duplikasi baris isi pesan (`notifications` vs `notification_recipients`).
- **Target berbasis grup, bukan hanya user** — pengumuman HR bisa menyasar seluruh karyawan, satu departemen, satu jabatan, satu cabang, atau satu role, lalu di-*resolve* menjadi daftar penerima (`notification_targets`).
- **Delivery per channel dicatat terpisah** — status kirim di in-app, email, push, dan sms tidak saling menimpa, sehingga bisa diaudit dan di-retry per channel (`notification_deliveries`).
- **Template, bukan hardcode** — teks notifikasi disusun dari template + data variabel (`notification_templates`), supaya format pesan bisa berubah tanpa mengubah kode.
- **Referensi generik ke modul lain** — `reference_type` + `reference_id` dipakai alih-alih foreign key ke setiap modul (leave, payroll, attendance, dst), sehingga satu desain notifikasi bisa dipakai untuk semua modul HRIS tanpa membuat modul notifikasi bergantung ke skema modul lain.

## Daftar Isi

1. [Struktur Utama](#1-struktur-utama)
2. [notification_templates](#2-notification_templates)
3. [notifications](#3-notifications)
4. [notification_targets](#4-notification_targets)
5. [notification_recipients](#5-notification_recipients)
6. [notification_deliveries](#6-notification_deliveries)
7. [notification_preferences](#7-notification_preferences)
8. [Diagram Relasi](#8-diagram-relasi)
9. [Contoh Alur](#9-contoh-alur)
10. [Struktur Modul Aplikasi](#10-struktur-modul-aplikasi)
11. [Catatan Desain](#11-catatan-desain)

## 1. Struktur Utama

```
notification_templates
        │
        ▼
notifications
        │
        ├── notification_targets     (siapa yang dituju, sebelum di-resolve)
        │
        └── notification_recipients  (siapa yang benar-benar menerima)
                    │
                    └── notification_deliveries  (status kirim per channel)

notification_preferences
        │
        └── users  (channel apa yang mau diterima tiap user, per tipe notifikasi)
```

## 2. `notification_templates`

Menyimpan format pesan per tipe notifikasi, supaya tidak hardcode di kode aplikasi.

```
notification_templates
- id
- code
- name
- title_template
- body_template
- category
- is_active
- created_at
- updated_at
```

Contoh:

```
code            = LEAVE_APPROVED
title_template  = Pengajuan Cuti Disetujui
body_template   = Pengajuan cuti {{start_date}} sampai {{end_date}} telah disetujui.
category        = LEAVE
```

Saat dikirim, backend memberikan data variabel:

```json
{
  "start_date": "20 Agustus 2026",
  "end_date": "22 Agustus 2026"
}
```

## 3. `notifications`

Menyimpan isi/event notifikasi — **bukan** siapa yang menerima. Satu baris di sini bisa mewakili notifikasi yang dikirim ke satu orang maupun ke ratusan orang.

```
notifications
- id
- template_id
- type
- category
- title
- body
- priority
- reference_type
- reference_id
- action_url
- data
- scheduled_at
- published_at
- created_at
- updated_at
```

`priority`:

| Nilai | Keterangan |
|---|---|
| `low` | Informasi umum, tidak mendesak |
| `normal` | Default |
| `high` | Perlu perhatian segera (mis. approval pending) |
| `urgent` | Kritikal (mis. gagal absen, deadline hari ini) |

Contoh data:

```
type            = LEAVE_APPROVED
category        = LEAVE
title           = Cuti Disetujui
body            = Pengajuan cuti Anda telah disetujui.
priority        = normal

reference_type  = leave_request
reference_id    = 8f31...
action_url      = /employee/leave/8f31...
```

`data` (JSON) menyimpan konteks tambahan untuk kebutuhan tampilan (badge, ikon, detail cepat) tanpa perlu join ke modul asal:

```json
{
  "leave_id": "8f31...",
  "leave_type": "annual",
  "start_date": "2026-08-20",
  "end_date": "2026-08-22"
}
```

`scheduled_at` dipakai untuk notifikasi terjadwal (mis. pengingat H-1 sebelum jadwal medical check up); worker mem-publish notifikasi saat `scheduled_at` tercapai dan mengisi `published_at`.

## 4. `notification_targets`

Dipakai untuk pengumuman/broadcast — menyimpan **target sebelum di-resolve** menjadi daftar user. Untuk notifikasi personal (mis. approval cuti), tabel ini boleh dilewati dan langsung membuat `notification_recipients`.

```
notification_targets
- id
- notification_id
- target_type
- target_id
- created_at
```

`target_type`:

| Nilai | Keterangan | `target_id` |
|---|---|---|
| `user` | Satu karyawan tertentu | `user_id` |
| `department` | Satu departemen | `department_id` |
| `position` | Satu jabatan | `position_id` |
| `branch` | Satu cabang | `branch_id` |
| `role` | Satu role (mis. `MANAGER`) | `role_id` |
| `all` | Seluruh karyawan aktif | `NULL` |

Contoh:

```
notification   = "Jadwal Medical Check Up"
target_type    = department
target_id      = IT_DEPARTMENT_ID
```

Proses resolve:

```
notification_targets (target_type = department, target_id = IT)
        ↓
ambil semua employee di department IT
        ↓
insert ke notification_recipients (satu baris per employee)
```

## 5. `notification_recipients`

Bagian paling penting — mengaitkan satu notifikasi ke banyak user, sekaligus menyimpan status baca per user.

```
notification_recipients
- id
- notification_id
- user_id
- is_read
- read_at
- created_at
- updated_at
```

- Kombinasi `(notification_id, user_id)` harus unik.
- Index `(user_id, is_read)` dipakai untuk query "notifikasi belum dibaca milik user X" — ini query paling sering dipanggil (badge counter, list notifikasi).

Contoh — HR mengirim "Pengumuman Libur Hari Kemerdekaan" ke 500 karyawan menghasilkan **1 baris** di `notifications` dan **500 baris** di `notification_recipients`, bukan 500 baris `notifications`.

```
notifications (1 baris)
       │
       ├── notification_recipients: user A
       ├── notification_recipients: user B
       ├── notification_recipients: user C
       ├── ...
       └── notification_recipients: user 500
```

## 6. `notification_deliveries`

Status pengiriman per channel, per penerima. Terpisah dari `notification_recipients` karena satu penerima bisa menerima lewat beberapa channel sekaligus, masing-masing dengan status dan retry-nya sendiri.

```
notification_deliveries
- id
- notification_id
- recipient_id
- channel
- status
- sent_at
- delivered_at
- failed_at
- error_message
- attempt_count
- created_at
- updated_at
```

`channel`:

| Nilai | Keterangan |
|---|---|
| `in_app` | Muncul di lonceng notifikasi HRMS |
| `email` | Dikirim via email |
| `push` | Push notification ke mobile app |
| `sms` | Dikirim via SMS |

`status`: `pending` → `processing` → `sent` → `delivered` (atau `failed`).

`attempt_count` dipakai worker untuk retry dengan backoff; `error_message` menyimpan alasan gagal terakhir untuk keperluan debug/audit.

## 7. `notification_preferences`

Karyawan bisa menentukan channel mana yang ingin diterima per tipe notifikasi.

```
notification_preferences
- id
- user_id
- notification_type
- in_app_enabled
- email_enabled
- push_enabled
- created_at
- updated_at
```

Kombinasi `(user_id, notification_type)` harus unik. Sebelum membuat `notification_deliveries`, sistem mengecek preferensi ini — kalau `email_enabled = false` untuk tipe `ANNOUNCEMENT`, tidak perlu membuat baris delivery channel `email` untuk user tersebut.

Contoh:

| Type | In-App | Email | Push |
|---|---|---|---|
| `LEAVE_APPROVED` | ✓ | ✓ | ✓ |
| `PAYROLL_AVAILABLE` | ✓ | ✓ | ✓ |
| `ANNOUNCEMENT` | ✓ | ✓ | ✕ |
| `ATTENDANCE_REMINDER` | ✓ | ✕ | ✓ |

## 8. Diagram Relasi

```
┌────────────────────────┐
│ notification_templates │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ notifications           │
│                         │
│ type, category          │
│ title, body             │
│ priority                │
│ reference_type/_id      │
│ action_url, data        │
│ scheduled_at            │
└──────┬──────────┬───────┘
       │          │
       ▼          ▼
notification_   notification_
targets          recipients
                     │
                     ├── is_read / read_at
                     │
                     ▼
             notification_deliveries
                     │
                     └── channel, status, attempt_count


notification_preferences
        │
        └── users (in_app / email / push enabled per type)
```

## 9. Contoh Alur

### Approval cuti (notifikasi personal)

```
Manager approve leave
        ↓
Leave Service memanggil Notification Service
        ↓
notifications
        └── type = LEAVE_APPROVED, reference_id = leave_id
        ↓
notification_recipients
        └── user_id = Ahmad
        ↓
notification_deliveries
        ├── in_app → sent
        ├── push   → sent
        └── email  → pending (menunggu worker email)
```

### Pengumuman HR (broadcast)

```
HR membuat pengumuman "Jadwal Medical Check Up"
        ↓
notifications (1 baris)
        ↓
notification_targets
        └── target_type = department, target_id = IT
        ↓
worker resolve target → daftar employee di department IT
        ↓
notification_recipients (1 baris per employee)
        ├── Employee A
        ├── Employee B
        └── Employee C
        ↓
notification_deliveries dibuat per recipient, mengikuti notification_preferences masing-masing
```

## 10. Struktur Modul Aplikasi

```
Notification
│
├── Templates
│   └── Notification Template
│
├── Notifications
│   ├── Create Notification (personal / broadcast)
│   ├── Notification Detail
│   └── Mark as Read
│
├── Delivery
│   ├── In-App
│   ├── Email
│   ├── Push
│   └── SMS
│
├── Preferences
│   └── User Notification Settings
│
└── Scheduler
    └── Scheduled / Recurring Notification
```

## 11. Catatan Desain

Untuk HRMS production, **jangan** membuat tabel notifikasi sesederhana `notifications(user_id, message)` — desain seperti itu tidak bisa menangani broadcast, multi-channel, maupun audit status kirim tanpa migrasi ulang di kemudian hari.

Prinsip lain yang perlu dipegang saat implementasi:

- `notifications` menyimpan **isi**, `notification_recipients` menyimpan **penerima** — jangan digabung, karena satu notifikasi broadcast bisa punya ratusan/ribuan penerima.
- `notification_targets` hanya dipakai saat notifikasi perlu di-*resolve* dari grup (department/branch/role/all) menjadi user individual; untuk notifikasi personal, langsung insert ke `notification_recipients` tanpa melalui tabel ini.
- Pakai `reference_type` + `reference_id` generik untuk menghubungkan notifikasi ke entitas modul lain (leave request, payroll, attendance, reimbursement, dst), **bukan** foreign key langsung ke tabel tiap modul — supaya modul notifikasi tetap independen dan bisa dipakai lintas modul HRIS tanpa perubahan skema.
- Status baca (`is_read`, `read_at`) melekat di `notification_recipients`, sedangkan status kirim (`sent`, `delivered`, `failed`) melekat di `notification_deliveries` — keduanya konsep berbeda: "dibaca" adalah aksi user di in-app, "terkirim" adalah hasil proses infrastruktur (SMTP, push gateway, dsb).
- Sebelum membuat baris `notification_deliveries` untuk channel tertentu, cek dulu `notification_preferences` user — hindari mengirim email/push ke user yang sudah mematikan channel tersebut untuk tipe notifikasi itu.
- `scheduled_at` vs `published_at` memisahkan "kapan seharusnya tayang" dari "kapan benar-benar tayang" — berguna untuk notifikasi terjadwal (pengingat, pengumuman yang di-draft dulu) yang diproses oleh worker/cron.
