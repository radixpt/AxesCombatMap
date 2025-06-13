// GridCell.jsx
import React from 'react';

export default function GridCell({ color, title, name, showName }) {
  return (
    <div
      className="w-3 h-3 border border-gray-200 relative"
      style={{ backgroundColor: color }}
      title={title}
    >
      {showName && name && (
        <span
          className="absolute left-1/2 -translate-x-1/2 -top-4 text-[10px] text-black pointer-events-none"
          style={{ whiteSpace: 'nowrap' }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
