import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  FileText,
  History,
  KanbanSquare,
  Lightbulb,
  Mail,
  Play,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { FiGithub, FiGitCommit } from 'react-icons/fi';


import PublicNavbar from '../../../components/layout/PublicNavbar';
import FeatureCard from '../../../components/landing/FeatureCard';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import logo from '../../../assets/brand/gradify-logo.png';
const PAGE_TITLE = 'Gradify: AI-Powered Graduation Platform';

const TEAM_EMAIL = 'blueprintteam656@gmail.com';
const GITHUB_URL = 'https://github.com/Rawan262/Gradify';

const FEATURES = [
  {
    icon: Lightbulb,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    title: 'AI Task Generation',
    description:
      'Instantly break down complex project requirements into actionable tasks and sprints with our intelligent AI planner.',
  },
  {
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Auto Documentation',
    description:
      'Generate comprehensive documentation formats automatically as you complete tasks, saving hours of manual writing.',
  },
  {
    icon: FiGithub,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    title: 'GitHub Integration',
    description:
      'Keep your code and tasks in perfect sync. Connect repositories to automatically update task statuses based on commits.',
  },
  {
    icon: Users,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Team Collaboration',
    description:
      'Built for academic teams. Assign tasks, review progress, and collaborate seamlessly in one unified workspace.',
  },
];

const STEPS = [
  {
    step: 'Step 01',
    pillClass: 'bg-[#1b2a5e] text-white',
    icon: UserPlus,
    iconClass: 'bg-violet-50 text-violet-600',
    title: '1. Create & Invite',
    description:
      'Set up your graduation workspace, define milestones, and invite team members or your supervisor with instant access codes.',
    note: 'Instant Team Onboarding',
    dotClass: 'bg-emerald-500',
    noteClass: 'text-slate-500',
  },
  {
    step: 'Step 02',
    pillClass: 'bg-violet-600 text-white',
    icon: Sparkles,
    iconClass: 'bg-violet-100 text-violet-600',
    title: '2. AI Generation & Docs',
    description:
      'Decompose project scopes into sprints automatically and draft chapters, SRS documents, and meeting summaries effortlessly.',
    note: 'Smart Sprint Breakdown',
    dotClass: 'bg-violet-600',
    noteClass: 'text-violet-700',
    highlight: true,
  },
  {
    step: 'Step 03',
    pillClass: 'bg-[#2a3f86] text-white',
    icon: KanbanSquare,
    iconClass: 'bg-blue-50 text-[#2a3f86]',
    title: '3. Track & Integrate',
    description:
      'Connect GitHub commits, drag-and-drop tasks on the Kanban board, and receive verified supervisor feedback.',
    note: 'Live GitHub Sync & Review',
    dotClass: 'bg-blue-500',
    noteClass: 'text-slate-500',
  },
];

// Static demo content for the "interactive workspace" preview (not real project data).
const TONES = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  gray: 'border-slate-200 bg-slate-100 text-slate-600',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
};

const AVATARS = {
  MK: 'bg-violet-100 text-violet-700',
  SA: 'bg-blue-100 text-blue-700',
  YA: 'bg-emerald-100 text-emerald-700',
};

const BOARD = [
  {
    title: 'TO DO',
    count: 2,
    dot: 'bg-slate-400',
    cards: [
      {
        tags: [{ label: 'Documentation', tone: 'amber' }],
        title: 'Chapter 4: System Architecture Diagram',
        description: 'AI auto-generator ready with PlantUML syntax.',
        meta: { icon: Clock, text: '2 days' },
        avatar: 'MK',
      },
      {
        tags: [{ label: 'Testing', tone: 'gray' }],
        title: 'Obstacle Avoidance Unit Tests',
        meta: { icon: FiGitCommit, text: '#342' },
        avatar: 'SA',
      },
    ],
  },
  {
    title: 'IN PROGRESS',
    count: 2,
    dot: 'bg-blue-500',
    cards: [
      {
        highlight: true,
        tags: [{ label: 'GitHub Branch', tone: 'blue' }],
        aside: { label: 'Synced', tone: 'green' },
        title: 'FastAPI Telemetry Gateway',
        description: 'Live commit stream active on',
        code: 'feat/ws-telemetry',
        meta: { icon: History, text: '4 commits' },
        avatar: 'YA',
      },
      {
        tags: [{ label: 'AI Draft', tone: 'violet' }],
        title: 'Literature Review Synthesis',
        meta: { icon: Clock, text: 'Today' },
        avatar: 'MK',
      },
    ],
  },
  {
    title: 'SUPERVISOR REVIEW',
    count: 1,
    dot: 'bg-orange-500',
    cards: [
      {
        review: true,
        tags: [{ label: 'Pending Approval', tone: 'amber' }],
        title: 'Project Scope Document & SRS',
        description: 'Advisor Dr. Tarek requested revisions on section 3.2.',
        footerBadge: { label: 'Feedback Ready', tone: 'amber' },
        footerText: '2 comments',
      },
    ],
  },
  {
    title: 'COMPLETED',
    count: 4,
    dot: 'bg-emerald-500',
    cards: [
      {
        done: true,
        tags: [{ label: 'Approved', tone: 'green' }],
        aside: { text: 'Mar 24' },
        title: 'Sprint 1 Defense Presentation Deck',
        description: 'Exported as LaTeX & PDF bundle',
      },
      {
        done: true,
        tags: [{ label: 'Approved', tone: 'green' }],
        aside: { text: 'Mar 19' },
        title: 'Database Schema ERD & Migrations',
      },
    ],
  },
];

