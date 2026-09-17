import { z } from "zod";

export const ListingSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  employment_type: z.string().nullable().optional(),
  eligibility: z.string().nullable().optional(),
  stipend_or_salary: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(), // ISO date string
  skills_required: z.array(z.string()).default([]),
  experience_level: z.string().nullable().optional(),
  apply_url: z.string().url(),
  source: z.enum(["scraped", "manual"]),
  status: z.enum(["active", "expired", "flagged"]).default("active"),
  raw_jd_hash: z.string().min(1),
  raw_jd_text: z.string().nullable().optional(),
  normalized_key: z.string().min(1),
  ai_flag_reasons: z.array(z.string()).optional(),
  missing_fields: z.array(z.string()).optional(),
  is_suspicious: z.boolean().optional(),
  confidence_score: z.number().optional(),
});

export type NormalizedListing = z.infer<typeof ListingSchema>;

export interface AtsAdapter {
  name: string;
  type: "GREENHOUSE" | "LEVER" | "ASHBY" | "SMARTRECRUITERS";
  fetchListings(identifier: string, companyName: string): Promise<NormalizedListing[]>;
}

export interface SyncResult {
  companyId: string;
  companyName: string;
  atsType: string;
  fetched: number;
  inserted: number;
  updated: number;
  expired: number;
  flagged: number;
  errors?: string[];
}
