import hre from "hardhat";
import { isAddress } from "viem";

/**
 * Deploy G3MXVault to the network specified via `--network`.
 *
 * Usage:
 *   pnpm deploy:sepolia        # Base Sepolia (uses VAULT_TOKEN_ADDRESS from .env)
 *   pnpm deploy:base           # Base mainnet
 *
 * Required env vars:
 *   DEPLOYER_PRIVATE_KEY   — funded wallet for the target chain
 *   VAULT_TOKEN_ADDRESS    — ERC20 the vault escrows (USDC on Base, USDT on BSC)
 */
async function main() {
  const tokenAddress = process.env.VAULT_TOKEN_ADDRESS;
  if (!tokenAddress || !isAddress(tokenAddress)) {
    throw new Error(
      "VAULT_TOKEN_ADDRESS env var must be a valid 0x address. " +
        "Set it in packages/contracts/.env",
    );
  }

  const networkName = hre.network.name;
  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();

  console.log(`\n• Network:        ${networkName}`);
  console.log(`• Chain ID:       ${publicClient.chain.id}`);
  console.log(`• Deployer:       ${deployer.account.address}`);
  console.log(`• Token (escrow): ${tokenAddress}\n`);

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(`• Deployer balance: ${balance} wei`);
  if (balance === 0n) {
    throw new Error(
      "Deployer has zero native gas. Top up before deploying.",
    );
  }

  console.log("\nDeploying G3MXVault…");
  const vault = await hre.viem.deployContract("G3MXVault", [tokenAddress]);
  console.log(`\n✓ G3MXVault deployed at ${vault.address}`);

  const explorerBase =
    networkName === "baseSepolia"
      ? "https://sepolia.basescan.org"
      : networkName === "base"
        ? "https://basescan.org"
        : null;

  if (explorerBase) {
    console.log(`  Explorer: ${explorerBase}/address/${vault.address}`);
  }

  console.log("\nNext steps:");
  console.log(`  1. Add to apps/web env: NEXT_PUBLIC_VAULT_ADDRESS=${vault.address}`);
  console.log(`  2. Verify source on Basescan:`);
  console.log(
    `       pnpm verify:${networkName === "base" ? "base" : "sepolia"} ${vault.address} ${tokenAddress}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
