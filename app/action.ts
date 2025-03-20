"use server";

import * as tf from "@tensorflow/tfjs";
import { getLabeledPiecesAndFEN, getTiles } from "./libfn";
import { Canvas, createCanvas, loadImage } from "canvas";

const baseUrl = "http://localhost:3001";
const frozenGraph = `${baseUrl}/frozen_model/tensorflowjs_model.pb`;
const weights = `${baseUrl}/frozen_model/weights_manifest.json`;

export async function calculateFen(dataURL: string) {
  if (!dataURL) return;
  let predictor: tf.FrozenModel | undefined;
  try {
    await tf.loadFrozenModel(frozenGraph, weights).then(function (result) {
      predictor = result;
    });
  } catch (error) {
    console.error("Error loading model:", error);
  }
  if (!predictor) return;

  const base64Data = dataURL.split(",")[1];
  const img = await loadImage(`data:image/png;base64,${base64Data}`);
  const canvas = createCanvas(img.width, img.height) as Canvas &
    HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = tf.fromPixels(canvas).asType("float32");
  const tiles = getTiles(imgData);
  const output = predictor.execute({ Input: tiles, KeepProb: tf.scalar(1.0) });
  const raw_predictions = Array.isArray(output)
    ? output[0].dataSync()
    : output.dataSync();
  const chessboard = getLabeledPiecesAndFEN(raw_predictions);
  return chessboard;
}
