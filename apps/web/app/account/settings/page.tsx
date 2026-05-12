"use client";

import {
  type ChangeEvent,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Copy,
  Globe,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  Twitter,
  User as UserIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { Button } from "@/components/ui/Button";
import { useAuth, type UnifiedUser } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const STORAGE = {
  picture: "g3mx_profile_picture",
  username: "g3mx_username",
  email: "g3mx_email_pref",
  phone: "g3mx_phone",
  locale: "g3mx_locale",
  mfa: "g3mx_mfa_enabled",
} as const;

const LOCALES: Array<{
  code: string;
  label: string;
  sub: string;
  badge: string;
}> = [
  { code: "en", label: "English", sub: "Default language", badge: "EN" },
  { code: "zh-CN", label: "中文 (简体)", sub: "Chinese — Simplified", badge: "简" },
  { code: "zh-TW", label: "中文 (繁體)", sub: "Chinese — Traditional", badge: "繁" },
];

const PICTURE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function AccountSettingsPage() {
  const { user, isReady, isAuthenticated, loginWithWallet } = useAuth();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <Link
          href="/boosts"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to marketplace
        </Link>

        <header className="space-y-3">
          <PixelBadge tone="cyan">
            <SettingsIcon className="size-3" /> Account
          </PixelBadge>
          <h1
            className="font-display font-black tracking-tight text-white"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            Settings
          </h1>
          <p className="text-white/75 max-w-2xl">
            Profile, identity, language, security, and connected accounts.
            Anything you change here persists locally — backend sync arrives
            with the next migration wave.
          </p>
        </header>

        {!isReady ? (
          <SkeletonState />
        ) : !isAuthenticated || !user ? (
          <ConnectGate onConnect={() => loginWithWallet().catch(() => undefined)} />
        ) : (
          <SettingsBody user={user} />
        )}
      </main>
      <Footer />
    </>
  );
}

// ─── Main body — only rendered when authenticated ──────────────────────

function SettingsBody({ user }: { user: UnifiedUser }) {
  const privyConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  return (
    <div className="space-y-6">
      <ProfileSection user={user} />
      <IdentitySection user={user} />
      <LanguageSection />
      <SecuritySection />
      {privyConfigured ? (
        <ConnectedAccountsSection />
      ) : (
        <ConnectedAccountsDisabledSection />
      )}
      <ReferralSection user={user} />
    </div>
  );
}

// ─── Profile (picture + username) ──────────────────────────────────────

