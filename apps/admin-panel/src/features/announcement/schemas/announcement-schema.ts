import z from "zod/v3";

export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().default(""),
  content: z.string(),
  file_url: z.string().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

export const SearchAnnouncementRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  category: z.string().default(""),
  content: z.string().min(1, "Isi wajib diisi"),
  file_url: z.string().optional(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;
export type SearchAnnouncementRequest = z.infer<typeof SearchAnnouncementRequestSchema>;
export type CreateAnnouncement = z.infer<typeof CreateAnnouncementSchema>;
