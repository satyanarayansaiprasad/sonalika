import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SonalikaLogo from "./SonalikaLogo.png";
import { Eye, EyeOff } from "lucide-react";
const Home = () => {
  const [step, setStep] = useState("branding");
  const [loginType, setLoginType] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === "branding") setStep("login");
    }, 3500);
    return () => clearTimeout(timer);
  }, [step]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginType) {
      setError("Please select login type (Admin or Team)");
      return;
    }

    setLoading(true);

    try {
      let endpoint, requestData;

      if (loginType === "admin") {
        endpoint = "/api/admin/login";
        requestData = {
          email: formData.username,
          password: formData.password,
          role: loginType === "admin" ? "admin" : "team",
        };
      } else {
        endpoint = "/api/admin/teamlogin";
        requestData = {
          email: formData.username,
          password: formData.password,
          role: loginType === "admin" ? "admin" : "team",
        };
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${endpoint}`,
        requestData,
        { withCredentials: true }
      );

      // On successful login
      if (loginType === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/spteamlogin");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Login Form */}
          {step === "login" && (
            <motion.div
              key="login"
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error message */}
                {error && (
                  <motion.div
                    className="p-3 rounded-lg text-sm flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: `${colors.roseGold}20`,
                      border: `1px solid ${colors.roseGold}50`,
                      color: colors.platinum,
                    }}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </motion.div>
                )}

                <div>
                  <label
                    className="block mb-3 text-sm uppercase tracking-wider flex items-center"
                    style={{ color: colors.gold }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your ID"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all duration-300"
                    style={{
                      backgroundColor: `${colors.deepNavy}AA`,
                      border: `1px solid ${colors.gold}30`,
                      color: colors.platinum,
                      "::placeholder": {
                        color: `${colors.gold}80`,
                      },
                    }}
                  />
                </div>

               <div className="relative w-full">
      <label
        className="block mb-3 text-sm uppercase tracking-wider flex items-center"
        style={{ color: colors.gold }}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Password
      </label>

      <input
        type={showPassword ? 'text' : 'password'}
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full px-5 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all duration-300 pr-12"
        style={{
          backgroundColor: `${colors.deepNavy}AA`,
          border: `1px solid ${colors.gold}30`,
          color: colors.platinum,
        }}
      />

      {/* 👁 Eye Icon */}
      <div
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-5 top-3/4 transform -translate-y-1/2 cursor-pointer"
      >
        {showPassword ? (
          <EyeOff size={20} color={colors.gold} />
        ) : (
          <Eye size={20} color={colors.gold} />
        )}
      </div>
    </div>

                <div className="flex flex-col space-y-3">
  <p className="text-sm font-medium text-gray-600 text-center">
    Please select login type:
  </p>
  
  <div className="flex space-x-4">
    <motion.button
      type="button"
      onClick={() => setLoginType("admin")}
      className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
        loginType === "admin" ? "bg-opacity-20" : "bg-opacity-0"
      }`}
      style={{
        backgroundColor:
          loginType === "admin"
            ? `${colors.gold}50`
            : "transparent",
        borderColor: `${colors.gold}80`,
        color: colors.gold,
      }}
      whileHover={{
        backgroundColor: `${colors.gold}30`,
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center justify-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
        Admin
      </span>
    </motion.button>

    <motion.button
      type="button"
      onClick={() => setLoginType("team")}
      className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
        loginType === "team" ? "bg-opacity-20" : "bg-opacity-0"
      }`}
      style={{
        backgroundColor:
          loginType === "team"
            ? `${colors.gold}50`
            : "transparent",
        borderColor: `${colors.gold}80`,
        color: colors.gold,
      }}
      whileHover={{
        backgroundColor: `${colors.gold}30`,
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center justify-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Team
      </span>
    </motion.button>
  </div>
</div>

                <motion.button
                  type="submit"
                  className="w-full py-4 rounded-xl font-medium text-lg mt-6 transition-all relative overflow-hidden group flex items-center justify-center"
                  style={{
                    backgroundColor: colors.gold,
                    color: colors.velvet,
                  }}
                  whileHover={{
                    scale: loading ? 1 : 1.02,
                    boxShadow: loading ? "none" : `0 5px 25px ${colors.gold}50`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <span className="relative z-10">Login</span>
                  )}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 1.2, ease: "linear" }}
                  />
                </motion.button>
              </form>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1 }}
              >
                
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
