import "dotenv/config"
import { createHmac, randomBytes } from "node:crypto"
import { db } from "./index"
import { usersTable } from "./models/user"
import { formsTable } from "./models/form"
import { formFieldsTable } from "./models/form-field"
import { submissionTable } from "./models/form-submission"
import { eq } from "drizzle-orm"

function hash(salt: string, password: string) {
  return createHmac("sha256", salt).update(password).digest("hex")
}

function makeSlug(base: string) {
  return base.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.random().toString(36).slice(2, 7)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function pickMany<T>(arr: T[], min = 1, max = 2): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
}

function randomDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  return d.toISOString().slice(0, 10)
}

const DEMO_EMAIL = "demo@bipsform.com"
const DEMO_PASSWORD = "demo1234"

async function seed() {
  console.log("🌱 Seeding BipsForm demo data…")

  // ── Demo user ──────────────────────────────────────────────────────────────
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, DEMO_EMAIL))
  let userId: string

  if (existing.length > 0) {
    userId = existing[0]!.id
    console.log("  ↳ demo user already exists, reusing")
  } else {
    const salt = randomBytes(16).toString("hex")
    const [user] = await db.insert(usersTable).values({
      fullName: "BipsForm Demo",
      email: DEMO_EMAIL,
      password: hash(salt, DEMO_PASSWORD),
      salt,
      emailVerified: true,
    }).returning({ id: usersTable.id })
    userId = user!.id
    console.log(`  ↳ created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  }

  // ── Wipe previous seed forms ───────────────────────────────────────────────
  const oldForms = await db.select({ id: formsTable.id }).from(formsTable).where(eq(formsTable.createdBy, userId))
  for (const f of oldForms) {
    await db.delete(submissionTable).where(eq(submissionTable.formId, f.id))
    await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, f.id))
  }
  if (oldForms.length) {
    await db.delete(formsTable).where(eq(formsTable.createdBy, userId))
    console.log("  ↳ cleared previous seed data")
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Form 1 — BipsForm Product Feedback
  // Theme: minimal | Published + Public
  // Covers: rating (5★), single_select, multi_select, long_text (maxLength)
  // ══════════════════════════════════════════════════════════════════════════
  const [f1] = await db.insert(formsTable).values({
    title: "BipsForm Product Feedback",
    description: "Tell us how BipsForm is working for you. Takes 2 minutes.",
    createdBy: userId,
    isPublished: true,
    isPublic: true,
    themeId: "minimal",
    slug: makeSlug("bipsform-product-feedback"),
  }).returning({ id: formsTable.id })
  const f1id = f1!.id

  const [f1_rating] = await db.insert(formFieldsTable).values({
    formId: f1id, label: "How would you rate BipsForm overall?", labelKey: "overall_rating",
    type: "rating", isRequired: true, index: "1", validations: { maxRating: 5 },
  }).returning({ id: formFieldsTable.id })

  const hearOpts = [
    { id: "h1", label: "Social Media", value: "social_media" },
    { id: "h2", label: "Search Engine", value: "search_engine" },
    { id: "h3", label: "Word of Mouth", value: "word_of_mouth" },
    { id: "h4", label: "Product Hunt", value: "product_hunt" },
  ]
  const [f1_hear] = await db.insert(formFieldsTable).values({
    formId: f1id, label: "How did you discover BipsForm?", labelKey: "discover_bipsform",
    type: "single_select", isRequired: false, index: "2", options: hearOpts,
  }).returning({ id: formFieldsTable.id })

  const featureOpts = [
    { id: "ft1", label: "Form Builder", value: "form_builder" },
    { id: "ft2", label: "Analytics Dashboard", value: "analytics" },
    { id: "ft3", label: "Public Explore Page", value: "explore" },
    { id: "ft4", label: "Conditional Fields", value: "conditional_fields" },
    { id: "ft5", label: "Custom Themes", value: "custom_themes" },
  ]
  const [f1_features] = await db.insert(formFieldsTable).values({
    formId: f1id, label: "Which BipsForm features do you use most?", labelKey: "features_used",
    type: "multi_select", isRequired: false, index: "3", options: featureOpts,
  }).returning({ id: formFieldsTable.id })

  // long_text with maxLength validation
  const [f1_comment] = await db.insert(formFieldsTable).values({
    formId: f1id, label: "Any feedback for the BipsForm team?", labelKey: "feedback_comment",
    type: "long_text", isRequired: false, index: "4", placeholder: "What can we improve?",
    validations: { maxLength: 500 },
  }).returning({ id: formFieldsTable.id })

  const f1_comments = [
    "BipsForm is exactly what I needed. Clean and fast.",
    "Would love to see CSV export from BipsForm.",
    "The analytics in BipsForm are surprisingly good for a free tool.",
    "Conditional fields are a killer feature!",
    "Love the themes — the retro one is my favorite.",
    "BipsForm saved me hours of work on our user research.",
    "Really smooth UX, my team adopted it in a day.",
    "",
    "Would love email notifications when someone submits.",
    "The explore page is a great idea for discovering forms.",
    "BipsForm is way simpler than Google Forms.",
    "Can't wait for team collaboration features.",
  ]

  for (let i = 0; i < 20; i++) {
    await db.insert(submissionTable).values({
      formId: f1id,
      values: {
        [f1_rating!.id]: 3 + Math.floor(Math.random() * 3),
        [f1_hear!.id]: pick(hearOpts).value,
        [f1_features!.id]: pickMany(featureOpts.map(o => o.value), 1, 3),
        [f1_comment!.id]: f1_comments[i % f1_comments.length],
      },
    })
  }
  console.log("  ↳ Form 1: BipsForm Product Feedback — minimal, 20 submissions")

  // ══════════════════════════════════════════════════════════════════════════
  // Form 2 — BipsForm Hackathon Registration
  // Theme: neon | Published + Public | Response limit: 50
  // Covers: short_text (minLength+maxLength), email, phone, single_select,
  //         multi_select, date (minDate+maxDate)
  // ══════════════════════════════════════════════════════════════════════════
  const [f2] = await db.insert(formsTable).values({
    title: "BipsForm Hackathon Registration",
    description: "Register for the BipsForm 48-hour build challenge. Spots are limited!",
    createdBy: userId,
    isPublished: true,
    isPublic: true,
    themeId: "neon",
    slug: makeSlug("bipsform-hackathon"),
    responseLimit: 50,
  }).returning({ id: formsTable.id })
  const f2id = f2!.id

  const [f2_name] = await db.insert(formFieldsTable).values({
    formId: f2id, label: "Full Name", labelKey: "full_name",
    type: "short_text", isRequired: true, index: "1", placeholder: "Your full name",
    validations: { minLength: 2, maxLength: 80 },
  }).returning({ id: formFieldsTable.id })

  const [f2_email] = await db.insert(formFieldsTable).values({
    formId: f2id, label: "Email", labelKey: "email",
    type: "email", isRequired: true, index: "2", placeholder: "you@example.com",
  }).returning({ id: formFieldsTable.id })

  const [f2_phone] = await db.insert(formFieldsTable).values({
    formId: f2id, label: "Phone Number", labelKey: "phone_number",
    type: "phone", isRequired: false, index: "3",
  }).returning({ id: formFieldsTable.id })

  const trackOpts = [
    { id: "t1", label: "Web Development", value: "web" },
    { id: "t2", label: "AI / ML", value: "ai_ml" },
    { id: "t3", label: "Mobile Apps", value: "mobile" },
    { id: "t4", label: "Open Source", value: "open_source" },
  ]
  const [f2_track] = await db.insert(formFieldsTable).values({
    formId: f2id, label: "Hackathon Track", labelKey: "hackathon_track",
    type: "single_select", isRequired: true, index: "4", options: trackOpts,
  }).returning({ id: formFieldsTable.id })

  const dietOpts = [
    { id: "d1", label: "Vegetarian", value: "vegetarian" },
    { id: "d2", label: "Vegan", value: "vegan" },
    { id: "d3", label: "Gluten Free", value: "gluten_free" },
    { id: "d4", label: "No restrictions", value: "none" },
  ]
  const [f2_diet] = await db.insert(formFieldsTable).values({
    formId: f2id, label: "Dietary Restrictions", labelKey: "dietary_restrictions",
    type: "multi_select", isRequired: false, index: "5", options: dietOpts,
  }).returning({ id: formFieldsTable.id })

  // date field with minDate + maxDate validation
  const [f2_date] = await db.insert(formFieldsTable).values({
    formId: f2id, label: "Preferred Arrival Date", labelKey: "arrival_date",
    type: "date", isRequired: true, index: "6",
    validations: { minDate: "2025-06-01", maxDate: "2025-06-30" },
  }).returning({ id: formFieldsTable.id })

  const hackNames = ["Sam Patel", "Nina Russo", "Omar Hassan", "Lily Chen", "Marcus Green",
    "Priya Singh", "Tom Baker", "Zoe Adams", "Ravi Kumar", "Sophie Martin", "Alex Park", "Dana White", "Chris Evans"]

  for (let i = 0; i < 13; i++) {
    const name = hackNames[i % hackNames.length]!
    await db.insert(submissionTable).values({
      formId: f2id,
      values: {
        [f2_name!.id]: name,
        [f2_email!.id]: `${name.split(" ")[0]!.toLowerCase()}${i}@example.com`,
        [f2_phone!.id]: i % 3 !== 0 ? `+1 555 ${String(100 + i).padStart(3, "0")} ${String(1000 + i * 7)}` : "",
        [f2_track!.id]: pick(trackOpts).value,
        [f2_diet!.id]: pickMany(dietOpts.map(o => o.value), 1, 2),
        [f2_date!.id]: `2025-06-${String(1 + (i % 28)).padStart(2, "0")}`,
      },
    })
  }
  console.log("  ↳ Form 2: BipsForm Hackathon Registration — neon, response limit, date field, 13 submissions")

  // ══════════════════════════════════════════════════════════════════════════
  // Form 3 — BipsForm Beta Tester Application
  // Theme: retro | Published + Private
  // Covers: multiple conditional fields using different operators:
  //   - "equals"     → referral code shown only if referred = yes
  //   - "not_equals" → skip reason shown only if experience != senior
  //   - "is_filled"  → linkedin shown only if name is filled
  //   - "contains"   → extra note shown if why_beta contains "analytics"
  // ══════════════════════════════════════════════════════════════════════════
  const [f3] = await db.insert(formsTable).values({
    title: "BipsForm Beta Tester Application",
    description: "Apply to get early access to upcoming BipsForm features.",
    createdBy: userId,
    isPublished: true,
    isPublic: false,
    themeId: "retro",
    slug: makeSlug("bipsform-beta"),
  }).returning({ id: formsTable.id })
  const f3id = f3!.id

  const [f3_name] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Your Name", labelKey: "your_name",
    type: "short_text", isRequired: true, index: "1", placeholder: "John Doe",
    validations: { minLength: 2, maxLength: 80 },
  }).returning({ id: formFieldsTable.id })

  // Conditional: is_filled on f3_name → show LinkedIn only if name filled
  const [f3_linkedin] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "LinkedIn Profile URL", labelKey: "linkedin",
    type: "short_text", isRequired: false, index: "2", placeholder: "https://linkedin.com/in/…",
    conditions: { fieldId: f3_name!.id, operator: "is_filled", value: "" },
  }).returning({ id: formFieldsTable.id })

  const [f3_email] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Email", labelKey: "email",
    type: "email", isRequired: true, index: "3",
  }).returning({ id: formFieldsTable.id })

  const experienceOpts = [
    { id: "e1", label: "< 1 year", value: "junior" },
    { id: "e2", label: "1–3 years", value: "mid" },
    { id: "e3", label: "3+ years", value: "senior" },
  ]
  const [f3_exp] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Years of experience with form builders", labelKey: "experience",
    type: "single_select", isRequired: true, index: "4", options: experienceOpts,
  }).returning({ id: formFieldsTable.id })

  // Conditional: not_equals → show "what's holding you back?" only if NOT senior
  const [f3_barrier] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "What's been your biggest challenge with form builders so far?", labelKey: "barrier",
    type: "short_text", isRequired: false, index: "5", placeholder: "e.g. hard to set up, too expensive…",
    conditions: { fieldId: f3_exp!.id, operator: "not_equals", value: "senior" },
  }).returning({ id: formFieldsTable.id })

  const referredOpts = [
    { id: "r1", label: "Yes", value: "yes" },
    { id: "r2", label: "No", value: "no" },
  ]
  const [f3_referred] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Were you referred by an existing BipsForm user?", labelKey: "referred",
    type: "single_select", isRequired: true, index: "6", options: referredOpts,
  }).returning({ id: formFieldsTable.id })

  // Conditional: equals → referral code shown only if referred = yes
  const [f3_code] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Referral Code", labelKey: "referral_code",
    type: "short_text", isRequired: false, index: "7", placeholder: "BIPS-XXXX",
    conditions: { fieldId: f3_referred!.id, operator: "equals", value: "yes" },
  }).returning({ id: formFieldsTable.id })

  const [f3_why] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Why do you want to beta test BipsForm?", labelKey: "why_beta",
    type: "long_text", isRequired: true, index: "8", placeholder: "Tell us what you'd like to test…",
    validations: { minLength: 20, maxLength: 800 },
  }).returning({ id: formFieldsTable.id })

  // Conditional: contains → extra analytics note shown if why mentions "analytics"
  const [f3_analytics_note] = await db.insert(formFieldsTable).values({
    formId: f3id, label: "Which analytics features are most important to you?", labelKey: "analytics_note",
    type: "short_text", isRequired: false, index: "9", placeholder: "e.g. charts, exports, field breakdowns…",
    conditions: { fieldId: f3_why!.id, operator: "contains", value: "analytics" },
  }).returning({ id: formFieldsTable.id })

  const betaNames = ["Alex Kim", "Jordan Lee", "Morgan Davis", "Taylor Smith", "Riley Brown", "Casey Wilson", "Drew Johnson", "Quinn Martin"]
  const whyBetaList = [
    "I build forms weekly for my clients and want to try BipsForm's conditional logic.",
    "Heard great things about BipsForm and want to push the analytics to its limits.",
    "I want to test the analytics features with real survey data from my team.",
    "Using BipsForm for user research — would love early access to new field types.",
    "Been looking for a better Typeform alternative and BipsForm looks promising.",
    "Our team needs advanced analytics and BipsForm seems to have what we need.",
    "I want to stress-test the conditional rendering with complex forms.",
    "BipsForm's simplicity is what draws me in — I want to help shape its future.",
  ]

  for (let i = 0; i < 8; i++) {
    const referred = i % 3 === 0 ? "yes" : "no"
    const exp = pick(experienceOpts).value
    const why = whyBetaList[i % whyBetaList.length]!
    const hasAnalytics = why.toLowerCase().includes("analytics")
    await db.insert(submissionTable).values({
      formId: f3id,
      values: {
        [f3_name!.id]: betaNames[i % betaNames.length],
        [f3_linkedin!.id]: i % 2 === 0 ? `https://linkedin.com/in/${betaNames[i % betaNames.length]!.split(" ")[0]!.toLowerCase()}` : "",
        [f3_email!.id]: `${betaNames[i % betaNames.length]!.split(" ")[0]!.toLowerCase()}@example.com`,
        [f3_exp!.id]: exp,
        ...(exp !== "senior" ? { [f3_barrier!.id]: "Too complex to set up conditional logic" } : {}),
        [f3_referred!.id]: referred,
        ...(referred === "yes" ? { [f3_code!.id]: `BIPS-${String(1000 + i * 37)}` } : {}),
        [f3_why!.id]: why,
        ...(hasAnalytics ? { [f3_analytics_note!.id]: "Field-level breakdowns and exportable charts" } : {}),
      },
    })
  }
  console.log("  ↳ Form 3: BipsForm Beta Tester Application — retro, 4 conditional fields (equals/not_equals/is_filled/contains), 8 submissions")

  // ══════════════════════════════════════════════════════════════════════════
  // Form 4 — BipsForm User Research
  // Theme: anime | Published + Public
  // Covers: number (min+max), two rating fields (5★ ease + 10pt NPS), long_text
  //         Conditional: is_empty → low_score_reason shown if NPS < filled
  // ══════════════════════════════════════════════════════════════════════════
  const [f4] = await db.insert(formsTable).values({
    title: "BipsForm User Research",
    description: "Help the BipsForm team understand how you build and share forms.",
    createdBy: userId,
    isPublished: true,
    isPublic: true,
    themeId: "anime",
    slug: makeSlug("bipsform-user-research"),
  }).returning({ id: formsTable.id })
  const f4id = f4!.id

  const [f4_count] = await db.insert(formFieldsTable).values({
    formId: f4id, label: "How many forms do you create per month?", labelKey: "forms_per_month",
    type: "number", isRequired: true, index: "1", placeholder: "e.g. 5",
    validations: { min: 0, max: 500 },
  }).returning({ id: formFieldsTable.id })

  const [f4_ease] = await db.insert(formFieldsTable).values({
    formId: f4id, label: "How easy is BipsForm to use?", labelKey: "ease_of_use",
    type: "rating", isRequired: true, index: "2", validations: { maxRating: 5 },
  }).returning({ id: formFieldsTable.id })

  const [f4_nps] = await db.insert(formFieldsTable).values({
    formId: f4id, label: "How likely are you to recommend BipsForm? (0–10)", labelKey: "nps",
    type: "rating", isRequired: true, index: "3", validations: { maxRating: 10 },
  }).returning({ id: formFieldsTable.id })

  // Conditional: is_empty → only shown if NPS is left empty (unanswered)
  // (demonstrates the is_empty operator)
  const [f4_skip_reason] = await db.insert(formFieldsTable).values({
    formId: f4id, label: "Why did you skip the NPS question?", labelKey: "skip_reason",
    type: "short_text", isRequired: false, index: "4",
    conditions: { fieldId: f4_nps!.id, operator: "is_empty", value: "" },
  }).returning({ id: formFieldsTable.id })

  const [f4_improve] = await db.insert(formFieldsTable).values({
    formId: f4id, label: "What would make BipsForm indispensable for you?", labelKey: "improvement",
    type: "long_text", isRequired: false, index: "5",
    validations: { maxLength: 600 },
  }).returning({ id: formFieldsTable.id })

  const improvements = [
    "Team workspaces so I can share forms with colleagues.",
    "Zapier integration to send submissions to other tools.",
    "Ability to embed forms on my own website.",
    "Email notifications for every new BipsForm submission.",
    "File upload field type.",
    "Logic jumps between pages.",
    "",
    "More chart types in the analytics view.",
    "Webhooks support.",
    "Custom branding — remove the BipsForm logo.",
  ]

  for (let i = 0; i < 15; i++) {
    await db.insert(submissionTable).values({
      formId: f4id,
      values: {
        [f4_count!.id]: 1 + Math.floor(Math.random() * 20),
        [f4_ease!.id]: 3 + Math.floor(Math.random() * 3),
        [f4_nps!.id]: 6 + Math.floor(Math.random() * 5),
        [f4_improve!.id]: improvements[i % improvements.length],
      },
    })
  }
  console.log("  ↳ Form 4: BipsForm User Research — anime, number+rating validations, is_empty conditional, 15 submissions")

  // ══════════════════════════════════════════════════════════════════════════
  // Form 5 — BipsForm Early Access Waitlist
  // Theme: nature | Published + Public | Expires soon (demo expiresAt)
  // Covers: short_text, email, date (availability), single_select
  //         expiresAt set to show expiry state
  // ══════════════════════════════════════════════════════════════════════════
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 3) // expires in 3 days

  const [f5] = await db.insert(formsTable).values({
    title: "BipsForm Early Access Waitlist",
    description: "Join the waitlist for BipsForm Pro. Limited spots — closes soon!",
    createdBy: userId,
    isPublished: true,
    isPublic: true,
    themeId: "nature",
    slug: makeSlug("bipsform-waitlist"),
    expiresAt,
  }).returning({ id: formsTable.id })
  const f5id = f5!.id

  const [f5_name] = await db.insert(formFieldsTable).values({
    formId: f5id, label: "Full Name", labelKey: "full_name",
    type: "short_text", isRequired: true, index: "1",
    validations: { minLength: 2, maxLength: 80 },
  }).returning({ id: formFieldsTable.id })

  const [f5_email] = await db.insert(formFieldsTable).values({
    formId: f5id, label: "Work Email", labelKey: "work_email",
    type: "email", isRequired: true, index: "2",
  }).returning({ id: formFieldsTable.id })

  const [f5_date] = await db.insert(formFieldsTable).values({
    formId: f5id, label: "When do you plan to start using BipsForm Pro?", labelKey: "start_date",
    type: "date", isRequired: false, index: "3",
    validations: { minDate: new Date().toISOString().slice(0, 10) },
  }).returning({ id: formFieldsTable.id })

  const planOpts = [
    { id: "p1", label: "Solo / Freelancer", value: "solo" },
    { id: "p2", label: "Small team (2–10)", value: "small_team" },
    { id: "p3", label: "Company (10+)", value: "company" },
  ]
  const [f5_plan] = await db.insert(formFieldsTable).values({
    formId: f5id, label: "Who will be using BipsForm?", labelKey: "plan",
    type: "single_select", isRequired: true, index: "4", options: planOpts,
  }).returning({ id: formFieldsTable.id })

  const waitlistNames = ["Jamie Fox", "Mia Torres", "Luca Bianchi", "Aisha Rahman", "Ben Carter", "Yuki Tanaka", "Eva Müller", "Noah Williams", "Sara Chen", "Luis Mendez"]

  for (let i = 0; i < 10; i++) {
    const name = waitlistNames[i % waitlistNames.length]!
    await db.insert(submissionTable).values({
      formId: f5id,
      values: {
        [f5_name!.id]: name,
        [f5_email!.id]: `${name.split(" ")[0]!.toLowerCase()}@company.com`,
        [f5_date!.id]: i % 4 !== 0 ? randomDate(30) : "",
        [f5_plan!.id]: pick(planOpts).value,
      },
    })
  }
  console.log("  ↳ Form 5: BipsForm Early Access Waitlist — nature, expiresAt set, date field, 10 submissions")

  // ══════════════════════════════════════════════════════════════════════════
  // Form 6 — BipsForm Feature Roadmap Vote (draft)
  // Theme: minimal | Draft — no submissions
  // ══════════════════════════════════════════════════════════════════════════
  const [f6] = await db.insert(formsTable).values({
    title: "BipsForm Feature Roadmap Vote",
    description: "Vote on what BipsForm should build next. Coming soon!",
    createdBy: userId,
    isPublished: false,
    isPublic: false,
    themeId: "minimal",
    slug: makeSlug("bipsform-roadmap-vote"),
  }).returning({ id: formsTable.id })
  const f6id = f6!.id

  const roadmapOpts = [
    { id: "rv1", label: "Team collaboration & workspaces", value: "teams" },
    { id: "rv2", label: "File upload field", value: "file_upload" },
    { id: "rv3", label: "Custom domain support", value: "custom_domain" },
    { id: "rv4", label: "Zapier / webhook integration", value: "integrations" },
    { id: "rv5", label: "Form embedding (iframe)", value: "embed" },
  ]
  await db.insert(formFieldsTable).values({
    formId: f6id, label: "What should BipsForm build next?", labelKey: "build_next",
    type: "single_select", isRequired: true, index: "1", options: roadmapOpts,
  })
  await db.insert(formFieldsTable).values({
    formId: f6id, label: "How urgently do you need this?", labelKey: "urgency",
    type: "rating", isRequired: true, index: "2", validations: { maxRating: 5 },
  })
  await db.insert(formFieldsTable).values({
    formId: f6id, label: "Tell us more about your use case", labelKey: "use_case",
    type: "long_text", isRequired: false, index: "3", validations: { maxLength: 400 },
  })
  console.log("  ↳ Form 6: BipsForm Feature Roadmap Vote — draft, 0 submissions")

  console.log(`\n✅ Seeded 6 forms across all themes`)
  console.log(`   Themes used   : minimal, neon, retro, anime, nature`)
  console.log(`   Field types   : short_text, long_text, email, phone, number, date, single_select, multi_select, rating`)
  console.log(`   Validations   : minLength, maxLength, min, max, maxRating, minDate, maxDate`)
  console.log(`   Conditionals  : equals, not_equals, is_filled, is_empty, contains`)
  console.log(`   Form states   : published+public, published+private, draft, expiresAt, responseLimit`)
  console.log(`\n   Login: ${DEMO_EMAIL}  /  ${DEMO_PASSWORD}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
