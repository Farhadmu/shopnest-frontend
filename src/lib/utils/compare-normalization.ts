// Multi-Product Difference Detection & Importance Engine
/**
 * ShopNest Comparison Normalization & Intelligence Utilities
 *
 * Normalizes units, groups specifications dynamically by category,
 * detects differences, and provides transparent evidence-based weighted scoring.
 */

import { CompareProductData } from "@/lib/api/products";

export interface NormalizedSpecGroup {
  groupName: string;
  specs: Array<{
    key: string;
    label: string;
    values: Record<string, string>;
    isDifferent: boolean;
    isMissingAny: boolean;
  }>;
}

export interface SpecDifference {
  key: string;
  label: string;
  category: string;
  values: Record<string, string>;
  importance: "high" | "medium" | "standard";
}

/**
 * Normalizes known units for comparison (e.g. 1 TB -> 1024 GB, 1.8 kg -> 1800 g).
 */
export function normalizeUnitValue(val: string): { numeric: number; unit: string; display: string } | null {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim();

  // Storage / RAM (TB / GB / MB)
  const tbMatch = clean.match(/^([\d.]+)\s*TB$/i);
  if (tbMatch) return { numeric: parseFloat(tbMatch[1]) * 1024, unit: "GB", display: clean };

  const gbMatch = clean.match(/^([\d.]+)\s*GB(?:(?:\s+RAM)?)$/i);
  if (gbMatch) return { numeric: parseFloat(gbMatch[1]), unit: "GB", display: clean };

  // Battery (mAh)
  const mahMatch = clean.match(/^([\d.]+)\s*mAh$/i);
  if (mahMatch) return { numeric: parseFloat(mahMatch[1]), unit: "mAh", display: clean };

  // Screen size (inches)
  const inchMatch = clean.match(/^([\d.]+)\s*(?:inch(?:es)?|"|″)$/i);
  if (inchMatch) return { numeric: parseFloat(inchMatch[1]), unit: "inch", display: clean };

  // Refresh rate (Hz)
  const hzMatch = clean.match(/^([\d.]+)\s*Hz$/i);
  if (hzMatch) return { numeric: parseFloat(hzMatch[1]), unit: "Hz", display: clean };

  // Weight (kg / g)
  const kgMatch = clean.match(/^([\d.]+)\s*kg$/i);
  if (kgMatch) return { numeric: parseFloat(kgMatch[1]) * 1000, unit: "g", display: clean };

  const gMatch = clean.match(/^([\d.]+)\s*g(?:rams)?$/i);
  if (gMatch) return { numeric: parseFloat(gMatch[1]), unit: "g", display: clean };

  // Power (W)
  const wMatch = clean.match(/^([\d.]+)\s*(?:W|Watt)$/i);
  if (wMatch) return { numeric: parseFloat(wMatch[1]), unit: "W", display: clean };

  // Plain numbers
  const numMatch = clean.match(/^([\d.]+)$/);
  if (numMatch) return { numeric: parseFloat(numMatch[1]), unit: "", display: clean };

  return null;
}

/**
 * Determines which category a specification belongs to.
 */
export function categorizeSpecKey(key: string): string {
  const lower = key.toLowerCase();

  if (
    lower.includes("processor") ||
    lower.includes("cpu") ||
    lower.includes("gpu") ||
    lower.includes("graphic") ||
    lower.includes("chip") ||
    lower.includes("ram") ||
    lower.includes("memory") ||
    lower.includes("storage") ||
    lower.includes("ssd") ||
    lower.includes("hdd") ||
    lower.includes("rom") ||
    lower.includes("clock") ||
    lower.includes("core")
  ) {
    return "Performance";
  }

  if (
    lower.includes("screen") ||
    lower.includes("display") ||
    lower.includes("resolution") ||
    lower.includes("refresh") ||
    lower.includes("panel") ||
    lower.includes("brightness") ||
    lower.includes("hdr") ||
    lower.includes("aspect") ||
    lower.includes("touch")
  ) {
    return "Display";
  }

  if (
    lower.includes("battery") ||
    lower.includes("mah") ||
    lower.includes("charging") ||
    lower.includes("charger") ||
    lower.includes("power") ||
    lower.includes("watt")
  ) {
    return "Battery & Power";
  }

  if (
    lower.includes("camera") ||
    lower.includes("lens") ||
    lower.includes("sensor") ||
    lower.includes("megapixels") ||
    lower.includes("mp") ||
    lower.includes("aperture") ||
    lower.includes("video") ||
    lower.includes("audio") ||
    lower.includes("speaker") ||
    lower.includes("mic") ||
    lower.includes("sound")
  ) {
    return "Camera & Audio";
  }

  if (
    lower.includes("wifi") ||
    lower.includes("wi-fi") ||
    lower.includes("bluetooth") ||
    lower.includes("usb") ||
    lower.includes("port") ||
    lower.includes("hdmi") ||
    lower.includes("5g") ||
    lower.includes("4g") ||
    lower.includes("sim") ||
    lower.includes("network") ||
    lower.includes("jack")
  ) {
    return "Connectivity & Ports";
  }

  if (
    lower.includes("weight") ||
    lower.includes("dimension") ||
    lower.includes("height") ||
    lower.includes("width") ||
    lower.includes("depth") ||
    lower.includes("color") ||
    lower.includes("material") ||
    lower.includes("water") ||
    lower.includes("ip rating") ||
    lower.includes("durability")
  ) {
    return "Physical & Build";
  }

  return "General & System";
}

/**
 * Groups all specifications across compared products into categorized groups.
 */
export function groupProductSpecifications(products: CompareProductData[]): NormalizedSpecGroup[] {
  if (!products || products.length === 0) return [];

  // Collect all unique keys per category
  const categoryMap = new Map<string, Set<string>>();
  const categoryOrder = [
    "Performance",
    "Display",
    "Battery & Power",
    "Camera & Audio",
    "Connectivity & Ports",
    "Physical & Build",
    "General & System",
  ];

  for (const cat of categoryOrder) {
    categoryMap.set(cat, new Set<string>());
  }

  for (const product of products) {
    const specs = product.specifications || {};
    for (const key of Object.keys(specs)) {
      const cat = categorizeSpecKey(key);
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, new Set<string>());
      }
      categoryMap.get(cat)!.add(key);
    }
  }

  const result: NormalizedSpecGroup[] = [];

  for (const [groupName, keysSet] of categoryMap.entries()) {
    if (keysSet.size === 0) continue;

    const specs = Array.from(keysSet).map((key) => {
      const values: Record<string, string> = {};
      const uniqueValues = new Set<string>();
      let hasMissing = false;

      for (const p of products) {
        const val = p.specifications?.[key];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          const stringVal = String(val).trim();
          values[p.id] = stringVal;
          uniqueValues.add(stringVal.toLowerCase());
        } else {
          values[p.id] = "Not specified";
          hasMissing = true;
        }
      }

      // If all products have the exact same value and nobody is missing, isDifferent is false
      const isDifferent = uniqueValues.size > 1 || (hasMissing && uniqueValues.size > 0);

      return {
        key,
        label: formatSpecLabel(key),
        values,
        isDifferent,
        isMissingAny: hasMissing,
      };
    });

    result.push({ groupName, specs });
  }

  return result;
}

