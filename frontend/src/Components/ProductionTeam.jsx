import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMenu, FiX, FiHome, FiDatabase, FiShoppingBag, FiPlus, FiAward, FiChevronDown, FiChevronUp, FiTrash2, FiEdit2 } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const ProductionDashboard = () => {
  const [activeMenu, setActiveMenu] = useState(() => {
    const saved = localStorage.getItem('activeMenu');
    return saved || 'dashboard';
  });
  
  const [masterType, setMasterType] = useState(() => {
    const saved = localStorage.getItem('masterType');
    return saved || null;
  });
  
  const [categories, setCategories] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [sizeValues, setSizeValues] = useState([]);
  const [productMasters, setProductMasters] = useState([]);
  const [designMasters, setDesignMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSerialNumbers, setProductSerialNumbers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    types: [{ name: '', values: [{ value: '', description: '' }] }]
  });

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    localStorage.setItem('masterType', masterType);
  }, [activeMenu, masterType]);

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

  useEffect(() => {
    fetchAllProductMasters();
    fetchAllDesignMasters();
    fetchAllCategories();
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

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pdmaster/category-size`);
      setCategories(response.data.data);
    } catch (error) {
      alert('Failed to fetch categories');
      console.error('Fetch error:', error);
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
    const selectedCategory = categories.find(cat => cat.name === value);
    const types = selectedCategory?.types || [];
    setCategoryTypes(types);
    setProductForm({
      ...productForm,
      category: value,
      sizeType: '',
      sizeValue: ''
    });
    setSizeValues([]);
  };

  const handleSizeTypeChange = (value, category) => {
    const selectedCategory = categories.find(cat => cat.name === category);
    const selectedType = selectedCategory?.types.find(type => type.name === value);
    const values = selectedType?.values || [];
    setSizeValues(values);
    setProductForm({
      ...productForm,
      sizeType: value,
      sizeValue: ''
    });
  };

  const handleDesignImageChange = (e) => {
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

      setDesignForm({
        ...designForm,
        imageFile: file
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.category || !productForm.sizeType || !productForm.sizeValue) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createProductMaster`,
        {
          category: productForm.category,
          sizeType: productForm.sizeType,
          sizeValue: productForm.sizeValue
        }
      );

      if (response.data.success) {
        alert('Product Master created successfully!');
        setProductForm({
          category: '',
          sizeType: '',
          sizeValue: ''
        });
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
    
    if (!designForm.serialNumber || !designForm.grossWt || !designForm.netWt || 
        !designForm.diaWt || !designForm.diaPcs || !designForm.clarity || 
        !designForm.color || !designForm.imageFile) {
      alert('Please fill all fields and upload a design image');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('serialNumber', designForm.serialNumber);
      formData.append('grossWt', designForm.grossWt);
      formData.append('netWt', designForm.netWt);
      formData.append('diaWt', designForm.diaWt);
      formData.append('diaPcs', designForm.diaPcs);
      formData.append('clarity', designForm.clarity);
      formData.append('color', designForm.color);
      formData.append('image', designForm.imageFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/pdmaster/createDesignMaster`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
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
        color: '',
        imageFile: null
      });
      setPreviewImage(null);
      fetchAllDesignMasters();
    } catch (error) {
      alert(`Failed to create design master: ${error.response?.data?.message || error.message}`);
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/pdmaster/category-size`, {
        name: newCategory.name,
        types: newCategory.types
      });
      
      if (response.data.message === "Category added successfully") {
        alert('Category added successfully!');
        setNewCategory({
          name: '',
          types: [{ name: '', values: [{ value: '', description: '' }] }]
        });
        setShowAddCategory(false);
        fetchAllCategories();
      } else {
        throw new Error(response.data.message || 'Failed to add category');
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
      console.error('Add category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addType = () => {
    setNewCategory({
      ...newCategory,
      types: [...newCategory.types, { name: '', values: [{ value: '', description: '' }] }]
    });
  };

  const removeType = (index) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes.splice(index, 1);
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const addValue = (typeIndex) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[typeIndex].values.push({ value: '', description: '' });
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const removeValue = (typeIndex, valueIndex) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[typeIndex].values.splice(valueIndex, 1);
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const handleTypeChange = (index, field, value) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[index][field] = value;
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
  };

  const handleValueChange = (typeIndex, valueIndex, field, value) => {
    const updatedTypes = [...newCategory.types];
    updatedTypes[typeIndex].values[valueIndex][field] = value;
    setNewCategory({
      ...newCategory,
      types: updatedTypes
    });
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
    <div className="bg-white h-screen rounded-xl shadow-lg p-6">
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
                <option key={category._id} value={category.name}>{category.name}</option>
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
              {categoryTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
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

  

      {/* Add Category Section */}
      <div className="mt-12 bg-white h-screen rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Category Management</h2>
          <button 
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center text-[#00072D] hover:text-blue-700"
          >
            {showAddCategory ? (
              <>
                <FiChevronUp className="mr-1" />
                Hide Form
              </>
            ) : (
              <>
                <FiPlus className="mr-1" />
                Add New Category
              </>
            )}
          </button>
        </div>

        {showAddCategory && (
          <form onSubmit={handleAddCategory} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value.toUpperCase()})}
                placeholder="e.g., NECKLACE, BRACELET"
                required
              />
            </div>

            {newCategory.types.map((type, typeIndex) => (
              <div key={typeIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Size Type {typeIndex + 1}</h3>
                  {newCategory.types.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeType(typeIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={type.name}
                    onChange={(e) => handleTypeChange(typeIndex, 'name', e.target.value)}
                    placeholder="e.g., Length, Size, Diameter"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Size Values</h4>
                    <button
                      type="button"
                      onClick={() => addValue(typeIndex)}
                      className="flex items-center text-sm text-[#00072D] hover:text-blue-700"
                    >
                      <FiPlus className="mr-1" />
                      Add Value
                    </button>
                  </div>

                  {type.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={value.value}
                          onChange={(e) => handleValueChange(typeIndex, valueIndex, 'value', e.target.value)}
                          placeholder="e.g., S, M, L or 36cm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <div className="flex">
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            value={value.description}
                            onChange={(e) => handleValueChange(typeIndex, valueIndex, 'description', e.target.value)}
                            placeholder="e.g., 14 inches, Small size"
                            required
                          />
                          {type.values.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeValue(typeIndex, valueIndex)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={addType}
                className="flex items-center text-[#00072D] hover:text-blue-700"
              >
                <FiPlus className="mr-1" />
                Add Another Size Type
              </button>
              
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
                  'Save Category'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg">{category.name}</h4>
                  <button className="text-gray-500 hover:text-gray-700">
                    <FiEdit2 />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {category.types.map((type, typeIndex) => (
                    <div key={typeIndex} className="ml-4">
                      <h5 className="font-medium">{type.name}</h5>
                      <ul className="list-disc ml-6 text-sm text-gray-600">
                        {type.values.map((value, valueIndex) => (
                          <li key={valueIndex}>
                            <span className="font-medium">{value.value}</span>: {value.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Design Image</label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                onChange={handleDesignImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="design-image-upload"
                required
              />
              <label
                htmlFor="design-image-upload"
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition"
              >
                <FiPlus className="mr-2" />
                Choose Design Image
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
                    setDesignForm({...designForm, imageFile: null});
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Design Image</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {design.imageFile ? (
                          <img 
                            src={design.imageFile} 
                            alt="Design" 
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