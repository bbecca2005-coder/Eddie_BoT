import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EddyAvatarProps {
  isSpeaking?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function EddyAvatar({ isSpeaking, className, size = "md" }: EddyAvatarProps) {
  const [isMouthOpen, setIsMouthOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      // Start alternating every 400ms when speaking
      interval = setInterval(() => {
        setIsMouthOpen((prev) => !prev);
      }, 400);
    } else {
      // Reset to closed when not speaking
      setIsMouthOpen(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-64 h-64 md:w-96 md:h-96",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.g
          animate={!isSpeaking ? {
            rotate: [0, 0.5, -0.5, 0],
            y: [0, 0.5, 0]
          } : {
            rotate: 0,
            y: 0
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originX: "50px", originY: "90px" }}
        >
          {/* Main "E" Structure with Arched Top */}
          <path
            d="M35 90V15C35 15 35 5 55 5C75 5 75 15 75 15V30M35 55H70M35 90H70"
            stroke="black"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* "Y" Structure inside the bottom part */}
          <path
            d="M45 65L52.5 75L60 65M52.5 75V90"
            stroke="black"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Eyebrows */}
          <motion.path
            d="M40 14H50"
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
            animate={isSpeaking ? {
              y: -1,
              rotate: -5
            } : {
              y: 0,
              rotate: 0
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            style={{ originX: "45px", originY: "14px" }}
          />
          <motion.path
            d="M65 14H75"
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
            animate={isSpeaking ? {
              y: -1,
              rotate: 5
            } : {
              y: 0,
              rotate: 0
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            style={{ originX: "70px", originY: "14px" }}
          />

          {/* Eyes (Semi-circles) */}
          <path
            d="M42 25C42 21 45 18 49 18C53 18 56 21 56 25H42Z"
            fill="black"
          />
          <path
            d="M59 25C59 21 62 18 66 18C70 18 73 21 73 25H59Z"
            fill="black"
          />
          
          {/* Mouth (Semi-circle - Flat top with black boundary and white middle) */}
          <motion.path
            d="M48 35H67C67 39 63 42 57.5 42C52 42 48 39 48 35Z"
            fill="white"
            stroke="black"
            strokeWidth="2.5"
            animate={{
              scaleY: isMouthOpen ? 2.2 : 1,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            style={{ originX: 0.5, originY: 0 }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
