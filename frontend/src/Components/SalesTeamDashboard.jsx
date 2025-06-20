import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiHome, FiUser, FiShoppingCart, FiClock, FiMenu, FiX, 
  FiPlus, FiSearch, FiDollarSign, FiCheck, FiTruck 
} from 'react-icons/fi';
import { FaRegCheckCircle, FaRegClock, FaUserPlus } from 'react-icons/fa';

// Base API URL - replace with your actual backend URL
const API_BASE_URL = 'https://sonalikaj.onrender.com';

const SalesTeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderHistory, setOrderHistory] = useState(null);
  
  // Form states
  const [kycForm, setKycForm] = useState({
    name: '',
    phone: '',
    address: '',
    gstNo: '',
    memoId: ''
  });
  
  const [orderForm, setOrderForm] = useState({
    uniqueId: '',
    orderItems: [{ product: '', quantity: 1, price: 0 }],
    orderStatus: 'ongoing',
    memoId: ''
  });

  const [historySearch, setHistorySearch] = useState({
    uniqueId: '',
    clientId: ''
  });

  // Fetch clients data with Axios
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/team/get-clients`);
        setClients(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  // Submit KYC with Axios
  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/team/client-kyc`, kycForm);
      
      setClients(prev => [...(Array.isArray(prev) ? prev : []), response.data.client]);
      
      alert(`KYC Submitted Successfully! Client ID: ${response.data.uniqueId}`);
      setKycForm({
        name: '',
        phone: '',
        address: '',
        gstNo: '',
        memoId: ''
      });
    } catch (err) {
      console.error('KYC Submission Error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add order with Axios
  const handleAddOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/clients/orders`, orderForm);
      
      setClients(prev => {
        const prevClients = Array.isArray(prev) ? prev : [];
        return prevClients.map(client => 
          client.uniqueId === orderForm.uniqueId ? response.data.client : client
        );
      });
      
      alert(response.data.message);
      setOrderForm({
        uniqueId: '',
        orderItems: [{ product: '', quantity: 1, price: 0 }],
        orderStatus: 'ongoing',
        memoId: ''
      });
    } catch (err) {
      console.error('Order Submission Error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle order history search
  const handleHistorySearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/clients/orders?uniqueId=${historySearch.uniqueId}&clientId=${historySearch.clientId}`
      );
      setOrderHistory(response.data);
    } catch (err) {
      console.error('History Search Error:', err);
      setError(err.response?.data?.error || err.message);
      setOrderHistory(null);
    } finally {
      setLoading(false);
    }
  };

  // Order item management
  const addOrderItem = () => {
    setOrderForm(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { product: '', quantity: 1, price: 0 }]
    }));
  };

  const removeOrderItem = (index) => {
    setOrderForm(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...orderForm.orderItems];
    updatedItems[index][field] = value;
    setOrderForm(prev => ({ ...prev, orderItems: updatedItems }));
  };

  // Utility functions
  const getFilteredClients = (status) => {
    return Array.isArray(clients) ? 
      clients.filter(client => client.order === status) : 
      [];
  };

  const calculateOrderTotal = (orderItems) => {
    return (orderItems || []).reduce((sum, item) => 
      sum + (item.price * (item.quantity || 0)), 0
    );
  };

  // Dashboard Tables Component
  const DashboardTables = () => {
    const registeredClients = Array.isArray(clients) ? clients : [];
    const ongoingOrders = getFilteredClients('ongoing');
    const completedOrders = getFilteredClients('completed');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Registered Clients Table */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 bg-indigo-600 text-white flex items-center">
            <FaUserPlus className="mr-2" />
            <h3 className="font-semibold">Registered Clients</h3>
            <span className="ml-auto bg-white text-indigo-600 px-2 py-1 rounded-full text-xs font-bold">
              {registeredClients.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-indigo-800 uppercase">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-indigo-800 uppercase">Name</th>
                  <th className="p-3 text-left text-xs font-medium text-indigo-800 uppercase">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-200">
                {registeredClients.slice(0, 5).map(client => (
                  <tr key={client._id} className="hover:bg-indigo-50">
                    <td className="p-3 text-sm font-medium text-indigo-900">{client.uniqueId}</td>
                    <td className="p-3 text-sm text-gray-700">{client.name}</td>
                    <td className="p-3 text-sm text-gray-700">{client.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-indigo-50 text-center">
            <button 
              onClick={() => setActiveTab('kyc')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All Clients →
            </button>
          </div>
        </motion.div>

        {/* Ongoing Orders Table */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 bg-amber-600 text-white flex items-center">
            <FaRegClock className="mr-2" />
            <h3 className="font-semibold">Ongoing Orders</h3>
            <span className="ml-auto bg-white text-amber-600 px-2 py-1 rounded-full text-xs font-bold">
              {ongoingOrders.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-100">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-amber-800 uppercase">Client</th>
                  <th className="p-3 text-left text-xs font-medium text-amber-800 uppercase">Items</th>
                  <th className="p-3 text-left text-xs font-medium text-amber-800 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200">
                {ongoingOrders.slice(0, 5).map(client => (
                  <tr key={client._id} className="hover:bg-amber-50">
                    <td className="p-3">
                      <p className="text-sm font-medium text-amber-900">{client.name}</p>
                      <p className="text-xs text-amber-700">{client.uniqueId}</p>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {client.orderItems?.length || 0} items
                    </td>
                    <td className="p-3 text-sm font-medium text-amber-900">
                      ₹{calculateOrderTotal(client.orderItems).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-amber-50 text-center">
            <button 
              onClick={() => setActiveTab('order')}
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              Manage Orders →
            </button>
          </div>
        </motion.div>

        {/* Completed Orders Table */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 bg-emerald-600 text-white flex items-center">
            <FaRegCheckCircle className="mr-2" />
            <h3 className="font-semibold">Completed Orders</h3>
            <span className="ml-auto bg-white text-emerald-600 px-2 py-1 rounded-full text-xs font-bold">
              {completedOrders.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-emerald-800 uppercase">Client</th>
                  <th className="p-3 text-left text-xs font-medium text-emerald-800 uppercase">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-emerald-800 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-200">
                {completedOrders.slice(0, 5).map(client => (
                  <tr key={client._id} className="hover:bg-emerald-50">
                    <td className="p-3">
                      <p className="text-sm font-medium text-emerald-900">{client.name}</p>
                      <p className="text-xs text-emerald-700">{client.uniqueId}</p>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {client.orderDate ? new Date(client.orderDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3 text-sm font-medium text-emerald-900">
                      ₹{calculateOrderTotal(client.orderItems).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-emerald-50 text-center">
            <button 
              onClick={() => setActiveTab('history')}
              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
            >
              View History →
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-xl shadow-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Luxury Sidebar */}
      <AnimatePresence>
        {(mobileMenuOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-72 bg-gradient-to-b from-indigo-900 to-blue-900 text-white fixed md:static h-screen z-40 shadow-2xl"
          >
            <div className="p-6 h-full flex flex-col">
              <h1 className="text-2xl font-bold mb-8 mt-4 flex items-center">
                <FiTruck className="mr-2" />
                Sonalika Sales
              </h1>
              <nav className="flex-1">
                <ul className="space-y-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
                    { id: 'kyc', label: 'Client KYC', icon: <FiUser /> },
                    { id: 'order', label: 'Add Order', icon: <FiShoppingCart /> },
                    { id: 'history', label: 'Order History', icon: <FiClock /> }
                  ].map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center p-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-700 shadow-md' : 'hover:bg-blue-800'}`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                          <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto p-4 text-center text-sm text-blue-200">
                © {new Date().getFullYear()} Sonalika Tractors
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-72 p-6">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-semibold">Processing...</p>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <FiX />
              </button>
            </div>
          </motion.div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  title: "Total Clients", 
                  value: clients.length,
                  icon: <FiUser className="text-2xl text-indigo-600" />,
                  bg: "bg-indigo-50"
                },
                { 
                  title: "Completed Orders", 
                  value: getFilteredClients('completed').length,
                  icon: <FiCheck className="text-2xl text-emerald-600" />,
                  bg: "bg-emerald-50"
                },
                { 
                  title: "Ongoing Orders", 
                  value: getFilteredClients('ongoing').length,
                  icon: <FiClock className="text-2xl text-amber-600" />,
                  bg: "bg-amber-50"
                },
                { 
                  title: "Total Revenue", 
                  value: `₹${clients.reduce((sum, client) => 
                    sum + calculateOrderTotal(client.orderItems), 0).toLocaleString()}`,
                  icon: <FiDollarSign className="text-2xl text-blue-600" />,
                  bg: "bg-blue-50"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${stat.bg} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-full bg-white shadow-sm">
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Luxury Tables */}
            <DashboardTables />

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiClock className="mr-2" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[...clients]
                    .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
                    .slice(0, 5)
                    .map((client, index) => (
                      <div key={index} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                        <div className={`p-2 rounded-full mr-4 ${
                          client.order === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {client.order === 'completed' ? <FiCheck /> : <FiClock />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {client.order === 'completed' ? 'Order Completed' : 'New Order Created'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {client.name} ({client.uniqueId}) - {client.orderItems?.length || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ₹{calculateOrderTotal(client.orderItems).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {client.orderDate ? new Date(client.orderDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Client KYC Tab */}
        {activeTab === 'kyc' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Client KYC Form</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <form onSubmit={handleKYCSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={kycForm.name}
                      onChange={(e) => setKycForm({ ...kycForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={kycForm.phone}
                      onChange={(e) => setKycForm({ ...kycForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                    <textarea
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      value={kycForm.address}
                      onChange={(e) => setKycForm({ ...kycForm, address: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number*</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={kycForm.gstNo}
                      onChange={(e) => setKycForm({ ...kycForm, gstNo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Memo ID (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={kycForm.memoId}
                      onChange={(e) => setKycForm({ ...kycForm, memoId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Submit KYC
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Add Order Tab */}
        {activeTab === 'order' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Add Order to Client</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <form onSubmit={handleAddOrderSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Unique ID*</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={orderForm.uniqueId}
                      onChange={(e) => setOrderForm({ ...orderForm, uniqueId: e.target.value })}
                      required
                      placeholder="Sonalika0001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Items*</label>
                    <div className="space-y-4">
                      {orderForm.orderItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              value={item.product}
                              onChange={(e) => updateOrderItem(index, 'product', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={item.price}
                                onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                                required
                              />
                              {orderForm.orderItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeOrderItem(index)}
                                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
                    >
                      + Add Another Item
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={orderForm.orderStatus}
                        onChange={(e) => setOrderForm({ ...orderForm, orderStatus: e.target.value })}
                      >
                        <option value="ongoing">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Memo ID (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={orderForm.memoId}
                        onChange={(e) => setOrderForm({ ...orderForm, memoId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Add Order
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Order History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
              <form onSubmit={handleHistorySearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search by Unique ID</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={historySearch.uniqueId}
                      onChange={(e) => setHistorySearch({ ...historySearch, uniqueId: e.target.value, clientId: '' })}
                      placeholder="Sonalika0001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OR Search by Client ID</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={historySearch.clientId}
                      onChange={(e) => setHistorySearch({ ...historySearch, clientId: e.target.value, uniqueId: '' })}
                      placeholder="Client database ID"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Search Orders
                  </button>
                </div>
              </form>
            </div>

            {orderHistory && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{orderHistory.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unique ID</p>
                      <p className="font-medium">{orderHistory.uniqueId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{orderHistory.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Memo ID</p>
                      <p className="font-medium">{orderHistory.memoId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Status</p>
                      <p className={`font-medium ${
                        orderHistory.order === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {orderHistory.order}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">
                        {orderHistory.orderDate ? new Date(orderHistory.orderDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderHistory.orderItems?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">{item.product}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap">₹{item.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">₹{(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-right font-medium">Grand Total</td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold">
                            ₹{calculateOrderTotal(orderHistory.orderItems).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SalesTeamDashboard;