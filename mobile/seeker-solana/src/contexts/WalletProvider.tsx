/**
 * WalletProvider — React context for wallet and worker state.
 *
 * Wraps the entire app to provide:
 * - Worker ID (public key hex)
 * - Connection status
 * - Total earnings (persisted to AsyncStorage)
 * - Job history
 *
 * This is the bridge between the WebSocketService singleton
 * and the React component tree.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWorkerId } from "../services/KeyManager";
import {
  wsService,
  type ConnectionStatus,
  type CompletedJob,
} from "../services/WebSocketService";

// ── Context Shape ─────────────────────────────

interface WalletContextType {
  workerId: string | null;
  status: ConnectionStatus;
  totalEarnings: number;
  jobsCompleted: number;
  jobHistory: CompletedJob[];
  coordinatorUrl: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  setCoordinatorUrl: (url: string) => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

// ── Storage Keys ──────────────────────────────

const STORAGE_EARNINGS = "openclaw_total_earnings";
const STORAGE_JOBS_COMPLETED = "openclaw_jobs_completed";
const STORAGE_JOB_HISTORY = "openclaw_job_history";
const STORAGE_COORDINATOR_URL = "openclaw_coordinator_url";

const DEFAULT_COORDINATOR_URL = "ws://localhost:4020";

// ── Provider ──────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [jobsCompleted, setJobsCompleted] = useState(0);
  const [jobHistory, setJobHistory] = useState<CompletedJob[]>([]);
  const [coordinatorUrl, setCoordinatorUrlState] = useState(DEFAULT_COORDINATOR_URL);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state on mount
  useEffect(() => {
    async function loadPersistedState() {
      try {
        const [
          storedEarnings,
          storedJobsCompleted,
          storedHistory,
          storedUrl,
          storedWorkerId,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_EARNINGS),
          AsyncStorage.getItem(STORAGE_JOBS_COMPLETED),
          AsyncStorage.getItem(STORAGE_JOB_HISTORY),
          AsyncStorage.getItem(STORAGE_COORDINATOR_URL),
          getWorkerId(),
        ]);

        if (storedEarnings) {
          const earnings = parseFloat(storedEarnings);
          setTotalEarnings(earnings);
          wsService.setEarnings(earnings);
        }
        if (storedJobsCompleted) {
          setJobsCompleted(parseInt(storedJobsCompleted, 10));
        }
        if (storedHistory) {
          const history = JSON.parse(storedHistory) as CompletedJob[];
          setJobHistory(history);
          wsService.setJobHistory(history);
        }
        if (storedUrl) {
          setCoordinatorUrlState(storedUrl);
          wsService.setCoordinatorUrl(storedUrl);
        }
        if (storedWorkerId) {
          setWorkerId(storedWorkerId);
        }
      } catch (err) {
        console.warn("[Wallet] Failed to load persisted state:", err);
      } finally {
        setIsLoading(false);
      }
    }

    void loadPersistedState();
  }, []);

  // Subscribe to WebSocketService events
  useEffect(() => {
    const unsubs = [
      wsService.on("statusChange", (newStatus) => {
        setStatus(newStatus);
      }),

      wsService.on("registered", (wId) => {
        setWorkerId(wId);
      }),

      wsService.on("jobCompleted", (job) => {
        setJobHistory((prev) => {
          const next = [job, ...prev].slice(0, 50);
          // Persist in background
          void AsyncStorage.setItem(STORAGE_JOB_HISTORY, JSON.stringify(next));
          return next;
        });

        if (job.success) {
          setJobsCompleted((prev) => {
            const next = prev + 1;
            void AsyncStorage.setItem(STORAGE_JOBS_COMPLETED, String(next));
            return next;
          });
        }
      }),

      wsService.on("earnings", (newTotal) => {
        setTotalEarnings(newTotal);
        void AsyncStorage.setItem(STORAGE_EARNINGS, String(newTotal));
      }),
    ];

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, []);

  const connect = useCallback(async () => {
    await wsService.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  const setCoordinatorUrl = useCallback((url: string) => {
    setCoordinatorUrlState(url);
    wsService.setCoordinatorUrl(url);
    void AsyncStorage.setItem(STORAGE_COORDINATOR_URL, url);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        workerId,
        status,
        totalEarnings,
        jobsCompleted,
        jobHistory,
        coordinatorUrl,
        connect,
        disconnect,
        setCoordinatorUrl,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
