import React from "react";

interface InputProps {
  label?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  placeholder,
  name,
  required = false,
  disabled = false,
  onChange,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-gray-700 font-medium text-lg">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      />
    </div>
  );
};

export default Input;
