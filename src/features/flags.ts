import { FEATURE_FLAGS, type Environment, type FeatureName } from "./flags.config";

/**
 * Get current environment from PUBLIC_ENV_NAME (client-side) or ENV_NAME (server-side)
 * Returns null if not set, which disables features
 */
function getCurrentEnvironment(): Environment | null {
  // Try PUBLIC_ENV_NAME first (available both server and client-side)
  // Fall back to ENV_NAME (server-side only)
  const envName = import.meta.env.PUBLIC_ENV_NAME || import.meta.env.ENV_NAME;

  if (!envName || !["local", "integration", "prod"].includes(envName)) {
    console.warn(`Invalid ENV_NAME: ${envName}, returning null to disable features`);
    return null;
  }
  return envName as Environment;
}

/**
 * Check if a feature is enabled in the current environment
 * @param featureName - Name of the feature to check
 * @returns boolean - true if feature is enabled, false otherwise (default: false)
 */
export function isFeatureEnabled(featureName: FeatureName): boolean {
  const environment = getCurrentEnvironment();

  if (!environment) {
    // Invalid environment - disable all features for safety
    return false;
  }

  const envConfig = FEATURE_FLAGS[environment];

  if (!envConfig) {
    console.warn(`No configuration found for environment: ${environment}`);
    return false;
  }

  return envConfig[featureName] ?? false;
}

/**
 * Get all enabled features for current environment
 */
export function getEnabledFeatures(): FeatureName[] {
  const environment = getCurrentEnvironment();

  if (!environment) {
    // Invalid environment - return empty array
    return [];
  }

  const envConfig = FEATURE_FLAGS[environment];

  if (!envConfig) {
    return [];
  }

  return Object.entries(envConfig)
    .filter(([, enabled]) => enabled)
    .map(([featureName]) => featureName as FeatureName);
}

/**
 * Check multiple features at once
 */
export function areAllFeaturesEnabled(...features: FeatureName[]): boolean {
  return features.every((feature) => isFeatureEnabled(feature));
}

/**
 * Check if any of the features is enabled
 */
export function isAnyFeatureEnabled(...features: FeatureName[]): boolean {
  return features.some((feature) => isFeatureEnabled(feature));
}
