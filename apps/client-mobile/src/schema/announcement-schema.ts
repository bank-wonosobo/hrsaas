import z from "zod/v3";

export const AnnouncementSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  title: z.string(),
  category: z.string(),
  content: z.string(),
  created_at: z.number(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;

export const SearchAnnouncementSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type SearchAnnouncement = z.infer<typeof SearchAnnouncementSchema>;
