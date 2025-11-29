/**
 * Legal Layout Component
 *
 * Layout for legal pages (Terms, Privacy Policy, Guidelines, Cookies).
 * Does not require authentication - legal pages are public.
 * Navbar and Footer are provided by root layout.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
