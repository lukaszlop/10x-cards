export type Environment = "local" | "integration" | "prod";
export type FeatureName = "auth" | "collections";

export type FeatureConfig = Record<string, boolean>;

export type EnvironmentConfig = Record<string, FeatureConfig>;

export const FEATURE_FLAGS: EnvironmentConfig = {
  local: {
    auth: true,
    collections: true,
  },
  integration: {
    auth: true,
    collections: true,
  },
  prod: {
    auth: true,
    collections: true,
  },
};
