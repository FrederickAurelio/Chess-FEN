"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState, useTransition } from "react";
import { processImage } from "./helper";
import { calculateFen } from "./action";

function App() {
  const [imgFile, setImgFile] = useState<File | null>(null);
  const sobelCanvas = useRef<HTMLCanvasElement | null>(null);
  const resultCanvas = useRef<HTMLCanvasElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleImageFile = (file: File) => {
    setImgFile(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    if (!imgFile || !sobelCanvas.current || !resultCanvas.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        processImage(img, sobelCanvas.current, resultCanvas.current);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(imgFile);
  }, [imgFile]);

  return (
    <section className="w-full h-dvh bg-amber-50 px-48 py-20">
      <div className="flex gap-3 flex-col justify-center w-full items-center">
        <h1 className="text-3xl">
          Predicting Chessboard Layouts from Screenshots
        </h1>
        <div className="flex items-center cursor-pointer hover:scale-105 duration-100">
          <label htmlFor="imageLoader" className="w-[35ch]">
            Input screenshot file:
          </label>
          <Input
            onChange={handleImageChange}
            className="cursor-pointer"
            accept="image/*"
            id="imageLoader"
            name="imageLoader"
            type="file"
          />
        </div>
        <div
          className="cursor-pointer flex items-center justify-center border-5 rounded-3xl border-amber-950 w-[350px] h-[350px] bg-amber-100 shadow-md shadow-neutral-950"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("imageLoader")?.click()}
        >
          <canvas
            className="w-full h-full rounded-2xl"
            ref={sobelCanvas}
            id="sobelCanvas"
          />
        </div>
        <button
          onClick={() =>
            startTransition(() => {
              if (resultCanvas.current) calculateFen(resultCanvas.current);
            })
          }
          className="cursor-pointer shadow-md shadow-neutral-950 mt-3 px-4 bg-amber-300 border-2 rounded-lg border-amber-800 py-2 hover:shadow-sm hover:translate-y-1 text-amber-950 font-bold active:opacity-75"
        >
          Calculate FEN
        </button>
        <h2 className="text-lg">
          FEN:{" "}
          <span className="text-sm">
            rn1qkb1r/p4ppb/1pp1pn1p/4N3/2BP2P1/1QN1P2P/PP3P2/R1B2RK1
          </span>
        </h2>

        <canvas className="hidden" ref={resultCanvas} id="resultCanvas" />
      </div>
    </section>
  );
}

export default App;
