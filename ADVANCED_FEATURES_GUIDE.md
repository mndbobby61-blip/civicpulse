# CivicPulse — Advanced Features Implementation Guide (বিস্তারিত ডকুমেন্টেশন ও কোড)

এই ডকুমেন্টে **CivicPulse**-এর বিদ্যমান কোনো ফিচার, রাউট, বা ডাটাবেস স্কিমা পরিবর্তন না করে নতুন কী কী অ্যাডভান্সড ফিচার যোগ করা হয়েছে এবং কোন ফাইলে কোন কোড যুক্ত করা হয়েছে তা ধাপে ধাপে সহজভাবে ব্যাখ্যা করা হলো।

---

## ১. সহজ ভাষায় আমরা কী কী নতুন কাজ করেছি

১. **মাঠকর্মীর কাজের প্রমাণ ও Before/After তুলনা স্লাইডার:**
   - কর্মীরা কাজ শেষে **Completion Photo** ও কাজের বিবরণ (`TaskReport`) জমা দিতে পারবে।
   - নাগরিক ও ম্যানেজার ইস্যু ডিটেইল পেজে স্লাইডার টেনে **আগে বনাম পরে (Before/After)** ছবি তুলনা করতে পারবে।

২. **AI Auto-Triage, বাংলা ভয়েস রিপোর্ট ও অটো-ঠিকানা (Reverse Geocoding):**
   - নতুন ইস্যু ফর্মে **Smart Assistant** যুক্ত করা হয়েছে:
     - **AI দিয়ে ক্যাটেগরি ও প্রায়োরিটি শনাক্ত:** বাংলা/ইংরেজি কীওয়ার্ড ক্লাসিফায়ার (আর `.env`-এ `GEMINI_API_KEY` দিলে সরাসরি Gemini AI) দিয়ে ক্যাটেগরি ও প্রায়োরিটি সাজেস্ট করে।
     - **বাংলা/ইংরেজি ভয়েস ইনপুট:** ব্রাউজারের Speech Recognition দিয়ে মুখে বললেই টাইটেল/বিবরণ টাইপ হয়ে যায়।
     - **পিন থেকে অটো ঠিকানা ও Area Name:** OpenStreetMap Nominatim API ব্যবহার করে ম্যাপ পিন বা GPS থেকে ঠিকানা ও এলাকার নাম অটো পূরণ হয়।
     - **সাবমিটের আগেই লাইভ ডুপ্লিকেট সতর্কতা:** ৫০ মিটারের মধ্যে একই সমস্যার ওপেন রিপোর্ট থাকলে সাথে সাথে দেখিয়ে দেয়।
     - **অফলাইন ড্রাফট সেভ ও PWA:** নেট না থাকলেও রিপোর্ট ড্রাফট ব্রাউজারে সেভ থাকে ও পরে রিস্টোর করে সাবমিট করা যায়।

৩. **ম্যানেজার ট্রায়াজ, লিখিত রিভিউ, ডুপ্লিকেট ক্লাস্টার ও অভ্যন্তরীণ টিম নোট:**
   - **Manager Triage Panel:** ম্যানেজার বা অ্যাডমিন ইস্যুর **Priority** (`LOW`–`CRITICAL`) বদলাতে এবং ভুল ক্যাটেগরি/ডিপার্টমেন্ট হলে **Re-route** করতে পারবে।
   - **নাগরিকের লিখিত রিভিউ (`Feedback.comment`):** স্টার রেটিংয়ের সাথে লিখিত মতামত সংরক্ষণ ও প্রদর্শন।
   - **Duplicate Cluster Card:** মূল রিপোর্ট ও যুক্ত হওয়া ডুপ্লিকেট রিপোর্টগুলোর লিংক এক জায়গায় দেখা যায়।
   - **Internal Team Notes:** কেবল স্টাফ, ম্যানেজার ও অ্যাডমিনের জন্য প্রাইভেট নোট (নাগরিক দেখতে পায় না)।

