import React, { useEffect, useState } from 'react';
import { 
  Layout, Menu, Card, Table, Form, Input, Button, message, Space,
  Typography, Spin, Row, Col, Statistic, Divider, InputNumber, Select, Tag, DatePicker
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { 
  LayoutDashboard, User, ShoppingCart, History, 
  Plus, Minus, Search, ChevronDown, ChevronRight
} from 'lucide-react';

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
    revenue: 0
  });

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
    let revenue = 0;
    const activeClients = new Set();

    clientsData.forEach(client => {
      const orders = ordersToArray(client.orders);
      
      orders.forEach(order => {
        totalOrders++;
        if (order.status === 'ongoing') {
          activeClients.add(client.uniqueId);
        }
        if (order.orderItems) {
          order.orderItems.forEach(item => {
            revenue += item.amount || 0;
          });
        }
      });
    });

    setStats({
      totalClients: clientsData.length,
      activeClients: activeClients.size,
      totalOrders,
      revenue
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleKYCSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/team/client-kyc`, values);
      
      message.success('Client added successfully');
      kycForm.resetFields();
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
      const res = await axios.get(`${API_BASE_URL}/api/team/order-history`, {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <Statistic 
            title={<span className="text-gray-600">Revenue</span>} 
            prefix="₹" 
            value={stats.revenue} 
            precision={2} 
            valueStyle={{ color: '#8b5cf6', fontSize: '24px' }}
          />
        </div>
      </div>
      
      {/* Recent Clients */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4 text-gray-800">Recent Clients</h4>
        <Table 
          dataSource={clients.slice(0, 5)} 
          columns={clientColumns} 
          rowKey="uniqueId"
          loading={loading}
          pagination={false}
          className="w-full custom-table"
        />
      </div>
      
      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Clients */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h4 className="text-lg font-medium mb-4 text-gray-800">Active Clients (with ongoing orders)</h4>
          <Table 
            dataSource={clients.filter(c => {
              const orders = ordersToArray(c.orders);
              return orders.some(o => o?.status === 'ongoing');
            })} 
            columns={clientColumns}
            rowKey="uniqueId"
            loading={loading}
            pagination={{ pageSize: 3 }}
            className="w-full custom-table"
          />
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h4 className="text-lg font-medium mb-4 text-gray-800">Recent Orders</h4>
          <Table 
            dataSource={clients.flatMap(client => {
              const orders = ordersToArray(client.orders);
              return orders
                .map(order => ({ ...order, clientName: client.name }))
                .sort((a, b) => new Date(b?.orderDate || 0) - new Date(a?.orderDate || 0))
                .slice(0, 5);
            })}
            columns={[
              { 
                title: 'Client', 
                dataIndex: 'clientName', 
                key: 'clientName',
                render: (text) => <span className="font-medium">{text}</span>
              },
              ...orderColumns
            ]}
            rowKey="orderId"
            loading={loading}
            pagination={false}
            className="w-full custom-table"
          />
        </div>
      </div>
    </div>
  );

  const renderKYCForm = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800">Add New Client</h3>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <Form layout="vertical" form={kycForm} onFinish={handleKYCSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Form.Item 
              name="name" 
              label={<span className="font-medium text-gray-700">Full Name</span>}
              rules={[{ required: true, message: 'Please enter client name' }]}
              className="mb-0"
            >
              <Input 
                placeholder="Client name" 
                className="w-full border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>
            <Form.Item 
              name="phone" 
              label={<span className="font-medium text-gray-700">Phone</span>}
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^[0-9]{10,15}$/, message: 'Phone should be 10-15 digits' }
              ]}
              className="mb-0"
            >
              <Input 
                placeholder="10-15 digit phone number" 
                className="w-full border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>
          </div>
          
          <Form.Item 
            name="address" 
            label={<span className="font-medium text-gray-700">Address</span>}
            rules={[{ required: true, message: 'Please enter address' }]}
            className="mb-4"
          >
            <Input.TextArea 
              rows={3} 
              className="w-full border-gray-300 hover:border-blue-400 focus:border-blue-500"
            />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Form.Item 
              name="gstNo" 
              label={<span className="font-medium text-gray-700">GST Number</span>}
              className="mb-0"
            >
              <Input 
                placeholder="Optional GST number" 
                className="w-full border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>
          </div>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded flex items-center"
          >
            Submit KYC
          </Button>
        </Form>
      </div>
    </div>
  );

  const renderOrderForm = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800">Create New Order</h3>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <Form layout="vertical" form={orderForm}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Form.Item 
              name="uniqueId"
              label={<span className="font-medium text-gray-700">Client</span>}
              rules={[{ required: true, message: 'Please select a client' }]}
              className="mb-0"
            >
              <Select
                showSearch
                placeholder="Select client"
                optionFilterProp="children"
                onChange={handleClientSelect}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                className="w-full border-gray-300 hover:border-blue-400"
                suffixIcon={<ChevronDown className="h-4 w-4 text-gray-500" />}
              >
                {clients.map(client => (
                  <Option key={client.uniqueId} value={client.uniqueId}>
                    {client.uniqueId}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {selectedClient && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <span className="font-medium text-gray-700">Client: </span>
                  <span className="text-gray-600">{selectedClient.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone: </span>
                  <span className="text-gray-600">{selectedClient.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">GST: </span>
                  <span className="text-gray-600">{selectedClient.gstNo || 'N/A'}</span>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Address: </span>
                <span className="text-gray-600">{selectedClient.address}</span>
              </div>
            </div>
          )}

          <div className="border-b border-gray-200 mb-6">
            <h4 className="text-lg font-medium text-gray-700">Order Items</h4>
          </div>
          
          {orderItems.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-1">
                  <Form.Item label={<span className="text-gray-700">SR No</span>} className="mb-0">
                    <InputNumber
                      value={item.srNo}
                      onChange={val => updateOrderItem(index, 'srNo', val)}
                      className="w-full border-gray-300 hover:border-blue-400"
                      min={0}
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-2">
                  <Form.Item 
                    label={<span className="text-gray-700">Style No</span>}
                    required
                    validateStatus={!item.styleNo?.trim() ? 'error' : ''}
                    help={!item.styleNo?.trim() ? 'Required' : ''}
                    className="mb-0"
                  >
                    <Input
                      value={item.styleNo}
                      onChange={e => updateOrderItem(index, 'styleNo', e.target.value)}
                      placeholder="Required"
                      className="w-full border-gray-300 hover:border-blue-400"
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-2">
                  <Form.Item label={<span className="text-gray-700">Clarity</span>} className="mb-0">
                    <Input
                      value={item.clarity}
                      onChange={e => updateOrderItem(index, 'clarity', e.target.value)}
                      className="w-full border-gray-300 hover:border-blue-400"
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <Form.Item label={<span className="text-gray-700">Gross WT</span>} className="mb-0">
                    <InputNumber
                      value={item.grossWeight}
                      onChange={val => updateOrderItem(index, 'grossWeight', val)}
                      className="w-full border-gray-300 hover:border-blue-400"
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <Form.Item label={<span className="text-gray-700">Net WT</span>} className="mb-0">
                    <InputNumber
                      value={item.netWeight}
                      onChange={val => updateOrderItem(index, 'netWeight', val)}
                      className="w-full border-gray-300 hover:border-blue-400"
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <Form.Item label={<span className="text-gray-700">DIA WT</span>} className="mb-0">
                    <InputNumber
                      value={item.diaWeight}
                      onChange={val => updateOrderItem(index, 'diaWeight', val)}
                      className="w-full border-gray-300 hover:border-blue-400"
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <Form.Item 
                    label={<span className="text-gray-700">PCS</span>}
                    required
                    validateStatus={!item.pcs || item.pcs < 1 ? 'error' : ''}
                    help={!item.pcs || item.pcs < 1 ? 'Must be ≥1' : ''}
                    className="mb-0"
                  >
                    <InputNumber
                      value={item.pcs}
                      onChange={val => updateOrderItem(index, 'pcs', val)}
                      className="w-full border-gray-300 hover:border-blue-400"
                      min={1}
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <Form.Item 
                    label={<span className="text-gray-700">Amount</span>}
                    required
                    validateStatus={!item.amount || item.amount <= 0 ? 'error' : ''}
                    help={!item.amount || item.amount <= 0 ? 'Must be >0' : ''}
                    className="mb-0"
                  >
                    <InputNumber
                      value={item.amount}
                      onChange={val => updateOrderItem(index, 'amount', val)}
                      className="w-full border-gray-300 hover:border-blue-400"
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </div>
                <div className="md:col-span-1 flex items-end justify-center">
                  <Button
                    danger
                    icon={<Minus className="h-4 w-4" />}
                    onClick={() => removeOrderItem(index)}
                    className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  />
                </div>
              </div>
              
              <Form.Item label={<span className="text-gray-700">Description</span>} className="mb-0">
                <Input.TextArea
                  value={item.description}
                  onChange={e => updateOrderItem(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full border-gray-300 hover:border-blue-400"
                />
              </Form.Item>
            </div>
          ))}
          
          <Button
            type="dashed"
            onClick={addOrderItem}
            icon={<Plus className="h-4 w-4" />}
            className="mb-6 flex items-center border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          >
            Add Item
          </Button>
          
          <Button 
            type="primary" 
            onClick={handleOrderSubmit}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded flex items-center"
          >
            Create Order
          </Button>
        </Form>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800">Order History</h3>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Select
            className="w-full border-gray-300 hover:border-blue-400"
            placeholder="Select client"
            value={selectedClient?.uniqueId}
            onChange={uniqueId => {
              handleClientSelect(uniqueId);
              fetchOrderHistory(uniqueId);
            }}
            showSearch
            optionFilterProp="children"
            suffixIcon={<ChevronDown className="h-4 w-4 text-gray-500" />}
          >
            {clients.map(client => (
              <Option key={client.uniqueId} value={client.uniqueId}>
                {client.uniqueId} - {client.name}
              </Option>
            ))}
          </Select>
        </div>

        {selectedClient && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-gray-700">Client: </span>
                <span className="text-gray-600">{selectedClient.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Unique ID: </span>
                <span className="text-gray-600">{selectedClient.uniqueId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone: </span>
                <span className="text-gray-600">{selectedClient.phone}</span>
              </div>
            </div>
          </div>
        )}

        {orderHistory.length > 0 ? (
          <Table
            columns={orderColumns}
            dataSource={orderHistory}
            rowKey="orderId"
            expandable={{
              expandedRowRender: order => (
                <Table
                  columns={orderItemColumns}
                  dataSource={order.orderItems || []}
                  rowKey={(record) => `${record.srNo}-${record.styleNo}`}
                  pagination={false}
                  className="w-full custom-table"
                />
              ),
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <ChevronDown 
                    className="h-4 w-4 text-gray-500 cursor-pointer" 
                    onClick={e => onExpand(record, e)}
                  />
                ) : (
                  <ChevronRight 
                    className="h-4 w-4 text-gray-500 cursor-pointer" 
                    onClick={e => onExpand(record, e)}
                  />
                ),
              rowExpandable: order => order.orderItems?.length > 0
            }}
            className="w-full custom-table"
          />
        ) : (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-600">
              {selectedClient ? 
                'No orders found for selected client' : 
                'Select a client to view order history'}
            </p>
          </div>
        )}
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
      <div className="w-64 bg-gray-800 text-white flex-shrink-0">
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <h4 className="text-lg font-semibold text-gray-800">Sales Dashboard</h4>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5 mr-2" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow p-6 min-h-[calc(100vh-8rem)] border border-gray-200">
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