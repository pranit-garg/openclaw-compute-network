/**
 * JobDetailModal: Bottom sheet showing job details.
 *
 * Simplified: shows earnings, timestamp, duration, job ID,
 * and explorer buttons. No jargon, no task type labels.
 */
import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Linking,
  ScrollView,
  StyleSheet,
  Clipboard,
} from "react-native";
import type { CompletedJob } from "../services/WebSocketService";
import { colors, spacing, borderRadius, fontSize, fontFamily } from "../theme";

interface JobDetailModalProps {
  job: CompletedJob | null;
  visible: boolean;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function truncateId(id: string, maxLen = 16): string {
  if (id.length <= maxLen) return id;
  return id.slice(0, 8) + "..." + id.slice(-6);
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)} seconds`;
}

// ── Component ──────────────────────────────────

export function JobDetailModal({ job, visible, onClose }: JobDetailModalProps) {
  if (!job) return null;

  const title = job.success ? "Job Completed" : "Job Failed";
  const hasFeedbackTx = !!job.feedbackTxHash;
  const hasPaymentTx = !!job.paymentTxHash;
  const pendingTx = !hasFeedbackTx && !hasPaymentTx && !job.feedbackFailed && !job.paymentFailed;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>

          {/* Title */}
          <Text style={styles.sheetTitle}>{title}</Text>

          {/* Big earnings display */}
          <Text style={job.success ? styles.earningsBig : styles.earningsFailed}>
            {job.success ? "0.001 BOLT" : "No earnings"}
          </Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Info rows */}
            <View style={styles.rows}>
              <DetailRow label="Time" value={formatTimestamp(job.timestamp)} />
              <DetailRow label="Duration" value={formatDuration(job.durationMs)} />
              <Pressable
                style={styles.detailRow}
                onPress={() => {
                  try { Clipboard.setString(job.jobId); } catch {}
                }}
              >
                <Text style={styles.detailLabel}>Job ID</Text>
                <Text style={[styles.detailValue, styles.mono]}>
                  {truncateId(job.jobId)}
                </Text>
              </Pressable>
            </View>

            {/* Onchain section */}
            <View style={styles.onchainSection}>
              {hasPaymentTx && (
                <Pressable
                  style={({ pressed }) => [
                    styles.explorerButton,
                    styles.paymentButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => job.paymentExplorerUrl && Linking.openURL(job.paymentExplorerUrl)}
                >
                  <Text style={styles.paymentButtonText}>
                    View on Solana Explorer
                  </Text>
                </Pressable>
              )}
              {hasFeedbackTx && (
                <Pressable
                  style={({ pressed }) => [
                    styles.explorerButton,
                    styles.reputationButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => job.feedbackExplorerUrl && Linking.openURL(job.feedbackExplorerUrl)}
                >
                  <Text style={styles.reputationButtonText}>
                    View on Monad Explorer
                  </Text>
                </Pressable>
              )}
              {pendingTx && job.success && (
                <Text style={styles.pendingText}>Transaction processing...</Text>
              )}
              {job.paymentFailed && (
                <Text style={styles.failedText}>Payment failed</Text>
              )}
              {job.feedbackFailed && !job.paymentFailed && (
                <Text style={styles.pendingText}>Reputation update failed</Text>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Sub-components ─────────────────────────────

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: "70%",
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.lg,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  earningsBig: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  earningsFailed: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  scrollArea: {
    flexShrink: 1,
  },
  rows: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textDim,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.text,
  },
  mono: {
    fontFamily: "monospace",
  },
  onchainSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  explorerButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  paymentButton: {
    backgroundColor: "#d4a24620",
  },
  paymentButtonText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: "#d4a246",
  },
  reputationButton: {
    backgroundColor: "#8b5cf620",
  },
  reputationButtonText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: "#8b5cf6",
  },
  pendingText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textDim,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  failedText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.error,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
});
