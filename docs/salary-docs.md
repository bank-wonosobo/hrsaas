# Desain Database — Salary & Payroll (HRIS)

Dokumen ini menjelaskan struktur data untuk modul kepegawaian, komponen gaji, dan payroll pada sistem HRIS. Prinsip utamanya:

- **Histori, bukan overwrite** — jabatan, gaji pokok, tunjangan, dan potongan punya rentang tanggal berlaku (`effective_date` / `end_date`), sehingga perubahan di masa depan tidak menghapus data lama.
- **Komponen gaji dinamis** — komponen (tunjangan/potongan) disimpan sebagai data (`salary_components`), bukan kolom tetap di tabel payroll, sehingga komponen baru bisa ditambahkan tanpa migrasi skema.
- **Snapshot pada payroll** — setiap payroll yang sudah diproses menyimpan salinan nilai komponen saat itu (`payroll_items`), sehingga slip gaji lama tetap akurat meskipun master data berubah setelahnya.

## Daftar Isi

1. [Struktur Utama](#1-struktur-utama)
2. [Data Master Kepegawaian](#2-data-master-kepegawaian)
3. [Komponen Gaji](#3-komponen-gaji)
4. [Kompensasi Pegawai](#4-kompensasi-pegawai)
5. [Payroll](#5-payroll)
6. [Kehadiran & Lembur](#6-kehadiran--lembur)
7. [Bonus / Penyesuaian](#7-bonus--penyesuaian)
8. [Pembayaran](#8-pembayaran)
9. [Approval Workflow](#9-approval-workflow)
10. [Diagram Relasi](#10-diagram-relasi)
11. [Struktur Modul Aplikasi](#11-struktur-modul-aplikasi)
12. [Catatan Desain](#12-catatan-desain)

## 1. Struktur Utama

```
employees
    │
    ├── employee_positions
    │       └── positions
    │
    ├── employee_salary
    │
    ├── employee_allowances
    │       └── allowances
    │
    ├── employee_deductions
    │       └── deductions
    │
    └── payroll_details
            │
            └── payrolls
                    │
                    ├── payroll_items
                    ├── payroll_deductions
                    └── payroll_payments
```

## 2. Data Master Kepegawaian

### `employees`

Data master pegawai.

```
employees
- id
- employee_number
- nik
- name
- email
- phone
- birth_date
- join_date
- resign_date
- employment_status
- bank_account
- bank_name
- is_active
- created_at
- updated_at
```

`employment_status`:

| Nilai | Keterangan |
|---|---|
| `PERMANENT` | Karyawan tetap |
| `CONTRACT` | Kontrak |
| `PROBATION` | Masa percobaan |
| `INTERN` | Magang |
| `RESIGNED` | Sudah resign |

### `departments`

```
departments
- id
- code
- name
- is_active
- created_at
- updated_at
```

Contoh: `IT`, `HR`, `ACCOUNTING`, `MARKETING`, `OPERATIONS`.

### `positions`

```
positions
- id
- department_id
- code
- name
- level
- is_active
- created_at
- updated_at
```

Contoh: Staff IT, Senior Staff IT, Kabag IT, Direktur.

### `employee_positions`

Histori jabatan pegawai. **Jangan** menyimpan `position_id` langsung di `employees` — gunakan tabel relasi ini agar riwayat jabatan tetap tercatat.

```
employee_positions
- id
- employee_id
- position_id
- start_date
- end_date
- is_current
- created_at
- updated_at
```

Contoh histori:

```
2024-01-01 → Staff IT
2026-01-01 → Senior Staff IT
2027-01-01 → Kabag IT
```

## 3. Komponen Gaji

Komponen gaji (tunjangan maupun potongan) dibuat **dinamis**, bukan kolom tetap (`basic_salary`, `transport`, `meal`, `bonus`, `overtime`, …) di tabel payroll.

### `salary_components`

```
salary_components
- id
- code
- name
- type
- calculation_type
- is_taxable
- is_bpjs_base
- is_active
- created_at
- updated_at
```

`type`:

| Nilai | Keterangan |
|---|---|
| `EARNING` | Komponen penambah (gaji pokok, tunjangan, bonus, THR, lembur, dst) |
| `DEDUCTION` | Komponen pengurang (BPJS, pajak, pinjaman, potongan lain) |

Contoh `EARNING`: `BASIC_SALARY`, `TRANSPORT`, `MEAL`, `POSITION_ALLOWANCE`, `OVERTIME`, `BONUS`, `THR`.
Contoh `DEDUCTION`: `BPJS_HEALTH`, `BPJS_EMPLOYMENT`, `TAX`, `LOAN_DEDUCTION`, `OTHER_DEDUCTION`.

`calculation_type`:

| Nilai | Keterangan |
|---|---|
| `FIXED` | Nominal tetap |
| `PERCENTAGE` | Persentase dari basis tertentu (mis. gaji pokok) |
| `FORMULA` | Dihitung dari formula/aturan |
| `MANUAL` | Diinput manual per payroll |

## 4. Kompensasi Pegawai

### `employee_salary`

Gaji pokok pegawai, disimpan sebagai histori — **jangan overwrite** gaji lama.

```
employee_salary
- id
- employee_id
- basic_salary
- effective_date
- end_date
- created_at
- updated_at
```

Contoh:

```
Ahmad
2025 → 3.000.000
2026 → 5.000.000
2027 → 6.000.000
```

### `employee_allowances`

```
employee_allowances
- id
- employee_id
- salary_component_id
- amount
- percentage
- effective_date
- end_date
- created_at
- updated_at
```

Contoh:

```
Ahmad
────────────────────────────
Transport       Rp 300.000
Makan           Rp 500.000
Jabatan         Rp 1.000.000
────────────────────────────
```

### `employee_deductions`

```
employee_deductions
- id
- employee_id
- salary_component_id
- amount
- percentage
- effective_date
- end_date
- created_at
- updated_at
```

Contoh: BPJS, pinjaman karyawan, koperasi, potongan absensi.

## 5. Payroll

### `payrolls`

Satu record untuk satu periode payroll.

```
payrolls
- id
- payroll_number
- period_month
- period_year
- payment_date
- status
- total_gross
- total_deduction
- total_net
- created_by
- approved_by
- approved_at
- created_at
- updated_at
```

`status`: `DRAFT` → `CALCULATED` → `SUBMITTED` → `APPROVED` → `PAID` (atau `CANCELLED`).

### `payroll_details`

Satu pegawai = satu detail payroll.

```
payroll_details
- id
- payroll_id
- employee_id
- basic_salary
- gross_salary
- total_earning
- total_deduction
- net_salary
- created_at
- updated_at
```

Contoh — Payroll Agustus 2026, Ahmad:

```
Basic Salary       5.000.000
Tunjangan          1.500.000
----------------------------
Gross              6.500.000

Potongan BPJS        150.000
Potongan koperasi    100.000
----------------------------
Total Potongan       250.000

Take Home Pay      6.250.000
```

### `payroll_items`

Snapshot setiap komponen gaji per payroll — **jangan hanya menyimpan total**.

```
payroll_items
- id
- payroll_detail_id
- salary_component_id
- name
- type
- amount
- calculation_value
- created_at
```

Contoh:

```
payroll_detail
    │
    ├── Basic Salary       5.000.000
    ├── Transport            300.000
    ├── Tunjangan Jabatan  1.000.000
    ├── BPJS                 -150.000
    └── Koperasi             -100.000
```

> Kenapa harus snapshot? Karena kalau tahun depan nominal tunjangan berubah, slip gaji bulan Agustus 2026 tetap harus menunjukkan nilai saat itu.

## 6. Kehadiran & Lembur

### `attendance_records`

```
attendance_records
- id
- employee_id
- attendance_date
- check_in
- check_out
- status
- late_minutes
- overtime_minutes
- created_at
- updated_at
```

`status`: `PRESENT`, `ABSENT`, `LEAVE`, `SICK`, `HOLIDAY`.

Payroll dapat menghitung `late_minutes`, `absent_days`, `overtime_minutes` dari tabel ini.

### `overtime_records`

```
overtime_records
- id
- employee_id
- overtime_date
- start_time
- end_time
- duration_minutes
- rate
- amount
- status
- approved_by
- approved_at
- created_at
- updated_at
```

## 7. Bonus / Penyesuaian

Bonus dan THR **tidak** dimasukkan langsung ke `employee_salary` — dicatat sebagai transaksi tambahan per payroll.

### `payroll_adjustments`

```
payroll_adjustments
- id
- payroll_detail_id
- type
- name
- amount
- description
- created_at
```

Contoh `type`: `BONUS`, `THR`, `JASPROD`, `INCENTIVE`, `CORRECTION`.

## 8. Pembayaran

### `payroll_payments`

Untuk integrasi dengan bank.

```
payroll_payments
- id
- payroll_detail_id
- employee_id
- bank_name
- bank_account
- account_name
- amount
- payment_reference
- paid_at
- status
- created_at
- updated_at
```

`status`: `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`.

## 9. Approval Workflow

### `payroll_approvals`

```
payroll_approvals
- id
- payroll_id
- approver_id
- level
- status
- notes
- approved_at
- created_at
```

Contoh alur:

```
HR
 ↓
Kabag HR
 ↓
Direktur
 ↓
Finance
 ↓
Payment
```

## 10. Diagram Relasi

```
                    ┌──────────────┐
                    │ departments  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  positions   │
                    └──────┬───────┘
                           │
┌─────────────┐     ┌──────▼──────────┐
│  employees  │────▶│employee_positions│
└──────┬──────┘     └─────────────────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
employee_salary   employee_allowances
       │               │
       │               ▼
       │       salary_components
       │
       ▼
 attendance_records
       │
       ▼
 overtime_records


              ┌──────────────┐
              │   payrolls   │
              └──────┬───────┘
                     │
                     ▼
             payroll_details
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
   payroll_items  adjustments payments
```

## 11. Struktur Modul Aplikasi

Pembagian modul secara fungsional (independen dari framework/stack yang dipakai):

```
HR / Payroll
│
├── Employees
│   ├── Employee
│   ├── Department
│   └── Position
│
├── Salary
│   ├── Salary Components
│   ├── Employee Salary
│   ├── Allowances
│   └── Deductions
│
├── Attendance
│   ├── Attendance
│   ├── Leave
│   └── Overtime
│
├── Payroll
│   ├── Payroll Period
│   ├── Calculate Payroll
│   ├── Approval
│   ├── Payment
│   └── Payslip
│
└── Reports
    ├── Payroll Report
    ├── Salary Report
    ├── Tax Report
    └── Bank Transfer Report
```

## 12. Catatan Desain

Untuk sistem payroll production, **jangan** hanya membuat tabel `employees` + `salary` + `payroll` datar. Gunakan snapshot payroll (`payroll_details` dan `payroll_items`), karena data gaji historis harus tetap konsisten meskipun master pegawai, jabatan, tunjangan, atau nominalnya berubah di kemudian hari.

Prinsip lain yang perlu dipegang saat implementasi:

- Semua data yang bisa berubah dari waktu ke waktu (jabatan, gaji pokok, tunjangan, potongan) punya `effective_date` / `end_date` — hindari update-in-place pada nilai historis.
- Total pada `payrolls` dan `payroll_details` (`total_gross`, `total_deduction`, `total_net`, dst) adalah hasil agregasi dari `payroll_items`, bukan sumber kebenaran itu sendiri — selalu bisa direkonstruksi ulang dari item-nya.
- `payroll_approvals` memisahkan proses persetujuan dari eksekusi pembayaran (`payroll_payments`), sehingga payroll yang belum disetujui tidak bisa masuk ke proses pembayaran.
