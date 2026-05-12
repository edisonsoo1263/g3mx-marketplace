"use client";

import { useEffect, useState } from "react";
import { AtSign, Phone, User as UserIcon, Save, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ProfileFormProps {
  initialUsername: string;
  initialEmail: string;
  initialPhone: string;
  onSubmit: (values: { username: string; email: string; phone: string }) => void;
}

export function ProfileForm({
  initialUsername,
  initialEmail,
  initialPhone,
  onSubmit,
}: ProfileFormProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [saved, setSaved] = useState(false);

  // Reset "saved" indicator whenever the user edits any field again.
  useEffect(() => {
    setSaved(false);
  }, [username, email, phone]);

  const dirty =
    username !== initialUsername || email !== initialEmail || phone !== initialPhone;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ username, email, phone });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label={t("settings.profile.username")}
          icon={<UserIcon className="size-4" />}
          value={username}
          onChange={setUsername}
          placeholder={t("settings.profile.username.placeholder")}
          autoComplete="username"
        />
        <Field
          label={t("settings.profile.email")}
          icon={<AtSign className="size-4" />}
          value={email}
          onChange={setEmail}
          placeholder={t("settings.profile.email.placeholder")}
          type="email"
          autoComplete="email"
        />
        <Field
          label={t("settings.profile.phone")}
          icon={<Phone className="size-4" />}
          value={phone}
          onChange={setPhone}
          placeholder={t("settings.profile.phone.placeholder")}
          type="tel"
          autoComplete="tel"
          className="md:col-span-2"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button type="submit" size="md" disabled={!dirty}>
          <Save className="size-4" />
          {t("settings.profile.save")}
        </Button>
        {saved && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success)]"
          >
            <CheckCircle2 className="size-4" />
            {t("settings.profile.saved")}
          </span>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  className,
}: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5">
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-2.5 h-11 px-3.5 rounded-md cursor-text",
          "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-strong)]",
          "transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
          "focus-within:border-[var(--color-neon-cyan)] focus-within:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
        )}
      >
        <span className="text-[var(--color-text-muted)] shrink-0">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] min-w-0"
        />
      </span>
    </label>
  );
}
