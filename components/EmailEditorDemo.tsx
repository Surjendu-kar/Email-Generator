"use client";

import React, { useState } from "react";
import EmailEditor from "./EmailEditor";

export default function EmailEditorDemo() {
  const [content, setContent] = useState("");

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        EmailEditor Component Demo
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <EmailEditor
          content={content}
          onChange={setContent}
          placeholder="Start typing your email content here..."
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Current Content:
        </h2>
        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
          {content || "(No content yet)"}
        </pre>
      </div>
    </div>
  );
}
