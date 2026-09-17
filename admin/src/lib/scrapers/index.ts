import { AtsAdapter } from "./types";
import { GreenhouseAdapter } from "./greenhouse";
import { LeverAdapter } from "./lever";
import { AshbyAdapter } from "./ashby";
import { SmartRecruitersAdapter } from "./smartrecruiters";

export * from "./types";
export * from "./greenhouse";
export * from "./lever";
export * from "./ashby";
export * from "./smartrecruiters";

export const adapters: Record<string, AtsAdapter> = {
  GREENHOUSE: new GreenhouseAdapter(),
  LEVER: new LeverAdapter(),
  ASHBY: new AshbyAdapter(),
  SMARTRECRUITERS: new SmartRecruitersAdapter(),
};

export function getAdapter(atsType: string): AtsAdapter | undefined {
  return adapters[atsType.toUpperCase()];
}
