import { NextResponse } from "next/server";
import * as tf from "@tensorflow/tfjs";
import { getLabeledPiecesAndFEN, getTiles } from "../libfn";
import { Canvas, createCanvas, loadImage } from "canvas";

const baseUrl = "http://localhost:3001";
const frozenGraph = `${baseUrl}/frozen_model/tensorflowjs_model.pb`;
const weights = `${baseUrl}/frozen_model/weights_manifest.json`;

export async function POST(req: Request) {
  try {
    const { dataURL } = await req.json();
    let predictor: tf.FrozenModel | undefined;
    try {
      predictor = await tf.loadFrozenModel(frozenGraph, weights);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to load tensorflow model",
          error: error,
        },
        { status: 500 }
      );
    }

    const base64Data = dataURL.split(",")[1];
    const img = await loadImage(`data:image/png;base64,${base64Data}`);
    const canvas = createCanvas(img.width, img.height) as Canvas &
      HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imgData = tf.fromPixels(canvas).asType("float32");
    const tiles = getTiles(imgData);
    const output = predictor?.execute({
      Input: tiles,
      KeepProb: tf.scalar(1.0),
    });
    const raw_predictions = Array.isArray(output)
      ? output[0].dataSync()
      : output?.dataSync();
    const chessboard = getLabeledPiecesAndFEN(raw_predictions);

    return NextResponse.json(
      {
        success: true,
        message: "Fen Calculate successfully",
        chessboard: chessboard,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
