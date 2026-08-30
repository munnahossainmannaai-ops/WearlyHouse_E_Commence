import type { Category, Product, Review } from "../lib/types";

const IMG = {
  headphones: "https://image.qwenlm.ai/generated-images/d6b463ad-1a3e-434b-8770-f7666e307f36/_result.png",
  visor: "https://image.qwenlm.ai/generated-images/28d22776-7101-4fe1-99f0-cf83958c187d/_result.png",
  drone: "https://image.qwenlm.ai/generated-images/0c492e84-604c-42bd-8ef5-65274c4fa75f/_result.png",
  keyboard: "https://image.qwenlm.ai/generated-images/ae4a9bbe-3390-450d-b9d8-fe9b64bccb49/_result.png",
  sneaker: "https://image.qwenlm.ai/generated-images/70c5adfd-e4fe-4c75-93a2-9cc1e7e9c7c9/_result.png",
  wrist: "https://image.qwenlm.ai/generated-images/da5db6b4-9c33-422f-b96e-03647f86de49/_result.png",
  orb: "https://image.qwenlm.ai/generated-images/d9e009e8-4ef2-4689-b3c8-71ae0ec62a91/_result.png",
  buds: "https://image.qwenlm.ai/generated-images/40d67efe-c880-4bd6-873c-01ca751dac94/_result.png",
  vr: "https://image.qwenlm.ai/generated-images/bc4a1d58-f6bc-4cf1-ad8a-c68a5195972a/_result.png",
  glove: "https://image.qwenlm.ai/generated-images/eaca1e5a-1062-4b11-acab-77885546cbc2/_result.png",
};

export const PRODUCT_IMAGES = Object.values(IMG);

export const CATEGORIES: Category[] = [
  { id: "audio", name: "Audio", blurb: "Sound engineered past the edge of hearing." },
  { id: "wearables", name: "Wearables", blurb: "Interfaces that live on your body." },
  { id: "immersive", name: "Immersive", blurb: "Realities layered over reality." },
  { id: "robotics", name: "Robotics", blurb: "Autonomous machines, consumer grade." },
  { id: "peripherals", name: "Peripherals", blurb: "Contact points between you and the machine." },
  { id: "apparel", name: "Apparel", blurb: "Technical fabric with a pulse." },
];

const now = Date.now();
const day = 86_400_000;

