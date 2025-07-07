import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { areAllFeaturesEnabled, getEnabledFeatures, isAnyFeatureEnabled, isFeatureEnabled } from "./flags";
import type { FeatureName } from "./flags.config";

describe("Feature Flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isFeatureEnabled", () => {
    it("should return true for enabled features in local environment", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "local");
      expect(isFeatureEnabled("auth")).toBe(true);
      expect(isFeatureEnabled("collections")).toBe(true);
    });

    it("should return true for enabled features in production environment", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "prod");
      expect(isFeatureEnabled("auth")).toBe(true);
      expect(isFeatureEnabled("collections")).toBe(true);
    });

    it("should return true for enabled features in integration environment", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "integration");
      expect(isFeatureEnabled("auth")).toBe(true);
      expect(isFeatureEnabled("collections")).toBe(true);
    });

    it("should default to false for unknown features", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "local");
      expect(isFeatureEnabled("unknown" as FeatureName)).toBe(false);
    });

    it("should return false for ALL features when PUBLIC_ENV_NAME is invalid (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "invalid");
      expect(isFeatureEnabled("auth")).toBe(false);
      expect(isFeatureEnabled("collections")).toBe(false);
    });

    it("should return false for ALL features when PUBLIC_ENV_NAME is undefined (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", undefined);
      expect(isFeatureEnabled("auth")).toBe(false);
      expect(isFeatureEnabled("collections")).toBe(false);
    });

    it("should return false for ALL features when PUBLIC_ENV_NAME is empty string (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "");
      expect(isFeatureEnabled("auth")).toBe(false);
      expect(isFeatureEnabled("collections")).toBe(false);
    });

    it("should fallback to ENV_NAME when PUBLIC_ENV_NAME is not set (server-side compatibility)", () => {
      vi.stubEnv("ENV_NAME", "local");
      expect(isFeatureEnabled("auth")).toBe(true);
      expect(isFeatureEnabled("collections")).toBe(true);
    });
  });

  describe("getEnabledFeatures", () => {
    it("should return all features for local environment", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "local");
      const enabled = getEnabledFeatures();
      expect(enabled).toContain("auth");
      expect(enabled).toContain("collections");
      expect(enabled).toHaveLength(2);
    });

    it("should return all features for integration environment", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "integration");
      const enabled = getEnabledFeatures();
      expect(enabled).toContain("auth");
      expect(enabled).toContain("collections");
      expect(enabled).toHaveLength(2);
    });

    it("should return all features for production environment", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "prod");
      const enabled = getEnabledFeatures();
      expect(enabled).toContain("auth");
      expect(enabled).toContain("collections");
      expect(enabled).toHaveLength(2);
    });

    it("should return empty array for invalid environment (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "invalid");
      const enabled = getEnabledFeatures();
      expect(enabled).toHaveLength(0);
    });

    it("should return empty array when PUBLIC_ENV_NAME is undefined (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", undefined);
      const enabled = getEnabledFeatures();
      expect(enabled).toHaveLength(0);
    });
  });

  describe("areAllFeaturesEnabled", () => {
    it("should return true when all features are enabled", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "local");
      expect(areAllFeaturesEnabled("auth", "collections")).toBe(true);
    });

    it("should return false when environment is invalid (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "invalid");
      expect(areAllFeaturesEnabled("auth", "collections")).toBe(false);
    });

    it("should return false when PUBLIC_ENV_NAME is undefined (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", undefined);
      expect(areAllFeaturesEnabled("auth", "collections")).toBe(false);
    });
  });

  describe("isAnyFeatureEnabled", () => {
    it("should return true when at least one feature is enabled", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "local");
      expect(isAnyFeatureEnabled("auth", "collections")).toBe(true);
    });

    it("should return false when environment is invalid (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", "invalid");
      expect(isAnyFeatureEnabled("auth", "collections")).toBe(false);
    });

    it("should return false when PUBLIC_ENV_NAME is undefined (security)", () => {
      vi.stubEnv("PUBLIC_ENV_NAME", undefined);
      expect(isAnyFeatureEnabled("auth", "collections")).toBe(false);
    });
  });
});
