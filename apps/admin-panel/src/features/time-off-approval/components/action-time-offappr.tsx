import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { useState } from "react";
import { useActionTimeOffApproval } from "../hooks/use-action-timeoffappr";
import {
  ActionTimeOffApproval,
  ActionTimeOffApprovalSchema,
} from "../schemas/time-off-approval-schema";

interface Props {
  id: string;
}

export default function ActionTimeOffAppr({ id }: Props) {
  const [type, setType] = useState<"APPROVE" | "REJECT" | null>(null);

  const mutation = useActionTimeOffApproval(id);

  const form = useZodForm(ActionTimeOffApprovalSchema, {
    defaultValues: {
      action: "APPROVE",
      action_reason: "",
    },
  });

  const onSubmit = (data: ActionTimeOffApproval) => {
    mutation.mutate({
      ...data,
      action: type!, // inject dari state
    });
    form.reset();
    setType(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* APPROVE */}
      <Button variant="primary" size="sm" onClick={() => setType("APPROVE")}>
        Setujui
      </Button>

      {/* REJECT */}
      <Button variant="danger" size="sm" onClick={() => setType("REJECT")}>
        Tolak
      </Button>

      {/* MODAL (dipakai 1 saja, dinamis) */}
      <Modal
        maxWidth="sm"
        title={
          type === "APPROVE"
            ? "Yakin ingin menyetujui karyawan?"
            : "Yakin ingin menolak karyawan?"
        }
        isOpen={!!type}
        onClose={() => setType(null)}
      >
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Tambahkan catatan">
            <Input label="Catatan" {...form.register("action_reason")} />
          </FormField>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant={type === "APPROVE" ? "primary" : "danger"}
            >
              {type === "APPROVE" ? "Setujui" : "Tolak"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setType(null)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
