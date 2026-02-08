/**
 * useWorker — Convenience hook for worker operations.
 *
 * Wraps the WalletProvider context with worker-specific logic.
 * Components use this instead of useWallet when they need
 * worker-related actions (connect/disconnect/toggle).
 */
import { useCallback, useState } from "react";
import { useWallet } from "../contexts/WalletProvider";

export function useWorker() {
  const wallet = useWallet();
  const [isToggling, setIsToggling] = useState(false);

  const isConnected = wallet.status === "connected";
  const isReconnecting = wallet.status === "reconnecting";
  const isConnecting = wallet.status === "connecting";

  /**
   * Toggle the worker on or off.
   * Provides a loading state while the connection is being established.
   */
  const toggle = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      if (isConnected || isReconnecting) {
        wallet.disconnect();
      } else {
        await wallet.connect();
      }
    } finally {
      // Small delay so the UI shows the transition
      setTimeout(() => setIsToggling(false), 500);
    }
  }, [isConnected, isReconnecting, isToggling, wallet]);

  return {
    // State
    workerId: wallet.workerId,
    status: wallet.status,
    isConnected,
    isReconnecting,
    isConnecting,
    isToggling,
    totalEarnings: wallet.totalEarnings,
    jobsCompleted: wallet.jobsCompleted,
    jobHistory: wallet.jobHistory,
    coordinatorUrl: wallet.coordinatorUrl,
    isLoading: wallet.isLoading,

    // Actions
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    toggle,
    setCoordinatorUrl: wallet.setCoordinatorUrl,
  };
}
