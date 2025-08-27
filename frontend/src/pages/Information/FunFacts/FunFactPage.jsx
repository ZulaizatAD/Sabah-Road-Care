import React, { useState } from 'react';

const Buttons = ({ onPage1Click, onPage2Click }) => {
    return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        onClick={onPage1Click}
        className="flex-1 py-3 px-6 text-white text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        Go to Page 1
      </button>
      <button
        onClick={onPage2Click}
        className="flex-1 py-3 px-6 text-white text-lg font-semibold bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
      >
        Go to Page 2
      </button>
    </div>
  );
};

const renderPage = () => {
    switch (page) {
      case 'page1':
        return (
          <div className="p-8 text-center bg-gray-100 rounded-lg shadow-inner">
            <h2 className="text-3xl font-bold text-gray-800">Welcome to Page 1!</h2>
            <p className="mt-4 text-lg text-gray-600">This is the content for the first page. You can add anything here.</p>
          </div>
        );
      case 'page2':
        return (
          <div className="p-8 text-center bg-gray-100 rounded-lg shadow-inner">
            <h2 className="text-3xl font-bold text-gray-800">Welcome to Page 2!</h2>
            <p className="mt-4 text-lg text-gray-600">This is the content for the second page. Feel free to customize this section.</p>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="p-8 text-center bg-white rounded-lg shadow-inner">
            <h2 className="text-3xl font-bold text-gray-800">Click a button to navigate!</h2>
            <p className="mt-4 text-lg text-gray-600">The content will change below the buttons.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Render the Buttons component and pass the necessary props */}
        <Buttons 
          onPage1Click={() => handlePageChange('page1')}
          onPage2Click={() => handlePageChange('page2')}
        />

        {/* This section renders the content based on the current page state. */}
        <div className="mt-8 border-t-2 border-gray-200 pt-8">
          {renderPage()}
        </div>
      </div>
    </div>
  );

export default App;