import Link from "next/link";
import { isNavigationItemEnabled } from "@/lib/featureFlags";

const nav = [
  { href: "/journey", label: "Our Journey" },
  { href: "/about", label: "Our Core" },
  { href: "/products", label: "Our Products" },
  { href: "/stories", label: "Our Stories" },
  { href: "/events", label: "Our Events" },
];

export function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Rangbheeni home">
          <span className="brand-mark" />
          <span>Rangbheeni</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {nav.filter(isNavigationItemEnabled).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link className="nav-cta" href="/#connect">Connect</Link>
        </nav>
      </div>
    </header>
  );
}
