/**
 * Lightweight in-app translation table. Keep keys flat and namespaced
 * ("settings.profile.title") so we can grep for missing strings.
 *
 * Falls back to the English string when a key is missing in the active locale.
 */

export type Locale = "en" | "zh-CN" | "zh-TW";

export const SUPPORTED_LOCALES: { code: Locale; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "EN" },
  { code: "zh-CN", label: "Chinese (Simplified)", native: "简体中文", flag: "简" },
  { code: "zh-TW", label: "Chinese (Traditional)", native: "繁體中文", flag: "繁" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "settings.page.title": "Settings",
  "settings.page.subtitle": "Manage your account, security, and how G3MX shows up across the marketplace.",

  "settings.profile.title": "Profile",
  "settings.profile.subtitle": "How you appear to other operatives.",
  "settings.profile.photo": "Profile picture",
  "settings.profile.photo.hint": "Square image, at least 256×256. PNG, JPG, or WebP.",
  "settings.profile.photo.upload": "Upload image",
  "settings.profile.photo.remove": "Remove",
  "settings.profile.username": "Username",
  "settings.profile.username.placeholder": "e.g. shadowblade",
  "settings.profile.email": "Email address",
  "settings.profile.email.placeholder": "you@example.com",
  "settings.profile.phone": "Phone number",
  "settings.profile.phone.placeholder": "+1 555 010 1234",
  "settings.profile.save": "Save changes",
  "settings.profile.saved": "Saved",

  "settings.security.title": "Security",
  "settings.security.subtitle": "Lock down your operative account.",
  "settings.security.mfa": "Two-factor authentication",
  "settings.security.mfa.hint":
    "Add a TOTP authenticator app (Authy, 1Password, Google Authenticator) for one-time codes on login.",
  "settings.security.mfa.disabled": "MFA is OFF",
  "settings.security.mfa.enabled": "MFA is ON",
  "settings.security.mfa.enable": "Enable MFA",
  "settings.security.mfa.disable": "Disable MFA",
  "settings.security.mfa.setup.title": "Scan with your authenticator",
  "settings.security.mfa.setup.body":
    "Open your authenticator app, scan the QR code, then enter the 6-digit code below to confirm.",
  "settings.security.mfa.code": "6-digit code",
  "settings.security.mfa.verify": "Verify and turn on",
  "settings.security.mfa.cancel": "Cancel",
  "settings.security.mfa.code.invalid": "That code is not valid. Try again.",

  "settings.preferences.title": "Preferences",
  "settings.preferences.subtitle": "Customise your G3MX experience.",
  "settings.preferences.language": "Language",
  "settings.preferences.language.hint":
    "Pick the language used across the marketplace UI. Saved to this browser.",

  "settings.linked.title": "Linked accounts",
  "settings.linked.subtitle": "Connect socials to verify identity and unlock perks.",
  "settings.linked.x.label": "X (Twitter)",
  "settings.linked.discord.label": "Discord",
  "settings.linked.connect": "Connect",
  "settings.linked.disconnect": "Disconnect",
  "settings.linked.connected": "Connected",

  "settings.referral.title": "Referral link",
  "settings.referral.subtitle": "Earn XP and a slice of every friend's first boost.",
  "settings.referral.copy": "Copy",
  "settings.referral.copied": "Copied",
  "settings.referral.invited": "Total invited",
  "settings.referral.xp": "XP earned",
};

