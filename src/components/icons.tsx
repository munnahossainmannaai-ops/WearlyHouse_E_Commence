import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => {
  const { size = 18, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
};

export const IconLogo = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M12 2 21 7v10l-9 5-9-5V7z" stroke="#2de2ff" />
    <path d="M8.5 15.5v-7l7 7v-7" stroke="#a06bff" />
  </svg>
);

export const IconCart = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 4h2.2l2 11.2a1.6 1.6 0 0 0 1.6 1.3h7.8a1.6 1.6 0 0 0 1.6-1.2L20 8H6" />
    <circle cx="9.6" cy="20.2" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="16.8" cy="20.2" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconHeart = (p: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={p.filled ? "currentColor" : "none"}>
    <path d="M12 20.3S4 15.1 4 9.7C4 6.9 6.1 5 8.6 5c1.5 0 2.8.8 3.4 1.9C12.6 5.8 14 5 15.4 5 17.9 5 20 6.9 20 9.7c0 5.4-8 10.6-8 10.6z" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15.2 15.2 4.3 4.3" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 19.6c1.3-3.1 4-4.7 7.2-4.7s5.9 1.6 7.2 4.7" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconStar = (p: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={p.filled ? "currentColor" : "none"} strokeWidth={1.4}>
    <path d="m12 3.6 2.5 5.2 5.7.7-4.2 4 1.1 5.6L12 16.4l-5.1 2.7 1.1-5.6-4.2-4 5.7-.7z" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13z" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8 20 6v6c0 5-3.4 8.4-8 9.2C7.4 20.4 4 17 4 12V6z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </svg>
);

export const IconOrbit = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.4" />
    <path d="M20.3 8.5c1.6 3 .5 6.9-2.6 8.9-3.4 2.2-7.9 1.4-10.3-1.7" />
    <path d="M3.7 15.5c-1.6-3-.5-6.9 2.6-8.9 3.4-2.2 7.9-1.4 10.3 1.7" />
    <circle cx="19.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const IconGrid = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconRows = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4.5" width="16" height="6" rx="1.5" />
    <rect x="4" y="13.5" width="16" height="6" rx="1.5" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15M9.5 6V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3V6M7 6.5l.8 12.2a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 6.5M10.2 10.5v6M13.8 10.5v6" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17z" />
    <path d="m14.5 7 3 3" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconBox = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2z" />
    <path d="M4 7.2 12 11.5l8-4.3M12 11.5V21" />
  </svg>
);

export const IconCard = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="M3 10h18M6.5 14.5h4" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.5s-6.8-5.4-6.8-10.7A6.8 6.8 0 0 1 12 4a6.8 6.8 0 0 1 6.8 6.8C18.8 16.1 12 21.5 12 21.5z" />
    <circle cx="12" cy="10.8" r="2.3" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6h11v10h-11zM13.5 9h4.2l2.8 3.2V16h-3" />
    <circle cx="7" cy="17.5" r="1.7" />
    <circle cx="16.5" cy="17.5" r="1.7" />
  </svg>
);

export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4v16h16" />
    <path d="m7.5 14 3.5-4 3 2.5 4-6" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19.5c1-2.8 3-4.2 5.5-4.2s4.5 1.4 5.5 4.2" />
    <path d="M15.5 5.9a3 3 0 0 1 0 5.2M17.5 15.6c1.5.6 2.5 1.9 3 3.9" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 22 20H2z" />
    <path d="M12 9.5v4.5" />
    <circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7M10.5 12H21M17 8l4 4-4 4" />
  </svg>
);

export const IconZoom = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15.2 15.2 4.3 4.3M8.2 10.5h4.6M10.5 8.2v4.6" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

export const IconGoogle = (p: P) => (
  <svg {...base(p)} stroke="none" fill="currentColor">
    <path d="M21.35 11.1H12v3.2h5.4c-.5 2.5-2.6 3.9-5.4 3.9a6 6 0 1 1 0-12c1.5 0 2.8.5 3.8 1.4l2.4-2.4A9.6 9.6 0 1 0 12 21.6c5.3 0 9.5-3.7 9.5-9.2 0-.4-.1-.9-.15-1.3z" />
  </svg>
);

export const IconStripe = (p: P) => (
  <svg {...base(p)} stroke="none" fill="currentColor">
    <path d="M13.4 5.5c-1.3 0-2.2.7-2.2 1.6 0 1.2 1.4 1.6 2.9 2.1 2 .7 4.4 1.5 4.4 4.5 0 2.8-2.2 4.5-5.3 4.5-1.5 0-3-.3-4.2-1l.6-3.1c1 .6 2.3 1 3.5 1 1.2 0 2.4-.4 2.4-1.5 0-1.3-1.6-1.8-3.2-2.3-1.9-.6-3.9-1.4-3.9-4.3 0-2.7 2.1-4.3 5-4.3 1.3 0 2.6.3 3.6.8l-.6 3c-.9-.5-2-.8-3-.8z" />
  </svg>
);
