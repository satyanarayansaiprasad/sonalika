import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message, Table } from 'antd';
import axios from 'axios';
import {
  DashboardOutlined,
  DatabaseOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingOutlined,
  SketchOutlined
} from '@ant-design/icons';

const { Option } = Select;

// Get base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Size data (as provided)
const sizeData = {
  'NECKLACE': {
    types: ['Length'],
    values: {
      'Length': [
        { value: '36cm', description: '14"' },
        { value: '41cm', description: '16"' },
        { value: '46cm', description: '18"' },
        { value: '51cm', description: '20"' },
        { value: '61cm', description: '24"' },
        { value: '76cm', description: '30"' },
        { value: '84cm', description: '33"' }
      ]
    }
  },
  'LADIES BRACELET': {
    types: ['Size'],
    values: {
      'Size': [
        { value: 'S', description: '14.0-15.4 cm / 5.51-6.06 inch' },
        { value: 'M', description: '15.5-17.4 cm / 6.07-6.85 inch' },
        { value: 'L', description: '17.5-19.4 cm / 6.86-7.64 inch' },
        { value: 'XL', description: '19.5-21.4 cm / 7.65-8.43 inch' },
        { value: 'XXL', description: '21.5-23.4 cm / 8.44-9.21 inch' }
      ]
    }
  },
  'LADIES BANGLE': {
    types: ['Diameter', 'Circumference'],
    values: {
      'Diameter': [
        { value: '2.2', description: '2.125 inches / 5.4 cm' },
        { value: '2.4', description: '2.25 inches / 5.7 cm' },
        { value: '2.6', description: '2.375 inches / 6 cm' },
        { value: '2.8', description: '2.5 inches / 6.5 cm' },
        { value: '2.10', description: '2.625 inches / 6.7 cm' },
        { value: '2.12', description: '2.75 inches / 7 cm' }
      ],
      'Circumference': [
        { value: '6.67', description: '6.67 inches' },
        { value: '7.06', description: '7.06 inches' },
        { value: '7.46', description: '7.46 inches' },
        { value: '7.85', description: '7.85 inches' },
        { value: '8.24', description: '8.24 inches' },
        { value: '8.64', description: '8.64 inches' }
      ]
    }
  },
  'LADIES RING': {
    types: ['Size'],
    values: {
      'Size': [
        { value: '1', description: '13mm' },
        { value: '2', description: '13.3mm' },
        { value: '3', description: '13.6mm' },
        { value: '4', description: '14mm' },
        { value: '5', description: '14.3mm' },
        { value: '6', description: '14.6mm' },
        { value: '7', description: '14.9mm' },
        { value: '8', description: '15.3mm' },
        { value: '9', description: '15.6mm' },
        { value: '10', description: '16mm' },
        { value: '11', description: '16.2mm' },
        { value: '12', description: '16.5mm' },
        { value: '13', description: '16.8mm' },
        { value: '14', description: '17.2mm' },
        { value: '15', description: '17.4mm' },
        { value: '16', description: '17.8mm' },
        { value: '17', description: '18.1mm' },
        { value: '18', description: '18.5mm' },
        { value: '19', description: '18.8mm' },
        { value: '20', description: '19.2mm' },
        { value: '21', description: '19.5mm' },
        { value: '22', description: '19.8mm' },
        { value: '23', description: '20mm' },
        { value: '24', description: '20.4mm' }
      ]
    }
  },
  'GENTS RING': {
    types: ['Size'],
    values: {
      'Size': [
        { value: '10', description: '16mm' },
        { value: '11', description: '16.2mm' },
        { value: '12', description: '16.5mm' },
        { value: '13', description: '16.8mm' },
        { value: '14', description: '17.2mm' },
        { value: '15', description: '17.4mm' },
        { value: '16', description: '17.8mm' },
        { value: '17', description: '18.1mm' },
        { value: '18', description: '18.5mm' },
        { value: '19', description: '18.8mm' },
        { value: '20', description: '19.2mm' },
        { value: '21', description: '19.5mm' },
        { value: '22', description: '19.8mm' },
        { value: '23', description: '20mm' },
        { value: '24', description: '20.4mm' },
        { value: '25', description: '20.8mm' },
        { value: '26', description: '21.2mm' },
        { value: '27', description: '21.6mm' },
        { value: '28', description: '22mm' }
      ]
    }
  },
  'EARRING': {
    types: ['Size'],
    values: {
      'Size': [
        { value: 'Small', description: 'Up to 10mm' },
        { value: 'Medium', description: '10-15mm' },
        { value: 'Large', description: '15-20mm' },
        { value: 'Extra Large', description: '20mm+' }
      ]
    }
  },
  'PENDANT': {
    types: ['Size'],
    values: {
      'Size': [
        { value: 'Small', description: 'Up to 15mm' },
        { value: 'Medium', description: '15-25mm' },
        { value: 'Large', description: '25-35mm' },
        { value: 'Extra Large', description: '35mm+' }
      ]
    }
  }
};

const ProductionDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [masterType, setMasterType] = useState(null);
  const [designItems, setDesignItems] = useState([]);
  const [form] = Form.useForm();
  const [categories] = useState(Object.keys(sizeData));
  const [sizeTypes, setSizeTypes] = useState([]);
  const [sizeValues, setSizeValues] = useState([]);
  const [productMasters, setProductMasters] = useState([]);
  const [designMasters, setDesignMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSerialNumbers, setProductSerialNumbers] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllProductMasters();
    fetchAllDesignMasters();
  }, []);

  // Fetch product serial numbers when product masters load
  useEffect(() => {
    if (productMasters.length > 0) {
      setProductSerialNumbers(
        productMasters.map(pm => ({
          value: pm.serialNumber,
          label: pm.serialNumber
        }))
      );
    }
  }, [productMasters]);

  const fetchAllProductMasters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllProductMasters`);
      setProductMasters(response.data.data);
    } catch (error) {
      message.error('Failed to fetch product masters');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDesignMasters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllDesignMasters`);
      setDesignMasters(response.data.data);
    } catch (error) {
      message.error('Failed to fetch design masters');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change to update size types
  const handleCategoryChange = (value) => {
    const types = sizeData[value]?.types || [];
    setSizeTypes(types);
    form.setFieldsValue({ sizeType: undefined, sizeValue: undefined });
    setSizeValues([]);
  };

  // Handle size type change to update size values
  const handleSizeTypeChange = (value, category) => {
    const values = sizeData[category]?.values[value] || [];
    setSizeValues(values);
    form.setFieldsValue({ sizeValue: undefined });
  };

  // Add new design item
  const addDesignItem = () => {
    setDesignItems([...designItems, { 
      id: Date.now(), // Using timestamp for unique ID
      grossWt: '', 
      netWt: '', 
      diaWt: '', 
      diaPcs: '', 
      clarity: 'vvs', 
      color: 'e-f' 
    }]);
  };

  // Remove design item
  const removeDesignItem = (id) => {
    setDesignItems(designItems.filter(item => item.id !== id));
  };

  // Handle design item change
  const handleDesignItemChange = (id, field, value) => {
    setDesignItems(designItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Submit form for Product Master
  const onFinishProductMaster = async (values) => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createProductMaster`,
        {
          category: values.category,
          sizeType: values.sizeType,
          sizeValue: values.sizeValue,
          description: values.description
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      message.success('Product Master created successfully!');
      form.resetFields();
      fetchAllProductMasters();
    } catch (error) {
      message.error(`Failed to create product master: ${error.response?.data?.message || error.message}`);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit form for Design Master
  const onFinishDesignMaster = async (values) => {
    try {
      setLoading(true);

      if (designItems.length === 0) {
        throw new Error('Please add at least one design item');
      }

      // For simplicity, taking the first design item
      const designItem = designItems[0];
      
      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createDesignMaster`,
        {
          serialNumber: values.serialNumber,
          grossWt: designItem.grossWt,
          netWt: designItem.netWt,
          diaWt: designItem.diaWt,
          diaPcs: designItem.diaPcs,
          clarity: designItem.clarity,
          color: designItem.color
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      message.success('Design Master created successfully!');
      form.resetFields();
      setDesignItems([]);
      fetchAllDesignMasters();
    } catch (error) {
      message.error(`Failed to create design master: ${error.response?.data?.message || error.message}`);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4 text-xl font-bold">Production Dashboard</div>
        <nav className="mt-6">
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeMenu === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <DashboardOutlined className="mr-3" />
            <span>Dashboard</span>
          </div>
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeMenu === 'master' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            onClick={() => setActiveMenu('master')}
          >
            <DatabaseOutlined className="mr-3" />
            <span>Master Data</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeMenu === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Production Dashboard</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <ShoppingOutlined className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-gray-500">Product Masters</h3>
                      <p className="text-2xl font-bold">{productMasters.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                      <SketchOutlined className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-gray-500">Design Masters</h3>
                      <p className="text-2xl font-bold">{designMasters.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-600">No recent activity to display</p>
              </div>
            </div>
          )}

          {activeMenu === 'master' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setMasterType('product')}
                  className={`px-4 py-2 rounded-lg flex items-center ${masterType === 'product' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <ShoppingOutlined className="mr-2" />
                  Product Master
                </button>
                <button
                  onClick={() => setMasterType('design')}
                  className={`px-4 py-2 rounded-lg flex items-center ${masterType === 'design' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <SketchOutlined className="mr-2" />
                  Design Master
                </button>
              </div>

              {masterType === 'product' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Create Product Master</h2>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishProductMaster}
                    autoComplete="off"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: 'Please select category' }]}
                      >
                        <Select 
                          placeholder="Select category" 
                          onChange={handleCategoryChange}
                          className="w-full"
                        >
                          {categories.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Size Type"
                        name="sizeType"
                        rules={[{ required: true, message: 'Please select size type' }]}
                      >
                        <Select 
                          placeholder="Select size type" 
                          onChange={(value) => handleSizeTypeChange(value, form.getFieldValue('category'))}
                          disabled={!form.getFieldValue('category')}
                          className="w-full"
                        >
                          {sizeTypes.map(type => (
                            <Option key={type} value={type}>{type}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Size Value"
                        name="sizeValue"
                        rules={[{ required: true, message: 'Please select size value' }]}
                      >
                        <Select 
                          placeholder="Select size value" 
                          disabled={!form.getFieldValue('sizeType')}
                          className="w-full"
                        >
                          {sizeValues.map((item, index) => (
                            <Option key={index} value={item.value}>
                              {item.value} - {item.description}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    
                    <Form.Item
                      label="Description"
                      name="description"
                      rules={[{ required: true, message: 'Please enter description' }]}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                    
                    <Form.Item>
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Create Product Master'}
                      </button>
                    </Form.Item>
                  </Form>

                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Product Master Records</h2>
                    <Table 
                      dataSource={productMasters}
                      columns={[
                        { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber' },
                        { title: 'Category', dataIndex: 'category', key: 'category' },
                        { title: 'Size Type', dataIndex: 'sizeType', key: 'sizeType' },
                        { title: 'Size Value', dataIndex: 'sizeValue', key: 'sizeValue' },
                        { title: 'Description', dataIndex: 'description', key: 'description' },
                      ]}
                      rowKey="_id"
                      loading={loading}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              {masterType === 'design' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Create Design Master</h2>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishDesignMaster}
                    autoComplete="off"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        label="Product Serial Number"
                        name="serialNumber"
                        rules={[{ required: true, message: 'Please select product serial number' }]}
                      >
                        <Select 
                          placeholder="Select product serial number"
                          options={productSerialNumbers}
                          showSearch
                          optionFilterProp="label"
                          className="w-full"
                        />
                      </Form.Item>
                    </div>

                    <div className="mb-4">
                      <button 
                        type="button" 
                        onClick={addDesignItem}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                      >
                        <PlusOutlined className="mr-2" />
                        Add Design Item
                      </button>
                    </div>
                    
                    {designItems.map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Design Item #{designItems.indexOf(item) + 1}</h4>
                          <button 
                            onClick={() => removeDesignItem(item.id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <MinusOutlined className="mr-1" />
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Form.Item label="Gross Weight">
                            <Input 
                              value={item.grossWt}
                              onChange={(e) => handleDesignItemChange(item.id, 'grossWt', e.target.value)}
                              className="w-full"
                            />
                          </Form.Item>
                          
                          <Form.Item label="Net Weight">
                            <Input 
                              value={item.netWt}
                              onChange={(e) => handleDesignItemChange(item.id, 'netWt', e.target.value)}
                              className="w-full"
                            />
                          </Form.Item>
                          
                          <Form.Item label="Diamond Weight">
                            <Input 
                              value={item.diaWt}
                              onChange={(e) => handleDesignItemChange(item.id, 'diaWt', e.target.value)}
                              className="w-full"
                            />
                          </Form.Item>
                          
                          <Form.Item label="Diamond Pieces">
                            <Input 
                              value={item.diaPcs}
                              onChange={(e) => handleDesignItemChange(item.id, 'diaPcs', e.target.value)}
                              className="w-full"
                            />
                          </Form.Item>
                          
                          <Form.Item label="Clarity">
                            <Select
                              value={item.clarity}
                              onChange={(value) => handleDesignItemChange(item.id, 'clarity', value)}
                              className="w-full"
                            >
                              <Option value="vvs">VVS</Option>
                              <Option value="vs">VS</Option>
                              <Option value="si">SI</Option>
                              <Option value="i">I</Option>
                            </Select>
                          </Form.Item>
                          
                          <Form.Item label="Color">
                            <Select
                              value={item.color}
                              onChange={(value) => handleDesignItemChange(item.id, 'color', value)}
                              className="w-full"
                            >
                              <Option value="d-f">D-F</Option>
                              <Option value="g-h">G-H</Option>
                              <Option value="i-j">I-J</Option>
                              <Option value="k-l">K-L</Option>
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    ))}
                    
                    <Form.Item>
                      <button 
                        type="submit" 
                        className={`px-4 py-2 rounded-lg ${designItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition`}
                        disabled={designItems.length === 0 || loading}
                      >
                        {loading ? 'Processing...' : 'Create Design Master'}
                      </button>
                    </Form.Item>
                  </Form>

                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Design Master Records</h2>
                    <Table 
                      dataSource={designMasters}
                      columns={[
                        { title: 'Product Serial', dataIndex: 'serialNumber', key: 'serialNumber' },
                        { title: 'Style Number', dataIndex: 'styleNumber', key: 'styleNumber' },
                        { title: 'Gross Weight', dataIndex: 'grossWt', key: 'grossWt' },
                        { title: 'Net Weight', dataIndex: 'netWt', key: 'netWt' },
                        { title: 'Diamond Weight', dataIndex: 'diaWt', key: 'diaWt' },
                        { title: 'Diamond Pieces', dataIndex: 'diaPcs', key: 'diaPcs' },
                      ]}
                      rowKey="_id"
                      loading={loading}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;