import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";

const deployerAccounts = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local in-process node — useful for unit tests, not deployment.
    hardhat: {
      chainId: 31337,
    },
    // Base Sepolia testnet — chainId 84532.
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
      chainId: 84532,
      accounts: deployerAccounts,
    },
    // Base mainnet — chainId 8453. Leave keys unset until Phase 2 mainnet ship.
    base: {
      url: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
      chainId: 8453,
      accounts: deployerAccounts,
    },
  },
  etherscan: {
    // Single key works for both basescan.org and sepolia.basescan.org.
    apiKey: {
      base: process.env.BASESCAN_API_KEY ?? "",
      baseSepolia: process.env.BASESCAN_API_KEY ?? "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};

export default config;
