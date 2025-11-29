import { api } from "../api";

export interface WaitlistSignupDto {
  email: string;
  source?: string;
  referralCode?: string;
}

export interface WaitlistResponse {
  id: string;
  email: string;
  notified: boolean;
  source: string | null;
  createdAt: string;
}

/**
 * Join the waitlist
 */
export async function joinWaitlist(
  data: WaitlistSignupDto,
): Promise<WaitlistResponse> {
  const response = await api.post("/waitlist", data);
  return response.data;
}

/**
 * Get waitlist statistics (admin only)
 */
export async function getWaitlistStats(): Promise<{
  total: number;
  notified: number;
  pending: number;
  last24Hours: number;
  last7Days: number;
}> {
  const response = await api.get("/waitlist/stats");
  return response.data;
}

/**
 * Export all waitlist emails (admin only)
 */
export async function exportWaitlistEmails(
  notifiedOnly: boolean = false,
): Promise<{ emails: string[]; count: number }> {
  const response = await api.get("/waitlist/emails", {
    params: { notified: notifiedOnly },
  });
  return response.data;
}
