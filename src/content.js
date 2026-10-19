// Facts checked against ~/Kove (functions/auth.js, mobile/src/app/more) and
// ~/kove-site (lib/stores.ts, components/sections/pricing/plans.ts).

export const accessCode = "WWUVIKINGS";
export const codeSpots = 25;
export const codeExpires = "Jan 30, 2027";
export const codeConnections = 3;

export const marketingUrl = "https://kovefinance.com";
export const privacyUrl = "https://kovefinance.com/privacy";
export const webAppUrl = "https://kovefinance.app";
export const appStoreUrl = "https://apps.apple.com/us/app/id6808136959";
export const playStoreUrl = "https://play.google.com/store/apps/details?id=com.kovefinance.app";

// Same links as kove-site's AppLink: iOS opens the app through a universal
// link (or falls back to the App Store), Android uses an intent link with a
// Google Play fallback, computers go to the web app.
const iosOpenUrl = `${webAppUrl}/?open=1`;
const androidOpenUrl = `intent://#Intent;scheme=kove;package=com.kovefinance.app;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`;

export function detectPlatform() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  // iPadOS Safari reports a Mac user agent; touch support gives it away.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

// Poster design the visitor scanned (set by the script in index.html), or null.
export const posterDesign = (() => {
  try {
    return sessionStorage.getItem("kovePosterDesign");
  } catch {
    return null;
  }
})();

// Store links tagged with the poster design, so App Store Connect (Sources,
// Campaigns) and Play Console (acquisition by campaign) count downloads per
// design. The Apple provider token comes from App Store Connect's campaign links.
const applePt = "129398714";

export function appStoreHref(design = posterDesign) {
  if (!design) return appStoreUrl;
  const ct = encodeURIComponent(`WWU campus poster ${design}`);
  return `https://apps.apple.com/app/apple-store/id6808136959?pt=${applePt}&ct=${ct}&mt=8`;
}

export function playStoreHref(design = posterDesign) {
  if (!design) return playStoreUrl;
  const referrer = `utm_source=wwu_poster&utm_medium=qr&utm_campaign=wwu_campus_poster_${design}`;
  return `${playStoreUrl}&referrer=${encodeURIComponent(referrer)}`;
}

/** Sends a Google Analytics event when the tag is on the page. */
export function track(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, { poster_design: posterDesign ?? "none", ...params });
  }
}

export function openAppHref(platform) {
  if (platform === "ios") return iosOpenUrl;
  if (platform === "android") return androidOpenUrl;
  return webAppUrl;
}

export const steps = [
  {
    title: "Get the app",
    body: "Download Kove from the App Store or Google Play and create your account. On a computer, use kovefinance.app.",
  },
  {
    title: "Open Access Program",
    body: "Go to Settings, then Access Program. You'll also see an \"Enter an access code\" option when you connect your first bank.",
  },
  {
    title: `Enter ${accessCode}`,
    body: `Paste the code and redeem it. You can now connect up to ${codeConnections} banks and use every feature.`,
  },
];

export const features = [
  {
    eyebrow: "Spending",
    title: "See where your money actually goes.",
    body: "Connect your bank and cards through Plaid. Transactions sort themselves into categories, so you see the month at a glance.",
    src: "/images/spending-trend.webp",
    width: 1000,
    height: 1433,
    alt: "Kove spending trend chart for October 2026 showing $2,239 spent, $575 less than the same point last month, with top categories housing, groceries, utilities, and healthcare",
  },
  {
    eyebrow: "Budgets",
    title: "Know what's left before you swipe.",
    body: "Set a budget for groceries, eating out, or anything else, and Kove tracks it in real time. No spreadsheets.",
    src: "/images/budget-tiles.webp",
    width: 900,
    height: 828,
    alt: "Kove app budget categories showing spending against each budget, like $216 of $570 on groceries",
  },
  {
    eyebrow: "Goals",
    title: "Save for something specific.",
    body: "Spring break, a car, next quarter's rent. Pick a target and a date, and watch your progress build.",
    src: "/images/goal-card.webp",
    width: 900,
    height: 409,
    alt: "Kove app savings goal for a Mexico trip showing $4,879 saved, the next milestone, and $321 a month needed",
  },
];

export const faqItems = [
  {
    question: "Is it really free?",
    answer: `Yes, for the first ${codeSpots} WWU students who enter ${accessCode}. You get every feature and up to ${codeConnections} connected banks through ${codeExpires}, and you don't need to add a card.`,
  },
  {
    question: `What if the ${codeSpots} spots are gone?`,
    answer: "The app will tell you the code has reached its usage limit. You can still use Kove on a student plan: $1.99/mo for 1 bank, $3.75/mo for 2, or $5.15/mo for 4, with a verified student email. Prices include tax.",
  },
  {
    question: `What happens on ${codeExpires}?`,
    answer: "We email you a week before. When the date arrives, access through the code ends and nothing is charged. If you want to keep going, pick a student plan in the app. If not, you can simply stop.",
  },
  {
    question: "Is my bank info safe?",
    answer: "Bank connections go through Plaid, which handles sign-in directly with your bank, so we never see or store your bank login. Your data is encrypted, and we don't sell or share it. You can delete your account and data anytime.",
  },
  {
    question: "Can Western see my data?",
    answer: "No. Kove is independent and isn't run by or affiliated with WWU. The university has no access to your account or data.",
  },
  {
    question: "What devices does Kove work on?",
    answer: "iPhone (iOS 16.4 or later), Android (Android 8.0 or later), and any web browser at kovefinance.app. One account works everywhere, and you can enter the code on any of them.",
  },
  {
    question: "Does Kove use AI?",
    answer: "Only if you want it. Kove AI is an optional chat assistant for plain-language money questions, and you can turn it off. Categories, budgets, and insights are rule-based, not AI.",
  },
  {
    question: "Who makes Kove?",
    answer: "Kove is a product of Keane Financials LLC, an independent company started by a WWU student. We have no investors, and we make money from subscriptions, not your data.",
  },
];