৪. **ফিল্ড স্টাফ রুট প্ল্যানার (`/staff/route`):**
   - কর্মীর অ্যাসাইন করা কাজগুলো **Haversine দূরত্ব + প্রায়োরিটি** অনুযায়ী Nearest-Neighbor রুট হিসেবে ম্যাপে সাজিয়ে দেয় এবং Google Maps নেভিগেশন লিংক দেয়।

৫. **অ্যাডমিন কন্ট্রোল ও রিপোর্ট এক্সপোর্ট (`/admin/categories`, `/admin/settings`, `/admin/reports`):**
   - **Category & SLA Manager:** নতুন ক্যাটেগরি তৈরি ও প্রতি ক্যাটেগরির SLA ঘণ্টা আপডেট।
   - **System Settings:** ডাটাবেসের `Setting` টেবিলে ডুপ্লিকেট রেডিয়াস, ম্যাক্স ছবি ও পাবলিক ব্যানার কনফিগার।
   - **CSV & Print-Ready PDF Export:** স্ট্যাটাস ফিল্টারসহ Excel-ফ্রেন্ডলি UTF-8 BOM CSV ডাউনলোড (`/api/export`) এবং প্রিন্ট-রেডি PDF রিপোর্ট।

৬. **পাবলিক এলাকা স্কোরকার্ড (`/areas`), লাইভ SSE, SLA Escalation ও অটোমেটেড টেস্ট:**
   - **Public Area Scorecard:** লগইন ছাড়াই এলাকাভিত্তিক সমাধানের হার, গড় সময় ও রেটিং।
   - **Live SSE Notification Stream:** `/api/notifications/stream` দিয়ে তাৎক্ষণিক আনরিড কাউন্ট সিঙ্ক।
   - **24h+ SLA Escalation Cron:** `/api/cron/escalate` দিয়ে ২৪ ঘণ্টার বেশি ওভারডিউ হলে অ্যাডমিনদের অটো অ্যালার্ট।
   - **Automated Tests (`tests/`):** স্কোরিং, AI ট্রায়াজ, রেট লিমিট ও রুট প্ল্যানারের ৮টি ইউনিট টেস্ট।

---

## ২. কোথায় কোন নতুন কোড যোগ করা হয়েছে (Additive Integration Map)

বিদ্যমান কোডে কোনো ব্রেকিং চেঞ্জ না করে কেবল নিচের জায়গাগুলোতে নতুন কম্পোনেন্ট/লিংক মাউন্ট করা হয়েছে:

### ক) `src/app/layout.tsx`
- লাইন ৫ ও ২৬-এ নতুন CSS (`./civicpulse-advanced.css`) এবং PWA সার্ভিস ওয়ার্কার রেজিস্টার (`<PwaRegister />`) যোগ করা হয়েছে:
```tsx
import "./civicpulse-advanced.css";
import PwaRegister from "@/components/pwa-register";
// <body>-এর ভেতরে:
<PwaRegister />
```

### খ) `src/components/app-shell.tsx`
- নতুন পেজগুলোর নেভিগেশন লিংক এবং লাইভ স্ট্রিম ব্যাজ যোগ করা হয়েছে:
```tsx
import { advT } from "@/lib/advanced-dict";
import LiveStreamBadge from "./live-stream-badge";

// <nav className="cp-appnav">-এর ভেতরে রোল অনুযায়ী লিংক:
{role === "STAFF" && <Link href="/staff/route">{advT(lang, "nav_route")}</Link>}
<Link href="/areas">{advT(lang, "nav_areas")}</Link>
{(role === "ADMIN" || role === "MANAGER") && <Link href="/admin/reports">{advT(lang, "nav_reports")}</Link>}
{role === "ADMIN" && (
  <>
    <Link href="/admin/categories">{advT(lang, "nav_cats")}</Link>
    <Link href="/admin/settings">{advT(lang, "nav_settings")}</Link>
  </>
)}

// ডানপাশের টুলবারে:
<LiveStreamBadge />
```

