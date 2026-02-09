/**
 * EarningsCard — Displays total SOL earnings and jobs completed count.
 *
 * For MVP these are mock values (0.001 SOL per TASK job).
 * The card has a subtle accent gradient border to draw attention.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize } from "../theme";

interface EarningsCardProps {
  totalEarnings: number;
  jobsCompleted: number;
}

export function EarningsCard({ totalEarnings, jobsCompleted }: EarningsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.earningsSection}>
        <Text style={styles.label}>Earnings</Text>
        <View style={styles.earningsRow}>
          <Text style={styles.amount}>
            {totalEarnings.toFixed(4)}
          </Text>
          <Text style={styles.currency}>SOL</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.jobsSection}>
        <Text style={styles.label}>Completed</Text>
        <Text style={styles.jobCount}>{jobsCompleted}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  earningsSection: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  earningsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  amount: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "monospace",
  },
  currency: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.accentLight,
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  jobsSection: {
    alignItems: "center",
    gap: spacing.xs,
  },
  jobCount: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "monospace",
  },
});
