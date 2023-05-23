import { useEffect } from "react";

interface UseSendCanvasDrawingParams {
  drawingDataChannel?: RTCDataChannel;
  color?: string;
  lineWidth?: number;
  userName?: string;
}

export default function useCanvasDrawing(props: UseSendCanvasDrawingParams) {
  const { drawingDataChannel, color = "#000000", lineWidth = 2.5, userName } = props;

  useEffect(() => {
    if (!drawingDataChannel) return;

    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;

    let isPainting = false;

    const startDrawing = () => {
      isPainting = true;
    };
    const stopDrawing = () => {
      isPainting = false;
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("pointermove", (event) => {
      const x = event.offsetX;
      const y = event.offsetY;

      if (isPainting) {
        context.lineTo(x, y);
        context.stroke();
      } else {
        context.beginPath();
        context.moveTo(x, y);
      }

      const relativeX = x / canvas.getBoundingClientRect().width;
      const relativeY = y / canvas.getBoundingClientRect().height;

      const data = { isPainting, relativeX, relativeY, userName };
      drawingDataChannel.send(JSON.stringify(data));
    });
  }, [drawingDataChannel, color, lineWidth]);
}
