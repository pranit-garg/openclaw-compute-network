/**
 * Settings screen — coordinator URL, worker identity, reset.
 *
 * Allows the user to:
 * - Change the coordinator URL (which server to connect to)
 * - View and copy their worker ID
 * - Reset their keypair (get a new identity — irreversible)
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { useWorker } from "../../src/hooks/useWorker";
import { resetKeypair } from "../../src/services/KeyManager";
import { colors, spacing, borderRadius, fontSize } from "../../src/theme";

export default function SettingsScreen() {
  const worker = useWorker();
  const [urlInput, setUrlInput] = useState(worker.coordinatorUrl);
  const [copied, setCopied] = useState(false);

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    worker.setCoordinatorUrl(trimmed);
    Alert.alert("Saved", "Coordinator URL updated. Reconnect to use the new URL.");
  };

  const handleCopyWorkerId = async () => {
    if (!worker.workerId) return;
    await Clipboard.setStringAsync(worker.workerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            // Disconnect first
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Coordinator URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordinator URL</Text>
          <Text style={styles.sectionDescription}>
            WebSocket endpoint of the coordinator node to connect to.
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="ws://localhost:4020"
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

        {/* Worker Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worker Identity</Text>
          <Text style={styles.sectionDescription}>
            Your ed25519 public key. This is your unique identity on the network.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.copyRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleCopyWorkerId}
          >
            <Text style={styles.workerId} numberOfLines={2}>
              {worker.workerId ?? "No keypair generated yet"}
            </Text>
            <Text style={styles.copyLabel}>
              {copied ? "Copied!" : "Tap to copy"}
            </Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            Danger Zone
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.dangerButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleResetKeypair}
          >
            <Text style={styles.dangerButtonText}>Reset Keypair</Text>
            <Text style={styles.dangerDescription}>
              Generate a new identity. Irreversible.
            </Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>OpenClaw Seeker</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network</Text>
            <Text style={styles.infoValue}>Solana (Devnet)</Text>
          </View>
        </View>
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
    fontWeight: "800",
    color: colors.text,
    paddingTop: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
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
    fontWeight: "700",
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
    fontWeight: "600",
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
    fontWeight: "700",
    fontSize: fontSize.md,
  },
  dangerDescription: {
    fontSize: fontSize.xs,
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
    color: colors.textDim,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
