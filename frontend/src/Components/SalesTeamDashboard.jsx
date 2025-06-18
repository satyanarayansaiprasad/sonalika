import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Jewelry Color Palette
const colors = {
  gold: '#FFD700', // 24K Gold
  roseGold: '#E0BFB8',
  antiqueGold: '#D4AF37', // Metallic Gold
  diamond: '#E5F2FF',
  blackOnyx: '#00072D',
  deepVelvet: '#00072D', // Jewelry box interior
  pearl: '#00072D',
  platinum: '#E5E4E2'
};

// Diamond particle generator
const generateDiamonds = (count = 15) => {
  const diamonds = [];
  
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 8 + 4;
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
          opacity: [0, 0.7, 0],
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
  <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <path 
        d="M0,450 C150,300 300,600 450,450 C600,300 750,600 900,450 C1050,300 1200,600 1350,450 L1440,540 L1440,900 L1350,900 C1200,900 1050,900 900,900 C750,900 600,900 450,900 C300,900 150,900 0,900 Z"
        fill="none" 
        stroke={colors.gold} 
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.2"
      />
      <path 
        d="M0,450 C150,600 300,300 450,450 C600,600 750,300 900,450 C1050,600 1200,300 1350,450 L1440,360 L1440,0 L1350,0 C1200,0 1050,0 900,0 C750,0 600,0 450,0 C300,0 150,0 0,0 Z"
        fill="none" 
        stroke={colors.gold} 
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.2"
      />
    </svg>
  </div>
);

const WelcomeMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-xl text-center flex flex-col items-center justify-center relative overflow-hidden"
      style={{ 
        backgroundColor: `rgba(20, 20, 20, 0.2)`,
        border: `1px solid ${colors.gold}20`,
        boxShadow: `0 10px 50px ${colors.gold}05`,
        minHeight: '50vh',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Diamond ornament */}
      <motion.div 
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width="60" height="60" viewBox="0 0 24 24">
          <path 
            d="M12 1L3 5v6l9 5 9-5V5l-9-4z" 
            fill={colors.diamond}
            stroke={colors.gold}
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      <motion.h2 
        className="text-3xl font-serif mb-6"
        style={{ 
          color: colors.gold,
          textShadow: `0 0 10px ${colors.gold}20`
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
        WELCOME TO SONALIKA
      </motion.h2>
      
      <motion.p 
        className="text-xl mb-4 font-serif tracking-wider"
        style={{ color: colors.pearl }}
        animate={{
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        Exclusive Sales Dashboard
      </motion.p>
      
      <motion.p 
        className="text-sm tracking-wider mt-4"
        style={{ color: colors.gold }}
        animate={{
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      >
        Select an option from the sidebar to begin
      </motion.p>
    </motion.div>
  );
};

const CustomerKYCForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    gstNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-xl relative overflow-hidden"
      style={{ 
        backgroundColor: `rgba(20, 20, 20, 0.2)`,
        border: `1px solid ${colors.gold}20`,
        boxShadow: `0 10px 50px ${colors.gold}05`,
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.h2 
        className="text-2xl font-serif mb-8"
        style={{ 
          color: colors.gold,
          textShadow: `0 0 8px ${colors.gold}20`
        }}
        animate={{
          letterSpacing: ['1px', '2px', '1px'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        CLIENT REGISTRATION
      </motion.h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <motion.label 
            className="block mb-3 text-sm uppercase tracking-widest font-light"
            style={{ color: colors.gold }}
            animate={{
              opacity: [0.7, 0.9, 0.7],
              x: [0, 2, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            CLIENT NAME
          </motion.label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-lg focus:outline-none font-serif tracking-wider"
              style={{ 
                backgroundColor: `rgba(20, 20, 20, 0.3)`,
                border: `1px solid ${colors.gold}20`,
                color: colors.pearl,
                letterSpacing: '1px'
              }}
            />
          </motion.div>
        </div>
        
        <div>
          <motion.label 
            className="block mb-3 text-sm uppercase tracking-widest font-light"
            style={{ color: colors.gold }}
            animate={{
              opacity: [0.7, 0.9, 0.7],
              x: [0, -2, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.3
            }}
          >
            ADDRESS
          </motion.label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
          >
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-5 py-3 rounded-lg focus:outline-none font-serif tracking-wider"
              style={{ 
                backgroundColor: `rgba(20, 20, 20, 0.3)`,
                border: `1px solid ${colors.gold}20`,
                color: colors.pearl,
                letterSpacing: '1px'
              }}
            />
          </motion.div>
        </div>
        
        <div>
          <motion.label 
            className="block mb-3 text-sm uppercase tracking-widest font-light"
            style={{ color: colors.gold }}
            animate={{
              opacity: [0.7, 0.9, 0.7],
              x: [0, 2, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.6
            }}
          >
            CONTACT NUMBER
          </motion.label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-lg focus:outline-none font-serif tracking-wider"
              style={{ 
                backgroundColor: `rgba(20, 20, 20, 0.3)`,
                border: `1px solid ${colors.gold}20`,
                color: colors.pearl,
                letterSpacing: '1px'
              }}
            />
          </motion.div>
        </div>
        
        <div>
          <motion.label 
            className="block mb-3 text-sm uppercase tracking-widest font-light"
            style={{ color: colors.gold }}
            animate={{
              opacity: [0.7, 0.9, 0.7],
              x: [0, -2, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.9
            }}
          >
            GST NUMBER
          </motion.label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-lg focus:outline-none font-serif tracking-wider"
              style={{ 
                backgroundColor: `rgba(20, 20, 20, 0.3)`,
                border: `1px solid ${colors.gold}20`,
                color: colors.pearl,
                letterSpacing: '1px'
              }}
            />
          </motion.div>
        </div>
        
        <motion.button
          type="submit"
          className="w-full py-4 rounded-xl font-medium mt-8 relative overflow-hidden group"
          style={{ 
            background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.antiqueGold} 100%)`,
            color: colors.blackOnyx,
            boxShadow: `0 5px 25px ${colors.gold}20`,
            textShadow: `0 1px 2px rgba(0,0,0,0.3)`
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: `0 10px 40px ${colors.gold}30`
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span 
            className="relative z-10"
            animate={{
              opacity: [1, 0.9, 1],
              letterSpacing: ['1px', '2px', '1px']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            REGISTER CLIENT
          </motion.span>
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-50"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.8 }}
            style={{ 
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`
            }}
          />
        </motion.button>
      </form>
    </motion.div>
  );
};

const OrderForm = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-xl text-center flex flex-col items-center justify-center relative overflow-hidden"
      style={{ 
        backgroundColor: `rgba(15, 15, 15, 0.2)`,
        border: `1px solid ${colors.gold}20`,
        boxShadow: `0 10px 50px ${colors.gold}05`,
        minHeight: '50vh',
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Rotating diamond ring animation */}
      <motion.div 
        className="relative mb-8"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke={colors.gold} strokeWidth="1.5" strokeDasharray="5,5" strokeOpacity="0.3" />
          <motion.path 
            d="M60,20 L70,40 L90,45 L85,60 L90,80 L60,70 L30,80 L35,60 L20,45 L40,40 Z"
            fill={colors.diamond}
            stroke={colors.gold}
            strokeWidth="0.5"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </svg>
      </motion.div>

      <motion.h2 
        className="text-2xl font-serif mb-4"
        style={{ 
          color: colors.gold,
          textShadow: `0 0 8px ${colors.gold}20`
        }}
        animate={{
          letterSpacing: ['1px', '3px', '1px'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        ORDER MANAGEMENT
      </motion.h2>
      
      <motion.p 
        className="text-lg font-serif tracking-wider mb-6"
        style={{ color: colors.pearl }}
        animate={{
          opacity: [0.7, 0.9, 0.7]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        Coming Soon
      </motion.p>
      
      <motion.div
        className="relative h-1.5 w-48 mx-auto mb-6 overflow-hidden"
        style={{ backgroundColor: `${colors.gold}10` }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{ backgroundColor: colors.gold }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <motion.p 
        className="text-sm tracking-wider"
        style={{ color: colors.gold }}
        animate={{
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      >
        Premium order management tools in development
      </motion.p>
    </motion.div>
  );
};

const SalesTeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('welcome');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="relative w-full min-h-screen overflow-hidden flex flex-col md:flex-row"
      style={{ 
        backgroundColor: colors.blackOnyx,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${colors.deepVelvet}66 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, ${colors.deepVelvet}66 0%, transparent 40%),
          linear-gradient(${colors.blackOnyx}, ${colors.blackOnyx})
        `
      }}
    >
      {/* Diamond particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {generateDiamonds(25)}
      </div>

      {/* Ornate gold filigree borders */}
      <GoldFiligree />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 z-20" 
        style={{ 
          backgroundColor: `rgba(10, 10, 10, 0.7)`,
          borderBottom: `1px solid ${colors.gold}20`
        }}
      >
        <h2 className="text-lg font-serif tracking-wider" style={{ color: colors.gold }}>
          SONALIKA
        </h2>
        <motion.button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ 
            color: colors.gold,
            border: `1px solid ${colors.gold}20`
          }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-30 w-72 min-h-screen p-6 flex flex-col"
            style={{ 
              backgroundColor: `rgba(15, 15, 15, 0.85)`,
              borderRight: `1px solid ${colors.gold}30`,
              backdropFilter: 'blur(10px)'
            }}
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-serif tracking-wider" style={{ color: colors.gold }}>
                MENU
              </h2>
              <motion.button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full"
                style={{ color: colors.gold }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <nav className="space-y-2">
              <motion.button
                onClick={() => {
                  setActiveTab('welcome');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all ${activeTab === 'welcome' ? '' : 'opacity-80 hover:opacity-100'}`}
                style={{ 
                  backgroundColor: activeTab === 'welcome' ? `${colors.gold}15` : 'transparent',
                  color: activeTab === 'welcome' ? colors.gold : colors.platinum,
                  border: activeTab === 'welcome' ? `1px solid ${colors.gold}30` : '1px solid transparent'
                }}
                whileHover={{ 
                  backgroundColor: `${colors.gold}10`,
                  borderColor: `${colors.gold}20`
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setActiveTab('kyc');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all ${activeTab === 'kyc' ? '' : 'opacity-80 hover:opacity-100'}`}
                style={{ 
                  backgroundColor: activeTab === 'kyc' ? `${colors.gold}15` : 'transparent',
                  color: activeTab === 'kyc' ? colors.gold : colors.platinum,
                  border: activeTab === 'kyc' ? `1px solid ${colors.gold}30` : '1px solid transparent'
                }}
                whileHover={{ 
                  backgroundColor: `${colors.gold}10`,
                  borderColor: `${colors.gold}20`
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Client KYC
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setActiveTab('order');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all ${activeTab === 'order' ? '' : 'opacity-80 hover:opacity-100'}`}
                style={{ 
                  backgroundColor: activeTab === 'order' ? `${colors.gold}15` : 'transparent',
                  color: activeTab === 'order' ? colors.gold : colors.platinum,
                  border: activeTab === 'order' ? `1px solid ${colors.gold}30` : '1px solid transparent'
                }}
                whileHover={{ 
                  backgroundColor: `${colors.gold}10`,
                  borderColor: `${colors.gold}20`
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Orders
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden md:flex w-72 min-h-screen p-6 flex-col z-10"
        style={{ 
          backgroundColor: `rgba(15, 15, 15, 0.7)`,
          borderRight: `1px solid ${colors.gold}30`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <h2 className="text-xl font-serif tracking-wider mb-10 pt-4" style={{ color: colors.gold }}>
          SONALIKA JEWELLERY
        </h2>
        
        <nav className="space-y-3">
          <motion.button
            onClick={() => setActiveTab('welcome')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all ${activeTab === 'welcome' ? '' : 'opacity-80 hover:opacity-100'}`}
            style={{ 
              backgroundColor: activeTab === 'welcome' ? `${colors.gold}15` : 'transparent',
              color: activeTab === 'welcome' ? colors.gold : colors.platinum,
              border: activeTab === 'welcome' ? `1px solid ${colors.gold}30` : '1px solid transparent'
            }}
            whileHover={{ 
              backgroundColor: `${colors.gold}10`,
              borderColor: `${colors.gold}20`
            }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('kyc')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all ${activeTab === 'kyc' ? '' : 'opacity-80 hover:opacity-100'}`}
            style={{ 
              backgroundColor: activeTab === 'kyc' ? `${colors.gold}15` : 'transparent',
              color: activeTab === 'kyc' ? colors.gold : colors.platinum,
              border: activeTab === 'kyc' ? `1px solid ${colors.gold}30` : '1px solid transparent'
            }}
            whileHover={{ 
              backgroundColor: `${colors.gold}10`,
              borderColor: `${colors.gold}20`
            }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Client KYC
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('order')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all ${activeTab === 'order' ? '' : 'opacity-80 hover:opacity-100'}`}
            style={{ 
              backgroundColor: activeTab === 'order' ? `${colors.gold}15` : 'transparent',
              color: activeTab === 'order' ? colors.gold : colors.platinum,
              border: activeTab === 'order' ? `1px solid ${colors.gold}30` : '1px solid transparent'
            }}
            whileHover={{ 
              backgroundColor: `${colors.gold}10`,
              borderColor: `${colors.gold}20`
            }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Orders
          </motion.button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 z-0">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'welcome' && <WelcomeMessage />}
              {activeTab === 'kyc' && <CustomerKYCForm />}
              {activeTab === 'order' && <OrderForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Luxury footer */}
      <motion.div 
        className="absolute bottom-4 left-0 right-0 text-center text-xs tracking-widest font-light z-20"
        style={{ color: `${colors.gold}50` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
      >
        SONALIKA JEWELLERY ® | CONFIDENTIAL
      </motion.div>
    </div>
  );
};

export default SalesTeamDashboard;