export const PRODUCTS: Product[] = [
  {
    id: "p-halo-x1",
    slug: "halo-x1",
    name: "HALO X1 Levitation Headphones",
    tagline: "Magnetically suspended drivers. Zero resonance.",
    category: "audio",
    price: 549,
    compareAt: 649,
    stock: 14,
    rating: 4.9,
    ratingCount: 1284,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ion Cyan", hex: "#2de2ff" },
      { name: "Ultraviolet", hex: "#8b5cf6" },
    ],
    image: IMG.headphones,
    tags: ["Flagship", "Bestseller"],
    featured: true,
    description:
      "The HALO X1 suspends its 50mm graphene drivers in a magnetic field, eliminating housing resonance entirely. What remains is signal — rendered in a 360° spatial field that tracks your head at 1,000Hz. The charging base doubles as a levitation dock, so your headphones never actually touch a surface.",
    specs: [
      { label: "Driver", value: "50mm graphene, maglev suspension" },
      { label: "Spatial audio", value: "360° field, 1kHz head-tracking" },
      { label: "Battery", value: "42h playback · 5h from 10min dock" },
      { label: "Latency", value: "9ms over NovaLink wireless" },
      { label: "ANC depth", value: "-48dB adaptive" },
      { label: "Weight", value: "288g" },
    ],
    createdAt: now - 12 * day,
  },
  {
    id: "p-spectre-ar",
    slug: "spectre-ar",
    name: "SPECTRE AR Visor",
    tagline: "A 4K holographic layer over everything you see.",
    category: "wearables",
    price: 899,
    stock: 8,
    rating: 4.7,
    ratingCount: 642,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ghost Grey", hex: "#5a5a6e" },
    ],
    image: IMG.visor,
    tags: ["New"],
    featured: true,
    description:
      "SPECTRE projects a seamless 4K-per-eye holographic field through a 96g visor. Waypoints, telemetry, translations and full workspaces hang in the air, anchored to the real world by dual LiDAR. Twelve-hour battery, and it folds to the size of sunglasses.",
    specs: [
      { label: "Display", value: "4K micro-OLED per eye, 120Hz" },
      { label: "FOV", value: "118° diagonal" },
      { label: "Tracking", value: "Dual LiDAR + 6DoF inside-out" },
      { label: "Battery", value: "12h mixed use" },
      { label: "Weight", value: "96g" },
    ],
    createdAt: now - 5 * day,
  },
  {
    id: "p-wraith-drone",
    slug: "wraith-drone",
    name: "WRAITH Recon Drone",
    tagline: "38 minutes of silent, autonomous flight.",
    category: "robotics",
    price: 1299,
    compareAt: 1499,
    stock: 4,
    rating: 4.8,
    ratingCount: 388,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Signal Cyan", hex: "#2de2ff" },
    ],
    image: IMG.drone,
    tags: ["Limited"],
    featured: true,
    description:
      "WRAITH folds into a jacket pocket and unfolds into a 4K/120 aerial platform with obstacle mesh mapping and 38-minute endurance. Follow-me, orbit and waypoint missions run fully on-device — no cloud, no latency, no telemetry leaving the craft.",
    specs: [
      { label: "Camera", value: "1\" sensor, 4K/120, 3-axis gimbal" },
      { label: "Flight time", value: "38 min" },
      { label: "Range", value: "12km NovaLink" },
      { label: "Top speed", value: "21 m/s" },
      { label: "Weight", value: "249g — registration-free" },
    ],
    createdAt: now - 30 * day,
  },
  {
    id: "p-pulse-75",
    slug: "pulse-75",
    name: "PULSE 75 Mech Keyboard",
    tagline: "Hall-effect keys with per-key light choreography.",
    category: "peripherals",
    price: 229,
    stock: 32,
    rating: 4.6,
    ratingCount: 2051,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Reactor White", hex: "#d8d8e8" },
      { name: "Ion Cyan", hex: "#2de2ff" },
    ],
    image: IMG.keyboard,
    tags: ["Bestseller"],
    description:
      "PULSE 75 reads every keystroke magnetically — adjustable actuation from 0.1mm, rapid-trigger for double-taps, and an 8kHz poll rate. The CNC aluminium chassis is gasket-mounted over three damping layers, so the only sound is the one you tune.",
    specs: [
      { label: "Switches", value: "Hall-effect, 0.1–4.0mm actuation" },
      { label: "Poll rate", value: "8000Hz wired / 4000Hz wireless" },
      { label: "Layout", value: "75% with rotary encoder" },
      { label: "Keycaps", value: "Double-shot PBT" },
      { label: "Battery", value: "200h (RGB off)" },
    ],
    createdAt: now - 60 * day,
  },
  {
    id: "p-vector-hi",
    slug: "vector-hi",
    name: "VECTOR HI Sneaker",
    tagline: "Reactive foam that returns 87% of your energy.",
    category: "apparel",
    price: 349,
    stock: 21,
    rating: 4.5,
    ratingCount: 934,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ultraviolet", hex: "#8b5cf6" },
      { name: "Signal Cyan", hex: "#2de2ff" },
    ],
    image: IMG.sneaker,
    tags: ["New", "Bestseller"],
    featured: true,
    description:
      "VECTOR HI pairs a carbon weave upper with a photo-reactive midsole that stiffens under load and softens on recovery. Embedded gait sensors tune the foam cell-by-cell through the companion app — or let it run fully autonomous.",
    specs: [
      { label: "Upper", value: "Carbon weave, hydrophobic" },
      { label: "Midsole", value: "Adaptive photo-reactive foam" },
      { label: "Energy return", value: "87%" },
      { label: "Sensors", value: "6-axis gait telemetry" },
      { label: "Battery", value: "30 days per charge" },
    ],
    createdAt: now - 8 * day,
  },
  {
    id: "p-echo-deck",
    slug: "echo-deck",
    name: "ECHO Wrist Deck",
    tagline: "A workstation that straps to your arm.",
    category: "wearables",
    price: 429,
    compareAt: 499,
    stock: 3,
    rating: 4.4,
    ratingCount: 511,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ghost Grey", hex: "#5a5a6e" },
    ],
    image: IMG.wrist,
    tags: ["Limited"],
    description:
      "ECHO is a full compute deck on your wrist: holographic display, biometric array, and a 3-day cell. It projects a 14-inch workspace into the air and collapses every notification into a single ambient ring — nothing glows unless it matters.",
    specs: [
      { label: "Display", value: "1.9\" AMOLED + holo projector" },
      { label: "Biometrics", value: "HR, SpO2, ECG, skin temp" },
      { label: "Battery", value: "72h typical" },
      { label: "Rating", value: "10ATM / IP69" },
      { label: "Storage", value: "128GB on-device" },
    ],
    createdAt: now - 21 * day,
  },
  {
    id: "p-nebula-orb",
    slug: "nebula-orb",
    name: "NEBULA Orb Speaker",
    tagline: "Plasma-tweeter omnidirectional sound, in orbit.",
    category: "audio",
    price: 379,
    stock: 17,
    rating: 4.8,
    ratingCount: 763,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ultraviolet", hex: "#8b5cf6" },
    ],
    image: IMG.orb,
    tags: ["New"],
    featured: true,
    description:
      "The NEBULA orb levitates over its base and radiates true 360° audio from a plasma-coil tweeter — no sweet spot, no cabinet coloration. Room calibration runs continuously, reshaping the wavefront around furniture and people in real time.",
    specs: [
      { label: "Tweeter", value: "Plasma-coil, 360° radiation" },
      { label: "Woofer", value: "Dual opposed 90mm" },
      { label: "Output", value: "110W RMS" },
      { label: "Calibration", value: "Continuous room-mesh" },
      { label: "Levitation gap", value: "12mm magnetic" },
    ],
    createdAt: now - 3 * day,
  },
  {
    id: "p-aero-pods",
    slug: "aero-pods",
    name: "AERO Pods",
    tagline: "6g per bud. 40dB of silence on demand.",
    category: "audio",
    price: 199,
    compareAt: 249,
    stock: 45,
    rating: 4.3,
    ratingCount: 3412,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Reactor White", hex: "#d8d8e8" },
      { name: "Signal Cyan", hex: "#2de2ff" },
    ],
    image: IMG.buds,
    tags: ["Bestseller"],
    description:
      "AERO Pods weigh six grams and disappear in the ear, with -40dB hybrid ANC and a spatial engine borrowed from the HALO X1. The case wirelessly tops up any Qi surface and finds itself via ultra-wideband when you inevitably leave it somewhere.",
    specs: [
      { label: "Weight", value: "6g per bud" },
      { label: "ANC", value: "-40dB hybrid" },
      { label: "Battery", value: "9h + 32h case" },
      { label: "Codec", value: "LDAC · aptX Lossless" },
      { label: "Rating", value: "IP57" },
    ],
    createdAt: now - 90 * day,
  },
  {
    id: "p-mirage-vr",
    slug: "mirage-vr",
    name: "MIRAGE VR Headset",
    tagline: "8K per eye. The screen door is gone for good.",
    category: "immersive",
    price: 749,
    stock: 11,
    rating: 4.7,
    ratingCount: 1129,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ghost Grey", hex: "#5a5a6e" },
    ],
    image: IMG.vr,
    tags: ["Flagship"],
    featured: true,
    description:
      "MIRAGE runs dual 8K micro-OLED panels at 144Hz with pancake optics so sharp you can read body text inside a simulation. Eye-tracked foveal rendering cuts GPU load by 60%, and the 390g chassis balances like a pair of goggles, not a helmet.",
    specs: [
      { label: "Panels", value: "Dual 8K micro-OLED, 144Hz" },
      { label: "Optics", value: "Pancake, 105° FOV" },
      { label: "Tracking", value: "Eye + hand + 6DoF" },
      { label: "Foveal gain", value: "-60% GPU load" },
      { label: "Weight", value: "390g balanced" },
    ],
    createdAt: now - 15 * day,
  },
  {
    id: "p-talon-glove",
    slug: "talon-glove",
    name: "TALON Haptic Glove",
    tagline: "Touch what isn't there. Feel every gram of it.",
    category: "wearables",
    price: 289,
    stock: 6,
    rating: 4.6,
    ratingCount: 447,
    colors: [
      { name: "Void Black", hex: "#17171f" },
      { name: "Ion Cyan", hex: "#2de2ff" },
    ],
    image: IMG.glove,
    tags: ["New", "Limited"],
    description:
      "TALON's micro-actuator array reproduces texture, resistance and recoil across all five fingers at 120Hz. Paired with MIRAGE or SPECTRE, virtual objects stop being visuals and start being things. Machine-washable, eight-hour cell.",
    specs: [
      { label: "Actuators", value: "128 per glove, 120Hz" },
      { label: "Feedback", value: "Texture, force, recoil" },
      { label: "Latency", value: "<4ms NovaLink" },
      { label: "Battery", value: "8h continuous" },
      { label: "Care", value: "Machine washable" },
    ],
    createdAt: now - 2 * day,
  },
];

