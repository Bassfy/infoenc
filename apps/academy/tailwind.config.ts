import type { Config } from "tailwindcss";
import preset from "@infoenc/config/tailwind-preset";

/**
 * Academy Tailwind config — extends the shared INFOENC preset (Phase 4). All color/space/type
 * utilities resolve to design tokens; logical-property utilities (ps-*, pe-*) are the RTL norm.
 */
export default {
  presets: [preset],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
