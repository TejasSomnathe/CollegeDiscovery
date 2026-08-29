/**
 * Seed script — generates plausible but entirely fictional college data.
 * Run with: npx tsx src/db/seed.ts
 *
 * All names, stats, and details are original and fabricated for demonstration.
 * No real institution data was copied from any source.
 */

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

// Load the database environment file when this runs outside Next.js.
import { config } from "dotenv";
config({ path: ".env", override: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── College Definitions ──────────────────────────────────────────────────────

const collegeData = [
  // ── Engineering ──
  {
    name: "Apex Institute of Technology",
    city: "Bengaluru",
    state: "Karnataka",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 1998,
    overview:
      "Apex Institute of Technology is a premier private engineering college known for its industry partnerships and hands-on curriculum. With state-of-the-art labs and a robust placement cell, AIT consistently ranks among the top private engineering colleges in South India.",
    feesMin: 180000,
    feesMax: 240000,
    avgRating: 4.3,
    accreditation: "A+",
    topPackage: 42,
    avgPackage: 12.5,
    medianPackage: 10.2,
    placement: 94,
    recruiters: ["Infosys", "Wipro", "Google", "Microsoft", "Amazon"],
    courses: [
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 240000, seats: 120, eligibility: "10+2 with PCM, JEE score" },
      { name: "Electronics & Communication", degree: "B.Tech", duration: 4, fees: 220000, seats: 60, eligibility: "10+2 with PCM, JEE score" },
      { name: "Mechanical Engineering", degree: "B.Tech", duration: 4, fees: 200000, seats: 60, eligibility: "10+2 with PCM, JEE score" },
      { name: "M.Tech Computer Science", degree: "M.Tech", duration: 2, fees: 180000, seats: 30, eligibility: "B.Tech/B.E., GATE score" },
    ],
  },
  {
    name: "National Institute of Engineering Excellence",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "GOVERNMENT" as const,
    stream: "Engineering",
    established: 1959,
    overview:
      "NIEE is a government-funded institution offering world-class engineering education. Established in 1959, it has produced graduates who lead major corporations and research labs globally. Known for rigorous academics and a vibrant research culture.",
    feesMin: 25000,
    feesMax: 85000,
    avgRating: 4.7,
    accreditation: "A++",
    topPackage: 68,
    avgPackage: 18.4,
    medianPackage: 14.5,
    placement: 98,
    recruiters: ["TCS", "HCL", "Samsung", "Intel", "NVIDIA", "Google"],
    courses: [
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 85000, seats: 60, eligibility: "JEE Advanced top 5000 rank" },
      { name: "Electrical Engineering", degree: "B.Tech", duration: 4, fees: 70000, seats: 60, eligibility: "JEE Advanced top 8000 rank" },
      { name: "Civil Engineering", degree: "B.Tech", duration: 4, fees: 60000, seats: 60, eligibility: "JEE Advanced top 10000 rank" },
      { name: "M.Tech VLSI Design", degree: "M.Tech", duration: 2, fees: 25000, seats: 20, eligibility: "B.Tech ECE, GATE score ≥ 650" },
      { name: "Ph.D Engineering Sciences", degree: "Ph.D", duration: 4, fees: 15000, seats: 10, eligibility: "M.Tech/M.E., research proposal" },
    ],
  },
  {
    name: "Zephyr College of Engineering",
    city: "Pune",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2003,
    overview:
      "Zephyr College combines traditional engineering fundamentals with cutting-edge electives in AI, robotics, and green energy. Its Innovation Hub connects students with Pune's thriving startup ecosystem.",
    feesMin: 160000,
    feesMax: 210000,
    avgRating: 3.9,
    accreditation: "A",
    topPackage: 28,
    avgPackage: 9.2,
    medianPackage: 7.8,
    placement: 87,
    recruiters: ["Cognizant", "Capgemini", "L&T", "Bajaj Auto", "Bosch"],
    courses: [
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 210000, seats: 120, eligibility: "10+2 PCM ≥ 60%, MHT-CET" },
      { name: "Artificial Intelligence & ML", degree: "B.Tech", duration: 4, fees: 210000, seats: 60, eligibility: "10+2 PCM ≥ 60%, MHT-CET" },
      { name: "Robotics & Automation", degree: "B.Tech", duration: 4, fees: 200000, seats: 30, eligibility: "10+2 PCM ≥ 60%, MHT-CET" },
    ],
  },
  {
    name: "Meridian Technical University",
    city: "Hyderabad",
    state: "Telangana",
    type: "DEEMED" as const,
    stream: "Engineering",
    established: 1994,
    overview:
      "A deemed university status institution, Meridian Technical University offers integrated B.Tech–M.Tech programs and has strong collaboration with Hyderabad's pharmaceutical and IT sectors.",
    feesMin: 200000,
    feesMax: 280000,
    avgRating: 4.1,
    accreditation: "A+",
    topPackage: 35,
    avgPackage: 11.8,
    medianPackage: 9.6,
    placement: 91,
    recruiters: ["Dr. Reddy's", "TCS", "Deloitte", "Accenture", "Qualcomm"],
    courses: [
      { name: "Computer Science & Engineering", degree: "B.Tech", duration: 4, fees: 280000, seats: 180, eligibility: "10+2 PCM, EAMCET/JEE score" },
      { name: "Integrated B.Tech-M.Tech CSE", degree: "Integrated", duration: 5, fees: 260000, seats: 60, eligibility: "10+2 PCM ≥ 75%, JEE score" },
      { name: "Data Science & Analytics", degree: "B.Tech", duration: 4, fees: 270000, seats: 60, eligibility: "10+2 PCM ≥ 60%" },
    ],
  },
  {
    name: "Frontier Institute of Science & Technology",
    city: "Jaipur",
    state: "Rajasthan",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2007,
    overview:
      "FIST focuses on affordable quality engineering education for students from Rajasthan and neighboring states. Known for its strong alumni network in the Gulf and consistent placement in core engineering companies.",
    feesMin: 120000,
    feesMax: 170000,
    avgRating: 3.6,
    accreditation: "B++",
    topPackage: 22,
    avgPackage: 7.4,
    medianPackage: 6.2,
    placement: 79,
    recruiters: ["Tata Projects", "BHEL", "NTPC", "Larsen & Toubro", "HCL"],
    courses: [
      { name: "Civil Engineering", degree: "B.Tech", duration: 4, fees: 140000, seats: 60, eligibility: "10+2 PCM, REAP score" },
      { name: "Mechanical Engineering", degree: "B.Tech", duration: 4, fees: 150000, seats: 60, eligibility: "10+2 PCM, REAP score" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 170000, seats: 120, eligibility: "10+2 PCM, REAP score" },
    ],
  },
  {
    name: "Coastal Engineering College",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    type: "GOVERNMENT" as const,
    stream: "Engineering",
    established: 1962,
    overview:
      "One of the oldest government engineering colleges on the eastern coast, CEC excels in marine, civil, and mechanical engineering. Strong ties with the Port Trust and Steel Authority of India.",
    feesMin: 20000,
    feesMax: 60000,
    avgRating: 4.0,
    accreditation: "A",
    topPackage: 24,
    avgPackage: 8.6,
    medianPackage: 7.1,
    placement: 85,
    recruiters: ["SAIL", "Vizag Steel", "TCS", "Wipro", "L&T"],
    courses: [
      { name: "Marine Engineering", degree: "B.Tech", duration: 4, fees: 60000, seats: 30, eligibility: "10+2 PCM ≥ 65%, EAMCET" },
      { name: "Civil Engineering", degree: "B.Tech", duration: 4, fees: 50000, seats: 60, eligibility: "10+2 PCM, EAMCET" },
      { name: "Mechanical Engineering", degree: "B.Tech", duration: 4, fees: 50000, seats: 60, eligibility: "10+2 PCM, EAMCET" },
    ],
  },

  // ── Medical ──
  {
    name: "Luminary Medical College & Hospital",
    city: "Mumbai",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Medical",
    established: 1985,
    overview:
      "Luminary Medical College is affiliated with one of Mumbai's largest teaching hospitals. The college offers MBBS, MD, and allied health science programs with over 800 in-patient beds for clinical training.",
    feesMin: 1200000,
    feesMax: 2000000,
    avgRating: 4.4,
    accreditation: "A+",
    topPackage: 22,
    avgPackage: 12.0,
    medianPackage: 10.5,
    placement: 99,
    recruiters: ["Apollo", "Fortis", "Manipal Hospitals", "Max Healthcare", "AIIMS"],
    courses: [
      { name: "MBBS", degree: "MBBS", duration: 5.5, fees: 2000000, seats: 150, eligibility: "10+2 PCB ≥ 60%, NEET score" },
      { name: "MD General Medicine", degree: "MD", duration: 3, fees: 1500000, seats: 30, eligibility: "MBBS + NEET PG score" },
      { name: "B.Sc Nursing", degree: "B.Sc", duration: 4, fees: 400000, seats: 60, eligibility: "10+2 PCB ≥ 45%, NEET score" },
    ],
  },
  {
    name: "Government Medical College, Mysuru",
    city: "Mysuru",
    state: "Karnataka",
    type: "GOVERNMENT" as const,
    stream: "Medical",
    established: 1924,
    overview:
      "One of Karnataka's oldest and most prestigious government medical institutions. GMC Mysuru offers subsidised medical education and serves as a referral centre for the Mysuru and Kodagu districts.",
    feesMin: 30000,
    feesMax: 80000,
    avgRating: 4.5,
    accreditation: "A++",
    topPackage: 18,
    avgPackage: 10.2,
    medianPackage: 9.0,
    placement: 100,
    recruiters: ["Government Hospitals", "NIMHANS", "KMC", "Apollo", "Manipal"],
    courses: [
      { name: "MBBS", degree: "MBBS", duration: 5.5, fees: 80000, seats: 150, eligibility: "10+2 PCB ≥ 50%, NEET score, state quota" },
      { name: "MD Paediatrics", degree: "MD", duration: 3, fees: 30000, seats: 10, eligibility: "MBBS + NEET PG" },
      { name: "MS General Surgery", degree: "MS", duration: 3, fees: 30000, seats: 10, eligibility: "MBBS + NEET PG" },
    ],
  },
  {
    name: "Pioneer Dental & Medical Sciences",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "PRIVATE" as const,
    stream: "Medical",
    established: 2001,
    overview:
      "Pioneer Dental & Medical Sciences offers BDS, MBBS, and paramedical programs in Lucknow. Its Dental hospital is one of UP's busiest, giving students unparalleled clinical exposure.",
    feesMin: 800000,
    feesMax: 1500000,
    avgRating: 3.7,
    accreditation: "A",
    topPackage: 14,
    avgPackage: 9.0,
    medianPackage: 8.0,
    placement: 92,
    recruiters: ["Medanta", "Max Healthcare", "HCG Oncology", "Sahara Hospital"],
    courses: [
      { name: "BDS", degree: "BDS", duration: 4, fees: 1000000, seats: 100, eligibility: "10+2 PCB ≥ 50%, NEET score" },
      { name: "MBBS", degree: "MBBS", duration: 5.5, fees: 1500000, seats: 100, eligibility: "10+2 PCB ≥ 50%, NEET score" },
    ],
  },

  // ── Management ──
  {
    name: "Vanguard School of Business",
    city: "Mumbai",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Management",
    established: 1993,
    overview:
      "VSB is a globally ranked business school offering full-time MBA, executive MBA, and specialized masters programs. Its Finance and Strategy tracks attract top talent from across India and internationally.",
    feesMin: 1800000,
    feesMax: 2400000,
    avgRating: 4.6,
    accreditation: "A++",
    topPackage: 85,
    avgPackage: 32.5,
    medianPackage: 26.0,
    placement: 100,
    recruiters: ["McKinsey", "BCG", "Goldman Sachs", "JPMorgan", "Amazon", "Bain"],
    courses: [
      { name: "MBA Finance", degree: "MBA", duration: 2, fees: 2400000, seats: 60, eligibility: "Graduate degree, CAT/GMAT score, work experience" },
      { name: "MBA Marketing", degree: "MBA", duration: 2, fees: 2400000, seats: 60, eligibility: "Graduate degree, CAT/GMAT score" },
      { name: "MBA Operations", degree: "MBA", duration: 2, fees: 2200000, seats: 40, eligibility: "Graduate degree, CAT score" },
      { name: "Executive MBA", degree: "EMBA", duration: 1, fees: 1800000, seats: 30, eligibility: "5+ years work experience, GMAT/GRE" },
    ],
  },
  {
    name: "Cornerstone Institute of Management",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "GOVERNMENT" as const,
    stream: "Management",
    established: 1962,
    overview:
      "CIM Ahmedabad is a premier government management institution modelled on case-study pedagogy. Known for its entrepreneur alumni network and strong relationship with Gujarat's MSME sector.",
    feesMin: 600000,
    feesMax: 900000,
    avgRating: 4.8,
    accreditation: "A++",
    topPackage: 75,
    avgPackage: 28.6,
    medianPackage: 22.0,
    placement: 100,
    recruiters: ["Reliance", "Tata Group", "Aditya Birla", "BCG", "Deloitte"],
    courses: [
      { name: "PGDM (Post Graduate Diploma in Management)", degree: "PGDM", duration: 2, fees: 900000, seats: 180, eligibility: "Graduate degree, CAT score ≥ 95 percentile" },
      { name: "PGDM Agriculture Management", degree: "PGDM", duration: 2, fees: 700000, seats: 60, eligibility: "Graduate (any), CAT score" },
    ],
  },
  {
    name: "Zenith Business School",
    city: "Delhi",
    state: "Delhi",
    type: "PRIVATE" as const,
    stream: "Management",
    established: 2005,
    overview:
      "Zenith Business School leverages its Delhi NCR location to provide unmatched industry immersion. Weekly CEO talks, live consulting projects, and a powerful alumni network define the Zenith experience.",
    feesMin: 1400000,
    feesMax: 1800000,
    avgRating: 4.2,
    accreditation: "A+",
    topPackage: 52,
    avgPackage: 22.4,
    medianPackage: 18.0,
    placement: 98,
    recruiters: ["KPMG", "EY", "Flipkart", "Paytm", "HUL", "ITC"],
    courses: [
      { name: "MBA General Management", degree: "MBA", duration: 2, fees: 1800000, seats: 120, eligibility: "Graduate, CAT/XAT/GMAT" },
      { name: "MBA Digital Marketing & Analytics", degree: "MBA", duration: 2, fees: 1600000, seats: 60, eligibility: "Graduate, CAT/XAT" },
    ],
  },
  {
    name: "Eastbourne Institute of Business Studies",
    city: "Kolkata",
    state: "West Bengal",
    type: "PRIVATE" as const,
    stream: "Management",
    established: 1999,
    overview:
      "EIBS is Eastern India's most respected private B-school. Its Rural Management and Social Enterprise specializations are nationally recognized, and its Kolkata alumni command respect across Bengal's industry.",
    feesMin: 800000,
    feesMax: 1200000,
    avgRating: 3.8,
    accreditation: "A",
    topPackage: 38,
    avgPackage: 15.6,
    medianPackage: 12.5,
    placement: 95,
    recruiters: ["ITC", "Emami", "CEAT", "HDFC Bank", "Accenture"],
    courses: [
      { name: "MBA Rural Management", degree: "MBA", duration: 2, fees: 900000, seats: 60, eligibility: "Graduate, CAT/MAT score" },
      { name: "MBA Marketing", degree: "MBA", duration: 2, fees: 1200000, seats: 120, eligibility: "Graduate, CAT/XAT/GMAT" },
    ],
  },

  // ── Arts & Science ──
  {
    name: "Horizon College of Arts & Sciences",
    city: "Delhi",
    state: "Delhi",
    type: "GOVERNMENT" as const,
    stream: "Arts",
    established: 1952,
    overview:
      "One of Delhi's most storied liberal arts institutions, Horizon College has produced journalists, politicians, authors, and academics. Its humanities research output is among the highest of any Indian undergraduate college.",
    feesMin: 15000,
    feesMax: 35000,
    avgRating: 4.4,
    accreditation: "A++",
    topPackage: 18,
    avgPackage: 7.2,
    medianPackage: 5.5,
    placement: 72,
    recruiters: ["Times of India", "NDTV", "Penguin Random House", "NGO Sector", "Civil Services"],
    courses: [
      { name: "B.A. (Hons) English", degree: "B.A. (Hons)", duration: 3, fees: 30000, seats: 60, eligibility: "10+2 any stream, 95%+ aggregate (merit)" },
      { name: "B.A. (Hons) Economics", degree: "B.A. (Hons)", duration: 3, fees: 30000, seats: 60, eligibility: "10+2 any stream, merit" },
      { name: "B.A. (Hons) Political Science", degree: "B.A. (Hons)", duration: 3, fees: 25000, seats: 60, eligibility: "10+2 any stream, merit" },
      { name: "M.A. History", degree: "M.A.", duration: 2, fees: 35000, seats: 30, eligibility: "B.A. with ≥ 55%, entrance exam" },
    ],
  },
  {
    name: "Aurora College of Science",
    city: "Pune",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Arts",
    established: 1978,
    overview:
      "Aurora College of Science blends traditional science education with interdisciplinary electives in psychology, environmental studies, and data analytics. A top destination for students seeking B.Sc programs in Pune.",
    feesMin: 40000,
    feesMax: 90000,
    avgRating: 3.9,
    accreditation: "A",
    topPackage: 12,
    avgPackage: 5.8,
    medianPackage: 4.5,
    placement: 68,
    recruiters: ["Wipro", "ISRO", "Thermax", "Symbiosis", "Research Institutions"],
    courses: [
      { name: "B.Sc Computer Science", degree: "B.Sc", duration: 3, fees: 90000, seats: 120, eligibility: "10+2 PCM/PCB, merit" },
      { name: "B.Sc Life Sciences", degree: "B.Sc", duration: 3, fees: 60000, seats: 60, eligibility: "10+2 PCB, merit" },
      { name: "M.Sc Data Science", degree: "M.Sc", duration: 2, fees: 80000, seats: 30, eligibility: "B.Sc with Math/Stats, entrance" },
    ],
  },
  {
    name: "Indus Valley Cultural College",
    city: "Vadodara",
    state: "Gujarat",
    type: "GOVERNMENT" as const,
    stream: "Arts",
    established: 1949,
    overview:
      "IVCC specialises in fine arts, performing arts, and regional languages. Its museum-quality art gallery and annual theatre festival attract students from across the country.",
    feesMin: 10000,
    feesMax: 25000,
    avgRating: 4.1,
    accreditation: "A",
    topPackage: 8,
    avgPackage: 3.5,
    medianPackage: 3.0,
    placement: 55,
    recruiters: ["National Gallery of Modern Art", "Doordarshan", "Publishing Houses", "Film Industry"],
    courses: [
      { name: "B.F.A. Painting", degree: "B.F.A.", duration: 4, fees: 20000, seats: 30, eligibility: "10+2 any, portfolio + interview" },
      { name: "B.A. Performing Arts", degree: "B.A.", duration: 3, fees: 15000, seats: 40, eligibility: "10+2 any, audition" },
      { name: "M.F.A. Sculpture", degree: "M.F.A.", duration: 2, fees: 25000, seats: 15, eligibility: "B.F.A., portfolio" },
    ],
  },
  {
    name: "Pinnacle College of Sciences",
    city: "Bhopal",
    state: "Madhya Pradesh",
    type: "PRIVATE" as const,
    stream: "Arts",
    established: 2010,
    overview:
      "Pinnacle College of Sciences offers modern B.Sc and M.Sc programs with strong emphasis on practical lab work and industry internships. Affordable fees with good placement in pharma and biotech companies.",
    feesMin: 55000,
    feesMax: 100000,
    avgRating: 3.5,
    accreditation: "B++",
    topPackage: 10,
    avgPackage: 4.8,
    medianPackage: 4.0,
    placement: 62,
    recruiters: ["Sun Pharma", "Cipla", "IOCL Research", "Biocon", "Regional Labs"],
    courses: [
      { name: "B.Sc Chemistry (Hons)", degree: "B.Sc", duration: 3, fees: 80000, seats: 60, eligibility: "10+2 PCM/PCB ≥ 50%" },
      { name: "M.Sc Biotechnology", degree: "M.Sc", duration: 2, fees: 100000, seats: 30, eligibility: "B.Sc Life Sciences ≥ 55%" },
    ],
  },

  // ── Law ──
  {
    name: "National Academy of Legal Studies",
    city: "Hyderabad",
    state: "Telangana",
    type: "GOVERNMENT" as const,
    stream: "Law",
    established: 1998,
    overview:
      "NALS is among India's top-ranked government law schools, known for moot court traditions, legal aid clinics, and outstanding bar exam results. Its integrated 5-year program attracts the country's top legal talent.",
    feesMin: 60000,
    feesMax: 130000,
    avgRating: 4.6,
    accreditation: "A++",
    topPackage: 22,
    avgPackage: 12.5,
    medianPackage: 10.0,
    placement: 96,
    recruiters: ["Supreme Court Chambers", "AZB & Partners", "Cyril Amarchand", "Luthra & Luthra", "World Bank Legal"],
    courses: [
      { name: "B.A. LL.B. (Hons)", degree: "B.A. LL.B.", duration: 5, fees: 130000, seats: 120, eligibility: "10+2 any ≥ 45%, CLAT score" },
      { name: "LL.M. Corporate Law", degree: "LL.M.", duration: 1, fees: 100000, seats: 30, eligibility: "LL.B./B.A. LL.B., CLAT PG" },
      { name: "B.Com LL.B.", degree: "B.Com LL.B.", duration: 5, fees: 110000, seats: 60, eligibility: "10+2 Commerce ≥ 45%, CLAT" },
    ],
  },
  {
    name: "Lexicon Law College",
    city: "Delhi",
    state: "Delhi",
    type: "PRIVATE" as const,
    stream: "Law",
    established: 2004,
    overview:
      "Lexicon Law College is a boutique private law school in Delhi with strong focus on corporate and intellectual property law. Industry mentors from Delhi's top law firms visit weekly.",
    feesMin: 150000,
    feesMax: 280000,
    avgRating: 4.0,
    accreditation: "A+",
    topPackage: 18,
    avgPackage: 9.8,
    medianPackage: 8.0,
    placement: 90,
    recruiters: ["Shardul Amarchand", "Khaitan & Co", "J Sagar Associates", "IndusLaw", "Trilegal"],
    courses: [
      { name: "B.A. LL.B. (Hons)", degree: "B.A. LL.B.", duration: 5, fees: 280000, seats: 60, eligibility: "10+2 any ≥ 50%, CLAT/AILET" },
      { name: "LL.M. Intellectual Property", degree: "LL.M.", duration: 1, fees: 200000, seats: 20, eligibility: "LL.B. + entrance" },
    ],
  },
  {
    name: "Deccan School of Law",
    city: "Pune",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Law",
    established: 2009,
    overview:
      "DSL offers 3-year and 5-year law programs with specializations in Constitutional, Criminal, and Environmental law. Its legal clinic serves over 2000 clients annually, giving students real-world advocacy experience.",
    feesMin: 90000,
    feesMax: 180000,
    avgRating: 3.8,
    accreditation: "A",
    topPackage: 12,
    avgPackage: 7.2,
    medianPackage: 6.0,
    placement: 82,
    recruiters: ["Crawford Bayley", "Juris Corp", "Law Offices of Nishith Desai", "Government Legal Dept"],
    courses: [
      { name: "LL.B.", degree: "LL.B.", duration: 3, fees: 150000, seats: 120, eligibility: "Graduate degree any ≥ 45%, MH CET Law" },
      { name: "B.A. LL.B.", degree: "B.A. LL.B.", duration: 5, fees: 180000, seats: 60, eligibility: "10+2 any ≥ 45%, MH CET Law" },
    ],
  },

  // ── More Engineering ──
  {
    name: "Silicon Valley Institute of Engineering",
    city: "Bengaluru",
    state: "Karnataka",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2001,
    overview:
      "SVIE is Bangalore's tech-forward engineering college with a Silicon Valley-inspired curriculum. Extensive industry tie-ups with the city's IT corridor result in consistently high internship and placement rates.",
    feesMin: 170000,
    feesMax: 230000,
    avgRating: 4.0,
    accreditation: "A",
    topPackage: 36,
    avgPackage: 13.2,
    medianPackage: 11.0,
    placement: 93,
    recruiters: ["Flipkart", "Swiggy", "Ola", "Wipro", "IBM", "Cisco"],
    courses: [
      { name: "Computer Science & Engineering", degree: "B.Tech", duration: 4, fees: 230000, seats: 180, eligibility: "10+2 PCM, KCET/JEE" },
      { name: "Information Science & Engineering", degree: "B.Tech", duration: 4, fees: 220000, seats: 120, eligibility: "10+2 PCM, KCET/JEE" },
    ],
  },
  {
    name: "Eastern Polytechnic University",
    city: "Guwahati",
    state: "Assam",
    type: "GOVERNMENT" as const,
    stream: "Engineering",
    established: 1948,
    overview:
      "EPU is the Northeast's flagship technical institution. Its civil and environmental engineering programs are particularly strong, addressing the region's unique infrastructure and ecological challenges.",
    feesMin: 18000,
    feesMax: 50000,
    avgRating: 3.8,
    accreditation: "A",
    topPackage: 20,
    avgPackage: 7.8,
    medianPackage: 6.5,
    placement: 80,
    recruiters: ["NHPC", "ONGC", "PWD Assam", "TCS", "Infosys"],
    courses: [
      { name: "Civil Engineering", degree: "B.Tech", duration: 4, fees: 40000, seats: 60, eligibility: "10+2 PCM, JEE/State CET" },
      { name: "Environmental Engineering", degree: "B.Tech", duration: 4, fees: 40000, seats: 30, eligibility: "10+2 PCM, State CET" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 50000, seats: 60, eligibility: "10+2 PCM, JEE/State CET" },
    ],
  },
  {
    name: "Crestview College of Technology",
    city: "Chandigarh",
    state: "Punjab",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2000,
    overview:
      "Crestview serves Punjab and Haryana's engineering aspirants with affordable quality education. Strong in automotive, manufacturing, and IT sectors; preferred by Maruti, Hero MotoCorp, and regional tech firms.",
    feesMin: 130000,
    feesMax: 180000,
    avgRating: 3.7,
    accreditation: "A",
    topPackage: 25,
    avgPackage: 8.5,
    medianPackage: 7.2,
    placement: 84,
    recruiters: ["Maruti Suzuki", "Hero MotoCorp", "HCL", "Infosys BPM", "Punjab National Bank"],
    courses: [
      { name: "Mechanical Engineering", degree: "B.Tech", duration: 4, fees: 160000, seats: 120, eligibility: "10+2 PCM, JEE/Punjab CET" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 180000, seats: 120, eligibility: "10+2 PCM, JEE/Punjab CET" },
    ],
  },
  {
    name: "Tidewater Engineering College",
    city: "Kochi",
    state: "Kerala",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 1996,
    overview:
      "Tidewater Engineering College is a top private engineering college in Kerala with excellent infrastructure and a globally connected alumni. Known for sending a high proportion of graduates to international positions.",
    feesMin: 110000,
    feesMax: 160000,
    avgRating: 4.2,
    accreditation: "A+",
    topPackage: 30,
    avgPackage: 11.4,
    medianPackage: 9.0,
    placement: 91,
    recruiters: ["UST Global", "Infosys", "TCS", "Cognizant", "IBS Group"],
    courses: [
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 160000, seats: 120, eligibility: "10+2 PCM, KEAM" },
      { name: "Electronics & Communication", degree: "B.Tech", duration: 4, fees: 140000, seats: 60, eligibility: "10+2 PCM, KEAM" },
    ],
  },
  {
    name: "Skyline Institute of Computing",
    city: "Noida",
    state: "Uttar Pradesh",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2008,
    overview:
      "Located in the NCR tech hub, Skyline provides BCA, B.Tech, and MCA programs. Its proximity to Noida's IT parks gives students easy access to internships and pre-placement offers.",
    feesMin: 90000,
    feesMax: 150000,
    avgRating: 3.5,
    accreditation: "B++",
    topPackage: 18,
    avgPackage: 6.2,
    medianPackage: 5.0,
    placement: 75,
    recruiters: ["Tech Mahindra", "Mphasis", "HCL BPO", "Genpact", "Accenture"],
    courses: [
      { name: "BCA", degree: "BCA", duration: 3, fees: 100000, seats: 120, eligibility: "10+2 with Math, merit" },
      { name: "B.Tech Computer Science", degree: "B.Tech", duration: 4, fees: 150000, seats: 120, eligibility: "10+2 PCM, UP State CET" },
      { name: "MCA", degree: "MCA", duration: 2, fees: 120000, seats: 60, eligibility: "Graduate with Math, UP MCA CET" },
    ],
  },
  {
    name: "Triton College of Engineering & Management",
    city: "Nagpur",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2002,
    overview:
      "Triton combines engineering and management disciplines under one roof, offering dual-specialization pathways. Its Central India location means strong placement in core manufacturing and power sectors.",
    feesMin: 140000,
    feesMax: 200000,
    avgRating: 3.9,
    accreditation: "A",
    topPackage: 26,
    avgPackage: 9.5,
    medianPackage: 8.0,
    placement: 88,
    recruiters: ["MOIL", "WCL", "Mahindra", "ABB", "Siemens"],
    courses: [
      { name: "Electrical Engineering", degree: "B.Tech", duration: 4, fees: 180000, seats: 60, eligibility: "10+2 PCM, MHT-CET" },
      { name: "Mechanical Engineering", degree: "B.Tech", duration: 4, fees: 175000, seats: 60, eligibility: "10+2 PCM, MHT-CET" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 200000, seats: 120, eligibility: "10+2 PCM, MHT-CET" },
    ],
  },

  // ── More Management ──
  {
    name: "Pacific Graduate School of Business",
    city: "Bengaluru",
    state: "Karnataka",
    type: "DEEMED" as const,
    stream: "Management",
    established: 2000,
    overview:
      "PGSB is a deemed university offering a globally oriented MBA with study-abroad stints in partner institutions in Europe and Singapore. Strong focus on entrepreneurship and venture creation.",
    feesMin: 1500000,
    feesMax: 2000000,
    avgRating: 4.3,
    accreditation: "A+",
    topPackage: 60,
    avgPackage: 24.0,
    medianPackage: 20.0,
    placement: 99,
    recruiters: ["Unilever", "P&G", "Nykaa", "Meesho", "Amazon", "Zepto"],
    courses: [
      { name: "MBA (General)", degree: "MBA", duration: 2, fees: 2000000, seats: 120, eligibility: "Graduate, CAT/GMAT ≥ 85 percentile" },
      { name: "MBA Entrepreneurship", degree: "MBA", duration: 2, fees: 2000000, seats: 30, eligibility: "Graduate, CAT/GMAT, startup experience preferred" },
    ],
  },
  {
    name: "Evergreen Management Institute",
    city: "Jaipur",
    state: "Rajasthan",
    type: "PRIVATE" as const,
    stream: "Management",
    established: 2012,
    established2: 2012,
    overview:
      "EMI targets working professionals and fresh graduates in Rajasthan, offering affordable MBA and PGDM programs. Its focus on retail, hospitality, and tourism management fills a gap in the regional market.",
    feesMin: 300000,
    feesMax: 500000,
    avgRating: 3.4,
    accreditation: "B++",
    topPackage: 14,
    avgPackage: 6.8,
    medianPackage: 5.5,
    placement: 78,
    recruiters: ["Ruchi Soya", "ITC Hotels", "Rajasthan Tourism", "Reliance Retail", "HDFC Bank"],
    courses: [
      { name: "MBA Hospitality Management", degree: "MBA", duration: 2, fees: 450000, seats: 60, eligibility: "Graduate any, MAT/CMAT" },
      { name: "PGDM Retail Management", degree: "PGDM", duration: 2, fees: 500000, seats: 60, eligibility: "Graduate any, entrance" },
    ],
  },
  {
    name: "Highgate School of Economics & Commerce",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "PRIVATE" as const,
    stream: "Management",
    established: 1988,
    overview:
      "Highgate is a specialist business school focusing on finance, economics, and commerce. Its chartered accountancy coaching track and CFA prep facilities are unrivalled in the city.",
    feesMin: 600000,
    feesMax: 900000,
    avgRating: 4.0,
    accreditation: "A",
    topPackage: 40,
    avgPackage: 16.8,
    medianPackage: 13.0,
    placement: 96,
    recruiters: ["ICICI Bank", "HDFC Bank", "Axis Securities", "Big Four Audit", "SEBI"],
    courses: [
      { name: "MBA Finance", degree: "MBA", duration: 2, fees: 900000, seats: 90, eligibility: "B.Com/Economics, CAT/XAT" },
      { name: "M.Sc Economics", degree: "M.Sc", duration: 2, fees: 600000, seats: 40, eligibility: "B.A./B.Sc Economics ≥ 55%" },
    ],
  },

  // ── More Medical ──
  {
    name: "Ashoka Health Sciences University",
    city: "Nashik",
    state: "Maharashtra",
    type: "DEEMED" as const,
    stream: "Medical",
    established: 2008,
    overview:
      "AHSU is a comprehensive health sciences deemed university offering programs across medicine, pharmacy, physiotherapy, and nursing. Its research collaborations with international hospitals are a highlight.",
    feesMin: 600000,
    feesMax: 1800000,
    avgRating: 3.8,
    accreditation: "A",
    topPackage: 15,
    avgPackage: 8.5,
    medianPackage: 7.5,
    placement: 94,
    recruiters: ["Wockhardt", "Sun Pharma", "Narayana Health", "Aster DM Healthcare"],
    courses: [
      { name: "B.Pharm", degree: "B.Pharm", duration: 4, fees: 600000, seats: 100, eligibility: "10+2 PCB/PCM ≥ 50%, NEET" },
      { name: "BPT (Physiotherapy)", degree: "BPT", duration: 4.5, fees: 800000, seats: 60, eligibility: "10+2 PCB ≥ 50%, NEET" },
      { name: "MBBS", degree: "MBBS", duration: 5.5, fees: 1800000, seats: 150, eligibility: "10+2 PCB ≥ 50%, NEET score" },
    ],
  },
  {
    name: "Veda College of Ayurvedic Medicine",
    city: "Thiruvananthapuram",
    state: "Kerala",
    type: "PRIVATE" as const,
    stream: "Medical",
    established: 1979,
    overview:
      "VCAM is India's leading Ayurvedic medical college offering BAMS and MD Ayurveda. Situated amidst Kerala's medicinal plant biodiversity, its herbal garden and panchakarma research centre are internationally acclaimed.",
    feesMin: 200000,
    feesMax: 600000,
    avgRating: 4.3,
    accreditation: "A+",
    topPackage: 12,
    avgPackage: 6.5,
    medianPackage: 5.8,
    placement: 88,
    recruiters: ["Kerala Ayurveda Ltd", "Kottakkal Arya Vaidyasala", "Himalaya Drug", "Private Clinics", "WHO Research"],
    courses: [
      { name: "BAMS (Bachelor of Ayurvedic Medicine)", degree: "BAMS", duration: 5.5, fees: 500000, seats: 100, eligibility: "10+2 PCB ≥ 50%, NEET score" },
      { name: "MD Ayurveda", degree: "MD", duration: 3, fees: 600000, seats: 20, eligibility: "BAMS, NEET PG Ayurveda" },
    ],
  },

  // ── More Law ──
  {
    name: "North Star Law School",
    city: "Chandigarh",
    state: "Punjab",
    type: "GOVERNMENT" as const,
    stream: "Law",
    established: 1965,
    overview:
      "NSLS is a government law school with a proud tradition in Constitutional law and public interest litigation. Many of its alumni serve as High Court and District Court judges across North India.",
    feesMin: 25000,
    feesMax: 60000,
    avgRating: 3.9,
    accreditation: "A",
    topPackage: 10,
    avgPackage: 6.0,
    medianPackage: 5.0,
    placement: 80,
    recruiters: ["Punjab & Haryana High Court", "District Courts", "Legal Aid Bureau", "RERA Punjab"],
    courses: [
      { name: "LL.B.", degree: "LL.B.", duration: 3, fees: 50000, seats: 180, eligibility: "Graduate any ≥ 45%, PU Law Entrance" },
      { name: "B.A. LL.B.", degree: "B.A. LL.B.", duration: 5, fees: 60000, seats: 120, eligibility: "10+2 any ≥ 45%, PU Law Entrance" },
    ],
  },
  {
    name: "Coastal Law Institute",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    type: "PRIVATE" as const,
    stream: "Law",
    established: 2011,
    overview:
      "CLI specialises in maritime law, environmental law, and ADR (Alternative Dispute Resolution). Located in a port city, its maritime law specialization attracts students from fishing communities and shipping companies.",
    feesMin: 100000,
    feesMax: 200000,
    avgRating: 3.6,
    accreditation: "B++",
    topPackage: 10,
    avgPackage: 5.5,
    medianPackage: 4.8,
    placement: 75,
    recruiters: ["Shipping Corp of India", "Vizag Port Trust", "Andhra Pradesh Maritime Board", "Environmental Lawyers"],
    courses: [
      { name: "B.A. LL.B. (Maritime Law)", degree: "B.A. LL.B.", duration: 5, fees: 200000, seats: 60, eligibility: "10+2 any ≥ 45%, CLAT" },
      { name: "LL.M. Maritime Law", degree: "LL.M.", duration: 1, fees: 150000, seats: 20, eligibility: "LL.B. + entrance" },
    ],
  },

  // ── More Arts & Science ──
  {
    name: "Majestic College of Arts",
    city: "Kolkata",
    state: "West Bengal",
    type: "GOVERNMENT" as const,
    stream: "Arts",
    established: 1888,
    overview:
      "One of India's oldest colleges, Majestic College carries the intellectual legacy of Bengal's renaissance. Its departments of Bengali Literature, History, and Philosophy command the highest regard nationally.",
    feesMin: 8000,
    feesMax: 20000,
    avgRating: 4.3,
    accreditation: "A+",
    topPackage: 15,
    avgPackage: 4.5,
    medianPackage: 3.8,
    placement: 60,
    recruiters: ["Times Group", "Ananda Publishers", "State Civil Services", "Universities", "NGOs"],
    courses: [
      { name: "B.A. (Hons) Bengali", degree: "B.A. (Hons)", duration: 3, fees: 12000, seats: 100, eligibility: "10+2 any, merit" },
      { name: "B.A. (Hons) History", degree: "B.A. (Hons)", duration: 3, fees: 12000, seats: 80, eligibility: "10+2 any, merit" },
      { name: "M.A. Philosophy", degree: "M.A.", duration: 2, fees: 20000, seats: 25, eligibility: "B.A. ≥ 50%, entrance" },
    ],
  },
  {
    name: "Sunridge Science Academy",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "PRIVATE" as const,
    stream: "Arts",
    established: 2014,
    overview:
      "A young but dynamic institution, Sunridge focuses on Applied Sciences and Technology with BCA, B.Sc IT, and M.Sc programs. Industry-aligned curriculum designed with Ahmedabad's growing tech sector.",
    feesMin: 65000,
    feesMax: 120000,
    avgRating: 3.6,
    accreditation: "B++",
    topPackage: 14,
    avgPackage: 5.5,
    medianPackage: 4.5,
    placement: 70,
    recruiters: ["Adani Group", "Torrent Pharma", "Reliance Jio", "TCS Gujarat", "WNS"],
    courses: [
      { name: "BCA", degree: "BCA", duration: 3, fees: 90000, seats: 60, eligibility: "10+2 with Math ≥ 50%, merit" },
      { name: "B.Sc IT", degree: "B.Sc", duration: 3, fees: 80000, seats: 60, eligibility: "10+2 PCM ≥ 45%, merit" },
      { name: "M.Sc Data Analytics", degree: "M.Sc", duration: 2, fees: 120000, seats: 30, eligibility: "B.Sc/BCA ≥ 55%" },
    ],
  },
  {
    name: "Riverdale College of Journalism & Media",
    city: "Mumbai",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Arts",
    established: 2003,
    overview:
      "RCJM is the only specialized journalism and media college in Mumbai's western suburbs. Its digital media lab, radio station, and student newspaper prepare graduates for India's rapidly evolving media landscape.",
    feesMin: 120000,
    feesMax: 220000,
    avgRating: 4.1,
    accreditation: "A",
    topPackage: 16,
    avgPackage: 7.5,
    medianPackage: 6.0,
    placement: 85,
    recruiters: ["NDTV", "Zee Media", "The Hindu", "Digital Agencies", "PR Firms"],
    courses: [
      { name: "B.A. Journalism & Mass Communication", degree: "B.A.", duration: 3, fees: 180000, seats: 60, eligibility: "10+2 any ≥ 50%, aptitude test" },
      { name: "M.A. Digital Media", degree: "M.A.", duration: 2, fees: 220000, seats: 30, eligibility: "Graduate any ≥ 50%, entrance" },
    ],
  },
  {
    name: "Heritage School of Design",
    city: "Pune",
    state: "Maharashtra",
    type: "PRIVATE" as const,
    stream: "Arts",
    established: 2006,
    overview:
      "HSD offers B.Des and M.Des programs across product design, UX/UI, and fashion design. Its collaboration with Pune's automobile OEMs makes it a top choice for industrial and transportation design students.",
    feesMin: 300000,
    feesMax: 500000,
    avgRating: 4.2,
    accreditation: "A+",
    topPackage: 22,
    avgPackage: 10.5,
    medianPackage: 8.5,
    placement: 91,
    recruiters: ["Tata Motors Design", "Royal Enfield", "Godrej", "Swiggy UX", "Design Studios"],
    courses: [
      { name: "B.Des Product Design", degree: "B.Des", duration: 4, fees: 450000, seats: 40, eligibility: "10+2 any, NID/CEED score" },
      { name: "B.Des UX/UI Design", degree: "B.Des", duration: 4, fees: 500000, seats: 40, eligibility: "10+2 any, portfolio + interview" },
      { name: "M.Des Fashion Design", degree: "M.Des", duration: 2, fees: 500000, seats: 20, eligibility: "B.Des/B.F.A., portfolio" },
    ],
  },

  // ── More Engineering ──
  {
    name: "Himalayan Institute of Technology",
    city: "Dehradun",
    state: "Uttarakhand",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2005,
    overview:
      "HIT is set amidst the Himalayan foothills and specialises in civil, environmental, and geotechnical engineering — disciplines critical to the region's infrastructure. Strong government contracts for RVNL and NHAI projects.",
    feesMin: 100000,
    feesMax: 150000,
    avgRating: 3.6,
    accreditation: "A",
    topPackage: 18,
    avgPackage: 7.0,
    medianPackage: 6.0,
    placement: 78,
    recruiters: ["RVNL", "NHAI", "Gammon India", "Afcons Infrastructure", "PWD Uttarakhand"],
    courses: [
      { name: "Civil Engineering", degree: "B.Tech", duration: 4, fees: 140000, seats: 60, eligibility: "10+2 PCM, Uttarakhand CET" },
      { name: "Environmental Engineering", degree: "B.Tech", duration: 4, fees: 130000, seats: 30, eligibility: "10+2 PCM, Uttarakhand CET" },
    ],
  },
  {
    name: "Coastal Engineering Institute of Technology",
    city: "Kozhikode",
    state: "Kerala",
    type: "GOVERNMENT" as const,
    stream: "Engineering",
    established: 1983,
    overview:
      "CEIT is a government-run institution on Kerala's Malabar coast. Its marine engineering and fisheries technology programs are tailored to the region's strong maritime economy.",
    feesMin: 15000,
    feesMax: 45000,
    avgRating: 4.0,
    accreditation: "A",
    topPackage: 22,
    avgPackage: 9.0,
    medianPackage: 7.5,
    placement: 86,
    recruiters: ["Cochin Shipyard", "KSHIP", "Kerala State Fisheries", "TCS", "Infosys"],
    courses: [
      { name: "Marine Engineering", degree: "B.Tech", duration: 4, fees: 45000, seats: 30, eligibility: "10+2 PCM ≥ 60%, KEAM" },
      { name: "Electrical Engineering", degree: "B.Tech", duration: 4, fees: 35000, seats: 60, eligibility: "10+2 PCM, KEAM" },
    ],
  },
  {
    name: "Sunrise Engineering & Science College",
    city: "Surat",
    state: "Gujarat",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2009,
    overview:
      "SESC caters to Gujarat's growing industrial base with programs in chemical, textile, and computer engineering. Strong industry connections with Surat's textile and diamond industries drive internship placements.",
    feesMin: 100000,
    feesMax: 160000,
    avgRating: 3.7,
    accreditation: "A",
    topPackage: 20,
    avgPackage: 7.5,
    medianPackage: 6.5,
    placement: 82,
    recruiters: ["Atul Ltd", "GAIL", "Deepak Fertilizers", "Welspun", "Reliance Industries"],
    courses: [
      { name: "Chemical Engineering", degree: "B.Tech", duration: 4, fees: 140000, seats: 60, eligibility: "10+2 PCM, GUJCET" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 160000, seats: 120, eligibility: "10+2 PCM, GUJCET" },
      { name: "Textile Technology", degree: "B.Tech", duration: 4, fees: 120000, seats: 60, eligibility: "10+2 PCM, GUJCET" },
    ],
  },
  {
    name: "Lakeside Institute of Technology",
    city: "Bhopal",
    state: "Madhya Pradesh",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2004,
    overview:
      "LIT is a mid-tier private engineering college near Bhopal's Bharat Heavy Electricals plant, resulting in strong BHEL and NTPC placements for electrical and mechanical students.",
    feesMin: 90000,
    feesMax: 140000,
    avgRating: 3.5,
    accreditation: "B++",
    topPackage: 16,
    avgPackage: 6.5,
    medianPackage: 5.5,
    placement: 76,
    recruiters: ["BHEL", "NTPC", "MP State Electricity Board", "TCS", "Wipro"],
    courses: [
      { name: "Electrical Engineering", degree: "B.Tech", duration: 4, fees: 130000, seats: 60, eligibility: "10+2 PCM, MP PET" },
      { name: "Mechanical Engineering", degree: "B.Tech", duration: 4, fees: 125000, seats: 60, eligibility: "10+2 PCM, MP PET" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 140000, seats: 60, eligibility: "10+2 PCM, MP PET" },
    ],
  },
  {
    name: "Oasis Institute of Engineering",
    city: "Jodhpur",
    state: "Rajasthan",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2011,
    overview:
      "OIE is a growing private engineering college with a focus on renewable energy and solar technology, inspired by Rajasthan's solar potential. Its solar farm on campus is used as a live lab.",
    feesMin: 110000,
    feesMax: 160000,
    avgRating: 3.8,
    accreditation: "A",
    topPackage: 20,
    avgPackage: 8.0,
    medianPackage: 6.8,
    placement: 83,
    recruiters: ["Adani Solar", "ReNew Power", "NTPC Renewables", "Suzlon", "Greenko"],
    courses: [
      { name: "Electrical Engineering (Solar Focus)", degree: "B.Tech", duration: 4, fees: 150000, seats: 60, eligibility: "10+2 PCM, REAP" },
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 160000, seats: 120, eligibility: "10+2 PCM, REAP" },
    ],
  },

  // ── More ──
  {
    name: "Sterling College of Pharmacy",
    city: "Hyderabad",
    state: "Telangana",
    type: "PRIVATE" as const,
    stream: "Medical",
    established: 2000,
    overview:
      "Sterling Pharmacy is embedded in Hyderabad's pharmaceutical capital, with BSc Pharmacy, Pharm.D and M.Pharm programs. Its research labs are ISO-certified and produce 150+ patents annually with partner firms.",
    feesMin: 150000,
    feesMax: 350000,
    avgRating: 4.1,
    accreditation: "A+",
    topPackage: 18,
    avgPackage: 8.5,
    medianPackage: 7.2,
    placement: 95,
    recruiters: ["Sun Pharma", "Aurobindo Pharma", "Dr. Reddy's", "Mylan", "Divi's Labs"],
    courses: [
      { name: "B.Pharm", degree: "B.Pharm", duration: 4, fees: 200000, seats: 100, eligibility: "10+2 PCB/PCM ≥ 50%, NEET/EAMCET" },
      { name: "Pharm.D", degree: "Pharm.D", duration: 6, fees: 250000, seats: 60, eligibility: "10+2 PCB ≥ 50%, NEET score" },
      { name: "M.Pharm Industrial Pharmacy", degree: "M.Pharm", duration: 2, fees: 350000, seats: 30, eligibility: "B.Pharm, GPAT score" },
    ],
  },
  {
    name: "Crescent College of Engineering",
    city: "Bhubaneswar",
    state: "Odisha",
    type: "PRIVATE" as const,
    stream: "Engineering",
    established: 2006,
    overview:
      "CCE is Odisha's fastest-growing private engineering college, with investments in IoT, smart manufacturing labs, and drone technology centres. Growing placements in Odisha's expanding steel and mining sectors.",
    feesMin: 90000,
    feesMax: 140000,
    avgRating: 3.7,
    accreditation: "A",
    topPackage: 18,
    avgPackage: 7.2,
    medianPackage: 6.0,
    placement: 80,
    recruiters: ["TATA Steel", "Vedanta", "Infosys", "TCS", "NALCO"],
    courses: [
      { name: "Computer Science Engineering", degree: "B.Tech", duration: 4, fees: 140000, seats: 120, eligibility: "10+2 PCM, OJEE/JEE" },
      { name: "Metallurgical Engineering", degree: "B.Tech", duration: 4, fees: 110000, seats: 30, eligibility: "10+2 PCM, OJEE/JEE" },
    ],
  },
  {
    name: "Amrita School of Commerce",
    city: "Coimbatore",
    state: "Tamil Nadu",
    type: "PRIVATE" as const,
    stream: "Management",
    established: 1997,
    overview:
      "Amrita School of Commerce offers B.Com, BBA, and MBA programs with strong CA Foundation coaching. Tamil Nadu's premier destination for commerce students seeking a career in finance and auditing.",
    feesMin: 80000,
    feesMax: 400000,
    avgRating: 4.0,
    accreditation: "A+",
    topPackage: 22,
    avgPackage: 9.5,
    medianPackage: 7.8,
    placement: 90,
    recruiters: ["Deloitte", "EY", "KPMG", "Axis Bank", "Amrita Hospitals"],
    courses: [
      { name: "B.Com (Hons)", degree: "B.Com", duration: 3, fees: 80000, seats: 120, eligibility: "10+2 Commerce ≥ 55%, merit" },
      { name: "BBA", degree: "BBA", duration: 3, fees: 120000, seats: 60, eligibility: "10+2 any ≥ 55%, entrance" },
      { name: "MBA Finance", degree: "MBA", duration: 2, fees: 400000, seats: 60, eligibility: "Graduate, CAT/MAT score" },
    ],
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data in dependency order
  await db.delete(schema.savedComparisonColleges);
  await db.delete(schema.savedComparisons);
  await db.delete(schema.savedColleges);
  await db.delete(schema.reviews);
  await db.delete(schema.placements);
  await db.delete(schema.courses);
  await db.delete(schema.colleges);
  await db.delete(schema.accounts);
  await db.delete(schema.sessions);
  await db.delete(schema.verificationTokens);
  await db.delete(schema.users);

  console.log("🗑️  Cleared existing data");

  // Seed demo users
  const demoPasswordHash = await bcrypt.hash("Demo@1234", 12);
  const demoUsers = [
    { id: uid(), name: "Arjun Sharma", email: "arjun@demo.com", passwordHash: demoPasswordHash },
    { id: uid(), name: "Priya Nair", email: "priya@demo.com", passwordHash: demoPasswordHash },
    { id: uid(), name: "Rahul Verma", email: "rahul@demo.com", passwordHash: demoPasswordHash },
  ];
  await db.insert(schema.users).values(demoUsers);
  console.log(`👥 Seeded ${demoUsers.length} demo users (password: Demo@1234)`);

  // Seed colleges
  const collegeRecords: (typeof schema.colleges.$inferInsert)[] = [];
  const courseRecords: (typeof schema.courses.$inferInsert)[] = [];
  const placementRecords: (typeof schema.placements.$inferInsert)[] = [];
  const reviewRecords: (typeof schema.reviews.$inferInsert)[] = [];

  const reviewTemplates = [
    { rating: 5, title: "Excellent experience overall", body: "The faculty here are incredible — deeply knowledgeable and genuinely invested in student success. Placement support is top-notch." },
    { rating: 4, title: "Great college, minor issues", body: "Solid academics and good lab facilities. The canteen could be better and hostel WiFi is spotty, but academics make up for it." },
    { rating: 5, title: "Best decision of my life", body: "The campus culture, the peer quality, and industry exposure are unmatched in this region. Would recommend 10/10." },
    { rating: 3, title: "Decent but room for improvement", body: "Some departments are excellent, others feel underfunded. Placement is average for non-CS branches. Admin is slow to respond." },
    { rating: 4, title: "Good for ambitious students", body: "If you network well and use all available resources, you will do great here. You have to be proactive — college won't spoon-feed you." },
    { rating: 2, title: "Below expectations", body: "The marketing materials oversell the experience. Infrastructure is dated and some faculty only read from textbooks." },
    { rating: 5, title: "Transformed my career", body: "The connections I made here — both faculty mentors and classmates — changed the trajectory of my career fundamentally." },
    { rating: 3, title: "Average overall", body: "The core curriculum is good, but elective quality varies wildly. Industry visits are the best part of the program." },
  ];

  for (const c of collegeData) {
    const collegeId = uid();
    const slug = slugify(c.name);

    collegeRecords.push({
      id: collegeId,
      slug,
      name: c.name,
      city: c.city,
      state: c.state,
      type: c.type,
      stream: c.stream,
      establishedYear: c.established,
      overview: c.overview,
      avgRating: c.avgRating,
      totalReviews: 3,
      feesMin: c.feesMin,
      feesMax: c.feesMax,
      accreditation: c.accreditation,
      logoUrl: null,
      bannerUrl: null,
      website: null,
      phone: null,
      email: null,
      address: `${c.city}, ${c.state}`,
    });

    // Courses
    for (const course of c.courses) {
      courseRecords.push({
        id: uid(),
        collegeId,
        name: course.name,
        degree: course.degree,
        durationYears: course.duration,
        totalFees: course.fees,
        seatsAvailable: course.seats,
        eligibility: course.eligibility,
      });
    }

    // Placements (3 years of data)
    for (let yr = 2022; yr <= 2024; yr++) {
      const variance = (Math.random() - 0.5) * 0.1; // ±5% year-over-year variation
      placementRecords.push({
        id: uid(),
        collegeId,
        year: yr,
        avgPackageLpa: parseFloat((c.avgPackage * (1 + variance)).toFixed(1)),
        medianPackageLpa: parseFloat((c.medianPackage * (1 + variance)).toFixed(1)),
        highestPackageLpa: parseFloat((c.topPackage * (1 + variance * 0.5)).toFixed(1)),
        placementPercentage: parseFloat((c.placement * (1 + variance * 0.3)).toFixed(1)),
        topRecruiters: JSON.stringify(c.recruiters),
      });
    }

    // Reviews — 3 per college, rotating through users and templates
    for (let i = 0; i < 3; i++) {
      const template = reviewTemplates[(collegeRecords.length + i) % reviewTemplates.length];
      reviewRecords.push({
        id: uid(),
        collegeId,
        userId: demoUsers[i % demoUsers.length].id,
        rating: template.rating,
        title: template.title,
        body: template.body,
      });
    }
  }

  await db.insert(schema.colleges).values(collegeRecords);
  console.log(`🏫 Seeded ${collegeRecords.length} colleges`);

  await db.insert(schema.courses).values(courseRecords);
  console.log(`📚 Seeded ${courseRecords.length} courses`);

  await db.insert(schema.placements).values(placementRecords);
  console.log(`📊 Seeded ${placementRecords.length} placement records`);

  await db.insert(schema.reviews).values(reviewRecords);
  console.log(`⭐ Seeded ${reviewRecords.length} reviews`);

  await pool.end();
  console.log("✅ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