// Real facts about the project (SRS modules, user roles, AI Workspace pages).
const STATS = [
  { value: '8', label: 'Integrated Modules', note: 'From authentication to supervisor analytics' },
  { value: '3', label: 'User Roles', note: 'Team Leader, Team Member & Supervisor' },
  { value: '8', label: 'AI Workspace Tools', note: 'SRS analysis, roadmap, chat, task generation & more' },
];

// A link with `href` is clickable; a link without one renders as plain text (no page exists yet).
const FOOTER_COLUMNS = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Kanban Board', href: '#workflow' },
      { label: 'AI Assistant', href: '#how-it-works' },
      { label: 'Integrations', href: '#features' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Documentation', href: GITHUB_URL, external: true },
      { label: 'Academic Support', href: `mailto:${TEAM_EMAIL}` },
      { label: 'University Guidelines' },
      { label: 'LaTeX Templates' },
    ],
  },
  {
    title: 'LEGAL & SECURITY',
    links: [{ label: 'Privacy Policy' }, { label: 'Terms of Service' }, { label: 'Security Protocol' }],
  },
];
// Optional load animation, staggered; disabled under prefers-reduced-motion.
const FADE_UP = 'motion-safe:animate-fade-up';
const delay = (index) => ({ animationDelay: `${index * 80}ms` });