/**
 * Pretty prints specification labels (e.g. ram_size -> RAM Size).
 */
export function formatSpecLabel(key: string): string {
  if (!key) return "";
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bRam\b/g, "RAM")
    .replace(/\bCpu\b/g, "CPU")
    .replace(/\bGpu\b/g, "GPU")
    .replace(/\bSsd\b/g, "SSD")
    .replace(/\bHdd\b/g, "HDD")
    .replace(/\bOs\b/g, "OS")
    .replace(/\bUsb\b/g, "USB")
    .replace(/\bHdmi\b/g, "HDMI")
    .replace(/\bHdr\b/g, "HDR");
}

/**
 * Detects the most meaningful differences across products.
 */
export function detectKeyDifferences(products: CompareProductData[]): SpecDifference[] {
  if (!products || products.length < 2) return [];

  const differences: SpecDifference[] = [];

  // 1. Price difference
  const prices = products.map((p) => p.discountPrice || p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  if (minPrice !== maxPrice) {
    const values: Record<string, string> = {};
    for (const p of products) {
      values[p.id] = `৳${(p.discountPrice || p.price).toLocaleString()}`;
    }
    differences.push({
      key: "price",
      label: "Price Point",
      category: "Pricing",
      values,
      importance: "high",
    });
  }

  // 2. Rating difference
  const ratings = products.map((p) => p.ratingAvg || 0);
  if (Math.max(...ratings) - Math.min(...ratings) >= 0.2) {
    const values: Record<string, string> = {};
    for (const p of products) {
      values[p.id] = `${p.ratingAvg || "4.5"} ★ (${p.ratingCount || 0} reviews)`;
    }
    differences.push({
      key: "rating",
      label: "Customer Rating",
      category: "Reviews",
      values,
      importance: "medium",
    });
  }

  // 3. Free Delivery difference
  const freeDeliveries = products.map((p) => Boolean(p.freeDelivery));
  if (freeDeliveries.some((v) => v) && freeDeliveries.some((v) => !v)) {
    const values: Record<string, string> = {};
    for (const p of products) {
      values[p.id] = p.freeDelivery ? "Free Delivery ✓" : "Standard Delivery Fee";
    }
    differences.push({
      key: "delivery",
      label: "Shipping Cost",
      category: "Delivery",
      values,
      importance: "medium",
    });
  }

  // 4. Warranty difference
  const warranties = products.map((p) => p.warrantyMonths || 0);
  if (Math.max(...warranties) !== Math.min(...warranties)) {
    const values: Record<string, string> = {};
    for (const p of products) {
      values[p.id] = p.warrantyMonths ? `${p.warrantyMonths} Months Coverage` : "Standard Policy";
    }
    differences.push({
      key: "warranty",
      label: "Warranty Period",
      category: "Warranty",
      values,
      importance: "medium",
    });
  }

  // 5. Specification differences
  const groups = groupProductSpecifications(products);
  for (const group of groups) {
    for (const spec of group.specs) {
      if (spec.isDifferent) {
        const lowerKey = spec.key.toLowerCase();
        const isHigh =
          lowerKey.includes("processor") ||
          lowerKey.includes("cpu") ||
          lowerKey.includes("ram") ||
          lowerKey.includes("storage") ||
          lowerKey.includes("battery") ||
          lowerKey.includes("display") ||
          lowerKey.includes("camera");

        differences.push({
          key: spec.key,
          label: spec.label,
          category: group.groupName,
          values: spec.values,
          importance: isHigh ? "high" : "standard",
        });
      }
    }
  }

  // Sort by high importance first
  return differences.sort((a, b) => {
    const impRank = { high: 0, medium: 1, standard: 2 };
    return impRank[a.importance] - impRank[b.importance];
  });
}

/**
 * Transparent Weighted Decision Scoring System
 * Calculates a score (0 to 100) for each product based on real attributes and user-selected weights.
 */
export function calculateWeightedScores(
  products: CompareProductData[],
  weights: {
    price: number;
    rating: number;
    performance: number;
    battery: number;
    warranty: number;
  }
): Record<string, { score: number; rank: number; breakdown: Record<string, number> }> {
  if (!products || products.length === 0) return {};

  const totalWeight =
    (weights.price || 0) +
    (weights.rating || 0) +
    (weights.performance || 0) +
    (weights.battery || 0) +
    (weights.warranty || 0);

  if (totalWeight <= 0) {
    const fallback: Record<string, { score: number; rank: number; breakdown: Record<string, number> }> = {};
    products.forEach((p, idx) => {
      fallback[p.id] = { score: 75, rank: idx + 1, breakdown: {} };
    });
    return fallback;
  }

  // Normalize price: Lower price is better
  const prices = products.map((p) => p.discountPrice || p.price || 1);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Ratings: Higher is better
  const ratings = products.map((p) => p.ratingAvg || 4);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  // Warranties: Higher is better
  const warranties = products.map((p) => p.warrantyMonths || 0);
  const maxWarranty = Math.max(...warranties, 1);

  // Extract performance numeric proxy (RAM / Storage)
  const perfScores = products.map((p) => {
    const specs = p.specifications || {};
    let ramGb = 0;
    let storageGb = 0;
    for (const [k, v] of Object.entries(specs)) {
      const lower = k.toLowerCase();
      if (lower.includes("ram") || lower.includes("memory")) {
        const u = normalizeUnitValue(v);
        if (u && u.unit === "GB") ramGb = u.numeric;
      }
      if (lower.includes("storage") || lower.includes("ssd") || lower.includes("rom")) {
        const u = normalizeUnitValue(v);
        if (u && u.unit === "GB") storageGb = u.numeric;
      }
    }
    return ramGb * 2 + storageGb * 0.1;
  });
  const maxPerf = Math.max(...perfScores, 1);

  // Battery proxy
  const batteryScores = products.map((p) => {
    const specs = p.specifications || {};
    for (const [k, v] of Object.entries(specs)) {
      if (k.toLowerCase().includes("battery")) {
        const u = normalizeUnitValue(v);
        if (u && u.numeric > 0) return u.numeric;
      }
    }
    return 4000;
  });
  const maxBattery = Math.max(...batteryScores, 1);

  const scores: Array<{ id: string; score: number; breakdown: Record<string, number> }> = [];

  products.forEach((p, idx) => {
    const priceVal = p.discountPrice || p.price || 1;
    const priceScore = maxPrice === minPrice ? 1.0 : 1.0 - ((priceVal - minPrice) / (maxPrice - minPrice)) * 0.5;
    const ratingVal = p.ratingAvg || 4.5;
    const ratingScore = ratingVal / 5.0;
    const perfScore = maxPerf > 0 ? (perfScores[idx] || 1) / maxPerf : 0.8;
    const batScore = maxBattery > 0 ? (batteryScores[idx] || 1) / maxBattery : 0.8;
    const warScore = (p.warrantyMonths || 6) / Math.max(maxWarranty, 12);

    const weightedTotal =
      (priceScore * weights.price +
        ratingScore * weights.rating +
        perfScore * weights.performance +
        batScore * weights.battery +
        warScore * weights.warranty) /
      totalWeight;

    const finalScore = Math.min(99, Math.max(50, Math.round(weightedTotal * 100)));

    scores.push({
      id: p.id,
      score: finalScore,
      breakdown: {
        price: Math.round(priceScore * 100),
        rating: Math.round(ratingScore * 100),
        performance: Math.round(perfScore * 100),
        battery: Math.round(batScore * 100),
        warranty: Math.round(warScore * 100),
      },
    });
  });

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const result: Record<string, { score: number; rank: number; breakdown: Record<string, number> }> = {};

  sorted.forEach((item, index) => {
    result[item.id] = {
      score: item.score,
      rank: index + 1,
      breakdown: item.breakdown,
    };
  });

  return result;
}
