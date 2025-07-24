import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGem, FaBoxOpen, FaChartLine, FaCog, FaPlus, FaTrash, FaBars, FaTimes } from 'react-icons/fa';

const ProductionTeam = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeForm, setActiveForm] = useState(null);
  const [designItems, setDesignItems] = useState([{ 
    id: 1, 
    styleNumber: '', 
    grossWt: '', 
    netWt: '', 
    diaWt: '', 
    diaPcs: '', 
    clarity: 'vvs', 
    color: 'e-f' 
  }]);
  const [productItems, setProductItems] = useState([{
    id: 1,
    category: '',
    sizeType: '',
    sizeValue: '',
    description: ''
  }]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addDesignItem = () => {
    setDesignItems([...designItems, { 
      id: designItems.length + 1, 
      styleNumber: '', 
      grossWt: '', 
      netWt: '', 
      diaWt: '', 
      diaPcs: '', 
      clarity: 'vvs', 
      color: 'e-f' 
    }]);
  };

  const removeDesignItem = (id) => {
    if (designItems.length > 1) {
      setDesignItems(designItems.filter(item => item.id !== id));
    }
  };

  const addProductItem = () => {
    setProductItems([...productItems, {
      id: productItems.length + 1,
      category: '',
      sizeType: '',
      sizeValue: '',
      description: ''
    }]);
  };

  const removeProductItem = (id) => {
    if (productItems.length > 1) {
      setProductItems(productItems.filter(item => item.id !== id));
    }
  };

  // Size data based on the provided images
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
          // Typically gents rings are larger, we can use the same sizes as ladies but starting from a larger size
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

  const handleCategoryChange = (id, value) => {
    const updatedItems = productItems.map(item => 
      item.id === id ? {...item, category: value, sizeType: '', sizeValue: ''} : item
    );
    setProductItems(updatedItems);
  };

  const handleSizeTypeChange = (id, value) => {
    const updatedItems = productItems.map(item => 
      item.id === id ? {...item, sizeType: value, sizeValue: ''} : item
    );
    setProductItems(updatedItems);
  };

  const handleSizeValueChange = (id, value) => {
    const updatedItems = productItems.map(item => 
      item.id === id ? {...item, sizeValue: value} : item
    );
    setProductItems(updatedItems);
  };

  const getSizeDescription = (category, sizeType, sizeValue) => {
    if (!category || !sizeType || !sizeValue) return '';
    
    const sizeItem = sizeData[category]?.values[sizeType]?.find(item => item.value === sizeValue);
    return sizeItem ? sizeItem.description : '';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[#05054D] text-[#FFF2A6] p-4 shadow-md z-50 flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            {activeSection === 'dashboard' ? 'Dashboard' : 'Production Master'}
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-2xl focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </header>
      )}

      {/* Left Sidebar */}
      <div className={`${isMobile ? 
        (isMobileMenuOpen ? 'fixed inset-0 z-40 w-64' : 'hidden') 
        : 'w-64'} bg-[#05054D] text-[#FFF2A6] shadow-xl`}>
        <div className="p-6 border-b border-[#1A1A6E]">
          <h2 className="text-xl font-bold text-center text-[#FFD700] flex items-center justify-center">
            <FaGem className="mr-2" />
            SONALIKA JEWELLERS
          </h2>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              setActiveSection('dashboard');
              setActiveForm(null);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === 'dashboard' 
                ? 'bg-[#1A1A6E] text-white shadow-md'
                : 'text-[#FFF2A6] hover:bg-[#1A1A6E] hover:text-white'
            }`}
          >
            <FaChartLine className="text-lg" />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              setActiveSection('master');
              setActiveForm(null);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === 'master' 
                ? 'bg-[#1A1A6E] text-white shadow-md'
                : 'text-[#FFF2A6] hover:bg-[#1A1A6E] hover:text-white'
            }`}
          >
            <FaCog className="text-lg" />
            <span className="font-medium">Master</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'mt-16' : ''}`}>
        {/* Desktop Top Header */}
        {!isMobile && (
          <header className="bg-[#05054D] text-[#FFF2A6] p-4 shadow-md">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                {activeSection === 'dashboard' ? 'Production Dashboard' : 'Production Master'}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="bg-[#1A1A6E] rounded-full w-8 h-8 flex items-center justify-center text-[#FFF2A6]">
                  <span className="font-medium">SK</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF]">
          {activeSection === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#E0E0E0]">
                <h2 className="text-xl md:text-2xl font-bold text-[#05054D] mb-2">Welcome to Sonalika Jewellers</h2>
                <p className="text-[#555555] mb-4 md:mb-6">Production Team Dashboard Overview</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-[#F0F4FF] border border-[#D6E0FF] rounded-lg p-3 md:p-4">
                    <h3 className="text-[#05054D] font-medium">Total Designs</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#1A1A6E]">1,248</p>
                  </div>
                  <div className="bg-[#F0FFF4] border border-[#D6FFE0] rounded-lg p-3 md:p-4">
                    <h3 className="text-[#006400] font-medium">Active Products</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#008000]">892</p>
                  </div>
                  <div className="bg-[#FFF8E6] border border-[#FFEBB2] rounded-lg p-3 md:p-4">
                    <h3 className="text-[#8A6D00] font-medium">In Production</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#FFD700]">156</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'master' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#E0E0E0]">
                {/* Master Header */}
                <div className="bg-[#05054D] px-4 md:px-6 py-3 md:py-4">
                  <h1 className="text-lg md:text-xl font-semibold text-[#FFF2A6]">Production Team Master</h1>
                </div>
                
                <div className="p-4 md:p-6">
                  {/* Centered Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mb-6 md:mb-8">
                    <button
                      onClick={() => setActiveForm('design')}
                      className={`px-4 py-2 md:px-8 md:py-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                        activeForm === 'design'
                          ? 'bg-[#FFD700] text-[#05054D] shadow-md font-semibold'
                          : 'bg-white border-2 border-[#FFD700] text-[#05054D] hover:bg-[#FFF8E6]'
                      }`}
                    >
                      <FaBoxOpen className="mr-2" />
                      Design Master
                    </button>

                    <button
                      onClick={() => setActiveForm('product')}
                      className={`px-4 py-2 md:px-8 md:py-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                        activeForm === 'product'
                          ? 'bg-[#1A6E1A] text-white shadow-md font-semibold'
                          : 'bg-white border-2 border-[#1A6E1A] text-[#1A6E1A] hover:bg-[#F0FFF4]'
                      }`}
                    >
                      <FaGem className="mr-2" />
                      Product Master
                    </button>
                  </div>

                  {/* Design Master Form */}
                  {activeForm === 'design' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#FAFAFA] p-4 md:p-6 rounded-lg border-2 border-[#EEEEEE]"
                    >
                      <h2 className="text-lg md:text-xl font-semibold text-[#05054D] mb-4 md:mb-6">Design Master Form</h2>
                      
                      {/* Desktop: Single Row Table */}
                      {!isMobile && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-[#323244] text-white">
                                <th className="p-3 text-left min-w-[120px]">Style No.</th>
                                <th className="p-3 text-left min-w-[100px]">Gross WT</th>
                                <th className="p-3 text-left min-w-[100px]">Net WT</th>
                                <th className="p-3 text-left min-w-[100px]">Dia WT</th>
                                <th className="p-3 text-left min-w-[100px]">Dia PCS</th>
                                <th className="p-3 text-left min-w-[120px]">Clarity</th>
                                <th className="p-3 text-left min-w-[120px]">Color</th>
                                <th className="p-3 text-left min-w-[80px]">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {designItems.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="p-3">
                                    <input 
                                      type="text" 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.styleNumber}
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, styleNumber: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input 
                                      type="number" 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.grossWt}
                                      step="0.01"
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, grossWt: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input 
                                      type="number" 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.netWt}
                                      step="0.01"
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, netWt: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input 
                                      type="number" 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.diaWt}
                                      step="0.01"
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, diaWt: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input 
                                      type="number" 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.diaPcs}
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, diaPcs: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <select 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.clarity}
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, clarity: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    >
                                      {['vvs', 'vvs-vs', 'vs', 'vs-si', 'si'].map(option => (
                                        <option key={option} value={option}>{option.toUpperCase()}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <select 
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.color}
                                      onChange={(e) => {
                                        const updatedItems = designItems.map(i => 
                                          i.id === item.id ? {...i, color: e.target.value} : i
                                        );
                                        setDesignItems(updatedItems);
                                      }}
                                    >
                                      {['e-f', 'f-g', 'g-h', 'h-i', 'i-j', 'I'].map(color => (
                                        <option key={color} value={color}>{color.toUpperCase()}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <button 
                                      onClick={() => removeDesignItem(item.id)}
                                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                      disabled={designItems.length <= 1}
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Mobile: Card Layout */}
                      {isMobile && (
                        <div className="space-y-4">
                          {designItems.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium text-[#05054D]">Item #{item.id}</h3>
                                <button 
                                  onClick={() => removeDesignItem(item.id)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  disabled={designItems.length <= 1}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Style Number</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.styleNumber}
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, styleNumber: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Gross WT (g)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.grossWt}
                                    step="0.01"
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, grossWt: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Net WT (g)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.netWt}
                                    step="0.01"
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, netWt: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Dia WT (ct)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.diaWt}
                                    step="0.01"
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, diaWt: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Dia PCS</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.diaPcs}
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, diaPcs: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Diamond Clarity</label>
                                  <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.clarity}
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, clarity: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  >
                                    {['vvs', 'vvs-vs', 'vs', 'vs-si', 'si'].map(option => (
                                      <option key={option} value={option}>{option.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Diamond Color</label>
                                  <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.color}
                                    onChange={(e) => {
                                      const updatedItems = designItems.map(i => 
                                        i.id === item.id ? {...i, color: e.target.value} : i
                                      );
                                      setDesignItems(updatedItems);
                                    }}
                                  >
                                    {['e-f', 'f-g', 'g-h', 'h-i', 'i-j', 'I'].map(color => (
                                      <option key={color} value={color}>{color.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Item Button */}
                      <div className="mt-6 flex justify-start">
                        <button 
                          onClick={addDesignItem}
                          className="flex items-center px-4 py-2 bg-[#05054D] text-[#FFF2A6] rounded-lg hover:bg-[#1A1A6E] transition-colors shadow-md"
                        >
                          <FaPlus className="mr-2" />
                          Add New Item
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                        <button 
                          type="button" 
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-[#05054D] text-[#FFF2A6] rounded-lg hover:bg-[#1A1A6E] transition-colors shadow-md"
                        >
                          Save Design
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Product Master Form */}
                  {activeForm === 'product' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-4 md:p-6 rounded-lg border border-gray-200"
                    >
                      <h2 className="text-lg md:text-xl font-semibold text-[#05054D] mb-4 md:mb-6">Product Master</h2>
                      
                      {/* Desktop: Single Row Table */}
                      {!isMobile && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-[#323244] text-white">
                                <th className="p-3 text-left min-w-[180px]">Product Category</th>
                                <th className="p-3 text-left min-w-[120px]">Size Type</th>
                                <th className="p-3 text-left min-w-[120px]">Size Value</th>
                                <th className="p-3 text-left min-w-[200px]">Description</th>
                                <th className="p-3 text-left min-w-[80px]">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productItems.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="p-3">
                                    <select
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.category}
                                      onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                    >
                                      <option value="">Select Category</option>
                                      {Object.keys(sizeData).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <select
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.sizeType}
                                      onChange={(e) => handleSizeTypeChange(item.id, e.target.value)}
                                      disabled={!item.category}
                                    >
                                      <option value="">Select Type</option>
                                      {item.category && sizeData[item.category]?.types.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <select
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={item.sizeValue}
                                      onChange={(e) => handleSizeValueChange(item.id, e.target.value)}
                                      disabled={!item.sizeType}
                                    >
                                      <option value="">Select Value</option>
                                      {item.sizeType && sizeData[item.category]?.values[item.sizeType]?.map(size => (
                                        <option key={size.value} value={size.value}>{size.value}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={getSizeDescription(item.category, item.sizeType, item.sizeValue)}
                                      readOnly
                                    />
                                  </td>
                                  <td className="p-3">
                                    <button 
                                      onClick={() => removeProductItem(item.id)}
                                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                      disabled={productItems.length <= 1}
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Mobile: Card Layout */}
                      {isMobile && (
                        <div className="space-y-4">
                          {productItems.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium text-[#05054D]">Item #{item.id}</h3>
                                <button 
                                  onClick={() => removeProductItem(item.id)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  disabled={productItems.length <= 1}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Product Category</label>
                                  <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.category}
                                    onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                  >
                                    <option value="">Select Category</option>
                                    {Object.keys(sizeData).map(category => (
                                      <option key={category} value={category}>{category}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Size Type</label>
                                  <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.sizeType}
                                    onChange={(e) => handleSizeTypeChange(item.id, e.target.value)}
                                    disabled={!item.category}
                                  >
                                    <option value="">Select Type</option>
                                    {item.category && sizeData[item.category]?.types.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Size Value</label>
                                  <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={item.sizeValue}
                                    onChange={(e) => handleSizeValueChange(item.id, e.target.value)}
                                    disabled={!item.sizeType}
                                  >
                                    <option value="">Select Value</option>
                                    {item.sizeType && sizeData[item.category]?.values[item.sizeType]?.map(size => (
                                      <option key={size.value} value={size.value}>{size.value}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={getSizeDescription(item.category, item.sizeType, item.sizeValue)}
                                    readOnly
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Item Button */}
                      <div className="mt-6 flex justify-start">
                        <button 
                          onClick={addProductItem}
                          className="flex items-center px-4 py-2 bg-[#05054D] text-[#FFF2A6] rounded-lg hover:bg-[#1A1A6E] transition-colors shadow-md"
                        >
                          <FaPlus className="mr-2" />
                          Add New Product Size
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                        <button 
                          type="button" 
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-[#05054D] text-[#FFF2A6] rounded-lg hover:bg-[#1A1A6E] transition-colors shadow-md"
                        >
                          Save Product Sizes
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductionTeam;