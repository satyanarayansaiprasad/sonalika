import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiUsers, FiShoppingBag, FiArchive } from 'react-icons/fi';
import axios from 'axios';

const SalesTeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gstNo: '',
    address: ''
  });
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    ongoingOrders: 0,
    completedOrders: 0
  });

  // Fetch live data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch clients
        const clientsRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/team/get-clients`);
        const clientsData = Array.isArray(clientsRes?.data) ? clientsRes.data : [];
        setClients(clientsData);
        
        // Fetch orders
        const ordersRes = await axios.get('/api/orders');
        const ordersData = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
        setOrders(ordersData);
        
        // Calculate stats
        setStats({
          totalClients: clientsData.length,
          ongoingOrders: ordersData.filter(o => o.orderStatus === 'ongoing').length,
          completedOrders: ordersData.filter(o => o.orderStatus === 'completed').length
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/team/clients-kyc`, formData);
      const newClient = response?.data;
      if (newClient) {
        setClients(prev => [...prev, newClient]);
        setStats(prev => ({...prev, totalClients: prev.totalClients + 1}));
        setFormData({
          name: '',
          phone: '',
          gstNo: '',
          address: ''
        });
        alert('Client KYC created successfully!');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client KYC');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
    { id: 'clients', icon: <FiUsers />, label: 'Clients KYC' },
    { id: 'order', icon: <FiShoppingBag />, label: 'New Order' },
    { id: 'history', icon: <FiArchive />, label: 'Order History' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar - Always visible on desktop */}
      <div className="hidden md:block w-64 h-full bg-white shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Sonalika Jewels</h1>
          <p className="text-sm text-gray-500">Sales Team Dashboard</p>
        </div>
        <nav className="mt-6">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id} className="px-2 py-1">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed md:hidden z-40 w-64 h-full bg-white shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Sonalika Jewels</h1>
          <p className="text-sm text-gray-500">Sales Team Dashboard</p>
        </div>
        <nav className="mt-6">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id} className="px-2 py-1">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">KYC Clients</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalClients}</p>
                    <p className="text-sm text-gray-500 mt-1">Total registered clients</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Ongoing Orders</h3>
                    <p className="text-3xl font-bold mt-2">{stats.ongoingOrders}</p>
                    <p className="text-sm text-gray-500 mt-1">Orders in progress</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Completed Orders</h3>
                    <p className="text-3xl font-bold mt-2">{stats.completedOrders}</p>
                    <p className="text-sm text-gray-500 mt-1">Orders delivered</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Recent Clients</h3>
                  {Array.isArray(clients) && clients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clients.slice(0, 5).map((client) => (
                            <tr key={client._id || client.uniqueId}>
                              <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{client.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{client.gstNo}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{client.uniqueId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No clients found</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Clients KYC */}
            {activeTab === 'clients' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">Client KYC Form</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                        <input
                          type="text"
                          name="gstNo"
                          value={formData.gstNo}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Create Client KYC
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mt-8">
                  <h3 className="text-lg font-semibold mb-4">Client List</h3>
                  {Array.isArray(clients) && clients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clients.map((client) => (
                            <tr key={client._id || client.uniqueId}>
                              <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{client.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{client.gstNo}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{client.uniqueId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No clients found</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* New Order */}
            {activeTab === 'order' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-600">Order form will connect to your backend API to create new orders.</p>
                </div>
              </motion.div>
            )}

            {/* Order History */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">Order History</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                  {Array.isArray(orders) && orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memo ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order._id || order.memoId}>
                              <td className="px-6 py-4 whitespace-nowrap">{order.memoId || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {Array.isArray(order.orderItems) ? order.orderItems.length : 0} items
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.orderStatus === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.orderStatus || 'unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No orders found</p>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesTeamDashboard;













// import React, { useEffect, useState } from 'react';
// import {
//   Layout, Menu, Card, Table, Form, Input, Button, message, Space, 
//   Typography, Spin, Row, Col, Statistic, Divider, InputNumber, Select, Tag
// } from 'antd';
// import {
//   DashboardOutlined, UserAddOutlined, ShoppingCartOutlined, 
//   HistoryOutlined, PlusOutlined, MinusOutlined, DeleteOutlined
// } from '@ant-design/icons';
// import axios from 'axios';

// const { Sider, Header, Content } = Layout;
// const { Title, Text } = Typography;
// const { Option } = Select;




// const SalesTeamDashboard = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const [selectedMenu, setSelectedMenu] = useState('dashboard');
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [kycForm] = Form.useForm();
//   const [orderForm] = Form.useForm();
//   const [orderItems, setOrderItems] = useState([{
//     key: 1,
//     styleNo: '',
//     clarity: '',
//     grossWeight: 0,
//     netWeight: 0,
//     diaWeight: 0,
//     pcs: 1,
//     amount: 0,
//     description: '',
//     orderStatus: 'ongoing'
//   }]);
//   const [orderHistory, setOrderHistory] = useState(null);
//   const [selectedClient, setSelectedClient] = useState(null);

//   const columnHeaders = [
//     'SR NO', 'STYLE NO', 'CLARITY', 'GR WT', 'NT WT', 'DIA WT', 'PCS', 'AMOUNT', 'DESCRIPTION', 'STATUS', 'ACTION'
//   ];

//   const fetchClients = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/team/get-clients`);
//       setClients(res.data.clients || []);
//     } catch (err) {
//       console.error('Fetch clients error:', err);
//       message.error('Failed to fetch clients');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   const handleKYCSubmit = async (values) => {
//     try {
//       setLoading(true);
//       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/team/client-kyc`, values);
//       setClients(prev => [...prev, res.data.client]);
//       message.success('Client KYC created successfully');
//       kycForm.resetFields();
//     } catch (err) {
//       console.error('KYC submission error:', err);
//       message.error(err.response?.data?.message || 'Client KYC submission failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateOrderItems = (items) => {
//     return items.every(item => item.styleNo && Number(item.grossWeight) > 0 && Number(item.pcs) > 0);
//   };

//   const handleOrderSubmit = async (values) => {
//     try {
//       setLoading(true);

//       const filteredOrderItems = orderItems.filter(
//         item => item.styleNo && item.grossWeight && item.pcs
//       );

//       if (filteredOrderItems.length === 0) {
//         throw new Error('At least one valid order item is required');
//       }

//       if (!validateOrderItems(filteredOrderItems)) {
//         throw new Error('All order items must have Style No, Gross Weight > 0, and at least 1 piece');
//       }

//       const payload = {
//         uniqueId: selectedClient.uniqueId, // Maintains original case
//         memoId: values.memoId?.trim() || undefined,
//         orderItems: filteredOrderItems.map(item => ({
//           styleNo: item.styleNo.trim(),
//           clarity: item.clarity?.trim() || undefined,
//           grossWeight: Number(item.grossWeight) || 0,
//           netWeight: Number(item.netWeight) || 0,
//           diaWeight: Number(item.diaWeight) || 0,
//           pcs: Number(item.pcs) || 1,
//           amount: Number(item.amount) || 0,
//           description: item.description?.trim() || undefined,
//           orderStatus: item.orderStatus || 'ongoing'
//         }))
//       };

//       const response = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/api/team/clients-order`,
//         payload,
//       );

//       message.success(response.data.message || 'Order submitted successfully');
//       orderForm.resetFields();
//       setOrderItems([{
//         key: 1,
//         styleNo: '',
//         clarity: '',
//         grossWeight: 0,
//         netWeight: 0,
//         diaWeight: 0,
//         pcs: 1,
//         amount: 0,
//         description: '',
//         orderStatus: 'ongoing'
//       }]);
//       setSelectedClient(null);
//       fetchClients();
//     } catch (err) {
//       console.error('Order submission error:', err);
//       message.error(err.response?.data?.message || err.message || 'Order submission failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFetchOrderHistory = async (values) => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/team/order-history`, {
//         params: { uniqueId: values.uniqueId },
//         timeout: 10000
//       });
//       setOrderHistory(res.data);
//     } catch (err) {
//       console.error('Order history error:', err);
//       message.error(err.response?.data?.message || 'Failed to fetch order history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addOrderItem = () => {
//     const newKey = orderItems.length > 0 ? 
//       Math.max(...orderItems.map(item => item.key)) + 1 : 1;
    
//     setOrderItems([...orderItems, {
//       key: newKey,
//       styleNo: '',
//       clarity: '',
//       grossWeight: 0,
//       netWeight: 0,
//       diaWeight: 0,
//       pcs: 1,
//       amount: 0,
//       description: '',
//       orderStatus: 'ongoing'
//     }]);
//   };

//   const removeOrderItem = (key) => {
//     if (orderItems.length <= 1) {
//       message.warning('At least one order item is required');
//       return;
//     }
//     setOrderItems(orderItems.filter(item => item.key !== key));
//   };

//   const updateOrderItem = (key, field, value) => {
//     setOrderItems(orderItems.map(item => 
//       item.key === key ? { ...item, [field]: value } : item
//     ));
//   };

//   const handleClientSelect = (value) => {
//     const client = clients.find(c => c.uniqueId === value);
//     setSelectedClient(client);
//   };

//   const clientColumns = [
//     { 
//       title: 'Unique ID', 
//       dataIndex: 'uniqueId', 
//       key: 'uniqueId',
//       render: (id) => <Text>{id}</Text> // Display as stored (SonalikaXXXX)
//     },
//     { title: 'Name', dataIndex: 'name', key: 'name' },
//     { title: 'Phone', dataIndex: 'phone', key: 'phone' },
//     { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true },
//     { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
//     { 
//       title: 'Orders', 
//       key: 'order', 
//       render: (_, record) => <Text>{record.order?.size || 0} order</Text>
//     },
//   ];

//   const orderHistoryColumns = [
//     { title: 'SR No', dataIndex: 'srNo', key: 'srNo' },
//     { title: 'Style No', dataIndex: 'styleNo', key: 'styleNo' },
//     { title: 'Clarity', dataIndex: 'clarity', key: 'clarity' },
//     { title: 'GR WT', dataIndex: 'grossWeight', key: 'grossWeight' },
//     { title: 'NT WT', dataIndex: 'netWeight', key: 'netWeight' },
//     { title: 'DIA WT', dataIndex: 'diaWeight', key: 'diaWeight' },
//     { title: 'PCS', dataIndex: 'pcs', key: 'pcs' },
//     { title: 'Amount', dataIndex: 'amount', key: 'amount' },
//     { 
//       title: 'Status', 
//       dataIndex: 'orderStatus', 
//       key: 'orderStatus',
//       render: (status) => (
//         <Tag color={status === 'completed' ? 'green' : status === 'ongoing' ? 'orange' : 'blue'}>
//           {status}
//         </Tag>
//       )
//     },
//     { 
//       title: 'Date', 
//       dataIndex: 'orderDate', 
//       key: 'orderDate',
//       render: (date) => new Date(date).toLocaleDateString()
//     },
//   ];

//   const renderDashboard = () => (
//     <>
//       <Title level={3}>Sales Dashboard</Title>
//       <Row gutter={16} style={{ marginBottom: 24 }}>
//         <Col span={8}>
//           <Card><Statistic title="Total Clients" value={clients.length} /></Card>
//         </Col>
//         <Col span={8}>
//           <Card>
//             <Statistic 
//               title="Active Orders" 
//               value={clients.reduce((count, client) => 
//                 count + (client.orders ? Array.from(client.orders.values()).filter(o => o.orderStatus === 'ongoing').length : 0), 0)} 
//             />
//           </Card>
//         </Col>
//         <Col span={8}>
//           <Card>
//             <Statistic 
//               title="Completed Orders" 
//               value={clients.reduce((count, client) => 
//                 count + (client.orders ? Array.from(client.orders.values()).filter(o => o.orderStatus === 'completed').length : 0), 0)} 
//             />
//           </Card>
//         </Col>
//       </Row>
      
//       <Card title="Recent Clients" style={{ marginBottom: 24 }}>
//         <Table 
//           dataSource={clients.slice(0, 5)} 
//           columns={clientColumns} 
//           rowKey="_id" 
//           loading={loading} 
//           pagination={false}
//         />
//       </Card>
//     </>
//   );

//   const renderKYC = () => (
//     <>
//       <Title level={3}>Client KYC Registration</Title>
//       <Card>
//         <Form layout="vertical" form={kycForm} onFinish={handleKYCSubmit}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
//                 <Input placeholder="Client full name" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item 
//                 name="phone" 
//                 label="Phone Number" 
//                 rules={[
//                   { required: true },
//                   { pattern: /^[0-9]{10}$/, message: '10-digit number required' }
//                 ]}
//               >
//                 <Input placeholder="10-digit phone number" maxLength={10} />
//               </Form.Item>
//             </Col>
//           </Row>
          
//           <Form.Item name="address" label="Address" rules={[{ required: true }]}>
//             <Input.TextArea rows={3} />
//           </Form.Item>
          
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item 
//                 name="gstNo" 
//                 label="GST Number"
//                 rules={[
//                   { required: true },
//                   { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }
//                 ]}
//               >
//                 <Input placeholder="22AAAAA0000A1Z5" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item name="memoId" label="Memo ID (optional)">
//                 <Input placeholder="Optional memo reference" />
//               </Form.Item>
//             </Col>
//           </Row>
          
//           <Button type="primary" htmlType="submit" loading={loading} size="large">
//             Register Client
//           </Button>
//         </Form>
//       </Card>
//     </>
//   );

//   const renderOrder = () => (
//     <>
//       <Title level={3}>Create New Order</Title>
//       <Card>
//         <Form layout="vertical" form={orderForm} onFinish={handleOrderSubmit}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item 
//                 name="uniqueId" 
//                 label="Select Client" 
//                 rules={[{ required: true, message: 'Please select a client' }]}
//               >
//                 <Select
//                   showSearch
//                   placeholder="Search by Unique ID"
//                   optionFilterProp="children"
//                   onChange={handleClientSelect}
//                   filterOption={(input, option) =>
//                     option?.children?.toString()(input)
//                   }
//                 >
//                   {clients.map(client => (
//                     <Option key={client.uniqueId} value={client.uniqueId}>
//                       {client.uniqueId}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item name="memoId" label="Memo ID (optional)">
//                 <Input placeholder="Optional memo reference" />
//               </Form.Item>
//             </Col>
//           </Row>

//           {selectedClient && (
//             <Card type="inner" title="Client Details" style={{ marginBottom: 16 }}>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Text strong>Name: </Text>
//                   <Text>{selectedClient.name}</Text>
//                 </Col>
//                 <Col span={8}>
//                   <Text strong>Unique ID: </Text>
//                   <Text>{selectedClient.uniqueId}</Text>
//                 </Col>
//                 <Col span={8}>
//                   <Text strong>Phone: </Text>
//                   <Text>{selectedClient.phone}</Text>
//                 </Col>
//               </Row>
//               <Row gutter={16} style={{ marginTop: 8 }}>
//                 <Col span={12}>
//                   <Text strong>Address: </Text>
//                   <Text>{selectedClient.address}</Text>
//                 </Col>
//                 <Col span={12}>
//                   <Text strong>GST No: </Text>
//                   <Text>{selectedClient.gstNo || 'N/A'}</Text>
//                 </Col>
//               </Row>
//             </Card>
//           )}

//           <Divider orientation="left">Order Items</Divider>
          
//           <div style={{ overflowX: "auto" }}>
//             <Row style={{ background: "#f0f2f5", padding: "10px", fontWeight: "bold", borderBottom: "1px solid #d9d9d9" }}>
//               {columnHeaders.map((col, i) => (
//                 <Col key={i} span={col === "DESCRIPTION" ? 6 : 2} style={{ textAlign: "center" }}>{col}</Col>
//               ))}
//             </Row>

//             {orderItems.map((item, index) => (
//               <Row key={item.key} gutter={8} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", background: index % 2 === 0 ? "#fff" : "#fcfcfc" }}>
//                 <Col span={2} style={{ textAlign: "center" }}>
//                   <Text>{index + 1}</Text>
//                 </Col>
//                 <Col span={2}>
//                   <Input 
//                     placeholder="Style No" 
//                     value={item.styleNo} 
//                     onChange={e => updateOrderItem(item.key, "styleNo", e.target.value)} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <Input 
//                     placeholder="Clarity" 
//                     value={item.clarity} 
//                     onChange={e => updateOrderItem(item.key, "clarity", e.target.value)} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <InputNumber 
//                     min={0} 
//                     step={0.01} 
//                     placeholder="GR WT" 
//                     value={item.grossWeight} 
//                     onChange={val => updateOrderItem(item.key, "grossWeight", val)} 
//                     style={{ width: "100%" }} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <InputNumber 
//                     min={0} 
//                     step={0.01} 
//                     placeholder="NT WT" 
//                     value={item.netWeight} 
//                     onChange={val => updateOrderItem(item.key, "netWeight", val)} 
//                     style={{ width: "100%" }} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <InputNumber 
//                     min={0} 
//                     step={0.01} 
//                     placeholder="DIA WT" 
//                     value={item.diaWeight} 
//                     onChange={val => updateOrderItem(item.key, "diaWeight", val)} 
//                     style={{ width: "100%" }} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <InputNumber 
//                     min={1} 
//                     placeholder="PCS" 
//                     value={item.pcs} 
//                     onChange={val => updateOrderItem(item.key, "pcs", val)} 
//                     style={{ width: "100%" }} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <InputNumber 
//                     min={0} 
//                     placeholder="Amount ₹" 
//                     value={item.amount} 
//                     onChange={val => updateOrderItem(item.key, "amount", val)} 
//                     style={{ width: "100%" }} 
//                   />
//                 </Col>
//                 <Col span={6}>
//                   <Input 
//                     placeholder="Description" 
//                     value={item.description} 
//                     onChange={e => updateOrderItem(item.key, "description", e.target.value)} 
//                   />
//                 </Col>
//                 <Col span={2}>
//                   <Select
//                     value={item.orderStatus}
//                     onChange={val => updateOrderItem(item.key, "orderStatus", val)}
//                     style={{ width: "100%" }}
//                   >
//                     <Option value="ongoing">Ongoing</Option>
//                     <Option value="completed">Completed</Option>
//                   </Select>
//                 </Col>
//                 <Col span={2} style={{ textAlign: "center" }}>
//                   <Button 
//                     danger 
//                     icon={<DeleteOutlined />} 
//                     onClick={() => removeOrderItem(item.key)} 
//                     disabled={orderItems.length === 1} 
//                   />
//                 </Col>
//               </Row>
//             ))}
//           </div>

//           <Button
//             type="dashed"
//             onClick={addOrderItem}
//             icon={<PlusOutlined />}
//             style={{ marginTop: 16, width: "100%" }}
//           >
//             Add Another Item
//           </Button>

//           <Button 
//             type="primary" 
//             htmlType="submit" 
//             loading={loading} 
//             size="large"
//             style={{ width: '100%', marginTop: 16 }}
//             disabled={!selectedClient}
//           >
//             Submit Order
//           </Button>
//         </Form>
//       </Card>
//     </>
//   );

//   const renderOrderHistory = () => (
//     <>
//       <Title level={3}>Order History</Title>
//       <Card>
//         <Form layout="inline" onFinish={handleFetchOrderHistory}>
//           <Form.Item 
//             name="uniqueId" 
//             label="Select Client" 
//             rules={[{ required: true, message: 'Please select a client' }]}
//           >
//             <Select
//               showSearch
//               style={{ width: 300 }}
//               placeholder="Search client by name or ID"
//               optionFilterProp="children"
//               filterOption={(input, option) =>
//                 option.children.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {clients.map(client => (
//                 <Option key={client.uniqueId} value={client.uniqueId}>
//                   {client.uniqueId}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
//           <Button type="primary" htmlType="submit" loading={loading}>
//             Search Orders
//           </Button>
//         </Form>
        
//         {orderHistory && (
//           <div style={{ marginTop: 24 }}>
//             <Card title="Client Information" style={{ marginBottom: 16 }}>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Text strong>Client: </Text>
//                   <Text>{orderHistory.client.name}</Text>
//                 </Col>
//                 <Col span={8}>
//                   <Text strong>Unique ID: </Text>
//                   <Text>{orderHistory.client.uniqueId}</Text>
//                 </Col>
//                 <Col span={8}>
//                   <Text strong>Phone: </Text>
//                   <Text>{orderHistory.client.phone}</Text>
//                 </Col>
//               </Row>
//               <Row gutter={16} style={{ marginTop: 8 }}>
//                 <Col span={12}>
//                   <Text strong>Address: </Text>
//                   <Text>{orderHistory.client.address}</Text>
//                 </Col>
//                 <Col span={12}>
//                   <Text strong>GST No: </Text>
//                   <Text>{orderHistory.client.gstNo || 'N/A'}</Text>
//                 </Col>
//               </Row>
//             </Card>
            
//             <Table
//               columns={orderHistoryColumns}
//               dataSource={orderHistory.order ? Array.from(orderHistory.order.values()) : []}
//               rowKey="styleNo"
//               bordered
//               pagination={{ pageSize: 10 }}
//               summary={pageData => {
//                 const totalAmount = pageData.reduce((sum, item) => sum + (item.amount || 0), 0);
//                 const totalPcs = pageData.reduce((sum, item) => sum + (item.pcs || 0), 0);
                
//                 return (
//                   <Table.Summary fixed>
//                     <Table.Summary.Row>
//                       <Table.Summary.Cell index={0} colSpan={6}>
//                         <Text strong>Totals</Text>
//                       </Table.Summary.Cell>
//                       <Table.Summary.Cell index={1}>
//                         <Text strong>{totalPcs}</Text>
//                       </Table.Summary.Cell>
//                       <Table.Summary.Cell index={2}>
//                         <Text strong>₹{totalAmount.toFixed(2)}</Text>
//                       </Table.Summary.Cell>
//                       <Table.Summary.Cell index={3} colSpan={3} />
//                     </Table.Summary.Row>
//                   </Table.Summary>
//                 );
//               }}
//             />
//           </div>
//         )}
//       </Card>
//     </>
//   );

//   const renderContent = () => {
//     switch(selectedMenu) {
//       case 'dashboard': return renderDashboard();
//       case 'kyc': return renderKYC();
//       case 'order': return renderOrder();
//       case 'history': return renderOrderHistory();
//       default: return renderDashboard();
//     }
//   };

//   return (
//     <Layout style={{ minHeight: '100vh' }}>
//       <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
//         <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
//           {collapsed ? 'ST' : 'Sales Team'}
//         </div>
//         <Menu theme="dark" selectedKeys={[selectedMenu]} onClick={({ key }) => setSelectedMenu(key)}>
//           <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
//           <Menu.Item key="kyc" icon={<UserAddOutlined />}>Client KYC</Menu.Item>
//           <Menu.Item key="order" icon={<ShoppingCartOutlined />}>Create Order</Menu.Item>
//           <Menu.Item key="history" icon={<HistoryOutlined />}>Order History</Menu.Item>
//         </Menu>
//       </Sider>
//       <Layout>
//         <Header style={{ background: '#fff', padding: 0, paddingLeft: 24 }}>
//           <Title level={4} style={{ margin: 0 }}>
//             {{
//               dashboard: 'Sales Dashboard',
//               kyc: 'Client KYC Registration',
//               order: 'Create New Order',
//               history: 'Order History'
//             }[selectedMenu]}
//           </Title>
//         </Header>
//         <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
//           <div style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 112px)' }}>
//             {loading ? (
//               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
//                 <Spin size="large" />
//               </div>
//             ) : renderContent()}
//           </div>
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default SalesTeamDashboard;