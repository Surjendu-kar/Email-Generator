"use client";

import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadingSpinnerDemo() {
  const [message, setMessage] = useState("Generating email...");
  const [showSpinner, setShowSpinner] = useState(true);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        LoadingSpinner Component Demo
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Loading Message:
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter loading message..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showSpinner"
            checked={showSpinner}
            onChange={(e) => setShowSpinner(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showSpinner" className="text-sm text-gray-700">
            Show Loading Spinner
          </label>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview:</h3>
          <div className="bg-gray-50 rounded-lg p-8 min-h-[120px] flex items-center justify-center">
            {showSpinner ? (
              <LoadingSpinner message={message || undefined} />
            ) : (
              <p className="text-gray-500">Spinner is hidden</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Usage Examples:
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <code>&lt;LoadingSpinner /&gt;</code> - Basic spinner without
            message
          </p>
          <p>
            <code>
              &lt;LoadingSpinner message=&quot;Generating email...&quot; /&gt;
            </code>{" "}
            - Spinner with custom message
          </p>
          <p>
            <code>
              &lt;LoadingSpinner message=&quot;Sending emails...&quot; /&gt;
            </code>{" "}
            - Spinner for email sending
          </p>
        </div>
      </div>
    </div>
  );
}
