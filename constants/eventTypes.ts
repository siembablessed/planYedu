export type EventType = "wedding" | "birthday" | "corporate" | "anniversary" | "graduation" | "baby_shower" | "custom";

export interface EventTypeConfig {
  id: EventType;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const eventTypes: EventTypeConfig[] = [
  {
    id: "wedding",
    name: "Wedding",
    icon: "heart",
    color: "#EC4899",
    description: "Plan your perfect wedding day",
  },
  {
    id: "birthday",
    name: "Birthday Party",
    icon: "cake",
    color: "#F59E0B",
    description: "Celebrate special birthdays",
  },
  {
    id: "corporate",
    name: "Corporate Event",
    icon: "briefcase",
    color: "#6366F1",
    description: "Organize business events and meetings",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    icon: "ring",
    color: "#8B5CF6",
    description: "Celebrate milestones and anniversaries",
  },
  {
    id: "graduation",
    name: "Graduation",
    icon: "graduation-cap",
    color: "#10B981",
    description: "Plan graduation ceremonies and parties",
  },
  {
    id: "baby_shower",
    name: "Baby Shower",
    icon: "baby",
    color: "#06B6D4",
    description: "Celebrate new arrivals",
  },
  {
    id: "custom",
    name: "Custom Event",
    icon: "calendar",
    color: "#94A3B8",
    description: "Create your own event type",
  },
];

