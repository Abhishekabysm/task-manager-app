'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const FormField = ({ 
  label, 
  type, 
  id, 
  value, 
  onChange, 
  required = false, 
  validate = () => true,
  placeholder = '' 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Only validate if there is a value
    if (newValue) {
      setIsValid(validate(newValue));
    } else {
      setIsValid(false);
    }
  };
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required={required}
        />
        {value && isValid && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckIcon className="h-5 w-5 text-green-500" />
          </span>
        )}
      </div>
    </div>
  );
};

export default FormField;