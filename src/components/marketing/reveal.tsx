"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function Reveal({
  children,
  className,
  delay = 0,
  ...props
}: React.ComponentProps<"div"> & {
  delay?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const element = root.current;
      if (reduced || !element) return;

      gsap.set(element, { y: 28, autoAlpha: 0 });

      const reveal = () => {
        gsap.to(element, {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          delay,
          ease: "power3.out",
        });
      };

      if (!("IntersectionObserver" in window)) {
        reveal();
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.unobserve(element);
        },
        { threshold: 0.12, rootMargin: "0px 0px -6%" },
      );

      observer.observe(element);
      return () => observer.disconnect();
    },
    { scope: root, dependencies: [delay] },
  );

  return (
    <div ref={root} className={cn(className)} {...props}>
      {children}
    </div>
  );
}
