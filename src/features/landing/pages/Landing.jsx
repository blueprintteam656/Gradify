import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Lightbulb, Sparkles, Users } from 'lucide-react';
import { FiGithub } from 'react-icons/fi';

import PublicNavbar from '../../../components/layout/PublicNavbar';
import FeatureCard from '../../../components/landing/FeatureCard';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const PAGE_TITLE = 'Gradify: AI-Powered Graduation Platform';

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
    // Not in the Figma (card looked unfinished); short copy keeps the grid balanced.
    description: 'Link your repository to track commits and progress alongside your project tasks.',
  },
  {
    icon: Users,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Team Collaboration',
    // Not in the Figma (card looked unfinished); short copy keeps the grid balanced.
    description: 'Chat, schedule meetings, and share files with your team and supervisor in one place.',
  },
];

// Optional load animation, staggered; disabled under prefers-reduced-motion.
const FADE_UP = 'motion-safe:animate-fade-up';
const delay = (index) => ({ animationDelay: `${index * 80}ms` });

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
    <div className="flow-root min-h-screen bg-page-bg pb-24 font-sans text-ink">
      <PublicNavbar />

      <div className="mx-auto w-full max-w-[1328px] px-4">
        <main>
          <section
            aria-labelledby="hero-title"
            className="mx-auto mt-8 flex w-full max-w-[1000px] flex-col items-center gap-6 text-center"
          >
            <Badge
              variant="brand"
              size="sm"
              icon={<Sparkles size={14} aria-hidden="true" />}
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
              <Button as={Link} to="/auth/login" variant="plain" size="cta">
                Sign in
              </Button>
            </div>
          </section>

          <section aria-labelledby="features-title" className="mx-auto mt-8 w-full max-w-[1120px]">
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
        </main>
      </div>
    </div>
  );
}
