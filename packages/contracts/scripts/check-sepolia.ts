// One-shot Base Sepolia readiness check. Answers:
//   1. Can we reach the RPC?
//   2. Does the deployer wallet have gas?
//   3. Does the deployer wallet have USDC for escrow testing?
//   4. If VAULT_ADDRESS is set, is the deployed vault live and correctly wired?
//
// Run:
//   pnpm --filter @g3mx/contracts check:sepolia
//   VAULT_ADDRESS=0x... pnpm --filter @g3mx/contracts check:sepolia
//
// Exits 0 even when checks fail — this is a *report*, not a gate. Read the
// ✓/✗/⚠ markers in the output.

import hre from "hardhat";
import { formatEther, formatUnits, getAddress, isAddress } from "viem";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const ERC20_READ_ABI = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const VAULT_READ_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "token",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "depositFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "payFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "withdrawFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "feeBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "nextOrderId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

function bpsAsPercent(bps: bigint): string {
  return `${Number(bps) / 100}%`;
}

async function checkRpc() {
  const publicClient = await hre.viem.getPublicClient();
  const chain = publicClient.chain;
  const blockNumber = await publicClient.getBlockNumber();
  console.log(`\n[1/4] RPC reachability`);
  console.log(`  ✓ network:      ${hre.network.name}`);
  console.log(`  ✓ chainId:      ${chain.id} (Base Sepolia is 84532)`);
  console.log(`  ✓ latest block: ${blockNumber}`);
  return { publicClient };
}

async function checkDeployerWallet(publicClient: Awaited<ReturnType<typeof hre.viem.getPublicClient>>) {
  console.log(`\n[2/4] Deployer wallet`);
  const wallets = await hre.viem.getWalletClients();
  if (wallets.length === 0) {
    console.log("  ⚠ DEPLOYER_PRIVATE_KEY missing from packages/contracts/.env");
    console.log("  ↳ Add it to deploy and to receive escrow events.");
    return null;
  }
  const deployer = wallets[0];
  const addr = deployer.account.address;
  const ethBalance = await publicClient.getBalance({ address: addr });
  const hasGas = ethBalance > 0n;
  console.log(`  • address:   ${addr}`);
  console.log(
    `  ${hasGas ? "✓" : "✗"} ETH gas:   ${formatEther(ethBalance)} ETH${
      hasGas ? "" : "  ← top up: https://www.alchemy.com/faucets/base-sepolia"
    }`,
  );
  return { addr, hasGas };
}

async function checkUsdcBalance(
  publicClient: Awaited<ReturnType<typeof hre.viem.getPublicClient>>,
  addr: `0x${string}`,
) {
  console.log(`\n[3/4] Test USDC (escrow token)`);
  try {
    const usdcAddr = getAddress(USDC_BASE_SEPOLIA);
    const [symbol, decimals, balance] = await Promise.all([
      publicClient.readContract({
        address: usdcAddr,
        abi: ERC20_READ_ABI,
        functionName: "symbol",
      }),
      publicClient.readContract({
        address: usdcAddr,
        abi: ERC20_READ_ABI,
        functionName: "decimals",
      }),
      publicClient.readContract({
        address: usdcAddr,
        abi: ERC20_READ_ABI,
        functionName: "balanceOf",
        args: [addr],
      }),
    ]);
    const hasUsdc = balance > 0n;
    console.log(`  ✓ token:     ${symbol} @ ${usdcAddr}`);
    console.log(`  ✓ decimals:  ${decimals}`);
    console.log(
      `  ${hasUsdc ? "✓" : "✗"} balance:   ${formatUnits(balance, decimals)} ${symbol}${
        hasUsdc ? "" : "  ← top up: https://faucet.circle.com (pick Base Sepolia)"
      }`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ✗ USDC read failed: ${message}`);
  }
}

async function checkVault(publicClient: Awaited<ReturnType<typeof hre.viem.getPublicClient>>) {
  console.log(`\n[4/4] Deployed G3MXVault`);
  const vaultAddr =
    process.env.VAULT_ADDRESS ?? process.env.NEXT_PUBLIC_VAULT_ADDRESS;
  if (!vaultAddr) {
    console.log("  ⚠ VAULT_ADDRESS not set. Skipping.");
    console.log("  ↳ Deploy with:  pnpm --filter @g3mx/contracts deploy:sepolia");
    console.log("  ↳ Then re-run:  VAULT_ADDRESS=0x... pnpm --filter @g3mx/contracts check:sepolia");
    return;
  }
  if (!isAddress(vaultAddr)) {
    console.log(`  ✗ VAULT_ADDRESS is not a valid 0x address: ${vaultAddr}`);
    return;
  }
  const vault = getAddress(vaultAddr);
  console.log(`  • address:        ${vault}`);
  try {
    const [
      owner,
      token,
      depositBps,
      payBps,
      withdrawBps,
      feeBalance,
      nextOrderId,
    ] = await Promise.all([
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "owner" }),
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "token" }),
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "depositFeeBps" }),
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "payFeeBps" }),
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "withdrawFeeBps" }),
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "feeBalance" }),
      publicClient.readContract({ address: vault, abi: VAULT_READ_ABI, functionName: "nextOrderId" }),
    ]);
    console.log(`  ✓ owner:          ${owner}`);
    console.log(`  ✓ escrowed token: ${token}`);
    console.log(`  ✓ depositFee:     ${depositBps} bps (${bpsAsPercent(depositBps as bigint)})`);
    console.log(`  ✓ payFee:         ${payBps} bps (${bpsAsPercent(payBps as bigint)})`);
    console.log(`  ✓ withdrawFee:    ${withdrawBps} bps (${bpsAsPercent(withdrawBps as bigint)})`);
    console.log(`  ✓ feePool:        ${formatUnits(feeBalance as bigint, 6)} USDC`);
    console.log(`  ✓ nextOrderId:    ${nextOrderId}`);
    console.log(`  → Explorer:       https://sepolia.basescan.org/address/${vault}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ✗ Vault read failed: ${message}`);
    console.log(`  ↳ Likely: not deployed at this address, or you're on the wrong network.`);
  }
}

async function main() {
  console.log("───────────────────────────────────────────────");
  console.log(" G3MX — Base Sepolia readiness diagnostic");
  console.log("───────────────────────────────────────────────");

  const { publicClient } = await checkRpc();
  const wallet = await checkDeployerWallet(publicClient);
  if (wallet) {
    await checkUsdcBalance(publicClient, wallet.addr as `0x${string}`);
  } else {
    console.log("\n[3/4] Test USDC — skipped (no deployer wallet)");
  }
  await checkVault(publicClient);

  console.log("\nDone.\n");
}

main().catch((error) => {
  console.error("\n✗ Diagnostic crashed:");
  console.error(error);
  process.exitCode = 1;
});
