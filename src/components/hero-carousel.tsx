"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type Slide = { id: string; url: string; name: string; type?: string };

function isVideo(slide: Slide) {
  return slide.type?.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(slide.name);
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const active = slides[Math.min(currentIndex, Math.max(slides.length - 1, 0))];

  useEffect(() => {
    const loadSlides = () => fetch("/api/upload?collection=carousel")
      .then((response) => response.json())
      .then((result) => setSlides(result.files ?? []))
      .catch(() => undefined);
    loadSlides();
    const refreshId = window.setInterval(loadSlides, 10000);
    return () => window.clearInterval(refreshId);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const intervalId = window.setInterval(() => setCurrentIndex((index) => (index + 1) % slides.length), 5000);
    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const goToSlide = (direction: number) => setCurrentIndex((index) => (index + direction + slides.length) % slides.length);

  return (
    <section className="home-carousel">
      <div className="container home-carousel-inner">
        <div className="home-carousel-header">
          <div><p className="eyebrow">Live featured feed</p><h2>Modern spaces, thoughtfully presented.</h2></div>
          <div className="carousel-controls" aria-label="Carousel controls"><button type="button" aria-label="Previous slide" onClick={() => goToSlide(-1)} disabled={slides.length < 2}><ArrowLeft size={18} /></button><button type="button" aria-label="Next slide" onClick={() => goToSlide(1)} disabled={slides.length < 2}><ArrowRight size={18} /></button></div>
        </div>
        <div className="carousel-window">
          {active ? <div className="carousel-active-media">{isVideo(active) ? <video key={active.id} src={active.url} controls autoPlay muted playsInline className="carousel-media" /> : <div className="carousel-media" role="img" aria-label={active.name} style={{ backgroundImage: `url(${active.url})` }} />}</div> : <div className="carousel-empty"><p className="eyebrow">Live property feed</p><strong>Your featured media will appear here.</strong><span>Upload images or videos from the backend to start the carousel.</span></div>}
        </div>
        {slides.length > 1 && <div className="carousel-dots" aria-label="Carousel pagination">{slides.map((slide, index) => <button key={slide.id} type="button" className={index === Math.min(currentIndex, slides.length - 1) ? "dot active" : "dot"} onClick={() => setCurrentIndex(index)} aria-label={`Go to slide ${index + 1}`} />)}</div>}
      </div>
    </section>
  );
}
