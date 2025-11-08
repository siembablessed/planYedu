import { TaskPriority } from "@/types";
import { EventType } from "./eventTypes";

export interface SmartTaskTemplate {
  title: string;
  description: string;
  price?: number;
  priority: TaskPriority;
  category: string;
  icon: string;
  eventTypes: EventType[]; // Which event types this template applies to
}

// Wedding templates
const weddingTemplates: SmartTaskTemplate[] = [
  {
    title: "Book Wedding Venue",
    description: "Research and book ceremony and reception venue. Consider capacity, location, and availability.",
    price: 5000,
    priority: "high",
    category: "venue",
    icon: "building",
    eventTypes: ["wedding"],
  },
  {
    title: "Hire Photographer",
    description: "Find and book wedding photographer. Review portfolios, packages, and pricing.",
    price: 3000,
    priority: "high",
    category: "photography",
    icon: "camera",
    eventTypes: ["wedding"],
  },
  {
    title: "Hire Videographer",
    description: "Book wedding videographer for ceremony and reception coverage.",
    price: 2500,
    priority: "high",
    category: "photography",
    icon: "video",
    eventTypes: ["wedding"],
  },
  {
    title: "Book Catering Service",
    description: "Select and book catering service for reception. Menu tasting and finalize choices.",
    price: 4000,
    priority: "high",
    category: "catering",
    icon: "utensils",
    eventTypes: ["wedding"],
  },
  {
    title: "Order Wedding Cake",
    description: "Choose and order wedding cake. Schedule tastings and finalize design.",
    price: 500,
    priority: "medium",
    category: "catering",
    icon: "cake",
    eventTypes: ["wedding"],
  },
  {
    title: "Hire Makeup Artist",
    description: "Book professional makeup artist for bride and bridal party.",
    price: 800,
    priority: "high",
    category: "makeup",
    icon: "sparkles",
    eventTypes: ["wedding"],
  },
  {
    title: "Book Hair Stylist",
    description: "Hire hairstylist for bride and bridal party hair styling.",
    price: 600,
    priority: "high",
    category: "makeup",
    icon: "scissors",
    eventTypes: ["wedding"],
  },
  {
    title: "Book Florist",
    description: "Select florist for bouquets, centerpieces, and ceremony decorations.",
    price: 2000,
    priority: "medium",
    category: "flowers",
    icon: "flower",
    eventTypes: ["wedding"],
  },
  {
    title: "Order Wedding Decorations",
    description: "Purchase or rent wedding decorations, centerpieces, and ceremony decor.",
    price: 1500,
    priority: "medium",
    category: "flowers",
    icon: "sparkles",
    eventTypes: ["wedding"],
  },
  {
    title: "Hire DJ",
    description: "Book DJ or live music for reception entertainment.",
    price: 1200,
    priority: "medium",
    category: "music",
    icon: "music",
    eventTypes: ["wedding"],
  },
  {
    title: "Book Live Band",
    description: "Hire live band for reception entertainment.",
    price: 3000,
    priority: "medium",
    category: "music",
    icon: "music",
    eventTypes: ["wedding"],
  },
  {
    title: "Buy Wedding Dress",
    description: "Shop for and purchase wedding dress. Schedule fittings and alterations.",
    price: 2000,
    priority: "high",
    category: "attire",
    icon: "shirt",
    eventTypes: ["wedding"],
  },
  {
    title: "Buy Groom's Suit",
    description: "Purchase or rent groom's suit and accessories.",
    price: 800,
    priority: "high",
    category: "attire",
    icon: "shirt",
    eventTypes: ["wedding"],
  },
  {
    title: "Order Bridesmaid Dresses",
    description: "Select and order bridesmaid dresses. Coordinate sizes and colors.",
    price: 1200,
    priority: "medium",
    category: "attire",
    icon: "shirt",
    eventTypes: ["wedding"],
  },
  {
    title: "Book Limousine",
    description: "Reserve limousine or transportation for wedding day.",
    price: 600,
    priority: "medium",
    category: "transportation",
    icon: "car",
    eventTypes: ["wedding"],
  },
  {
    title: "Send Wedding Invitations",
    description: "Design, print, and send wedding invitations to guests.",
    price: 300,
    priority: "high",
    category: "venue",
    icon: "mail",
    eventTypes: ["wedding"],
  },
  {
    title: "Book Officiant",
    description: "Hire wedding officiant for ceremony.",
    price: 400,
    priority: "high",
    category: "venue",
    icon: "user",
    eventTypes: ["wedding"],
  },
  {
    title: "Order Wedding Rings",
    description: "Select and purchase wedding bands for bride and groom.",
    price: 1500,
    priority: "high",
    category: "attire",
    icon: "ring",
    eventTypes: ["wedding"],
  },
];

