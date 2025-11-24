import { getCookieConsent, updateCookieConsent } from "@/lib/api/legal";
import { logger } from "@/lib/logger";
import { CookieConsent } from "@/types/legal";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CookieConsentState {
  // Cookie consent preferences
  consent: CookieConsent | null;

  // UI state
  bannerVisible: boolean;
  preferencesModalOpen: boolean;

  // Actions
  setConsent: (consent: CookieConsent) => void;
  acceptAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
  savePreferences: (consent: CookieConsent) => Promise<void>;
  loadConsent: () => Promise<void>;
  showBanner: () => void;
  hideBanner: () => void;
  openPreferencesModal: () => void;
  closePreferencesModal: () => void;
}

/**
 * Cookie Consent Store
 *
 * Manages cookie consent preferences with:
 * - Local storage persistence
 * - Backend synchronization for authenticated users
 * - Banner and preferences modal state
 * - Accept All/Reject All shortcuts
 */
export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set, get) => ({
      consent: null,
      bannerVisible: false,
      preferencesModalOpen: false,

      setConsent: (consent) => {
        set({ consent });
        logger.info("Cookie consent updated", { consent });
      },

      acceptAll: async () => {
        const consent: CookieConsent = {
          essential: true,
          functional: true,
          analytics: true,
          marketing: true,
        };

        set({ consent, bannerVisible: false });
        logger.info("User accepted all cookies");

        // Sync with backend if user is authenticated
        try {
          const token = localStorage.getItem("accessToken");
          if (token) {
            await updateCookieConsent(consent);
            logger.info("Cookie consent synced with backend");
          }
        } catch (error) {
          logger.error("Failed to sync cookie consent with backend", error);
        }
      },

      rejectAll: async () => {
        const consent: CookieConsent = {
          essential: true, // Essential cookies cannot be rejected
          functional: false,
          analytics: false,
          marketing: false,
        };

        set({ consent, bannerVisible: false });
        logger.info("User rejected non-essential cookies");

        // Sync with backend if user is authenticated
        try {
          const token = localStorage.getItem("accessToken");
          if (token) {
            await updateCookieConsent(consent);
            logger.info("Cookie consent synced with backend");
          }
        } catch (error) {
          logger.error("Failed to sync cookie consent with backend", error);
        }
      },

      savePreferences: async (consent) => {
        set({ consent, preferencesModalOpen: false, bannerVisible: false });
        logger.info("User saved cookie preferences", { consent });

        // Sync with backend if user is authenticated
        try {
          const token = localStorage.getItem("accessToken");
          if (token) {
            await updateCookieConsent(consent);
            logger.info("Cookie consent synced with backend");
          }
        } catch (error) {
          logger.error("Failed to sync cookie consent with backend", error);
        }
      },

      loadConsent: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          if (token) {
            // Load from backend for authenticated users
            const consent = await getCookieConsent();
            set({ consent });
            logger.info("Cookie consent loaded from backend", { consent });
          } else {
            // For non-authenticated users, check if they need to see the banner
            const { consent } = get();
            if (!consent) {
              set({ bannerVisible: true });
              logger.info(
                "Showing cookie consent banner (no previous consent)",
              );
            }
          }
        } catch (error) {
          logger.error("Failed to load cookie consent from backend", error);
          // Show banner if consent is not in localStorage
          const { consent } = get();
          if (!consent) {
            set({ bannerVisible: true });
          }
        }
      },

      showBanner: () => set({ bannerVisible: true }),
      hideBanner: () => set({ bannerVisible: false }),
      openPreferencesModal: () =>
        set({ preferencesModalOpen: true, bannerVisible: false }),
      closePreferencesModal: () => set({ preferencesModalOpen: false }),
    }),
    {
      name: "cookie-consent",
      partialize: (state) => ({ consent: state.consent }),
    },
  ),
);
