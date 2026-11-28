CivicPulse

Smart City Infrastructure Management Platform. Citizens report public infrastructure problems (broken roads, dead streetlights, blocked drains, damaged footpaths, waste); government departments verify, assign, track and resolve them through one transparent workflow, with proof of work, scoring, search and analytics.

Live demo: https://civicpulse-nu-ten.vercel.app/
Source code: https://github.com/mndbobby61-blip/civicpulse
Demo credentials

Password for every account: Demo@1234

Role	Email	Notes
Admin	admin@civicpulse.test	Sees everything, manages users, departments, categories, settings, reports
Department Manager	manager@civicpulse.test	Roads & Highways. manager2 to manager5@civicpulse.test run the other four departments
Maintenance Staff	staff@civicpulse.test	Roads & Highways crew. staff2 to staff24@civicpulse.test for others
Citizen	citizen@civicpulse.test	citizen2 to citizen40@civicpulse.test also exist

New citizens can also sign up at /register. Registration always creates a Citizen; the role is never read from the form.

Tech stack
Area	Technology
Framework	Next.js 16 (App Router, Cache Components / Partial Prerendering), React 19, TypeScript
Styling	Tailwind CSS 4 base + custom CSS design system (gradients, 3D map, glass UI), light and dark mode
Database	PostgreSQL on Neon, Prisma 7 ORM (prisma-client generator, Neon adapter)
Auth	Own implementation: bcryptjs password hashing, signed JWT (jose) in an httpOnly cookie
Validation	Zod
Maps	Leaflet + OpenStreetMap tiles; reverse geocoding through OpenStreetMap Nominatim
3D	Dependency-free HTML5 Canvas 3D city view
Charts	Recharts
Realtime	Server-Sent Events (with reconnect and polling fallback)
Offline / PWA	Web app manifest + service worker (cache version v2)
Images	Cloudinary (unsigned client upload, optional)
AI (optional)	Built-in Bangla/English keyword classifier; Google Gemini when GEMINI_API_KEY is set
Tests	Node test runner via tsx (tests/)
Hosting	Vercel, with daily Vercel Cron jobs
Features
Public (no login)
18-section landing page: animated 3D hero, live statistics from the database, how it works, comparison, features, map preview, before/after slider, area report cards, SLA promises, department leaderboard, security, roadmap, FAQ
Optional notice banner controlled by the admin (Settings page)
Track a report by number, without logging in (title, status, category, area and timeline only; no personal data)
Public area scorecard (/areas): resolution rate, average fix time and rating per area
3D city twin (/city-3d): rotatable Canvas 3D view where each Dhaka area is a tower sized by its report data
Issue map (/map) with status filter, marker clustering (below zoom 14 nearby reports merge into one circle with a count, coloured by the dominant status; above it every report is shown), heatmap mode and a "last N days" slider
Zone map (/map/zones): five Dhaka zones, clustering and category filter
Bangla / English switch, light / dark toggle (both remembered), responsive layout with a mobile menu, installable PWA manifest
Citizen
Report an issue: title, category, description, address, pin on the map or GPS, up to 3 photos (Cloudinary), optional anonymous mode
Smart assistant on the report form:
suggests category and priority from the text (Bangla and English); uses Gemini, including the photo, when an API key is configured
voice input in Bangla or English (browser Speech Recognition; Chromium-based browsers)
address and area name filled automatically from the pin or GPS (reverse geocoding)
live duplicate warning before submitting
offline drafts: unsent reports are kept in the browser (several drafts can be queued) and restored later
Automatic duplicate linking: an open issue of the same category within the configured radius (default about 50 m) is linked and receives an upvote
My reports and a read-only community view of all issues
"Me too" upvotes and comments
Star rating with a written review after a fix
Before / after slider comparing the report photo with the crew's completion photo
Dashboard cards: total reports, resolution rate, average rating given, total points
Civic points, levels (Bronze, Silver, Gold, Platinum), 6 badges and a leaderboard
Department Manager
Sees only their own department's issues
Verify, assign (workload shown, least busy marked with a star), close or reopen
Triage panel: override priority and re-route an issue to another category or department (SLA is recalculated and the change is recorded)
Duplicate cluster card: the original report and all linked duplicates in one place
Internal team notes visible only to staff, managers and admins
Department analytics, including a staff workload chart (active vs completed jobs per person)
CSV, JSON and printable PDF reports for their own department
Maintenance Staff
Sees only issues assigned to them; start work and mark resolved
Submit a work report with completion photos (stored as TaskReport and COMPLETION images)
Field route planner (/staff/route): orders assigned jobs by distance (Haversine, nearest-neighbour) weighted by priority, shows them on a map and links to Google Maps navigation
Admin
Dashboard with City Health Score, analytics charts and the staff workload chart
User management, department management, audit log
Category and SLA manager: create categories and change SLA hours
System settings: duplicate radius, maximum photos, public banner (Bangla and English), saved in the Setting table
Reports (/admin/reports): filter by status and date range, resolution-rate card, per-department progress bars, download CSV (Excel-friendly UTF-8 with BOM, formula-injection safe), JSON (up to 5,000 rows) or a print-ready PDF view
System
Global search in the dashboard header: debounced (280 ms), searches title, address, area, description and category, respects each role's visibility, keyboard friendly (Escape closes)
Issue activity timeline (status changes and comments in time order) and a Print / PDF button on every issue
Priority score (0 to 100), sorting by priority and an "SLA overdue" badge
Notifications: bell dropdown, toast, full page, mark as read
live updates over Server-Sent Events, with automatic reconnect (3 s, 6 s, 12 s, up to 60 s) and a 60 s polling fallback
unread count in the browser tab title, a soft beep (Web Audio, no audio file) and an optional desktop notification while the tab is open
Service worker v2: offline support for static files, a background-sync hook that tells open tabs when an offline draft syncs, a push handler (prepared for future use) and click-through to the right page
Daily SLA overdue alert for managers and a 24 h+ escalation alert for admins (optional webhook)
Rate limiting on the AI, geocoding, duplicate-check and search endpoints
Server-side search (debounced), filters and pagination on lists
Immutable status history and audit logging
Unit tests for scoring, AI triage, rate limiting and route planning
Issue workflow
Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Closed

