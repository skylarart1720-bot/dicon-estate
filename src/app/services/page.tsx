import {
  ArrowUpRight,
  BadgeDollarSign,
  BedDouble,
  Building2,
  FileText,
  Landmark,
  Paintbrush2,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const services = [
  { number: "01", title: "Land demarcation", copy: "Clear and accurate land demarcation to help you understand and protect your property boundaries.", icon: Landmark },
  { number: "02", title: "Land documentation", copy: "Support with site plans, indentures, and the documents needed for a confident property transaction.", icon: FileText },
  { number: "03", title: "Land registration", copy: "Guidance through land registration so your investment is properly documented and secure.", icon: ShieldCheck },
  { number: "04", title: "Buying and selling", copy: "Professional support for buying and selling lands and properties at the right value.", icon: BadgeDollarSign },
  { number: "05", title: "Building plans", copy: "Architectural design and building plan support for turning your land into a future home.", icon: Building2 },
  { number: "06", title: "Room rentals", copy: "Comfortable, secure room options for people looking for a practical and affordable place to stay.", icon: BedDouble },
  { number: "07", title: "Painting & finishing", copy: "Interior and exterior repainting solutions that refresh homes, rooms, and properties with quality finishes.", icon: Paintbrush2 },
];

export default function ServicesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-intro container">
        <p className="eyebrow">Our services</p>
        <h1>Build, invest,<br /><em>grow with us.</em></h1>
        <p>From land demarcation and registration to buying, selling, and building plans, Dicon Estate provides trusted property solutions for your next move.</p>
      </section>

      <section className="services-showcase container">
        {services.map(({ number, title, copy, icon: Icon }) => (
          <article className="service-card" key={number}>
            <div className="service-media">
              <span>{number}</span>
              <div className="service-icon-wrap"><Icon size={32} /></div>
            </div>
            <div className="service-copy">
              <h2>{title}</h2>
              <p>{copy}</p>
              <a href="tel:0547415834">Book a consultation <ArrowUpRight size={16} /></a>
            </div>
          </article>
        ))}
      </section>

      <section className="catalog-cta">
        <div className="container">
          <p className="eyebrow light">Your land, our priority</p>
          <h2>Secure your<br /><em>future today.</em></h2>
          <a className="text-link light" href="tel:0547415834">Call 0547415834 <ArrowUpRight size={17} /></a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
