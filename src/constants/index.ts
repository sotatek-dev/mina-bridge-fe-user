export const IsServer = typeof window === undefined;

export function getEnvNetwork(env: string) {
  const envs = ['development', 'testing', 'production'];
  const networks = ['Devnet', 'Devnet', 'Mainnet'];

  const index = envs.indexOf(env);
  return index !== -1 ? networks[index] : 'Unknown';
}
