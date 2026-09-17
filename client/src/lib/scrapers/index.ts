import { AtsAdapter } from "./types";
import { greenhouseAdapter } from "./greenhouse";
import { leverAdapter } from "./lever";
import { ashbyAdapter } from "./ashby";
import { smartRecruitersAdapter } from "./smartrecruiters";

export * from "./types";
export * from "./greenhouse";
export * from "./lever";
export * from "./ashby";
export * from "./smartrecruiters";

export const adapters: Record<string, AtsAdapter> = {
  GREENHOUSE: greenhouseAdapter,
  LEVER: leverAdapter,
  ASHBY: ashbyAdapter,
  SMARTRECRUITERS: smartRecruitersAdapter,
};

export function getAdapter(atsType: string): AtsAdapter | null {
  const normalized = atsType?.toUpperCase();
  return adapters[normalized] || null;
}