### গ) `src/components/dash-home.tsx`
- ড্যাশবোর্ডের কুইক-অ্যাকশন বাটনের সারিতে নতুন শর্টকাট বাটন যোগ করা হয়েছে:
```tsx
{role === "STAFF" && <Link href="/staff/route" className="cp-btn ghost">{advT(lang, "nav_route")}</Link>}
{(role === "ADMIN" || role === "MANAGER") && <Link href="/admin/reports" className="cp-btn ghost">{advT(lang, "nav_reports")}</Link>}
<Link href="/areas" className="cp-btn ghost">{advT(lang, "nav_areas")}</Link>
```

### ঘ) `src/components/issue-form.tsx` এবং `src/lib/issue-actions.ts`
- `src/components/issue-form.tsx`-এ ফর্মের উপরের অংশে `<IssueAssistant />` যুক্ত করা হয়েছে এবং `title`, `description`, `categoryId`, `address`, `areaName` ফিল্ডগুলো কন্ট্রোলড করা হয়েছে যাতে AI, ভয়েস ও রিসার্ভ জিওকোডিং সরাসরি ফিল্ডগুলো পূরণ করতে পারে।
- `src/lib/issue-actions.ts`-এর `createIssueAction`-এ `areaName` সেভ করার জন্য ১ লাইন যোগ করা হয়েছে:
```ts
areaName: String(fd.get("areaName") ?? "").trim().slice(0, 80) || null,
```

### ঙ) `src/components/issue-detail.tsx`
- বিদ্যমান `IssueView` ও `Engage`-এর নিচে `<IssueAdvancedPanels />` যুক্ত করা হয়েছে এবং তার জন্য প্রাসঙ্গিক `reports`, `duplicateOf`, `duplicates`, `categories`, এবং `internalNotes` ডেটা কোয়েরি করে পাঠানো হয়েছে।

---

## ৩. নতুন তৈরি করা ফাইলগুলোর পূর্ণাঙ্গ তালিকা ও কোড রেফারেন্স

### ৩.১ লাইব্রেরি ও হেল্পার (`src/lib/`)

#### ১) `src/lib/rate-limit.ts` (API নিরাপত্তা ও স্প্যাম প্রতিরোধ)
```ts
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 2000) {
    for (const [k, b] of buckets.entries()) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
```

#### ২) `src/lib/ai-triage.ts` (বাংলা ও ইংরেজি স্মার্ট ক্যাটেগরি + প্রায়োরিটি ক্লাসিফায়ার)
- `classifyLocally(title, description, categories)`: বাংলা ও ইংরেজি কীওয়ার্ড ম্যাচিং করে ক্যাটেগরি ও `LOW`/`MEDIUM`/`HIGH`/`CRITICAL` প্রায়োরিটি নির্ধারণ করে (API Key ছাড়াই কাজ করে)।
- `classifyIssue(title, description, categories)`: `.env`-এ `GEMINI_API_KEY` থাকলে `gemini-2.0-flash` ব্যবহার করে এবং কোনো কারণে কল ব্যর্থ হলে `classifyLocally`-তে ফলব্যাক করে।

#### ৩) `src/lib/route-planner.ts` (স্টাফের ফিল্ড রুট অপটিমাইজেশন)
- `haversineKm(lat1, lng1, lat2, lng2)`: দুইটি GPS পয়েন্টের মধ্যকার দূরত্ব (কি.মি.) বের করে।
- `optimizeFieldRoute(stops, startLat, startLng)`: Nearest-Neighbor ও প্রায়োরিটি ওয়েটিং ব্যবহার করে কাজের ক্রম ও মোট দূরত্ব হিসাব করে।

