/**
 * Dashboard screen — the main screen of the app.
 *
 * Layout (top to bottom):
 * 1. StatusCard — connection status + worker ID
 * 2. EarningsCard — SOL earned + jobs completed
 * 3. WorkerToggle — big start/stop button
 * 4. JobHistory — recent completed jobs
 */
import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorker } from "../../src/hooks/useWorker";
import { StatusCard } from "../../src/components/StatusCard";
import { EarningsCard } from "../../src/components/EarningsCard";
import { WorkerToggle } from "../../src/components/WorkerToggle";
import { JobHistory } from "../../src/components/JobHistory";
import { colors, spacing, fontSize } from "../../src/theme";

export default function DashboardScreen() {
  const worker = useWorker();

  if (worker.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dispatch</Text>
          <Text style={styles.subtitle}>Compute Node</Text>
        </View>

        {/* Wallet connection banner */}
        {worker.signingMode === "wallet" && !worker.walletAddress && (
          <View style={styles.walletBanner}>
            <Text style={styles.walletBannerText}>
              Link your Phantom wallet to earn SOL for compute jobs
            </Text>
          </View>
        )}

        {/* Status */}
        <StatusCard
          status={worker.status}
          coordinatorUrl={worker.coordinatorUrl}
          workerId={worker.workerId}
          signingMode={worker.signingMode}
          walletAddress={worker.walletAddress}
        />

        {/* Earnings */}
        <EarningsCard
          totalEarnings={worker.totalEarnings}
          jobsCompleted={worker.jobsCompleted}
        />

        {/* Toggle */}
        <WorkerToggle
          status={worker.status}
          onToggle={worker.toggle}
          isToggling={worker.isToggling}
          signingMode={worker.signingMode}
          walletConnected={!!worker.walletAddress}
        />

        {/* Job History */}
        <JobHistory jobs={worker.jobHistory} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.accentLight,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  walletBanner: {
    backgroundColor: colors.warning + "20",
    borderWidth: 1,
    borderColor: colors.warning + "40",
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  walletBannerText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});