function ProfileSection({ user }: { user: UnifiedUser }) {
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [savedField, setSavedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);

  // Load saved values
  useEffect(() => {
    try {
      setPictureUrl(localStorage.getItem(STORAGE.picture));
      setUsername(
        localStorage.getItem(STORAGE.username) ?? user.displayName ?? "",
      );
    } catch {
      // privacy mode — leave blank
    }
  }, [user.displayName]);

  function flash(field: string) {
    setSavedField(field);
    setTimeout(() => setSavedField((curr) => (curr === field ? null : curr)), 1500);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureError(null);

    if (!file.type.startsWith("image/")) {
      setPictureError("Please select an image file.");
      return;
    }
    if (file.size > PICTURE_MAX_BYTES) {
      setPictureError("Image must be under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      try {
        localStorage.setItem(STORAGE.picture, dataUrl);
        setPictureUrl(dataUrl);
        flash("picture");
      } catch {
        setPictureError("Could not save image — storage full.");
      }
    };
    reader.onerror = () => setPictureError("Could not read this image.");
    reader.readAsDataURL(file);
  }

  function clearPicture() {
    try {
      localStorage.removeItem(STORAGE.picture);
    } catch {
      // ignore
    }
    setPictureUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function saveUsername() {
    try {
      localStorage.setItem(STORAGE.username, username.trim());
      flash("username");
    } catch {
      // ignore
    }
  }

  const avatarFallback = (user.displayName ?? user.id).slice(0, 1).toUpperCase();

  return (
    <SettingsCard
      title="Profile"
      subtitle="How you show up across the marketplace"
      icon={UserIcon}
    >
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar + uploader */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="grid place-items-center size-20 rounded-2xl overflow-hidden border border-white/15 bg-[var(--color-bg-panel-elevated)]"
              style={
                !pictureUrl
                  ? {
                      background: `linear-gradient(135deg, hsl(${hash(user.id) % 360} 80% 55%), hsl(${(hash(user.id) + 60) % 360} 90% 60%))`,
                    }
                  : undefined
              }
            >
              {pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pictureUrl}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-3xl font-black text-white">
                  {avatarFallback}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
              id="profile-picture-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor="profile-picture-input"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-panel-elevated)]/70 text-xs font-semibold text-white hover:text-[var(--color-neon-cyan)] hover:border-[var(--color-neon-cyan)]/50 cursor-pointer transition-colors"
              >
                <Camera className="size-3.5" />
                {pictureUrl ? "Change picture" : "Upload picture"}
              </label>
              {pictureUrl && (
                <button
                  type="button"
                  onClick={clearPicture}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 cursor-pointer transition-colors"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              )}
              {savedField === "picture" && <SavedFlash />}
            </div>
            <p className="text-xs text-white/55 leading-relaxed max-w-xs">
              JPG, PNG, GIF, or WebP. Max 2 MB. Square images look best.
            </p>
            {pictureError && (
              <p className="text-xs text-[var(--color-danger)]">{pictureError}</p>
            )}
          </div>
        </div>

        {/* Username editor */}
        <div className="flex-1 w-full space-y-2">
          <Field
            id="settings-username"
            label="Display name"
            hint="Shown on your listings, reviews, and chat messages."
          >
            <input
              id="settings-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={32}
              placeholder="operative_001"
              className="settings-input"
            />
          </Field>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={saveUsername}>
              Save name
            </Button>
            {savedField === "username" && <SavedFlash />}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── Identity (email + phone) ──────────────────────────────────────────

function IdentitySection({ user }: { user: UnifiedUser }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedField, setSavedField] = useState<string | null>(null);

  useEffect(() => {
    try {
      setEmail(localStorage.getItem(STORAGE.email) ?? user.email ?? "");
      setPhone(localStorage.getItem(STORAGE.phone) ?? "");
    } catch {
      // ignore
    }
  }, [user.email]);

  function flash(field: string) {
    setSavedField(field);
    setTimeout(() => setSavedField((c) => (c === field ? null : c)), 1500);
  }

  function saveEmail() {
    try {
      localStorage.setItem(STORAGE.email, email.trim());
      flash("email");
    } catch {
      // ignore
    }
  }

  function savePhone() {
    try {
      localStorage.setItem(STORAGE.phone, phone.trim());
      flash("phone");
    } catch {
      // ignore
    }
  }

  const emailIsFromPrivy = Boolean(user.email && user.email === email);

  return (
    <SettingsCard
      title="Identity"
      subtitle="Email and phone for transactional notifications"
      icon={Mail}
    >
      <div className="space-y-4">
        {/* Email */}
        <Field
          id="settings-email"
          label="Email address"
          hint={
            emailIsFromPrivy
              ? "Synced from your Privy login. You can override the contact address."
              : "We'll use this for receipts and order updates."
          }
          icon={Mail}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="settings-input flex-1"
            />
            <Button size="sm" onClick={saveEmail}>
              Save email
            </Button>
            {savedField === "email" && <SavedFlash />}
          </div>
        </Field>

        {/* Phone */}
        <Field
          id="settings-phone"
          label="Phone number"
          hint="Optional. Used for 2-factor codes if you enable MFA."
          icon={Phone}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 0100"
              autoComplete="tel"
              className="settings-input flex-1"
            />
            <Button size="sm" onClick={savePhone}>
              Save phone
            </Button>
            {savedField === "phone" && <SavedFlash />}
          </div>
        </Field>
      </div>
    </SettingsCard>
  );
}

// ─── Language ──────────────────────────────────────────────────────────

function LanguageSection() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE.locale);
      if (stored) setLocale(stored);
    } catch {
      // ignore
    }
  }, []);

  function changeLocale(code: string) {
    setLocale(code);
    try {
      localStorage.setItem(STORAGE.locale, code);
      // Hint the browser; full i18n wiring picks this up later.
      document.documentElement.lang = code;
    } catch {
      // ignore
    }
  }

  return (
    <SettingsCard
      title="Language"
      subtitle="Choose your preferred language"
      icon={Globe}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {LOCALES.map((l) => {
          const active = locale === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLocale(l.code)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-left cursor-pointer",
                "border transition-[border-color,background-color,transform]",
                active
                  ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10"
                  : "border-white/10 bg-[var(--color-bg-panel-elevated)]/40 hover:border-white/30 hover:-translate-y-0.5",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid place-items-center size-10 rounded-lg font-display font-bold shrink-0",
                  active
                    ? "bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)]"
                    : "bg-[var(--color-bg-deep)] text-white/80",
                )}
              >
                {l.badge}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{l.label}</div>
                <div className="text-[11px] text-white/55">{l.sub}</div>
              </div>
              {active && (
                <CheckCircle2 className="size-4 text-[var(--color-neon-cyan)] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}

// ─── Security (MFA) ────────────────────────────────────────────────────

function SecuritySection() {
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    try {
      setMfaEnabled(localStorage.getItem(STORAGE.mfa) === "1");
    } catch {
      // ignore
    }
  }, []);

  function toggleMfa() {
    const next = !mfaEnabled;
    setMfaEnabled(next);
    try {
      localStorage.setItem(STORAGE.mfa, next ? "1" : "0");
    } catch {
      // ignore
    }
  }

  return (
    <SettingsCard
      title="Security"
      subtitle="Two-factor authentication and login protection"
      icon={ShieldCheck}
    >
      <div className="rounded-xl border border-white/10 bg-[var(--color-bg-panel-elevated)]/40 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">
                Two-factor authentication
              </span>
              {mfaEnabled && (
                <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-mono uppercase tracking-[0.18em] bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/40">
                  <BadgeCheck className="size-3" /> Active
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-white/65 leading-relaxed max-w-md">
              {mfaEnabled
                ? "You'll be asked for a one-time code on new devices. Codes are sent to the phone or email above."
                : "Adds a verification step on new device logins. Strongly recommended for accounts with active listings."}
            </p>
          </div>
          <Toggle
            on={mfaEnabled}
            onChange={toggleMfa}
            ariaLabel="Toggle two-factor authentication"
          />
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-white/55 px-1">
        <Lock className="size-3.5 mt-0.5 text-white/40 shrink-0" />
        <p className="leading-relaxed">
          Your wallet signature already protects on-chain actions. MFA covers
          off-chain account changes — password resets, payout addresses, and
          identity edits.
        </p>
      </div>
    </SettingsCard>
  );
}

function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onChange}
      className={cn(
        "relative h-7 w-12 rounded-full cursor-pointer shrink-0 transition-colors",
        on
          ? "bg-[var(--color-neon-cyan)] shadow-[var(--shadow-glow-cyan)]"
          : "bg-white/12",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 left-1 size-5 rounded-full bg-white shadow",
          "transition-transform duration-200 ease-[var(--ease-out-expo)]",
          on ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ─── Connected accounts (Privy linking) ────────────────────────────────

function ConnectedAccountsSection() {
  const privy = usePrivy();

  // Privy v2: user.twitter / user.discord shortcuts. Use the privy user
  // (not our UnifiedUser) to read account-linking state.
  const privyUser = privy.user as
    | (typeof privy.user & {
        twitter?: { username?: string | null; subject?: string } | null;
        discord?: { username?: string | null; subject?: string } | null;
      })
    | null;

  const twitterUsername = privyUser?.twitter?.username ?? null;
  const discordUsername = privyUser?.discord?.username ?? null;

  async function handleLinkTwitter() {
    try {
      await privy.linkTwitter?.();
    } catch {
      // user cancelled or already linked
    }
  }
  async function handleUnlinkTwitter() {
    const subject = privyUser?.twitter?.subject;
    if (!subject) return;
    try {
      await privy.unlinkTwitter?.(subject);
    } catch {
      // ignore
    }
  }
  async function handleLinkDiscord() {
    try {
      await privy.linkDiscord?.();
    } catch {
      // ignore
    }
  }
  async function handleUnlinkDiscord() {
    const subject = privyUser?.discord?.subject;
    if (!subject) return;
    try {
      await privy.unlinkDiscord?.(subject);
    } catch {
      // ignore
    }
  }

  return (
    <SettingsCard
      title="Connected accounts"
      subtitle="Link socials for verified trust and faster chat support"
      icon={Link2}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <LinkRow
          icon={Twitter}
          label="X (Twitter)"
          accent="#1da1f2"
          username={twitterUsername}
          onLink={handleLinkTwitter}
          onUnlink={handleUnlinkTwitter}
        />
        <LinkRow
          icon={MessageSquare}
          label="Discord"
          accent="#5865f2"
          username={discordUsername}
          onLink={handleLinkDiscord}
          onUnlink={handleUnlinkDiscord}
        />
      </div>
    </SettingsCard>
  );
}

function ConnectedAccountsDisabledSection() {
  return (
    <SettingsCard
      title="Connected accounts"
      subtitle="Privy is not configured for this environment"
      icon={Link2}
    >
      <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-5 text-sm text-white/65">
        Set <span className="font-mono text-white">NEXT_PUBLIC_PRIVY_APP_ID</span>{" "}
        to enable X and Discord linking from this page.
      </div>
    </SettingsCard>
  );
}

function LinkRow({
  icon: Icon,
  label,
  accent,
  username,
  onLink,
  onUnlink,
}: {
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  label: string;
  accent: string;
  username: string | null;
  onLink: () => void;
  onUnlink: () => void;
}) {
  const linked = username !== null;
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3.5 py-3 rounded-xl border",
        linked
          ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
          : "border-white/10 bg-[var(--color-bg-panel-elevated)]/40",
      )}
    >
      <span
        aria-hidden
        className="grid place-items-center size-10 rounded-lg shrink-0"
        style={{
          background: `${accent}1f`,
          border: `1px solid ${accent}55`,
        }}
      >
        <Icon className="size-4" style={{ color: accent }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-[11px] text-white/55 truncate">
          {linked ? `Linked as @${username}` : "Not linked yet"}
        </div>
      </div>
      {linked ? (
        <button
          type="button"
          onClick={onUnlink}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-white/15 text-[11px] font-semibold text-white/80 hover:text-white hover:border-white/35 cursor-pointer transition-colors"
        >
          Unlink
        </button>
      ) : (
        <button
          type="button"
          onClick={onLink}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full bg-white text-[11px] font-semibold text-[var(--color-text-inverse)] hover:brightness-110 active:scale-[0.98] cursor-pointer transition-[filter,transform]"
        >
          Link
        </button>
      )}
    </div>
  );
}

// ─── Referral link ─────────────────────────────────────────────────────

function ReferralSection({ user }: { user: UnifiedUser }) {
  const [copied, setCopied] = useState(false);

  const refUrl = useMemo(() => {
    const wallet = user.walletAddress;
    const handle =
      user.displayName?.replace(/\s+/g, "_") ??
      (wallet ? wallet.slice(2, 10) : user.email?.split("@")[0] ?? "operative");
    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ?? "https://g3mx.xyz"
    ).replace(/\/+$/, "");
    return `${baseUrl}/ref/${handle.toLowerCase()}`;
  }, [user.displayName, user.email, user.walletAddress]);

  function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(refUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const refDisplay = refUrl.replace(/^https?:\/\//, "");

  return (
    <SettingsCard
      title="Referral link"
      subtitle="Earn XP and a cut of every friend's first boost"
      icon={Sparkles}
    >
      <div className="rounded-xl border border-[var(--color-neon-amber)]/30 bg-[var(--color-neon-amber)]/5 p-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-[var(--color-bg-deep)]">
          <span className="text-sm font-mono text-white truncate flex-1">
            {refDisplay}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy referral link"}
            className="inline-flex items-center justify-center size-8 rounded-md text-white/70 hover:text-white hover:bg-white/5 cursor-pointer transition-colors shrink-0"
          >
            {copied ? (
              <CheckCircle2 className="size-4 text-[var(--color-success)]" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="rounded-md bg-[var(--color-bg-deep)]/60 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
              Total invited
            </div>
            <div className="mt-0.5 font-mono text-white tabular-nums">0</div>
          </div>
          <div className="rounded-md bg-[var(--color-bg-deep)]/60 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
              XP earned
            </div>
            <div className="mt-0.5 font-mono text-[var(--color-neon-amber)] tabular-nums">
              0
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── Reusable card + field + states ────────────────────────────────────

function SettingsCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/70 p-5 sm:p-6">
      <header className="flex items-start gap-3 mb-5">
        <span
          aria-hidden
          className="grid place-items-center size-9 rounded-lg bg-[var(--color-neon-cyan)]/12 border border-[var(--color-neon-cyan)]/30 shrink-0"
        >
          <Icon className="size-4 text-[var(--color-neon-cyan)]" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      <div>{children}</div>
      <style jsx>{`
        section :global(.settings-input) {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.875rem;
          border-radius: 0.5rem;
          background: var(--color-bg-deep);
          border: 1px solid var(--color-border-subtle);
          color: white;
          font-size: 0.875rem;
          transition:
            border-color 200ms ease,
            box-shadow 200ms ease;
        }
        section :global(.settings-input:hover) {
          border-color: var(--color-border-strong);
        }
        section :global(.settings-input:focus) {
          outline: none;
          border-color: var(--color-neon-cyan);
          box-shadow: 0 0 0 3px oklch(78% 0.18 200 / 18%);
        }
        section :global(.settings-input::placeholder) {
          color: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-white/60"
      >
        {Icon && <Icon className="size-3" />}
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-white/45 leading-relaxed">{hint}</p>}
    </div>
  );
}

function SavedFlash() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-success)]">
      <CheckCircle2 className="size-3.5" /> Saved
    </span>
  );
}

function SkeletonState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
        />
      ))}
    </div>
  );
}

function ConnectGate({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
        <Lock className="size-6 text-[var(--color-neon-cyan)]" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">
        Sign in to manage settings
      </h2>
      <p className="mt-2 text-white/70 max-w-md mx-auto">
        Your profile, identity, and connected accounts are tied to your wallet
        or social login.
      </p>
      <div className="mt-7">
        <Button size="lg" onClick={onConnect}>
          Connect wallet or social
        </Button>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
