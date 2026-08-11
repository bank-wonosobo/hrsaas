import { TimeOffRequestSchema } from "@/features/time-off-request/schemas/time-off-schema";
import z from "zod/v3";

export const TimeOffApprovalSchema = z.object({
  id: z.string(),
  time_off_request_id: z.string(),
  approver_employee_id: z.string(),
  is_required: z.boolean(),
  status: z.string(),
  action_at: z.number(),
  action_reason: z.string(),
  time_off_request: TimeOffRequestSchema,
});

export const SearchTimeOffApprovalSchema = z.object({
  employee_id: z.string().optional(),
  status: z.enum(["REJECTED", "APPROVED", "PENDING"]).optional(),
  time_off_type_id: z.string().optional(),
  request_status: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const ActionTimeOffApprovalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]), // APPROVE, REJECT
  action_reason: z.string(),
});

export type SearchTimeOffApproval = z.infer<typeof SearchTimeOffApprovalSchema>;
export type TimeOffApproval = z.infer<typeof TimeOffApprovalSchema>;
export type ActionTimeOffApproval = z.infer<typeof ActionTimeOffApprovalSchema>;
