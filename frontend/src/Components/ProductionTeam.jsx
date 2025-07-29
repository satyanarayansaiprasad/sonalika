import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiMenu, FiX, FiHome, FiDatabase, FiShoppingBag, FiPlus, FiAward, FiUpload, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

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

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );

  const SectionHeader = ({ title, count, className = '' }) => (
    <div className={`flex justify-between items-center mb-4 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {count !== undefined && <span className="text-sm text-gray-500">{count} records</span>}
    </div>
  );

  const PrimaryButton = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#00072D] text-white px-6 py-2 rounded-lg hover:bg-[#00114D] focus:outline-none focus:ring-2 focus:ring-[#00072D] focus:ring-offset-2 transition flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );

  const SecondaryButton = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border border-[#00072D] text-[#00072D] px-6 py-2 rounded-lg hover:bg-[#00072D] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00072D] focus:ring-offset-2 transition ${className}`}
    >
      {children}
    </button>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '', ...props }) => (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00072D] focus:border-[#00072D] transition text-gray-700`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options, placeholder, required = false, disabled = false, className = '' }) => (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00072D] focus:border-[#00072D] transition ${disabled ? 'bg-gray-100' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder || 'Select an option'}</option>
        {options.map((opt) => (
          typeof opt === 'object' ? (
            <option key={opt.value} value={opt.value}>{opt.label || opt.value}</option>
          ) : (
            <option key={opt} value={opt}>{opt}</option>
          )
        ))}
      </select>
    </div>
  );

  const TextAreaField = ({ label, value, onChange, placeholder, required = false, rows = 3, className = '' }) => (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00072D] focus:border-[#00072D] transition`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </div>
  );

  const ProductMasterCard = ({ product }) => (
    <div className="bg-gradient-to-br from-[#00072D] to-[#00114D] text-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex items-center mb-4">
        {product.imageFile ? (
          <img 
            src={product.imageFile} 
            alt="Product" 
            className="h-16 w-16 object-cover rounded-lg mr-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/64?text=No+Image';
            }}
          />
        ) : (
          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 mr-4">
            No Image
          </div>
        )}
        <div>
          <h3 className="font-medium">{product.serialNumber}</h3>
          <p className="text-sm text-white/80">{product.category}</p>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-sm font-medium">Size:</p>
        <p className="text-sm text-white/80">{product.sizeType}: {product.sizeValue}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">Description:</p>
        <p className="text-sm text-white/80 line-clamp-3">{product.description}</p>
      </div>
    </div>
  );

  const DesignMasterCard = ({ design }) => (
    <div className="bg-gradient-to-br from-[#00072D] to-[#00114D] text-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-medium">{design.serialNumber}</h3>
        <p className="text-sm text-white/80">Style: {design.styleNumber}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Gross Wt</p>
          <p className="text-sm text-white/80">{design.grossWt}g</p>
        </div>
        <div>
          <p className="text-sm font-medium">Net Wt</p>
          <p className="text-sm text-white/80">{design.netWt}g</p>
        </div>
        <div>
          <p className="text-sm font-medium">Diamond Wt</p>
          <p className="text-sm text-white/80">{design.diaWt}ct</p>
        </div>
        <div>
          <p className="text-sm font-medium">Diamond Pcs</p>
          <p className="text-sm text-white/80">{design.diaPcs}</p>
        </div>
      </div>
      <div className="mt-auto">
        <p className="text-sm font-medium">Details:</p>
        <p className="text-sm text-white/80">Clarity: {design.clarity}, Color: {design.color}</p>
      </div>
    </div>
  );

  const renderProductMasterRecords = () => {
    if (productMasters.length === 0) {
      return <p className="text-gray-500 text-center py-4">No product masters found</p>;
    }

    return (
      <>
        <div className="md:hidden">
          <Carousel
            showArrows={true}
            showStatus={false}
            showThumbs={false}
            infiniteLoop={true}
            centerMode={true}
            centerSlidePercentage={85}
            renderArrowPrev={(onClickHandler, hasPrev, label) => (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              >
                <FiChevronLeft className="text-[#00072D]" />
              </button>
            )}
            renderArrowNext={(onClickHandler, hasNext, label) => (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              >
                <FiChevronRight className="text-[#00072D]" />
              </button>
            )}
          >
            {productMasters.map((product) => (
              <div key={product._id} className="px-2 py-4 h-full">
                <ProductMasterCard product={product} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#00072D]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Serial</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
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
      </>
    );
  };

  const renderDesignMasterRecords = () => {
    if (designMasters.length === 0) {
      return <p className="text-gray-500 text-center py-4">No design masters found</p>;
    }

    return (
      <>
        <div className="md:hidden">
          <Carousel
            showArrows={true}
            showStatus={false}
            showThumbs={false}
            infiniteLoop={true}
            centerMode={true}
            centerSlidePercentage={85}
            renderArrowPrev={(onClickHandler, hasPrev, label) => (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              >
                <FiChevronLeft className="text-[#00072D]" />
              </button>
            )}
            renderArrowNext={(onClickHandler, hasNext, label) => (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              >
                <FiChevronRight className="text-[#00072D]" />
              </button>
            )}
          >
            {designMasters.map((design) => (
              <div key={design._id} className="px-2 py-4 h-full">
                <DesignMasterCard design={design} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#00072D]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product Serial</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Style Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Gross Wt (g)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Net Wt (g)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Diamond Wt (ct)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Diamond Pcs</th>
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
      </>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Production Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FiShoppingBag className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Product Masters</h3>
                <p className="text-2xl font-bold text-[#00072D]">{productMasters.length}</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${Math.min(100, productMasters.length)}%`, 
                  backgroundColor: '#00072D'
                }}
              ></div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <FiAward className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Design Masters</h3>
                <p className="text-2xl font-bold text-[#00072D]">{designMasters.length}</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${Math.min(100, designMasters.length)}%`, 
                  backgroundColor: '#00072D'
                }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="md:hidden">
        <SectionHeader title="Recent Activity" />
        <Carousel
          showArrows={true}
          showStatus={false}
          showThumbs={false}
          infiniteLoop={true}
          centerMode={true}
          centerSlidePercentage={85}
          renderArrowPrev={(onClickHandler, hasPrev, label) => (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
            >
              <FiChevronLeft className="text-[#00072D]" />
            </button>
          )}
          renderArrowNext={(onClickHandler, hasNext, label) => (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
            >
              <FiChevronRight className="text-[#00072D]" />
            </button>
          )}
        >
          {[...productMasters.slice(0, 3), ...designMasters.slice(0, 3)]
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)
            .map((item, index) => (
              <div key={index} className="px-2 py-4 h-full">
                <div className="bg-gradient-to-br from-[#00072D] to-[#00114D] text-white p-6 rounded-xl shadow-lg h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-lg mr-3 ${item.serialNumber ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {item.serialNumber ? <FiShoppingBag /> : <FiAward />}
                      </div>
                      <h3 className="font-medium text-white">
                        {item.serialNumber ? 'New Product Added' : 'New Design Added'}
                      </h3>
                    </div>
                    <p className="text-sm text-white/80 mb-2">
                      {item.serialNumber ? 
                        `${item.category} - ${item.serialNumber}` : 
                        `${item.serialNumber} - ${item.styleNumber}`
                      }
                    </p>
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.floor(Math.random() * 60)} minutes ago
                  </div>
                </div>
              </div>
            ))}
        </Carousel>
      </div>

      <div className="hidden md:block">
        <Card>
          <div className="p-6">
            <SectionHeader title="Recent Activity" />
            <div className="space-y-4">
              {[...productMasters.slice(0, 3), ...designMasters.slice(0, 3)]
                .sort(() => 0.5 - Math.random())
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className={`p-2 rounded-lg mr-4 ${item.serialNumber ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {item.serialNumber ? <FiShoppingBag /> : <FiAward />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.serialNumber ? 'New Product Added' : 'New Design Added'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {item.serialNumber ? `${item.category} - ${item.serialNumber}` : `${item.serialNumber} - ${item.styleNumber}`}
                      </p>
                    </div>
                    <div className="ml-4 text-sm text-gray-400 whitespace-nowrap">
                      {Math.floor(Math.random() * 60)} minutes ago
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderProductMasterForm = () => (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Create Product Master</h2>
            <button 
              onClick={() => {
                setMasterType(null);
                setActiveMenu('master');
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          <form onSubmit={handleProductSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Category"
                value={productForm.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={categories}
                placeholder="Select category"
                required
              />
              
              <SelectField
                label="Size Type"
                value={productForm.sizeType}
                onChange={(e) => handleSizeTypeChange(e.target.value, productForm.category)}
                options={sizeTypes}
                placeholder="Select size type"
                disabled={!productForm.category}
                required
              />
              
              <SelectField
                label="Size Value"
                value={productForm.sizeValue}
                onChange={(e) => setProductForm({...productForm, sizeValue: e.target.value})}
                options={sizeValues.map(item => ({
                  value: item.value,
                  label: `${item.value} - ${item.description}`
                }))}
                placeholder="Select size value"
                disabled={!productForm.sizeType}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="flex items-start space-x-4">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#00072D] transition"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 text-center">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      JPEG, PNG, WEBP <br /> (Max 5MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    required
                  />
                </label>
                
                {previewImage && (
                  <div className="relative group">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="h-32 w-32 object-contain rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setProductForm({...productForm, imageFile: null});
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 shadow-md hover:bg-red-600 transition"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <TextAreaField
              label="Description"
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              placeholder="Enter product description..."
              required
              rows={4}
            />
            
            <div className="flex justify-end space-x-3">
              <SecondaryButton
                onClick={() => {
                  setProductForm({
                    category: '',
                    sizeType: '',
                    sizeValue: '',
                    description: '',
                    imageFile: null
                  });
                  setPreviewImage(null);
                }}
              >
                Reset
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
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
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Card>

      <div>
        <SectionHeader title="Product Master Records" count={productMasters.length} />
        {renderProductMasterRecords()}
      </div>
    </div>
  );

  const renderDesignMasterForm = () => (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Create Design Master</h2>
            <button 
              onClick={() => {
                setMasterType(null);
                setActiveMenu('master');
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          <form onSubmit={handleDesignSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Product Serial Number"
                value={designForm.serialNumber}
                onChange={(e) => setDesignForm({...designForm, serialNumber: e.target.value})}
                options={productMasters.map(product => ({
                  value: product.serialNumber,
                  label: `${product.serialNumber} - ${product.category}`
                }))}
                placeholder="Select product"
                required
              />
              
              {designForm.serialNumber && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {productMasters.find(p => p.serialNumber === designForm.serialNumber)?.imageFile ? (
                    <img 
                      src={productMasters.find(p => p.serialNumber === designForm.serialNumber).imageFile} 
                      alt="Product" 
                      className="h-12 w-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {productMasters.find(p => p.serialNumber === designForm.serialNumber)?.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {productMasters.find(p => p.serialNumber === designForm.serialNumber)?.description?.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                label="Gross Weight (g)"
                type="number"
                value={designForm.grossWt}
                onChange={(e) => setDesignForm({...designForm, grossWt: e.target.value})}
                placeholder="0.00"
                required
                step="0.01"
              />
              
              <InputField
                label="Net Weight (g)"
                type="number"
                value={designForm.netWt}
                onChange={(e) => setDesignForm({...designForm, netWt: e.target.value})}
                placeholder="0.00"
                required
                step="0.01"
              />
              
              <InputField
                label="Diamond Weight (ct)"
                type="number"
                value={designForm.diaWt}
                onChange={(e) => setDesignForm({...designForm, diaWt: e.target.value})}
                placeholder="0.00"
                required
                step="0.01"
              />
              
              <InputField
                label="Diamond Pieces"
                type="number"
                value={designForm.diaPcs}
                onChange={(e) => setDesignForm({...designForm, diaPcs: e.target.value})}
                required
              />
              
              <SelectField
                label="Clarity"
                value={designForm.clarity}
                onChange={(e) => setDesignForm({...designForm, clarity: e.target.value})}
                options={['vvs', 'vs', 'si', 'i']}
                placeholder="Select clarity"
                required
              />
              
              <SelectField
                label="Color"
                value={designForm.color}
                onChange={(e) => setDesignForm({...designForm, color: e.target.value})}
                options={['d-f', 'g-h', 'i-j', 'k-l']}
                placeholder="Select color"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <SecondaryButton
                onClick={() => {
                  setDesignForm({
                    serialNumber: '',
                    grossWt: '',
                    netWt: '',
                    diaWt: '',
                    diaPcs: '',
                    clarity: '',
                    color: ''
                  });
                }}
              >
                Reset
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
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
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Card>

      <div>
        <SectionHeader title="Design Master Records" count={designMasters.length} />
        {renderDesignMasterRecords()}
      </div>
    </div>
  );

  const renderMasterDataMenu = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div 
            className="p-6 cursor-pointer hover:shadow-lg transition h-full flex flex-col"
            onClick={() => setMasterType('product')}
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <FiShoppingBag className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Product Master</h3>
                <p className="text-sm text-gray-500">{productMasters.length} records</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Create and manage product specifications including categories, sizes, and images.
              </p>
            </div>
            <div className="mt-auto">
              <PrimaryButton className="w-full">
                <FiPlus className="mr-2" /> Add Product
              </PrimaryButton>
            </div>
          </div>
        </Card>
        
        <Card>
          <div 
            className="p-6 cursor-pointer hover:shadow-lg transition h-full flex flex-col"
            onClick={() => setMasterType('design')}
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                <FiAward className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Design Master</h3>
                <p className="text-sm text-gray-500">{designMasters.length} records</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Define design specifications including weights, diamond details, and materials.
              </p>
            </div>
            <div className="mt-auto">
              <PrimaryButton className="w-full">
                <FiPlus className="mr-2" /> Add Design
              </PrimaryButton>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
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

      {/* Sidebar - Fixed */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-20 w-64 bg-[#00072D] text-white transition duration-200 ease-in-out md:transition-none flex flex-col`}
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
        <nav className="mt-6 flex-1">
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
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content - Scrollable with hidden scrollbar */}
      <div className="flex-1 overflow-auto p-4 md:p-6 scrollbar-hide">
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
  );
};

export default ProductionDashboard;