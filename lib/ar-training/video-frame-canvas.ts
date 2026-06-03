const frameCanvasCache = new WeakMap<HTMLVideoElement, HTMLCanvasElement>();

export function getVideoFrameCanvas(
  video: HTMLVideoElement,
  mirrored: boolean
): HTMLCanvasElement {
  let canvas = frameCanvasCache.get(video);
  if (!canvas) {
    canvas = document.createElement("canvas");
    frameCanvasCache.set(video, canvas);
  }

  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.save();
  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  return canvas;
}
