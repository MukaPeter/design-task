# Synthetic Personas — Research & Build Plan

Personas are grounded in real data and used as LLM-powered synthetic users to test built UI.
Each persona lives as an `.md` file. The LLM reads it as a system prompt and responds in character.

---

## What to build

Two personas per industry vertical. One from the **compliance / quality side**, one from the **engineering / builder side** — they have opposite relationships with friction.

### Persona structure (per file)

- Name, age, role, company size
- Goals and what success looks like for them
- Daily frustrations and blockers
- Tools they use today
- Mental model of compliance (burden vs. necessary vs. invisible)
- Real quotes from research (verbatim where possible)
- What makes them give up on a product
- What makes them trust a product

---

## Verticals to cover

### 1. Medical Devices / SaMD (current Ketryx focus)
- **QA / Regulatory Affairs Manager** — owns compliance, audit-ready, spreadsheet-dependent
- **Software Engineer at medtech startup** — fast mover, compliance feels like tax

### 2. Automotive (expansion target)
- Functional safety engineer (ISO 26262)
- Embedded software developer (AUTOSAR, real-time systems)

### 3. Robotics (expansion target)
- Systems engineer managing hardware-software integration
- Safety certification lead (IEC 62061 / ISO 10218)

### 4. Aeronautics (expansion target)
- DO-178C compliance engineer
- Avionics software developer

---

## Where to get the data

### Ketryx-specific
- https://www.ketryx.com — product positioning, language they use
- https://www.ketryx.com/blog — pain points, workflows, user quotes
- Their LinkedIn page — customer stories, team posts, language
- G2 / Capterra reviews — raw, unfiltered user frustrations and praise
- Any public case studies or webinar recordings

### Industry research
- **Medical:** FDA guidance documents, IEC 62304 standard overviews, forums like Greenlight Guru community
- **Automotive:** MISRA C forums, Automotive SPICE community, LinkedIn groups for ISO 26262 engineers
- **Robotics:** ROS community discussions, IEEE Robotics papers on safety certification friction
- **Aeronautics:** FAA advisory circulars, DO-178C practitioner blogs, aerospace LinkedIn communities

### Synthetic data sources (if no real users available)
- Reddit: r/QualityAssurance, r/embedded, r/aerospace
- Stack Overflow discussions around compliance tooling
- LinkedIn comments on posts about regulatory burden
- Job postings — the pain is always in the requirements list

---

## Implementation plan (when ready to build)

1. Write one `.md` persona file per user type (start with the two medical device ones)
2. Create a system prompt template that wraps the persona data and instructs the LLM to stay in character
3. Wire it into the Claude API route in the Next.js project
4. Build a persona selector UI — switch between personas mid-session
5. Test by showing the persona a screenshot or describing a UI flow and asking for reaction

---

## Competitive landscape

Understanding what tools personas used before Ketryx shapes their expectations, vocabulary, and frustrations.

### Medical devices (current Ketryx market)

| Company | What they do | How they differ from Ketryx |
|---|---|---|
| **Greenlight Guru** | eQMS + clinical data for medtech | QMS-first, less developer-native |
| **Jama Software** | Requirements management + traceability | Enterprise, complex, not AI-native |
| **PTC Codebeamer** | ALM for safety-critical industries | Powerful but steep learning curve, cross-industry |
| **IBM DOORS / ELM** | Legacy enterprise requirements tool | Old, heavy, hated by engineers |
| **Visure Solutions** | Requirements ALM for MedTech/Pharma | Broad, cross-industry, not AI-native |
| **Cognidox** | eQMS + document management | Document-centric, not dev-tool overlay |
| **Matrix One** | Requirements + design control + eQMS | Life sciences focus, less developer-friendly |
| **Klaris** | Automated regulatory doc checks | Narrower scope, MedTech-specific |
| **ValGenesis** | Digital validation for life sciences | Pharma-heavy, validation lifecycle |

### Automotive — ISO 26262 (expansion target)

| Company | What they do |
|---|---|
| **Parasoft** | Static analysis + unit testing, TÜV SÜD certified for all ASIL levels |
| **Perforce** | Only ISO 26262 certified data management platform |
| **PTC Codebeamer** | ALM with ISO 26262 template workflows for OEMs and suppliers |
| **Visure Solutions** | Requirements ALM with ISO 26262 traceability policy enforcement |
| **TrustInSoft** | Advanced static analysis for ISO 26262 compliance |

### Aerospace — DO-178C (expansion target)

| Company | What they do |
|---|---|
| **Perforce** | Version control + traceability for avionics teams |
| **Visure Solutions** | DO-178C template workflows and requirements traceability |
| **PTC Codebeamer** | Cross-industry ALM with aerospace compliance support |

### Robotics — IEC 62061 / ISO 10218 (expansion target)
No dominant dedicated tooling yet — most teams use a combination of automotive and medical tools. This is a greenfield opportunity for Ketryx.

### The cross-industry threat
**PTC Codebeamer** and **Visure Solutions** appear across all three expansion verticals. They are the closest thing to a true cross-industry competitor to what Ketryx is building. They lack the AI-native angle and developer-tool overlay approach — that is Ketryx's differentiator.

### What this means for personas

- Engineers who came from IBM DOORS will have **low expectations** and be easily impressed by modern UX
- Teams switching from Greenlight Guru are used to **QMS thinking**, not developer-tool overlays
- Startups that were on **spreadsheets** have the most raw frustration and lowest switching cost
- Enterprise teams from Jama/Codebeamer are used to **power but hate complexity** — they'll probe for depth

### Competitor data sources
- [CBInsights Ketryx competitors](https://www.cbinsights.com/company/ketryx/alternatives-competitors)
- [Gartner Peer Reviews](https://www.gartner.com/reviews/product/ketryx-1909240902/alternatives)
- G2 comparison pages for each competitor
- Reddit threads comparing these tools in r/QualityAssurance and r/medical_devices

---

## Notes

- Personas should **never give design feedback** — they react as a user would, not as a designer
- Frustration and confusion are more useful outputs than praise
- Each persona needs a **breaking point** — the moment they'd abandon the product
- Expand to new verticals only after the medical device ones are validated
