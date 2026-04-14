import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new PrismaPg({ connectionString: process.env.JOB_SERVICE_DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

// Helper: date N days ago
function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const statusData = [
  { id: "New",              sequence: 0 },
  { id: "Pending Interview", sequence: 1 },
  { id: "Pending Offer",    sequence: 2 },
  { id: "Rejected",         sequence: 3 },
  { id: "Accepted",         sequence: 4 },
];

// Each entry: applicant record from the recruiter's perspective.
// title   = role applied for
// company = hiring team / business unit
// statuses = chronological pipeline steps (oldest first)
const applicants: Array<{
  title: string;
  company: string;
  department: string;
  location: string;
  notes: string;
  userId: string;
  statuses: Array<{ statusId: string; createdAt: Date }>;
}> = [
  // ── Engineering (10) ────────────────────────────────────────────────────────
  {
    title: "Alex Chen — Senior Frontend Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "San Francisco, CA",
    notes: "Strong React & TypeScript background. Portfolio includes several high-traffic SPAs.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(30) }],
  },
  {
    title: "Maria Rodriguez — Backend Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Remote",
    notes: "5 years Go and Kubernetes. Good culture-fit signals from phone screen.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(45) },
      { statusId: "Pending Interview", createdAt: daysAgo(38) },
    ],
  },
  {
    title: "James Kim — Full Stack Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Austin, TX",
    notes: "Node + React combo. Currently employed — notice period is 4 weeks.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(60) },
      { statusId: "Pending Interview", createdAt: daysAgo(53) },
      { statusId: "Pending Offer",    createdAt: daysAgo(46) },
    ],
  },
  {
    title: "Sarah Johnson — DevOps Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Chicago, IL",
    notes: "Solid AWS/Terraform skills but weak on incident management experience.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",      createdAt: daysAgo(50) },
      { statusId: "Rejected", createdAt: daysAgo(43) },
    ],
  },
  {
    title: "Michael Lee — Senior Backend Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "New York, NY",
    notes: "Outstanding system-design round. Accepted offer, starting 2026-05-01.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(70) },
      { statusId: "Pending Interview", createdAt: daysAgo(63) },
      { statusId: "Accepted",         createdAt: daysAgo(56) },
    ],
  },
  {
    title: "Emma Wilson — Mobile Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Seattle, WA",
    notes: "React Native specialist. iOS-only experience; Android coverage is thin.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(25) },
      { statusId: "Pending Interview", createdAt: daysAgo(18) },
    ],
  },
  {
    title: "David Park — Data Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Remote",
    notes: "Applied via referral from the data team. Spark & dbt experience confirmed.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(10) }],
  },
  {
    title: "Priya Patel — Machine Learning Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Boston, MA",
    notes: "PhD in NLP from MIT. Published 3 papers. Competitive offer likely needed.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(55) },
      { statusId: "Pending Interview", createdAt: daysAgo(48) },
      { statusId: "Pending Offer",    createdAt: daysAgo(41) },
    ],
  },
  {
    title: "Ryan Thompson — Staff Engineer",
    company: "TechCorp",
    department: "Engineering",
    location: "Denver, CO",
    notes: "Leadership experience limited to tech lead roles. Did not meet staff-level bar.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",      createdAt: daysAgo(40) },
      { statusId: "Rejected", createdAt: daysAgo(33) },
    ],
  },
  {
    title: "Lisa Chang — Engineering Manager",
    company: "TechCorp",
    department: "Engineering",
    location: "San Francisco, CA",
    notes: "Managed teams of 8–12 at two previous companies. Strong on delivery metrics.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(20) },
      { statusId: "Pending Interview", createdAt: daysAgo(13) },
    ],
  },

  // ── Product (5) ──────────────────────────────────────────────────────────────
  {
    title: "Tom Baker — Product Manager",
    company: "TechCorp",
    department: "Product",
    location: "San Francisco, CA",
    notes: "Shipped two 0-to-1 products. Excellent stakeholder alignment skills.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(80) },
      { statusId: "Pending Interview", createdAt: daysAgo(73) },
      { statusId: "Pending Offer",    createdAt: daysAgo(66) },
      { statusId: "Accepted",         createdAt: daysAgo(59) },
    ],
  },
  {
    title: "Rachel Green — Senior Product Manager",
    company: "TechCorp",
    department: "Product",
    location: "New York, NY",
    notes: "B2B SaaS PM with strong data literacy. Waiting on hiring manager sign-off.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(35) },
      { statusId: "Pending Interview", createdAt: daysAgo(28) },
    ],
  },
  {
    title: "Carlos Mendez — Associate PM",
    company: "TechCorp",
    department: "Product",
    location: "Remote",
    notes: "Recent APM programme graduate. Needs mentorship but high potential.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(8) }],
  },
  {
    title: "Nina Okafor — UX Researcher",
    company: "TechCorp",
    department: "Product",
    location: "London, UK",
    notes: "Timezone overlap is a concern. Strong mixed-methods portfolio.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(42) },
      { statusId: "Pending Interview", createdAt: daysAgo(35) },
      { statusId: "Rejected",         createdAt: daysAgo(28) },
    ],
  },
  {
    title: "Ethan Brown — Product Analyst",
    company: "TechCorp",
    department: "Product",
    location: "Chicago, IL",
    notes: "SQL and Amplitude-heavy background. Will complement the PM team well.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(5) }],
  },

  // ── Design (4) ───────────────────────────────────────────────────────────────
  {
    title: "Sophie Martin — UI Designer",
    company: "TechCorp",
    department: "Design",
    location: "Paris, France",
    notes: "Figma expert. Portfolio is top-tier. Negotiating relocation package.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(50) },
      { statusId: "Pending Interview", createdAt: daysAgo(43) },
      { statusId: "Pending Offer",    createdAt: daysAgo(36) },
    ],
  },
  {
    title: "Jack Wilson — Brand Designer",
    company: "TechCorp",
    department: "Design",
    location: "Austin, TX",
    notes: "Strong brand identity work but limited product/digital-first experience.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",      createdAt: daysAgo(38) },
      { statusId: "Rejected", createdAt: daysAgo(31) },
    ],
  },
  {
    title: "Yuki Tanaka — Product Designer",
    company: "TechCorp",
    department: "Design",
    location: "Tokyo, Japan (Remote)",
    notes: "Async-first worker. Excellent mobile UI patterns in portfolio.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(22) },
      { statusId: "Pending Interview", createdAt: daysAgo(15) },
    ],
  },
  {
    title: "Aiden Murphy — Senior UX Designer",
    company: "TechCorp",
    department: "Design",
    location: "Dublin, Ireland",
    notes: "10 years in fintech UX. Wants fully-remote arrangement.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(7) }],
  },

  // ── Marketing (4) ────────────────────────────────────────────────────────────
  {
    title: "Isabella Turner — Marketing Manager",
    company: "TechCorp",
    department: "Marketing",
    location: "San Francisco, CA",
    notes: "Grew previous company's MQL pipeline by 3× in 18 months. Offer accepted.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(75) },
      { statusId: "Pending Interview", createdAt: daysAgo(68) },
      { statusId: "Accepted",         createdAt: daysAgo(61) },
    ],
  },
  {
    title: "Oliver Scott — Growth Marketer",
    company: "TechCorp",
    department: "Marketing",
    location: "Remote",
    notes: "Paid acquisition specialist. Strong ROAS track record across Google and Meta.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(18) },
      { statusId: "Pending Interview", createdAt: daysAgo(11) },
    ],
  },
  {
    title: "Amelia Davis — Content Strategist",
    company: "TechCorp",
    department: "Marketing",
    location: "Boston, MA",
    notes: "Deep B2B SaaS content experience. Organic traffic case studies impressive.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(12) }],
  },
  {
    title: "Noah White — Performance Marketer",
    company: "TechCorp",
    department: "Marketing",
    location: "New York, NY",
    notes: "Salary expectations exceed band. No flexibility indicated.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",      createdAt: daysAgo(33) },
      { statusId: "Rejected", createdAt: daysAgo(26) },
    ],
  },

  // ── Sales (4) ─────────────────────────────────────────────────────────────────
  {
    title: "Liam Harris — Account Executive",
    company: "TechCorp",
    department: "Sales",
    location: "Chicago, IL",
    notes: "Consistent 120%+ quota attainment over 3 years. Strong enterprise deal history.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(48) },
      { statusId: "Pending Interview", createdAt: daysAgo(41) },
      { statusId: "Pending Offer",    createdAt: daysAgo(34) },
    ],
  },
  {
    title: "Ava Martinez — Sales Development Rep",
    company: "TechCorp",
    department: "Sales",
    location: "Austin, TX",
    notes: "High energy, excellent cold-call conversion rate. Fresh grad but promising.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(15) },
      { statusId: "Pending Interview", createdAt: daysAgo(8) },
    ],
  },
  {
    title: "William Clark — Senior Account Executive",
    company: "TechCorp",
    department: "Sales",
    location: "Remote",
    notes: "Specialises in EMEA enterprise. Currently serving gardening leave.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(6) }],
  },
  {
    title: "Charlotte Lewis — Sales Manager",
    company: "TechCorp",
    department: "Sales",
    location: "Seattle, WA",
    notes: "Management style feedback from reference check raised concerns.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",      createdAt: daysAgo(44) },
      { statusId: "Rejected", createdAt: daysAgo(37) },
    ],
  },

  // ── Operations & Support (3) ─────────────────────────────────────────────────
  {
    title: "Benjamin Hall — Operations Manager",
    company: "TechCorp",
    department: "Operations",
    location: "Denver, CO",
    notes: "Process improvement background. Reduced COGS by 18% at previous company.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(27) },
      { statusId: "Pending Interview", createdAt: daysAgo(20) },
    ],
  },
  {
    title: "Mia Young — HR Business Partner",
    company: "TechCorp",
    department: "People",
    location: "San Francisco, CA",
    notes: "Scaled HR function from 80 to 350 employees at a Series B startup. Offer accepted.",
    userId: "recruiter-1",
    statuses: [
      { statusId: "New",              createdAt: daysAgo(90) },
      { statusId: "Pending Interview", createdAt: daysAgo(83) },
      { statusId: "Pending Offer",    createdAt: daysAgo(76) },
      { statusId: "Accepted",         createdAt: daysAgo(69) },
    ],
  },
  {
    title: "Lucas Allen — Finance Analyst",
    company: "TechCorp",
    department: "Finance",
    location: "New York, NY",
    notes: "CFA Level II candidate. Strong FP&A and SaaS metrics experience.",
    userId: "recruiter-1",
    statuses: [{ statusId: "New", createdAt: daysAgo(4) }],
  },
];

async function main() {
  console.log("Truncating tables...");
  await prisma.jobStatus.deleteMany();
  await prisma.job.deleteMany();
  await prisma.status.deleteMany();

  console.log("Seeding statuses...");
  for (const s of statusData) {
    await prisma.status.create({ data: s });
    console.log(`  ✓ Status: ${s.id}`);
  }

  console.log("Seeding applicants...");
  for (const applicant of applicants) {
    const { statuses, ...jobFields } = applicant;
    const job = await prisma.job.create({ data: jobFields });
    for (const s of statuses) {
      await prisma.jobStatus.create({
        data: { jobId: job.id, statusId: s.statusId, createdAt: s.createdAt },
      });
    }
    const currentStatus = statuses[statuses.length - 1].statusId;
    console.log(`  ✓ ${job.title} [${currentStatus}]`);
  }

  console.log(`\nDone — seeded ${applicants.length} applicants.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
