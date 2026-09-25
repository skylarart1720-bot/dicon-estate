"use client";

import { ArrowUpRight } from "lucide-react";
import { FormEvent, useRef } from "react";

const contactEmail = "jasondicksonbawa@gmail.com";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("Name") ?? "");
    const email = String(formData.get("Email") ?? "");
    const message = String(formData.get("Message") ?? "");
    const subject = encodeURIComponent(`Website enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
      <p className="eyebrow">Send an email</p>
      <label htmlFor="name">Your name</label>
      <input id="name" name="Name" type="text" required />
      <label htmlFor="email">Your email</label>
      <input id="email" name="Email" type="email" required />
      <label htmlFor="message">Message</label>
      <textarea id="message" name="Message" rows={6} required />
      <button type="submit">Send message <ArrowUpRight size={16} /></button>
    </form>
  );
}