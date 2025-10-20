import { useEffect, useRef } from "react";
import "./index.css";
import { setupCanvas } from "./canvas";

export function App() {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    return setupCanvas(canvasRef.current!).cleanup;
  }, []);
  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
