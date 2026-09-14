# Project Specification: NEVIMA Website

## 1. Project Information

- **Goal of the project:** To build a front-end website for the agency's own brand
- **Brand:** Nevima — agency offering website creation (AI-powered workflow) and branding/visual identity services
- **Target audience for the agency:** Small to medium businesses, with room to explore higher-purchasing-power segments specifically for website creation — primarily small clinics/aesthetic practices and independent real estate agents/small agencies, without internal technical departments
- **Positioning:** Built on leverage — two people, using the right expertise and modern tools, deliver results equivalent to or above much larger agencies, without the overhead that normally comes with size. This translates into dynamism (fast decisions, no unnecessary hierarchy or bureaucracy), efficiency (not "doing less," but eliminating waste while keeping quality intact), and direct communication (the client always speaks with whoever is actually doing the work). "Less is more" is the philosophy, not an excuse — being small is a deliberate structural advantage, not a limitation to work around.
- **Aesthetic:** Modern, avant-garde, clean — tendentially minimalist, but expressive enough to reflect the "less is more" philosophy rather than defaulting to generic minimalism.
- **Website language:** [TBD — Portuguese, English, or both]

## 2. List of All Tools

| **Tool** | **Purpose for Nevima** |
| --- | --- |
| **Claude Code** | Primary agent responsible for executing code, managing file structure, and implementing logic based on this specification. |
| **Next.js** | Handles site logic, page routing, and SSR/SSG for proper SEO indexing. |
| **HTML** | Defines core content, hierarchy, and structure of every page. |
| **Tailwind CSS** | Utility-first CSS framework for fast, consistent styling directly in code. |
| **Framer Motion** | Library for micro-interactions and smooth scroll animations, enhancing the premium feel of the site. |
| **Vercel** | Hosting platform — chosen for the team's workflow (fast deploys, free tier sufficient for current project scale). |

## 3. Workflow

- The workflow is section by section: build one section, verify visually, adjust, then move to the next. This does NOT mean returning to earlier sections for improvements is off-limits.
- Reference screenshots for inspiration/direction: [TBD — folder path once inspiration references are collected]
- Browser verification workflow: **Playwright MCP** (official Microsoft server), connected directly to Claude Code — no custom screenshot script needed. Setup (run once per machine/project):
  ```
  claude mcp add playwright npx @playwright/mcp@latest
  ```
  Once connected, ask Claude Code directly in natural language to open `localhost:3000` (with `npm run dev` running), navigate, and take screenshots or inspect specific elements. This gives structured access to the DOM in addition to visual screenshots — more precise than pixel-only comparison.
- When comparing against references, be specific: spacing/padding, font size/weight/line-height, exact colors (hex), alignment, border-radius, shadows, image sizing.

## 4. Visual Identity (Strict Rules)

**Status: IN DEFINITION — do not invent or assume any of the following. Ask before proceeding if a decision is needed here.**

- **Wordmark/Logo:** Already defined — "nevima", geometric sans-serif typeface, lowercase, white on black background. The lowercase "a" has a slightly distinct treatment from the rest of the characters (intentional subtle disruption — part of brand identity, must be preserved in any use of the wordmark). Logo file located in the `nevima.identity` folder.
- **Symbol:** In development (brainstorming phase). Do not use any placeholder symbol without explicit confirmation.
- **Colors:** [TBD — palette not yet defined beyond the black/white base of the current wordmark]
- **Typography (body/headings):** [TBD]
- **Brand tone/keywords:** efficiency through leverage, "less is more," precision balanced with creativity, subtle disruption (not loud), technology + human/creative side

## 5. Site Map & Sections

**Status: TBD — not yet defined.** [To be filled in once the site structure for Nevima's own website is planned — e.g. Home, Services, Portfolio/Case Studies, About, Contact]

## 6. Always Do First

- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- **If an instruction is not clear, ask short clarifying questions before proceeding.** Do not assume colors, symbols, copy, or structural decisions that have not been explicitly confirmed.
- Follow the established Git workflow: never work or commit directly on `master`. Always create a branch (`[name]/[task]`) for new work, and open a Pull Request to merge back.
