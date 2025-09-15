
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
        Kaar Super Logo Generator
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Create a stunning logo for your channel with the power of AI.
      </p>
    </header>
  );
};

export default Header;
