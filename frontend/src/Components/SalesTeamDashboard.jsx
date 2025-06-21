import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Card, Table, Form, Input, Button, message, Space, 
  Typography, Spin, Row, Col, Statistic, Divider, InputNumber, Select
} from 'antd';
import {
  DashboardOutlined, UserAddOutlined, ShoppingCartOutlined, 
  HistoryOutlined, PlusOutlined, MinusOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const SalesTeamDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [orderItems, setOrderItems] = useState([{
    srNo: 1,
    styleNo: '',
    clarity: '',
    grossWeight: 0,
    netWeight: 0,
    diaWeight: 0,
    pcs: 0,
    amount: 0,
    description: ''
  }]);
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
      message.success('Client KYC created successfully');
      kycForm.resetFields();
    } catch (err) {
      console.error('KYC Error:', err);
      const errorMsg = err.response?.data?.message || 'Client KYC submission failed';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Filter out empty items and validate required fields
      const validOrderItems = orderItems.filter(item => 
        item.styleNo && item.grossWeight && item.pcs
      );
      
      if (validOrderItems.length === 0) {
        throw new Error('At least one valid order item is required');
      }

      const payload = {
        uniqueId: values.uniqueId,
        orders: validOrderItems,
        // memoId: values.memoId
      };
      
     const response = await axios.post(
  `${API_BASE_URL}/api/team/clients-order`, 
  payload,
  {
    headers: {
      'Content-Type': 'application/json',
      // Add authorization if needed
      // 'Authorization': `Bearer ${token}`
    }
  }
);
      message.success(response.data.message || 'Order submitted successfully');
      orderForm.resetFields();
      setOrderItems([{
        srNo: 1,
        styleNo: '',
        clarity: '',
        grossWeight: 0,
        netWeight: 0,
        diaWeight: 0,
        pcs: 0,
        amount: 0,
        description: ''
      }]);
      fetchClients(); // Refresh client list
    } catch (err) {
      console.error('Order submission error:', err);
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      'Order submission failed';
      message.error(errorMsg);
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
      message.error(err.response?.data?.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    const newSrNo = orderItems.length > 0 ? 
      Math.max(...orderItems.map(item => item.srNo)) + 1 : 1;
    
    setOrderItems([...orderItems, {
      srNo: newSrNo,
      styleNo: '',
      clarity: '',
      grossWeight: 0,
      netWeight: 0,
      diaWeight: 0,
      pcs: 0,
      amount: 0,
      description: ''
    }]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length <= 1) {
      message.warning('At least one order item is required');
      return;
    }
    
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
    { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
    { 
      title: 'Orders', 
      key: 'orders', 
      render: (_, record) => (
        <Text>{record.orders?.length || 0} orders</Text>
      ) 
    },
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
    { title: 'Status', 
      dataIndex: 'orderStatus', 
      key: 'orderStatus',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'ongoing' ? 'orange' : 'blue'
        }>
          {status}
        </Tag>
      )
    },
    { title: 'Date', 
      dataIndex: 'orderDate', 
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleDateString()
    },
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
              title="Active Orders" 
              value={
                clients.reduce((count, client) => 
                  count + (client.orders?.filter(o => o.orderStatus === 'ongoing').length || 0), 0)
              } 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Completed Orders" 
              value={
                clients.reduce((count, client) => 
                  count + (client.orders?.filter(o => o.orderStatus === 'completed').length || 0), 0)
              } 
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Recent Clients" style={{ marginBottom: 24 }}>
        <Table 
          dataSource={clients.slice(0, 5)} 
          columns={clientColumns} 
          rowKey="_id" 
          loading={loading} 
          pagination={false}
        />
      </Card>
    </>
  );

  const renderKYC = () => (
    <>
      <Title level={3}>Client KYC Registration</Title>
      <Card>
        <Form layout="vertical" form={kycForm} onFinish={handleKYCSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Full Name" 
                rules={[{ required: true, message: 'Please enter client name' }]}
              >
                <Input placeholder="Client full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="phone" 
                label="Phone Number" 
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                ]}
              >
                <Input placeholder="10-digit phone number" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="address" 
            label="Address" 
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea placeholder="Full address with city and state" rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="gstNo" 
                label="GST Number (optional)"
                rules={[
                  {
                    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: 'Invalid GST format'
                  }
                ]}
              >
                <Input placeholder="22AAAAA0000A1Z5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID (optional)">
                <Input placeholder="Optional memo reference" />
              </Form.Item>
            </Col>
          </Row>
          
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            Register Client
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
            <Form.Item 
  name="uniqueId" 
  label="Select Client" 
  rules={[{ required: true, message: 'Please select a client' }]}
>
  <Select
    showSearch
    placeholder="Search by Unique ID"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.value.toLowerCase().includes(input.toLowerCase()) // Case-insensitive search
    }
  >
    {clients.map(client => (
      <Option key={client.uniqueId} value={client.uniqueId}>
        {client.uniqueId} {/* Display exact case from database */}
      </Option>
    ))}
  </Select>
