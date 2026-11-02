/**
 * Video rendering and export utility
 * Renders HTML5 Video, Canvas Subtitles, Filters, and Audio directly in the browser
 */

export interface ExportProgress {
  progress: number; // 0 to 100
  status: 'idle' | 'rendering' | 'encoding' | 'completed' | 'error';
  renderedFrames: number;
  totalFrames: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export class VideoExportEngine {
  private isCancelled = false;

  public cancel() {
    this.isCancelled = true;
  }

  /**
   * Fast rendering pipeline that captures video frames and renders subtitles onto a canvas
   */
  public async renderVideo(
    videoElement: HTMLVideoElement,
    clipDuration: number,
    options: {
      width: number;
      height: number;
      fps: number;
      drawFrame: (ctx: CanvasRenderingContext2D, time: number) => void;
      onProgress: (p: ExportProgress) => void;
    }
  ): Promise<Blob> {
    this.isCancelled = false;
    const { width, height, fps, drawFrame, onProgress } = options;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not supported');

    // Create a stream from the canvas
    const stream = canvas.captureStream(fps);

    // Determine supported mime type
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    let selectedMime = 'video/webm';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 6000000, // 6 Mbps high quality
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const outputBlob = new Blob(recordedChunks, { type: selectedMime });
        onProgress({
          progress: 100,
          status: 'completed',
          renderedFrames: Math.floor(clipDuration * fps),
          totalFrames: Math.floor(clipDuration * fps),
          downloadUrl: URL.createObjectURL(outputBlob),
        });
        resolve(outputBlob);
      };

      mediaRecorder.start(100);

      const totalFrames = Math.floor(clipDuration * fps);
      let currentFrame = 0;

      const renderNextStep = () => {
        if (this.isCancelled) {
          mediaRecorder.stop();
          reject(new Error('Export dibatalkan oleh pengguna.'));
          return;
        }

        if (currentFrame >= totalFrames) {
          onProgress({
            progress: 98,
            status: 'encoding',
            renderedFrames: totalFrames,
            totalFrames,
          });
          setTimeout(() => {
            mediaRecorder.stop();
          }, 300);
          return;
        }

        const simTime = (currentFrame / fps);
        drawFrame(ctx, simTime);

        currentFrame++;
        const pct = Math.floor((currentFrame / totalFrames) * 95);

        if (currentFrame % 5 === 0 || currentFrame === totalFrames) {
          onProgress({
            progress: pct,
            status: 'rendering',
            renderedFrames: currentFrame,
            totalFrames,
          });
        }

        // Use requestAnimationFrame for smooth non-blocking execution
        requestAnimationFrame(renderNextStep);
      };

      renderNextStep();
    });
  }
}

export const exportEngine = new VideoExportEngine();
