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
          <Text style={styles.title}>OpenClaw</Text>
          <Text style={styles.subtitle}>Seeker Node</Text>
        </View>

        {/* Status */}
        <StatusCard
          status={worker.status}
          coordinatorUrl={worker.coordinatorUrl}
          workerId={worker.workerId}
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
