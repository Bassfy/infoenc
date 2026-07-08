import { Stack } from "expo-router";
import { I18nManager } from "react-native";
import { useEffect } from "react";
import { negotiate, dir } from "@infoenc/i18n";

/**
 * Mobile root layout (ADR-014). Reuses the SAME @infoenc/i18n locale negotiation and direction
 * logic as web — one bilingual source of truth across web and mobile. RTL is applied at the native
 * layer via I18nManager so Arabic renders right-to-left throughout the app.
 *
 * Labs on mobile are console-view only (not full desktop sessions) per ADR-014; the deep learning
 * flows reuse the shared contracts (@infoenc/contracts) so the API layer is identical to web.
 */
export default function RootLayout() {
  const locale = negotiate(undefined); // device locale negotiation wired to expo-localization at build
  const isRtl = dir(locale) === "rtl";

  useEffect(() => {
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
      // A reload is required for the native direction change to take effect (handled on first run).
    }
  }, [isRtl]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0b0f14" },
        headerTintColor: "#e9edf2",
        contentStyle: { backgroundColor: "#0b0f14" },
      }}
    />
  );
}
