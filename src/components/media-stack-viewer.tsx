"use client";

import { useState } from "react";

type Asset = { id: string; url: string; name: string; type?: string };

function isVideo(asset: Asset) {
  return asset.type?.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(asset.name);
}

export function MediaStackViewer({ assets, title }: { assets: Asset[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = assets[activeIndex] ?? assets[0];
  if (!active) return null;

  return (
    <div className="stack-viewer">
      <div className="stack-viewer-main">
        {isVideo(active) ? <video key={active.id} className="stack-viewer-media" src={active.url} controls playsInline preload="metadata" aria-label={`${title} video`} /> : <div className="stack-viewer-media" role="img" aria-label={active.name} style={{ backgroundImage: `url(${active.url})` }} />}
  </div>
      {assets.length > 1 && <div className="stack-viewer-tabs" role="tablist" aria-label={`${title} media`}>
        {assets.map((asset, index) => <button key={asset.id} type="button" role="tab" aria-selected={index === activeIndex} className={index === activeIndex ? "stack-viewer-tab active" : "stack-viewer-tab"} onClick={() => setActiveIndex(index)}>
          {isVideo(asset) ? <video src={asset.url} muted preload="metadata" aria-hidden="true" /> : <span style={{ backgroundImage: `url(${asset.url})` }} />}
          <small>{isVideo(asset) ? "Video" : `Image ${index + 1}`}</small>
        </button>)}
      </div>}
    </div>
  );
}
