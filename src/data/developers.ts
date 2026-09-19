export type DeveloperCategory = "FRONTEND" | "BACKEND" | "FULLSTACK" | "AI_ML";

export interface Developer {
  id: string;
  name: string;
  role: string;
  category: DeveloperCategory;
  image: string;
  linkedin: string;
  shortBio: string;
  skills: string[];
  focusArea: string;
}

export interface DeveloperConnection {
  from: string;
  to: string;
  type: "collaboration" | "api-bridge" | "fullstack-bridge" | "ai-integration";
  label: string;
}

export const DEVELOPERS: Developer[] = [
  {
    id: "member-1",
    name: "MD Moynul Islam",
    role: "MERN Stack & AI/ML Developer",
    category: "AI_ML",
    image: "/developers/member-1.jpg",
    linkedin: "https://www.linkedin.com/in/md-moynul/",
    focusArea: "AI Copilots & ML Engineering",
    shortBio:
      "Specializes in intelligent commerce capabilities, RAG pipelines, LLM agent orchestration, and multi-model decision engines.",
    skills: ["Gemini & Claude APIs", "RAG Systems", "Python", "Node.js", "AI Agent Tooling", "Prompt Engineering"],
  },
  {
    id: "member-2",
    name: "Nusrat Jahan",
    role: "MERN Stack / Frontend Developer",
    category: "FRONTEND",
    image: "/developers/member-2.jpg",
    linkedin: "https://www.linkedin.com/in/nusratjahan77/",
    focusArea: "Component Systems & Modern UX",
    shortBio:
      "Crafts intuitive customer journeys, responsive multi-vendor interfaces, accessible component patterns, and dynamic UI interactions.",
    skills: ["React 19", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "HeroUI"],
  },
  {
    id: "member-3",
    name: "Aminul Islam",
    role: "Backend Developer",
    category: "BACKEND",
    image: "/developers/member-3.jpg",
    linkedin: "https://www.linkedin.com/in/samiislam09/",
    focusArea: "Core APIs & Database Architecture",
    shortBio:
      "Engineers robust micro-modular REST services, multi-tenant database schemas, data aggregation pipelines, and high-throughput endpoints.",
    skills: ["Node.js", "Express", "TypeScript", "MongoDB", "Mongoose", "Aggregation Pipelines"],
  },
  {
    id: "member-4",
    name: "Hasina Akter",
    role: "Frontend Developer",
    category: "FRONTEND",
    image: "/developers/member-4.jpg",
    linkedin: "https://www.linkedin.com/in/hasina-akter-dev/",
    focusArea: "Commerce Dashboards & Views",
    shortBio:
      "Builds rich marketplace catalog interfaces, seller dashboard utilities, state management, and seamless cross-device layouts.",
    skills: ["React", "Next.js App Router", "TypeScript", "Tailwind CSS", "Responsive Design", "Client Caching"],
  },
  {
    id: "member-5",
    name: "Abu Bakkar Siddique",
    role: "Backend Developer",
    category: "BACKEND",
    image: "/developers/member-5.jpg",
    linkedin: "https://www.linkedin.com/in/ab-bakkar71/",
    focusArea: "Authentication, Security & Logistics",
    shortBio:
      "Architects session security, role-based access control, Bangladesh logistics courier algorithms, and order state machines.",
    skills: ["Node.js", "Express", "Better-Auth", "Security Intelligence", "Courier Systems", "REST API Design"],
  },
  {
    id: "member-6",
    name: "Md. Farhadul Islam",
    role: "Full Stack Developer & Software Engineer",
    category: "FULLSTACK",
    image: "/developers/member-6.jpg",
    linkedin: "https://www.linkedin.com/in/farhadmu46/",
    focusArea: "System Architecture & End-to-End Integration",
    shortBio:
      "Bridges frontend experiences with backend infrastructure, real-time WebSocket communication, payment gateways, and system architecture.",
    skills: ["Full-Stack Architecture", "Next.js", "Node.js", "TypeScript", "Socket.IO", "SSLCommerz & Stripe"],
  },
];

export const DEVELOPER_CONNECTIONS: DeveloperConnection[] = [
  // Frontend Collaboration (Hasina ↔ Nusrat)
  {
    from: "member-4",
    to: "member-2",
    type: "collaboration",
    label: "Frontend Systems Sync",
  },
  // Backend Collaboration (Aminul ↔ Abu Bakkar)
  {
    from: "member-3",
    to: "member-5",
    type: "collaboration",
    label: "Backend Cluster Architecture",
  },
  // Full-Stack Bridge to Frontend (Farhadul ↔ Nusrat, Farhadul ↔ Hasina)
  {
    from: "member-6",
    to: "member-2",
    type: "fullstack-bridge",
    label: "Client-Server Contract",
  },
  {
    from: "member-6",
    to: "member-4",
    type: "fullstack-bridge",
    label: "UI State Synchronization",
  },
  // Full-Stack Bridge to Backend (Farhadul ↔ Aminul, Farhadul ↔ Abu Bakkar)
  {
    from: "member-6",
    to: "member-3",
    type: "fullstack-bridge",
    label: "Database & API Pipeline",
  },
  {
    from: "member-6",
    to: "member-5",
    type: "fullstack-bridge",
    label: "Auth & Logistics Gateway",
  },
  // AI/ML Intelligence Integration (Moynul ↔ Farhadul, Moynul ↔ Aminul, Moynul ↔ Nusrat)
  {
    from: "member-1",
    to: "member-6",
    type: "ai-integration",
    label: "AI Core & Full-Stack Mesh",
  },
  {
    from: "member-1",
    to: "member-3",
    type: "ai-integration",
    label: "Semantic Data Aggregation",
  },
  {
    from: "member-1",
    to: "member-2",
    type: "ai-integration",
    label: "Copilot Streaming UI",
  },
];

export const CATEGORY_METADATA = {
  ALL: {
    label: "All Engineering",
    count: 6,
    color: "from-primary to-accent",
    borderColor: "border-primary/40",
  },
  FRONTEND: {
    label: "Frontend Developers",
    count: 2,
    color: "from-pink-500 to-rose-500",
    textColor: "text-pink-500 dark:text-pink-400",
    badgeBg: "bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/20",
    borderColor: "border-pink-500/40",
    ringColor: "ring-pink-500/30",
    glow: "rgba(236, 72, 153, 0.35)",
  },
  BACKEND: {
    label: "Backend Developers",
    count: 2,
    color: "from-cyan-500 to-blue-500",
    textColor: "text-cyan-500 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20",
    borderColor: "border-cyan-500/40",
    ringColor: "ring-cyan-500/30",
    glow: "rgba(6, 182, 212, 0.35)",
  },
  FULLSTACK: {
    label: "Full-Stack Developer",
    count: 1,
    color: "from-purple-500 to-indigo-500",
    textColor: "text-purple-500 dark:text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
    borderColor: "border-purple-500/40",
    ringColor: "ring-purple-500/30",
    glow: "rgba(168, 85, 247, 0.35)",
  },
  AI_ML: {
    label: "AI/ML Developer",
    count: 1,
    color: "from-amber-500 to-emerald-500",
    textColor: "text-amber-500 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20",
    borderColor: "border-amber-500/40",
    ringColor: "ring-amber-500/30",
    glow: "rgba(245, 158, 11, 0.35)",
  },
} as const;
