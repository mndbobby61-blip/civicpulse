import type { Priority } from "@/generated/prisma/client";

export type TriageCategory = {
  id: string;
  name: string;
  nameBn: string | null;
};

export type TriageResult = {
  categoryId: string | null;
  categoryName: string | null;
  priority: Priority;
  source: "gemini-vision" | "gemini" | "heuristic";
  reason: string;
};

const RULES: { keywords: string[]; categoryHints: string[] }[] = [
  {
    keywords: [
      "pothole", "road", "crack", "broken road", "asphalt", "highway", "street", "bridge",
      "রাস্তা", "গর্ত", "ভাঙা", "সড়ক", "পিচ", "ব্রিজ", "কালভার্ট",
    ],
    categoryHints: ["road", "highway", "রাস্তা", "সড়ক"],
  },
  {
    keywords: [
      "light", "streetlight", "lamp", "dark", "bulb", "pole", "electric", "wire", "spark",
      "লাইট", "স্ট্রিটলাইট", "বাতি", "অন্ধকার", "খুঁটি", "বিদ্যুৎ", "তার",
    ],
    categoryHints: ["light", "power", "স্ট্রিটলাইট", "বিদ্যুৎ"],
  },
  {
    keywords: [
      "drain", "drainage", "waterlog", "flood", "sewer", "pipe", "water", "manhole", "leak",
      "ড্রেন", "জলাবদ্ধতা", "পানি", "ম্যানহোল", "নর্দমা", "সাপ্লাই", "লিক",
    ],
    categoryHints: ["drain", "water", "ড্রেনেজ", "পানি"],
  },
  {
    keywords: [
      "footpath", "sidewalk", "pavement", "walkway", "encroach", "slab",
      "ফুটপাত", "হাঁটার", "দখল", "স্ল্যাব",
    ],
    categoryHints: ["footpath", "ফুটপাত"],
  },
  {
    keywords: [
      "waste", "garbage", "trash", "dump", "smell", "bin", "rubbish", "clean",
      "ময়লা", "বর্জ্য", "আবর্জনা", "দুর্গন্ধ", "ডাস্টবিন", "পরিচ্ছন্ন",
    ],
    categoryHints: ["waste", "garbage", "বর্জ্য"],
  },
];

const CRITICAL_WORDS = [
  "accident", "danger", "emergency", "spark", "fire", "collapsed", "open manhole", "live wire", "flooded", "school", "hospital",
  "দুর্ঘটনা", "বিপজ্জনক", "জরুরি", "আগুন", "ধসে", "খোলা ম্যানহোল", "ছেঁড়া তার", "হাসপাতাল", "স্কুল",
];

const HIGH_WORDS = [
  "blocked", "broken", "overflow", "dark", "days", "huge", "deep", "stuck", "urgent",
  "বন্ধ", "ভেঙে", "জমে", "অন্ধকার", "বড়", "গভীর", "কয়েকদিন", "দুর্গন্ধ",
];

/**
 * Deterministic bilingual (Bangla + English) fallback classifier when no Gemini API key is configured.
 */
export function classifyLocally(
  title: string,
  description: string,
  categories: TriageCategory[]
): TriageResult {
  const text = `${title} ${description}`.toLowerCase();

  let bestRule: (typeof RULES)[number] | null = null;
  let bestHits = 0;

  for (const rule of RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) hits += 1;
    }
    if (hits > bestHits) {
      bestHits = hits;
      bestRule = rule;
    }
  }

  let matchedCat: TriageCategory | null = null;
  if (bestRule) {
    matchedCat =
      categories.find((c) => {
        const hay = `${c.name} ${c.nameBn ?? ""}`.toLowerCase();
        return bestRule!.categoryHints.some((h) => hay.includes(h.toLowerCase()));
      }) ?? null;
  }
  if (!matchedCat && categories.length > 0 && bestHits === 0) {
    matchedCat =
      categories.find((c) => c.name.toLowerCase().includes("public")) ?? null;
  }

  let priority: Priority = "MEDIUM";
  if (CRITICAL_WORDS.some((w) => text.includes(w.toLowerCase()))) {
    priority = "CRITICAL";
  } else if (HIGH_WORDS.some((w) => text.includes(w.toLowerCase()))) {
    priority = "HIGH";
  } else if (text.length < 40 && bestHits === 0) {
    priority = "LOW";
  }

  return {
    categoryId: matchedCat?.id ?? null,
    categoryName: matchedCat?.name ?? null,
    priority,
    source: "heuristic",
    reason: bestHits > 0 ? "Matched civic keywords" : "Default civic classification",
  };
}

async function fetchTrustedImagePart(imageUrl?: string) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  if (!imageUrl || !cloud || !imageUrl.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
    return null;
  }
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 4 * 1024 * 1024) return null;
    return {
      inlineData: {
        mimeType: contentType.split(";")[0],
        data: Buffer.from(buf).toString("base64"),
      },
    };
  } catch {
    return null;
  }
}

/**
 * Uses Gemini API (with optional Cloudinary Vision analysis) when GEMINI_API_KEY is available;
 * falls back safely to local classifier.
 */
export async function classifyIssue(
  title: string,
  description: string,
  categories: TriageCategory[],
  imageUrl?: string
): Promise<TriageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || categories.length === 0) {
    return classifyLocally(title, description, categories);
  }

  try {
    const catList = categories.map((c) => `${c.id}: ${c.name}`).join("\n");
    const prompt = [
      "Classify this Dhaka civic infrastructure issue from the text and photo (if attached).",
      "Pick one categoryId from the list below and one priority (LOW, MEDIUM, HIGH, CRITICAL).",
      "Respond strictly as JSON: {\"categoryId\": \"...\", \"priority\": \"...\", \"reason\": \"short reason\"}",
      `Categories:\n${catList}`,
      `Title: ${title}`,
      `Description: ${description}`,
    ].join("\n\n");

    const imagePart = await fetchTrustedImagePart(imageUrl);
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
      { text: prompt },
    ];
    if (imagePart) parts.push(imagePart);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(9000),
      }
    );

    if (!res.ok) return classifyLocally(title, description, categories);
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return classifyLocally(title, description, categories);

    const parsed = JSON.parse(raw) as { categoryId?: string; priority?: string; reason?: string };
    const cat = categories.find((c) => c.id === parsed.categoryId) ?? null;
    const validPrio = (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).includes(
      parsed.priority as Priority
    )
      ? (parsed.priority as Priority)
      : "MEDIUM";

    if (!cat) return classifyLocally(title, description, categories);
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      priority: validPrio,
      source: imagePart ? "gemini-vision" : "gemini",
      reason: String(parsed.reason ?? "Gemini AI triage").slice(0, 140),
    };
  } catch {
    return classifyLocally(title, description, categories);
  }
}