const zhCN: Dict = {
  "settings.page.title": "设置",
  "settings.page.subtitle": "管理账户、安全性以及您在市场中的展示方式。",

  "settings.profile.title": "个人资料",
  "settings.profile.subtitle": "您在其他玩家面前的展示信息。",
  "settings.profile.photo": "头像",
  "settings.profile.photo.hint": "正方形图片，至少 256×256 像素，支持 PNG、JPG、WebP。",
  "settings.profile.photo.upload": "上传图片",
  "settings.profile.photo.remove": "移除",
  "settings.profile.username": "用户名",
  "settings.profile.username.placeholder": "例如：shadowblade",
  "settings.profile.email": "电子邮箱",
  "settings.profile.email.placeholder": "you@example.com",
  "settings.profile.phone": "手机号码",
  "settings.profile.phone.placeholder": "+86 138 0000 0000",
  "settings.profile.save": "保存修改",
  "settings.profile.saved": "已保存",

  "settings.security.title": "安全",
  "settings.security.subtitle": "保护您的账户安全。",
  "settings.security.mfa": "两步验证",
  "settings.security.mfa.hint":
    "添加 TOTP 验证器（如 Authy、1Password、Google Authenticator）在登录时生成一次性验证码。",
  "settings.security.mfa.disabled": "两步验证已关闭",
  "settings.security.mfa.enabled": "两步验证已开启",
  "settings.security.mfa.enable": "开启两步验证",
  "settings.security.mfa.disable": "关闭两步验证",
  "settings.security.mfa.setup.title": "使用验证器扫描二维码",
  "settings.security.mfa.setup.body":
    "打开您的验证器应用，扫描下方二维码，然后输入 6 位验证码以完成绑定。",
  "settings.security.mfa.code": "6 位验证码",
  "settings.security.mfa.verify": "验证并开启",
  "settings.security.mfa.cancel": "取消",
  "settings.security.mfa.code.invalid": "验证码无效，请重试。",

  "settings.preferences.title": "偏好设置",
  "settings.preferences.subtitle": "自定义您的 G3MX 使用体验。",
  "settings.preferences.language": "语言",
  "settings.preferences.language.hint": "选择市场界面所使用的语言，将保存在当前浏览器。",

  "settings.linked.title": "已绑定账户",
  "settings.linked.subtitle": "绑定社交账号以验证身份并解锁福利。",
  "settings.linked.x.label": "X（推特）",
  "settings.linked.discord.label": "Discord",
  "settings.linked.connect": "绑定",
  "settings.linked.disconnect": "解绑",
  "settings.linked.connected": "已绑定",

  "settings.referral.title": "推荐链接",
  "settings.referral.subtitle": "获取经验值并从好友的首单中获得分成。",
  "settings.referral.copy": "复制",
  "settings.referral.copied": "已复制",
  "settings.referral.invited": "已邀请人数",
  "settings.referral.xp": "已获得经验值",
};

const zhTW: Dict = {
  "settings.page.title": "設定",
  "settings.page.subtitle": "管理帳號、安全設定，以及您在市集中的呈現方式。",

  "settings.profile.title": "個人資料",
  "settings.profile.subtitle": "您在其他玩家面前的呈現資訊。",
  "settings.profile.photo": "頭像",
  "settings.profile.photo.hint": "正方形圖片，至少 256×256 像素，支援 PNG、JPG、WebP。",
  "settings.profile.photo.upload": "上傳圖片",
  "settings.profile.photo.remove": "移除",
  "settings.profile.username": "使用者名稱",
  "settings.profile.username.placeholder": "例如：shadowblade",
  "settings.profile.email": "電子郵件",
  "settings.profile.email.placeholder": "you@example.com",
  "settings.profile.phone": "手機號碼",
  "settings.profile.phone.placeholder": "+886 912 345 678",
  "settings.profile.save": "儲存變更",
  "settings.profile.saved": "已儲存",

  "settings.security.title": "安全性",
  "settings.security.subtitle": "保護您的帳戶安全。",
  "settings.security.mfa": "兩步驟驗證",
  "settings.security.mfa.hint":
    "新增 TOTP 驗證器（例如 Authy、1Password、Google Authenticator），在登入時產生一次性驗證碼。",
  "settings.security.mfa.disabled": "兩步驟驗證已關閉",
  "settings.security.mfa.enabled": "兩步驟驗證已開啟",
  "settings.security.mfa.enable": "開啟兩步驟驗證",
  "settings.security.mfa.disable": "關閉兩步驟驗證",
  "settings.security.mfa.setup.title": "使用驗證器掃描 QR Code",
  "settings.security.mfa.setup.body":
    "開啟您的驗證器應用程式，掃描下方 QR Code，再輸入 6 位數驗證碼以完成綁定。",
  "settings.security.mfa.code": "6 位數驗證碼",
  "settings.security.mfa.verify": "驗證並開啟",
  "settings.security.mfa.cancel": "取消",
  "settings.security.mfa.code.invalid": "驗證碼無效，請再試一次。",

  "settings.preferences.title": "偏好設定",
  "settings.preferences.subtitle": "自訂您的 G3MX 使用體驗。",
  "settings.preferences.language": "語言",
  "settings.preferences.language.hint": "選擇市集介面所使用的語言，將儲存於目前瀏覽器。",

  "settings.linked.title": "已連結帳戶",
  "settings.linked.subtitle": "綁定社群帳號以驗證身份並解鎖福利。",
  "settings.linked.x.label": "X（Twitter）",
  "settings.linked.discord.label": "Discord",
  "settings.linked.connect": "綁定",
  "settings.linked.disconnect": "解除綁定",
  "settings.linked.connected": "已綁定",

  "settings.referral.title": "推薦連結",
  "settings.referral.subtitle": "獲得經驗值，並從好友的首筆訂單中分潤。",
  "settings.referral.copy": "複製",
  "settings.referral.copied": "已複製",
  "settings.referral.invited": "已邀請人數",
  "settings.referral.xp": "已獲得經驗值",
};

export const DICTIONARIES: Record<Locale, Dict> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

export function translate(locale: Locale, key: string): string {
  return DICTIONARIES[locale][key] ?? en[key] ?? key;
}