const REVIEW_POOL: [string, number, string, string][] = [
  ["Kael Voss", 5, "Unreal build quality", "Shipping was fast, packaging felt like unboxing spacecraft hardware. Performance is exactly as specced — maybe better."],
  ["Iris Chen", 5, "Worth every credit", "I compared three competitors before buying. Nothing else comes close at this tier. The finish is flawless."],
  ["Dmitri Sokolov", 4, "Excellent, minor quibble", "9/10 experience. Docking software took a minute to set up, but support walked me through it in one message."],
  ["Amara Okafor", 5, "My third Nova order", "The ecosystem just works. Everything paired instantly with my other gear. Build quality is consistently absurd."],
  ["Juno Reyes", 4, "Impressed", "Exceeded expectations for the price band. Battery life matches the claims exactly, which almost never happens."],
  ["Theo Lindqvist", 5, "Future, delivered", "Feels like it fell off a ship from 2040. Zero regrets, already eyeing the rest of the lineup."],
  ["Sable Moreau", 5, "Reference tier", "I review tech for a living. This is the unit I'll benchmark everything else against this year."],
  ["Ryn Takahashi", 4, "Great daily driver", "Three weeks in, zero issues. The little details — haptics, sounds, packaging — all feel considered."],
];

export const seedReviews = (): Review[] => {
  const out: Review[] = [];
  PRODUCTS.forEach((p, pi) => {
    const count = 2 + (pi % 3);
    for (let i = 0; i < count; i++) {
      const [name, rating, title, body] = REVIEW_POOL[(pi * 3 + i * 2) % REVIEW_POOL.length];
      out.push({
        id: `r-${p.id}-${i}`,
        productId: p.id,
        userName: name,
        rating,
        title,
        body,
        date: now - (pi + 2) * day - i * 5 * day,
      });
    }
  });
  return out;
};

