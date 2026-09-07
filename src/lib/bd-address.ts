/**
 * Bangladesh Address Data Wrapper
 *
 * Uses the @bangladeshi/bangladesh-address package (build/src/index.js)
 * which contains: 8 Divisions, 64 Districts, 495 Upazilas, 26 Metropolitan Thanas
 *
 * Package API (name-based, not id-based):
 *   allDivision()              → string[]  (8 division names)
 *   districtsOf(division)      → string[]  (districts in that division)
 *   upazilasOf(district)       → UpazilaData[]  ({upazila, district, division})
 *   allUpazila()               → UpazilaData[]  (all 495 upazilas)
 *   allThana()                 → ThanaData[]     (26 metro thanas)
 *   thanasOf(district)         → ThanaData[]
 *   searchLocations(query)     → SearchResult[]
 */

// Direct import from actual build path (package.json "main" points to wrong path)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bdAddress = require("@bangladeshi/bangladesh-address/build/src/index.js");

export interface UpazilaData {
  upazila: string;
  district: string;
  division: string;
}

export interface ThanaData {
  thana: string;
  district: string;
  division: string;
}

export interface SearchResult {
  type: "upazila" | "thana";
  name: string;
  district: string;
  division: string;
}

/** Returns all 8 division names */
export function getAllDivisions(): string[] {
  return bdAddress.allDivision() as string[];
}

/** Returns all district names for a given division */
export function getDistrictsOfDivision(division: string): string[] {
  return (bdAddress.districtsOf(division) as string[]) || [];
}

/** Returns all upazilas for a given district (from all 495 upazilas) */
export function getUpazilasOfDistrict(district: string): UpazilaData[] {
  return (bdAddress.upazilasOf(district) as UpazilaData[]) || [];
}

/** Returns upazila names only for a given district */
export function getUpazilaNames(district: string): string[] {
  return (bdAddress.upazilaNamesOf(district) as string[]) || [];
}

/** Returns metro thanas for a given district */
export function getThanasOfDistrict(district: string): ThanaData[] {
  return (bdAddress.thanasOf(district) as ThanaData[]) || [];
}

/** Returns all 495 upazilas */
export function getAllUpazilas(): UpazilaData[] {
  return bdAddress.allUpazila() as UpazilaData[];
}

/** Returns all 26 metropolitan thanas */
export function getAllThanas(): ThanaData[] {
  return bdAddress.allThana() as ThanaData[];
}

/** Search across upazilas + thanas */
export function searchLocations(query: string): SearchResult[] {
  return (bdAddress.searchLocations(query) as SearchResult[]) || [];
}
