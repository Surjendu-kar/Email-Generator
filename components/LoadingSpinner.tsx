"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Spinning circle animation with gradient */}
      <div className="relative">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200"></div>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-blue-600 border-r-blue-500 absolute top-0 left-0"></div>
      </div>

      {/* Loading message */}
      {message && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-slate-700 animate-pulse">
            {message}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