Every transition stores the previous status, the new status, the user and the timestamp (StatusHistory). All rules are enforced on the server.

Action	Who	From -> To
Start review	Manager (own department) or Admin	Submitted -> Under Review
Assign staff	Manager (own department) or Admin; staff must belong to the same department	Under Review -> Assigned
Start work	The assigned staff member only	Assigned -> In Progress
Mark resolved	The assigned staff member only	In Progress -> Resolved
Close	Manager (own department) or Admin	Resolved -> Closed
Reopen	Manager (own department) or Admin	Resolved -> In Progress
Rate and review	The reporting citizen only	Resolved or Closed
Upvote	Any citizen except the reporter, not on Closed issues	any open status
Change priority / re-route	Manager (own department) or Admin	any open status
Submit work report	Assigned staff or Admin	while assigned or in progress
Internal note	Staff (assigned), Manager (own department), Admin	any
How the scores work

Priority score (0 to 100, open issues only): severity (Low 10, Medium 20, High 30, Critical 40) + votes (1 point each, max 20) + age (2 points per day open, max 20) + SLA overdue (20).

Civic points: report +10, own report resolved +20, rating given +5, each upvote received +1. Levels start at 0, 60, 150 and 300 points. Points are computed from real records every time, never stored, so they cannot drift.

City Health Score (0 to 100): 35% resolution rate + 25% fixes within SLA + 20% citizen satisfaction (average rating / 5) + 20% overdue-free backlog. This formula is our own design, not an official standard.

Duplicate detection: same category, still open, inside a bounding box of about 50 m (configurable) around the new pin.

Field route: nearest-neighbour ordering using Haversine distance, with priority weighting. It is a heuristic, not an optimal solver.

Database design
reports
member of
managed by
owns
classifies
handles
history
work orders
has
has
has
has
duplicate of
assigned to
changed by
writes
gives
gives
receives
has
User
Issue
Department
Category
StatusHistory
Task
Comment
Upvote
Feedback
IssueImage
Notification
TaskReport
Table	Purpose
User	Account, role (ADMIN, MANAGER, STAFF, CITIZEN), department, active flag
Department, Category	Departments and categories (each category has an SLA in hours and an owning department)
Issue	The report: status, priority, address, area name, latitude and longitude, anonymous flag, upvote count, SLA due date, duplicate link
IssueImage	Photo URLs; type REPORT (from the citizen) or COMPLETION (from the crew)
StatusHistory	Immutable log of every status change
Task, TaskReport	Assignment to a staff member and the crew's work reports with photos
Comment, Upvote, Feedback	Engagement; one upvote and one rating per user per issue; Feedback.comment holds the written review
Notification	In-app notifications
AuditLog	Who did what to which record; internal team notes are stored here with entity InternalNote
Setting	System settings (duplicate radius, maximum photos, public banner)

