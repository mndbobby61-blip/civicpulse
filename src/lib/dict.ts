export type Lang = "bn" | "en";

const bn = {
  nav_how: "কীভাবে কাজ করে",
  nav_map: "লাইভ ম্যাপ",
  nav_rank: "র‍্যাঙ্কিং",
  nav_faq: "প্রশ্ন",
  nav_cta: "সমস্যা জানান",
  nav_menu: "মেনু",
  badge_new: "নতুন",
  badge_text: "এখন ঢাকার ১২টি বিভাগে চালু",
  h1a: "শহরের প্রতিটা সমস্যার একটা ",
  h1b: "স্পন্দন",
  h1c: " আছে।",
  sub: "ভাঙা রাস্তা, নষ্ট বাতি, বন্ধ ড্রেন। ছবি তুলে জানান, কাজ কতদূর এগোল নিজের চোখে দেখুন।",
  btn_report: "সমস্যা জানান",
  btn_map: "লাইভ ম্যাপ দেখুন",
  chip: "চলছে",
  tl1: "জমা হয়েছে",
  tl1t: "সকাল ৯:১২",
  tl2: "যাচাই হয়েছে",
  tl2t: "সকাল ১০:০৫",
  tl3: "কর্মী কাজ করছেন",
  tl3t: "রহিম, রাস্তা মেরামত দল",
  tl4: "সমাধান",
  notif: "কর্মী ৫ মিনিটের দূরত্বে",
} as const;

export type Key = keyof typeof bn;

const en: Record<Key, string> = {
  nav_how: "How it works",
  nav_map: "Live map",
  nav_rank: "Rankings",
  nav_faq: "FAQ",
  nav_cta: "Report an issue",
  nav_menu: "Menu",
  badge_new: "New",
  badge_text: "Now live in 12 departments across Dhaka",
  h1a: "Every problem in your city has a ",
  h1b: "pulse",
  h1c: ".",
  sub: "Broken roads, dead streetlights, blocked drains. Snap a photo, report it, and watch the fix happen.",
  btn_report: "Report an issue",
  btn_map: "View live map",
  chip: "In progress",
  tl1: "Submitted",
  tl1t: "9:12 AM",
  tl2: "Verified",
  tl2t: "10:05 AM",
  tl3: "Crew at work",
  tl3t: "Rahim, Road repair team",
  tl4: "Resolved",
  notif: "Crew is 5 minutes away",
};

export const dict: Record<Lang, Record<Key, string>> = { bn, en };