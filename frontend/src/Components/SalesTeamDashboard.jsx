import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Card, Table, Form, Input, Button, message, Space,
  Typography, Spin, Row, Col, Statistic, Divider, InputNumber, Select, Tag, DatePicker
} from 'antd';
import {
  DashboardOutlined, UserOutlined, ShoppingCartOutlined,
  HistoryOutlined, PlusOutlined, MinusOutlined, SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

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
  const [orderHistory, setOrderHistory] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalOrders: 0,
    revenue: 0
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`);
      
      // Ensure we're working with an array
      const clientsData = Array.isArray(res.data) ? res.data : 
                         (res.data.clients || res.data.data || []);
      
      setClients(clientsData);
      calculateStats(clientsData);
    } catch (err) {
      console.error('Fetch error:', err);
      message.error('Failed to fetch clients');
      setClients([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientsData) => {
    // Ensure we have an array to work with
    if (!Array.isArray(clientsData)) {
      console.error('Invalid clients data format:', clientsData);
      clientsData = [];
    }

    let totalOrders = 0;
    let revenue = 0;
    const activeClients = new Set();

    clientsData.forEach(client => {
      if (client?.orders) {
        // Handle both Map and array format for orders
        const orders = client.orders instanceof Map ? 
                     Array.from(client.orders.values()) : 
                     (Array.isArray(client.orders) ? client.orders : []);
        
        orders.forEach(order => {
          totalOrders++;
          if (order.status === 'ongoing') {
            activeClients.add(client._id);
          }
          if (order.orderItems) {
            order.orderItems.forEach(item => {
              revenue += item.amount || 0;
            });
          }
        });
      }
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
      
      // Ensure new client is added to array properly
      const newClient = res.data?.client || res.data;
      if (newClient) {
        setClients(prev => Array.isArray(prev) ? [...prev, newClient] : [newClient]);
      }
      
      message.success('Client added successfully');
      kycForm.resetFields();
    } catch (err) {
      console.error('KYC Error:', err);
      message.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

const handleOrderSubmit = async (values) => {
  try {
    setLoading(true);
    
    // Validate required fields before submission
    if (!selectedClient?._id || !values.memoId || !orderItems || orderItems.length === 0) {
      throw new Error('Client, memo ID, and at least one order item are required');
    }

    // Validate each order item
    const invalidItems = orderItems
      .map((item, index) => {
        const errors = [];
        if (!item.styleNo) errors.push("styleNo is required");
        if (!item.pcs || isNaN(item.pcs) )errors.push("valid pcs is required");
        if (item.pcs < 1) errors.push("pcs must be ≥1");
        if (!item.amount || isNaN(item.amount)) errors.push("valid amount is required");
        
        return errors.length > 0 ? { itemIndex: index, errors } : null;
      })
      .filter(Boolean);

    if (invalidItems.length > 0) {
      throw {
        response: {
          data: {
            error: "Invalid Order Items",
            message: "Some order items failed validation",
            invalidItems
          }
        }
      };
    }

    const payload = {
      clientId: selectedClient._id,
      memoId: values.memoId,
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
    
    const res = await axios.post(`${API_BASE_URL}/api/team/clients-order`, payload);
    
    message.success('Order created successfully');
    orderForm.resetFields();
    setOrderItems([{}]);
    setSelectedClient(null);
    fetchClients(); // Refresh data
    
    return res.data;
  } catch (err) {
    console.error('Order Error:', err);
    
    if (err.response?.data?.error === "Invalid Order Items") {
      message.error({
        content: (
          <div>
            <p>Some order items failed validation:</p>
            <ul>
              {err.response.data.invalidItems.map((item, idx) => (
                <li key={idx}>
                  Item {item.itemIndex + 1}: {item.errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        ),
        duration: 5
      });
    } else if (err.response?.data?.error === "Duplicate Memo") {
      message.error('An order with this memoId already exists for this client');
    } else if (err.response?.data?.error === "Not Found") {
      message.error('Client not found with the provided ID');
    } else {
      message.error(err.response?.data?.error || 'Order creation failed');
    }
    
    throw err;
  } finally {
    setLoading(false);
  }
};

  const fetchOrderHistory = async (clientId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/team/order-history`, {
        params: { 
          clientId, 
          from: dateRange[0]?.toISOString(), 
          to: dateRange[1]?.toISOString() 
        }
      });
      
      // Ensure we have valid order history data
      const historyData = res.data?.orders || res.data || [];
      setOrderHistory(Array.isArray(historyData) ? historyData : [historyData]);
    } catch (err) {
      console.error('History Error:', err);
      message.error('Failed to fetch order history');
      setOrderHistory(null);
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems(prev => Array.isArray(prev) ? [...prev, {}] : [{}]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(prev => {
      if (!Array.isArray(prev)) return [];
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems(prev => {
      if (!Array.isArray(prev)) return [{}];
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleClientSelect = (clientId) => {
    const client = Array.isArray(clients) ? clients.find(c => c._id === clientId) : null;
    setSelectedClient(client || null);
  };

  const clientColumns = [
    { title: 'Unique ID', dataIndex: 'uniqueId', key: 'uniqueId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
    { 
      title: 'Status', 
      key: 'status',
      render: (_, client) => {
        if (!client?.orders) return <Tag>No orders</Tag>;
        
        const orders = client.orders instanceof Map ? 
                     Array.from(client.orders.values()) : 
                     (Array.isArray(client.orders) ? client.orders : []);
        
        const statuses = orders.map(o => o?.status).filter(Boolean);
        
        if (statuses.includes('ongoing')) return <Tag color="blue">Active</Tag>;
        if (statuses.length > 0 && statuses.every(s => s === 'completed')) return <Tag color="green">Completed</Tag>;
        return <Tag color="orange">Mixed</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, client) => (
        <Button 
          size="small" 
          onClick={() => {
            setSelectedMenu('history');
            handleClientSelect(client._id);
            fetchOrderHistory(client._id);
          }}
        >
          View Orders
        </Button>
      )
    }
  ];

  const orderColumns = [
    { title: 'Memo ID', dataIndex: 'memoId', key: 'memoId' },
    { 
      title: 'Date', 
      dataIndex: 'orderDate', 
      key: 'date', 
      render: date => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A' 
    },
    { 
      title: 'Items', 
      dataIndex: 'orderItems', 
      key: 'items', 
      render: items => Array.isArray(items) ? items.length : 0 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: status => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status ? status.toUpperCase() : 'UNKNOWN'}
        </Tag>
      )
    },
    { 
      title: 'Amount', 
      key: 'amount', 
      render: (_, order) => (
        Array.isArray(order.orderItems) ? 
        order.orderItems.reduce((sum, item) => sum + (item.amount || 0), 0) :
        0
      )
    }
  ];

  const orderItemColumns = [
    { title: 'SR No', dataIndex: 'srNo', key: 'srNo' },
    { title: 'Style No', dataIndex: 'styleNo', key: 'styleNo' },
    { title: 'Clarity', dataIndex: 'clarity', key: 'clarity' },
    { title: 'Gross WT', dataIndex: 'grossWeight', key: 'grossWeight' },
    { title: 'Net WT', dataIndex: 'netWeight', key: 'netWeight' },
    { title: 'DIA WT', dataIndex: 'diaWeight', key: 'diaWeight' },
    { title: 'PCS', dataIndex: 'pcs', key: 'pcs' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const renderDashboard = () => (
    <>
      <Title level={3}>Sales Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Clients" value={stats.totalClients} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Active Clients" value={stats.activeClients} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Orders" value={stats.totalOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Revenue" prefix="₹" value={stats.revenue} precision={2} />
          </Card>
        </Col>
      </Row>
      
      <Card title="Recent Clients" style={{ marginBottom: 24 }}>
        <Table 
          dataSource={Array.isArray(clients) ? clients.slice(0, 5) : []} 
          columns={clientColumns} 
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Active Clients (with ongoing orders)">
            <Table 
              dataSource={
                Array.isArray(clients) ? 
                clients.filter(c => {
                  if (!c?.orders) return false;
                  const orders = c.orders instanceof Map ? 
                               Array.from(c.orders.values()) : 
                               (Array.isArray(c.orders) ? c.orders : []);
                  return orders.some(o => o?.status === 'ongoing');
                }) : 
                []
              }
              columns={clientColumns}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 3 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Orders">
            <Table 
              dataSource={
                Array.isArray(clients) ?
                clients.flatMap(client => {
                  if (!client?.orders) return [];
                  const orders = client.orders instanceof Map ? 
                                 Array.from(client.orders.values()) : 
                                 (Array.isArray(client.orders) ? client.orders : []);
                  return orders
                    .map(order => ({ ...order, clientName: client.name }))
                    .sort((a, b) => new Date(b?.orderDate || 0) - new Date(a?.orderDate || 0))
                    .slice(0, 5);
                }) :
                []
              }
              columns={[
                { title: 'Client', dataIndex: 'clientName', key: 'clientName' },
                ...orderColumns
              ]}
              rowKey="_id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderKYCForm = () => (
    <>
      <Title level={3}>Add New Client</Title>
      <Card>
        <Form layout="vertical" form={kycForm} onFinish={handleKYCSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Client name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true, pattern: /^[0-9]{10}$/ }]}>
                <Input placeholder="10-digit phone number" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gstNo" label="GST Number">
                <Input placeholder="Optional GST number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID">
                <Input placeholder="Optional memo reference" />
              </Form.Item>
            </Col>
          </Row>
          
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit KYC
          </Button>
        </Form>
      </Card>
    </>
  );

  const renderOrderForm = () => (
    <>
      <Title level={3}>Create New Order</Title>
      <Card>
        <Form layout="vertical" form={orderForm} onFinish={handleOrderSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="clientId" label="Client" rules={[{ required: true, message: 'Please select a client' }]}>
                <Select
                  showSearch
                  placeholder="Select client"
                  optionFilterProp="children"
                  onChange={handleClientSelect}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {Array.isArray(clients) && clients.map(client => (
                    <Option key={client._id} value={client._id}>
                      {client.uniqueId} - {client.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID" rules={[{ required: true, message: 'Memo ID is required' }]}>
                <Input placeholder="Enter memo reference" />
              </Form.Item>
            </Col>
          </Row>

          {selectedClient && (
            <Card type="inner" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Client: </Text>
                  <Text>{selectedClient.name}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Phone: </Text>
                  <Text>{selectedClient.phone}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>GST: </Text>
                  <Text>{selectedClient.gstNo || 'N/A'}</Text>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={24}>
                  <Text strong>Address: </Text>
                  <Text>{selectedClient.address}</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Divider orientation="left">Order Items</Divider>
          
          {Array.isArray(orderItems) && orderItems.map((item, index) => (
            <Card key={index} type="inner" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={2}>
                  <Form.Item label="SR No">
                    <InputNumber
                      value={item.srNo}
                      onChange={val => updateOrderItem(index, 'srNo', val)}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="Style No" required>
                    <Input
                      value={item.styleNo}
                      onChange={e => updateOrderItem(index, 'styleNo', e.target.value)}
                      placeholder="Required"
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="Clarity">
                    <Input
                      value={item.clarity}
                      onChange={e => updateOrderItem(index, 'clarity', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="Gross WT">
                    <InputNumber
                      value={item.grossWeight}
                      onChange={val => updateOrderItem(index, 'grossWeight', val)}
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="Net WT">
                    <InputNumber
                      value={item.netWeight}
                      onChange={val => updateOrderItem(index, 'netWeight', val)}
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="DIA WT">
                    <InputNumber
                      value={item.diaWeight}
                      onChange={val => updateOrderItem(index, 'diaWeight', val)}
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item label="PCS" required>
                    <InputNumber
                      value={item.pcs}
                      onChange={val => updateOrderItem(index, 'pcs', val)}
                      style={{ width: '100%' }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="Amount" required>
                    <InputNumber
                      value={item.amount}
                      onChange={val => updateOrderItem(index, 'amount', val)}
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                    />
                  </Form.Item>
                </Col>
                <Col span={1}>
                  <Button
                    danger
                    icon={<MinusOutlined />}
                    onClick={() => removeOrderItem(index)}
                    style={{ marginTop: 30 }}
                  />
                </Col>
              </Row>
              
              <Form.Item label="Description">
                <Input.TextArea
                  value={item.description}
                  onChange={e => updateOrderItem(index, 'description', e.target.value)}
                  rows={2}
                />
              </Form.Item>
            </Card>
          ))}
          
          <Button
            type="dashed"
            onClick={addOrderItem}
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
          >
            Add Item
          </Button>
          
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Order
          </Button>
        </Form>
      </Card>
    </>
  );

  const renderOrderHistory = () => (
    <>
      <Title level={3}>Order History</Title>
      <Card>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select client"
              value={selectedClient?._id}
              onChange={clientId => {
                handleClientSelect(clientId);
                fetchOrderHistory(clientId);
              }}
              showSearch
              optionFilterProp="children"
            >
              {clients.map(client => (
                <Option key={client._id} value={client._id}>
                  {client.uniqueId} - {client.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              disabledDate={current => current > dayjs()}
            />
          </Col>
        </Row>

        {selectedClient && (
          <Card type="inner" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Client: </Text>
                <Text>{selectedClient.name}</Text>
              </Col>
              <Col span={8}>
                <Text strong>Unique ID: </Text>
                <Text>{selectedClient.uniqueId}</Text>
              </Col>
              <Col span={8}>
                <Text strong>Phone: </Text>
                <Text>{selectedClient.phone}</Text>
              </Col>
            </Row>
          </Card>
        )}

        {orderHistory ? (
          orderHistory.length > 0 ? (
            orderHistory.map(order => (
              <Card
                key={order._id}
                title={`Order ${order.memoId || order._id.slice(-6)}`}
                extra={
                  <Tag color={order.status === 'completed' ? 'green' : 'blue'}>
                    {order.status.toUpperCase()}
                  </Tag>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Text strong>Date: </Text>
                    <Text>{dayjs(order.orderDate).format('DD/MM/YYYY HH:mm')}</Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Total Amount: </Text>
                    <Text>₹{order.orderItems.reduce((sum, item) => sum + (item.amount || 0), 0)}</Text>
                  </Col>
                </Row>

                <Table
                  columns={orderItemColumns}
                  dataSource={order.orderItems}
                  rowKey={(record) => `${record.srNo}-${record.styleNo}`}
                  pagination={false}
                />
              </Card>
            ))
          ) : (
            <Card>
              <Text>No orders found for selected client and date range</Text>
            </Card>
          )
        ) : (
          <Card>
            <Text>Select a client to view order history</Text>
          </Card>
        )}
      </Card>
    </>
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          SALES
        </div>
        <Menu
          theme="dark"
          selectedKeys={[selectedMenu]}
          mode="inline"
          onClick={({ key }) => setSelectedMenu(key)}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="kyc" icon={<UserOutlined />}>
            Client KYC
          </Menu.Item>
          <Menu.Item key="order" icon={<ShoppingCartOutlined />}>
            Create Order
          </Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>
            Order History
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
        }}>
          <Title level={4} style={{ margin: 0 }}>Sales Dashboard</Title>
          <Space>
            <Button icon={<SearchOutlined />}>Search</Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ 
            padding: 24, 
            background: '#fff', 
            minHeight: 'calc(100vh - 112px)',
            borderRadius: 4
          }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesDashboard;