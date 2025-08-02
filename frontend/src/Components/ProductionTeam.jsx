import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMenu, FiX, FiHome, FiDatabase, FiShoppingBag, FiPlus, FiAward } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

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
  const [activeMenu, setActiveMenu] = useState(() => {
    const saved = localStorage.getItem('activeMenu');
    return saved || 'dashboard';
  });
  
  const [masterType, setMasterType] = useState(() => {
    const saved = localStorage.getItem('masterType');
    return saved || null;
  });
  
  const [categories] = useState(Object.keys(sizeData));
  const [sizeTypes, setSizeTypes] = useState([]);
  const [sizeValues, setSizeValues] = useState([]);
  const [productMasters, setProductMasters] = useState([]);
  const [designMasters, setDesignMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSerialNumbers, setProductSerialNumbers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    localStorage.setItem('masterType', masterType);
  }, [activeMenu, masterType]);

  const [productForm, setProductForm] = useState({
    category: '',
    sizeType: '',
    sizeValue: '',
    description: '',
    imageFile: null
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

  useEffect(() => {
    fetchAllProductMasters();
    fetchAllDesignMasters();
  }, []);

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

  const handleSizeTypeChange = (value, category) => {
    const values = sizeData[category]?.values[value] || [];
    setSizeValues(values);
    setProductForm({
      ...productForm,
      sizeType: value,
      sizeValue: ''
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, or WebP image');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image must be smaller than 5MB');
        return;
      }

      setProductForm({
        ...productForm,
        imageFile: file
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.category || !productForm.sizeType || !productForm.sizeValue || !productForm.description || !productForm.imageFile) {
      alert('Please fill all fields and select an image');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category', productForm.category);
      formData.append('sizeType', productForm.sizeType);
      formData.append('sizeValue', productForm.sizeValue);
      formData.append('description', productForm.description);
      formData.append('image', productForm.imageFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createProductMaster`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('Product Master created successfully!');
        setProductForm({
          category: '',
          sizeType: '',
          sizeValue: '',
          description: '',
          imageFile: null
        });
        setPreviewImage(null);
        fetchAllProductMasters();
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Production Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-[#00072D] to-blue-[#00072D] rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <FiShoppingBag className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium opacity-80">Product Masters</h3>
              <p className="text-2xl font-bold">{productMasters.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#00072D] to-[#00072D] rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <FiAward className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium opacity-80">Design Masters</h3>
              <p className="text-2xl font-bold">{designMasters.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
        <div className="space-y-4">
          {productMasters.slice(0, 3).map((product, index) => (
            <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="bg-blue-100 p-2 rounded-lg mr-4">
                <FiShoppingBag className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">New Product Added</p>
                <p className="text-sm text-gray-500">{product.category} - {product.serialNumber}</p>
              </div>
              <div className="ml-auto text-sm text-gray-400">
                Just now
              </div>
            </div>
          ))}
          {designMasters.slice(0, 3).map((design, index) => (
            <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="bg-purple-100 p-2 rounded-lg mr-4">
                <FiAward className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">New Design Added</p>
                <p className="text-sm text-gray-500">{design.serialNumber} - {design.styleNumber}</p>
              </div>
              <div className="ml-auto text-sm text-gray-400">
                Just now
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductMasterForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create Product Master</h2>
        <button 
          onClick={() => {
            setMasterType(null);
            setActiveMenu('master');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="text-xl" />
        </button>
      </div>
      
      <form onSubmit={handleProductSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="image-upload"
                required
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition"
              >
                <FiPlus className="mr-2" />
                Choose Image
              </label>
            </div>
            {previewImage && (
              <div className="relative group">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setProductForm({...productForm, imageFile: null});
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload a high-quality image (JPEG, PNG, WebP) under 5MB
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows={4}
            value={productForm.description}
            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
            placeholder="Enter product description..."
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Create Product Master'
            )}
          </button>
        </div>
      </form>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Product Master Records</h2>
          <span className="text-sm text-gray-500">{productMasters.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productMasters.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.serialNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sizeType}: {product.sizeValue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.imageFile ? (
                          <img 
                            src={product.imageFile} 
                            alt="Product" 
                            className="h-10 w-10 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{product.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesignMasterForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create Design Master</h2>
        <button 
          onClick={() => {
            setMasterType(null);
            setActiveMenu('master');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="text-xl" />
        </button>
      </div>
      
      <form onSubmit={handleDesignSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Serial Number</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={designForm.serialNumber}
              onChange={(e) => setDesignForm({...designForm, serialNumber: e.target.value})}
              required
            >
              <option value="">Select product serial number</option>
              {productMasters.map((product) => (
                <option key={product.serialNumber} value={product.serialNumber}>
                  {product.serialNumber} - {product.category}
                </option>
              ))}
            </select>
            
            {/* Show the selected product's image */}
            {designForm.serialNumber && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Product:</span>
                {productMasters.find(p => p.serialNumber === designForm.serialNumber)?.imageFile ? (
                  <img 
                    src={productMasters.find(p => p.serialNumber === designForm.serialNumber).imageFile} 
                    alt="Product" 
                    className="h-8 w-8 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/32?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                    No Image
                  </div>
                )}
                <span className="text-sm font-medium">
                  {productMasters.find(p => p.serialNumber === designForm.serialNumber)?.category}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Weight</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                value={designForm.grossWt}
                onChange={(e) => setDesignForm({...designForm, grossWt: e.target.value})}
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Net Weight</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                value={designForm.netWt}
                onChange={(e) => setDesignForm({...designForm, netWt: e.target.value})}
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Weight</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                value={designForm.diaWt}
                onChange={(e) => setDesignForm({...designForm, diaWt: e.target.value})}
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">ct</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Pieces</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={designForm.diaPcs}
              onChange={(e) => setDesignForm({...designForm, diaPcs: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clarity</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
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
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-[#00072D] text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Create Design Master'
            )}
          </button>
        </div>
      </form>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Design Master Records</h2>
          <span className="text-sm text-gray-500">{designMasters.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Serial</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Wt (g)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Wt (g)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond Wt (ct)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond Pcs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {designMasters.map((design) => (
                    <tr key={design._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{design.serialNumber}</td>
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
      </div>
    </div>
  );

  const renderMasterDataMenu = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
          onClick={() => setMasterType('product')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <FiShoppingBag className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Product Master</h3>
              <p className="text-sm text-gray-500">{productMasters.length} records</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
          onClick={() => setMasterType('design')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
              <FiAward className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Design Master</h3>
              <p className="text-sm text-gray-500">{designMasters.length} records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="md:hidden bg-[#00072D] text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md focus:outline-none"
        >
          {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
        <h1 className="text-xl font-bold">Production Dashboard</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed and not scrolling */}
        <div 
          className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-20 w-64 bg-[#00072D] text-white transition duration-200 ease-in-out md:transition-none flex flex-col`}
          style={{ height: '100vh' }}
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="https://via.placeholder.com/40x40?text=SJ" 
                alt="Sonalika Jewellers" 
                className="h-10 w-10 rounded-full"
              />
            </div>
            <h1 className="text-xl font-bold text-center">Sonalika Jewellers</h1>
          </div>
          <nav className="mt-6 flex-1 overflow-y-auto">
            <div 
              className={`flex items-center px-6 py-3 cursor-pointer transition ${activeMenu === 'dashboard' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('dashboard');
                setMobileMenuOpen(false);
                setMasterType(null);
              }}
            >
              <FiHome className="mr-3" />
              <span>Dashboard</span>
            </div>
            <div 
              className={`flex items-center px-6 py-3 cursor-pointer transition ${activeMenu === 'master' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onClick={() => {
                setActiveMenu('master');
                setMobileMenuOpen(false);
                setMasterType(null);
              }}
            >
              <FiDatabase className="mr-3" />
              <span>Master Data</span>
            </div>
          </nav>
          <div className="p-4 text-sm text-white/60 border-t border-white/10 hidden md:block">
           PageTraffics
          </div>
        </div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {activeMenu === 'dashboard' && renderDashboard()}

          {activeMenu === 'master' && (
            <>
              {!masterType && renderMasterDataMenu()}
              {masterType === 'product' && renderProductMasterForm()}
              {masterType === 'design' && renderDesignMasterForm()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;