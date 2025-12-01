/**
 * Waitlist API Client Tests
 */

import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import type { WaitlistResponse, WaitlistSignupDto } from "./waitlist";
import * as waitlistApi from "./waitlist";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Waitlist API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockWaitlistResponse: WaitlistResponse = {
    id: "waitlist-1",
    email: "user@example.com",
    notified: false,
    source: "landing-page",
    createdAt: "2024-01-01T00:00:00Z",
  };

  describe("joinWaitlist", () => {
    it("should join the waitlist", async () => {
      const signupDto: WaitlistSignupDto = {
        email: "user@example.com",
        source: "landing-page",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockWaitlistResponse,
      } as AxiosResponse);

      const result = await waitlistApi.joinWaitlist(signupDto);

      expect(api.post).toHaveBeenCalledWith("/waitlist", signupDto);
      expect(result).toEqual(mockWaitlistResponse);
    });

    it("should join with referral code", async () => {
      const signupDto: WaitlistSignupDto = {
        email: "user@example.com",
        referralCode: "REF123",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockWaitlistResponse,
      } as AxiosResponse);

      const result = await waitlistApi.joinWaitlist(signupDto);

      expect(api.post).toHaveBeenCalledWith("/waitlist", signupDto);
      expect(result).toEqual(mockWaitlistResponse);
    });
  });

  describe("getWaitlistStats", () => {
    it("should fetch waitlist statistics", async () => {
      const stats = {
        total: 1000,
        notified: 200,
        pending: 800,
        last24Hours: 50,
        last7Days: 300,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: stats,
      } as AxiosResponse);

      const result = await waitlistApi.getWaitlistStats();

      expect(api.get).toHaveBeenCalledWith("/waitlist/stats");
      expect(result).toEqual(stats);
    });
  });

  describe("exportWaitlistEmails", () => {
    it("should export all waitlist emails", async () => {
      const exportData = {
        emails: ["user1@example.com", "user2@example.com"],
        count: 2,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: exportData,
      } as AxiosResponse);

      const result = await waitlistApi.exportWaitlistEmails(false);

      expect(api.get).toHaveBeenCalledWith("/waitlist/emails", {
        params: { notified: false },
      });
      expect(result).toEqual(exportData);
    });

    it("should export only notified emails", async () => {
      const exportData = {
        emails: ["user1@example.com"],
        count: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: exportData,
      } as AxiosResponse);

      const result = await waitlistApi.exportWaitlistEmails(true);

      expect(api.get).toHaveBeenCalledWith("/waitlist/emails", {
        params: { notified: true },
      });
      expect(result).toEqual(exportData);
    });
  });
});
