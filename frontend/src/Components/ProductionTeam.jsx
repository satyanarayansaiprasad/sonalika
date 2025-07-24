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

      {/* Left Sidebar - Using #05054D */}
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
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-[#323244] text-[#ffffff]">
                                <th className="p-3 text-left">Style No.</th>
                                <th className="p-3 text-left">Gross WT</th>
                                <th className="p-3 text-left">Net WT</th>
                                <th className="p-3 text-left">Dia WT</th>
                                <th className="p-3 text-left">Dia PCS</th>
                                <th className="p-3 text-left">Clarity</th>
                                <th className="p-3 text-left">Color</th>
                                <th className="p-3 text-left">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {designItems.map((item) => (
                                <tr key={item.id} className="border-b border-[#000000] hover:bg-[#F5F5F5]">
                                  <td className="p-3">
                                    <input 
                                      type="text" 
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="w-full border border-[#000000] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                      className="p-2 text-red-500 hover:text-red-700"
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
                            <div key={item.id} className="border border-[#DDDDDD] rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium text-[#05054D]">Item #{item.id}</h3>
                                <button 
                                  onClick={() => removeDesignItem(item.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  disabled={designItems.length <= 1}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Style Number</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Gross WT (g)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Net WT (g)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Dia WT (ct)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Dia PCS</label>
                                  <input 
                                    type="number" 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Diamond Clarity</label>
                                  <select 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                                  <label className="block mb-1 text-sm font-medium text-[#05054D]">Diamond Color</label>
                                  <select 
                                    className="w-full border border-[#DDDDDD] rounded px-3 py-2 focus:ring-1 focus:ring-[#1A1A6E]"
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
                      <div className="mt-4 flex justify-start">
                        <button 
                          onClick={addDesignItem}
                          className="flex items-center px-4 py-2 bg-[#05054D] text-[#FFF2A6] rounded hover:bg-[#1A1A6E]"
                        >
                          <FaPlus className="mr-2" />
                          Add New Item
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                        <button 
                          type="button" 
                          className="px-4 py-2 border border-[#DDDDDD] rounded-lg text-[#05054D] hover:bg-[#F5F5F5] transition"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-[#05054D] text-[#FFF2A6] rounded-lg hover:bg-[#1A1A6E] transition shadow-md"
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
                      className="bg-[#FAFAFA] p-4 md:p-6 rounded-lg border border-[#EEEEEE] text-center"
                    >
                      <div className="max-w-md mx-auto py-8 md:py-12">
                        <FaBoxOpen className="text-4xl md:text-5xl text-[#1A1A6E] mx-auto mb-4" />
                        <h2 className="text-xl md:text-2xl font-semibold text-[#05054D] mb-2">Product Master</h2>
                        <p className="text-[#555555] mb-6">This section is currently under development</p>
                        <button 
                          className="px-6 py-2 bg-[#05054D] text-[#FFF2A6] rounded-lg hover:bg-[#1A1A6E] transition shadow-md"
                          onClick={() => setActiveForm('design')}
                        >
                          Go to Design Master
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