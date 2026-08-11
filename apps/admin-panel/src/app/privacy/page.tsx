import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — HR SaaS Admin",
  description: "Kebijakan privasi aplikasi HR SaaS Admin",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/sign-in"
            className="text-sm text-teal-700 hover:underline"
          >
            ← Kembali ke login
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Kebijakan Privasi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Terakhir diperbarui: 26 Mei 2026
            </p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Kebijakan Privasi ini menjelaskan bagaimana HR SaaS
            (&quot;kami&quot;) mengumpulkan, menggunakan, menyimpan, dan
            melindungi informasi pribadi Anda saat menggunakan aplikasi admin
            kami. Dengan mengakses atau menggunakan layanan kami, Anda
            menyetujui kebijakan ini.
          </p>

          <Section title="1. Informasi yang Kami Kumpulkan">
            <p>Kami dapat mengumpulkan informasi berikut:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Data identitas:</strong> nama, alamat email, jabatan,
                dan informasi profil karyawan.
              </li>
              <li>
                <strong>Data penggunaan:</strong> aktivitas login, riwayat
                transaksi, dan log akses sistem.
              </li>
              <li>
                <strong>Data perangkat:</strong> alamat IP, jenis browser, dan
                sistem operasi.
              </li>
              <li>
                <strong>Data kehadiran & cuti:</strong> rekaman absensi,
                kunjungan lapangan, dan pengajuan izin/cuti.
              </li>
            </ul>
          </Section>

          <Section title="2. Cara Kami Menggunakan Informasi">
            <ul className="list-disc list-inside space-y-1">
              <li>Mengelola akun dan hak akses pengguna dalam sistem.</li>
              <li>
                Memproses data kepegawaian seperti absensi, penggajian, dan
                evaluasi kinerja.
              </li>
              <li>
                Mengirimkan notifikasi terkait aktivitas atau perubahan data.
              </li>
              <li>
                Meningkatkan keamanan sistem dan mencegah akses tidak sah.
              </li>
              <li>Memenuhi kewajiban hukum dan regulasi yang berlaku.</li>
            </ul>
          </Section>

          <Section title="3. Penyimpanan dan Keamanan Data">
            <p>
              Data Anda disimpan pada server yang diamankan dengan enkripsi dan
              kontrol akses yang ketat. Kami menerapkan langkah-langkah teknis
              dan organisasi yang wajar untuk melindungi informasi dari akses,
              pengungkapan, perubahan, atau penghancuran yang tidak sah.
            </p>
            <p className="mt-2">
              Data disimpan selama akun aktif atau selama diperlukan untuk
              memenuhi tujuan yang dijelaskan dalam kebijakan ini, kecuali
              diharuskan lebih lama oleh hukum.
            </p>
          </Section>

          <Section title="4. Berbagi Informasi dengan Pihak Ketiga">
            <p>
              Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak
              ketiga. Data hanya dibagikan dalam kondisi berikut:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                Kepada penyedia layanan yang membantu operasional sistem
                (hosting, email, dll.) dengan perjanjian kerahasiaan.
              </li>
              <li>Jika diwajibkan oleh hukum atau perintah pengadilan.</li>
              <li>
                Untuk melindungi hak, properti, atau keselamatan pengguna dan
                perusahaan.
              </li>
            </ul>
          </Section>

          <Section title="5. Hak Pengguna">
            <p>Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Mengakses dan meminta salinan data pribadi Anda.</li>
              <li>
                Meminta koreksi data yang tidak akurat atau tidak lengkap.
              </li>
              <li>
                Meminta penghapusan data dalam kondisi tertentu sesuai hukum
                yang berlaku.
              </li>
              <li>
                Mengajukan keberatan atas pemrosesan data untuk tujuan tertentu.
              </li>
            </ul>
            <p className="mt-2">
              Untuk menggunakan hak-hak tersebut, hubungi administrator sistem
              Anda atau tim dukungan kami.
            </p>
          </Section>

          <Section title="6. Cookie dan Teknologi Pelacakan">
            <p>
              Aplikasi ini menggunakan cookie sesi untuk menjaga status login
              dan preferensi pengguna. Cookie ini bersifat esensial dan tidak
              digunakan untuk pelacakan iklan. Anda dapat mengonfigurasi browser
              untuk menolak cookie, namun beberapa fitur mungkin tidak berfungsi
              dengan baik.
            </p>
          </Section>

          <Section title="7. Perubahan Kebijakan">
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
              Perubahan signifikan akan diberitahukan melalui notifikasi dalam
              aplikasi atau email. Penggunaan berkelanjutan setelah perubahan
              berlaku merupakan persetujuan Anda terhadap kebijakan yang
              diperbarui.
            </p>
          </Section>

          <Section title="8. Hubungi Kami">
            <p>
              Jika Anda memiliki pertanyaan atau kekhawatiran mengenai Kebijakan
              Privasi ini, silakan hubungi:
            </p>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
              <p className="font-medium">Tim HR Bank Wonosobo</p>
              <p>Email: admin@bankwonosobo.co.id</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}
