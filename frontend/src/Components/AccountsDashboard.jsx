import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SonalikaLogo from './SonalikaLogo.png';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  
  // Premium gold and jewel tones color palette
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

  // Hardcoded inventory data
  const [inventory, setInventory] = useState({
    gold: '150.50',
    diamond: '75.25',
    silver: '200.00',
    platinum: '50.75',
    other: '100.00'
  });

  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('role');
    navigate('/');
  };

  const handleEdit = (key) => {
    setEditing(key);
    setEditValue(inventory[key]);
  };

  const handleSave = (key) => {
    setInventory(prev => ({
      ...prev,
      [key]: editValue
    }));
    setEditing(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue('');
  };

  const inventoryItems = [
    { key: 'gold', label: 'Gold (grams)', icon: '🥇' },
    { key: 'diamond', label: 'Diamond (carats)', icon: '💎' },
    { key: 'silver', label: 'Silver (grams)', icon: '🥈' },
    { key: 'platinum', label: 'Platinum (grams)', icon: '⚪' },
    { key: 'other', label: 'Other Items', icon: '✨' }
  ];

  return (
    <div 
      className="relative w-full min-h-screen overflow-hidden"
      style={{ 
        backgroundColor: colors.deepNavy,
        color: colors.light,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z' fill='none' stroke='${colors.gold.replace('#', '%23')}' stroke-width='0.1'/%3E%3C/svg%3E")`,
        backgroundSize: '120px'
      }}
    >
      {/* Luxury overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none"></div>

      {/* Header */}
      <motion.div 
        className="relative px-10 py-6 flex justify-between items-center border-b"
        style={{ borderColor: `${colors.gold}40` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center">
          <motion.img 
            src={SonalikaLogo} 
            style={{ filter: 'brightness(0) invert(1)' }} 
            alt="Sonalika Jewellery" 
            className="h-16 mr-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <motion.h1 
            className="text-2xl font-serif tracking-widest"
            style={{ color: colors.gold }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ACCOUNTS DASHBOARD
          </motion.h1>
        </div>

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

      {/* Main Content */}
      <div className="container mx-auto px-10 py-10">
        {/* Profile Section */}
        <motion.div
          className="mb-10 p-8 rounded-2xl relative overflow-hidden"
          style={{ 
            backgroundColor: `${colors.deepNavy}DD`,
            border: `1px solid ${colors.gold}60`,
            boxShadow: `0 10px 50px ${colors.gold}10`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Decorative gold border elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent via-10% via-90% to-transparent" 
            style={{ backgroundImage: `linear-gradient(90deg, transparent, ${colors.gold}20, ${colors.gold}80, ${colors.gold}20, transparent)` }} />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent via-10% via-90% to-transparent" 
            style={{ backgroundImage: `linear-gradient(90deg, transparent, ${colors.gold}20, ${colors.gold}80, ${colors.gold}20, transparent)` }} />

          <h2 className="text-3xl font-serif mb-6 text-center" style={{ color: colors.gold }}>
            PROFILE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryItems.map((item, index) => (
              <motion.div
                key={item.key}
                className="p-6 rounded-xl border relative overflow-hidden"
                style={{ 
                  backgroundColor: `${colors.deepNavy}AA`,
                  borderColor: `${colors.gold}40`,
                  boxShadow: `0 5px 20px ${colors.gold}10`
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: `0 8px 30px ${colors.gold}20`
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{item.icon}</span>
                    <h3 className="text-lg font-medium" style={{ color: colors.platinum }}>
                      {item.label}
                    </h3>
                  </div>
                </div>

                {editing === item.key ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-1"
                      style={{
                        backgroundColor: `${colors.deepNavy}DD`,
                        border: `1px solid ${colors.gold}60`,
                        color: colors.platinum,
                      }}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => handleSave(item.key)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: colors.gold,
                          color: colors.velvet,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save
                      </motion.button>
                      <motion.button
                        onClick={handleCancel}
                        className="flex-1 py-2 rounded-lg text-sm font-medium border"
                        style={{
                          borderColor: `${colors.gold}80`,
                          color: colors.gold,
                          backgroundColor: 'transparent',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold" style={{ color: colors.gold }}>
                      {inventory[item.key]}
                    </p>
                    <motion.button
                      onClick={() => handleEdit(item.key)}
                      className="p-2 rounded-lg border"
                      style={{
                        borderColor: `${colors.gold}80`,
                        color: colors.gold,
                        backgroundColor: 'transparent',
                      }}
                      whileHover={{ 
                        backgroundColor: `${colors.gold}15`,
                        scale: 1.1
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Diamond sparkle effects */}
      {[...Array(8)].map((_, i) => (
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

export default AccountsDashboard;

