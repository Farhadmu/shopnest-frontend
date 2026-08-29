/**
 * Banner section — shared types and static default data.
 */

export type BannerCategory = {
  id: string;
  label: string;
  href: string;
  /** Per-category card overrides shown when this category is active in the auto-cycle. */
  heroSlides?: HeroSlide[];
  sideCards?: PromoCard[];
  bottomCards?: PromoCard[];
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText: string;
  buttonLink: string;

  bgClassName?: string;

  textTheme?: "light" | "dark";
};

export type PromoCard = {
  id: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  price?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  bgClassName?: string;
  textTheme?: "light" | "dark";
};

export type BannerSectionData = {
  saleLabel?: string;
  /** Optional static fallback; the Banner component fetches live categories from the API. */
  categories?: BannerCategory[];
  heroSlides: HeroSlide[];
  /** Two cards stacked in the right-hand rail. */
  sideCards: PromoCard[];
  /** Two cards under the hero carousel. */
  bottomCards: PromoCard[];
};

// ---------------------------------------------------------------------------
// Per-category card data — every product is UNIQUE to its category.
// No product name or concept repeats across categories.
// Uses existing images as placeholders until real assets are provided.
// ---------------------------------------------------------------------------

type CardSet = {
  heroSlides: HeroSlide[];
  sideCards: PromoCard[];
  bottomCards: PromoCard[];
};

// ── 1. Electronics ──────────────────────────────────────────────────────────
const electronicsCards: CardSet = {
  heroSlides: [
    {
      id: "elec-hero",
      title: "Ultra-Thin 4K OLED TV",
      subtitle: "65\" Cinematic Display",
      description: "Dolby Vision IQ, 120Hz refresh, AI-powered upscaling",
      image: "/assets/electronics/Ultra-Thin 4K OLED TV.png",
      buttonText: "BUY NOW",
      buttonLink: "/products/ultra-thin-4k-oled-tv",
      bgClassName: "bg-gradient-to-br from-indigo-600 to-violet-800",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "elec-s1",
      eyebrow: "BESTSELLER",
      title: "Smart Robot Vacuum",
      highlight: "X9 PRO",
      image: "/assets/electronics/Smart Robot Vacuum.png",
      buttonText: "SHOP NOW",
      buttonLink: "/products/smart-robot-vacuum",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "elec-s2",
      title: "Wireless Charging Pad",
      highlight: "3-IN-1",
      price: "$49",
      image: "/assets/electronics/Wireless Charging Pad.png",
      buttonLink: "/products/wireless-charging-pad",
      bgClassName: "bg-gray-900",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "elec-b1",
      title: "Smart Air Purifier",
      price: "$299",
      image: "/assets/electronics/Smart Air Purifier.png",
      buttonText: "DISCOVER NOW",
      buttonLink: "/products/smart-air-purifier",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "elec-b2",
      title: "Portable Power Station",
      highlight: "1000W",
      description: "Solar compatible, powers anything anywhere",
      image: "/assets/electronics/Portable Power Station.png",
      buttonLink: "/products/portable-power-station",
      bgClassName: "bg-gradient-to-br from-slate-700 to-slate-900",
      textTheme: "light",
    },
  ],
};

// ── 2. Fashion ──────────────────────────────────────────────────────────────
const fashionCards: CardSet = {
  heroSlides: [
    {
      id: "fash-hero",
      title: "Italian Leather Tote Bag",
      subtitle: "Handcrafted in Florence",
      description: "Full-grain vegetable-tanned leather, lifetime warranty",
      image: "/assets/watch.png",
      buttonText: "VIEW COLLECTION",
      buttonLink: "/products/italian-leather-tote",
      bgClassName: "bg-gradient-to-br from-rose-400 to-pink-600",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "fash-s1",
      eyebrow: "TRENDING",
      title: "Oversized Wool Blazer",
      highlight: "UNISEX",
      image: "/assets/headphone.png",
      buttonText: "GET YOURS",
      buttonLink: "/products/oversized-wool-blazer",
      bgClassName: "bg-gradient-to-br from-amber-50 to-orange-100",
      textTheme: "dark",
    },
    {
      id: "fash-s2",
      title: "Silk Scarf Collection",
      highlight: "ARTISAN",
      price: "$89",
      image: "/assets/keyboard.png",
      buttonLink: "/products/silk-scarf-collection",
      bgClassName: "bg-gradient-to-br from-stone-800 to-stone-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "fash-b1",
      eyebrow: "NEW ARRIVAL",
      title: "Cashmere Knit Sweater",
      price: "$179",
      image: "/assets/playgo5.png",
      buttonText: "EXPLORE",
      buttonLink: "/products/cashmere-knit-sweater",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "fash-b2",
      title: "Titanium Sunglasses",
      highlight: "POLARISED",
      description: "Ultra-light Japanese titanium frame",
      image: "/assets/gopro.png",
      buttonLink: "/products/titanium-sunglasses",
      bgClassName: "bg-gray-900",
      textTheme: "light",
    },
  ],
};

