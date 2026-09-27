import pageBackground from '../assets/auth/login-page-bg.jpg';
import panelBackground from '../assets/auth/login-panel-bg.jpg';

// Shared shell for auth screens: full-screen background with a centered split card —
// brand panel on the left (lg+), page content (children) on the right.
// Intentionally ignores dark mode to match the reference design — no dark: variants here.
export default function AuthSplitLayout({ children }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-primary bg-cover bg-center p-4 font-sans text-gray-900 lg:bg-fixed"
      style={{ backgroundImage: `url(${pageBackground})` }}
    >
      <p className="mb-6 text-3xl font-bold tracking-tight text-white lg:hidden">Gradify</p>

      <div className="grid w-full max-w-[448px] overflow-hidden rounded-2xl shadow-card lg:min-h-[550px] lg:max-w-[896px] lg:grid-cols-2 lg:rounded-3xl">
        <aside
          className="hidden flex-col items-center justify-center rounded-l-3xl border border-r-0 border-white/10 bg-primary bg-cover bg-center px-8 text-center lg:flex"
          style={{ backgroundImage: `url(${panelBackground})` }}
        >
          <p className="text-5xl font-bold tracking-tight text-white">Gradify</p>
          <p className="mt-2 text-base text-white/85">Accelerate Your Academic Journey</p>
        </aside>

        <section className="flex min-w-0 flex-col justify-center bg-white px-6 py-10 sm:px-12">
          {children}
        </section>
      </div>
    </div>
  );
}
