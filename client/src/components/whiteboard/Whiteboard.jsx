import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  PenTool,
  Eraser,
  Trash2,
  RotateCcw,
  Palette,
  Minus,
  Sparkles,
  Download,
} from 'lucide-react';
import Button from '../common/Button';
import { useSocket } from '../../context/SocketContext';

const COLOR_PALETTE = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Dark', value: '#1e293b' },
];

const STROKE_WIDTHS = [2, 4, 8, 16];

export const Whiteboard = ({ meetingId }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { socket } = useSocket();

  // Tool states
  const [tool, setTool] = useState('pencil'); // 'pencil' | 'eraser'
  const [color, setColor] = useState('#6366f1');
  const [width, setWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Local stroke buffer for smooth real-time rendering
  const currentStrokePoints = useRef([]);
  const allStrokes = useRef([]);

  // Draw a single stroke on canvas context
  const renderStroke = useCallback((ctx, stroke, canvasWidth, canvasHeight) => {
    if (!stroke || !stroke.points || stroke.points.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.width;

    if (stroke.tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = stroke.width * 2;
    } else {
      ctx.strokeStyle = stroke.color;
    }

    ctx.beginPath();
    const firstPoint = stroke.points[0];
    ctx.moveTo(firstPoint.x * canvasWidth, firstPoint.y * canvasHeight);

    for (let i = 1; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      ctx.lineTo(p.x * canvasWidth, p.y * canvasHeight);
    }

    ctx.stroke();
    ctx.restore();
  }, []);

  // Full re-render of all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const stroke of allStrokes.current) {
      renderStroke(ctx, stroke, canvas.width, canvas.height);
    }
  }, [renderStroke]);

  // Adjust canvas resolution on container resize
  useEffect(() => {
    const updateCanvasDimensions = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [redrawCanvas]);

  // Socket Whiteboard Synchronization
  useEffect(() => {
    if (!socket || !meetingId) return;

    const cleanMeetingId = meetingId.trim().toLowerCase();

    // Request initial canvas snapshot
    socket.emit('get-whiteboard-snapshot', { meetingId: cleanMeetingId });

    // 1. Initial snapshot received
    const handleSnapshot = ({ strokes }) => {
      allStrokes.current = strokes || [];
      redrawCanvas();
    };

    // 2. Remote peer drew a stroke
    const handleRemoteDraw = ({ stroke }) => {
      allStrokes.current.push(stroke);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderStroke(ctx, stroke, canvas.width, canvas.height);
        }
      }
    };

    // 3. Clear canvas event
    const handleRemoteClear = () => {
      allStrokes.current = [];
      redrawCanvas();
    };

    // 4. Undo event
    const handleRemoteUndo = ({ strokes }) => {
      allStrokes.current = strokes || [];
      redrawCanvas();
    };

    socket.on('whiteboard-snapshot', handleSnapshot);
    socket.on('whiteboard-draw', handleRemoteDraw);
    socket.on('whiteboard-clear', handleRemoteClear);
    socket.on('whiteboard-undo', handleRemoteUndo);

    return () => {
      socket.off('whiteboard-snapshot', handleSnapshot);
      socket.off('whiteboard-draw', handleRemoteDraw);
      socket.off('whiteboard-clear', handleRemoteClear);
      socket.off('whiteboard-undo', handleRemoteUndo);
    };
  }, [socket, meetingId, redrawCanvas, renderStroke]);

  // Pointer Event Handlers (Mouse & Touch compatible)
  const getNormalizedCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDrawing(true);
    const point = getNormalizedCoordinates(e);
    currentStrokePoints.current = [point];
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const point = getNormalizedCoordinates(e);
    currentStrokePoints.current.push(point);

    // Live preview of the stroke
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderStroke(
      ctx,
      {
        tool,
        color,
        width,
        points: currentStrokePoints.current,
      },
      canvas.width,
      canvas.height
    );
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokePoints.current.length >= 2) {
      const completedStroke = {
        tool,
        color,
        width,
        points: [...currentStrokePoints.current],
      };

      allStrokes.current.push(completedStroke);

      // Broadcast stroke through Socket.io
      if (socket && meetingId) {
        socket.emit('whiteboard-draw', {
          meetingId,
          stroke: completedStroke,
        });
      }
    }

    currentStrokePoints.current = [];
  };

  const handleClear = () => {
    allStrokes.current = [];
    redrawCanvas();
    if (socket && meetingId) {
      socket.emit('whiteboard-clear', { meetingId });
    }
  };

  const handleUndo = () => {
    allStrokes.current.pop();
    redrawCanvas();
    if (socket && meetingId) {
      socket.emit('whiteboard-undo', { meetingId });
    }
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `omnisync-whiteboard-${meetingId}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '0.75rem',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          background: 'var(--bg-tertiary)',
          padding: '0.6rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Tool Selectors */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <Button
            variant={tool === 'pencil' ? 'primary' : 'secondary'}
            size="sm"
            icon={PenTool}
            onClick={() => setTool('pencil')}
            title="Pencil"
          />
          <Button
            variant={tool === 'eraser' ? 'primary' : 'secondary'}
            size="sm"
            icon={Eraser}
            onClick={() => setTool('eraser')}
            title="Eraser"
          />
        </div>

        {/* Color Palette */}
        {tool === 'pencil' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: c.value,
                  border: color === c.value ? '2px solid #ffffff' : '1px solid var(--border-medium)',
                  transform: color === c.value ? 'scale(1.2)' : 'scale(1)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                title={c.label}
              />
            ))}
          </div>
        )}

        {/* Stroke Width Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--radius-sm)',
                background: width === w ? 'var(--primary)' : 'var(--bg-card)',
                color: '#ffffff',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={`${w}px width`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Actions: Undo, Clear, Snapshot */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleUndo}
            title="Undo last stroke"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={handleClear}
            title="Clear canvas"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleDownloadSnapshot}
            title="Save PNG image"
          />
        </div>
      </div>

      {/* HTML5 Canvas Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 340,
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          position: 'relative',
          cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
          touchAction: 'none',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