function SectionHeading({ badge, badgeClass = 'bg-indigo-50 text-indigo-900/80', title, subtitle, id }) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeClass}`}
      >
        {badge}
      </span>
      <h2 id={id} className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="text-base text-muted">{subtitle}</p>}
    </div>
  );
}

function StepCard({ step }) {
  const Icon = step.icon;

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
        step.highlight ? 'border-violet-200 ring-1 ring-violet-100' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${step.pillClass}`}>
          {step.step}
        </span>
        <span className={`flex size-9 items-center justify-center rounded-lg ${step.iconClass}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>

      <h3 className="mt-6 text-lg font-bold text-ink">{step.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{step.description}</p>

      <p className={`mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs ${step.noteClass}`}>
        <span className={`size-2 rounded-full ${step.dotClass}`} />
        {step.note}
      </p>
    </article>
  );
}

function TaskCard({ card }) {
  const MetaIcon = card.meta?.icon;

  return (
    <div
      className={`rounded-lg border bg-white p-3 text-left shadow-sm ${
        card.highlight
          ? 'border-blue-300 ring-1 ring-blue-100'
          : card.review
            ? 'border-amber-300'
            : card.done
              ? 'border-emerald-200'
              : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag.label}
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TONES[tag.tone]}`}
            >
              {card.done && <CheckCircle2 size={10} aria-hidden="true" />}
              {tag.label}
            </span>
          ))}
        </div>

        {card.aside?.label && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${TONES[card.aside.tone]}`}>
            {card.aside.label}
          </span>
        )}
        {card.aside?.text && <span className="text-[10px] text-slate-400">{card.aside.text}</span>}
      </div>

      <h4
        className={`mt-2 text-[13px] font-bold leading-snug ${
          card.done ? 'text-slate-500 line-through' : 'text-ink'
        }`}
      >
        {card.title}
      </h4>

      {card.description && (
        <p className={`mt-1 text-[11px] leading-4 ${card.done ? 'text-slate-400' : 'text-muted'}`}>
          {card.description}{' '}
          {card.code && (
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
              {card.code}
            </code>
          )}
        </p>
      )}

      {(card.meta || card.footerBadge) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {card.meta ? (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <MetaIcon size={12} aria-hidden="true" />
              {card.meta.text}
            </span>
          ) : (
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TONES[card.footerBadge.tone]}`}
            >
              {card.footerBadge.label}
            </span>
          )}

          {card.avatar && (
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold ${AVATARS[card.avatar]}`}
            >
              {card.avatar}
            </span>
          )}
          {card.footerText && <span className="text-[11px] text-slate-500">{card.footerText}</span>}
        </div>
      )}
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="mx-auto mt-10 w-full max-w-[1040px] rounded-[28px] bg-slate-200/60 p-3 shadow-xl ring-1 ring-slate-200">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* window bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <i className="size-3 rounded-full bg-red-400" />
              <i className="size-3 rounded-full bg-amber-400" />
              <i className="size-3 rounded-full bg-green-500" />
            </span>
            <span className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-ink">
              Gradify Core Platform • Sprint 3 Active
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-muted">Sprint Progress:</span>
            <span className="h-1.5 w-28 rounded-full bg-slate-200">
              <span className="block h-1.5 w-[68%] rounded-full bg-violet-600" />
            </span>
            <span className="font-bold text-violet-600">68%</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
              Supervisor Verified
            </span>
          </div>
        </div>

        {/* project header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#1b2a5e] text-sm font-bold text-white">
              GP
            </span>
            <div className="text-left">
              <p className="text-sm font-bold text-ink">Autonomous Drone Delivery System</p>
              <p className="text-[11px] text-muted">Faculty of Computers &amp; Information • Team Alpha (4 Members)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex -space-x-2" aria-hidden="true">
              <i className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-violet-500 text-[9px] font-bold not-italic text-white">MK</i>
              <i className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[9px] font-bold not-italic text-white">SA</i>
              <i className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[9px] font-bold not-italic text-white">YA</i>
              <i className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-[9px] font-bold not-italic text-white">+1</i>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700">
              <Sparkles size={12} aria-hidden="true" />
              AI Sprint Planner
            </span>
          </div>
        </div>

        {/* board */}
        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-slate-50/50 p-4 md:grid-cols-2 xl:grid-cols-4">
          {BOARD.map((column) => (
            <div key={column.title} className="rounded-xl border border-slate-200 bg-slate-100/70 p-3">
              <div className="mb-3 flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-600">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${column.dot}`} />
                  {column.title} ({column.count})
                </span>
                <span className="text-slate-400">+</span>
              </div>
              <div className="flex flex-col gap-3">
                {column.cards.map((card) => (
                  <TaskCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="py-2 text-center text-[11px] text-slate-500">Illustrative preview</p>
    </div>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto w-full max-w-[1328px] px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img src={logo} alt="Gradify" className="h-11 w-auto" />
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
              Accelerate Your Academic Journey. The intelligent graduation project companion built for student
              teams and faculty advisors.
            </p>
            <p className="mt-3 text-xs text-slate-400">Faculty of Computers &amp; Information • EELU</p>
            <a
              href={`mailto:${TEAM_EMAIL}`}
              className="mt-1 block text-xs text-slate-500 hover:text-ink hover:underline"
            >
              {TEAM_EMAIL}
            </a>
          </div>

          {FOOTER_COLUMNS.map((column, index) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-bold tracking-wider text-ink">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="hover:text-ink hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>

              {index === FOOTER_COLUMNS.length - 1 && (
                <div className="mt-5 flex gap-2 text-slate-600">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Gradify on GitHub"
                    className="flex size-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    <FiGithub size={15} />
                  </a>
                  <a
                    href={`mailto:${TEAM_EMAIL}`}
                    aria-label={`Email the Gradify team at ${TEAM_EMAIL}`}
                    className="flex size-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    <Mail size={15} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>© 2026 Gradify Platform. All rights reserved.</p>
          <p>Built for academic excellence &amp; graduation engineering teams.</p>
        </div>
      </div>
    </footer>
  );
}
// Public marketing page. Intentionally ignores dark mode — no dark: variants here.
export default function Landing() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    // flow-root stops the navbar's top margin from collapsing through and exposing the body.
    <div className="flow-root min-h-screen bg-page-bg font-sans text-ink">
           <PublicNavbar showSectionLinks />

      <div className="mx-auto w-full max-w-[1328px] px-4 pb-24">
        <main>
          {/* ---------- hero ---------- */}
          <section
            aria-labelledby="hero-title"
            className="mx-auto mt-8 flex w-full max-w-[1000px] flex-col items-center gap-6 text-center"
          >
            <Badge
              variant="brand"
              size="sm"
              icon={<Zap size={14} aria-hidden="true" className="text-amber-500" />}
              className={FADE_UP}
              style={delay(0)}
            >
              AI-Powered Graduation Platform
            </Badge>

            <h1
              id="hero-title"
              style={delay(1)}
              className={`text-4xl leading-[44px] font-extrabold tracking-[-0.015em] md:text-5xl md:leading-[56px] lg:text-[56px] lg:leading-16 ${FADE_UP}`}
            >
              <span className="block text-ink">Your graduation project,</span>
              <span className="block text-brand-violet">done right</span>
            </h1>

            <p style={delay(2)} className={`max-w-[640px] text-base text-muted ${FADE_UP}`}>
              Plan, collaborate, and document your graduation project with AI — all in one workspace built for
              academic teams.
            </p>

            <div style={delay(3)} className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row ${FADE_UP}`}>
              <Button as={Link} to="/register" variant="navy" size="cta">
                Get started free
              </Button>
              <a
                href="#workflow"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50"
              >
                <Play size={12} aria-hidden="true" className="fill-violet-600 text-violet-600" />
                Watch Demo
              </a>
            </div>
          </section>

          {/* ---------- features ---------- */}
          <section
            id="features"
            aria-labelledby="features-title"
            className="mx-auto mt-16 w-full max-w-[1120px] scroll-mt-24"
          >
            <h2 id="features-title" className="sr-only">
              Features
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {FEATURES.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                  style={delay(index + 4)}
                  className={`${FADE_UP} ${index < 2 ? 'md:min-h-[200px]' : ''}`}
                />
              ))}
            </div>
          </section>

          {/* ---------- how it works ---------- */}
          <section
            id="how-it-works"
            aria-labelledby="how-title"
            className="mx-auto mt-28 w-full max-w-[1120px] scroll-mt-24"
          >
            <SectionHeading
              id="how-title"
              badge="Simple 3-step process"
              title="How Gradify Accelerates Your Project"
              subtitle="From initial thesis conception to graduation defense, streamline every milestone with purpose-built academic tooling."
            />
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <StepCard key={step.step} step={step} />
              ))}
            </div>
          </section>

          {/* ---------- interactive workspace ---------- */}
          <section id="workflow" aria-labelledby="workspace-title" className="mt-28 scroll-mt-24">
            <SectionHeading
              id="workspace-title"
              badge="Interactive workspace"
              badgeClass="bg-violet-50 text-brand-violet"
              title="Engineered for Academic Precision"
              subtitle="Experience a purpose-built environment that keeps team members synchronized with their advisor at every sprint."
            />
            <WorkspacePreview />
          </section>

          {/* ---------- stats + call to action ---------- */}
          <section id="overview" aria-label="Overview" className="mx-auto mt-28 w-full max-w-[1120px] scroll-mt-24">
            <dl className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-white/70 px-6 py-8 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-slate-200">
              {STATS.map((stat) => (
                <div key={stat.label} className="px-4">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-4xl font-extrabold text-ink">{stat.value}</dd>
                  <p className="mt-1 text-sm font-semibold text-brand-violet">{stat.label}</p>
                  <p className="mt-1 text-xs text-muted">{stat.note}</p>
                </div>
              ))}
            </dl>

            <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b2a5e] via-[#22397a] to-[#2f5aa8] px-6 py-14 text-center text-white shadow-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-violet-500/30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-blue-400/30 blur-3xl"
              />

              <h2 className="relative mx-auto max-w-[640px] text-3xl font-extrabold leading-tight md:text-4xl">
                Ready to complete your graduation project on time?
              </h2>
              <p className="relative mx-auto mt-3 max-w-[520px] text-base text-white/80">
                Plan, build, and document your graduation project with your team and supervisor in one workspace.
              </p>

              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-[#1b2a5e] shadow-md transition hover:bg-slate-100"
                >
                  Get started for free
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}