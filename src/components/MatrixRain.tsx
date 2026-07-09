import { useEffect, useRef } from 'react';

const MATRIX_CHARS = '01PROMPTINSPECTOR{}[]<>#$%&@*+-'.split('');

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      columns = Math.max(1, Math.floor(width / 18));
      drops = Array.from({ length: columns }, () => Math.random() * height);
    };

    const draw = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.08)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = 'rgba(34, 197, 94, 0.56)';
      context.font = '16px JetBrains Mono, monospace';

      for (let column = 0; column < columns; column += 1) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = column * 18;
        const y = drops[column];

        context.fillText(char, x, y);
        drops[column] = y > height && Math.random() > 0.975 ? 0 : y + 18;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-25" />;
}
