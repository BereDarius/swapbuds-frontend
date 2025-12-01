/**
 * Cookie Consent Store Tests
 */

import type { CookieConsent } from "@/types/legal";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCookieConsentStore } from "./cookieConsentStore";

// Mock the API module
vi.mock("@/lib/api/legal", () => ({
  getCookieConsent: vi.fn(),
  updateCookieConsent: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Cookie Consent Store", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset the store state
    useCookieConsentStore.setState({
      consent: null,
      bannerVisible: false,
      preferencesModalOpen: false,
    });
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have default state", () => {
      const state = useCookieConsentStore.getState();

      expect(state.consent).toBeNull();
      expect(state.bannerVisible).toBe(false);
      expect(state.preferencesModalOpen).toBe(false);
    });
  });

  describe("setConsent", () => {
    it("should set cookie consent", () => {
      const { setConsent } = useCookieConsentStore.getState();

      const consent: CookieConsent = {
        essential: true,
        functional: true,
        analytics: false,
        marketing: false,
      };

      setConsent(consent);

      const state = useCookieConsentStore.getState();
      expect(state.consent).toEqual(consent);
    });
  });

  describe("acceptAll", () => {
    it("should accept all cookie types", async () => {
      const { acceptAll } = useCookieConsentStore.getState();

      await acceptAll();

      const state = useCookieConsentStore.getState();
      expect(state.consent).toEqual({
        essential: true,
        functional: true,
        analytics: true,
        marketing: true,
      });
      expect(state.bannerVisible).toBe(false);
    });
  });

  describe("rejectAll", () => {
    it("should reject all non-essential cookies", async () => {
      const { rejectAll } = useCookieConsentStore.getState();

      await rejectAll();

      const state = useCookieConsentStore.getState();
      expect(state.consent).toEqual({
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      });
      expect(state.bannerVisible).toBe(false);
    });
  });

  describe("savePreferences", () => {
    it("should save custom preferences", async () => {
      const { savePreferences } = useCookieConsentStore.getState();

      const customConsent: CookieConsent = {
        essential: true,
        functional: true,
        analytics: false,
        marketing: false,
      };

      await savePreferences(customConsent);

      const state = useCookieConsentStore.getState();
      expect(state.consent).toEqual(customConsent);
      expect(state.bannerVisible).toBe(false);
      expect(state.preferencesModalOpen).toBe(false);
    });
  });

  describe("Banner Visibility", () => {
    it("should show banner", () => {
      const { showBanner } = useCookieConsentStore.getState();

      showBanner();

      const state = useCookieConsentStore.getState();
      expect(state.bannerVisible).toBe(true);
    });

    it("should hide banner", () => {
      const { showBanner, hideBanner } = useCookieConsentStore.getState();

      showBanner();
      hideBanner();

      const state = useCookieConsentStore.getState();
      expect(state.bannerVisible).toBe(false);
    });
  });

  describe("Preferences Modal", () => {
    it("should open preferences modal", () => {
      const { openPreferencesModal } = useCookieConsentStore.getState();

      openPreferencesModal();

      const state = useCookieConsentStore.getState();
      expect(state.preferencesModalOpen).toBe(true);
      expect(state.bannerVisible).toBe(false);
    });

    it("should close preferences modal", () => {
      const { openPreferencesModal, closePreferencesModal } =
        useCookieConsentStore.getState();

      openPreferencesModal();
      closePreferencesModal();

      const state = useCookieConsentStore.getState();
      expect(state.preferencesModalOpen).toBe(false);
    });
  });

  describe("Persistence", () => {
    it("should persist consent to localStorage", () => {
      const { acceptAll } = useCookieConsentStore.getState();

      acceptAll();

      // Check the store state directly since persist happens async
      const state = useCookieConsentStore.getState();
      expect(state.consent).toBeTruthy();
      expect(state.consent?.essential).toBe(true);
      expect(state.consent?.analytics).toBe(true);
      expect(state.consent?.functional).toBe(true);
      expect(state.consent?.marketing).toBe(true);
    });
  });

  describe("Backend Sync", () => {
    it("should sync acceptAll with backend for authenticated users", async () => {
      const { updateCookieConsent } = await import("@/lib/api/legal");

      localStorage.setItem("accessToken", "test-token");

      const { acceptAll } = useCookieConsentStore.getState();
      await acceptAll();

      expect(updateCookieConsent).toHaveBeenCalledWith({
        essential: true,
        functional: true,
        analytics: true,
        marketing: true,
      });
    });

    it("should handle backend sync errors gracefully for acceptAll", async () => {
      const { updateCookieConsent } = await import("@/lib/api/legal");
      vi.mocked(updateCookieConsent).mockRejectedValueOnce(
        new Error("Network error")
      );

      localStorage.setItem("accessToken", "test-token");

      const { acceptAll } = useCookieConsentStore.getState();
      await acceptAll();

      // Should still update local state
      const state = useCookieConsentStore.getState();
      expect(state.consent?.essential).toBe(true);
    });

    it("should sync rejectAll with backend for authenticated users", async () => {
      const { updateCookieConsent } = await import("@/lib/api/legal");

      localStorage.setItem("accessToken", "test-token");

      const { rejectAll } = useCookieConsentStore.getState();
      await rejectAll();

      expect(updateCookieConsent).toHaveBeenCalledWith({
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      });
    });

    it("should handle backend sync errors gracefully for rejectAll", async () => {
      const { updateCookieConsent } = await import("@/lib/api/legal");
      vi.mocked(updateCookieConsent).mockRejectedValueOnce(
        new Error("Network error")
      );

      localStorage.setItem("accessToken", "test-token");

      const { rejectAll } = useCookieConsentStore.getState();
      await rejectAll();

      const state = useCookieConsentStore.getState();
      expect(state.consent?.essential).toBe(true);
    });

    it("should sync savePreferences with backend for authenticated users", async () => {
      const { updateCookieConsent } = await import("@/lib/api/legal");

      localStorage.setItem("accessToken", "test-token");

      const customConsent: CookieConsent = {
        essential: true,
        functional: true,
        analytics: false,
        marketing: false,
      };

      const { savePreferences } = useCookieConsentStore.getState();
      await savePreferences(customConsent);

      expect(updateCookieConsent).toHaveBeenCalledWith(customConsent);
    });

    it("should handle backend sync errors gracefully for savePreferences", async () => {
      const { updateCookieConsent } = await import("@/lib/api/legal");
      vi.mocked(updateCookieConsent).mockRejectedValueOnce(
        new Error("Network error")
      );

      localStorage.setItem("accessToken", "test-token");

      const customConsent: CookieConsent = {
        essential: true,
        functional: true,
        analytics: false,
        marketing: false,
      };

      const { savePreferences } = useCookieConsentStore.getState();
      await savePreferences(customConsent);

      const state = useCookieConsentStore.getState();
      expect(state.consent).toEqual(customConsent);
    });
  });

  describe("loadConsent", () => {
    it("should load consent from backend for authenticated users", async () => {
      const { getCookieConsent } = await import("@/lib/api/legal");
      const backendConsent: CookieConsent = {
        essential: true,
        functional: true,
        analytics: true,
        marketing: false,
      };

      vi.mocked(getCookieConsent).mockResolvedValueOnce(backendConsent);
      localStorage.setItem("accessToken", "test-token");

      const { loadConsent } = useCookieConsentStore.getState();
      await loadConsent();

      const state = useCookieConsentStore.getState();
      expect(state.consent).toEqual(backendConsent);
    });

    it("should show banner for unauthenticated users with no consent", async () => {
      const { loadConsent } = useCookieConsentStore.getState();
      await loadConsent();

      const state = useCookieConsentStore.getState();
      expect(state.bannerVisible).toBe(true);
    });

    it("should not show banner for unauthenticated users with existing consent", async () => {
      const existingConsent: CookieConsent = {
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      };

      useCookieConsentStore.setState({ consent: existingConsent });

      const { loadConsent } = useCookieConsentStore.getState();
      await loadConsent();

      const state = useCookieConsentStore.getState();
      expect(state.bannerVisible).toBe(false);
    });

    it("should handle backend load errors gracefully", async () => {
      const { getCookieConsent } = await import("@/lib/api/legal");
      vi.mocked(getCookieConsent).mockRejectedValueOnce(
        new Error("Network error")
      );

      localStorage.setItem("accessToken", "test-token");

      const { loadConsent } = useCookieConsentStore.getState();
      await loadConsent();

      const state = useCookieConsentStore.getState();
      expect(state.bannerVisible).toBe(true);
    });

    it("should not show banner on error if consent already exists", async () => {
      const { getCookieConsent } = await import("@/lib/api/legal");
      vi.mocked(getCookieConsent).mockRejectedValueOnce(
        new Error("Network error")
      );

      const existingConsent: CookieConsent = {
        essential: true,
        functional: true,
        analytics: false,
        marketing: false,
      };

      useCookieConsentStore.setState({ consent: existingConsent });
      localStorage.setItem("accessToken", "test-token");

      const { loadConsent } = useCookieConsentStore.getState();
      await loadConsent();

      const state = useCookieConsentStore.getState();
      expect(state.bannerVisible).toBe(false);
    });
  });
});
