import { z } from "zod";

export const ListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  employment_type: z.string().nullable().optional(),
  eligibility: z.string().nullable().optional(),
  stipend_or_salary: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  skills_required: z.array(z.string()).default([]),
  experience_level: z.string().nullable().optional(),
  apply_url: z.string().url("Valid apply URL is required"),
  summary: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).optional().default([]),
  qualifications: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  clean_description: z.string().nullable().optional(),
});

export type ExtractedListing = z.infer<typeof ListingSchema>;

export interface NormalizedListing {
  title: string;
  company: string;
  location: string;
  employment_type: string | null;
  eligibility: string | null;
  stipend_or_salary: string | null;
  deadline: string | null;
  skills_required: string[];
  experience_level: string | null;
  apply_url: string;
  source: string;
  raw_jd_hash: string;
  raw_jd_text: string | null;
  normalized_key: string;
  summary?: string | null;
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  clean_description?: string | null;
  ai_flag_reasons?: string[];
  missing_fields?: string[];
  is_suspicious?: boolean;
  confidence_score?: number;
}

export interface AtsAdapter {
  atsType: string;
  fetchListings(atsIdentifier: string, companyName: string): Promise<NormalizedListing[]>;
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
