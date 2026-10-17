import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import logo from '../../assets/brand/gradify-logo.png';

// Section anchors on the landing page ("/#id" also works when the user is on another public page).
const SECTION_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'Overview', href: '/#overview' },
];

// Top bar for public (signed-out) pages. Spans the viewport with proportional side
// margins (capped at 1760px) and sticks to the top while scrolling.
// The outer wrapper provides the margins; it ignores clicks so the gutters stay transparent.
// Pass `showSectionLinks` to show the landing-page section links in the middle.
export default function PublicNavbar({ showSectionLinks = false }) {
  return (
    <div className="pointer-events-none sticky top-4 z-50 mt-6 px-4 md:px-8 lg:px-14">
      <header className="pointer-events-auto mx-auto flex h-16 max-w-[1760px] items-center justify-between gap-4 rounded-xl border border-ink/5 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
        <Link
          to="/"
          aria-label="Gradify home"
          className="flex items-center rounded focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none"
        >
          <img src={logo} alt="Gradify" className="h-10 w-auto" />
        </Link>

        {showSectionLinks && (
          <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded text-sm font-medium whitespace-nowrap text-ink/80 hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <nav aria-label="Account" className="flex items-center gap-4 sm:gap-8">
          <Link
            to="/auth/login"
            className="rounded text-base font-medium whitespace-nowrap text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none"
          >
            Sign in
          </Link>
          <Button as={Link} to="/register" variant="navy" size="nav" className="whitespace-nowrap">
            Get started
          </Button>
        </nav>
      </header>
    </div>
  );
}