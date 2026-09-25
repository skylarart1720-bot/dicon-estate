"use client";

import { Check, Copy, Mail, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({ title, text: `Take a look at ${title}`, url });
      return;
    }
    setOpen((value) => !value);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <div className="share-control"><button className="share-button" type="button" onClick={shareNative} aria-expanded={open}><Share2 size={15} /> Share</button>{open && <div className="share-menu"><a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">Facebook</a><a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noreferrer">X</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer">LinkedIn</a><a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}><Mail size={13} /> Email</a><button type="button" onClick={copyLink}>{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy link"}</button></div>}</div>;
}
