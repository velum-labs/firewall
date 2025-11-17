/**
 * Environment-based configuration for the firewall engine
 */
export type EngineConfig = {
  modelName: string;
  judgeModelName: string;
  tokenSecret: string;
  predicatesEnabled: boolean;
};

function parseBooleanEnv(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/**
 * Resolve engine configuration from environment variables.
 * 
 * @throws Error if required environment variables are missing
 * @returns Resolved engine configuration
 */
export function resolveEngineConfig(): EngineConfig {
  return {
    modelName: process.env.FIREWALL_MODEL ?? "gpt-4o",
    judgeModelName: process.env.FIREWALL_JUDGE_MODEL ?? "gpt-4o",
    tokenSecret: process.env.FIREWALL_TOKEN_SECRET ?? "e2e-test-secret",
    predicatesEnabled: parseBooleanEnv(process.env.FIREWALL_PREDICATES_ENABLED, false),
  };
}