// Birthday templates
const birthdayTemplates: SmartTaskTemplate[] = [
  {
    title: "Book Birthday Venue",
    description: "Find and book a venue for the birthday celebration.",
    price: 500,
    priority: "high",
    category: "venue",
    icon: "building",
    eventTypes: ["birthday"],
  },
  {
    title: "Order Birthday Cake",
    description: "Order a custom birthday cake with design preferences.",
    price: 150,
    priority: "high",
    category: "catering",
    icon: "cake",
    eventTypes: ["birthday"],
  },
  {
    title: "Hire Photographer",
    description: "Book a photographer to capture birthday moments.",
    price: 400,
    priority: "medium",
    category: "photography",
    icon: "camera",
    eventTypes: ["birthday"],
  },
  {
    title: "Book Entertainment",
    description: "Hire DJ, magician, or other entertainment for the party.",
    price: 300,
    priority: "medium",
    category: "music",
    icon: "music",
    eventTypes: ["birthday"],
  },
  {
    title: "Send Invitations",
    description: "Design and send birthday party invitations.",
    price: 50,
    priority: "high",
    category: "venue",
    icon: "mail",
    eventTypes: ["birthday"],
  },
  {
    title: "Buy Decorations",
    description: "Purchase party decorations, balloons, and party supplies.",
    price: 200,
    priority: "medium",
    category: "flowers",
    icon: "sparkles",
    eventTypes: ["birthday"],
  },
];

// Corporate templates
const corporateTemplates: SmartTaskTemplate[] = [
  {
    title: "Book Conference Venue",
    description: "Reserve meeting space or conference hall.",
    price: 2000,
    priority: "high",
    category: "venue",
    icon: "building",
    eventTypes: ["corporate"],
  },
  {
    title: "Arrange Catering",
    description: "Organize catering for corporate event attendees.",
    price: 1500,
    priority: "high",
    category: "catering",
    icon: "utensils",
    eventTypes: ["corporate"],
  },
  {
    title: "Book Audio/Visual Equipment",
    description: "Rent AV equipment for presentations.",
    price: 800,
    priority: "high",
    category: "music",
    icon: "video",
    eventTypes: ["corporate"],
  },
  {
    title: "Send Event Invitations",
    description: "Send invitations to corporate event attendees.",
    price: 100,
    priority: "high",
    category: "venue",
    icon: "mail",
    eventTypes: ["corporate"],
  },
];

// Anniversary templates
const anniversaryTemplates: SmartTaskTemplate[] = [
  {
    title: "Book Anniversary Venue",
    description: "Reserve a special venue for anniversary celebration.",
    price: 800,
    priority: "high",
    category: "venue",
    icon: "building",
    eventTypes: ["anniversary"],
  },
  {
    title: "Order Anniversary Cake",
    description: "Order a special anniversary cake.",
    price: 100,
    priority: "medium",
    category: "catering",
    icon: "cake",
    eventTypes: ["anniversary"],
  },
  {
    title: "Book Photographer",
    description: "Hire photographer for anniversary photos.",
    price: 500,
    priority: "medium",
    category: "photography",
    icon: "camera",
    eventTypes: ["anniversary"],
  },
  {
    title: "Book Restaurant",
    description: "Make restaurant reservations for anniversary dinner.",
    price: 300,
    priority: "high",
    category: "catering",
    icon: "utensils",
    eventTypes: ["anniversary"],
  },
];

