import { NextResponse } from "next/server";
import * as tf from "@tensorflow/tfjs";
import { getLabeledPiecesAndFEN, getTiles } from "../libfn";
import sharp from "sharp";

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
    const imgBuffer = Buffer.from(base64Data, "base64");
    const { data, info } = await sharp(imgBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imgData = tf.tensor(
      data,
      [info.height, info.width, info.channels],
      "float32"
    );

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
