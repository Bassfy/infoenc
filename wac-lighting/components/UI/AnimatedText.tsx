"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: "chars" | "words" | "lines";
  stagger?: number;
  once?: boolean;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  duration = 0.8,
  type = "words",
  stagger = 0.04,
  once = true,
  tag: Tag = "div",
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once, amount: 0.3 });

  const splitContent = () => {
    if (type === "chars") {
      return text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="split-char inline-block"
          initial={{ y: "110%", opacity: 0 }}
          animate={isInView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
          transition={{
            duration,
            delay: delay + i * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ));
    }

    if (type === "words") {
      return text.split(" ").map((word, i) => (
        <span key={i} className="split-word inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={isInView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{
              duration,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
          {" "}
        </span>
      ));
    }

    return (
      <span className="overflow-hidden inline-block">
        <motion.span
          className="inline-block"
          initial={{ y: "100%", opacity: 0 }}
          animate={isInView ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
          transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {text}
        </motion.span>
      </span>
    );
  };

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement & HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>} className={cn("overflow-hidden", className)}>
      {splitContent()}
    </Tag>
  );
}

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

export function RevealText({
  children,
  className,
  delay = 0,
  duration = 0.8,
  direction = "up",
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const variants = {
    hidden: {
      up: { y: 30, opacity: 0 },
      down: { y: -30, opacity: 0 },
      left: { x: 30, opacity: 0 },
      right: { x: -30, opacity: 0 },
    },
    visible: {
      up: { y: 0, opacity: 1 },
      down: { y: 0, opacity: 1 },
      left: { x: 0, opacity: 1 },
      right: { x: 0, opacity: 1 },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={variants.hidden[direction]}
      animate={isInView ? variants.visible[direction] : variants.hidden[direction]}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span aria-hidden="true" className="absolute inset-0 text-red-400/20 animate-pulse" style={{ textShadow: "-2px 0 #ff0000", clipPath: "polygon(0 30%, 100% 30%, 100% 50%, 0 50%)" }}>
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 text-blue-400/20 animate-pulse" style={{ textShadow: "2px 0 #0000ff", clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)", animationDelay: "0.1s" }}>
        {text}
      </span>
      {text}
    </span>
  );
}
