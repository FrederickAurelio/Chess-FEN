import * as tf from "@tensorflow/tfjs";

// Contains functions to find centered + aligned chessboards in uploaded images.
export function findMax(arr, a, b) {
  // Assumes arr contains positives values.
  var maxVal = -1;
  var maxIdx = 0;
  for (var i = a; i < b; i++) {
    if (arr[i] > maxVal) {
      maxVal = arr[i];
      maxIdx = i;
    }
  }
  return { max: maxVal, idx: maxIdx };
}

// Sum up all the sobelX along rows and sobelY along colummns into 1D vectors.
export function squashSobels(pixels) {
  var w = pixels.width;
  var h = pixels.height;
  var d = new Float32Array(pixels.data);
  var scoreX = new Float32Array(w);
  var scoreY = new Float32Array(h);
  var buffer = 0; // only use central bit of image
  for (var y = buffer; y < h - buffer; y++) {
    for (var x = buffer; x < w - buffer; x++) {
      var off = (y * w + x) * 4;
      // Log space so we don't overweight sharp gradients too much
      scoreX[x] += Math.log(d[off] + 1);
      scoreY[y] += Math.log(d[off + 1] + 1);
    }
  }
  return { x: scoreX, y: scoreY }
}

export function findLines(squashed) {
  sX = squashed.x; // vertical lines, along x axis, squashed sum.
  sY = squashed.y; // horizontal lines, along y axis.
  // TODO.
}

export function getTiles(img_256x256) {
  // TODO: This is a bit hacky, but we can reshape files properly so lets just reshape every
  // file(column) and concat them together.
  var files = []; // 8 columns.
  // Note: Uses first channel, since it assumes images are grayscale.
  for (var i = 0; i < 8; i++) {
    // Entire (32*8)x32 file of 8 tiles, reshaped into an  8x1024 array
    files[i] = img_256x256.slice([0, 0 + 32 * i, 0], [32 * 8, 32, 1]).reshape([8, 1024]);
  }
  return tf.concat(files); // Concatanate all 8 8x1024 arrays into 64x1024 array.
}

export function getLabeledPiecesAndFEN(predictions) {
  // Build 2D array with piece prediction label for each tile, matching the input 256x256 image.
  var pieces = [];
  for (var rank = 8 - 1; rank >= 0; rank--) {
    pieces[rank] = [];
    for (var file = 0; file < 8; file++) {
      // Convert integer prediction into labeled FEN notation.
      pieces[rank][file] = '1KQRBNPkqrbnp'[predictions[rank + file * 8]]
    }
  }

  // Build FEN notation and HTML links for analysis and visualization.
  // Note: Does not contain castling information, lichess will automatically figure it out.
  var basic_fen = pieces.map(x => x.join('')).join('/')
    .replace(RegExp('11111111', 'g'), '8')
    .replace(RegExp('1111111', 'g'), '7')
    .replace(RegExp('111111', 'g'), '6')
    .replace(RegExp('11111', 'g'), '5')
    .replace(RegExp('1111', 'g'), '4')
    .replace(RegExp('111', 'g'), '3')
    .replace(RegExp('11', 'g'), '2');

  return { piece_array: pieces, fen: basic_fen };
}