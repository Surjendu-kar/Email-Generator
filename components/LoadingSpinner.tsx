"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Spinning circle animation */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>

      {/* Loading message */}
      {message && (
        <p className="text-sm text-gray-600 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
