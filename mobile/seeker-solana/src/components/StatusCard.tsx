/**
 * StatusCard — Shows connection status, coordinator URL, and worker ID.
 *
 * Visual indicators:
 * - Green dot = connected and processing jobs
 * - Red dot = disconnected
 * - Yellow dot = reconnecting (lost connection, trying to get back)
 * - Blue dot = connecting (initial connection attempt)
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ConnectionStatus } from "../services/WebSocketService";
import { colors, spacing, borderRadius, fontSize } from "../theme";

import type { SigningMode } from "../contexts/WalletProvider";

interface StatusCardProps {
  status: ConnectionStatus;
  coordinatorUrl: string;
  workerId: string | null;
  signingMode?: SigningMode;
  walletAddress?: string | null;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; label: string }
> = {
  connected: { color: colors.success, label: "Connected" },
  disconnected: { color: colors.error, label: "Disconnected" },
  reconnecting: { color: colors.warning, label: "Reconnecting..." },
  connecting: { color: colors.accentLight, label: "Connecting..." },
};

export function StatusCard({
  status,
  coordinatorUrl,
  workerId,
  signingMode = "device-key",
  walletAddress,
}: StatusCardProps) {
  const config = STATUS_CONFIG[status];
  const isWalletMode = signingMode === "wallet";

  // Show wallet address (base58 truncated) or worker ID (hex truncated)
  const identityLabel = isWalletMode ? "Wallet" : "Worker ID";
  const identityValue = isWalletMode
    ? walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "Not connected"
    : workerId
    ? `${workerId.slice(0, 8)}...${workerId.slice(-8)}`
    : "---";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: config.color }]} />
          <Text style={[styles.statusLabel, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.badge}>
          {isWalletMode ? "WALLET" : "SEEKER"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Coordinator</Text>
        <Text style={styles.value} numberOfLines={1}>
          {coordinatorUrl}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{identityLabel}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {identityValue}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
  statusLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  badge: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.accent,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: "monospace",
    maxWidth: "60%",
  },
});
