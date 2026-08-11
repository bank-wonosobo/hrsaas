import Image from "next/image";
import Link from "next/link";

export default function Logo(): React.ReactNode {
  return (
    <Link href="/" className="relative h-10 w-37.5 flex items-center">
      <Image
        src="/logo.png"
        alt="dieng.id"
        width={150}
        height={40}
        priority
        className={`transition-all duration-300 origin-left `}
      />
    </Link>
  );
}