// ── 3. Home & Living ────────────────────────────────────────────────────────
const homeCards: CardSet = {
  heroSlides: [
    {
      id: "home-hero",
      title: "Modular Sofa System",
      subtitle: "Design Your Perfect Lounge",
      description: "Stain-resistant fabric, 12 configurations, easy assembly",
      image: "/assets/playgo5.png",
      buttonText: "SHOP NOW",
      buttonLink: "/products/modular-sofa-system",
      bgClassName: "bg-gradient-to-br from-emerald-500 to-teal-700",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "home-s1",
      eyebrow: "SMART HOME",
      title: "Automated Curtain Motor",
      highlight: "WIFI",
      image: "/assets/keyboard.png",
      buttonText: "VIEW DEAL",
      buttonLink: "/products/automated-curtain-motor",
      bgClassName: "bg-gradient-to-br from-emerald-50 to-teal-100",
      textTheme: "dark",
    },
    {
      id: "home-s2",
      title: "Aromatherapy Diffuser",
      highlight: "CERAMIC",
      price: "$45",
      image: "/assets/gopro.png",
      buttonLink: "/products/aromatherapy-diffuser",
      bgClassName: "bg-gradient-to-br from-gray-800 to-gray-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "home-b1",
      title: "Memory Foam Mattress",
      highlight: "COOLING",
      price: "$599",
      image: "/assets/headphone.png",
      buttonText: "ADD TO CART",
      buttonLink: "/products/memory-foam-mattress",
      bgClassName: "bg-gradient-to-br from-teal-600 to-emerald-800",
      textTheme: "light",
    },
    {
      id: "home-b2",
      eyebrow: "KITCHEN",
      title: "Cast Iron Dutch Oven",
      price: "$79",
      image: "/assets/watch.png",
      buttonLink: "/products/cast-iron-dutch-oven",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
  ],
};

// ── 4. Sports ───────────────────────────────────────────────────────────────
const sportsCards: CardSet = {
  heroSlides: [
    {
      id: "sport-hero",
      title: "Carbon Fibre Road Bike",
      subtitle: "Aero Race Series",
      description: "Electronic shifting, disc brakes, sub-7kg frame",
      image: "/assets/watch.png",
      buttonText: "GEAR UP",
      buttonLink: "/products/carbon-fibre-road-bike",
      bgClassName: "bg-gradient-to-br from-orange-500 to-red-700",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "sport-s1",
      eyebrow: "OUTDOOR",
      title: "Ultralight Hiking Tent",
      highlight: "2-PERSON",
      image: "/assets/gopro.png",
      buttonText: "SHOP NOW",
      buttonLink: "/products/ultralight-hiking-tent",
      bgClassName: "bg-gradient-to-br from-orange-50 to-amber-100",
      textTheme: "dark",
    },
    {
      id: "sport-s2",
      title: "Resistance Band Set",
      highlight: "PRO KIT",
      price: "$39",
      image: "/assets/headphone.png",
      buttonLink: "/products/resistance-band-set",
      bgClassName: "bg-gradient-to-br from-red-800 to-red-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "sport-b1",
      title: "Insulated Water Bottle",
      highlight: "1L",
      price: "$35",
      image: "/assets/playgo5.png",
      buttonText: "BUY NOW",
      buttonLink: "/products/insulated-water-bottle",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "sport-b2",
      title: "Compression Leggings",
      highlight: "DRI-FIT",
      description: "Muscle support, moisture wicking",
      image: "/assets/keyboard.png",
      buttonLink: "/products/compression-leggings",
      bgClassName: "bg-gradient-to-br from-orange-700 to-amber-900",
      textTheme: "light",
    },
  ],
};

// ── 5. Beauty ───────────────────────────────────────────────────────────────
const beautyCards: CardSet = {
  heroSlides: [
    {
      id: "beauty-hero",
      title: "Retinol Age-Defying Serum",
      subtitle: "Clinically Proven Results",
      description: "0.5% encapsulated retinol, hyaluronic acid, vitamin E",
      image: "/assets/playgo5.png",
      buttonText: "DISCOVER",
      buttonLink: "/products/retinol-age-defying-serum",
      bgClassName: "bg-gradient-to-br from-fuchsia-400 to-purple-600",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "beauty-s1",
      eyebrow: "GLOW UP",
      title: "Jade Roller & Gua Sha",
      highlight: "SET",
      image: "/assets/gopro.png",
      buttonText: "SHOP NOW",
      buttonLink: "/products/jade-roller-gua-sha",
      bgClassName: "bg-gradient-to-br from-pink-50 to-fuchsia-100",
      textTheme: "dark",
    },
    {
      id: "beauty-s2",
      title: "24K Gold Face Mask",
      highlight: "LUXURY",
      price: "$29",
      image: "/assets/headphone.png",
      buttonLink: "/products/24k-gold-face-mask",
      bgClassName: "bg-gradient-to-br from-purple-800 to-fuchsia-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "beauty-b1",
      eyebrow: "SELF CARE",
      title: "Organic Bath Bomb Set",
      price: "$24",
      image: "/assets/watch.png",
      buttonText: "GET YOURS",
      buttonLink: "/products/organic-bath-bomb-set",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "beauty-b2",
      title: "Curling Wand Pro",
      highlight: "CERAMIC",
      description: "5 barrel sizes, auto-shutoff, heat guard",
      image: "/assets/keyboard.png",
      buttonLink: "/products/curling-wand-pro",
      bgClassName: "bg-gradient-to-br from-pink-600 to-rose-800",
      textTheme: "light",
    },
  ],
};

// ── 6. Gaming ───────────────────────────────────────────────────────────────
const gamingCards: CardSet = {
  heroSlides: [
    {
      id: "gaming-hero",
      title: "VR Headset Ultra",
      subtitle: "Mixed Reality Gaming",
      description: "Pancake lens, 4K per eye, full body tracking",
      image: "/assets/headphone.png",
      buttonText: "LEVEL UP",
      buttonLink: "/products/vr-headset-ultra",
      bgClassName: "bg-gradient-to-br from-cyan-500 to-blue-800",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "gaming-s1",
      eyebrow: "ESPORTS",
      title: "Tournament Mouse",
      highlight: "25K DPI",
      image: "/assets/keyboard.png",
      buttonText: "CUSTOMIZE",
      buttonLink: "/products/tournament-mouse",
      bgClassName: "bg-gradient-to-br from-cyan-900 to-blue-950",
      textTheme: "light",
    },
    {
      id: "gaming-s2",
      title: "Racing Sim Wheel",
      highlight: "FORCE FB",
      price: "$349",
      image: "/assets/gopro.png",
      buttonLink: "/products/racing-sim-wheel",
      bgClassName: "bg-gray-900",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "gaming-b1",
      title: "Ergonomic Gaming Chair",
      highlight: "4D ARMS",
      price: "$429",
      image: "/assets/watch.png",
      buttonText: "PRE-ORDER",
      buttonLink: "/products/ergonomic-gaming-chair",
      bgClassName: "bg-gradient-to-br from-blue-600 to-indigo-800",
      textTheme: "light",
    },
    {
      id: "gaming-b2",
      title: "RGB LED Light Strip",
      highlight: "SMART",
      description: "Sync with gameplay, voice control",
      image: "/assets/playgo5.png",
      buttonLink: "/products/rgb-led-light-strip",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
  ],
};

// ── 7. Audio ────────────────────────────────────────────────────────────────
const audioCards: CardSet = {
  heroSlides: [
    {
      id: "audio-hero",
      title: "Vinyl Turntable",
      subtitle: "Belt-Drive Hi-Fi",
      description: "Ortofon cartridge, built-in phono preamp, walnut plinth",
      image: "/assets/playgo5.png",
      buttonText: "LISTEN NOW",
      buttonLink: "/products/vinyl-turntable-hifi",
      bgClassName: "bg-gradient-to-br from-amber-500 to-yellow-700",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "audio-s1",
      eyebrow: "AUDIOPHILE",
      title: "Tube Amplifier",
      highlight: "CLASS A",
      image: "/assets/headphone.png",
      buttonText: "EXPLORE",
      buttonLink: "/products/tube-amplifier-class-a",
      bgClassName: "bg-gradient-to-br from-amber-50 to-yellow-100",
      textTheme: "dark",
    },
    {
      id: "audio-s2",
      title: "DAC / Headphone Amp",
      highlight: "BALANCED",
      price: "$199",
      image: "/assets/keyboard.png",
      buttonLink: "/products/dac-headphone-amp",
      bgClassName: "bg-gradient-to-br from-amber-800 to-yellow-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "audio-b1",
      title: "Condenser Microphone",
      highlight: "XLR",
      price: "$139",
      image: "/assets/gopro.png",
      buttonText: "BUY NOW",
      buttonLink: "/products/condenser-microphone-xlr",
      bgClassName: "bg-gray-900",
      textTheme: "light",
    },
    {
      id: "audio-b2",
      eyebrow: "PORTABLE",
      title: "DAP Music Player",
      price: "$249",
      image: "/assets/watch.png",
      buttonLink: "/products/dap-music-player",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
  ],
};

// ── 8. Cameras ──────────────────────────────────────────────────────────────
const camerasCards: CardSet = {
  heroSlides: [
    {
      id: "cam-hero",
      title: "Mirrorless Full-Frame",
      subtitle: "50MP Sensor",
      description: "In-body stabilisation, 8K video, dual card slots",
      image: "/assets/gopro.png",
      buttonText: "EXPLORE",
      buttonLink: "/products/mirrorless-full-frame-50mp",
      bgClassName: "bg-gradient-to-br from-gray-800 to-gray-950",
      textTheme: "light",
    },
  ],
  sideCards: [
    {
      id: "cam-s1",
      eyebrow: "VLOG",
      title: "Gimbal Stabiliser",
      highlight: "3-AXIS",
      image: "/assets/headphone.png",
      buttonText: "SHOP NOW",
      buttonLink: "/products/gimbal-stabiliser-3-axis",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "cam-s2",
      title: "Telephoto Zoom Lens",
      highlight: "70-200mm",
      price: "$899",
      image: "/assets/keyboard.png",
      buttonLink: "/products/telephoto-zoom-lens",
      bgClassName: "bg-gradient-to-br from-zinc-700 to-zinc-900",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "cam-b1",
      title: "Carbon Fibre Tripod",
      highlight: "TRAVEL",
      price: "$189",
      image: "/assets/watch.png",
      buttonText: "ADD TO KIT",
      buttonLink: "/products/carbon-fibre-tripod",
      bgClassName: "bg-gradient-to-br from-slate-600 to-slate-800",
      textTheme: "light",
    },
    {
      id: "cam-b2",
      eyebrow: "STORAGE",
      title: "CFexpress Type B Card",
      price: "$149",
      image: "/assets/playgo5.png",
      buttonText: "VIEW SPECS",
      buttonLink: "/products/cfexpress-type-b-card",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
  ],
};

// ── Books ────────────────────────────────────────────────────────────────────
const booksCards: CardSet = {
  heroSlides: [{
    id: "books-hero",
    title: "Atomic Habits",
    subtitle: "James Clear — #1 NYT Bestseller",
    description: "Tiny changes, remarkable results — over 15 million copies sold worldwide",
    image: "/assets/headphone.png",
    buttonText: "BUY NOW",
    buttonLink: "/products/atomic-habits",
    bgClassName: "bg-gradient-to-br from-amber-700 to-orange-900",
    textTheme: "light",
  }],
  sideCards: [
    {
      id: "books-s1",
      eyebrow: "BESTSELLER",
      title: "The Psychology of Money",
      highlight: "PAPERBACK",
      image: "/assets/playgo5.png",
      buttonText: "EXPLORE",
      buttonLink: "/products/psychology-of-money",
      bgClassName: "bg-gradient-to-br from-amber-50 to-yellow-100",
      textTheme: "dark",
    },
    {
      id: "books-s2",
      title: "Deep Work",
      highlight: "CAL NEWPORT",
      price: "$14",
      image: "/assets/keyboard.png",
      buttonLink: "/products/deep-work",
      bgClassName: "bg-gradient-to-br from-stone-700 to-stone-900",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "books-b1",
      eyebrow: "FICTION",
      title: "The Midnight Library",
      price: "$12",
      image: "/assets/watch.png",
      buttonText: "READ NOW",
      buttonLink: "/products/the-midnight-library",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "books-b2",
      title: "Sapiens",
      highlight: "HARDCOVER",
      description: "A brief history of humankind — Yuval Noah Harari",
      image: "/assets/gopro.png",
      buttonLink: "/products/sapiens",
      bgClassName: "bg-gradient-to-br from-amber-800 to-stone-950",
      textTheme: "light",
    },
  ],
};

// ── Home & Kitchen ────────────────────────────────────────────────────────────
const homeKitchenCards: CardSet = {
  heroSlides: [{
    id: "homek-hero",
    title: "Smart Air Fryer XL",
    subtitle: "7-Litre Family Size",
    description: "12 presets, touchscreen, 75% less oil — crispy every time",
    image: "/assets/playgo5.png",
    buttonText: "SHOP NOW",
    buttonLink: "/products/smart-air-fryer-xl",
    bgClassName: "bg-gradient-to-br from-emerald-500 to-teal-700",
    textTheme: "light",
  }],
  sideCards: [
    {
      id: "homek-s1",
      eyebrow: "KITCHEN",
      title: "Cast Iron Dutch Oven",
      highlight: "6.7L",
      image: "/assets/keyboard.png",
      buttonText: "VIEW DEAL",
      buttonLink: "/products/cast-iron-dutch-oven",
      bgClassName: "bg-gradient-to-br from-emerald-50 to-teal-100",
      textTheme: "dark",
    },
    {
      id: "homek-s2",
      title: "Bamboo Cutting Board",
      highlight: "3-PIECE",
      price: "$32",
      image: "/assets/gopro.png",
      buttonLink: "/products/bamboo-cutting-board-set",
      bgClassName: "bg-gradient-to-br from-gray-800 to-gray-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "homek-b1",
      title: "Memory Foam Mattress",
      highlight: "COOLING GEL",
      price: "$599",
      image: "/assets/headphone.png",
      buttonText: "ADD TO CART",
      buttonLink: "/products/cooling-gel-memory-foam-mattress",
      bgClassName: "bg-gradient-to-br from-teal-600 to-emerald-800",
      textTheme: "light",
    },
    {
      id: "homek-b2",
      eyebrow: "ORGANIZE",
      title: "Modular Storage Cubes",
      price: "$65",
      image: "/assets/watch.png",
      buttonLink: "/products/modular-storage-cubes",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
  ],
};

// ── Mobile ────────────────────────────────────────────────────────────────────
const mobileCards: CardSet = {
  heroSlides: [{
    id: "mobile-hero",
    title: "Galaxy Ultra S25",
    subtitle: "Titanium Frame · 200MP",
    description: "Snapdragon 8 Elite, 5000mAh, 45W wired + 15W wireless charging",
    image: "/assets/gopro.png",
    buttonText: "PRE-ORDER",
    buttonLink: "/products/galaxy-ultra-s25",
    bgClassName: "bg-gradient-to-br from-cyan-600 to-blue-800",
    textTheme: "light",
  }],
  sideCards: [
    {
      id: "mobile-s1",
      eyebrow: "ACCESSORIES",
      title: "MagSafe Wallet Case",
      highlight: "LEATHER",
      image: "/assets/keyboard.png",
      buttonText: "SHOP NOW",
      buttonLink: "/products/magsafe-leather-wallet-case",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "mobile-s2",
      title: "TWS Earbuds",
      highlight: "ANC PRO",
      price: "$59",
      image: "/assets/headphone.png",
      buttonLink: "/products/tws-earbuds-anc-pro",
      bgClassName: "bg-gradient-to-br from-cyan-900 to-blue-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "mobile-b1",
      title: "Screen Protector",
      highlight: "TEMPERED GLASS",
      price: "$9",
      image: "/assets/playgo5.png",
      buttonText: "BUY NOW",
      buttonLink: "/products/tempered-glass-screen-protector",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "mobile-b2",
      title: "20000mAh Power Bank",
      highlight: "65W GaN",
      description: "Charges 3 devices simultaneously, foldable stand",
      image: "/assets/watch.png",
      buttonLink: "/products/20000mah-gan-power-bank",
      bgClassName: "bg-gradient-to-br from-blue-700 to-indigo-900",
      textTheme: "light",
    },
  ],
};

// ── Cycle ─────────────────────────────────────────────────────────────────────
const cycleCards: CardSet = {
  heroSlides: [{
    id: "cycle-hero",
    title: "Carbon Road Bike",
    subtitle: "Aero Race Series",
    description: "Shimano Ultegra Di2, hydraulic disc brakes, sub-7.2kg",
    image: "/assets/gopro.png",
    buttonText: "RIDE NOW",
    buttonLink: "/products/carbon-road-bike-aero",
    bgClassName: "bg-gradient-to-br from-lime-500 to-green-800",
    textTheme: "light",
  }],
  sideCards: [
    {
      id: "cycle-s1",
      eyebrow: "COMMUTER",
      title: "Electric City Bike",
      highlight: "350W MOTOR",
      image: "/assets/watch.png",
      buttonText: "TEST RIDE",
      buttonLink: "/products/electric-city-bike-350w",
      bgClassName: "bg-gradient-to-br from-lime-50 to-green-100",
      textTheme: "dark",
    },
    {
      id: "cycle-s2",
      title: "Smart Bike Helmet",
      highlight: "LED + BT",
      price: "$89",
      image: "/assets/headphone.png",
      buttonLink: "/products/smart-bike-helmet-led",
      bgClassName: "bg-gradient-to-br from-green-800 to-green-950",
      textTheme: "light",
    },
  ],
  bottomCards: [
    {
      id: "cycle-b1",
      title: "Cycling Gloves",
      highlight: "GEL PAD",
      price: "$22",
      image: "/assets/keyboard.png",
      buttonText: "BUY NOW",
      buttonLink: "/products/cycling-gloves-gel-pad",
      bgClassName: "bg-white",
      textTheme: "dark",
    },
    {
      id: "cycle-b2",
      eyebrow: "NAVIGATION",
      title: "Bike GPS Computer",
      price: "$149",
      image: "/assets/playgo5.png",
      buttonText: "VIEW SPECS",
      buttonLink: "/products/bike-gps-computer",
      bgClassName: "bg-gradient-to-br from-lime-700 to-green-900",
      textTheme: "light",
    },
  ],
};

/** Fallback categories — your 8 real store categories. */
export const FALLBACK_CATEGORIES: BannerCategory[] = [
  { id: "cat-beauty", label: "Beauty", href: "/products?category=Beauty", ...beautyCards },
  { id: "cat-books", label: "Books", href: "/products?category=Books", ...booksCards },
  { id: "cat-electronics", label: "Electronics", href: "/products?category=Electronics", ...electronicsCards },
  { id: "cat-fashion", label: "Fashion", href: "/products?category=Fashion", ...fashionCards },
  { id: "cat-home-kitchen", label: "Home & Kitchen", href: "/products?category=Home+%26+Kitchen", ...homeKitchenCards },
  { id: "cat-mobile", label: "Mobile", href: "/products?category=Mobile", ...mobileCards },
  { id: "cat-sports", label: "Sports", href: "/products?category=Sports", ...sportsCards },
  { id: "cat-cycle", label: "Cycle", href: "/products?category=Cycle", ...cycleCards },
];

export const defaultBannerData: BannerSectionData = {
  saleLabel: "SALE 40% OFF",
  categories: FALLBACK_CATEGORIES,
  heroSlides: beautyCards.heroSlides,
  sideCards: beautyCards.sideCards,
  bottomCards: beautyCards.bottomCards,
};