#### ৪) `src/lib/advanced-dict.ts`
- সব নতুন ফিচারের বাংলা (`bn`) ও ইংরেজি (`en`) অনুবাদ ডিকশনারি `advT(lang, key)`।

#### ৫) `src/lib/advanced-actions.ts` (নতুন Server Actions)
- `submitTaskReportAction`: স্টাফ/অ্যাডমিনের `TaskReport` ও `COMPLETION` ছবি সংরক্ষণ।
- `saveFeedbackReviewAction`: নাগরিকের রেটিং ও লিখিত মতামত (`Feedback.comment`) সংরক্ষণ।
- `managerTriageAction`: ম্যানেজার/অ্যাডমিনের প্রায়োরিটি ওভাররাইড এবং ক্যাটেগরি/ডিপার্টমেন্ট রি-রাউট।
- `saveInternalNoteAction`: স্টাফ/ম্যানেজার/অ্যাডমিনের প্রাইভেট নোট (`AuditLog`-এ `entity: "InternalNote"` হিসেবে সেভ হয়)।
- `createCategoryAction` ও `updateCategorySlaAction`: ক্যাটেগরি তৈরি ও SLA ঘণ্টা আপডেট।
- `saveSettingsAction`: `Setting` টেবিলে সিস্টেম সেটিংস সেভ।

---

### ৩.২ নতুন API Route Handlers (`src/app/api/`)

| এন্ডপয়েন্ট | ফাইল | কাজ |
|---|---|---|
| `GET /api/geocode` | `src/app/api/geocode/route.ts` | লগইন করা ইউজারের জন্য ল্যাট/লং থেকে OpenStreetMap Nominatim দিয়ে ঠিকানা ও `areaName` বের করা |
| `POST /api/ai-triage` | `src/app/api/ai-triage/route.ts` | টাইটেল ও বিবরণ বিশ্লেষণ করে ক্যাটেগরি ও প্রায়োরিটি সাজেস্ট করা |
| `GET /api/duplicate-check` | `src/app/api/duplicate-check/route.ts` | সাবমিটের আগেই ৫০ মিটারের মধ্যে একই ধরনের ওপেন রিপোর্ট খুঁজে দেওয়া |
| `GET /api/export` | `src/app/api/export/route.ts` | অ্যাডমিন ও ম্যানেজারদের জন্য CSV ফর্মুলা-ইনজেকশন মুক্ত UTF-8 BOM এক্সপোর্ট |
| `GET /api/notifications/stream` | `src/app/api/notifications/stream/route.ts` | Server-Sent Events (SSE) দিয়ে লাইভ আনরিড নোটিফিকেশন কাউন্ট পাঠানো |
| `GET /api/cron/escalate` | `src/app/api/cron/escalate/route.ts` | `CRON_SECRET` যাচাই করে ২৪ ঘণ্টার বেশি SLA ওভারডিউ হলে অ্যাডমিনদের অ্যালার্ট পাঠানো |

---

### ৩.৩ নতুন UI কম্পোনেন্ট ও পেজ (`src/components/` ও `src/app/`)

