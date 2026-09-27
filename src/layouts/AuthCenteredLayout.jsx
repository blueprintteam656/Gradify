// Plain off-white auth shell (no split panel, no background image). Pages wrap their
// card in it and may pass a `footer` rendered under the card.
// Intentionally ignores dark mode to match the reference design — no dark: variants here.
export default function AuthCenteredLayout({ children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-page-bg px-4 py-10 font-sans text-gray-900">
      {children}
      {footer && <div className="mt-6 text-center">{footer}</div>}
    </div>
  );
}
