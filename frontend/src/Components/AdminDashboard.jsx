import React from 'react';
import { motion } from 'framer-motion';
import SonalikaLogo from './SonalikaLogo.png';

const AdminDashboard = () => {
  // Premium gold and jewel tones color palette
  const colors = {
    gold: '#D4AF37',
    darkGold: '#996515',
    roseGold: '#B76E79',
    platinum: '#E5E4E2',
    deepNavy: '#00072D',
    velvet: '#3D0C02',
    light: '#F8F8F8',
    diamond: 'rgba(255,255,255,0.9)'
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ 
        backgroundColor: colors.deepNavy,
        color: colors.light,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z' fill='none' stroke='${colors.gold.replace('#', '%23')}' stroke-width='0.1'/%3E%3C/svg%3E")`,
        backgroundSize: '120px'
      }}
    >
      {/* Luxury overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none"></div>

      {/* Main Content */}
      <motion.div
        className="relative p-10 rounded-2xl text-center max-w-md w-full"
        style={{ 
          backgroundColor: `${colors.deepNavy}DD`,
          border: `1px solid ${colors.gold}60`,
          boxShadow: `0 10px 50px ${colors.gold}10`
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative gold border elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent via-10% via-90% to-transparent" 
          style={{ backgroundImage: `linear-gradient(90deg, transparent, ${colors.gold}20, ${colors.gold}80, ${colors.gold}20, transparent)` }} />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent via-10% via-90% to-transparent" 
          style={{ backgroundImage: `linear-gradient(90deg, transparent, ${colors.gold}20, ${colors.gold}80, ${colors.gold}20, transparent)` }} />

        {/* Logo */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img 
            src={SonalikaLogo} 
            alt="Sonalika Jewellers" 
            style={{ filter: 'brightness(0) invert(1)' }} 
            className="w-40 h-auto"
          />
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div 
          className="relative mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute -inset-1 rounded-lg overflow-hidden">
            <motion.div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.gold}40, ${colors.roseGold}40, ${colors.gold}40, transparent)`
              }}
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          <p className="relative text-lg tracking-widest px-4 py-3 rounded-lg"
            style={{ 
              color: colors.platinum,
              backgroundColor: `rgba(0, 7, 45, 0.7)`,
              border: `1px solid ${colors.gold}50`
            }}
          >
            ADMIN DASHBOARD COMING SOON
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-3/4 h-1.5 rounded-full overflow-hidden relative"
            style={{ backgroundColor: `${colors.gold}20` }}>
            <motion.div
              className="h-full rounded-full absolute top-0 left-0"
              style={{ 
                background: `linear-gradient(90deg, ${colors.darkGold}, ${colors.gold}, ${colors.platinum})`,
                width: '65%'
              }}
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.5, delay: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p 
          className="text-xs tracking-wider opacity-70"
          style={{ color: colors.gold }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1 }}
        >
          We're crafting a luxurious experience for you
        </motion.p>
      </motion.div>

      {/* Diamond sparkle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: '6px',
            height: '6px',
            background: `linear-gradient(45deg, ${colors.diamond}, ${colors.platinum})`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            opacity: 0
          }}
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            rotate: Math.random() * 360
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

export default AdminDashboard;