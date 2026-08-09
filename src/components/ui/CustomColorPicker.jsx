import { useEffect, useRef, useState, useCallback } from "react";
import { Palette, X, Check } from "lucide-react";

const WHEEL_SIZE = 220;

/**
 * HSL rainbow wheel color picker — canvas негізінде.
 * Trigger батырма — қарапайым glassmorphism (search батырмасы стилінде),
 * ешбір rainbow фон жоқ. Басқанда экранның дәл ортасында modal ашылады.
 */
export default function CustomColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="aspect-square rounded-full bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center text-gray-200 hover:bg-white/15 hover:text-white active:scale-95 transition-all"
        aria-label="Свой цвет"
      >
        <Palette className="w-3.5 h-3.5" strokeWidth={2.2} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/50 backdrop-blur-sm animate-fade-up"
          onClick={() => setOpen(false)}
        >
          <div
            className="modal-panel p-5 flex flex-col items-center gap-3 relative w-full max-w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" strokeWidth={2.4} />
            </button>

            <h3 className="text-white text-[14px] font-semibold self-start mb-1">Свой цвет</h3>

            <ColorWheel value={value} onChange={onChange} onConfirm={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function ColorWheel({ value, onChange, onConfirm }) {
  const canvasRef = useRef(null);
  const [cursorPos, setCursorPos] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = WHEEL_SIZE;
    const radius = size / 2;

    ctx.clearRect(0, 0, size, size);

    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;

        if (dist <= radius) {
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
          const sat = Math.min(1, dist / radius);
          const [r, g, b] = hslToRgb(angle / 360, sat, 0.5);
          imageData.data[idx] = r;
          imageData.data[idx + 1] = g;
          imageData.data[idx + 2] = b;
          imageData.data[idx + 3] = 255;
        } else {
          imageData.data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  function pickAt(clientX, clientY) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const radius = WHEEL_SIZE / 2;
    const dx = x - radius;
    const dy = y - radius;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > radius) return;

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
    const sat = Math.min(1, dist / radius);
    const [r, g, b] = hslToRgb(angle / 360, sat, 0.5);
    const hex = rgbToHex(r, g, b);
    onChange(hex);
    setCursorPos({ x, y });
  }

  function handlePointerDown(e) {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    pickAt(point.clientX, point.clientY);

    function handleMove(moveEvent) {
      const movePoint = moveEvent.touches ? moveEvent.touches[0] : moveEvent;
      pickAt(movePoint.clientX, movePoint.clientY);
    }
    function handleUp() {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
  }

  return (
    <>
      <div className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
        <canvas
          ref={canvasRef}
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          className="rounded-full cursor-pointer touch-none"
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
        {cursorPos && (
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              backgroundColor: value,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-3 w-full">
        <div
          className="w-8 h-8 rounded-full border-2 border-white/20 shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-gray-300 text-[12px] font-mono flex-1">{value}</span>
        <button
          type="button"
          onClick={onConfirm}
          className="btn-3d w-8 h-8 rounded-full shrink-0"
          aria-label="Готово"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={2.4} />
        </button>
      </div>
    </>
  );
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
