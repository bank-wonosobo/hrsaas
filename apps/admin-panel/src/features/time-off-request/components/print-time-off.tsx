import { TimeOffRequest } from "../schemas/time-off-schema";

function toIDDateShort(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function printTimeOffLetter(request: TimeOffRequest) {
  const contract = request.employee.contracts?.[0];
  const today = toIDDateShort(new Date());
  const startDate = toIDDateShort(new Date(request.start_date));
  const endDate = toIDDateShort(new Date(request.end_date));
  const submittedDate = toIDDateShort(new Date(request.created_at));

  const approvalRows = request.approvals
    .map((a) => {
      const colWidth = Math.floor(100 / request.approvals.length);

      if (a.status === "APPROVED") {
        return `
        <td style="width:${colWidth}%; text-align:center; padding: 8px 16px;">
          <div style="font-size:10px; color:#555; margin-bottom:4px;">Mengetahui dan Menyetujui,</div>
          <div style="font-size:11px; margin-bottom:60px;">&nbsp;</div>
          <div style="border-top:2px solid #000; padding-top:6px; font-size:11px; font-weight:bold;">
            ${a.employee_name}
          </div>
          <div style="font-size:10px; color:#166534; margin-top:2px;">&#10003; Disetujui</div>
        </td>`;
      }

      if (a.status === "REJECTED") {
        return `
        <td style="width:${colWidth}%; text-align:center; padding: 8px 16px;">
          <div style="font-size:10px; color:#555; margin-bottom:4px;">Mengetahui,</div>
          <div style="font-size:11px; margin-bottom:60px;">&nbsp;</div>
          <div style="border-top:1px dashed #999; padding-top:6px; font-size:11px; color:#999; text-decoration:line-through;">
            ${a.employee_name}
          </div>
          <div style="font-size:10px; color:#b91c1c; margin-top:2px;">&#10007; Ditolak</div>
        </td>`;
      }

      return `
      <td style="width:${colWidth}%; text-align:center; padding: 8px 16px;">
        <div style="font-size:10px; color:#555; margin-bottom:4px;">Mengetahui,</div>
        <div style="font-size:11px; margin-bottom:60px;">&nbsp;</div>
        <div style="border-top:1px dashed #aaa; padding-top:6px; font-size:11px; color:#aaa;">
          ${a.employee_name}
        </div>
        <div style="font-size:10px; color:#92400e; margin-top:2px;">&#8987; Menunggu</div>
      </td>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Surat Pengajuan Cuti</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      color: #000;
      background: #fff;
      padding: 40px 60px;
    }
    .header {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 12pt; font-weight: normal; }
    .title-block {
      text-align: center;
      margin: 20px 0 24px;
    }
    .title-block h3 { font-size: 14pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
    .title-block p { font-size: 10pt; margin-top: 4px; }
    .section { margin-bottom: 16px; }
    .section p { line-height: 1.8; text-align: justify; }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    table.data-table td {
      padding: 3px 0;
      vertical-align: top;
      font-size: 12pt;
    }
    table.data-table td:first-child { width: 160px; }
    table.data-table td:nth-child(2) { width: 16px; text-align: center; }
    .sign-table { width: 100%; border-collapse: collapse; margin-top: 32px; }
    .sign-table td { vertical-align: bottom; }
    .footer-note {
      margin-top: 24px;
      font-size: 10pt;
      color: #444;
      border-top: 1px solid #ccc;
      padding-top: 8px;
    }
    @media print {
      body { padding: 20px 40px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <h1>PT. BPR Bank Wonosobo (Perseroda)</h1>
    <h2>Kantor Pusat Bank Wonosobo Jl. A. Yani No.rt 03 160 Wonosobo 56311</h2>
  </div>

  <!-- Judul Surat -->
  <div class="title-block">
    <h3>Surat Pengajuan ${request.time_off_type.category === "SAKIT" ? "Izin Sakit" : request.time_off_type.category === "IZIN" ? "Izin" : "Cuti"}</h3>
    <p>Tanggal Pengajuan: ${submittedDate}</p>
  </div>

  <!-- Data Karyawan -->
  <div class="section">
    <p>Yang bertanda tangan di bawah ini, kami menerangkan bahwa karyawan:</p>
    <table class="data-table" style="margin-top:10px;">
      <tr>
        <td>Nama Lengkap</td>
        <td>:</td>
        <td><strong>${request.employee.fullname}</strong></td>
      </tr>
      <tr>
        <td>No. Karyawan</td>
        <td>:</td>
        <td>${request.employee.employee_number}</td>
      </tr>
      <tr>
        <td>Jabatan</td>
        <td>:</td>
        <td>${contract?.position.name ?? "–"}</td>
      </tr>
      <tr>
        <td>Divisi</td>
        <td>:</td>
        <td>${contract?.division.name ?? "–"}</td>
      </tr>
    </table>
  </div>

  <!-- Detail Pengajuan -->
  <div class="section">
    <p>Mengajukan permohonan <strong>${request.time_off_type.name}</strong> dengan rincian sebagai berikut:</p>
    <table class="data-table" style="margin-top:10px;">
      <tr>
        <td>Jenis</td>
        <td>:</td>
        <td>${request.time_off_type.name} (${request.time_off_type.category})</td>
      </tr>
      <tr>
        <td>Tanggal Mulai</td>
        <td>:</td>
        <td>${startDate}</td>
      </tr>
      <tr>
        <td>Tanggal Akhir</td>
        <td>:</td>
        <td>${endDate}</td>
      </tr>
      <tr>
        <td>Jumlah Hari</td>
        <td>:</td>
        <td><strong>${request.requested_days} hari kerja</strong></td>
      </tr>
      <tr>
        <td>Alasan</td>
        <td>:</td>
        <td>${request.request_reason || "–"}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>:</td>
        <td><strong>${
          request.request_status === "APPROVED"
            ? "Disetujui"
            : request.request_status === "REJECTED"
              ? "Ditolak"
              : "Menunggu Persetujuan"
        }</strong></td>
      </tr>
    </table>
  </div>

  <!-- Tanda Tangan -->
  ${
    request.approvals.length > 0
      ? `
  <div class="section" style="margin-top: 32px;">
    <p style="margin-bottom:8px;">Mengetahui dan Menyetujui,</p>
    <table class="sign-table">
      <tr>${approvalRows}</tr>
    </table>
  </div>
  `
      : ""
  }

  <!-- Footer -->
  <div class="footer-note">
    <p>Dokumen ini dicetak secara otomatis dari Sistem BW Akses + . &nbsp;|&nbsp; Dicetak pada: ${today}</p>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `;

  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
