"use client";

import React, { useCallback, useRef, useEffect } from "react";

interface EmailEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function EmailEditor({
  content,
  onChange,
  placeholder = "Your AI-generated email will appear here. You can edit it before sending.",
}: EmailEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle content changes with real-time updates
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      onChange(newContent);
    },
    [onChange]
  );

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight to fit content
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  // Handle keyboard shortcuts for common text editing operations
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow standard text editing shortcuts to work naturally
      // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, etc. are handled by the browser

      // Tab key handling for better UX
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert tab character
        const newContent =
          content.substring(0, start) + "  " + content.substring(end);
        onChange(newContent);

        // Set cursor position after the inserted spaces
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    },
    [content, onChange]
  );

  return (
    <div className="space-y-3">
      <label
        htmlFor="email-editor"
        className="block text-sm font-medium text-gray-700"
      >
        Email Content
      </label>

      <div className="relative">
        <textarea
          id="email-editor"
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            content ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
          }`}
          style={{
            minHeight: "120px",
            lineHeight: "1.6",
            fontFamily: "inherit",
          }}
          spellCheck={true}
          autoComplete="off"
          aria-describedby="email-editor-help"
        />

        {/* Character count indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
          {content.length} characters
        </div>
      </div>

      {/* Helper text */}
      <div id="email-editor-help" className="text-xs text-gray-500 space-y-1">
        <p>
          Edit your email content here. The text area will automatically resize
          as you type.
        </p>
        <p>
          Use standard keyboard shortcuts: Ctrl+A (select all), Ctrl+C (copy),
          Ctrl+V (paste), Ctrl+Z (undo).
        </p>
      </div>

      {/* Content status indicator */}
      {content && (
        <div className="flex items-center text-sm text-green-600">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Email content ready for sending
        </div>
      )}
    </div>
  );
}
