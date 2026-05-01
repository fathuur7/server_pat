import type { Category } from "../types";

export const categories: Category[] = [
  {
    bg: "bg-comic-red",
    icon: "bolt",
    iconColor: "text-comic-red",
    titleColor: "text-white",
    descColor: "text-white/90",
    title: "ACTION SERIES",
    description: "Fast-paced, high-octane battles.",
  },
  {
    bg: "bg-comic-blue",
    icon: "rocket_launch",
    iconColor: "text-comic-blue",
    titleColor: "text-white",
    descColor: "text-white/90",
    title: "SCI-FI MOVIES",
    description: "Journeys to the edge of the galaxy.",
  },
  {
    bg: "bg-comic-primary",
    icon: "auto_stories",
    iconColor: "text-slate-900",
    titleColor: "text-slate-900",
    descColor: "text-slate-800",
    title: "THE VAULT",
    description: "Your personal collection of heroes.",
  },
];