The full schema is in prisma/schema.prisma. Indexes exist on issue status, department and status, category, latitude and longitude, creation date, task assignee and notification recipient.

API documentation

The app mainly uses Next.js Server Actions (server-only functions that re-check the session on every call), plus JSON route handlers.

Server actions
Action	File	Allowed roles	What it does
registerAction, loginAction, logoutAction	lib/auth-actions.ts	Public / any	Account creation, sign-in (only same-site next redirects accepted), sign-out
createIssueAction	lib/issue-actions.ts	Citizen	Validates input and GPS range, links duplicates, saves area name, writes issue, history, notification and audit log in one transaction
updateStatusAction	lib/issue-actions.ts	Admin, Manager, Staff	Moves an issue to the next allowed status
assignAction	lib/issue-actions.ts	Admin, Manager	Assigns a staff member of the same department
feedbackAction	lib/issue-actions.ts	Citizen (reporter)	Saves a 1 to 5 rating
toggleUpvoteAction, addCommentAction, deleteCommentAction	lib/engage-actions.ts	Citizen / role that can see the issue / author, manager, admin	Upvotes and comments
updateUserAction, createDeptAction, toggleDeptAction	lib/admin-actions.ts	Admin	User roles and activation, departments
markAllReadAction, updateProfileAction	lib/account-actions.ts	Logged-in user	Notifications read state, profile and password
submitTaskReportAction	lib/advanced-actions.ts	Staff (assigned), Admin	Saves a work report and completion photos in one transaction
saveFeedbackReviewAction	lib/advanced-actions.ts	Citizen (reporter)	Saves rating and written review
managerTriageAction	lib/advanced-actions.ts	Manager (own department), Admin	Changes priority; re-routes category or department and recalculates SLA
saveInternalNoteAction	lib/advanced-actions.ts	Staff, Manager, Admin	Saves a private team note
createCategoryAction, updateCategorySlaAction, saveSettingsAction	lib/advanced-actions.ts	Admin	Categories, SLA hours and system settings
JSON route handlers
Endpoint	Access	Response
GET /api/me	Public	{ user: { name, role } } or { user: null }
GET /api/notifications	Logged in	Latest 20 notifications of the user
POST /api/notifications	Logged in	Body { ids?: string[] } marks the user's own notifications as read
GET /api/notifications/stream	Logged in	Server-Sent Events: data: {"unread": N} when the count changes
GET /api/search?q=	Logged in, 30 requests per minute	Matching issues. Scope: manager = own department, staff = assigned issues, citizen and admin = all
GET /api/stats, GET /api/areas	Public, cached 60 s	Aggregate figures and top areas
GET /api/home-highlights	Public	Data for the 3D city twin, the banner and the featured before/after
GET /api/track?code=N	Public	Status and timeline of one report; 400 for an invalid number; no personal data
GET /api/geocode?lat=&lng=	Logged in, rate limited	{ address, areaName }; rejects coordinates outside Bangladesh
POST /api/ai-triage	Logged in, rate limited	{ categoryId, categoryName, priority, source, reason }
GET /api/duplicate-check	Logged in, rate limited	Nearby open issue of the same category, if any
GET /api/export	Admin (all), Manager (own department)	CSV by default (UTF-8 BOM, formula-injection safe); ?format=json returns up to 5,000 rows; optional status, from and to filters; includes the reporter's name
GET /api/cron/sla	Authorization: Bearer <CRON_SECRET>	SLA-overdue notification for each department manager
GET /api/cron/escalate	Authorization: Bearer <CRON_SECRET>	Alerts all admins for issues more than 24 h past SLA; optional webhook
Pages
Area	Routes
Public	/, /login, /register, /map, /map/zones, /areas, /city-3d
Citizen	/citizen, /issues, /issues/new, /issues/[id], /leaderboard, /notifications, /profile
Manager	/manager, /issues, /issues/[id], /admin/reports
Staff	/staff, /staff/route, /issues/[id]
Admin	/admin, /admin/users, /admin/departments, /admin/categories, /admin/settings, /admin/reports, /admin/audit

The production build generates 42 routes.