</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID (optional)">
                <Input placeholder="Optional memo reference" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Order Items</Divider>
          
          {orderItems.map((item, index) => (
            <Card 
              key={index} 
              size="small" 
              style={{ marginBottom: 16 }}
              title={`Item ${index + 1}`}
              extra={
                <Button 
                  danger 
                  icon={<MinusOutlined />} 
                  onClick={() => removeOrderItem(index)}
                  disabled={orderItems.length <= 1}
                />
              }
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Style No" required>
                    <Input 
                      value={item.styleNo} 
                      onChange={(e) => updateOrderItem(index, 'styleNo', e.target.value)} 
                      placeholder="Required"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Clarity">
                    <Input 
                      value={item.clarity} 
                      onChange={(e) => updateOrderItem(index, 'clarity', e.target.value)} 
                      placeholder="Diamond clarity"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="GR WT (grams)" required>
                    <InputNumber 
                      value={item.grossWeight} 
                      onChange={(value) => updateOrderItem(index, 'grossWeight', value)} 
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="NT WT (grams)">
                    <InputNumber 
                      value={item.netWeight} 
                      onChange={(value) => updateOrderItem(index, 'netWeight', value)} 
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="DIA WT (carats)">
                    <InputNumber 
                      value={item.diaWeight} 
                      onChange={(value) => updateOrderItem(index, 'diaWeight', value)} 
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Pieces" required>
                    <InputNumber 
                      value={item.pcs} 
                      onChange={(value) => updateOrderItem(index, 'pcs', value)} 
                      style={{ width: '100%' }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Amount (₹)">
                    <InputNumber 
                      value={item.amount} 
                      onChange={(value) => updateOrderItem(index, 'amount', value)} 
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Status">
                    <Select
                      value={item.orderStatus || 'received'}
                      onChange={(value) => updateOrderItem(index, 'orderStatus', value)}
                      style={{ width: '100%' }}
                    >
                      <Option value="received">Received</Option>
                      <Option value="ongoing">Ongoing</Option>
                      <Option value="completed">Completed</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Description">
                <Input.TextArea 
                  value={item.description} 
                  onChange={(e) => updateOrderItem(index, 'description', e.target.value)} 
                  rows={2}
                  placeholder="Additional details about this item"
                />
              </Form.Item>
            </Card>
          ))}
          
          <Button 
            type="dashed" 
            onClick={addOrderItem} 
            icon={<PlusOutlined />}
            style={{ width: '100%', marginBottom: 16 }}
          >
            Add Another Item
          </Button>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            size="large"
            style={{ width: '100%' }}
          >
            Submit Order
          </Button>
        </Form>
      </Card>
    </>
  );

  const renderOrderHistory = () => (
    <>
      <Title level={3}>Order History</Title>
      <Card>
        <Form layout="inline" onFinish={handleFetchOrderHistory}>
          <Form.Item 
            name="uniqueId" 
            label="Select Client" 
            rules={[{ required: true, message: 'Please select a client' }]}
          >
            <Select
              showSearch
              style={{ width: 300 }}
              placeholder="Search client by name or ID"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {clients.map(client => (
                <Option key={client.uniqueId} value={client.uniqueId}>
                  {client.name} ({client.uniqueId})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Search Orders
          </Button>
        </Form>
        
        {orderHistory && (
          <div style={{ marginTop: 24 }}>
            <Card title="Client Information" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Client: </Text>
                  <Text>{orderHistory.client.name}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Unique ID: </Text>
                  <Text>{orderHistory.client.uniqueId}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Phone: </Text>
                  <Text>{orderHistory.client.phone}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text strong>Address: </Text>
                  <Text>{orderHistory.client.address}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>GST No: </Text>
                  <Text>{orderHistory.client.gstNo || 'N/A'}</Text>
                </Col>
              </Row>
            </Card>
            
            <Table
              columns={orderHistoryColumns}
              dataSource={orderHistory.orders}
              rowKey="srNo"
              bordered
              pagination={{ pageSize: 10 }}
              summary={pageData => {
                const totalAmount = pageData.reduce((sum, item) => sum + (item.amount || 0), 0);
                const totalPcs = pageData.reduce((sum, item) => sum + (item.pcs || 0), 0);
                
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6}>
                        <Text strong>Totals</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong>{totalPcs}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <Text strong>₹{totalAmount.toFixed(2)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} colSpan={3} />
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
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
      default: return renderDashboard();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        width={250}
        breakpoint="lg"
        collapsedWidth="80"
      >
        <div className="logo" style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.1)',
          marginBottom: 16
        }}>
          {collapsed ? 'ST' : 'Sales Team'}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[selectedMenu]}
          mode="inline" 
          onClick={(e) => setSelectedMenu(e.key)}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="kyc" icon={<UserAddOutlined />}>
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
          padding: 0, 
          paddingLeft: 24,
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {selectedMenu === 'dashboard' && 'Sales Dashboard'}
            {selectedMenu === 'kyc' && 'Client KYC Registration'}
            {selectedMenu === 'order' && 'Create New Order'}
            {selectedMenu === 'history' && 'Order History'}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ 
            padding: 24, 
            background: '#fff', 
            minHeight: 'calc(100vh - 112px)',
            borderRadius: 4
          }}>
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 300 
              }}>
                <Spin size="large" />
              </div>
            ) : renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesTeamDashboard;