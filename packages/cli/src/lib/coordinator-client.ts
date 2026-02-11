import { JobType, Policy, type Quote } from "@dispatch/protocol";
import {
  ERROR_MESSAGES,
  coordinatorUnreachableMessage,
} from "../types.js";

export interface HealthResponse {
  status: string;
  workers_online: number;
  network: string;
  timestamp: string;
}

export interface JobStatusResponse {
  id: string;
  status: string;
  result: unknown;
  receipt: unknown;
  created_at: string;
  completed_at: string | null;
}

function buildUrl(baseUrl: string, route: string): string {
  const url = new URL(route, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  return url.toString();
}

async function requestJson<T>(
  coordinatorUrl: string,
  route: string,
  init?: RequestInit
): Promise<T> {
  const url = buildUrl(coordinatorUrl, route);

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error(coordinatorUnreachableMessage(coordinatorUrl));
  }

  if (!response.ok) {
    let data: unknown = null;
    const text = await response.text();
    try {
      data = text ? (JSON.parse(text) as unknown) : null;
    } catch {
      data = text;
    }

    if (response.status === 402) {
      throw new Error(ERROR_MESSAGES.PAYMENT_REQUIRED);
    }

    if (response.status === 422) {
      const errorCode = typeof data === "object" && data !== null
        ? String((data as Record<string, unknown>).error ?? "")
        : "";
      if (errorCode === "no_trusted_worker") {
        throw new Error(ERROR_MESSAGES.NO_TRUSTED_WORKER);
      }
      throw new Error(`Unprocessable entity: ${errorCode || "unknown"}`);
    }

    if (response.status === 404) {
      throw new Error("Requested resource not found.");
    }

    if (typeof data === "object" && data !== null && "error" in data) {
      throw new Error(String((data as Record<string, unknown>).error));
    }

    throw new Error(`HTTP ${response.status}: ${typeof data === "string" ? data : text}`);
  }

  return (await response.json()) as T;
}

export async function getHealth(coordinatorUrl: string): Promise<HealthResponse> {
  return requestJson<HealthResponse>(coordinatorUrl, "/v1/health");
}

export async function getQuote(
  coordinatorUrl: string,
  params: { jobType: JobType; policy: Policy }
): Promise<Quote> {
  const query = new URLSearchParams({
    job_type: params.jobType,
    policy: params.policy,
  });
  return requestJson<Quote>(coordinatorUrl, `/v1/quote?${query.toString()}`);
}

export async function getJobStatus(
  coordinatorUrl: string,
  jobId: string
): Promise<JobStatusResponse> {
  return requestJson<JobStatusResponse>(coordinatorUrl, `/v1/jobs/${encodeURIComponent(jobId)}`);
}

export async function claimTrustPairing(
  coordinatorUrl: string,
  pairingCode: string,
  providerPubkey: string
): Promise<{ user_id: string }> {
  return requestJson<{ user_id: string }>(coordinatorUrl, "/v1/trust/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairing_code: pairingCode, provider_pubkey: providerPubkey }),
  });
}
