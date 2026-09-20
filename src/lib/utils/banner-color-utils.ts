/**
 * Utilities for Banner Color Palette generation, Image Color Extraction,
 * and WCAG 2.1 Contrast Ratio Analysis.
 */

export interface BannerColorPreset {
  id: string;
  name: string;
  tagline: string;
  overlayColor: string;
  overlayOpacity: number;
  lightTextColor: string;
  darkTextColor: string;
  lightButtonColor: string;
  darkButtonColor: string;
  textTheme: "light" | "dark";
  previewGradient: string;
}

export const BANNER_COLOR_PRESETS: BannerColorPreset[] = [
  {
    id: "midnight-luxury",
    name: "Midnight Luxury",
    tagline: "Deep charcoal with radiant golden/white accents",
    overlayColor: "#0B0F19",
    overlayOpacity: 75,
    lightTextColor: "#FFFFFF",
    darkTextColor: "#FFFFFF",
    lightButtonColor: "#F59E0B",
    darkButtonColor: "#F59E0B",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #0B0F19 0%, #1E293B 100%)",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    tagline: "Vibrant violet and electric cyan for high impact",
    overlayColor: "#0F0C29",
    overlayOpacity: 70,
    lightTextColor: "#FFFFFF",
    darkTextColor: "#FFFFFF",
    lightButtonColor: "#06B6D4",
    darkButtonColor: "#06B6D4",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    tagline: "Warm coral and amber tones with crisp white typography",
    overlayColor: "#2A0808",
    overlayOpacity: 65,
    lightTextColor: "#FFFFFF",
    darkTextColor: "#FFFFFF",
    lightButtonColor: "#F97316",
    darkButtonColor: "#F97316",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #4A154B 0%, #EA580C 100%)",
  },
  {
    id: "emerald-luxe",
    name: "Emerald Luxe",
    tagline: "Rich deep forest green with crisp accents",
    overlayColor: "#022C22",
    overlayOpacity: 70,
    lightTextColor: "#F0FDF4",
    darkTextColor: "#F0FDF4",
    lightButtonColor: "#10B981",
    darkButtonColor: "#10B981",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
  },
  {
    id: "ocean-deep",
    name: "Oceanic Deep",
    tagline: "Deep sapphire blue paired with pure white & aqua",
    overlayColor: "#082F49",
    overlayOpacity: 70,
    lightTextColor: "#F0F9FF",
    darkTextColor: "#F0F9FF",
    lightButtonColor: "#0EA5E9",
    darkButtonColor: "#0EA5E9",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #082F49 0%, #0369A1 100%)",
  },
  {
    id: "rose-champagne",
    name: "Rose Elegance",
    tagline: "Muted blush and burgundy for premium boutique feel",
    overlayColor: "#2A0A18",
    overlayOpacity: 70,
    lightTextColor: "#FFF1F2",
    darkTextColor: "#FFF1F2",
    lightButtonColor: "#F43F5E",
    darkButtonColor: "#F43F5E",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #2A0A18 0%, #4C0519 100%)",
  },
  {
    id: "minimal-clean",
    name: "Minimal Light",
    tagline: "Crisp white/frost overlay with bold dark typography",
    overlayColor: "#FFFFFF",
    overlayOpacity: 85,
    lightTextColor: "#0F172A",
    darkTextColor: "#0F172A",
    lightButtonColor: "#0F172A",
    darkButtonColor: "#0F172A",
    textTheme: "dark",
    previewGradient: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
  },
  {
    id: "velvet-plum",
    name: "Velvet Plum",
    tagline: "Deep royal purple with radiant gold accents",
    overlayColor: "#1E0533",
    overlayOpacity: 75,
    lightTextColor: "#FAF5FF",
    darkTextColor: "#FAF5FF",
    lightButtonColor: "#A855F7",
    darkButtonColor: "#A855F7",
    textTheme: "light",
    previewGradient: "linear-gradient(135deg, #1E0533 0%, #3B0764 100%)",
  },
];

export interface ExtractedPalette {
  dominantHex: string;
  suggestedOverlay: string;
  suggestedOpacity: number;
  suggestedLightText: string;
  suggestedDarkText: string;
  suggestedLightBtn: string;
  suggestedDarkBtn: string;
  recommendedTheme: "light" | "dark";
  palette: string[];
}

/**
 * Parses any hex color (e.g. #fff, #112233) to RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = (hex || "").replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleaned.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/**
 * Computes WCAG relative luminance for a given sRGB color.
 */
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Calculates WCAG 2.1 contrast ratio between two colors (ranges from 1 to 21).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Returns '#0F172A' (dark) if background is light/bright, or '#FFFFFF' (white) if background is dark.
 */
export function getContrastingTextColor(bgHex: string | null | undefined): string {
  if (!bgHex) return "#FFFFFF";
  const rgb = hexToRgb(bgHex);
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum >= 0.45 ? "#0F172A" : "#FFFFFF";
}

