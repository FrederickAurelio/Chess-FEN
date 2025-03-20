import Filters from "./filters.js";
import { findMax, squashSobels } from "./libfn.js";

export function processImage(
  img: HTMLImageElement,
  sobelCanvas: HTMLCanvasElement | null,
  resultCanvas: HTMLCanvasElement | null
) {
  if (!img || !sobelCanvas || !resultCanvas) return null;
  const ctx = sobelCanvas.getContext("2d")!;
  // Resize the image
  const internalCanvas = document.createElement("canvas");
  const width = 512;
  let height = Math.floor((img.height * width) / img.width);
  if (height % 2 != 0) {
    height += 1;
  }
  const scale_factor = img.width / width;
  internalCanvas.width = width;
  internalCanvas.height = height;
  const internalCanvasCtx = internalCanvas.getContext("2d");
  if (internalCanvasCtx) {
    internalCanvasCtx.drawImage(img, 0, 0, width, height);
  }
  let d = Filters.filterImage(Filters.gaussianBlur, internalCanvas, 5); // gaussian
  d = Filters.sobel(d);

  // Visualize sobel image.
  sobelCanvas.width = d.width;
  sobelCanvas.height = d.height;
  const sobelCanvasCtx = sobelCanvas.getContext("2d");
  if (sobelCanvasCtx) {
    sobelCanvasCtx.drawImage(img, 0, 0, width, height);
  }

  const squashed = squashSobels(d);
  const winsize = 30;
  const ctrX = findMax(
    squashed.x,
    Math.floor(width / 2) - winsize,
    Math.floor(width / 2) + winsize
  );
  const leftX = findMax(squashed.x, ctrX.idx - 65, ctrX.idx - 31);
  const rightX = findMax(squashed.x, ctrX.idx + 31, ctrX.idx + 65);
  const ctrY = findMax(
    squashed.y,
    Math.floor(height / 2) - winsize,
    Math.floor(height / 2) + winsize
  );
  const botY = findMax(squashed.y, ctrY.idx + 31, ctrY.idx + 65);
  const topY = findMax(squashed.y, ctrY.idx - 65, ctrY.idx - 31);

  const deltaX = (rightX.idx - leftX.idx) / 2;
  const deltaY = (botY.idx - topY.idx) / 2;

  const positionsX = Array(9)
    .fill(0)
    .map((e, i) => (i - 4) * deltaX + ctrX.idx);
  const positionsY = Array(9)
    .fill(0)
    .map((e, i) => (i - 4) * deltaY + ctrY.idx);

  ctx.beginPath();
  // X
  for (let i = 0; i < positionsX.length; i++) {
    ctx.moveTo(positionsX[i], positionsY[0]);
    ctx.lineTo(positionsX[i], positionsY[positionsY.length - 1]);
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff0000";
  ctx.stroke();
  ctx.closePath();

  // Y
  ctx.beginPath();
  for (let i = 0; i < positionsY.length; i++) {
    ctx.moveTo(positionsX[0], positionsY[i]);
    ctx.lineTo(positionsX[positionsX.length - 1], positionsY[i]);
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00ff00";
  ctx.stroke();

  const bbox = {
    tl: { x: positionsX[0], y: positionsY[0] },
    tr: { x: positionsX[positionsX.length - 1], y: positionsY[0] },
    br: {
      x: positionsX[positionsX.length - 1],
      y: positionsY[positionsY.length - 1],
    },
    bl: { x: positionsX[0], y: positionsY[positionsY.length - 1] },
  };

  // Border
  ctx.beginPath();
  ctx.moveTo(bbox.tl.x, bbox.tl.y);
  ctx.lineTo(bbox.tr.x, bbox.tr.y);
  ctx.lineTo(bbox.br.x, bbox.br.y);
  ctx.lineTo(bbox.bl.x, bbox.bl.y);
  ctx.lineTo(bbox.tl.x, bbox.tl.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ffff00";
  ctx.stroke();

  resultCanvas.width = 256;
  resultCanvas.height = 256;

  const bbox_width = bbox.tr.x - bbox.tl.x;
  const bbox_height = bbox.bl.y - bbox.tl.y;

  const resultCanvasCtx = resultCanvas.getContext("2d");
  if (resultCanvasCtx) {
    resultCanvasCtx.imageSmoothingQuality = "high";
    resultCanvasCtx.drawImage(
      img,
      bbox.tl.x * scale_factor,
      bbox.tl.y * scale_factor,
      bbox_width * scale_factor,
      bbox_height * scale_factor,
      0,
      0,
      256,
      256
    );
  }
}
