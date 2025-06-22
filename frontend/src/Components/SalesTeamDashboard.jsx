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
    if (orders instanceof Map) return Array.from(orders.values());
    if (Array.isArray(orders)) return orders;
    return Object.values(orders);
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
      fetchClients(); // Refresh client list
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
        params: { 
          uniqueId, 
          from: dateRange[0]?.toISOString(), 
          to: dateRange[1]?.toISOString() 
        }
      });
      
      const clientData = res.data?.data || res.data;
      const historyData = ordersToArray(clientData?.orders);
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
    { title: 'Unique ID', dataIndex: 'uniqueId', key: 'uniqueId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
    { 
      title: 'Status', 
      key: 'status',
      render: (_, client) => {
        const orders = ordersToArray(client.orders);
        if (orders.length === 0) return <Tag>No orders</Tag>;
        
        const statuses = orders.map(o => o?.status).filter(Boolean);
        
        if (statuses.includes('ongoing')) return <Tag color="blue">Active</Tag>;
        if (statuses.every(s => s === 'completed')) return <Tag color="green">Completed</Tag>;
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
      title: 'Date', 
      dataIndex: 'orderDate', 
      key: 'date', 
      render: date => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A' 
    },
    { 
      title: 'Items', 
      dataIndex: 'orderItems', 
      key: 'items', 
      render: items => items?.length || 0 
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
        order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
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
          dataSource={clients.slice(0, 5)} 
          columns={clientColumns} 
          rowKey="uniqueId"
          loading={loading}
          pagination={false}
        />
      </Card>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Active Clients (with ongoing orders)">
            <Table 
              dataSource={clients.filter(c => {
                const orders = ordersToArray(c.orders);
                return orders.some(o => o?.status === 'ongoing');
              })} 
              columns={clientColumns}
              rowKey="uniqueId"
              loading={loading}
              pagination={{ pageSize: 3 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Orders">
            <Table 
              dataSource={clients.flatMap(client => {
                const orders = ordersToArray(client.orders);
                return orders
                  .map(order => ({ ...order, clientName: client.name }))
                  .sort((a, b) => new Date(b?.orderDate || 0) - new Date(a?.orderDate || 0))
                  .slice(0, 5);
              })}
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
              <Form.Item 
                name="name" 
                label="Full Name" 
                rules={[{ required: true, message: 'Please enter client name' }]}
              >
                <Input placeholder="Client name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="phone" 
                label="Phone" 
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9]{10,15}$/, message: 'Phone should be 10-15 digits' }
                ]}
              >
                <Input placeholder="10-15 digit phone number" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="address" 
            label="Address" 
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gstNo" label="GST Number">
                <Input placeholder="Optional GST number" />
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
        <Form layout="vertical" form={orderForm}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="uniqueId"
                label="Client" 
                rules={[{ required: true, message: 'Please select a client' }]}
              >
                <Select
                  showSearch
                  placeholder="Select client"
                  optionFilterProp="children"
                  onChange={handleClientSelect}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {clients.map(client => (
                    <Option key={client.uniqueId} value={client.uniqueId}>
                      {client.uniqueId} 
                    </Option>
                  ))}
                </Select>
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
          
          {orderItems.map((item, index) => (
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
                  <Form.Item 
                    label="Style No" 
                    required
                    validateStatus={!item.styleNo?.trim() ? 'error' : ''}
                    help={!item.styleNo?.trim() ? 'Required' : ''}
                  >
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
                  <Form.Item 
                    label="PCS" 
                    required
                    validateStatus={!item.pcs || item.pcs < 1 ? 'error' : ''}
                    help={!item.pcs || item.pcs < 1 ? 'Must be ≥1' : ''}
                  >
                    <InputNumber
                      value={item.pcs}
                      onChange={val => updateOrderItem(index, 'pcs', val)}
                      style={{ width: '100%' }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item 
                    label="Amount" 
                    required
                    validateStatus={!item.amount || item.amount <= 0 ? 'error' : ''}
                    help={!item.amount || item.amount <= 0 ? 'Must be >0' : ''}
                  >
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
          
          <Button 
            type="primary" 
            onClick={handleOrderSubmit}
            loading={loading}
          >
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
              value={selectedClient?.uniqueId}
              onChange={uniqueId => {
                handleClientSelect(uniqueId);
                fetchOrderHistory(uniqueId);
              }}
              showSearch
              optionFilterProp="children"
            >
              {clients.map(client => (
                <Option key={client.uniqueId} value={client.uniqueId}>
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

        {orderHistory.length > 0 ? (
          orderHistory.map(order => (
            <Card
              key={order._id}
              title={`Order ${order._id ? order._id.substring(0, 8) : ''}`}
              extra={
                <Tag color={order.status === 'completed' ? 'green' : 'blue'}>
                  {order.status?.toUpperCase() || 'UNKNOWN'}
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
                  <Text>₹{order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0)}</Text>
                </Col>
              </Row>

              <Table
                columns={orderItemColumns}
                dataSource={order.orderItems || []}
                rowKey={(record) => `${record.srNo}-${record.styleNo}`}
                pagination={false}
              />
            </Card>
          ))
        ) : (
          <Card>
            <Text>
              {selectedClient ? 
                'No orders found for selected client and date range' : 
                'Select a client to view order history'}
            </Text>
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