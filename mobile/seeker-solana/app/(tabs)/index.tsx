/**
 * Dashboard screen — clean control panel.
 *
 * Layout (top to bottom):
 * 1. StatusCard: connection status + worker ID
 * 2. EarningsCard: BOLT earned + jobs completed
 * 3. WorkerToggle: big start/stop button
 */
import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorker } from "../../src/hooks/useWorker";
import { StatusCard } from "../../src/components/StatusCard";
import { EarningsCard } from "../../src/components/EarningsCard";
import { WorkerToggle } from "../../src/components/WorkerToggle";
import { ErrorToast } from "../../src/components/ErrorToast";
import { DashboardSkeleton } from "../../src/components/Skeleton";
import { colors, spacing, fontSize, fontFamily } from "../../src/theme";

export default function DashboardScreen() {
  const worker = useWorker();
  const [refreshing, setRefreshing] = React.useState(false);
  const [connectingWallet, setConnectingWallet] = React.useState(false);
  const hasAutoConnected = useRef(false);

  useEffect(() => {
    if (!worker.isLoading && worker.status === "disconnected" && !hasAutoConnected.current) {
      hasAutoConnected.current = true;
      const timer = setTimeout(() => {
        worker.connect().catch((err) => {
          console.warn("[Dashboard] Auto-connect failed:", err);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [worker.isLoading, worker.status]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (worker.status === "disconnected") {
        await worker.connect();
      }
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [worker]);

  const handleConnectWallet = useCallback(async () => {
    if (connectingWallet) return;
    setConnectingWallet(true);
    try {
      await worker.connectWallet();
    } catch (err) {
      Alert.alert("Connection Failed", (err as Error).message);
    } finally {
      setConnectingWallet(false);
    }
  }, [connectingWallet, worker]);

  if (worker.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ErrorToast />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 28, height: 28, borderRadius: 6 }}
          />
          <Text style={styles.title}>Dispatch</Text>
          <Text style={styles.subtitle}>Compute Node</Text>
          <View style={styles.headerDivider} />
        </View>

        <View style={styles.testnetBanner}>
          <Text style={styles.testnetText}>Solana Devnet · Monad Testnet</Text>
          <Text style={styles.testnetSubText}>Earning BOLT · Building reputation</Text>
        </View>

        {/* Wallet connection banner */}
        {worker.signingMode === "wallet" && !worker.walletAddress && (
          <View style={styles.walletBanner}>
            <Text style={styles.walletBannerText}>
              Link your Solana wallet to earn BOLT for compute jobs
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.walletBannerButton,
                { opacity: pressed || connectingWallet ? 0.8 : 1 },
              ]}
              onPress={handleConnectWallet}
              disabled={connectingWallet}
            >
              {connectingWallet ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.walletBannerButtonText}>Connect Wallet</Text>
              )}
            </Pressable>
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
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.accentLight,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerDivider: {
    width: "60%",
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
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
    fontFamily: fontFamily.semibold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  walletBannerButton: {
    backgroundColor: colors.warning,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  walletBannerButtonText: {
    fontSize: fontSize.sm,
    color: colors.background,
    fontFamily: fontFamily.semibold,
  },
  testnetBanner: {
    backgroundColor: colors.warning + "15",
    borderWidth: 1,
    borderColor: colors.warning + "30",
    borderRadius: 8,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  testnetText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    fontFamily: fontFamily.semibold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  testnetSubText: {
    fontSize: fontSize.xs - 1,
    color: colors.warning,
    fontFamily: fontFamily.regular,
    letterSpacing: 0.5,
    opacity: 0.7,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
