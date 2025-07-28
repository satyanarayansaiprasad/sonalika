import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Size data
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
  // ... (keep all your existing size data)
};

const ProductionDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [masterType, setMasterType] = useState(null);
  const [categories] = useState(Object.keys(sizeData));
  const [sizeTypes, setSizeTypes] = useState([]);
  const [sizeValues, setSizeValues] = useState([]);
  const [productMasters, setProductMasters] = useState([]);
  const [designMasters, setDesignMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSerialNumbers, setProductSerialNumbers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Form state
  const [productForm, setProductForm] = useState({
    category: '',
    sizeType: '',
    sizeValue: '',
    description: ''
  });
  
  const [designForm, setDesignForm] = useState({
    serialNumber: '',
    grossWt: '',
    netWt: '',
    diaWt: '',
    diaPcs: '',
    clarity: '',
    color: ''
  });

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
      alert('Failed to fetch product masters');
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
      alert('Failed to fetch design masters');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change to update size types
  const handleCategoryChange = (value) => {
    const types = sizeData[value]?.types || [];
    setSizeTypes(types);
    setProductForm({
      ...productForm,
      category: value,
      sizeType: '',
      sizeValue: ''
    });
    setSizeValues([]);
  };

  // Handle size type change to update size values
  const handleSizeTypeChange = (value, category) => {
    const values = sizeData[category]?.values[value] || [];
    setSizeValues(values);
    setProductForm({
      ...productForm,
      sizeType: value,
      sizeValue: ''
    });
  };

  // Submit form for Product Master
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category', productForm.category);
      formData.append('sizeType', productForm.sizeType);
      formData.append('sizeValue', productForm.sizeValue);
      formData.append('description', productForm.description);
      
      if (fileInputRef.current.files[0]) {
        formData.append('image', fileInputRef.current.files[0]);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createProductMaster`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Product Master created successfully!');
      setProductForm({
        category: '',
        sizeType: '',
        sizeValue: '',
        description: ''
      });
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchAllProductMasters();
    } catch (error) {
      alert(`Failed to create product master: ${error.response?.data?.message || error.message}`);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit form for Design Master
  const handleDesignSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createDesignMaster`,
        {
          serialNumber: designForm.serialNumber,
          grossWt: designForm.grossWt,
          netWt: designForm.netWt,
          diaWt: designForm.diaWt,
          diaPcs: designForm.diaPcs,
          clarity: designForm.clarity,
          color: designForm.color
        }
      );

      alert('Design Master created successfully!');
      setDesignForm({
        serialNumber: '',
        grossWt: '',
        netWt: '',
        diaWt: '',
        diaPcs: '',
        clarity: '',
        color: ''
      });
      fetchAllDesignMasters();
    } catch (error) {
      alert(`Failed to create design master: ${error.response?.data?.message || error.message}`);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div>
      <h1 className="text-2xl font-bold mb-6">Production Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <span className="text-xl">🛍️</span>
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
              <span className="text-xl">💎</span>
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
  );

  // Render Product Master Form
  const renderProductMasterForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Create Product Master</h2>
      <form onSubmit={handleProductSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={productForm.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={productForm.sizeType}
              onChange={(e) => handleSizeTypeChange(e.target.value, productForm.category)}
              disabled={!productForm.category}
              required
            >
              <option value="">Select size type</option>
              {sizeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size Value</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={productForm.sizeValue}
              onChange={(e) => setProductForm({...productForm, sizeValue: e.target.value})}
              disabled={!productForm.sizeType}
              required
            >
              <option value="">Select size value</option>
              {sizeValues.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.value} - {item.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="flex items-center">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="image-upload"
                required
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                Choose Image
              </label>
            </div>
            {previewImage && (
              <div className="ml-4">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded"
                />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload a high-quality image of the product (JPEG, PNG, etc.)
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            value={productForm.description}
            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
            required
          />
        </div>
        
        <div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Product Master'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Product Master Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productMasters.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.serialNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sizeType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sizeValue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt="Product" 
                        className="h-10 w-10 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Design Master Form
  const renderDesignMasterForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Create Design Master</h2>
      <form onSubmit={handleDesignSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Serial Number</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.serialNumber}
              onChange={(e) => setDesignForm({...designForm, serialNumber: e.target.value})}
              required
            >
              <option value="">Select product serial number</option>
              {productSerialNumbers.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Weight</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.grossWt}
              onChange={(e) => setDesignForm({...designForm, grossWt: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Net Weight</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.netWt}
              onChange={(e) => setDesignForm({...designForm, netWt: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Weight</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.diaWt}
              onChange={(e) => setDesignForm({...designForm, diaWt: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Pieces</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.diaPcs}
              onChange={(e) => setDesignForm({...designForm, diaPcs: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clarity</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.clarity}
              onChange={(e) => setDesignForm({...designForm, clarity: e.target.value})}
              required
            >
              <option value="">Select clarity</option>
              <option value="vvs">VVS</option>
              <option value="vs">VS</option>
              <option value="si">SI</option>
              <option value="i">I</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={designForm.color}
              onChange={(e) => setDesignForm({...designForm, color: e.target.value})}
              required
            >
              <option value="">Select color</option>
              <option value="d-f">D-F</option>
              <option value="g-h">G-H</option>
              <option value="i-j">I-J</option>
              <option value="k-l">K-L</option>
            </select>
          </div>
        </div>
        
        <div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Design Master'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Design Master Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Serial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond Pieces</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {designMasters.map((design) => (
                <tr key={design._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.serialNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.styleNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.grossWt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.netWt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.diaWt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{design.diaPcs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
            <span className="mr-3">📊</span>
            <span>Dashboard</span>
          </div>
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeMenu === 'master' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            onClick={() => setActiveMenu('master')}
          >
            <span className="mr-3">🗃️</span>
            <span>Master Data</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeMenu === 'dashboard' && renderDashboard()}

          {activeMenu === 'master' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setMasterType('product')}
                  className={`px-4 py-2 rounded-lg flex items-center ${masterType === 'product' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <span className="mr-2">🛍️</span>
                  Product Master
                </button>
                <button
                  onClick={() => setMasterType('design')}
                  className={`px-4 py-2 rounded-lg flex items-center ${masterType === 'design' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <span className="mr-2">💎</span>
                  Design Master
                </button>
              </div>

              {masterType === 'product' && renderProductMasterForm()}
              {masterType === 'design' && renderDesignMasterForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;