import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SonalikaLogo from './SonalikaLogo.png';
import { Eye, EyeOff } from "lucide-react";

const AccountsLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Hardcoded credentials
  const ACCOUNTS_EMAIL = 'AT@gmail.com';
  const ACCOUNTS_PASSWORD = 'AT@123';

  // Premium Jewellery Color Palette
  const colors = {
    gold: '#f9e79f',
    darkGold: '#D4AF37',
    roseGold: '#B76E79',
    platinum: '#E5E4E2',
    deepNavy: '#00072D',
    velvet: '#3D0C02',
    light: '#F8F8F8',
    diamond: 'rgba(255,255,255,0.9)'
  };

  // Enhanced animations
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
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
        delay: 0.3
      }
    },
    exit: { 
      opacity: 0,
      scale: 1.1,
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const slideUp = {
    hidden: { y: 80, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2
      } 
    },
    exit: { 
      y: -50, 
      opacity: 0, 
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both user ID and password');
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Hardcoded validation
      if (formData.username === ACCOUNTS_EMAIL && formData.password === ACCOUNTS_PASSWORD) {
        // Set session storage for authentication
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("role", "accounts");
        sessionStorage.setItem("team", "accounts");

        // Navigate to accounts dashboard
        navigate("/accountsdashboard");
      } else {
        setError("Invalid credentials. Please check your login details and try again.");
      }
      setLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('team');
    navigate('/');
  };

  // Diamond particle generator
  const generateDiamonds = () => {
    const diamonds = [];
    const count = 25;
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 10 + 5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 4 + Math.random() * 6;
      const rotation = Math.random() * 360;
      
      diamonds.push(
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            background: `linear-gradient(135deg, 
              rgba(255,255,255,0.9) 0%, 
              ${colors.diamond} 50%, 
              rgba(255,255,255,0.7) 100%)`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            transform: `rotate(${rotation}deg)`,
            filter: 'blur(0.5px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.9, 0],
            scale: [1, 1.4, 1]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: delay
          }}
        />
      );
    }
    
    return diamonds;
  };

  // Gold filigree pattern component
  const GoldFiligree = () => (
    <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path 
          d="M0,450 C150,300 300,600 450,450 C600,300 750,600 900,450 C1050,300 1200,600 1350,450 L1440,540 L1440,900 L1350,900 C1200,900 1050,900 900,900 C750,900 600,900 450,900 C300,900 150,900 0,900 Z"
          fill="none" 
          stroke={colors.gold} 
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
        <path 
          d="M0,450 C150,600 300,300 450,450 C600,600 750,300 900,450 C1050,600 1200,300 1350,450 L1440,360 L1440,0 L1350,0 C1200,0 1050,0 900,0 C750,0 600,0 450,0 C300,0 150,0 0,0 Z"
          fill="none" 
          stroke={colors.gold} 
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex justify-center items-center"
      style={{ 
        backgroundColor: colors.deepNavy,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${colors.velvet}BB 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, ${colors.velvet}BB 0%, transparent 40%),
          linear-gradient(${colors.deepNavy}, ${colors.deepNavy})
        `
      }}
    >
      {/* Diamond particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {generateDiamonds()}
      </div>

      {/* Ornate gold filigree borders */}
      <GoldFiligree />

      {/* Luxury brand header with logo */}
      <motion.div 
        className="absolute top-8 left-0 right-0 px-10 z-20 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <div className="flex items-start">
          <motion.img 
            src={SonalikaLogo} 
            style={{ filter: 'brightness(0) invert(1)' }} 
            alt="Sonalika Jewellery" 
            className="h-16 mr-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Logout Button - positioned in the top right */}
        <motion.button
          onClick={handleLogout}
          className="py-2 px-4 rounded-lg border flex items-center tracking-wider text-sm"
          style={{ 
            borderColor: `${colors.gold}80`,
            color: colors.gold,
            backgroundColor: 'transparent'
          }}
          whileHover={{ 
            backgroundColor: `${colors.gold}15`,
            boxShadow: `0 2px 15px ${colors.gold}20`
          }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          LOGOUT
        </motion.button>
      </motion.div>

      {/* Main content container */}
      <div className="w-full max-w-md px-4 z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="p-12 rounded-xl relative overflow-hidden border"
          style={{ 
            backgroundColor: `rgba(15, 15, 15, 0.2)`,
            borderColor: `${colors.gold}40`,
            boxShadow: `
              0 0 30px ${colors.gold}15,
              0 20px 70px rgba(0,0,0,0.7),
              inset 0 0 30px ${colors.gold}10
            `,
            backdropFilter: 'blur(12px)'
          }}
        >
          <motion.h2 
            className="text-3xl font-serif text-center mb-6"
            style={{ 
              color: colors.gold,
              textShadow: `0 0 10px ${colors.gold}40`
            }}
            animate={{
              letterSpacing: ['2px', '4px', '2px'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            ACCOUNTS PORTAL
          </motion.h2>

          <motion.p 
            className="text-xl mb-8 font-serif tracking-wider font-light text-center"
            style={{ color: colors.light }}
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            Financial Management
          </motion.p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <motion.div variants={slideUp}>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="User ID"
                    className="w-full py-4 px-6 bg-transparent border rounded-xl focus:outline-none focus:ring-1 font-light tracking-wider"
                    style={{ 
                      borderColor: colors.gold,
                      color: colors.light,
                      backgroundColor: 'rgba(0,0,0,0.2)'
                    }}
                  />
                  <motion.div 
                    className="absolute left-0 bottom-0 h-px w-0"
                    style={{ backgroundColor: colors.gold }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>

              <motion.div variants={slideUp}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full py-4 px-6 bg-transparent border rounded-xl focus:outline-none focus:ring-1 font-light tracking-wider pr-12"
                    style={{ 
                      borderColor: colors.gold,
                      color: colors.light,
                      backgroundColor: 'rgba(0,0,0,0.2)'
                    }}
                  />
                  <motion.div 
                    className="absolute left-0 bottom-0 h-px w-0"
                    style={{ backgroundColor: colors.gold }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: colors.gold }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.gold} />
                      ) : (
                        <Eye size={20} color={colors.gold} />
                      )}
                    </motion.div>
                  </button>
                </div>
              </motion.div>

              {error && (
                <motion.p 
                  className="text-red-300 text-sm text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                className="w-full py-4 rounded-xl font-medium text-lg relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.darkGold} 100%)`,
                  color: colors.deepNavy,
                  boxShadow: `0 5px 25px ${colors.gold}30`
                }}
                whileHover={{ 
                  background: `linear-gradient(135deg, ${colors.gold} 10%, ${colors.darkGold} 90%)`,
                  boxShadow: `0 8px 40px ${colors.gold}50`
                }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    AUTHENTICATING...
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{ opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    SIGN IN
                  </motion.span>
                )}
              </motion.button>
            </div>
          </form>

          <motion.button
            onClick={() => navigate('/')}
            className="mt-8 py-3 px-6 rounded-xl border flex items-center mx-auto tracking-wider font-light text-sm"
            style={{ 
              borderColor: `${colors.gold}80`,
              color: colors.gold,
              backgroundColor: 'transparent'
            }}
            whileHover={{ 
              backgroundColor: `${colors.gold}15`,
              boxShadow: `0 5px 25px ${colors.gold}30`
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={{
                x: [0, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </motion.svg>
            BACK TO DEPARTMENT SELECTION
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountsLogin;

