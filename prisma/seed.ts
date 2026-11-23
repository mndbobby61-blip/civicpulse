import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const DAY = 86_400_000;

const DEPTS = [
  { name: "Roads & Highways", nameBn: "সড়ক ও জনপথ" },
  { name: "Power & Lighting", nameBn: "বিদ্যুৎ ও আলো" },
  { name: "Water & Drainage", nameBn: "পানি ও ড্রেনেজ" },
  { name: "Waste Management", nameBn: "বর্জ্য ব্যবস্থাপনা" },
  { name: "Public Works", nameBn: "জনকর্ম" },
];
const CATS = [
  { name: "Road Damage", nameBn: "রাস্তা ভাঙা", icon: "road", sla: 72, d: 0 },
  { name: "Streetlight", nameBn: "স্ট্রিটলাইট", icon: "bulb", sla: 48, d: 1 },
  { name: "Drainage", nameBn: "ড্রেনেজ", icon: "drop", sla: 48, d: 2 },
  { name: "Footpath", nameBn: "ফুটপাত", icon: "walk", sla: 96, d: 4 },
  { name: "Waste Management", nameBn: "বর্জ্য", icon: "trash", sla: 24, d: 3 },
  { name: "Public Infrastructure", nameBn: "জনসেবা অবকাঠামো", icon: "build", sla: 120, d: 4 },
];
const AREAS = [
  ["Mirpur 10", 23.8069, 90.3687], ["Dhanmondi 27", 23.7461, 90.3742],
  ["Uttara Sector 4", 23.8759, 90.3795], ["Mohammadpur", 23.7662, 90.3589],
  ["Gulshan 2", 23.7925, 90.4078], ["Banani", 23.7937, 90.4066],
  ["Motijheel", 23.7330, 90.4172], ["Badda", 23.7806, 90.4258],
  ["Tejgaon", 23.7639, 90.3926], ["Rampura", 23.7612, 90.4210],
] as const;
const NAMES = ["Rahim","Karim","Sumon","Nasrin","Farhana","Jamal","Tania","Hasan","Mitu","Sabbir","Rima","Arif","Shila","Imran","Lipi","Rubel","Mou","Tareq","Sharmin","Kamal"];
const PATH = ["SUBMITTED","UNDER_REVIEW","ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED"] as const;
const PRIO = ["LOW","MEDIUM","HIGH","CRITICAL"] as const;

