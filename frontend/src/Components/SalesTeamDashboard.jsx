import React, { useEffect, useState } from 'react';
import { 
  Layout, Menu, Card, Table, Form, Input, Button, message, Space,
  Typography, Spin, Row, Col, Statistic, Divider, InputNumber, Select, Tag, DatePicker, Modal
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { 
  LayoutDashboard, User, ShoppingCart, History, 
  Plus, Minus, Search, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const { RangePicker } = DatePicker;
const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const SalesDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [orderItems, setOrderItems] = useState([{}]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalOrders: 0,
  });
  const [kycFields, setKycFields] = useState([
    { name: '', phone: '', address: '', gstNo: '' }
  ]);
  const [modalClient, setModalClient] = useState(null);
  const [ongoingOrderModalVisible, setOngoingOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const minimalClientColumns = [
    {
      title: 'Unique ID',
      dataIndex: 'uniqueId',
      key: 'uniqueId',
      render: (text) => <span className="font-mono font-semibold text-blue-600">{text}</span>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <span 
          className="text-gray-800 font-medium cursor-pointer hover:text-blue-600 transition-colors" 
          onClick={() => handleClientClick(record)}
        >
          {record.name}
        </span>
      )
    }
  ];

  const ongoingClientColumns = [
    {
      title: 'Unique ID',
      dataIndex: 'uniqueId',
      key: 'uniqueId',
      render: (text) => <span className="font-mono font-semibold text-blue-600">{text}</span>
    },
    {
  title: 'Status',
  key: 'status',
  render: (_, client) => {
    const orders = ordersToArray(client.orders);
    if (!orders.length) {
      return <Tag className="bg-gray-100 text-gray-700">No Orders</Tag>;
    }

    // Get latest order (by date)
    const latestOrder = orders
      .filter(order => order?.orderDate)
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0];

    if (latestOrder?.status === 'completed') {
      return <Tag className="bg-green-100 text-green-800">Completed</Tag>;
    } else if (latestOrder?.status === 'ongoing') {
      return <Tag className="bg-blue-100 text-blue-800">Ongoing</Tag>;
    } else {
      return <Tag className="bg-yellow-100 text-yellow-800">Pending</Tag>;
    }
  }
}
,
    {
      title: 'Action',
      key: 'action',
      render: (_, client) => (
        <Button 
          size="small" 
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
          onClick={() => handleClientClick(client)}
        >
          View Details
        </Button>
      )
    }
  ];

  const ClientModal = ({ client, onClose }) => {
    if (!client) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.uniqueId}</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{client.phone}</span>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">{client.address}</span>
              </div>
              
              {client.gstNo && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-gray-700">GST: {client.gstNo}</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Order Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-lg font-bold text-blue-600">
                    {client.orders ? ordersToArray(client.orders).length : 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-lg font-bold text-green-600">
                    {client.orders ? ordersToArray(client.orders).filter(o => o.status === 'ongoing').length : 0}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const OngoingOrderModal = ({ order, visible, onClose }) => {
    if (!order) return null;

    return (
      <Modal
        title={`Order Details - ${order.orderId?.substring(0, 8)}...`}
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Client Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.client?.name || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {order.client?.phone || 'N/A'}</p>
                <p><span className="font-medium">GST:</span> {order.client?.gstNo || 'N/A'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Order Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Date:</span> {dayjs(order.orderDate).format('DD/MM/YYYY')}</p>
                <p><span className="font-medium">Status:</span> 
                  <Tag className={`ml-2 ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {order.status?.toUpperCase() || 'UNKNOWN'}
                  </Tag>
                </p>
                <p><span className="font-medium">Total Amount:</span> ₹{order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0}</p>
              </div>
            </div>
          </div>

          <Divider>Order Items</Divider>

          <Table
            columns={[
              { 
                title: 'SR No', 
                dataIndex: 'srNo', 
                key: 'srNo',
                render: (text) => <span className="text-gray-700">{text}</span>
              },
              { 
                title: 'Style No', 
                dataIndex: 'styleNo', 
                key: 'styleNo',
                render: (text) => <span className="font-medium">{text}</span>
              },
              { 
                title: 'PCS', 
                dataIndex: 'pcs', 
                key: 'pcs',
                render: (text) => <span className="font-medium">{text}</span>
              },
              { 
                title: 'Amount', 
                dataIndex: 'amount', 
                key: 'amount',
                render: (text) => <span className="font-medium">₹{text}</span>
              },
              { 
                title: 'Description', 
                dataIndex: 'description', 
                key: 'description',
                render: (text) => <span className="text-gray-600">{text || 'N/A'}</span>
              },
            ]}
            dataSource={order.orderItems || []}
            rowKey={(record) => `${record.srNo}-${record.styleNo}`}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      </Modal>
    );
  };

  const handleClientClick = (client) => {
    setModalClient(client);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOngoingOrderModalVisible(true);
  };

  const closeModal = () => {
    setModalClient(null);
  };

  const closeOrderModal = () => {
    setOngoingOrderModalVisible(false);
    setSelectedOrder(null);
  };

  // Convert orders Map to array for easier handling
  const ordersToArray = (orders) => {
    if (!orders) return [];
    if (orders instanceof Map) return Array.from(orders.entries()).map(([orderId, order]) => ({ 
      orderId,
      ...order 
    }));
    if (Array.isArray(orders)) return orders;
    return Object.entries(orders).map(([orderId, order]) => ({ orderId, ...order }));
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`);
      const clientsData = res.data?.clients || res.data?.data || [];
      setClients(clientsData);
      calculateStats(clientsData);
    } catch (err) {
      console.error('Fetch error:', err);
      message.error('Failed to fetch clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientsData) => {
    let totalOrders = 0;
    const activeClients = new Set();

    clientsData.forEach(client => {
      const orders = ordersToArray(client.orders);
      
      orders.forEach(order => {
        totalOrders++;
        if (order.status === 'ongoing') {
          activeClients.add(client.uniqueId);
        }
      });
    });

    setStats({
      totalClients: clientsData.length,
      activeClients: activeClients.size,
      totalOrders,
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleKYCSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate all fields
      const invalidFields = kycFields
        .map((field, index) => {
          const errors = [];
          if (!field.name?.trim()) errors.push("Name is required");
          if (!field.phone?.trim()) errors.push("Phone is required");
          if (!/^[0-9]{10,15}$/.test(field.phone)) errors.push("Phone should be 10-15 digits");
          if (!field.address?.trim()) errors.push("Address is required");
          
          return errors.length > 0 ? { rowIndex: index, errors } : null;
        })
        .filter(Boolean);

      if (invalidFields.length > 0) {
        message.error({
          content: (
            <div>
              <p>Please fix the following errors:</p>
              <ul>
                {invalidFields.map((field, idx) => (
                  <li key={idx}>
                    <strong>Row {field.rowIndex + 1}:</strong> {field.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          ),
          duration: 10
        });
        return;
      }

      // Submit each client
      for (const field of kycFields) {
        await axios.post(`${API_BASE_URL}/api/team/client-kyc`, field);
      }
      
      message.success(`${kycFields.length} client(s) added successfully`);
      setKycFields([{ name: '', phone: '', address: '', gstNo: '' }]);
      fetchClients();
    } catch (err) {
      console.error('KYC Error:', err);
      const errorMsg = err.response?.data?.message || 
                     err.response?.data?.error || 
                     'Submission failed';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async () => {
    try {
      setLoading(true);
      
      if (!selectedClient?.uniqueId) {
        throw new Error('Please select a client');
      }

      if (!orderItems || orderItems.length === 0) {
        throw new Error('Please add at least one order item');
      }

      const invalidItems = orderItems
        .map((item, index) => {
          const errors = [];
          if (!item.styleNo?.trim()) errors.push("Style No is required");
          if (!item.pcs || isNaN(item.pcs)) errors.push("PCS must be a number");
          if (item.pcs < 1) errors.push("PCS must be at least 1");
          if (!item.amount || isNaN(item.amount)) errors.push("Amount must be a number");
          if (item.amount <= 0) errors.push("Amount must be greater than 0");
          
          return errors.length > 0 ? { itemIndex: index, errors } : null;
        })
        .filter(Boolean);

      if (invalidItems.length > 0) {
        message.error({
          content: (
            <div>
              <p>Please fix the following errors:</p>
              <ul>
                {invalidItems.map((item, idx) => (
                  <li key={idx}>
                    <strong>Item {item.itemIndex + 1}:</strong> {item.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          ),
          duration: 10
        });
        return;
      }

      const payload = {
        uniqueId: selectedClient.uniqueId,
        orderItems: orderItems.map(item => ({
          srNo: item.srNo || 0,
          styleNo: item.styleNo.trim(),
          clarity: item.clarity?.trim() || "",
          grossWeight: item.grossWeight || 0,
          netWeight: item.netWeight || 0,
          diaWeight: item.diaWeight || 0,
          pcs: item.pcs,
          amount: item.amount,
          description: item.description?.trim() || ""
        }))
      };
      
      await axios.post(`${API_BASE_URL}/api/team/clients-order`, payload);
      
      message.success('Order created successfully');
      orderForm.resetFields();
      setOrderItems([{}]);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      console.error('Order Error:', err);
      
      if (err.response) {
        if (err.response.status === 400) {
          message.error(err.response.data.message || 'Validation failed. Please check your inputs.');
        } else if (err.response.status === 404) {
          message.error(err.response.data.message || 'Client not found');
        } else {
          message.error(err.response.data.error || 'Order creation failed');
        }
      } else {
        message.error(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async (uniqueId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`, {
        params: { uniqueId }
      });
      
      const clientData = res.data?.data || res.data;
      const historyData = clientData?.orders ? 
        Array.from(clientData.orders.entries()).map(([orderId, order]) => ({
          orderId,
          ...order
        })) : [];
      
      setOrderHistory(historyData);
    } catch (err) {
      console.error('History Error:', err);
      message.error('Failed to fetch order history');
      setOrderHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems(prev => [...prev, {}]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const addKycRow = () => {
    setKycFields(prev => [...prev, { name: '', phone: '', address: '', gstNo: '' }]);
  };

  const removeKycRow = (index) => {
    if (kycFields.length <= 1) return;
    setKycFields(prev => {
      const newFields = [...prev];
      newFields.splice(index, 1);
      return newFields;
    });
  };

  const updateKycField = (index, field, value) => {
    setKycFields(prev => {
      const newFields = [...prev];
      newFields[index] = { ...newFields[index], [field]: value };
      return newFields;
    });
  };

  const handleClientSelect = (uniqueId) => {
    const client = clients.find(c => c.uniqueId === uniqueId);
    setSelectedClient(client || null);
  };

  const clientColumns = [
    { 
      title: 'Unique ID', 
      dataIndex: 'uniqueId', 
      key: 'uniqueId',
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    { 
      title: 'Phone', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (text) => <span className="text-gray-600">{text}</span>
    },
    { 
      title: 'GST No', 
      dataIndex: 'gstNo', 
      key: 'gstNo',
      render: (text) => <span className="text-gray-600">{text || 'N/A'}</span>
    },
    { 
      title: 'Status', 
      key: 'status',
      render: (_, client) => {
        const orders = ordersToArray(client.orders);
        if (orders.length === 0) return <Tag className="bg-gray-100 text-gray-800">No orders</Tag>;
        
        const statuses = orders.map(o => o?.status).filter(Boolean);
        
        if (statuses.includes('ongoing')) return <Tag className="bg-blue-100 text-blue-800">Active</Tag>;
        if (statuses.every(s => s === 'completed')) return <Tag className="bg-green-100 text-green-800">Completed</Tag>;
        return <Tag className="bg-orange-100 text-orange-800">Mixed</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, client) => (
        <Button 
          size="small" 
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
          onClick={() => {
            setSelectedMenu('history');
            handleClientSelect(client.uniqueId);
            fetchOrderHistory(client.uniqueId);
          }}
        >
          View Orders
        </Button>
      )
    }
  ];

  const orderColumns = [
    { 
      title: 'Order ID', 
      dataIndex: 'orderId', 
      key: 'orderId',
      render: id => <span className="font-medium">{id ? id.substring(0, 8) + '...' : 'N/A'}</span>
    },
    { 
      title: 'Date', 
      dataIndex: 'orderDate', 
      key: 'date', 
      render: date => <span className="text-gray-600">{date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'}</span>
    },
    { 
      title: 'Items', 
      dataIndex: 'orderItems', 
      key: 'items', 
      render: items => <span className="font-medium">{items?.length || 0}</span>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: status => (
        <Tag className={`${status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {status ? status.toUpperCase() : 'UNKNOWN'}
        </Tag>
      )
    },
    { 
      title: 'Amount', 
      key: 'amount', 
      render: (_, order) => (
        <span className="font-medium">
          ₹{order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0}
        </span>
      )
    }
  ];

  const orderItemColumns = [
    { 
      title: 'SR No', 
      dataIndex: 'srNo', 
      key: 'srNo',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    { 
      title: 'Style No', 
      dataIndex: 'styleNo', 
      key: 'styleNo',
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: 'Clarity', 
      dataIndex: 'clarity', 
      key: 'clarity',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    { 
      title: 'Gross WT', 
      dataIndex: 'grossWeight', 
      key: 'grossWeight',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    { 
      title: 'Net WT', 
      dataIndex: 'netWeight', 
      key: 'netWeight',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    { 
      title: 'DIA WT', 
      dataIndex: 'diaWeight', 
      key: 'diaWeight',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    { 
      title: 'PCS', 
      dataIndex: 'pcs', 
      key: 'pcs',
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (text) => <span className="font-medium">₹{text}</span>
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      render: (text) => <span className="text-gray-600">{text}</span>
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800">Sales Dashboard</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <Statistic 
            title={<span className="text-gray-600">Total Clients</span>} 
            value={stats.totalClients} 
            valueStyle={{ color: '#3b82f6', fontSize: '24px' }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <Statistic 
            title={<span className="text-gray-600">Active Clients</span>} 
            value={stats.activeClients} 
            valueStyle={{ color: '#10b981', fontSize: '24px' }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <Statistic 
            title={<span className="text-gray-600">Total Orders</span>} 
            value={stats.totalOrders} 
            valueStyle={{ color: '#f59e0b', fontSize: '24px' }}
          />
        </div>
      </div>
      
      {/* Clients and Orders Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* All Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">All Clients</h2>
          <Table 
            dataSource={clients} 
            columns={minimalClientColumns} 
            rowKey="uniqueId"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 280 }}
            size="small"
            bordered
            className="custom-table"
            onRow={(record) => ({
              onClick: () => handleClientClick(record),
              className: 'cursor-pointer hover:bg-gray-50'
            })}
          />
        </div>

        {/* Ongoing Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Ongoing Orders</h2>
          <Table 
            dataSource={clients.filter(client => {
              const orders = ordersToArray(client.orders);
              return orders.some(order => order?.status === 'ongoing');
            })}
            columns={ongoingClientColumns}
            rowKey="uniqueId"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 280 }}
            size="small"
            bordered
            className="custom-table"
          />
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Completed Orders</h2>
          <Table 
            dataSource={clients.flatMap(client => {
              const orders = ordersToArray(client.orders);
              return orders
                .filter(order => order?.status === 'completed')
                .map(order => ({ ...order, clientName: client.name, client }))
                .sort((a, b) => new Date(b?.orderDate || 0) - new Date(a?.orderDate || 0));
            })}
            columns={[
              { 
                title: 'Client', 
                dataIndex: 'clientName', 
                key: 'clientName',
                render: (text, record) => (
                  <span 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleClientClick(record.client)}
                  >
                    {text}
                  </span>
                )
              },
              ...orderColumns
            ]}
            rowKey="orderId"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 280 }}
            size="small"
            bordered
            locale={{
              emptyText: (
                <div className="text-gray-500 text-sm flex flex-col items-center justify-center py-10">
                  <img src="/empty-box-icon.svg" alt="No Data" className="w-12 h-12 mb-2" />
                  <p>No completed orders</p>
                </div>
              ),
            }}
            className="custom-table"
          />
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal client={modalClient} onClose={closeModal} />
      
      {/* Ongoing Order Modal */}
      <OngoingOrderModal 
        order={selectedOrder} 
        visible={ongoingOrderModalVisible} 
        onClose={closeOrderModal} 
      />
    </div>
  );

const renderKYCForm = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold text-gray-800">Client KYC Form</h3>

    {kycFields.map((field, index) => (
      <div
        key={index}
        className="bg-white rounded-lg shadow p-4 border border-gray-800 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Input
  value={field.name}
  onChange={e => updateKycField(index, 'name', e.target.value)}
  placeholder="Full name *"
  style={{ border: '1px solid black', borderRadius: '6px' }}
/>

  <Input
    value={field.phone}
    onChange={e => updateKycField(index, 'phone', e.target.value)}
    placeholder="Phone *"
    style={{ border: '1px solid black', borderRadius: '6px' }}
  />
  <Input
    value={field.gstNo}
    onChange={e => updateKycField(index, 'gstNo', e.target.value)}
    placeholder="GST No (Optional)"
style={{ border: '1px solid black', borderRadius: '6px' }}
  />
  {/* <div className="flex items-start">
    <Button
      danger
      icon={<Minus className="h-4 w-4" />}
      onClick={() => removeKycRow(index)}
      disabled={kycFields.length <= 1}
      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
    />
  </div> */}
</div>

<Input.TextArea
  value={field.address}
  onChange={e => updateKycField(index, 'address', e.target.value)}
  placeholder="Full address *"
  rows={2}
 style={{ border: '1px solid black', borderRadius: '6px' }}
/>

      </div>
    ))}

    <div className="flex justify-between items-center">
      <Button
        type="dashed"
        onClick={addKycRow}
        icon={<Plus className="h-4 w-4" />}
        className="border-dashed border-gray-800 text-gray-800 hover:border-blue-500 hover:text-blue-600"
      >
        Add Row
      </Button>
      <Button
        type="primary"
        onClick={handleKYCSubmit}
        loading={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
      >
        Submit KYC
      </Button>
    </div>

    {/* Client List */}
    <div className="mt-10 border border-gray-800 rounded-lg p-4">
      <h4 className="text-lg font-medium mb-4 text-gray-800">Existing Clients</h4>
      <Table
        dataSource={clients}
        columns={clientColumns}
        rowKey="uniqueId"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: true }}
        className="w-full custom-table"
      />
    </div>
  </div>
);



  const renderOrderForm = () => (
    <div >
      <h3 className="text-2xl font-semibold text-gray-800">Create New Order</h3>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="mb-6">
          <label className="block  font-medium text-gray-700 mb-2">Client</label>
          <Select
            showSearch
            placeholder="Select client"
            optionFilterProp="children"
            onChange={handleClientSelect}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            className="w-auto border border-gray-600 hover:border-blue-400"
            suffixIcon={<ChevronDown className="h-4 w-4 text-gray-500" />}
          >
            {clients.map(client => (
              <Option key={client.uniqueId} value={client.uniqueId}>
                {client.uniqueId}
              </Option>
            ))}
          </Select>
        </div>

        {selectedClient && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-medium text-gray-700 p-1">Client:</td>
                  <td className="text-gray-600 p-1">{selectedClient.name}</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 p-1">Phone:</td>
                  <td className="text-gray-600 p-1">{selectedClient.phone}</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 p-1">GST:</td>
                  <td className="text-gray-600 p-1">{selectedClient.gstNo || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 p-1">Address:</td>
                  <td className="text-gray-600 p-1">{selectedClient.address}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <h4 className="text-lg font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">
          Order Items
        </h4>
        
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-100 border-2 border-gray-900">
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">SR No</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">Style No*</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">Clarity</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">Gross WT</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">Net WT</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">DIA WT</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">PCS*</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">Amount*</th>
              <th className="p-2 text-left text-gray-700 font-medium border border-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index} className="border border-gray-600 hover:bg-gray-50">
                <td className="p-2 border border-gray-600">
                  <InputNumber
                    value={item.srNo}
                    onChange={val => updateOrderItem(index, 'srNo', val)}
                    className="w-full border-gray-300 hover:border-blue-400"
                    min={0}
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <Input
                    value={item.styleNo}
                    onChange={e => updateOrderItem(index, 'styleNo', e.target.value)}
                    placeholder="Style number"
                    className="w-full border-gray-300 hover:border-blue-400"
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <Input
                    value={item.clarity}
                    onChange={e => updateOrderItem(index, 'clarity', e.target.value)}
                    className="w-full border-gray-300 hover:border-blue-400"
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <InputNumber
                    value={item.grossWeight}
                    onChange={val => updateOrderItem(index, 'grossWeight', val)}
                    className="w-full border-gray-300 hover:border-blue-400"
                    min={0}
                    step={0.01}
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <InputNumber
                    value={item.netWeight}
                    onChange={val => updateOrderItem(index, 'netWeight', val)}
                    className="w-full border-gray-300 hover:border-blue-400"
                    min={0}
                    step={0.01}
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <InputNumber
                    value={item.diaWeight}
                    onChange={val => updateOrderItem(index, 'diaWeight', val)}
                    className="w-full border-gray-300 hover:border-blue-400"
                    min={0}
                    step={0.01}
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <InputNumber
                    value={item.pcs}
                    onChange={val => updateOrderItem(index, 'pcs', val)}
                    className={`w-full border-gray-300 hover:border-blue-400 ${
                      !item.pcs || item.pcs < 1 ? 'border-red-500' : ''
                    }`}
                    min={1}
                  />
                </td>
                <td className="p-2 border border-gray-600">
                  <InputNumber
                    value={item.amount}
                    onChange={val => updateOrderItem(index, 'amount', val)}
                    className={`w-full border-gray-300 hover:border-blue-400 ${
                      !item.amount || item.amount <= 0 ? 'border-red-500' : ''
                    }`}
                    min={0}
                    step={0.01}
                  />
                </td>
                <td className="p-2 border border-gray-600 text-center">
                  <Button
                    danger
                    icon={<Minus className="h-4 w-4" />}
                    onClick={() => removeOrderItem(index)}
                    className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Description</label>
          {orderItems.map((item, index) => (
            <div key={index} className="mb-4">
              <Input.TextArea
                value={item.description}
                onChange={e => updateOrderItem(index, 'description', e.target.value)}
                rows={2}
                className="w-full border-gray-300 hover:border-blue-400"
                placeholder={`Description for item ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="dashed"
            onClick={addOrderItem}
            icon={<Plus className="h-4 w-4" />}
            className="border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          >
            Add Item
          </Button>
          
          <Button 
            type="primary" 
            onClick={handleOrderSubmit}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
          >
            Create Order
          </Button>
        </div>
      </div>
    </div>
  );

const renderOrderHistory = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold text-gray-800">Order History</h3>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          className="w-full border-gray-300 hover:border-blue-400"
          placeholder="Search client by ID"
          value={selectedClient?.uniqueId}
          onChange={uniqueId => {
            handleClientSelect(uniqueId);
            fetchOrderHistory(uniqueId);
          }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          suffixIcon={<Search className="h-4 w-4 text-gray-500" />}
        >
          {clients.map(client => (
            <Option key={client.uniqueId} value={client.uniqueId}>
              {client.uniqueId} - {client.name}
            </Option>
          ))}
        </Select>
        
        <RangePicker
          className="w-full border-gray-300 hover:border-blue-400"
          value={dateRange}
          onChange={setDateRange}
          disabledDate={current => current && current > dayjs().endOf('day')}
        />
        
        <Select
          className="w-full border-gray-300 hover:border-blue-400"
          placeholder="Filter by status"
          allowClear
          onChange={value => {
            // You would need to implement status filtering logic
          }}
          suffixIcon={<ChevronDown className="h-4 w-4 text-gray-500" />}
        >
          <Option value="ongoing">Ongoing</Option>
          <Option value="completed">Completed</Option>
        </Select>
      </div>

      {/* Client Info Card */}
      {selectedClient && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Client ID</p>
              <p className="font-medium">{selectedClient.uniqueId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{selectedClient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{selectedClient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="font-medium">
                {selectedClient.orders ? ordersToArray(selectedClient.orders).length : 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table with Expandable Rows */}
      <Table
        columns={[
          { 
            title: 'Order ID', 
            dataIndex: 'orderId', 
            key: 'orderId',
            render: (id, record) => (
              <span 
                className="font-medium text-blue-600 cursor-pointer hover:underline"
                onClick={() => handleOrderClick(record)}
              >
                {id ? `${id.substring(0, 8)}...` : 'N/A'}
              </span>
            ),
            sorter: (a, b) => a.orderId.localeCompare(b.orderId)
          },
          { 
            title: 'Date', 
            dataIndex: 'orderDate', 
            key: 'date',
            render: date => (
              <span className="text-gray-600">
                {date ? dayjs(date).format('DD MMM YYYY') : 'N/A'}
              </span>
            ),
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate)
          },
          { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: status => (
              <Tag className={
                status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : status === 'ongoing' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
              }>
                {status ? status.toUpperCase() : 'UNKNOWN'}
              </Tag>
            ),
            filters: [
              { text: 'Ongoing', value: 'ongoing' },
              { text: 'Completed', value: 'completed' }
            ],
            onFilter: (value, record) => record.status === value
          },
          { 
            title: 'Items', 
            dataIndex: 'orderItems', 
            key: 'items',
            render: items => (
              <span className="font-medium">
                {items?.length || 0}
              </span>
            ),
            sorter: (a, b) => (a.orderItems?.length || 0) - (b.orderItems?.length || 0)
          },
          { 
            title: 'Amount (₹)', 
            key: 'amount',
            render: (_, order) => (
              <span className="font-medium">
                {order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0}
              </span>
            ),
            sorter: (a, b) => {
              const aAmount = a.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
              const bAmount = b.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
              return aAmount - bAmount;
            }
          }
        ]}
        dataSource={orderHistory}
        rowKey="orderId"
        loading={loading}
        expandable={{
          expandedRowRender: order => (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Order Details</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {order.orderId}</p>
                    <p><span className="font-medium">Date:</span> {dayjs(order.orderDate).format('DD MMM YYYY')}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Tag className={`ml-2 ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {order.status?.toUpperCase() || 'UNKNOWN'}
                      </Tag>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Client Details</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {order.client?.name || selectedClient?.name || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {order.client?.phone || selectedClient?.phone || 'N/A'}</p>
                    <p><span className="font-medium">GST:</span> {order.client?.gstNo || selectedClient?.gstNo || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Divider>Order Items</Divider>

              <Table
                columns={[
                  { 
                    title: 'SR No', 
                    dataIndex: 'srNo', 
                    key: 'srNo',
                    render: text => <span className="text-gray-700">{text}</span>
                  },
                  { 
                    title: 'Style No', 
                    dataIndex: 'styleNo', 
                    key: 'styleNo',
                    render: text => <span className="font-medium">{text}</span>
                  },
                  { 
                    title: 'Clarity', 
                    dataIndex: 'clarity', 
                    key: 'clarity',
                    render: text => <span className="text-gray-600">{text || 'N/A'}</span>
                  },
                  { 
                    title: 'Gross WT', 
                    dataIndex: 'grossWeight', 
                    key: 'grossWeight',
                    render: text => <span className="text-gray-600">{text}</span>
                  },
                  { 
                    title: 'Net WT', 
                    dataIndex: 'netWeight', 
                    key: 'netWeight',
                    render: text => <span className="text-gray-600">{text}</span>
                  },
                  { 
                    title: 'DIA WT', 
                    dataIndex: 'diaWeight', 
                    key: 'diaWeight',
                    render: text => <span className="text-gray-600">{text}</span>
                  },
                  { 
                    title: 'PCS', 
                    dataIndex: 'pcs', 
                    key: 'pcs',
                    render: text => <span className="font-medium">{text}</span>
                  },
                  { 
                    title: 'Amount', 
                    dataIndex: 'amount', 
                    key: 'amount',
                    render: text => <span className="font-medium">₹{text}</span>
                  },
                  { 
                    title: 'Description', 
                    dataIndex: 'description', 
                    key: 'description',
                    render: text => <span className="text-gray-600">{text || 'N/A'}</span>
                  }
                ]}
                dataSource={order.orderItems || []}
                rowKey={(orders) => `${orders.srNo}-${orders.styleNo}`}
                pagination={false}
                size="small"
                bordered
              />
            </div>
          ),
          expandIcon: ({ expanded, onExpand, orders }) =>
            expanded ? (
              <ChevronDown 
                className="h-4 w-4 text-gray-500 cursor-pointer" 
                onClick={e => onExpand(orders, e)}
              />
            ) : (
              <ChevronRight 
                className="h-4 w-4 text-gray-500 cursor-pointer" 
                onClick={e => onExpand(orders, e)}
              />
            ),
          rowExpandable: order => order.orderItems?.length > 0
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
        locale={{
          emptyText: (
            <div className="text-center py-8">
              <img 
                src="/empty-box-icon.svg" 
                alt="No orders" 
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
              />
              <p className="text-gray-500">
                {selectedClient 
                  ? 'No orders found for this client' 
                  : 'Select a client to view their order history'}
              </p>
            </div>
          )
        }}
        className="custom-table"
      />
    </div>
  </div>
);

  const renderContent = () => {
    switch(selectedMenu) {
      case 'dashboard': return renderDashboard();
      case 'kyc': return renderKYCForm();
      case 'order': return renderOrderForm();
      case 'history': return renderOrderHistory();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex-shrink-0 hidden md:block">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <span className="text-xl font-bold">SALES</span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedMenu('dashboard')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === 'dashboard' 
                    ? 'bg-blue-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu('kyc')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === 'kyc' 
                    ? 'bg-blue-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Client KYC</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu('order')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === 'order' 
                    ? 'bg-blue-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                <span>Create Order</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu('history')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedMenu === 'history' 
                    ? 'bg-blue-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <History className="h-5 w-5 mr-3" />
                <span>Order History</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {collapsed ? <ChevronRight /> : <ChevronDown />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {collapsed && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setCollapsed(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-800 text-white">
            <div className="h-16 flex items-center justify-center border-b border-gray-700">
              <span className="text-xl font-bold">SALES</span>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu('dashboard');
                      setCollapsed(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === 'dashboard' 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu('kyc');
                      setCollapsed(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === 'kyc' 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span>Client KYC</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu('order');
                      setCollapsed(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === 'order' 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    <span>Create Order</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedMenu('history');
                      setCollapsed(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedMenu === 'history' 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <History className="h-5 w-5 mr-3" />
                    <span>Order History</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <h4 className="text-lg font-semibold text-gray-800">Sales Dashboard</h4>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden md:block">
                {dayjs().format('DD MMM YYYY')}
              </span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow p-4 md:p-6 min-h-[calc(100vh-8rem)] border border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>

      {/* Client Modal */}
      <ClientModal client={modalClient} onClose={closeModal} />

      {/* Ongoing Order Modal */}
      <OngoingOrderModal 
        order={selectedOrder} 
        visible={ongoingOrderModalVisible} 
        onClose={closeOrderModal} 
      />

      {/* Custom Table Styling */}
      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f3f4f6 !important;
          color: #374151 !important;
          font-weight: 600 !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb !important;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb !important;
        }
        .ant-table-expanded-row .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
        }
      `}</style>
    </div>
  );
};

export default SalesDashboard;