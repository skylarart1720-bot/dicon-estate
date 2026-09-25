"use client";

import Link from "next/link";
import { ArrowUpRight, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MediaStackViewer } from "@/components/media-stack-viewer";
import { ShareButton } from "@/components/share-button";

export type CollectionKey = "housing" | "land" | "painting";
type MediaStack = { id: string; title: string; location: string; description: string; status: "available" | "sold" | "rented"; assets: Array<{ id: string; url: string; name: string; type?: string }> };

export const collectionData: Record<CollectionKey, { title: string; image: string; description: string }> = {
  housing: { title: "Housing", image: "/assets/home.jpg", description: "Find a comfortable place to live, with verified listings coming directly from our property feed." },
  land: { title: "Land", image: "/assets/1.jpg", description: "Explore secure land opportunities across Ghana, with new listings ready to be connected from the backend." },
  painting: { title: "Painting", image: "/assets/2.jpg", description: "Refresh your property with dependable interior and exterior painting services from our finishing team." },
};

export function CollectionPage({ collection }: { collection: CollectionKey }) {
  const data = collectionData[collection];
  const [stacks, setStacks] = useState<MediaStack[]>([]);

  useEffect(() => {
    const load = () => fetch(`/api/upload?collection=${collection}`).then((response) => response.json()).then((result) => setStacks(result.stacks ?? [])).catch(() => undefined);
    load();
    const refreshId = window.setInterval(load, 10000);
    return () => window.clearInterval(refreshId);
  }, [collection]);

  return (
    <main>
      <SiteHeader />
      <section className="collection-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,43,87,.88), rgba(8,43,87,.2)), url(${data.image})` }}><div className="container"><p className="eyebrow light">{data.title}</p><h1>{data.title}</h1><p>{data.description}</p></div></section>
      <section className="catalog container">
        {stacks.length ? <div className="listing-stack-grid">{stacks.map((stack) => <article className="listing-stack" key={stack.id}><MediaStackViewer assets={stack.assets} title={stack.title} /><div className="listing-stack-body"><div className="listing-heading-row"><p className="eyebrow">{stack.location || "Ghana"}</p><span className={`listing-status ${stack.status}`}>{stack.status}</span></div><h2>{stack.title}</h2><p>{stack.description || "Details for this listing will be available soon."}</p><div className="listing-actions"><ShareButton title={stack.title} /><Link className="text-link" href="/contact">Enquire about this listing <ArrowUpRight size={16} /></Link></div></div></article>)}</div> : <div className="backend-gallery backend-gallery--empty"><div className="backend-gallery-card backend-gallery-card--empty"><Database size={25} /><div><strong>Live listings are coming soon</strong><span>Backend feed connection ready</span></div><Link className="text-link" href="/contact">Request information <ArrowUpRight size={16} /></Link></div></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
