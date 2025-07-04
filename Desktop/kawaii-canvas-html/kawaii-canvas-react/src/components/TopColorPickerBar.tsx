import React, { useState } from 'react';

const COLORS = [
  '#ffffff', '#E6E6FA', '#FFE4E1', '#FFEAA7', '#FDCB6E',
  '#A8E6CF', '#B8C5FF', '#F8BBD9', '#B8C5FF', '#F8BBD9',
  '#B8C5FF', '#F8BBD9',
];

interface TopColorPickerBarProps {
  visible: boolean;
  onSelect: (color: string) => void;
}

const TopColorPickerBar: React.FC<TopColorPickerBarProps> = ({ visible, onSelect }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onSelect(color);
  };

  return (
    <div
      className={`toolbar-top fixed left-1/2 z-[101]`}
      style={{
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s',
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(calc(8px - 54.35%)) translateY(0)'
          : 'translateX(calc(8px - 54.35%)) translateY(100%)',
      }}
    >
      <div className="circle-panel-content">
        <div className="color-circles">
          {COLORS.map((color, idx) => (
                            <button
                  key={color + idx}
                  className={`color-circle ${selectedColor === color ? 'selected' : ''} ${color === '#ffffff' ? 'white-color-circle' : ''}`}
                  style={{ 
                    backgroundColor: color, 
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => handleColorSelect(color)}
                  aria-label={`Pick color ${color}`}
                />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopColorPickerBar; 