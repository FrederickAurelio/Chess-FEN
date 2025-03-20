"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState, useTransition } from "react";
import { processImage } from "./helper";
import { calculateFen } from "./action";
import { FaRegChessKnight } from "react-icons/fa6";
import { FaChessBishop } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import Anchor from "@/components/ui/Anchor";

function App() {
  const [imgFile, setImgFile] = useState<File | null>(null);
  const sobelCanvas = useRef<HTMLCanvasElement | null>(null);
  const resultCanvas = useRef<HTMLCanvasElement | null>(null);
  const [fenValue, setFenValue] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleCalculateFEN = async () => {
    if (imgFile && resultCanvas.current) {
      const dataURL = resultCanvas.current.toDataURL("image/png");
      try {
        const res = await calculateFen(dataURL);
        if (res) setFenValue(res.fen);
      } catch (error) {
        console.error("Error calculating FEN:", error);
        // Optionally, set an error state or show a message to the user
      }
    }
  };

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
    <section className="w-full h-dvh bg-amber-50 px-48 flex items-center justify-center">
      <div className="flex gap-3 flex-col justify-center w-full items-center">
        <h1 className="text-3xl">
          Predicting Chessboard Layouts from Screenshots
        </h1>
        <div
          className={`flex items-center duration-100 ${
            isPending
              ? "cursor-not-allowed hover:scale-100"
              : " hover:scale-105 cursor-pointer"
          }`}
        >
          <label
            htmlFor="imageLoader"
            className={`w-[35ch] ${
              isPending ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            Input screenshot file:
          </label>
          <Input
            disabled={isPending}
            onChange={handleImageChange}
            className="cursor-pointer disabled:cursor-not-allowed"
            accept="image/*"
            id="imageLoader"
            name="imageLoader"
            type="file"
          />
        </div>
        <div
          className={`flex items-center justify-center border-5 rounded-3xl border-amber-950 w-[300px] h-[300px] bg-amber-100 shadow-md shadow-neutral-950 ${
            isPending ? "cursor-not-allowed" : "cursor-pointer"
          }`}
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
        <Button
          disabled={isPending}
          onClick={() => startTransition(handleCalculateFEN)}
        >
          Calculate FEN
        </Button>
        <h2 className="text-lg mb-2">
          FEN: <span className="text-sm">{fenValue}</span>
        </h2>
        <div className="flex gap-5">
          {fenValue && (
            <Anchor href={`https://lichess.org/analysis/${fenValue}_w`}>
              <FaRegChessKnight size={32} />
              Play as White
            </Anchor>
          )}
          {fenValue && (
            <Anchor href={`https://lichess.org/analysis/${fenValue}_b`}>
              <FaChessBishop size={32} />
              Play as Black
            </Anchor>
          )}
        </div>
        <canvas className="hidden" ref={resultCanvas} id="resultCanvas" />
      </div>
    </section>
  );
}

export default App;
