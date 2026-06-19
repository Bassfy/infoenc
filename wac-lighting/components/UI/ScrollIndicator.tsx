"use client";

import { motion } from "framer-motion";

export function ScrollIndicator() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <span className="text-[10px] font-heading uppercase tracking-[0.3em] text-white/40">
        Scroll
      </span>
      <div className="relative w-[1px] h-16 bg-white/10 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-gold-DEFAULT to-transparent"
          style={{ height: "50%" }}
          animate={{ y: ["0%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

export function ScrollProgress() {
  return null;
}
