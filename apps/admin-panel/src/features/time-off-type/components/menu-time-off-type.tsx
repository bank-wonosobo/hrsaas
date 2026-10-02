"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { CreateTimeOffTypeForm } from "./create-time-off-type";

export default function MenuTimeOffType(): React.ReactNode {
  return (
    <Card className="mb-4 shadow-sm">
      <CardContent className="flex items-center justify-end gap-3 p-4">
        <CreateTimeOffTypeForm />
        <Button variant="outline">
          <Download />
          Download
        </Button>
      </CardContent>
    </Card>
  );
}
