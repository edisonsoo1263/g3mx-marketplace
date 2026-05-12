"use client";

import { useMemo, useState } from "react";
import { Globe2, Link2, Settings as SettingsIcon, ShieldCheck, Sparkles, UserCog } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ProfilePhotoUpload } from "@/components/settings/ProfilePhotoUpload";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { MfaCard } from "@/components/settings/MfaCard";
import { LinkedAccounts } from "@/components/settings/LinkedAccounts";
import { ReferralCard } from "@/components/settings/ReferralCard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

interface ProfileState {
  username: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Seed initial form values from the unified auth user when present, falling
  // back to safe placeholders so the page is fully exercisable when signed out.
  const seed = useMemo(() => {
    const wallet = user?.walletAddress ?? null;
    const baseHandle =
      user?.displayName?.replace(/\s+/g, "_") ??
      (wallet ? wallet.slice(2, 10) : user?.email?.split("@")[0] ?? "operative");
    return {
      avatarUrl: user?.avatarUrl ?? null,
      username: baseHandle,
      email: user?.email ?? "",
      phone: "",
      refUrl: `https://g3mx.io/ref/${baseHandle.toLowerCase()}`,
      seedKey: user?.id ?? baseHandle,
    };
  }, [user]);

  const [avatar, setAvatar] = useState<string | null>(seed.avatarUrl);
  const [profile, setProfile] = useState<ProfileState>({
    username: seed.username,
    email: seed.email,
    phone: seed.phone,
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <PageHeader />

        <div className="mt-8 space-y-6">
          <SettingsSection
            icon={<UserCog className="size-5" />}
            title={t("settings.profile.title")}
            subtitle={t("settings.profile.subtitle")}
          >
            <ProfilePhotoUpload
              value={avatar}
              onChange={setAvatar}
              fallbackSeed={seed.seedKey}
            />
            <div className="h-px bg-[var(--color-border-subtle)]" aria-hidden />
            <ProfileForm
              initialUsername={profile.username}
              initialEmail={profile.email}
              initialPhone={profile.phone}
              onSubmit={(next) => setProfile(next)}
            />
          </SettingsSection>

          <SettingsSection
            icon={<ShieldCheck className="size-5" />}
            title={t("settings.security.title")}
            subtitle={t("settings.security.subtitle")}
          >
            <MfaCard enabled={mfaEnabled} onChange={setMfaEnabled} seed={seed.seedKey} />
          </SettingsSection>

          <SettingsSection
            icon={<Globe2 className="size-5" />}
            title={t("settings.preferences.title")}
            subtitle={t("settings.preferences.subtitle")}
          >
            <LanguageSelector />
          </SettingsSection>

          <SettingsSection
            icon={<Link2 className="size-5" />}
            title={t("settings.linked.title")}
            subtitle={t("settings.linked.subtitle")}
          >
            <LinkedAccounts />
          </SettingsSection>

          <SettingsSection
            icon={<Sparkles className="size-5" />}
            title={t("settings.referral.title")}
            subtitle={t("settings.referral.subtitle")}
          >
            <ReferralCard url={seed.refUrl} invited={0} xpEarned={0} />
          </SettingsSection>
        </div>
      </main>
      <Footer />
    </>
  );
}

function PageHeader() {
  const { t } = useLanguage();
  return (
    <header className="space-y-3">
      <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-neon-cyan)]">
        <SettingsIcon className="size-3.5" />
        /account/settings
      </div>
      <h1
        className="font-display font-black tracking-tight text-[var(--color-text-primary)]"
        style={{ fontSize: "var(--text-h1)", lineHeight: 1.05 }}
      >
        {t("settings.page.title")}
      </h1>
      <p className="max-w-2xl text-[var(--color-text-secondary)] text-base">
        {t("settings.page.subtitle")}
      </p>
    </header>
  );
}
