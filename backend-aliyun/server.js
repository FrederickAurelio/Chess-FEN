const tf = require("@tensorflow/tfjs");
const path = require('path');
const express = require("express");
const { getLabeledPiecesAndFEN, getTiles } = require("./libfn");
const sharp = require('sharp');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.use('/frozen_model', express.static(path.join(__dirname, 'frozen_model')));

app.post("/predict", async (req, res) => {
  try {
    const baseUrl = `http://localhost:${PORT}`;
    const frozenGraph = `${baseUrl}/frozen_model/tensorflowjs_model.pb`;
    const weights = `${baseUrl}/frozen_model/weights_manifest.json`;

    const { dataURL } = await req.body;
    if (!dataURL || typeof dataURL !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }
    let predictor;
    try {
      predictor = await tf.loadFrozenModel(frozenGraph, weights);
    } catch (error) {
      return res.status(500).json(
        {
          success: false,
          message: "Failed to load tensorflow model",
          error: error,
        }
      );
    }
    const base64Data = dataURL.split(",")[1];
    const imgBuffer = Buffer.from(base64Data, 'base64');
    const { data, info } = await sharp(imgBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imgData = tf.tensor(data, [info.height, info.width, info.channels], 'float32');

    const tiles = getTiles(imgData);
    const output = predictor?.execute({
      Input: tiles,
      KeepProb: tf.scalar(1.0),
    });
    const raw_predictions = Array.isArray(output)
      ? output[0].dataSync()
      : output?.dataSync();
    const chessboard = getLabeledPiecesAndFEN(raw_predictions);
    imgData.dispose();
    tiles.dispose();
    output.dispose();

    console.log(chessboard);

    return res.status(200).json(
      {
        success: true,
        message: "Fen Calculate successfully",
        chessboard: chessboard,
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      {
        success: false,
        message: "Internal Server Error",
        error: error,
      }
    );
  }
})

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});