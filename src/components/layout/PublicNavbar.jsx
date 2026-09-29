import { Link } from 'react-router-dom';
import Button from '../ui/Button';

// Top bar for public (signed-out) pages. Spans the viewport with proportional side
// margins (capped at 1760px) and sticks to the top while scrolling.
// The outer wrapper provides the margins; it ignores clicks so the gutters stay transparent.
export default function PublicNavbar() {
  return (
    <div className="pointer-events-none sticky top-4 z-50 mt-6 px-4 md:px-8 lg:px-14">
      <header className="pointer-events-auto mx-auto flex h-16 max-w-[1760px] items-center justify-between gap-4 rounded-xl border border-ink/5 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
        <Link
          to="/"
          className="rounded text-2xl font-semibold text-ink focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none"
        >
          Gradify
        </Link>
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
