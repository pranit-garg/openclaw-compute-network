/**
 * JobHistory — Scrollable list of recently completed jobs.
 *
 * Each row shows:
 * - Task type icon/badge
 * - Timestamp (relative, e.g. "2m ago")
 * - Duration in ms
 * - Success/fail status
 */
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import type { CompletedJob } from "../services/WebSocketService";
import { colors, spacing, borderRadius, fontSize } from "../theme";

interface JobHistoryProps {
  jobs: CompletedJob[];
}

// ── Helpers ────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TASK_TYPE_COLORS: Record<string, string> = {
  summarize: "#6366f1",
  classify: "#8b5cf6",
  extract_json: "#ec4899",
  TASK: "#6366f1",
};

// ── Components ─────────────────────────────────

function JobRow({ job }: { job: CompletedJob }) {
  const badgeColor = TASK_TYPE_COLORS[job.taskType] ?? colors.textDim;

  return (
    <View style={styles.row}>
      <View style={styles.leftSection}>
        <View style={[styles.typeBadge, { backgroundColor: badgeColor + "20" }]}>
          <Text style={[styles.typeText, { color: badgeColor }]}>
            {job.taskType}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatRelativeTime(job.timestamp)}</Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.duration}>{job.durationMs}ms</Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: job.success ? colors.success : colors.error },
          ]}
        />
      </View>
    </View>
  );
}

export function JobHistory({ jobs }: JobHistoryProps) {
  if (jobs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No jobs yet</Text>
        <Text style={styles.emptySubtitle}>
          Connect to a coordinator to start processing tasks
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Jobs</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.jobId}
        renderItem={({ item }) => <JobRow job={item} />}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  duration: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  separator: {
    height: spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: "center",
  },
});