- **ফর্ম অ্যাসিস্ট্যান্ট:** `src/components/issue-assistant.tsx` (`/issues/new`-তে মাউন্ট করা)
- **ইস্যু ডিটেইল অ্যাডভান্সড প্যানেল:** `src/components/issue-advanced-panels.tsx` (`/issues/[id]`-তে মাউন্ট করা — Before/After স্লাইডার, ডুপ্লিকেট ক্লাস্টার, ম্যানেজার ট্রায়াজ, স্টাফ প্রগ্রেস/প্রমাণ, নাগরিকের লিখিত রিভিউ ও অভ্যন্তরীণ নোট)
- **ফিল্ড স্টাফ রুট প্ল্যানার:** `src/components/staff-route-view.tsx` + `src/app/staff/route/page.tsx`
- **অ্যাডমিন ক্যাটেগরি ও SLA:** `src/components/admin-categories-view.tsx` + `src/app/admin/categories/page.tsx`
- **অ্যাডমিন সিস্টেম সেটিংস:** `src/components/admin-settings-view.tsx` + `src/app/admin/settings/page.tsx`
- **রিপোর্ট ও CSV/PDF এক্সপোর্ট:** `src/components/admin-reports-view.tsx` + `src/app/admin/reports/page.tsx`
- **পাবলিক এলাকা স্কোরকার্ড:** `src/components/areas-public-view.tsx` + `src/app/areas/page.tsx`
- **PWA ও লাইভ স্ট্রিম:** `src/app/manifest.ts`, `public/sw.js`, `src/components/pwa-register.tsx`, `src/components/live-stream-badge.tsx`
- **অ্যাডভান্সড CSS:** `src/app/civicpulse-advanced.css`

---

### ৩.৪ অটোমেটেড টেস্ট (`tests/`)

- `tests/scoring.test.ts` — `priorityParts`, `slaHoursLeft`, `toProgress` টেস্ট
- `tests/ai-triage.test.ts` — বাংলা ও ইংরেজি ইস্যু ক্লাসিফিকেশন টেস্ট
- `tests/rate-limit.test.ts` — রেট লিমিটার বাকেট টেস্ট
- `tests/route-planner.test.ts` — `haversineKm` ও `optimizeFieldRoute` টেস্ট

টেস্ট রান করার কমান্ড:
```bash
./node_modules/.bin/tsx --test tests/*.test.ts
```

*(ঐচ্ছিক পরিবেশ ভেরিয়েবল)*: `.env`-এ `GEMINI_API_KEY` যোগ করলে AI Triage স্বয়ংক্রিয়ভাবে Gemini 2.0 Flash ব্যবহার করবে; না দিলে বিল্ট-ইন বাংলা/ইংরেজি ক্লাসিফায়ার কাজ করবে।

---

## ৪. নতুন যুক্ত কোডের বিস্তারিত স্নিপেট ও ব্যাখ্যা

### ৪.১ কোথায় কোন লাইনে কী যোগ করা হয়েছে (Exact File Locations)

1. **`src/app/layout.tsx` (লাইন ৫ ও ২৯):**
   - গ্লোবাল লেআউটে `./civicpulse-advanced.css` ও `<PwaRegister />` যুক্ত করা হয়েছে যাতে পুরোনো CSS না বদলেই সব নতুন স্টাইল ও অফলাইন Service Worker চালু হয়।
2. **`src/components/app-shell.tsx` (লাইন ৪, ৮, ২৪, ২৬, ২৮, ৩৩–৩৪, ৪৩):**
   - ড্যাশবোর্ড নেভবারে `nav_route` (`/staff/route`), `nav_areas` (`/areas`), `nav_reports` (`/admin/reports`), `nav_cats` (`/admin/categories`), `nav_settings` (`/admin/settings`) এবং `<LiveStreamBadge />` যুক্ত করা হয়েছে।
3. **`src/components/dash-home.tsx` (লাইন ৪ ও ৫১–৫৩):**
   - ড্যাশবোর্ডের কুইক অ্যাকশন বাটনের পাশে রোল অনুযায়ী শর্টকাট বাটন যোগ করা হয়েছে।
4. **`src/components/issue-form.tsx` (লাইন ৬, ২২–২৬, ৬৪–৮১) ও `src/lib/issue-actions.ts` (লাইন ৫৫):**
   - নতুন রিপোর্ট ফর্মে `<IssueAssistant />` ও লুকানো `areaName` ইনপুট যুক্ত করা হয়েছে, এবং `createIssueAction`-এ `areaName` ডাটাবেসে সেভ করার ১ লাইন যোগ করা হয়েছে।
