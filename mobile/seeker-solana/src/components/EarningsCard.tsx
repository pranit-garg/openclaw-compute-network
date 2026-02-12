/**
 * EarningsCard: Displays total BOLT earnings and jobs completed count.
 *
 * For MVP these are mock values (1.0 BOLT per TASK job).
 * The card has a gold glow shadow and split amount display.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontSize, fontFamily } from "../theme";

interface EarningsCardProps {
  totalEarnings: number;
  jobsCompleted: number;
}

export function EarningsCard({ totalEarnings, jobsCompleted }: EarningsCardProps) {
  const [intPart, decPart] = totalEarnings.toFixed(4).split(".");

  return (
    <View style={styles.card}>
      <View style={styles.earningsSection}>
        <Text style={styles.label}>Earnings</Text>
        <View style={styles.earningsRow}>
          <View style={styles.amountRow}>
            <Text style={styles.amountInt}>{intPart}</Text>
            <Text style={styles.amountDec}>.{decPart}</Text>
          </View>
          <View>
            <Text style={styles.currency}>BOLT</Text>
            <Text style={styles.networkLabel}>(Solana devnet)</Text>
          </View>
        </View>
        <Text style={styles.rateLabel}>0.001 per job</Text>
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
    shadowColor: colors.accent,
    shadowRadius: 8,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  earningsSection: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold,
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  earningsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  amountInt: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  amountDec: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
  },
  currency: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.accentLight,
  },
  networkLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
    textAlign: "center",
  },
  rateLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
    marginTop: spacing.xs,
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
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
});
