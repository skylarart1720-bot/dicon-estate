import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HeroCarousel } from "@/components/hero-carousel";

export default function Home() {
  return <main>
    <SiteHeader />
    <section className="hero"><div className="hero-content container"><p className="eyebrow light">Land sales & room rentals <span>✳</span></p><h1>Your trusted<br /><em>property partner.</em></h1><div className="hero-bottom"><p>We help individuals and families find secure, affordable, and well-located properties with confidence.</p></div></div><div className="hero-meta container"><span>Dicon Estate · Secure your future</span><span>Explore properties ↓</span></div></section>
    <HeroCarousel />
    <section className="intro container"><div className="intro-mark">✳</div><div><p className="eyebrow">Why Dicon Estate</p><h2>Invest today.<br /><em>Secure your future.</em></h2></div><p className="intro-copy">Whether you are looking to buy land, invest in property, or rent comfortable rooms, Dicon Estate is here to guide you every step of the way.</p></section>
    <section className="statement"><div className="container statement-inner"><p className="eyebrow light">Our promise to you</p><h2>Safe transactions.<br /><em>Happy customers.</em></h2><a className="text-link light" href="tel:0547415834">Call 0547415834 <ArrowUpRight size={17} /></a></div></section>
    <footer className="footer container"><div><Link href="/" className="site-logo"><Image src="/assets/logo.jpg" alt="Dicon Estate" width={220} height={140} /></Link><p className="footer-note">Invest today. Secure your future.</p></div><div className="footer-links"><div><p className="eyebrow">Explore</p><Link href="/services">Services</Link><Link href="/housing">Housing</Link><Link href="/land">Land</Link><Link href="/painting">Painting</Link><Link href="/contact">Contact</Link></div><div><p className="eyebrow">Call us</p><a href="tel:0547415834">0547415834</a><a href="mailto:jasondicksonbawa@gmail.com">jasondicksonbawa@gmail.com</a></div></div><div className="footer-bottom"><span>© 2026 Dicon Estate</span><span>Built by @ Hybrid Inc</span></div></footer>
  </main>;
}
