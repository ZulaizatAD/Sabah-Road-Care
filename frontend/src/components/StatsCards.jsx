import React from "react";

const StatsCards = () => (
  <div className="grid grid-cols-4 gap-4 mb-8">
    <div className="bg-gray-200 rounded-lg p-6 text-center">
      <h3 className="font-semibold text-gray-800 mb-2">Total Case</h3>
      <p className="text-3xl font-bold text-gray-900">45</p>
    </div>
    <div className="bg-gray-200 rounded-lg p-6 text-center">
      <h3 className="font-semibold text-gray-800 mb-2">In Investigation</h3>
      <p className="text-3xl font-bold text-gray-900">20</p>
    </div>
    <div className="bg-gray-200 rounded-lg p-6 text-center">
      <h3 className="font-semibold text-gray-800 mb-2">
        Maintenance in Progress
      </h3>
      <p className="text-3xl font-bold text-gray-900">15</p>
    </div>
    <div className="bg-gray-200 rounded-lg p-6 text-center">
      <h3 className="font-semibold text-gray-800 mb-2">Case Close</h3>
      <p className="text-3xl font-bold text-gray-900">10</p>
    </div>
  </div>
);

export default StatsCards;
