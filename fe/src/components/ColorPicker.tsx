import { useState } from "react";

interface ColorPickerProps {}

export default function ColorPicker({}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState("#000000");

  const colorOptions = ["#000000", "#ff0000", "#00ff00", "#0000ff"];

  return (
    <>
      <div className="color-picker-wrapper">
        <div className="box-wrapper">
          {colorOptions.map((color) => {
            return (
              <div
                className={`box ${color === selectedColor ? "selected" : ""}`}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .color-picker-wrapper {
          position: fixed;
          top: 10px;
          left: 10px;
        }

        .box-wrapper {
          padding: 10px;

          display: flex;
          flex-direction: column;
          gap: 5px;

          background-color: #999999;
        }

        .box {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        .box.selected {
          border: 1px solid white;
        }
      `}</style>
    </>
  );
}
