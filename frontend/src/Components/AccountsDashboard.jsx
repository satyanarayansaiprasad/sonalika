import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Save, X, LogOut, DollarSign, Gem, Coins, Package, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);
  
  // Inventory from DB
  const [inventory, setInventory] = useState({
    gold: { quantity: 1500.50, unit: 'grams' },
    diamond: { quantity: 250.75, unit: 'carats' },
    silver: { quantity: 5000.00, unit: 'grams' },
    platinum: { quantity: 800.25, unit: 'grams' },
    other: { quantity: 100.00, unit: 'pieces' }
  });

  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderForReject, setSelectedOrderForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Orders from DB
  const [orders, setOrders] = useState([]);
  
  // API Base URL
  const getApiBaseUrl = () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3001' : 'https://sonalika.onrender.com');
  };

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
    } else {
      // Fetch inventory and orders from DB
      fetchInventory();
      fetchOrders();
    }
  }, [navigate]);

  // Fetch inventory from DB
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/inventory`);
      if (response.data.success && response.data.data) {
        setInventory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from DB
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/orders/all`);
      if (response.data.success && response.data.data) {
        // Transform DB orders to match frontend format
        const transformedOrders = response.data.data.map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          orderDate: order.orderDate,
          clientName: order.clientName,
          description: order.description,
          gold: order.gold,
          diamond: order.diamond,
          silver: order.silver,
          platinum: order.platinum,
          status: order.status,
          rejectionReason: order.rejectionReason || '',
          acceptedDate: order.acceptedDate,
          rejectedDate: order.rejectedDate
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (item) => {
    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      const updatedInventory = {
        ...inventory,
        [item]: {
          quantity: parseFloat(editValues.quantity) || 0,
          unit: editValues.unit || inventory[item].unit
        }
      };
      
      const response = await axios.put(`${apiBaseUrl}/api/inventory/update`, updatedInventory);
      
      if (response.data.success) {
        setInventory(response.data.data);
        setEditing(null);
        setEditValues({});
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Check if order can be accepted (all materials available)
  const checkMaterialsAvailability = (order) => {
    const missingMaterials = [];
    
    if (inventory.gold.quantity < order.gold.quantity) {
      missingMaterials.push('Gold');
    }
    if (inventory.diamond.quantity < order.diamond.quantity) {
      missingMaterials.push('Diamond');
    }
    if (inventory.silver.quantity < order.silver.quantity) {
      missingMaterials.push('Silver');
    }
    if (inventory.platinum.quantity < order.platinum.quantity) {
      missingMaterials.push('Platinum');
    }
    
    return { available: missingMaterials.length === 0, missingMaterials };
  };

  // Handle Accept Order
  const handleAcceptOrder = async (orderId) => {
    const order = orders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;

    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      const actualOrderId = order.orderId || order.id;

      // Check if enough materials are available
      const { available, missingMaterials } = checkMaterialsAvailability(order);

      if (!available) {
        // Auto-reject if any material is insufficient
        const rejectionMessage = `${missingMaterials.join(', ')} ${missingMaterials.length === 1 ? 'is' : 'are'} not available`;
        
        // Reject order via API
        await axios.put(`${apiBaseUrl}/api/orders/reject/${actualOrderId}`, {
          rejectionReason: rejectionMessage
        });
        
        // Refresh orders
        await fetchOrders();
        alert(`Order rejected automatically: ${rejectionMessage}`);
        return;
      }

      // Accept order via API
      await axios.put(`${apiBaseUrl}/api/orders/accept/${actualOrderId}`);
      
      // Deduct materials from inventory
      const updatedInventory = {
        gold: { ...inventory.gold, quantity: inventory.gold.quantity - order.gold.quantity },
        diamond: { ...inventory.diamond, quantity: inventory.diamond.quantity - order.diamond.quantity },
        silver: { ...inventory.silver, quantity: inventory.silver.quantity - order.silver.quantity },
        platinum: { ...inventory.platinum, quantity: inventory.platinum.quantity - order.platinum.quantity },
        other: inventory.other
      };
      
      // Update inventory in DB
      await axios.put(`${apiBaseUrl}/api/inventory/update`, updatedInventory);
      
      // Refresh both inventory and orders
      await fetchInventory();
      await fetchOrders();
      
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reject Order - Open Modal
  const handleRejectClick = (orderId) => {
    const order = orders.find(o => (o.orderId || o.id) === orderId);
    setSelectedOrderForReject(order);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  // Handle Reject Order - Confirm Rejection
  const handleConfirmReject = async () => {
    if (!selectedOrderForReject) return;
    
    try {
      setLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      const reason = rejectionReason.trim() || 'Not enough materials available at accounts';
      const actualOrderId = selectedOrderForReject.orderId || selectedOrderForReject.id;
      
      // Reject order via API
      await axios.put(`${apiBaseUrl}/api/orders/reject/${actualOrderId}`, {
        rejectionReason: reason
      });
      
      // Refresh orders
      await fetchOrders();
      
      setRejectModalOpen(false);
      setSelectedOrderForReject(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inventoryItems = [
    { key: 'gold', label: 'Gold', icon: Coins, color: colors.warning },
    { key: 'diamond', label: 'Diamond', icon: Gem, color: colors.info },
    { key: 'silver', label: 'Silver', icon: Coins, color: colors.platinum },
    { key: 'platinum', label: 'Platinum', icon: Gem, color: '#e5e4e2' },
    { key: 'other', label: 'Other Items', icon: Package, color: colors.success }
  ];

  // Render Inventory View
  const renderInventory = () => (
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
  );

  // Render Orders View
  const renderOrders = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    
    return (
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
            All Orders
          </h3>
          <p className="text-gray-600">Review and manage order requests</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: colors.deepNavy, color: colors.gold }}>
                <th className="px-4 py-3 text-left border border-gray-300">Order ID</th>
                <th className="px-4 py-3 text-left border border-gray-300">Order Date</th>
                <th className="px-4 py-3 text-left border border-gray-300">Client Name</th>
                <th className="px-4 py-3 text-left border border-gray-300">Description</th>
                <th className="px-4 py-3 text-left border border-gray-300">Gold</th>
                <th className="px-4 py-3 text-left border border-gray-300">Diamond</th>
                <th className="px-4 py-3 text-left border border-gray-300">Silver</th>
                <th className="px-4 py-3 text-left border border-gray-300">Platinum</th>
                <th className="px-4 py-3 text-left border border-gray-300">Status</th>
                <th className="px-4 py-3 text-center border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: order.status === 'accepted' ? '#d1fae5' : 
                                   order.status === 'rejected' ? '#fee2e2' : 'white'
                  }}
                >
                  <td className="px-4 py-3 border border-gray-300 font-semibold">{order.orderId || order.id}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.orderDate}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.clientName}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.description}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.gold.quantity} {order.gold.unit}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.diamond.quantity} {order.diamond.unit}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.silver.quantity} {order.silver.unit}</td>
                  <td className="px-4 py-3 border border-gray-300">{order.platinum.quantity} {order.platinum.unit}</td>
                  <td className="px-4 py-3 border border-gray-300">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    {order.status === 'pending' ? (
                      <div className="flex gap-2 justify-center">
                        <motion.button
                          onClick={() => handleAcceptOrder(order.orderId || order.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle size={16} />
                          Accept
                        </motion.button>
                        <motion.button
                          onClick={() => handleRejectClick(order.orderId || order.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <XCircle size={16} />
                          Reject
                        </motion.button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No orders available</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

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
              className={`w-full flex items-center p-4 rounded-xl transition-all mb-2 cursor-pointer ${
                activeTab === 'inventory' ? 'shadow-lg' : 'hover:bg-white/5'
              }`}
              style={{
                backgroundColor: activeTab === 'inventory' ? colors.gold : 'transparent',
                color: activeTab === 'inventory' ? colors.deepNavy : colors.gold,
              }}
              onClick={() => setActiveTab('inventory')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <DollarSign className="h-5 w-5 mr-3" />
              <span className="font-medium">Inventory</span>
            </motion.div>
            <motion.div
              className={`w-full flex items-center p-4 rounded-xl transition-all mb-2 cursor-pointer ${
                activeTab === 'orders' ? 'shadow-lg' : 'hover:bg-white/5'
              }`}
              style={{
                backgroundColor: activeTab === 'orders' ? colors.gold : 'transparent',
                color: activeTab === 'orders' ? colors.deepNavy : colors.gold,
              }}
              onClick={() => setActiveTab('orders')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              <span className="font-medium">All Orders</span>
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
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'orders' && renderOrders()}
        </main>
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border-2"
            style={{ borderColor: colors.gold }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: colors.deepNavy }}>
                Reject Order
              </h3>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedOrderForReject(null);
                  setRejectionReason('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {selectedOrderForReject && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${colors.gold}20` }}>
                <p className="text-sm font-semibold mb-1">Order ID: {selectedOrderForReject.id}</p>
                <p className="text-sm">Client: {selectedOrderForReject.clientName}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.deepNavy }}>
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (e.g., Not enough materials available at accounts)"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: colors.gold,
                  focusRingColor: colors.gold
                }}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <motion.button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedOrderForReject(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{ 
                  borderColor: colors.gold,
                  color: colors.deepNavy
                }}
                whileHover={{ backgroundColor: colors.gold + '20' }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#ef4444' }}
                whileHover={{ backgroundColor: '#dc2626' }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm Reject
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AccountsDashboard;

