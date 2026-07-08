import type { Config } from "tailwindcss";
import preset from "@infoenc/config/tailwind-preset";

/** Company site + portal Tailwind config — extends the shared INFOENC preset (Phase 4). */
export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
} satisfies Config;