export const TESTIMONIALS = [
  {
    quote: "Ordered a WRAITH on Tuesday night, it was hovering over my lawn Thursday morning. The tracking feed was weirdly satisfying to watch.",
    name: "Mara Janssen",
    role: "Drone racer · Rotterdam",
    rating: 5,
  },
  {
    quote: "The HALO X1 ruined every other headphone for me. Levitation docking sounds like a gimmick until you realize you never put them down wrong again.",
    name: "Dev Anand",
    role: "Audio engineer · Mumbai",
    rating: 5,
  },
  {
    quote: "Support replaced my TALON glove in 48 hours after I tore it on a rig. No forms, no friction — one message, done. That's why I keep coming back.",
    name: "Faye Castellano",
    role: "VR developer · São Paulo",
    rating: 5,
  },
  {
    quote: "Every order arrives in packaging that feels like it was engineered, not packed. The products live up to it. Nova is the only store I trust with four-figure gear.",
    name: "Oskar Blom",
    role: "Systems architect · Oslo",
    rating: 5,
  },
];

export const SHIPPING_METHODS = [
  { id: "orbital", name: "Orbital Express", eta: "Next-day drop", cost: 24, note: "Priority atmospheric re-entry, signature required" },
  { id: "glide", name: "Glide Standard", eta: "2–4 days", cost: 9, note: "Tracked ground + air hybrid route" },
  { id: "freight", name: "Freight Saver", eta: "5–8 days", cost: 0, note: "Free over $150 · carbon-neutral" },
];

export const PROMO_CODES: Record<string, number> = {
  NEON10: 0.1,
  NOVA25: 0.25,
};
