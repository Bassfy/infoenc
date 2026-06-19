"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const MARQUEE_ITEMS = [
  "TrueColor™ Technology",
  "CRI 97+",
  "SmartLink™ Integration",
  "50,000+ Products",
  "40+ Years of Innovation",
  "ENERGY STAR Partner",
  "DLC Premium Listed",
  "Tunable White",
  "IP67 Rated",
  "Matter Compatible",
  "IBEW Union Made",
  "100,000 Hour Life",
];

export function MarqueeBanner() {
  return (
    <div className="relative bg-gold-DEFAULT/[0.06] border-y border-gold-DEFAULT/10 overflow-hidden py-4">
      <div className="flex">
        {[0, 1].map((set) => (
          <motion.div
            key={set}
            className="flex items-center gap-0 shrink-0"
            animate={{ x: [0, "-50%"] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: set === 0 ? 0 : -12.5,
            }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <div key={`${set}-${i}`} className="flex items-center gap-0 shrink-0">
                <span className="text-[10px] font-heading uppercase tracking-[0.3em] text-gold-DEFAULT whitespace-nowrap px-8">
                  {item}
                </span>
                <div className="w-1 h-1 rounded-full bg-gold-DEFAULT/40" />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
