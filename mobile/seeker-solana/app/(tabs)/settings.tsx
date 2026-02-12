/**
 * Settings screen: coordinator URL, signing mode, worker identity, reset.
 *
 * Allows the user to:
 * - Change the coordinator URL
 * - Toggle between Wallet (MWA) and Device Key signing
 * - Connect/disconnect Solana wallet
 * - View and copy their worker ID or wallet address
 * - Reset their device keypair (irreversible)
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useWorker } from "../../src/hooks/useWorker";
import { resetKeypair } from "../../src/services/KeyManager";
import { colors, spacing, borderRadius, fontSize, fontFamily } from "../../src/theme";

export default function SettingsScreen() {
  const worker = useWorker();
  const [urlInput, setUrlInput] = useState(worker.coordinatorUrl);
  const [copied, setCopied] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    worker.setCoordinatorUrl(trimmed);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Updated", "Network endpoint saved. Reconnecting...");
  };

  const handleCopyWorkerId = async () => {
    if (!worker.workerId) return;
    await Clipboard.setStringAsync(worker.workerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWalletAddress = async () => {
    if (!worker.walletAddress) return;
    await Clipboard.setStringAsync(worker.walletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  };

  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    try {
      await worker.connectWallet();
    } catch (err) {
      Alert.alert("Connection Failed", (err as Error).message);
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = async () => {
    worker.disconnect(); // Stop worker first
    await worker.disconnectWallet();
  };

  const handleResetKeypair = () => {
    Alert.alert(
      "Reset Identity",
      "This will generate a new worker keypair. Your current identity and earnings history will be lost. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            worker.disconnect();
            await resetKeypair();
            Alert.alert(
              "Done",
              "Keypair reset. Restart the app to use your new identity."
            );
          },
        },
      ]
    );
  };

  const isWalletMode = worker.signingMode === "wallet";
  const isAndroid = Platform.OS === "android";
  const truncatedWallet = worker.walletAddress
    ? `${worker.walletAddress.slice(0, 6)}...${worker.walletAddress.slice(-4)}`
    : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Signing Mode */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key-outline" size={16} color={colors.textDim} />
            <Text style={styles.sectionTitle}>Signing Mode</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Wallet mode signs receipts with your Solana wallet. Device key uses a local keypair for headless operation.
          </Text>

          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.toggleOption,
                isWalletMode && styles.toggleOptionActive,
                !isAndroid && styles.toggleOptionDisabled,
              ]}
              onPress={() => isAndroid && worker.switchSigningMode("wallet")}
              disabled={!isAndroid}
            >
              <Text style={[
                styles.toggleLabel,
                isWalletMode && styles.toggleLabelActive,
              ]}>
                Wallet
              </Text>
              {!isAndroid && (
                <Text style={styles.toggleHint}>Android only</Text>
              )}
            </Pressable>

            <Pressable
              style={[
                styles.toggleOption,
                !isWalletMode && styles.toggleOptionActive,
              ]}
              onPress={() => worker.switchSigningMode("device-key")}
            >
              <Text style={[
                styles.toggleLabel,
                !isWalletMode && styles.toggleLabelActive,
              ]}>
                Device Key
              </Text>
            </Pressable>
          </View>

          <Text style={styles.signingModeHelper}>
            Device Key works on all platforms. Wallet mode requires a Solana wallet app on Android.
          </Text>
        </View>

        {/* Wallet Connection (only shown in wallet mode) */}
        {isWalletMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="wallet-outline" size={16} color={colors.textDim} />
              <Text style={styles.sectionTitle}>Wallet</Text>
            </View>

            {worker.walletAddress ? (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.copyRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={handleCopyWalletAddress}
                >
                  <Text style={styles.walletLabel}>Connected</Text>
                  <Text style={styles.workerId}>{truncatedWallet}</Text>
                  <Text style={styles.copyLabel}>
                    {walletCopied ? "Copied!" : "Tap to copy"}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.outlineButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={handleDisconnectWallet}
                >
                  <Text style={styles.outlineButtonText}>Disconnect Wallet</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.walletButton,
                  { opacity: pressed || connectingWallet ? 0.7 : 1 },
                ]}
                onPress={handleConnectWallet}
                disabled={connectingWallet}
              >
                <Text style={styles.walletButtonText}>
                  {connectingWallet ? "Connecting..." : "Connect Wallet"}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Coordinator URL */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={16} color={colors.textDim} />
            <Text style={styles.sectionTitle}>Network Endpoint</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Coordinator node that routes jobs to your device.
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="wss://dispatch-solana.up.railway.app"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleSaveUrl}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>

        {/* Worker Identity (device key mode) */}
        {!isWalletMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="finger-print-outline" size={16} color={colors.textDim} />
              <Text style={styles.sectionTitle}>Node Identity</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Your ed25519 public key, used to sign compute receipts and prove work.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.copyRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleCopyWorkerId}
            >
              <Text style={styles.workerId} numberOfLines={2}>
                {worker.workerId ?? "Generated on first connection"}
              </Text>
              <Text style={styles.copyLabel}>
                {copied ? "Copied!" : "Tap to copy"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Danger Zone (device key mode only) */}
        {!isWalletMode && (
          <View style={styles.dangerZone}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning-outline" size={16} color={colors.error} />
              <Text style={[styles.sectionTitle, { color: colors.error }]}>
                Danger Zone
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleResetKeypair}
            >
              <Text style={styles.dangerButtonText}>Reset Identity</Text>
              <Text style={styles.dangerDescription}>
                Generates a new keypair. Earnings history will be lost.
              </Text>
            </Pressable>
          </View>
        )}

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>Dispatch</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.2.0 (beta)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network</Text>
            <Text style={styles.infoValue}>Solana Devnet + Monad Testnet</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Signing</Text>
            <Text style={styles.infoValue}>
              {isWalletMode ? "Wallet (MWA)" : "Device Key"}
            </Text>
          </View>
        </View>

        {/* dispatch.computer link */}
        <Pressable
          style={({ pressed }) => [
            styles.linkButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Linking.openURL("https://dispatch.computer")}
        >
          <Text style={styles.linkText}>dispatch.computer</Text>
        </Pressable>
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
    gap: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.text,
    paddingTop: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toggleOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  toggleOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + "20",
  },
  toggleOptionDisabled: {
    opacity: 0.4,
  },
  toggleLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.textDim,
  },
  toggleLabelActive: {
    color: colors.accentLight,
  },
  toggleHint: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
  },
  signingModeHelper: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
  },
  walletButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  walletButtonText: {
    color: colors.text,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
  },
  walletLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold,
    color: colors.success,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  outlineButtonText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: "monospace",
    fontSize: fontSize.sm,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  saveButtonText: {
    color: colors.text,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  copyRow: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  workerId: {
    color: colors.text,
    fontFamily: "monospace",
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  copyLabel: {
    fontSize: fontSize.xs,
    color: colors.accentLight,
    fontFamily: fontFamily.semibold,
  },
  dangerZone: {
    backgroundColor: colors.error + "08",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + "20",
    gap: spacing.md,
  },
  dangerButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error + "40",
    padding: spacing.md,
    gap: spacing.xs,
  },
  dangerButtonText: {
    color: colors.error,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
  },
  dangerDescription: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.accent,
  },
});
