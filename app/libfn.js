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
