import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Card, Table, Form, Input, Button, message, Space, Typography, Spin
} from 'antd';
import {
  DashboardOutlined, UserAddOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const SalesTeamDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycForm] = Form.useForm();

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

  const clientColumns = [
    { title: 'Unique ID', dataIndex: 'uniqueId', key: 'uniqueId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'GST No', dataIndex: 'gstNo', key: 'gstNo' },
  ];

  const renderContent = () => {
    if (selectedMenu === 'dashboard') {
      return (
        <>
          <Title level={3}>Client Overview</Title>
          <Card style={{ marginBottom: 24 }}>
            <Table dataSource={clients} columns={clientColumns} rowKey="_id" loading={loading} />
          </Card>
        </>
      );
    }

    if (selectedMenu === 'kyc') {
      return (
        <>
          <Title level={3}>Submit Client KYC</Title>
          <Card>
            <Form layout="vertical" form={kycForm} onFinish={handleKYCSubmit}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Client Name" />
              </Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input placeholder="Phone Number" />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Address" />
              </Form.Item>
              <Form.Item name="gstNo" label="GST No" rules={[{ required: true }]}>
                <Input placeholder="GST Number" />
              </Form.Item>
              <Form.Item name="memoId" label="Memo ID (optional)">
                <Input placeholder="Memo ID" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit KYC
              </Button>
            </Form>
          </Card>
        </>
      );
    }

    return <div>Select a section from the sidebar</div>;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['dashboard']} mode="inline" onClick={(e) => setSelectedMenu(e.key)}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="kyc" icon={<UserAddOutlined />}>Client KYC</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
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