/**
 * Simulates blending overlay color over a background color at a given opacity (0-100).
 */
export function blendColors(
  fgHex: string,
  bgHex: string,
  opacityPercent: number
): string {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const alpha = Math.max(0, Math.min(1, (opacityPercent ?? 70) / 100));
  const r = fg.r * alpha + bg.r * (1 - alpha);
  const g = fg.g * alpha + bg.g * (1 - alpha);
  const b = fg.b * alpha + bg.b * (1 - alpha);
  return rgbToHex(r, g, b);
}

export interface ContrastAnalysis {
  ratio: number;
  level: "AAA" | "AA" | "FAIL";
  message: string;
  isAccessible: boolean;
}

/**
 * Assesses contrast between active text and effective background scrim.
 */
export function analyzeBannerContrast(
  textColor: string,
  overlayColor: string,
  overlayOpacity: number,
  baseBg: string = "#1E293B"
): ContrastAnalysis {
  const blendedBg = blendColors(overlayColor || "#000000", baseBg, overlayOpacity || 70);
  const ratio = getContrastRatio(textColor || "#FFFFFF", blendedBg);

  if (ratio >= 7.0) {
    return {
      ratio,
      level: "AAA",
      message: "Excellent contrast (WCAG AAA)",
      isAccessible: true,
    };
  } else if (ratio >= 4.5) {
    return {
      ratio,
      level: "AA",
      message: "Good contrast (WCAG AA)",
      isAccessible: true,
    };
  } else {
    return {
      ratio,
      level: "FAIL",
      message: "Low contrast - text may be hard to read",
      isAccessible: false,
    };
  }
}

/**
 * Suggests an auto-fix for low contrast.
 */
export function getAutoFixColors(
  overlayColor: string,
  overlayOpacity: number
): {
  overlayOpacity: number;
  textColor: string;
  buttonColor: string;
} {
  const isDarkOverlay =
    getLuminance(
      hexToRgb(overlayColor).r,
      hexToRgb(overlayColor).g,
      hexToRgb(overlayColor).b
    ) < 0.5;

  if (isDarkOverlay) {
    // Dark overlay -> White text, high opacity (>= 75%)
    return {
      overlayOpacity: Math.max(75, overlayOpacity),
      textColor: "#FFFFFF",
      buttonColor: "#3B82F6",
    };
  } else {
    // Light overlay -> Dark slate text, high opacity (>= 85%)
    return {
      overlayOpacity: Math.max(85, overlayOpacity),
      textColor: "#0F172A",
      buttonColor: "#1E293B",
    };
  }
}

/**
 * Extracts dominant and vibrant colors from an image URL using in-browser Canvas.
 */
export async function extractColorsFromImageUrl(imageUrl: string): Promise<ExtractedPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas context unavailable");
        }

        // Downscale for speed and averaging
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        const colorMap: Record<string, { r: number; g: number; b: number; count: number; sat: number }> = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a < 128) continue; // skip transparent

          totalR += r;
          totalG += g;
          totalB += b;
          count++;

          // Quantize
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;

          // Saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;

          if (!colorMap[key]) {
            colorMap[key] = { r: qr, g: qg, b: qb, count: 0, sat };
          }
          colorMap[key].count++;
        }

        const avgR = count > 0 ? Math.round(totalR / count) : 30;
        const avgG = count > 0 ? Math.round(totalG / count) : 30;
        const avgB = count > 0 ? Math.round(totalB / count) : 30;

        // Find vibrant accent
        const sorted = Object.values(colorMap).sort(
          (a, b) => b.sat * 0.7 + (b.count / count) * 0.3 - (a.sat * 0.7 + (a.count / count) * 0.3)
        );

        const vibrant = sorted[0] || { r: avgR, g: avgG, b: avgB };
        const vibrantHex = rgbToHex(vibrant.r, vibrant.g, vibrant.b);
        const dominantHex = rgbToHex(avgR, avgG, avgB);

        // Darken dominant color to make a rich overlay scrim
        const darkOverlayR = Math.floor(avgR * 0.2);
        const darkOverlayG = Math.floor(avgG * 0.2);
        const darkOverlayB = Math.floor(avgB * 0.25);
        const suggestedOverlay = rgbToHex(darkOverlayR, darkOverlayG, darkOverlayB);

        const palette = sorted.slice(0, 5).map((c) => rgbToHex(c.r, c.g, c.b));

        resolve({
          dominantHex,
          suggestedOverlay,
          suggestedOpacity: 72,
          suggestedLightText: "#FFFFFF",
          suggestedDarkText: "#FFFFFF",
          suggestedLightBtn: vibrantHex,
          suggestedDarkBtn: vibrantHex,
          recommendedTheme: "light",
          palette: palette.length > 0 ? palette : [dominantHex, vibrantHex, "#3B82F6", "#10B981", "#F59E0B"],
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for color extraction (CORS or invalid URL)"));
    };

    img.src = imageUrl;
  });
}
