import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Card, Form, Input, Button, message,
  Typography, Spin, Row, Col, Table, Tag
} from 'antd';
import {
  DashboardOutlined, UserAddOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const SalesTeamDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('kyc');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/team/get-clients`);
      setClients(res.data.clients || []);
    } catch (err) {
      console.error('Fetch clients error:', err);
      message.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/team/clients-kyc`, values);

      const newClient = res.data.data.client;

      setClients(prev => [...prev, newClient]);
      message.success('Client KYC created successfully!');
      message.info(`Generated Client ID: ${newClient.uniqueId}`);
      form.resetFields();
    } catch (err) {
      console.error('KYC submission error:', err);
      message.error(err.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const clientColumns = [
    {
      title: 'Client ID',
      dataIndex: 'uniqueId',
      key: 'uniqueId',
      render: (id) => <Tag color="blue">{id}</Tag>
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Active</Tag>
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          background: '#001529'
        }}>
          {collapsed ? 'JWL' : 'Jewelry CRM'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="kyc" icon={<UserAddOutlined />}>
            Client KYC
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: '100vh', background: '#fff' }}>
            {selectedMenu === 'kyc' ? (
              <>
                <Title level={3} style={{ marginBottom: 24 }}>
                  Client KYC Registration
                </Title>

                <Card>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleKYCSubmit}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="Full Name"
                          rules={[{ required: true, message: 'Please enter client name' }]}
                        >
                          <Input placeholder="Enter full name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="Phone Number"
                          rules={[
                            { required: true, message: 'Please enter phone number' },
                            { pattern: /^[0-9]{10}$/, message: 'Invalid phone number' }
                          ]}
                        >
                          <Input placeholder="10-digit mobile number" maxLength={10} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="address"
                      label="Full Address"
                      rules={[{ required: true, message: 'Please enter address' }]}
                    >
                      <Input.TextArea rows={3} placeholder="Complete address with city and PIN code" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="gstNo"
                          label="GST Number"
                          rules={[{ required: true, message: 'GST number is required' }]}
                        >
                          <Input placeholder="22ABCDE1234F1Z5" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                    >
                      Register Client
                    </Button>
                  </Form>
                </Card>

                <Card title="All Clients" style={{ marginTop: 24 }}>
                  <Table
                    columns={clientColumns}
                    dataSource={clients}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Title level={3}>Sales Dashboard</Title>
                <Text>Coming soon with order analytics</Text>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
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