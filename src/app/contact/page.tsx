import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <section className="contact-wrap container">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Let&apos;s talk property.</h1>
          <p className="contact-lead">Whether you are looking for a room, land, or painting support, our team is ready to help you make the right move.</p>
          <div className="contact-details">
            <a href="tel:0547415834"><div><Phone size={16} /><div><small>Phone</small><span>0547415834</span></div></div><ArrowUpRight size={16} /></a>
            <a href="mailto:jasondicksonbawa@gmail.com"><div><Mail size={16} /><div><small>Email</small><span>jasondicksonbawa@gmail.com</span></div></div><ArrowUpRight size={16} /></a>
            <div><div><MapPin size={16} /><div><small>Location</small><span>Wa, Ghana</span></div></div></div>
          </div>
        </div>

        <ContactForm />
      </section>
      <SiteFooter />
    </main>
  );
}
