import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return <footer className="footer container"><div><Link href="/" className="site-logo"><Image src="/assets/logo.jpg" alt="Dicon Estate" width={220} height={140} /></Link><p className="footer-note">Invest today. Secure your future.</p></div><div className="footer-links"><div><p className="eyebrow">Pages</p><Link href="/services">Services</Link><Link href="/housing">Housing</Link><Link href="/land">Land</Link><Link href="/painting">Painting</Link><Link href="/contact">Contact</Link></div><div><p className="eyebrow">Call us</p><a href="tel:0547415834">0547415834</a><a href="mailto:jasondicksonbawa@gmail.com">jasondicksonbawa@gmail.com</a></div></div><div className="footer-bottom"><span>© 2026 Dicon Estate</span><span>Built by @ Hybrid Inc</span></div></footer>;
}
