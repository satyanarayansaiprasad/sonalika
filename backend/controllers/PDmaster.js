import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMenu, FiX, FiHome, FiDatabase, FiShoppingBag, FiPlus, FiAward, FiTrash2, FiCheckCircle } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const ProductionDashboard = () => {
  // State management
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [masterType, setMasterType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sizeTypes, setSizeTypes] = useState([]);
  const [sizeValues, setSizeValues] = useState({});
  const [productMasters, setProductMasters] = useState([]);
  const [designMasters, setDesignMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedSerialNumber, setGeneratedSerialNumber] = useState('');
  const [generatedStyleNumber, setGeneratedStyleNumber] = useState('');

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    category: '',
    types: [],
    values: {}
  });

  const [productForm, setProductForm] = useState({
    category: '',
    sizeType: '',
    sizeValue: ''
  });
  
  const [designForm, setDesignForm] = useState({
    serialNumber: '',
    grossWt: '',
    netWt: '',
    diaWt: '',
    diaPcs: '',
    clarity: '',
    color: '',
    imageFile: null
  });

  // Fetch initial data
  useEffect(() => {
    fetchAllSizeData();
    fetchAllProductMasters();
    fetchAllDesignMasters();
  }, []);

  // Helper function to show success messages
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // API calls
  const fetchAllSizeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllSizeData`);
      const formattedData = response.data.data;
      
      const uniqueCategories = [...new Set(formattedData.map(item => item.category))];
      setCategories(uniqueCategories);
      
      const sizeDataMap = {};
      formattedData.forEach(item => {
        sizeDataMap[item.category] = {
          types: item.types,
          values: item.values
        };
      });
      setSizeValues(sizeDataMap);
    } catch (error) {
      console.error('Error fetching size data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProductMasters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllProductMasters`);
      setProductMasters(response.data.data);
    } catch (error) {
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
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate Product Serial Number
  const generateProductSerialNumber = async (category) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/pdmaster/generateSerialNumber?category=${category}`
      );
      setGeneratedSerialNumber(response.data.serialNumber);
    } catch (error) {
      console.error('Error generating serial number:', error);
    }
  };

  // Generate Style Number
  const generateStyleNumber = async (serialNumber) => {
    try {
      const product = productMasters.find(p => p.serialNumber === serialNumber);
      if (!product) return;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/pdmaster/generateStyleNumber?category=${product.category}`
      );
      setGeneratedStyleNumber(response.data.styleNumber);
    } catch (error) {
      console.error('Error generating style number:', error);
    }
  };

  // Category change handler
  const handleCategoryChange = async (category) => {
    try {
      setLoading(true);
      
      if (sizeValues[category]) {
        setSizeTypes(sizeValues[category].types || []);
      } else {
        setSizeTypes([]);
      }
      
      setProductForm({
        category,
        sizeType: '',
        sizeValue: ''
      });

      await generateProductSerialNumber(category);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product form submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.category || !productForm.sizeType || !productForm.sizeValue) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      await axios.post(`${API_BASE_URL}/api/pdmaster/createProductMaster`, {
        ...productForm,
        serialNumber: generatedSerialNumber
      });

      showSuccess('Product created successfully!');
      setProductForm({ category: '', sizeType: '', sizeValue: '' });
      setGeneratedSerialNumber('');
      fetchAllProductMasters();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Handle design form submission
  const handleDesignSubmit = async (e) => {
    e.preventDefault();
    
    if (!designForm.serialNumber) {
      alert('Please select a product');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('serialNumber', designForm.serialNumber);
      formData.append('styleNumber', generatedStyleNumber);
      formData.append('grossWt', designForm.grossWt);
      formData.append('netWt', designForm.netWt);
      formData.append('diaWt', designForm.diaWt);
      formData.append('diaPcs', designForm.diaPcs);
      formData.append('clarity', designForm.clarity);
      formData.append('color', designForm.color);
      if (designForm.imageFile) {
        formData.append('imageFile', designForm.imageFile);
      }

      await axios.post(`${API_BASE_URL}/api/pdmaster/createDesignMaster`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showSuccess('Design created successfully!');
      setDesignForm({
        serialNumber: '',
        grossWt: '',
        netWt: '',
        diaWt: '',
        diaPcs: '',
        clarity: '',
        color: '',
        imageFile: null
      });
      setPreviewImage(null);
      setGeneratedStyleNumber('');
      fetchAllDesignMasters();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create design');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setDesignForm({...designForm, imageFile: file});
    setPreviewImage(URL.createObjectURL(file));
  };

  // Success Message Component
  const SuccessAlert = ({ message }) => (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
        <FiCheckCircle className="mr-2" />
        <span>{message}</span>
      </div>
    </div>
  );

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Production Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-[#00072D] to-blue-[#00072D] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <FiShoppingBag className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Product Masters</h3>
              <p className="text-2xl font-bold">{productMasters.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#00072D] to-[#00072D] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <FiAward className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Design Masters</h3>
              <p className="text-2xl font-bold">{designMasters.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[...productMasters, ...designMasters]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((item, index) => (
              <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg mr-4 ${
                  item.serialNumber ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {item.serialNumber ? <FiShoppingBag /> : <FiAward />}
                </div>
                <div>
                  <p className="font-medium">
                    {item.serialNumber ? 'New Product' : 'New Design'} Added
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.serialNumber || item.styleNumber}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // Render Product Master Form
  const renderProductMasterForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create Product Master</h2>
      
      <form onSubmit={handleProductSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={productForm.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Size Type</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={productForm.sizeType}
              onChange={(e) => setProductForm({...productForm, sizeType: e.target.value})}
              disabled={!productForm.category}
              required
            >
              <option value="">Select type</option>
              {sizeTypes.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Size Value</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={productForm.sizeValue}
              onChange={(e) => setProductForm({...productForm, sizeValue: e.target.value})}
              disabled={!productForm.sizeType}
              required
            >
              <option value="">Select value</option>
              {productForm.sizeType && sizeValues[productForm.category]?.values[productForm.sizeType]?.map((item, i) => (
                <option key={i} value={item.value}>{item.value}</option>
              ))}
            </select>
          </div>
        </div>

        {generatedSerialNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <span className="font-medium">Serial Number:</span> {generatedSerialNumber}
            </p>
          </div>
        )}

        <button 
          type="submit" 
          className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );

  // Render Design Master Form
  const renderDesignMasterForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create Design Master</h2>
      
      <form onSubmit={handleDesignSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            className="w-full p-3 border rounded-lg"
            value={designForm.serialNumber}
            onChange={(e) => {
              setDesignForm({...designForm, serialNumber: e.target.value});
              generateStyleNumber(e.target.value);
            }}
            required
          >
            <option value="">Select product</option>
            {productMasters.map((product) => (
              <option key={product._id} value={product.serialNumber}>
                {product.serialNumber} - {product.category}
              </option>
            ))}
          </select>
        </div>

        {generatedStyleNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <span className="font-medium">Style Number:</span> {generatedStyleNumber}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gross Weight (g)</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={designForm.grossWt}
              onChange={(e) => setDesignForm({...designForm, grossWt: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Net Weight (g)</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={designForm.netWt}
              onChange={(e) => setDesignForm({...designForm, netWt: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Diamond Weight (ct)</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={designForm.diaWt}
              onChange={(e) => setDesignForm({...designForm, diaWt: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Diamond Pieces</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={designForm.diaPcs}
              onChange={(e) => setDesignForm({...designForm, diaPcs: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Clarity</label>
            <select
              className="w-full p-3 border rounded-lg"
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
            <label className="block text-sm font-medium mb-1">Color</label>
            <select
              className="w-full p-3 border rounded-lg"
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
          <label className="block text-sm font-medium mb-2">Design Image</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center px-4 py-3 border rounded-lg cursor-pointer">
              <FiPlus className="mr-2" />
              Choose Image
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </label>
            {previewImage && (
              <img src={previewImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Design'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {successMessage && <SuccessAlert message={successMessage} />}

      {/* Mobile header */}
      <div className="md:hidden bg-[#00072D] text-white p-4 flex justify-between items-center">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        <h1 className="text-xl font-bold">Production Dashboard</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-[#00072D] text-white transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-20 transition-transform md:relative`}>
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-center">Sonalika Jewellers</h1>
          </div>
          <nav className="mt-6">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-6 py-3 ${
                activeMenu === 'dashboard' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <FiHome className="mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveMenu('products');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-6 py-3 ${
                activeMenu === 'products' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <FiShoppingBag className="mr-3" />
              Product Masters
            </button>
            <button
              onClick={() => {
                setActiveMenu('designs');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-6 py-3 ${
                activeMenu === 'designs' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <FiAward className="mr-3" />
              Design Masters
            </button>
          </nav>
        </div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {activeMenu === 'dashboard' && renderDashboard()}
          {activeMenu === 'products' && renderProductMasterForm()}
          {activeMenu === 'designs' && renderDesignMasterForm()}
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;