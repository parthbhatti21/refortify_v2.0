import React from 'react';

interface FormInputsProps {
  formData: {
    clientName: string;
    clientAddress: string;
    chimneyType: string;
  };
  updateFormData: (data: Partial<{ clientName: string; clientAddress: string; chimneyType: string }>) => void;
}

const FormInputs: React.FC<FormInputsProps> = ({ formData, updateFormData }) => {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Enter Report Details</h3>
      
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
          Client Name *
        </label>
        <input
          type="text"
          id="clientName"
          value={formData.clientName}
          onChange={(e) => handleInputChange('clientName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
          placeholder="Enter client name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Client Address *
        </label>
        <input
          type="text"
          id="clientAddress"
          value={formData.clientAddress}
          onChange={(e) => handleInputChange('clientAddress', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
          placeholder="Enter client address"
          required
        />
      </div>

      <div>
        <label htmlFor="chimneyType" className="block text-sm font-medium text-gray-700 mb-2">
          Chimney Type *
        </label>
        <select
          id="chimneyType"
          value={formData.chimneyType}
          onChange={(e) => handleInputChange('chimneyType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
          required
        >
          <option value="">Select chimney type</option>
          <option value="masonry">Masonry</option>
          <option value="prefabricated">Prefabricated</option>
        </select>
      </div>
    </div>
  );
};

export default FormInputs;