5. **`src/components/issue-detail.tsx` (লাইন ৮, ২২–২৪, ৬২–৮৭, ১২৩–১৪১):**
   - ইস্যু ডিটেইল পেজে `TaskReport`, `duplicateOf`/`duplicates`, `allCats`, এবং `internalNotes` ফেচ করে `<IssueAdvancedPanels />` রেন্ডার করা হয়েছে।

---

### ৪.২ নতুন Server Actions (`src/lib/advanced-actions.ts`)
- `submitTaskReportAction`: স্টাফের কাজের রিপোর্ট (`TaskReport`) ও `COMPLETION` ফটো (`IssueImage`) ট্রানজ্যাকশনে সেভ করে ও `AuditLog` লেখে।
- `saveFeedbackReviewAction`: নাগরিকের `rating` ও লিখিত `comment` `Feedback` টেবিলে আপসার্ট করে।
- `managerTriageAction`: ম্যানেজার/অ্যাডমিনের জন্য `priority` ও `categoryId`/`departmentId` বদলে `slaDueAt` রিক্যালকুলেট করে ও `StatusHistory` + `AuditLog` লেখে।
- `saveInternalNoteAction`: স্টাফ/ম্যানেজার/অ্যাডমিনের প্রাইভেট টিম নোট `AuditLog` (`entity: "InternalNote"`)-এ সংরক্ষণ করে।
- `createCategoryAction` & `updateCategorySlaAction`: নতুন ক্যাটেগরি তৈরি ও `slaHours` আপডেট করে।
- `saveSettingsAction`: `Setting` টেবিলে `duplicateRadiusM`, `maxImages`, `bannerBn`, `bannerEn` সেভ করে।

---

### ৪.৩ নতুন API Routes-এর সংক্ষিপ্ত কোড কাঠামো

#### `src/app/api/geocode/route.ts`
- সেশন ও `checkRateLimit` যাচাই করে বাংলাদেশ বাউন্ডারি (`lat: 20..27`, `lng: 87..93`) চেক করে OpenStreetMap Nominatim থেকে `{ address, areaName }` ফেরত দেয়।

#### `src/app/api/ai-triage/route.ts`
- `POST` বডি Zod দিয়ে ভ্যালিডেট করে `classifyIssue(title, description, cats)` চালিয়ে `{ categoryId, categoryName, priority, source, reason }` ফেরত দেয়।

#### `src/app/api/duplicate-check/route.ts`
- `categoryId`, `lat`, `lng` নিয়ে `±0.00045°` (~৫০ মিটার) বক্সে খোলা ইস্যু খুঁজে থাকলে `{ match: { id, seq, title, upvoteCount, address } }` দেয়।

#### `src/app/api/export/route.ts`
- কেবল `ADMIN` (সব ডেটা) ও `MANAGER` (নিজ ডিপার্টমেন্ট)-এর জন্য `csvCell` ফর্মুলা-ইনজেকশন স্যানিটাইজেশন ও `\uFEFF` UTF-8 BOM সহ `civicpulse-issues-YYYY-MM-DD.csv` ডাউনলোড দেয়।

#### `src/app/api/notifications/stream/route.ts`
- SSE (`text/event-stream`) কানেকশনে প্রতি ৮ সেকেন্ডে ইউজারের আনরিড নোটিফিকেশন সংখ্যা পরিবর্তন হলে `data: {"unread": N, "at": ...}` পুশ করে।

#### `src/app/api/cron/escalate/route.ts`
- `Authorization: Bearer <CRON_SECRET>` যাচাই করে ২৪ ঘণ্টার বেশি SLA ওভারডিউ থাকা ওপেন ইস্যুর জন্য সব অ্যাক্টিভ `ADMIN`-কে `SLA_ESCALATION` নোটিফিকেশন পাঠায়।

---

## ৫. হোম সেকশন সংযোগ, অ্যাডভান্সড 3D সিটি টুইন, AI ভিশন ও জোন ক্লাস্টার ম্যাপ (অতিরিক্ত যুক্ত)

### ৫.১ হোম পেজ (`src/app/page.tsx`) সংযোগ:
- **`<HomeNoticeBanner />` (`src/components/home-live-addons.tsx`):**
  - অ্যাডমিন `/admin/settings`-এ যে `bannerBn` / `bannerEn` সেভ করবে তা `/api/home-highlights` থেকে পড়ে সরাসরি হোম পেজের নেভবারের নিচে লাইভ নোটিশ ব্যানার হিসেবে দেখায়।
- **`<HomeAdvancedSection />` (`src/components/home-live-addons.tsx`):**
  - হোম পেজে `<Areas />` সেকশনের নিচেই নতুন সেকশন `#city3d` যোগ করা হয়েছে, যেখানে:
    1. **Interactive 3D City Pulse Twin (`src/components/city-3d-twin.tsx`)** লাইভ `/api/home-highlights` ডেটা দিয়ে রেন্ডার হয়।
    2. যদি ডাটাবেসে `REPORT` + `COMPLETION` উভয় ছবিযুক্ত কোনো সমাধান করা ইস্যু থাকে, তবে হোম পেজেই লাইভ **Before/After স্লাইডার** দেখায়।
    3. সরাসরি `/city-3d`, `/map/zones`, এবং `/areas` পেজের বাটন থাকে।

### ৫.২ ইন্টার‍্যাক্টিভ 3D সিটি টুইন (`src/components/city-3d-twin.tsx` ও `src/app/city-3d/page.tsx`)
- কাস্টম 3D পার্সপেক্টিভ প্রজেকশন (Yaw, Pitch, Zoom, Painter's Algorithm) দিয়ে তৈরি জিরো-ডিপেন্ডেন্সি ৬০fps HTML5 Canvas 3D শহর।
- মাউস বা টাচ দিয়ে ৩৬০° ঘোরানো যায়, প্রতিটি ঢাকা এলাকার ডেটা ৩D টাওয়ার হিসেবে ওঠে (সবুজ-টিল = সমাধান, অ্যাম্বার/লাল = চলমান, নিচে অ্যানিমেটেড পালস রিং), এবং হোভার/ক্লিকে এলাকার রিপোর্ট দেখায়।

### ৫.৩ অন্যান্য অতিরিক্ত সংযোজন
- **AI Photo Vision Triage (`src/lib/ai-triage.ts` + `src/app/api/ai-triage/route.ts`):** Cloudinary-তে ছবি আপলোড হলে `imageUrl` সহ Gemini Vision-এ পাঠিয়ে ছবি দেখে ক্যাটেগরি শনাক্ত করা যায় (API Key না থাকলে বাংলা/ইংরেজি কীওয়ার্ড ক্লাসিফায়ার চালু থাকে)।
- **Multi-Draft Offline Queue (`src/components/issue-assistant.tsx`):** `cp-offline-queue-v1`-এ একাধিক অফলাইন ড্রাফট কিউ হিসেবে সেভ ও রিস্টোর করা যায়।
- **Browser Desktop Push (`src/components/live-stream-badge.tsx`):** SSE-তে নতুন নোটিফিকেশন এলে ডেস্কটপ `Notification` অ্যালার্ট পাঠায়।
- **Smart Zone & Cluster Map (`src/components/smart-zone-map.tsx` + `src/app/map/zones/page.tsx`):** জুম-ভিত্তিক মার্কার ক্লাস্টারিং + ঢাকার ৫টি জোন পলিগন + ক্যাটেগরি ফিল্টার।
- **Webhook Escalation (`src/app/api/cron/escalate/route.ts`):** `ALERT_WEBHOOK_URL` দেওয়া থাকলে ২৪ ঘণ্টা+ SLA ওভারডিউ হলে এক্সটার্নাল ওয়েবহুকে POST করে।
