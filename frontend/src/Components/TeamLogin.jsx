import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SonalikaLogo from './SonalikaLogo.png'; // Replace with your logo path

const TeamLogin = () => {
  const location = useLocation();
  const [step, setStep] = useState('selectTeam');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if team was pre-selected from navigation state
  useEffect(() => {
    console.log('TeamLogin: location.state', location.state);
    if (location.state?.team) {
      const team = location.state.team;
      console.log('TeamLogin: Setting team to', team);
      setSelectedTeam(team);
      setStep('login'); // Skip team selection and go directly to login
    }
  }, [location]);

  // Premium Jewellery Color Palette
  const colors = {
    gold: '#f9e79f',
    darkGold: '#f9e79f',
    roseGold: '#f9e79f',
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

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('team');
    
    // Redirect to home page
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!selectedTeam) {
    setError('Please select a team type');
    return;
  }

  if (!formData.username || !formData.password) {
    setError('Please enter both user ID and password');
    return;
  }

  setLoading(true);

  try {
    let endpoint, requestData;
    
    if (selectedTeam === 'salesteam') {
      endpoint = "/api/team/salesteam-login";
      requestData = {
        email: formData.username,
        password: formData.password,
        role: 'salesteam'
      };
    } else {
      endpoint = "/api/team/productionteam-login";
      requestData = {
        email: formData.username,
        password: formData.password,
        role: 'productionteam'
      };
    }

    const res = await axios.post(
      `https://sonalika.onrender.com${endpoint}`,
      requestData,
      { withCredentials: true }
    );

    // On successful login
    if (selectedTeam === 'salesteam') {
      navigate("/salesteamdashboard");
    } else {
      navigate("/productiondashboard");
    }

  } catch (err) {
    // Updated error handling to show specific message for invalid credentials
    if (err.response && err.response.status === 401) {
      setError("Invalid credentials. Please check your login details and try again.");
    } else {
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        "Login failed. Please try again later.";
      setError(errorMessage);
    }
  } finally {
    setLoading(false);
  }
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
          
          <motion.h1 
            className="ml-4 font-serif text-2xl tracking-widest"
            style={{ color: colors.platinum }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            {/* Brand name can be added here */}
          </motion.h1>
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
        {step === 'selectTeam' && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            className="p-10 rounded-xl relative overflow-hidden border"
            style={{ 
              backgroundColor: `rgba(12, 11, 12, 0.2)`,
              borderColor: `${colors.gold}40`,
              boxShadow: `
                0 0 30px ${colors.gold}15,
                0 20px 70px rgba(0,0,0,0.7),
                inset 0 0 30px ${colors.gold}10
              `,
              backdropFilter: 'blur(4px)'
            }}
          >
            {/* Jewelry ornament top */}
            <motion.div 
              className="absolute top-0 left-0 right-0 flex justify-center"
              initial={{ y: -30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <svg width="180" height="24" viewBox="0 0 180 24">
                <path 
                  d="M0,24 C30,0 60,24 90,0 C120,24 150,0 180,24" 
                  fill="none" 
                  stroke={colors.gold} 
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
              </svg>
            </motion.div>

            <motion.h2 
              className="text-3xl font-serif text-center mb-10 pt-6"
              style={{ 
                color: colors.gold,
                textShadow: `0 0 10px ${colors.gold}40`
              }}
              initial={{ letterSpacing: '2px' }}
              animate={{ 
                letterSpacing: ['2px', '4px', '2px'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              PRIVATE ACCESS
            </motion.h2>

            <div className="space-y-6">
              <motion.button
                onClick={() => {
                  setSelectedTeam('salesteam');
                  setStep('login');
                }}
                className="w-full py-5 rounded-xl font-medium text-lg relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gold}20 0%, transparent 100%)`,
                  border: `1px solid ${colors.gold}`,
                  color: colors.gold,
                  boxShadow: `0 5px 20px ${colors.gold}10`
                }}
                whileHover={{ 
                  background: `linear-gradient(135deg, ${colors.gold}30 0%, transparent 100%)`,
                  boxShadow: `0 8px 40px ${colors.gold}30`
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span 
                  className="relative z-10 flex items-center justify-center"
                  animate={{
                    opacity: [1, 0.9, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={colors.gold}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  SALES TEAM
                </motion.span>
                <motion.div 
                  className="absolute inset-0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.8 }}
                  style={{ 
                    background: `linear-gradient(90deg, transparent, ${colors.gold}15, transparent)`
                  }}
                />
              </motion.button>

              <motion.button
                onClick={() => {
                  setSelectedTeam('productionteam');
                  setStep('login');
                }}
                className="w-full py-5 rounded-xl font-medium text-lg relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gold}10 0%, transparent 100%)`,
                  border: `1px solid ${colors.gold}`,
                  color: colors.gold,
                  boxShadow: `0 5px 20px ${colors.gold}10`
                }}
                whileHover={{ 
                  background: `linear-gradient(135deg, ${colors.gold}25 0%, transparent 100%)`,
                  boxShadow: `0 8px 40px ${colors.gold}30`
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span 
                  className="relative z-10 flex items-center justify-center"
                  animate={{
                    opacity: [1, 0.9, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.3
                  }}
                >
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={colors.gold}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                  PRODUCTION TEAM
                </motion.span>
                <motion.div 
                  className="absolute inset-0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ 
                    background: `linear-gradient(90deg, transparent, ${colors.gold}15, transparent)`
                  }}
                />
              </motion.button>
            </div>

            {/* Jewelry ornament bottom */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 flex justify-center"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <svg width="180" height="24" viewBox="0 0 180 24">
                <path 
                  d="M0,0 C30,24 60,0 90,24 C120,0 150,24 180,0" 
                  fill="none" 
                  stroke={colors.gold} 
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {step === 'login' && (
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
            {/* Rotating diamond ring animation */}
            <motion.div 
              className="relative mx-auto mb-10"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke={colors.gold} strokeWidth="1.5" strokeDasharray="5,5" strokeOpacity="0.5" />
                <motion.path 
                  d="M70,20 L80,40 L100,45 L85,60 L90,80 L70,70 L50,80 L55,60 L40,45 L60,40 Z"
                  fill={colors.diamond}
                  stroke={colors.gold}
                  strokeWidth="0.8"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </svg> */}
            </motion.div>

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
              {selectedTeam === 'salesteam' ? 'SALES PORTAL' : 'PRODUCTION PORTAL'}
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
              {selectedTeam === 'salesteam' ? 'Exclusive Access' : 'Crafting Excellence'}
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
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
              onClick={() => setStep('selectTeam')}
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
              BACK TO TEAM SELECTION
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeamLogin;