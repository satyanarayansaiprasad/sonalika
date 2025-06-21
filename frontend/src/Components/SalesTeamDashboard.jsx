import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Card, Table, Form, Input, Button, message, Space, 
  Typography, Spin, Row, Col, Statistic, Divider, InputNumber, Select, Tag
} from 'antd';
import {
  DashboardOutlined, UserAddOutlined, ShoppingCartOutlined, 
  HistoryOutlined, PlusOutlined, MinusOutlined, DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Axios response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios Error Interceptor:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

const SalesTeamDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [orderItems, setOrderItems] = useState([{
    key: 1,
    styleNo: '',
    clarity: '',
    grossWeight: 0,
    netWeight: 0,
    diaWeight: 0,
    pcs: 1,
    amount: 0,
    description: '',
    orderStatus: 'ongoing'
  }]);
  const [orderHistory, setOrderHistory] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const columnHeaders = [
    'SR NO', 'STYLE NO', 'CLARITY', 'GR WT', 'NT WT', 'DIA WT', 'PCS', 'AMOUNT', 'DESCRIPTION', 'STATUS', 'ACTION'
  ];

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/get-clients`);
      setClients(res.data.clients || []);
    } catch (err) {
      console.error('Fetch clients error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
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
      console.error('KYC submission error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      const errorMsg = err.response?.data?.message || 'Client KYC submission failed';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validateOrderItems = (items) => {
    return items.every(item => {
      return item.styleNo && 
             Number(item.grossWeight) > 0 && 
             Number(item.pcs) > 0;
    });
  };

  const handleOrderSubmit = async (values) => {
    try {
      setLoading(true);

      const filteredOrderItems = orderItems.filter(
        item => item.styleNo && item.grossWeight && item.pcs
      );

      if (filteredOrderItems.length === 0) {
        throw new Error('At least one valid order item is required');
      }

      if (!validateOrderItems(filteredOrderItems)) {
        throw new Error('All order items must have Style No, Gross Weight > 0, and at least 1 piece');
      }

      const payload = {
        uniqueId: selectedClient.uniqueId,
        memoId: values.memoId || undefined, // Send undefined instead of empty string
        orderItems: filteredOrderItems.map(item => ({
          styleNo: item.styleNo,
          clarity: item.clarity || undefined,
          grossWeight: Number(item.grossWeight),
          netWeight: Number(item.netWeight) || undefined,
          diaWeight: Number(item.diaWeight) || undefined,
          pcs: Number(item.pcs),
          amount: Number(item.amount) || undefined,
          description: item.description || undefined,
          orderStatus: item.orderStatus || 'ongoing'
        }))
      };

      console.log('Order submission payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/api/team/clients-order`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      console.log('Order submission response:', response.data);

      message.success(response.data.message || 'Order submitted successfully');
      orderForm.resetFields();
      setOrderItems([{
        key: 1,
        styleNo: '',
        clarity: '',
        grossWeight: 0,
        netWeight: 0,
        diaWeight: 0,
        pcs: 1,
        amount: 0,
        description: '',
        orderStatus: 'ongoing'
      }]);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      console.error('Order submission error details:', {
        message: err.message,
        config: err.config,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });

      let errorMsg = 'Order submission failed';
      if (err.response) {
        errorMsg = err.response.data?.message || 
                  err.response.data?.error || 
                  `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMsg = 'No response received from server';
      } else {
        errorMsg = err.message;
      }

      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOrderHistory = async (values) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/team/order-history`, {
        params: { uniqueId: values.uniqueId },
        timeout: 10000
      });
      setOrderHistory(res.data);
    } catch (err) {
      console.error('Order history error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      message.error(err.response?.data?.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    const newKey = orderItems.length > 0 ? 
      Math.max(...orderItems.map(item => item.key)) + 1 : 1;
    
    setOrderItems([...orderItems, {
      key: newKey,
      styleNo: '',
      clarity: '',
      grossWeight: 0,
      netWeight: 0,
      diaWeight: 0,
      pcs: 1,
      amount: 0,
      description: '',
      orderStatus: 'ongoing'
    }]);
  };

  const removeOrderItem = (key) => {
    if (orderItems.length <= 1) {
      message.warning('At least one order item is required');
      return;
    }
    
    setOrderItems(orderItems.filter(item => item.key !== key));
  };

  const updateOrderItem = (key, field, value) => {
    setOrderItems(orderItems.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const handleClientSelect = (value) => {
    const client = clients.find(c => c.uniqueId === value);
    setSelectedClient(client);
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
        <Text>{record.orders?.size || 0} orders</Text>
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
    { 
      title: 'Status', 
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
    { 
      title: 'Date', 
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
                  count + (client.orders ? Array.from(client.orders.values()).filter(o => o.orderStatus === 'ongoing').length : 0), 0)
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
                  count + (client.orders ? Array.from(client.orders.values()).filter(o => o.orderStatus === 'completed').length : 0), 0)
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
                label="GST Number"
                rules={[
                  { required: true, message: 'Please enter GST number' },
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
            <Col span={12}>
              <Form.Item name="memoId" label="Memo ID (optional)">
                <Input placeholder="Optional memo reference" />
              </Form.Item>
            </Col>
          </Row>

          {selectedClient && (
            <Card type="inner" title="Client Details" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Name: </Text>
                  <Text>{selectedClient.name}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Phone: </Text>
                  <Text>{selectedClient.phone}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>GST No: </Text>
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
          
          <div style={{ overflowX: "auto" }}>
            <Row style={{ background: "#f0f2f5", padding: "10px", fontWeight: "bold", borderBottom: "1px solid #d9d9d9" }}>
              {columnHeaders.map((col, i) => (
                <Col key={i} span={col === "DESCRIPTION" ? 6 : 2} style={{ textAlign: "center" }}>{col}</Col>
              ))}
            </Row>

            {orderItems.map((item, index) => (
              <Row key={item.key} gutter={8} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", background: index % 2 === 0 ? "#fff" : "#fcfcfc" }}>
                <Col span={2} style={{ textAlign: "center" }}>
                  <Text>{index + 1}</Text>
                </Col>
                <Col span={2}>
                  <Input 
                    placeholder="Style No" 
                    value={item.styleNo} 
                    onChange={e => updateOrderItem(item.key, "styleNo", e.target.value)} 
                  />
                </Col>
                <Col span={2}>
                  <Input 
                    placeholder="Clarity" 
                    value={item.clarity} 
                    onChange={e => updateOrderItem(item.key, "clarity", e.target.value)} 
                  />
                </Col>
                <Col span={2}>
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    placeholder="GR WT" 
                    value={item.grossWeight} 
                    onChange={val => updateOrderItem(item.key, "grossWeight", val)} 
                    style={{ width: "100%" }} 
                  />
                </Col>
                <Col span={2}>
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    placeholder="NT WT" 
                    value={item.netWeight} 
                    onChange={val => updateOrderItem(item.key, "netWeight", val)} 
                    style={{ width: "100%" }} 
                  />
                </Col>
                <Col span={2}>
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    placeholder="DIA WT" 
                    value={item.diaWeight} 
                    onChange={val => updateOrderItem(item.key, "diaWeight", val)} 
                    style={{ width: "100%" }} 
                  />
                </Col>
                <Col span={2}>
                  <InputNumber 
                    min={1} 
                    placeholder="PCS" 
                    value={item.pcs} 
                    onChange={val => updateOrderItem(item.key, "pcs", val)} 
                    style={{ width: "100%" }} 
                  />
                </Col>
                <Col span={2}>
                  <InputNumber 
                    min={0} 
                    placeholder="Amount ₹" 
                    value={item.amount} 
                    onChange={val => updateOrderItem(item.key, "amount", val)} 
                    style={{ width: "100%" }} 
                  />
                </Col>
                <Col span={6}>
                  <Input 
                    placeholder="Description" 
                    value={item.description} 
                    onChange={e => updateOrderItem(item.key, "description", e.target.value)} 
                  />
                </Col>
                <Col span={2}>
                  <Select
                    value={item.orderStatus}
                    onChange={val => updateOrderItem(item.key, "orderStatus", val)}
                    style={{ width: "100%" }}
                    placeholder="Status"
                  >
                   
                    <Option value="ongoing">Ongoing</Option>
                    <Option value="completed">Completed</Option>
                  </Select>
                </Col>
                <Col span={2} style={{ textAlign: "center" }}>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => removeOrderItem(item.key)} 
                    disabled={orderItems.length === 1} 
                  />
                </Col>
              </Row>
            ))}
          </div>

          <Button
            type="dashed"
            onClick={addOrderItem}
            icon={<PlusOutlined />}
            style={{ marginTop: 16, width: "100%" }}
          >
            Add Another Item
          </Button>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            size="large"
            style={{ width: '100%', marginTop: 16 }}
            disabled={!selectedClient}
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
              dataSource={orderHistory.orders ? Array.from(orderHistory.orders.values()) : []}
              rowKey="styleNo"
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