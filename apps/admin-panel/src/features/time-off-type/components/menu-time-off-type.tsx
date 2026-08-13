"use client";

import Button from "@/components/ui/button/button";
import { Download } from "lucide-react";
import { CreateTimeOffTypeForm } from "./create-time-off-type";

export default function MenuTimeOffType(): React.ReactNode {
  return (
    <div className="mb-4 flex items-center justify-between bg-white border rounded-2xl p-5 gap-6">
      <div />
      <div className="flex gap-3 items-center justify-center">
        <CreateTimeOffTypeForm />
        <Button variant="outline" prefixIcon={<Download size={18} />}>
          Download
        </Button>
      </div>
    </div>
  );
}
