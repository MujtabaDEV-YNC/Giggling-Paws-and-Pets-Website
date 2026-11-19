import { STORE_COLLECTIONS } from "@/lib/products";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Giggling Paws & Pets home">
        <PawIcon className="brand-paw" />
        <span className="brand-name">
          Giggling
          <br />
          Paws &amp; Pets
        </span>
      </a>
      <nav className="site-nav" aria-label="Primary">
        <a href="#shop-by-pet">Shop</a>
        <a href="#for-dogs">For Dogs</a>
        <a href="#for-cats">For Cats</a>
        <a href={STORE_COLLECTIONS}>Collections</a>
        <a href="#happy-paws-club">The Happy Paws Club</a>
      </nav>
    </header>
  );
}

export function PawIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <ellipse cx="12" cy="16" rx="5" ry="4.2" fill="currentColor" />
      <ellipse cx="5.5" cy="10" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="9.5" cy="5.6" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="14.5" cy="5.6" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="18.5" cy="10" rx="2.1" ry="2.7" fill="currentColor" />
    </svg>
  );
}
