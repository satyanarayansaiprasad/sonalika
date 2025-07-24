import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaThLarge } from 'react-icons/fa';

const ProductionTeam = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeForm, setActiveForm] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#05054D] text-[#FFF2A6] p-6">
        <h2 className="text-xl font-bold mb-8 text-center">SONALIKA JEWELLERS</h2>
        <div className="space-y-4">
          <div
            className="bg-[#FFF2A6] text-[#05054D] rounded-lg flex items-center px-4 py-2 cursor-pointer"
            onClick={() => {
              setActiveSection('dashboard');
              setActiveForm(null);
            }}
          >
            <FaThLarge className="mr-2" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div
            className="bg-[#FFF2A6] text-[#05054D] rounded-lg flex items-center px-4 py-2 cursor-pointer"
            onClick={() => {
              setActiveSection('master');
              setActiveForm(null);
            }}
          >
            <FaThLarge className="mr-2" />
            <span className="font-medium">Master</span>
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 p-8 bg-gray-100 overflow-auto">
        {activeSection === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-semibold text-gray-800"
          >
            Welcome to Sonalika Jewellers Dashboard
          </motion.div>
        )}

        {activeSection === 'master' && (
          <>
            <h1 className="text-2xl font-semibold mb-6">Production Team</h1>

            {/* Buttons */}
            <div className="mb-6 space-x-4">
              <button
                onClick={() => setActiveForm('design')}
                className={`px-4 py-2 rounded transition duration-300 ${
                  activeForm === 'design'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white border border-yellow-500 text-yellow-700'
                }`}
              >
                Create Design Master
              </button>

              <button
                onClick={() => setActiveForm('product')}
                className={`px-4 py-2 rounded transition duration-300 ${
                  activeForm === 'product'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-green-600 text-green-600'
                }`}
              >
                Create Product Master
              </button>
            </div>

            {/* Design Master Form */}
            {activeForm === 'design' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded shadow-md w-full max-w-2xl"
              >
                <h2 className="text-xl font-semibold mb-4">Design Master</h2>
                <form className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Style Number</label>
                    <input type="text" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Gross WT</label>
                    <input type="number" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Net WT</label>
                    <input type="number" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Dia WT</label>
                    <input type="number" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Dia PCS</label>
                    <input type="number" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Diamond Clarity</label>
                    <select className="w-full border p-2 rounded">
                      {['vvs', 'vvs-vs', 'vs', 'vs-si', 'si'].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Diamond Color</label>
                    <select className="w-full border p-2 rounded">
                      {['e-f', 'f-g', 'g-h', 'h-i', 'i-j', 'I'].map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Product Master Form */}
            {activeForm === 'product' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded shadow-md w-full max-w-2xl"
              >
                <h2 className="text-xl font-semibold mb-4">Product Master (Coming Soon)</h2>
                <p>This section is under development.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductionTeam;