async function main() {
  console.log("পুরনো ডেটা মুছছি...");
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.feedback.deleteMany();
  await db.upvote.deleteMany();
  await db.comment.deleteMany();
  await db.taskReport.deleteMany();
  await db.task.deleteMany();
  await db.statusHistory.deleteMany();
  await db.issueImage.deleteMany();
  await db.issue.deleteMany();
  await db.category.deleteMany();
  await db.department.updateMany({ data: { managerId: null } });
  await db.user.updateMany({ data: { departmentId: null } });
  await db.user.deleteMany();
  await db.department.deleteMany();

  const hash = await bcrypt.hash("Demo@1234", 10);

  const depts = DEPTS.map((d) => ({ id: randomUUID(), ...d }));
  await db.department.createMany({ data: depts });

  const cats = CATS.map((c) => ({ id: randomUUID(), departmentId: depts[c.d].id, ...c }));
  await db.category.createMany({
    data: cats.map((c) => ({
      id: c.id, name: c.name, nameBn: c.nameBn, icon: c.icon, slaHours: c.sla, departmentId: c.departmentId,
    })),
  });

  const mk = (
    role: "ADMIN" | "MANAGER" | "STAFF" | "CITIZEN",
    name: string,
    email: string,
    departmentId?: string
  ) => ({ id: randomUUID(), name, email, role, passwordHash: hash, departmentId: departmentId ?? null });

  const admin = mk("ADMIN", "System Admin", "admin@civicpulse.test");
  const managers = depts.map((d, i) =>
    mk("MANAGER", `${NAMES[i]} Manager`, i === 0 ? "manager@civicpulse.test" : `manager${i + 1}@civicpulse.test`, d.id)
  );
  const staff = Array.from({ length: 24 }, (_, i) =>
    mk("STAFF", `${NAMES[i % 20]} Staff ${i + 1}`, i === 0 ? "staff@civicpulse.test" : `staff${i + 1}@civicpulse.test`, depts[i % 5].id)
  );
  const citizens = Array.from({ length: 40 }, (_, i) =>
    mk("CITIZEN", `${NAMES[(i + 3) % 20]} ${i + 1}`, i === 0 ? "citizen@civicpulse.test" : `citizen${i + 1}@civicpulse.test`)
  );

  await db.user.createMany({ data: [admin, ...managers, ...staff, ...citizens] });
  for (let i = 0; i < depts.length; i++) {
    await db.department.update({ where: { id: depts[i].id }, data: { managerId: managers[i].id } });
  }

  const issues: any[] = [];
  const history: any[] = [];
  const tasks: any[] = [];
  const feedback: any[] = [];

  for (let n = 0; n < 150; n++) {
    const cat = pick(cats);
    const area = pick([...AREAS]);
    const di = depts.findIndex((d) => d.id === cat.departmentId);
    const manager = managers[di];
    const reporter = pick(citizens);
    const created = new Date(Date.now() - rnd(1, 90) * DAY);
    const idx = pick([0, 1, 2, 3, 4, 4, 5, 5]);
    const status = PATH[idx];
    const id = randomUUID();
    const done = idx >= 4;

    issues.push({
      id,
      title: `${cat.name} near ${area[0]}`,
      description: `Reported ${cat.name.toLowerCase()} issue that needs attention near ${area[0]}.`,
      status,
      priority: pick([...PRIO]),
      address: `${area[0]}, Dhaka`,
      areaName: area[0],
      lat: area[1] + rnd(-0.008, 0.008),
      lng: area[2] + rnd(-0.008, 0.008),
      upvoteCount: Math.floor(rnd(0, 30)),
      reporterId: reporter.id,
      categoryId: cat.id,
      departmentId: cat.departmentId,
      slaDueAt: new Date(created.getTime() + cat.sla * 3_600_000),
      resolvedAt: done ? new Date(created.getTime() + rnd(6, 90) * 3_600_000) : null,
      createdAt: created,
    });

    for (let s = 0; s <= idx; s++) {
      history.push({
        id: randomUUID(),
        issueId: id,
        fromStatus: s === 0 ? null : PATH[s - 1],
        toStatus: PATH[s],
        changedById: s === 0 ? reporter.id : manager.id,
        createdAt: new Date(created.getTime() + s * 4 * 3_600_000),
      });
    }

    if (idx >= 2) {
      const worker = pick(staff.filter((u) => u.departmentId === cat.departmentId));
      tasks.push({
        id: randomUUID(),
        issueId: id,
        assigneeId: worker.id,
        assignerId: manager.id,
        deadline: new Date(created.getTime() + cat.sla * 3_600_000),
        status: idx === 2 ? "PENDING" : idx === 3 ? "IN_PROGRESS" : "COMPLETED",
        completedAt: done ? new Date(created.getTime() + rnd(6, 90) * 3_600_000) : null,
      });
    }

    if (idx === 5) {
      feedback.push({ id: randomUUID(), issueId: id, userId: reporter.id, rating: 3 + Math.floor(rnd(0, 3)) });
    }
  }

  await db.issue.createMany({ data: issues });
  await db.statusHistory.createMany({ data: history });
  await db.task.createMany({ data: tasks });
  await db.feedback.createMany({ data: feedback });

  console.log(
    `তৈরি হয়েছে: ${depts.length} বিভাগ, ${managers.length + staff.length + citizens.length + 1} ইউজার, ${issues.length} ইস্যু, ${tasks.length} টাস্ক`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());