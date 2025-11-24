import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, LogOut, DollarSign, Gem, Coins, Package } from 'lucide-react';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  
  // Hardcoded inventory data (will be replaced with DB later)
  const [inventory, setInventory] = useState({
    gold: { quantity: 1500.50, unit: 'grams' },
    diamond: { quantity: 250.75, unit: 'carats' },
    silver: { quantity: 5000.00, unit: 'grams' },
    platinum: { quantity: 800.25, unit: 'grams' },
    other: { quantity: 100.00, unit: 'pieces' }
  });

  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Color palette
  const colors = {
    gold: "#f9e79f",
    darkGold: "#D4AF37",
    deepNavy: "#00072D",
    platinum: "#E5E4E2",
    light: "#F8F8F8",
    diamond: "rgba(255,255,255,0.95)",
    success: "#10b981",
    info: "#3b82f6",
    warning: "#f59e0b",
  };

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const role = sessionStorage.getItem('role');
    
    if (!isAuthenticated || role !== 'accounts') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('team');
    navigate('/');
  };

  const handleEdit = (item) => {
    setEditing(item);
    setEditValues({
      quantity: inventory[item].quantity,
      unit: inventory[item].unit
    });
  };

  const handleSave = (item) => {
    setInventory(prev => ({
      ...prev,
      [item]: {
        quantity: parseFloat(editValues.quantity) || 0,
        unit: editValues.unit || prev[item].unit
      }
    }));
    setEditing(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValues({});
  };

  const handleChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const inventoryItems = [
    { key: 'gold', label: 'Gold', icon: Coins, color: colors.warning },
    { key: 'diamond', label: 'Diamond', icon: Gem, color: colors.info },
    { key: 'silver', label: 'Silver', icon: Coins, color: colors.platinum },
    { key: 'platinum', label: 'Platinum', icon: Gem, color: '#e5e4e2' },
    { key: 'other', label: 'Other Items', icon: Package, color: colors.success }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <motion.div
        className="w-64 text-white flex-shrink-0 hidden md:block shadow-2xl"
        style={{ 
          backgroundColor: colors.deepNavy,
          background: `linear-gradient(180deg, ${colors.deepNavy} 0%, #1a1a2e 100%)`
        }}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="h-20 flex items-center justify-center border-b-2 relative"
          style={{ borderColor: colors.gold }}
        >
          <motion.span 
            className="text-xl font-bold tracking-wider" 
            style={{ color: colors.gold }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            ACCOUNTS
          </motion.span>
        </div>
        <nav className="p-4 flex flex-col h-full">
          <div className="flex-1">
            <motion.div
              className="w-full flex items-center p-4 rounded-xl transition-all mb-2 shadow-lg"
              style={{
                backgroundColor: colors.gold,
                color: colors.deepNavy,
              }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <DollarSign className="h-5 w-5 mr-3" />
              <span className="font-medium">Inventory</span>
            </motion.div>
          </div>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          className="shadow-sm z-10 border-b-2 hidden md:block"
          style={{
            backgroundColor: colors.diamond,
            borderColor: colors.gold,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between bg-[#00072D] h-16 px-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/10">
                <DollarSign className="text-lg" style={{ color: colors.gold }} />
              </div>
              <h4
                className="text-lg font-semibold tracking-wide"
                style={{ color: colors.gold }}
              >
                Accounts Dashboard
              </h4>
            </div>
            <div className="flex items-center space-x-4">
              <span style={{ color: colors.gold }}>
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-600/20 transition-all border"
                style={{ 
                  borderColor: colors.gold,
                  color: colors.gold 
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50">
          <header
            className="shadow-sm h-16 flex items-center justify-between px-4"
            style={{ backgroundColor: colors.deepNavy }}
          >
            <h4 className="text-lg font-semibold" style={{ color: colors.gold }}>
              Accounts
            </h4>
            <button
              onClick={handleLogout}
              className="py-1 px-3 rounded-lg border flex items-center tracking-wider text-xs"
              style={{
                borderColor: `${colors.gold}80`,
                color: colors.gold,
                backgroundColor: 'transparent'
              }}
            >
              <LogOut className="w-3 h-3 mr-1" />
              LOGOUT
            </button>
          </header>
        </div>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-24"
          style={{ backgroundColor: colors.light }}
        >
          <motion.div
            className="rounded-lg shadow p-4 md:p-6 min-h-[calc(100vh-8rem)] border-2"
            style={{
              backgroundColor: colors.diamond,
              borderColor: colors.gold,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <h3 className="text-3xl font-bold mb-2" style={{ color: colors.deepNavy }}>
                Inventory Management
              </h3>
              <p className="text-gray-600">Manage and update inventory quantities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryItems.map((item, index) => {
                const Icon = item.icon;
                const isEditing = editing === item.key;
                const currentData = inventory[item.key];

                return (
                  <motion.div
                    key={item.key}
                    className="rounded-xl shadow-lg p-6 border-2 relative overflow-hidden"
                    style={{
                      backgroundColor: colors.diamond,
                      borderColor: item.color,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                      style={{ background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)` }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                          <Icon className="h-6 w-6" style={{ color: item.color }} />
                        </div>
                        {!isEditing ? (
                          <motion.button
                            onClick={() => handleEdit(item.key)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="h-4 w-4" style={{ color: item.color }} />
                          </motion.button>
                        ) : (
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => handleSave(item.key)}
                              className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </motion.button>
                            <motion.button
                              onClick={handleCancel}
                              className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </motion.button>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.deepNavy }}>
                        {item.label}
                      </h3>

                      {!isEditing ? (
                        <div>
                          <p className="text-3xl font-bold mb-1" style={{ color: item.color }}>
                            {currentData.quantity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-600">{currentData.unit}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={editValues.quantity}
                              onChange={(e) => handleChange('quantity', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ 
                                borderColor: item.color,
                                focusRingColor: item.color
                              }}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={editValues.unit}
                              onChange={(e) => handleChange('unit', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ 
                                borderColor: item.color,
                                focusRingColor: item.color
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AccountsDashboard;

