"use client";

import { createElement, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface AnimatedTextProps {
  children: ReactNode;
  /** Word-level (default) or char-level reveal. */
  by?: "word" | "char";
  /** Stagger delay in seconds. */
  stagger?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * AnimatedText — staggered reveal of words or chars. Uses framer-motion and
 * respects prefers-reduced-motion.
 */
export function AnimatedText({
  children,
  by = "word",
  stagger = 0.05,
  className,
  as = "span",
}: AnimatedTextProps) {
  const prefersReduced = useReducedMotion();
  const text = typeof children === "string" ? children : "";
  const tokens = by === "word" ? text.split(/(\s+)/) : Array.from(text);

  if (prefersReduced || !text) {
    // createElement avoids JSX dynamic-tag inference picking up R3F's
    // three.js intrinsics (which collapse children to `never`).
    return createElement(as, { className: cn(className) }, children);
  }

  const Container = motion[as] as typeof motion.span;

  return (
    <Container
      className={cn("inline-block", className)}
      custom={stagger}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      aria-label={text}
    >
      {tokens.map((token, i) =>
        token.match(/^\s+$/) ? (
          <span key={i}>{token}</span>
        ) : (
          <motion.span key={i} variants={childVariants} className="inline-block">
            {token}
          </motion.span>
        ),
      )}
    </Container>
  );
}
