/**
 * WorkerToggle — Big toggle switch to start/stop the worker.
 *
 * This is the main CTA on the dashboard. It's a large circular button
 * that changes color based on connection state:
 * - Disconnected: dimmed accent (tap to connect)
 * - Connected: bright accent with glow (tap to disconnect)
 * - Connecting/reconnecting: animated pulse
 */
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import type { ConnectionStatus } from "../services/WebSocketService";
import { colors, spacing, borderRadius, fontSize } from "../theme";

interface WorkerToggleProps {
  status: ConnectionStatus;
  onToggle: () => void;
  isToggling: boolean;
}

export function WorkerToggle({ status, onToggle, isToggling }: WorkerToggleProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isActive = status === "connected";
  const isTransitioning =
    status === "connecting" || status === "reconnecting" || isToggling;

  // Pulse animation for connecting/reconnecting states
  useEffect(() => {
    if (isTransitioning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTransitioning, pulseAnim]);

  const buttonColor = isActive
    ? colors.accent
    : isTransitioning
    ? colors.warning
    : colors.surfaceLight;

  const borderColor = isActive
    ? colors.accentLight
    : isTransitioning
    ? colors.warning
    : colors.border;

  const label = isActive
    ? "ACTIVE"
    : isTransitioning
    ? status === "reconnecting"
      ? "RECONNECTING"
      : "CONNECTING"
    : "START";

  const sublabel = isActive
    ? "Tap to stop"
    : isTransitioning
    ? "Please wait..."
    : "Tap to connect";

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          onPress={onToggle}
          disabled={isToggling}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: buttonColor,
              borderColor: borderColor,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {/* Inner glow ring for active state */}
          {isActive && <View style={styles.glowRing} />}

          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sublabel}>{sublabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const BUTTON_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  glowRing: {
    position: "absolute",
    width: BUTTON_SIZE - 16,
    height: BUTTON_SIZE - 16,
    borderRadius: (BUTTON_SIZE - 16) / 2,
    borderWidth: 1,
    borderColor: colors.accentLight + "40",
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 2,
  },
  sublabel: {
    fontSize: fontSize.xs,
    color: colors.text + "99",
  },
});