// Graduation templates
const graduationTemplates: SmartTaskTemplate[] = [
  {
    title: "Book Graduation Venue",
    description: "Reserve venue for graduation party.",
    price: 600,
    priority: "high",
    category: "venue",
    icon: "building",
    eventTypes: ["graduation"],
  },
  {
    title: "Order Graduation Cake",
    description: "Order graduation celebration cake.",
    price: 120,
    priority: "medium",
    category: "catering",
    icon: "cake",
    eventTypes: ["graduation"],
  },
  {
    title: "Hire Photographer",
    description: "Book photographer for graduation photos.",
    price: 400,
    priority: "high",
    category: "photography",
    icon: "camera",
    eventTypes: ["graduation"],
  },
  {
    title: "Send Graduation Invitations",
    description: "Send invitations to graduation celebration.",
    price: 60,
    priority: "high",
    category: "venue",
    icon: "mail",
    eventTypes: ["graduation"],
  },
];

// Baby Shower templates
const babyShowerTemplates: SmartTaskTemplate[] = [
  {
    title: "Book Baby Shower Venue",
    description: "Reserve venue for baby shower celebration.",
    price: 400,
    priority: "high",
    category: "venue",
    icon: "building",
    eventTypes: ["baby_shower"],
  },
  {
    title: "Order Baby Shower Cake",
    description: "Order themed baby shower cake.",
    price: 100,
    priority: "medium",
    category: "catering",
    icon: "cake",
    eventTypes: ["baby_shower"],
  },
  {
    title: "Buy Decorations",
    description: "Purchase baby shower decorations and party supplies.",
    price: 150,
    priority: "medium",
    category: "flowers",
    icon: "sparkles",
    eventTypes: ["baby_shower"],
  },
  {
    title: "Send Invitations",
    description: "Send baby shower invitations to guests.",
    price: 40,
    priority: "high",
    category: "venue",
    icon: "mail",
    eventTypes: ["baby_shower"],
  },
];

// Combine all templates
export const smartTaskTemplates: SmartTaskTemplate[] = [
  ...weddingTemplates,
  ...birthdayTemplates,
  ...corporateTemplates,
  ...anniversaryTemplates,
  ...graduationTemplates,
  ...babyShowerTemplates,
];

// Get templates for a specific event type
export function getTemplatesForEventType(eventType: EventType): SmartTaskTemplate[] {
  return smartTaskTemplates.filter((template) => {
    // Safety check: if eventTypes is undefined or not an array, skip this template
    if (!template.eventTypes || !Array.isArray(template.eventTypes)) {
      return false;
    }
    return template.eventTypes.includes(eventType) || template.eventTypes.includes("custom");
  });
}

// Helper function to normalize text for duplicate detection
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " "); // Normalize whitespace
}

// Check if two task titles are duplicates
export function isDuplicateTask(title1: string, title2: string): boolean {
  const normalized1 = normalizeText(title1);
  const normalized2 = normalizeText(title2);
  
  // Exact match
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for cases like "Book Venue" vs "Venue")
  const keywords1 = normalized1.split(" ").filter(w => w.length > 3);
  const keywords2 = normalized2.split(" ").filter(w => w.length > 3);
  
  // If they share significant keywords, consider them duplicates
  if (keywords1.length > 0 && keywords2.length > 0) {
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    if (commonKeywords.length >= Math.min(keywords1.length, keywords2.length) * 0.7) {
      return true;
    }
  }
  
  return false;
}

