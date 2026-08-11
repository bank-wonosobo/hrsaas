import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  previus?: string;
};

export default function Title({ title, previus }: Props) {
  return (
    <div className="mt-4 mb-6 flex items-center gap-4">
      {previus && (
        <Link href={previus}>
          <ArrowLeft />
        </Link>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
}