Security and data integrity
bcrypt password hashing; signed JWT sessions in httpOnly, sameSite=lax cookies (secure in production)
The role is never taken from client input; registration always creates a Citizen
Every protected page, server action and private API calls requireRole() or checks the session, rejecting inactive accounts and wrong roles
Managers only touch their department; staff only touch assigned issues; citizens only change their own issues but may read all issues
Search results follow the same visibility rules as the issue lists
Internal notes are never sent to citizens; anonymous reports hide the reporter's name from everyone except managers, admins and the reporter
Exports contain reporter names and are limited to admins and managers (managers: own department only)
Status changes follow a fixed transition table, so a tampered form cannot skip steps
Zod validation everywhere; GPS must be inside Bangladesh; image URLs must come from our Cloudinary account; free text is rendered as text, never HTML
CSV export neutralises spreadsheet formula injection
Multi-table writes run in database transactions
Public endpoints expose no names, emails or staff details; cron endpoints refuse requests without the secret
Rate limiting on AI, geocoding, duplicate-check and search endpoints (in-memory, best effort per server instance)
Seed data

npm run db:seed (same as npx prisma db seed) creates 5 departments, 6 categories, 70 users (1 admin, 5 managers, 24 staff, 40 citizens), 150 issues spread over 10 Dhaka areas with distinct GPS points, status history, tasks and ratings. Running it again resets the data.

Getting started
bash
git clone https://github.com/mndbobby61-blip/civicpulse.git
cd civicpulse
npm install
cp .env.example .env        # fill in the values below
npx prisma migrate dev
npm run db:seed
npm run dev                 # http://localhost:3000
Scripts
Command	Purpose
npm run dev	Development server
npm run build / npm start	Production build and server
npm test	Unit tests
npm run db:seed	Reset and fill the database with demo data
npm run db:studio	Browse the database in the browser (Prisma Studio)
Environment variables
Variable	Required	Description
DATABASE_URL	Yes	Neon pooled connection string (host contains -pooler)
DATABASE_URL_UNPOOLED	Yes	Neon direct connection string, used by the Prisma CLI
AUTH_SECRET	Yes	Random 32+ byte secret for signing sessions
CRON_SECRET	For cron jobs	Secret expected by /api/cron/sla and /api/cron/escalate
NEXT_PUBLIC_CLOUDINARY_CLOUD	Optional	Cloudinary cloud name (photo upload is hidden if missing)
NEXT_PUBLIC_CLOUDINARY_PRESET	Optional	Cloudinary unsigned upload preset
GEMINI_API_KEY	Optional	Enables Gemini for AI triage (text and photo); without it the built-in classifier is used
ALERT_WEBHOOK_URL	Optional	Receives a POST when issues are escalated after 24 h past SLA
Deployment
Push to GitHub and import the repository in Vercel
Add the environment variables above (without quotes)
Deploy. postinstall runs prisma generate, and vercel.json registers two daily cron jobs: /api/cron/sla at 03:00 UTC and /api/cron/escalate at 04:00 UTC
Testing
bash
npm test

Unit tests in tests/ cover priority and SLA scoring, civic level progress, the Bangla/English AI triage classifier, the rate limiter, and the route planner. The full user journeys (issue lifecycle, permission denials, duplicate detection, notifications, search, exports, language and theme switching, responsive layouts) were verified with a manual role-by-role test plan.

Project structure
prisma/            schema.prisma, seed.ts
src/app/           pages (App Router), api/ route handlers, CSS, manifest
src/components/    UI: landing sections, dashboards, forms, maps, charts, 3D city
src/lib/           db, session, permissions, server actions, scoring, AI triage, route planner, rate limiter
public/            service worker
tests/             unit tests
Known limitations
Server-Sent Events can be closed early by serverless hosting; the app reconnects with backoff and falls back to polling every 60 s. Desktop alerts work only while the site is open, not as true background web push
Rate limiting is in-memory, so it is per server instance rather than global
Reverse geocoding relies on the free OpenStreetMap Nominatim service, which has fair-use limits
Voice input needs a browser with Speech Recognition (Chrome, Edge); AI photo analysis needs a Gemini API key
Offline support covers static files and locally saved report drafts; background sync only notifies open tabs
Field routes use a nearest-neighbour heuristic, not an exact optimiser
No email or SMS notifications
The landing page's ticker items, testimonials and the sample before/after drawing are illustrative, not live data