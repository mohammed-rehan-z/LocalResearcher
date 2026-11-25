"use client";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

export function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
