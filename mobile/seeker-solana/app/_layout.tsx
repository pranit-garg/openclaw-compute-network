/**
 * Root layout — wraps the entire app with providers and dark theme.
 *
 * This is the top-level layout for expo-router. It:
 * 1. Imports polyfills (Buffer, crypto) before anything else
 * 2. Wraps everything in WalletProvider for global state
 * 3. Sets the status bar to light (white text on dark background)
 */
import "../src/polyfills";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { WalletProvider } from "../src/contexts/WalletProvider";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <WalletProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      />
    </WalletProvider>
  );
}
