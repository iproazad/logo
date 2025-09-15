
import React from 'react';

interface StyleButtonProps {
  label: string;
  onClick: () => void;
}

const StyleButton: React.FC<StyleButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-medium bg-gray-700 text-gray-200 rounded-full hover:bg-indigo-500 hover:text-white transition-colors duration-200"
    >
      {label}
    </button>
  );
};

export default StyleButton;
