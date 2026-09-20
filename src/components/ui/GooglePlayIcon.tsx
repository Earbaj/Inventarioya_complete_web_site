import React from "react";

export function GooglePlayIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Play Logo"
    >
      {/* Blue triangle left */}
      <path
        d="M3.609 1.814L13.792 12 3.61 22.186A2.023 2.023 0 0 1 3 20.722V3.278c0-.568.223-1.092.609-1.464z"
        fill="#4285F4"
      />
      {/* Green triangle top */}
      <path
        d="M17.18 8.613L13.792 12 3.61 1.814a2.08 2.08 0 0 1 1.055-.308c.552 0 1.092.174 1.572.486l10.943 6.62z"
        fill="#34A853"
      />
      {/* Red triangle bottom */}
      <path
        d="M17.18 15.387L6.237 22.008a2.63 2.63 0 0 1-1.572.486 2.08 2.08 0 0 1-1.055-.308L13.792 12l3.388 3.387z"
        fill="#EA4335"
      />
      {/* Yellow/Amber tip right */}
      <path
        d="M21.523 11.238l-4.343-2.625L13.792 12l3.388 3.387 4.343-2.625c.78-.472 1.258-1.278 1.258-2.262s-.478-1.79-1.258-2.262z"
        fill="#FBBC04"
      />
    </svg>
  );
}
