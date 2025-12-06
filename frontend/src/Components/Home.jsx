import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SonalikaLogo from "./SonalikaLogo.png";
const Home = () => {
  const [step, setStep] = useState("branding");
  const navigate = useNavigate();

  // Premium gold and jewel tones color palette
  const colors = {
    gold: "#f9e79f",
    darkGold: "#D4AF37",
    roseGold: "#B76E79",
    platinum: "#E5E4E2",
    deepNavy: "#00072D",
    velvet: "#3D0C02",
    light: "#F8F8F8",
    diamond: "rgba(255,255,255,0.9)",
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === "branding") setStep("departments");
    }, 3500);
    return () => clearTimeout(timer);
  }, [step]);
  // Enhanced animations
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const logoAnimation = {
    hidden: { opacity: 110, scale: 0.7, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const slideUp = {
    hidden: { y: 80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2,
      },
    },
    exit: {
      y: -50,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden grid justify-center items-center"
      style={{
        backgroundColor: colors.deepNavy,
        color: colors.light,
      }}
    >
      {/* Luxury background with subtle gold texture */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z' fill='none' stroke='${colors.gold.replace(
              "#",
              "%23"
            )}' stroke-width='0.8'/%3E%3C/svg%3E")`,
            backgroundSize: "120px",
          }}
        ></div>
      </div>

      <div className="w-full max-w-7xl px-4 z-10">
        <AnimatePresence mode="wait">
          {/* Branding Screen */}
          {step === "branding" && (
            <motion.div
              key="branding"
              className="flex flex-col items-center justify-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
            >
              <motion.div variants={logoAnimation} className="mb-8 relative">
                <img
                  src={SonalikaLogo}
                  alt="Sonalika Jewellers"
                  style={{ filter: "brightness(0) invert(1)" }}
                  className="w-72 h-auto filter drop-shadow-lg"
                />
                {/* Animated glow around logo */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.8, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    boxShadow: `0 0 60px ${colors.gold}`,
                    zIndex: -1,
                  }}
                />
              </motion.div>

              <motion.h1
                className="text-3xl font-light tracking-widest mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1 }}
                style={{ color: colors.platinum }}
              >
                
              </motion.h1>
              <motion.p
                className="text-lg tracking-widest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 1.4, duration: 1 }}
                style={{ color: colors.gold }}
              >
                Where Tradition Meets Timeless Craftsmanship
              </motion.p>
            </motion.div>
          )}

          {/* Departments Selection Screen */}
          {step === "departments" && (
            <motion.div
              key="departments"
              className="p-10 rounded-2xl relative overflow-hidden"
              style={{
                backgroundColor: `${colors.deepNavy}DD`,
                border: `1px solid ${colors.gold}60`,
                boxShadow: `0 10px 50px ${colors.gold}10`,
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={slideUp}
            >
              {/* Decorative gold border elements */}
              <div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent via-10% via-90% to-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${colors.gold}20, ${colors.gold}80, ${colors.gold}20, transparent)`,
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent via-10% via-90% to-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${colors.gold}20, ${colors.gold}80, ${colors.gold}20, transparent)`,
                }}
              />

              {/* Logo Header */}
              <motion.div
                className="flex justify-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <img
                  src={SonalikaLogo}
                  alt="Sonalika Jewellers"
                  style={{ filter: "brightness(0) invert(1)" }}
                  className="w-52 h-auto filter drop-shadow-md"
                />
              </motion.div>

              <motion.h2
                className="text-3xl font-serif text-center mb-10"
                    style={{
                  color: colors.gold,
                  textShadow: `0 0 10px ${colors.gold}40`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                SELECT DEPARTMENT
              </motion.h2>

              <div className="space-y-6">
                {/* Production Department */}
    <motion.button
                  onClick={() => {
                    navigate("/spteamlogin", { state: { team: "productionteam" } });
                  }}
                  className="w-full py-5 rounded-xl font-medium text-lg relative overflow-hidden group"
      style={{
                    background: `linear-gradient(135deg, ${colors.gold}20 0%, transparent 100%)`,
                    border: `1px solid ${colors.gold}`,
        color: colors.gold,
                    boxShadow: `0 5px 20px ${colors.gold}10`,
      }}
      whileHover={{
                    background: `linear-gradient(135deg, ${colors.gold}30 0%, transparent 100%)`,
                    boxShadow: `0 8px 40px ${colors.gold}30`,
      }}
      whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
    >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={colors.gold}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
                    PRODUCTION
      </span>
    </motion.button>

                {/* Sales Department */}
    <motion.button
                  onClick={() => {
                    navigate("/spteamlogin", { state: { team: "salesteam" } });
                  }}
                  className="w-full py-5 rounded-xl font-medium text-lg relative overflow-hidden group"
      style={{
                    background: `linear-gradient(135deg, ${colors.gold}20 0%, transparent 100%)`,
                    border: `1px solid ${colors.gold}`,
        color: colors.gold,
                    boxShadow: `0 5px 20px ${colors.gold}10`,
      }}
      whileHover={{
                    background: `linear-gradient(135deg, ${colors.gold}30 0%, transparent 100%)`,
                    boxShadow: `0 8px 40px ${colors.gold}30`,
      }}
      whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
    >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={colors.gold}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
                    SALES
      </span>
    </motion.button>

                {/* Accounts Department */}
                <motion.button
                  onClick={() => {
                    navigate("/accountslogin");
                  }}
                  className="w-full py-5 rounded-xl font-medium text-lg relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${colors.gold}20 0%, transparent 100%)`,
                    border: `1px solid ${colors.gold}`,
                    color: colors.gold,
                    boxShadow: `0 5px 20px ${colors.gold}10`,
                  }}
                  whileHover={{
                    background: `linear-gradient(135deg, ${colors.gold}30 0%, transparent 100%)`,
                    boxShadow: `0 8px 40px ${colors.gold}30`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={colors.gold}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ACCOUNTS
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
