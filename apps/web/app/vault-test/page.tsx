"use client";

// Manual integration harness for the G3MXVault contract.
//
//   /vault-test  →  connect wallet → approve USDC → createOrder → confirmOrder → withdraw
//
// Not a production surface; lives outside the main app nav. Delete or move
// behind a feature flag before shipping. Every action shows the resulting
// tx hash + Basescan link so you can audit every step on-chain.

import { useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  formatUnits,
  isAddress,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import {
  G3MX_VAULT_ABI,
  VAULT_ADDRESS,
  orderStatusLabel,
  useNextOrderId,
  useVaultBalance,
  useVaultFeeBalance,
  useVaultOrder,
  useVaultWrite,
} from "@/lib/contracts/vault";
import {
  erc20Abi,
  USDC_ADDRESS,
  USDC_DEFAULT_DECIMALS,
  useUsdcAllowance,
  useUsdcBalance,
  useUsdcDecimals,
  useUsdcWrite,
} from "@/lib/contracts/usdc";

// ─── Helpers ─────────────────────────────────────────────────────────────

const PLACEHOLDER_ADDRESS = "0x" as Address;

function explorerTxUrl(chainId: number, hash: Hex): string {
  const base =
    chainId === 84532
      ? "https://sepolia.basescan.org"
      : chainId === 8453
        ? "https://basescan.org"
        : "https://sepolia.basescan.org";
  return `${base}/tx/${hash}`;
}

function fmt(value: bigint | undefined, decimals: number): string {
  if (value === undefined) return "—";
  return formatUnits(value, decimals);
}

function parseAmount(
  input: string,
  decimals: number,
): { ok: true; value: bigint } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Amount required" };
  try {
    return { ok: true, value: parseUnits(trimmed, decimals) };
  } catch {
    return { ok: false, error: "Invalid amount" };
  }
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function VaultTestPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const decimalsRead = useUsdcDecimals();
  const decimals = decimalsRead.data ?? USDC_DEFAULT_DECIMALS;

  const usdcBalance = useUsdcBalance(address);
  const allowance = useUsdcAllowance(address, VAULT_ADDRESS);
  const vaultBalance = useVaultBalance(address);
  const feeBalance = useVaultFeeBalance();
  const nextOrderId = useNextOrderId();

  const envWarning = useMemo(() => {
    if (VAULT_ADDRESS === PLACEHOLDER_ADDRESS) {
      return "NEXT_PUBLIC_VAULT_ADDRESS is not set. Deploy the contract and add it to .env.local before any write succeeds.";
    }
    return null;
  }, []);

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-zinc-100">
        <h1 className="text-2xl font-semibold">Vault test harness</h1>
        <p className="mt-4 text-zinc-400">
          Connect a wallet on Base Sepolia (chainId 84532) to use this page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-zinc-100 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">G3MXVault — test harness</h1>
        <p className="text-sm text-zinc-400">
          Connected: <code>{address}</code> · chainId <code>{chainId}</code>
        </p>
        <p className="text-xs text-zinc-500">
          Vault: <code>{VAULT_ADDRESS}</code> · USDC: <code>{USDC_ADDRESS}</code>
        </p>
        {envWarning && (
          <p className="mt-2 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            ⚠ {envWarning}
          </p>
        )}
      </header>

      <BalancesPanel
        usdc={usdcBalance.data}
        allowance={allowance.data}
        vault={vaultBalance.data}
        fees={feeBalance.data}
        nextId={nextOrderId.data}
        decimals={decimals}
      />

      <ApproveCard
        chainId={chainId}
        decimals={decimals}
        onSuccess={() => allowance.refetch()}
      />
      <CreateOrderCard
        chainId={chainId}
        decimals={decimals}
        onSuccess={() => {
          usdcBalance.refetch();
          allowance.refetch();
          nextOrderId.refetch();
        }}
      />
      <ConfirmOrderCard
        chainId={chainId}
        onSuccess={() => vaultBalance.refetch()}
      />
      <WithdrawCard
        chainId={chainId}
        decimals={decimals}
        onSuccess={() => {
          vaultBalance.refetch();
          usdcBalance.refetch();
        }}
      />
      <OrderLookupCard decimals={decimals} />
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function BalancesPanel({
  usdc,
  allowance,
  vault,
  fees,
  nextId,
  decimals,
}: {
  usdc: bigint | undefined;
  allowance: bigint | undefined;
  vault: bigint | undefined;
  fees: bigint | undefined;
  nextId: bigint | undefined;
  decimals: number;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
        Live balances
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Your USDC" value={`${fmt(usdc, decimals)} USDC`} />
        <Stat
          label="Allowance → vault"
          value={`${fmt(allowance, decimals)} USDC`}
        />
        <Stat
          label="Your vault credit"
          value={`${fmt(vault, decimals)} USDC`}
        />
        <Stat label="Vault fee pool" value={`${fmt(fees, decimals)} USDC`} />
        <Stat label="Next order id" value={nextId?.toString() ?? "—"} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="font-mono text-zinc-100">{value}</dd>
    </div>
  );
}

function ApproveCard({
  chainId,
  decimals,
  onSuccess,
}: {
  chainId: number;
  decimals: number;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("100");
  const { writeContract, data: hash, isPending, error } = useUsdcWrite();
  const receipt = useWaitForTransactionReceipt({ hash });
  const [localError, setLocalError] = useState<string | null>(null);

  function handle() {
    setLocalError(null);
    const parsed = parseAmount(amount, decimals);
    if (!parsed.ok) {
      setLocalError(parsed.error);
      return;
    }
    writeContract(
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [VAULT_ADDRESS, parsed.value],
      },
      { onSuccess: () => onSuccess() },
    );
  }

  return (
    <ActionCard
      step={1}
      title="Approve USDC to vault"
      hint="Lets the vault pull USDC from your wallet when you createOrder."
      chainId={chainId}
      hash={hash}
      pending={isPending || receipt.isLoading}
      error={localError ?? error?.message ?? null}
    >
      <NumberInput
        label="Amount (USDC)"
        value={amount}
        onChange={setAmount}
      />
      <SubmitButton onClick={handle} pending={isPending || receipt.isLoading}>
        Approve
      </SubmitButton>
    </ActionCard>
  );
}

function CreateOrderCard({
  chainId,
  decimals,
  onSuccess,
}: {
  chainId: number;
  decimals: number;
  onSuccess: () => void;
}) {
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("10");
  const { writeContract, data: hash, isPending, error } = useVaultWrite();
  const receipt = useWaitForTransactionReceipt({ hash });
  const [localError, setLocalError] = useState<string | null>(null);

  function handle() {
    setLocalError(null);
    if (!isAddress(seller)) {
      setLocalError("Seller must be a valid 0x address");
      return;
    }
    const parsed = parseAmount(amount, decimals);
    if (!parsed.ok) {
      setLocalError(parsed.error);
      return;
    }
    writeContract(
      {
        address: VAULT_ADDRESS,
        abi: G3MX_VAULT_ABI,
        functionName: "createOrder",
        args: [seller as Address, parsed.value],
      },
      { onSuccess: () => onSuccess() },
    );
  }

  return (
    <ActionCard
      step={2}
      title="Create order"
      hint="Locks funds in escrow. 1% deposit fee is taken to the fee pool."
      chainId={chainId}
      hash={hash}
      pending={isPending || receipt.isLoading}
      error={localError ?? error?.message ?? null}
    >
      <TextInput
        label="Seller address"
        value={seller}
        onChange={setSeller}
        placeholder="0x…"
      />
      <NumberInput
        label="Amount (USDC)"
        value={amount}
        onChange={setAmount}
      />
      <SubmitButton onClick={handle} pending={isPending || receipt.isLoading}>
        createOrder
      </SubmitButton>
    </ActionCard>
  );
}

function ConfirmOrderCard({
  chainId,
  onSuccess,
}: {
  chainId: number;
  onSuccess: () => void;
}) {
  const [orderId, setOrderId] = useState("1");
  const { writeContract, data: hash, isPending, error } = useVaultWrite();
  const receipt = useWaitForTransactionReceipt({ hash });
  const [localError, setLocalError] = useState<string | null>(null);

  function handle() {
    setLocalError(null);
    let id: bigint;
    try {
      id = BigInt(orderId);
    } catch {
      setLocalError("Order id must be an integer");
      return;
    }
    writeContract(
      {
        address: VAULT_ADDRESS,
        abi: G3MX_VAULT_ABI,
        functionName: "confirmOrder",
        args: [id],
      },
      { onSuccess: () => onSuccess() },
    );
  }

  return (
    <ActionCard
      step={3}
      title="Confirm order (buyer)"
      hint="Buyer releases escrow. 1% pay fee taken; seller is credited internally."
      chainId={chainId}
      hash={hash}
      pending={isPending || receipt.isLoading}
      error={localError ?? error?.message ?? null}
    >
      <NumberInput label="Order id" value={orderId} onChange={setOrderId} />
      <SubmitButton onClick={handle} pending={isPending || receipt.isLoading}>
        confirmOrder
      </SubmitButton>
    </ActionCard>
  );
}

function WithdrawCard({
  chainId,
  decimals,
  onSuccess,
}: {
  chainId: number;
  decimals: number;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("1");
  const { writeContract, data: hash, isPending, error } = useVaultWrite();
  const receipt = useWaitForTransactionReceipt({ hash });
  const [localError, setLocalError] = useState<string | null>(null);

  function handle() {
    setLocalError(null);
    const parsed = parseAmount(amount, decimals);
    if (!parsed.ok) {
      setLocalError(parsed.error);
      return;
    }
    writeContract(
      {
        address: VAULT_ADDRESS,
        abi: G3MX_VAULT_ABI,
        functionName: "withdraw",
        args: [parsed.value],
      },
      { onSuccess: () => onSuccess() },
    );
  }

  return (
    <ActionCard
      step={4}
      title="Withdraw (seller)"
      hint="Pulls your internal vault credit out to your wallet. 1% withdraw fee."
      chainId={chainId}
      hash={hash}
      pending={isPending || receipt.isLoading}
      error={localError ?? error?.message ?? null}
    >
      <NumberInput
        label="Amount (USDC)"
        value={amount}
        onChange={setAmount}
      />
      <SubmitButton onClick={handle} pending={isPending || receipt.isLoading}>
        withdraw
      </SubmitButton>
    </ActionCard>
  );
}

function OrderLookupCard({ decimals }: { decimals: number }) {
  const [input, setInput] = useState("1");
  const [queryId, setQueryId] = useState<bigint | undefined>(1n);
  const order = useVaultOrder(queryId);

  function handle() {
    try {
      setQueryId(BigInt(input));
    } catch {
      setQueryId(undefined);
    }
  }

  // wagmi returns the tuple as a positional array on read.
  const [
    buyer,
    seller,
    amount,
    depositFee,
    status,
    createdAt,
  ] = order.data ?? [];

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
        Lookup order
      </h2>
      <div className="flex items-end gap-3">
        <NumberInput label="Order id" value={input} onChange={setInput} />
        <SubmitButton onClick={handle} pending={order.isFetching}>
          Load
        </SubmitButton>
      </div>
      {order.data && (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Buyer" value={buyer ?? "—"} />
          <Stat label="Seller" value={seller ?? "—"} />
          <Stat
            label="Locked amount"
            value={`${fmt(amount, decimals)} USDC`}
          />
          <Stat
            label="Deposit fee"
            value={`${fmt(depositFee, decimals)} USDC`}
          />
          <Stat label="Status" value={orderStatusLabel(status ?? 0)} />
          <Stat
            label="Created at"
            value={
              createdAt
                ? new Date(Number(createdAt) * 1000).toISOString()
                : "—"
            }
          />
        </dl>
      )}
    </section>
  );
}

// ─── Primitive UI ────────────────────────────────────────────────────────

function ActionCard({
  step,
  title,
  hint,
  chainId,
  hash,
  pending,
  error,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  chainId: number;
  hash: Hex | undefined;
  pending: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-100">
          <span className="mr-2 text-zinc-500">Step {step}</span>
          {title}
        </h2>
      </div>
      <p className="text-xs text-zinc-500">{hint}</p>
      <div className="flex flex-wrap items-end gap-3">{children}</div>
      {pending && (
        <p className="text-xs text-amber-300">Submitting transaction…</p>
      )}
      {hash && (
        <p className="text-xs text-zinc-400">
          tx:{" "}
          <a
            href={explorerTxUrl(chainId, hash)}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 underline"
          >
            {hash.slice(0, 10)}…{hash.slice(-8)}
          </a>
        </p>
      )}
      {error && (
        <pre className="overflow-x-auto rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {error}
        </pre>
      )}
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-400">
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-40 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
      />
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-400">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-96 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
      />
    </label>
  );
}

function SubmitButton({
  onClick,
  pending,
  children,
}: {
  onClick: () => void;
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded bg-cyan-500 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
    >
      {pending ? "…" : children}
    </button>
  );
}
