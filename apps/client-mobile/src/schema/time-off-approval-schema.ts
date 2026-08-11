import { EmployeeSchema } from "@/features/employee/employee-schema";
import {
  ApprovalResponseSchema,
  TimeOffTypeSchema,
} from "@/schema/time-off-schema";
import z from "zod/v3";

export const TimeOffApprovalRequestSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  time_off_type_id: z.string(),
  start_date: z.number(),
  end_date: z.number().nullable().optional(),
  requested_days: z.number(),
  request_reason: z.string().nullable().optional(),
  request_status: z.string().nullable().optional(),
  created_at: z.number(),
  employee: EmployeeSchema,
  time_off_type: TimeOffTypeSchema,
  approvals: z.array(ApprovalResponseSchema).optional(),
});

export type TimeOffApprovalRequest = z.infer<
  typeof TimeOffApprovalRequestSchema
>;

export const TimeOffApprovalSchema = z.object({
  id: z.string(),
  time_off_request_id: z.string(),
  approver_employee_id: z.string(),
  is_required: z.boolean(),
  status: z.string(),
  action_at: z.number().optional(),
  action_reason: z.string().nullable().optional(),
  time_off_request: TimeOffApprovalRequestSchema.optional(),
});

export type TimeOffApproval = z.infer<typeof TimeOffApprovalSchema>;

export const ActionTimeOffApprovalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  action_reason: z.string().optional(),
});

export type ActionTimeOffApproval = z.infer<
  typeof ActionTimeOffApprovalSchema
>;
