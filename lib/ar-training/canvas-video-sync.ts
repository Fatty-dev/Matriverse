/** Set canvas pixel buffer to match the video frame dimensions. */
export function syncOverlayCanvasToVideo(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): void {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }
}
