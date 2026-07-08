import { View, Text, Pressable, StyleSheet } from "react-native";
import { negotiate } from "@infoenc/i18n";

/**
 * Home screen (ADR-014 scaffold). Reads copy from the shared bilingual catalog concept and styles
 * with the design-token values (Phase 4) transcribed for native. This is the cold-start avoidance
 * ADR-014 called for: the app boots, negotiates locale, and renders the brand — the fast-follow
 * build adds the learn/labs/career flows on top of this shell, reusing @infoenc/contracts for the
 * API layer so mobile and web share one typed client surface.
 */
const COPY = {
  en: {
    tagline: "TRAINED BY THE PEOPLE WHO BREAK IN FOR A LIVING",
    headline: "Signal, resolved from static.",
    cta: "Start free",
  },
  ar: {
    tagline: "تدرّب على يد من يخترقون الأنظمة احترافًا",
    headline: "إشارةٌ تنجلي من الضجيج.",
    cta: "ابدأ مجانًا",
  },
} as const;

export default function Home() {
  const locale = negotiate(undefined);
  const t = COPY[locale];

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{t.tagline}</Text>
      <Text style={styles.headline}>{t.headline}</Text>
      <Pressable style={styles.cta} accessibilityRole="button">
        <Text style={styles.ctaText}>{t.cta}</Text>
      </Pressable>
    </View>
  );
}

// Design-token values from Phase 4 (packages/ui/tokens), transcribed for React Native which can't
// consume CSS custom properties. Kept in sync with the token source.
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0810", padding: 24, justifyContent: "center", gap: 16 },
  eyebrow: { color: "#ff5db1", fontSize: 12, letterSpacing: 2, fontWeight: "600" }, // pink (accent-2)
  headline: { color: "#efeaf6", fontSize: 40, fontWeight: "600", lineHeight: 44 },
  cta: { backgroundColor: "#a24dff", paddingVertical: 14, paddingHorizontal: 22, borderRadius: 10, alignSelf: "flex-start" }, // purple (accent)
  ctaText: { color: "#0b0810", fontWeight: "600", fontSize: 16 },
});
