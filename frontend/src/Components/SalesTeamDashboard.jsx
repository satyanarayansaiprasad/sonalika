import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Card, Table, Form, Input, Button, message, Space, 
  Typography, Spin, Row, Col, Statistic, Divider, InputNumber
} from 'antd';
import {
  DashboardOutlined, UserAddOutlined, ShoppingCartOutlined, 
  HistoryOutlined, PlusOutlined, MinusOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const SalesTeamDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [orderItems, setOrderItems] = useState([{}]);
  const [orderHistory, setOrderHistory] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`);
      setClients(res.data.clients || []);
    } catch (err) {
      console.error('Fetch error:', err);
      message.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleKYCSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/team/client-kyc`, values);
      setClients(prev => [...prev, res.data.client]);
      message.success('KYC submitted successfully');
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
      const payload = {
        uniqueId: values.uniqueId,
        orderItems: orderItems.filter(item => item.styleNo), // filter out empty items
        orderStatus: 'ongoing',
        memoId: values.memoId
      };
      
      await axios.post(`${API_BASE_URL}/api/team/add-order`, payload);
      message.success('Order submitted successfully');
      orderForm.resetFields();
      setOrderItems([{}]);
    } catch (err) {
      console.error('Order Error:', err);
      message.error(err.response?.data?.error || 'Order submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOrderHistory = async (values) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/team/order-history`, {
        params: { uniqueId: values.uniqueId }
      });
      setOrderHistory(res.data);
    } catch (err) {
      console.error('History Error:', err);
      message.error('Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {}]);
  };

  const removeOrderItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const clientColumns = [
    { title: 'Unique ID', dataIndex: 'uniqueId', key: 'uniqueId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
    { title: 'Status', dataIndex: 'order', key: 'order' },
  ];

  const orderHistoryColumns = [
    { title: 'SR No', dataIndex: 'srNo', key: 'srNo' },
    { title: 'Style No', dataIndex: 'styleNo', key: 'styleNo' },
    { title: 'Clarity', dataIndex: 'clarity', key: 'clarity' },
    { title: 'GR WT', dataIndex: 'grossWeight', key: 'grossWeight' },
    { title: 'NT WT', dataIndex: 'netWeight', key: 'netWeight' },
    { title: 'DIA WT', dataIndex: 'diaWeight', key: 'diaWeight' },
    { title: 'PCS', dataIndex: 'pcs', key: 'pcs' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const renderDashboard = () => (
    <>
      <Title level={3}>Sales Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Clients" value={clients.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Ongoing Orders" 
              value={clients.filter(c => c.order === 'pending').length} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Completed Orders" 
              value={clients.filter(c => c.order === 'completed').length} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="All Clients" style={{ marginBottom: 24 }}>
        <Table 
          dataSource={clients} 
          columns={clientColumns} 
          rowKey="_id" 
          loading={loading} 
          pagination={{ pageSize: 5 }}
        />
      </Card>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Ongoing Orders">
            <Table 
              dataSource={clients.filter(c => c.order === 'pending')} 
              columns={clientColumns} 
              rowKey="_id" 
              loading={loading}
              pagination={{ pageSize: 3 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Completed Orders">
            <Table 
              dataSource={clients.filter(c => c.order === 'completed')} 
              columns={clientColumns} 
              rowKey="_id" 
              loading={loading}
              pagination={{ pageSize: 3 }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderKYC = () => (
    <>
      <Title level={3}>Submit Client KYC</Title>
      <Card>
        <Form layout="vertical" form={kycForm} onFinish={handleKYCSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Client Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input placeholder="Phone Number" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Address" rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gstNo" label="GST No" rules={[{ required: true }]}>
                <Input placeholder="GST Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID (optional)">
                <Input placeholder="Memo ID" />
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

  const renderOrder = () => (
    <>
      <Title level={3}>Create New Order</Title>
      <Card>
        <Form layout="vertical" form={orderForm} onFinish={handleOrderSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="uniqueId" label="Client Unique ID" rules={[{ required: true }]}>
                <Input placeholder="Client Unique ID (e.g., Sonalika001)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID (optional)">
                <Input placeholder="Memo ID" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Order Items</Divider>
          
          {orderItems.map((item, index) => (
            <div key={index} style={{ marginBottom: 16, border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
              <Row gutter={16}>
                <Col span={2}>
                  <Form.Item label="SR No">
                    <InputNumber 
                      value={item.srNo} 
                      onChange={(value) => updateOrderItem(index, 'srNo', value)} 
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="Style No">
                    <Input 
                      value={item.styleNo} 
                      onChange={(e) => updateOrderItem(index, 'styleNo', e.target.value)} 
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="Clarity">
                    <Input 
                      value={item.clarity} 
                      onChange={(e) => updateOrderItem(index, 'clarity', e.target.value)} 
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="GR WT">
                    <InputNumber 
                      value={item.grossWeight} 
                      onChange={(value) => updateOrderItem(index, 'grossWeight', value)} 
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="NT WT">
                    <InputNumber 
                      value={item.netWeight} 
                      onChange={(value) => updateOrderItem(index, 'netWeight', value)} 
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="DIA WT">
                    <InputNumber 
                      value={item.diaWeight} 
                      onChange={(value) => updateOrderItem(index, 'diaWeight', value)} 
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item label="PCS">
                    <InputNumber 
                      value={item.pcs} 
                      onChange={(value) => updateOrderItem(index, 'pcs', value)} 
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label="Amount">
                    <InputNumber 
                      value={item.amount} 
                      onChange={(value) => updateOrderItem(index, 'amount', value)} 
                      style={{ width: '100%' }}
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
                  onChange={(e) => updateOrderItem(index, 'description', e.target.value)} 
                  rows={2}
                />
              </Form.Item>
            </div>
          ))}
          
          <Button 
            type="dashed" 
            onClick={addOrderItem} 
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
          >
            Add Item
          </Button>
          
          <div>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Order
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );

  const renderOrderHistory = () => (
    <>
      <Title level={3}>Order History</Title>
      <Card>
        <Form layout="inline" onFinish={handleFetchOrderHistory}>
          <Form.Item name="uniqueId" label="Client Unique ID" rules={[{ required: true }]}>
            <Input placeholder="Enter Client Unique ID" style={{ width: 200 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Search
          </Button>
        </Form>
        
        {orderHistory && (
          <div style={{ marginTop: 24 }}>
            <Card>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Client: </Text>
                  <Text>{orderHistory.name}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Unique ID: </Text>
                  <Text>{orderHistory.uniqueId}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Phone: </Text>
                  <Text>{orderHistory.phone}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <Text strong>Memo ID: </Text>
                  <Text>{orderHistory.memoId || 'N/A'}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Status: </Text>
                  <Text>{orderHistory.orderStatus}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Order Date: </Text>
                  <Text>{new Date(orderHistory.orderDate).toLocaleString()}</Text>
                </Col>
              </Row>
            </Card>
            
            <Table
              columns={orderHistoryColumns}
              dataSource={orderHistory.orderItems}
              rowKey="srNo"
              style={{ marginTop: 16 }}
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Card>
    </>
  );

  const renderContent = () => {
    switch(selectedMenu) {
      case 'dashboard': return renderDashboard();
      case 'kyc': return renderKYC();
      case 'order': return renderOrder();
      case 'history': return renderOrderHistory();
      default: return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu 
          theme="dark" 
          defaultSelectedKeys={['dashboard']} 
          mode="inline" 
          onClick={(e) => setSelectedMenu(e.key)}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="kyc" icon={<UserAddOutlined />}>Client KYC</Menu.Item>
          <Menu.Item key="order" icon={<ShoppingCartOutlined />}>Create Order</Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>Order History</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, paddingLeft: 16 }}>
          <Title level={4} style={{ lineHeight: '64px' }}>Sales Team Dashboard</Title>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {loading ? <Spin size="large" /> : renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesTeamDashboard;