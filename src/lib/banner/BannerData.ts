export type BannerCategory = {
    id: string;
    label: string;
    href: string;
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
    categories: BannerCategory[];
    heroSlides: HeroSlide[];
    /** Two cards stacked in the right-hand rail. */
    sideCards: PromoCard[];
    /** Two cards under the hero carousel. */
    bottomCards: PromoCard[];
};

export const defaultBannerData: BannerSectionData = {
    saleLabel: "SALE 40% OFF",
    categories: [
        { id: "laptops", label: "Laptops", href: "/category/laptops" },
        { id: "pc-computers", label: "PC & Computers", href: "/category/pc-computers" },
        { id: "cell-phones", label: "Cell Phones", href: "/category/cell-phones" },
        { id: "tablets", label: "Tablets", href: "/category/tablets" },
        { id: "gaming-vr", label: "Gaming & VR", href: "/category/gaming-vr" },
        { id: "networking", label: "Networking", href: "/category/networking" },
        { id: "cameras", label: "Cameras", href: "/category/cameras" },
        { id: "sounds", label: "Sounds", href: "/category/sounds" },
        { id: "office", label: "Office", href: "/category/office" },
        { id: "storage-usb", label: "Storage, USB", href: "/category/storage-usb" },
        { id: "accessories", label: "Accessories", href: "/category/accessories" },
        { id: "clearance", label: "Clearance", href: "/category/clearance" },
    ],
    heroSlides: [
        {
            id: "slide-1",
            title: "Noise Cancelling Headphone",
            subtitle: "Boso Over-Ear Headphone",
            description: "Wifi, Voice Assistant, Low Latency Game Mode",
            image: "/assets/headphone.png",
            buttonText: "BUY NOW",
            buttonLink: "/products/noise-cancelling-headphone",
            bgClassName: "bg-gradient-to-br from-gray-400 to-gray-500",
            textTheme: "light",
        },
    ],
    sideCards: [
        {
            id: "side-1",
            eyebrow: "XOMIA",
            title: "Sport Water Resistance Watch",
            image: "/assets/watch.png",
            buttonText: "SHOP NOW",
            buttonLink: "/products/sport-water-resistance-watch",
            bgClassName: "bg-white",
            textTheme: "dark",
        },
        {
            id: "side-2",
            title: "OKODO HERO 11+",
            highlight: "BLACK",
            price: "$169",
            image: "/assets/gopro.png",
            buttonLink: "/products/okodo-hero-11-plus-black",
            bgClassName: "bg-gray-900",
            textTheme: "light",
        },
    ],
    bottomCards: [
        {
            id: "bottom-1",
            title: "Sono Playgo 5",
            price: "$569",
            image: "/assets/playgo5.png",
            buttonText: "DISCOVER NOW",
            buttonLink: "/products/sono-playgo-5",
            bgClassName: "bg-white",
            textTheme: "dark",
        },
        {
            id: "bottom-2",
            title: "Logitek Bluetooth",
            highlight: "Keyboard",
            description: "Best for all device",
            image: "/assets/keyboard.png",
            buttonLink: "/products/logitek-bluetooth-keyboard",
            bgClassName: "bg-gray-700",
            textTheme: "light",
        },
    ],
};