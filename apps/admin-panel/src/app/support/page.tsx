import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Clock3, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Pusat Bantuan — HRIS Bank Wonosobo",
  description: "Pusat bantuan dan dukungan Sistem HRIS Bank Wonosobo.",
};

const faqs = [
  ["Bagaimana cara masuk ke sistem HRIS?", "Gunakan alamat email dan kata sandi yang telah didaftarkan oleh administrator. Jika lupa kata sandi, hubungi admin HR atau tim dukungan kami."],
  ["Data absensi saya belum muncul, apa yang harus dilakukan?", "Pastikan aplikasi BW Akses+ sudah tersinkronisasi dan koneksi internet stabil. Jika data belum muncul, sertakan tanggal dan waktu absensi saat menghubungi kami."],
  ["Bagaimana cara mengajukan cuti atau izin?", "Buka menu Pengajuan pada aplikasi, pilih jenis pengajuan, lengkapi detailnya, lalu kirim untuk diproses oleh atasan."],
  ["Siapa yang dapat melihat data kepegawaian saya?", "Data hanya dapat diakses oleh Anda dan pihak yang memiliki wewenang sesuai peran dan hak akses di dalam sistem."],
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/sign-in" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006b54] text-sm font-bold text-white">BW</span>
            <span><span className="block text-sm font-semibold">Bank Wonosobo</span><span className="block text-xs text-zinc-500">HRIS Support Center</span></span>
          </Link>
          <Link href="/sign-in" className="flex items-center gap-2 text-sm font-medium text-[#006b54] hover:text-[#00513f]"><ArrowLeft size={16} /> Kembali ke login</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:px-8 md:pt-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#006b54]">Pusat Bantuan HRIS</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-5xl">Kami siap membantu kelancaran pekerjaan Anda.</h1>
          <p className="mt-5 text-base leading-7 text-zinc-600 md:text-lg">Temukan jawaban atas pertanyaan umum atau hubungi tim support untuk mendapatkan bantuan terkait sistem HRIS Bank Wonosobo.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <ContactCard icon={<MessageCircle size={21} />} title="Chat WhatsApp" detail="Respons tercepat untuk kendala operasional" action="Buka WhatsApp" href="https://wa.me/628112900800" />
          <ContactCard icon={<Mail size={21} />} title="Kirim Email" detail="admin@bankwonosobo.co.id" action="Tulis email" href="mailto:admin@bankwonosobo.co.id" />
          <ContactCard icon={<Phone size={21} />} title="Telepon Support" detail="(0286) 321 234 • Senin–Jumat" action="Hubungi kami" href="tel:+62286321234" />
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-950 md:flex-row md:items-center"><Clock3 size={19} className="shrink-0 text-[#006b54]" /><span><strong>Jam layanan:</strong> Senin–Jumat, pukul 08.00–16.00 WIB.</span><span className="hidden h-4 w-px bg-emerald-200 md:block" /><span className="text-emerald-800">Di luar jam layanan, silakan kirim email.</span></div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-white p-3 text-[#006b54] shadow-sm ring-1 ring-zinc-100"><BookOpen size={20} /></span><div><h2 className="text-xl font-semibold">Pertanyaan yang sering diajukan</h2><p className="mt-1 text-sm text-zinc-500">Jawaban singkat untuk kendala yang umum terjadi.</p></div></div>
            <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white px-5">{faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:hidden">{question}<span className="text-xl font-normal text-[#006b54] transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-zinc-600">{answer}</p></details>)}</div>
          </section>

          <aside className="rounded-2xl bg-[#083f35] p-7 text-white md:p-9"><ShieldCheck size={27} className="text-emerald-300" /><h2 className="mt-6 text-2xl font-semibold">Butuh bantuan lebih lanjut?</h2><p className="mt-3 text-sm leading-6 text-emerald-100">Saat menghubungi kami, siapkan nama, unit kerja, dan detail kendala agar tim dapat membantu lebih cepat. Jangan pernah membagikan kata sandi atau kode OTP Anda.</p><Link href="mailto:admin@bankwonosobo.co.id?subject=Bantuan%20HRIS" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#083f35] hover:bg-emerald-50">Buat permintaan bantuan <ArrowUpRight size={16} /></Link><div className="mt-8 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-emerald-200"><CheckCircle2 size={15} /> Data Anda kami jaga dengan aman.</div></aside>
        </div>
      </section>
      <footer className="border-t border-zinc-200 bg-white px-5 py-6 text-center text-xs text-zinc-500">© 2025 Bank Wonosobo · Sistem Informasi Sumber Daya Manusia</footer>
    </main>
  );
}

function ContactCard({ icon, title, detail, action, href }: { icon: React.ReactNode; title: string; detail: string; action: string; href: string }) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#006b54]">{icon}</span><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-1 min-h-10 text-sm leading-5 text-zinc-500">{detail}</p><Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#006b54] hover:underline">{action} <ArrowUpRight size={15} /></Link></div>;
}
