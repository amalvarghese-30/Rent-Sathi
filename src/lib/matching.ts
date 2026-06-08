// RentSaathi matching engine — pure business logic, no AI.
// Weighted scoring: Location 40 · Budget 30 · Property type 20 · Amenities 10.

export type Requirement = {
  area: string;
  budgetMin: number;
  budgetMax: number;
  propertyType: string;
  amenities: string[];
};

export type Property = {
  area: string;
  rent: number;
  propertyType: string;
  amenities: string[];
};

export type ScoreBreakdown = {
  location: number;   // 0-40
  budget: number;     // 0-30
  property: number;   // 0-20
  amenities: number;  // 0-10
  total: number;      // 0-100
};

export const WEIGHTS = { location: 40, budget: 30, property: 20, amenities: 10 } as const;

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function scoreLocation(reqArea: string, propArea: string): number {
  if (!reqArea || !propArea) return 0;
  const a = norm(reqArea), b = norm(propArea);
  if (a === b) return WEIGHTS.location;
  if (a.includes(b) || b.includes(a)) return Math.round(WEIGHTS.location * 0.7);
  // first token match (e.g. "Nerul Sector 10" vs "Nerul Sector 11")
  const ta = a.split(/[ ,]/)[0], tb = b.split(/[ ,]/)[0];
  if (ta && ta === tb) return Math.round(WEIGHTS.location * 0.55);
  return Math.round(WEIGHTS.location * 0.2);
}

export function scoreBudget(min: number, max: number, rent: number): number {
  if (!rent) return 0;
  if (rent >= min && rent <= max) return WEIGHTS.budget;
  const target = (min + max) / 2 || rent;
  const range = Math.max(max - min, 1);
  const diff = rent < min ? min - rent : rent - max;
  const penalty = Math.min(1, diff / range);
  return Math.max(Math.round(WEIGHTS.budget * (1 - penalty)), Math.round(WEIGHTS.budget * 0.2));
}

export function scoreProperty(reqType: string, propType: string): number {
  if (!reqType || !propType) return 0;
  if (norm(reqType) === norm(propType)) return WEIGHTS.property;
  // adjacent types get half credit (e.g. Studio ↔ 1 BHK, 2 BHK ↔ 3 BHK)
  const order = ["Studio", "1 BHK", "2 BHK", "3 BHK", "PG"];
  const i = order.findIndex((t) => norm(t) === norm(reqType));
  const j = order.findIndex((t) => norm(t) === norm(propType));
  if (i >= 0 && j >= 0 && Math.abs(i - j) === 1) return Math.round(WEIGHTS.property * 0.5);
  return Math.round(WEIGHTS.property * 0.2);
}

export function scoreAmenities(req: string[], prop: string[]): number {
  if (req.length === 0) return WEIGHTS.amenities;
  const set = new Set(prop.map(norm));
  const matched = req.filter((a) => set.has(norm(a))).length;
  return Math.round((matched / req.length) * WEIGHTS.amenities);
}

export function scoreMatch(r: Requirement, p: Property): ScoreBreakdown {
  const location = scoreLocation(r.area, p.area);
  const budget = scoreBudget(r.budgetMin, r.budgetMax, p.rent);
  const property = scoreProperty(r.propertyType, p.propertyType);
  const amenities = scoreAmenities(r.amenities, p.amenities);
  return { location, budget, property, amenities, total: location + budget + property + amenities };
}

// Status machines — single source of truth across UI.
export const REQUIREMENT_STATUSES = [
  "Draft", "Active", "Matching", "Matched", "Verification", "Connected", "Closed",
] as const;

export const PROPERTY_STATUSES = [
  "Draft", "Pending Verification", "Verified", "Matched", "Inactive",
] as const;

export const MATCH_STATUSES = [
  "Created", "Pending Admin", "Pending User", "Approved", "Rejected", "Connected",
] as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type MatchStatus = (typeof MATCH_STATUSES)[number];
