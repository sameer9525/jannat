
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OverlayImageState } from '../types';

interface GlobalOverlayImageProps {
  initialState: OverlayImageState;
  onUpdate: (newState: Partial<OverlayImageState>) => void;
  onClose: () => void; // This prop is called by the 'X' button
  // isAdminLoggedIn prop removed
}

const GlobalOverlayImage: React.FC<GlobalOverlayImageProps> = ({ initialState, onUpdate, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const [actualControlsVisible, setActualControlsVisible] = useState(false);

  const [dragStart, setDragStart] = useState<{ x: number; y: number; mouseX: number; mouseY: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number; mouseX: number; mouseY: number } | null>(null);
  const [rotateStart, setRotateStart] = useState<{ centerX: number; centerY: number; startAngle: number; initialRotation: number } | null>(null);

  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== imageRef.current && (e.target as HTMLElement).dataset?.interactiveHandle === "true") {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    setActualControlsVisible(true);
    setIsDragging(true);
    setDragStart({
      x: initialState.x,
      y: initialState.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActualControlsVisible(true);
    setIsResizing(true);
    setResizeStart({
      width: initialState.width,
      height: initialState.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  const handleMouseDownRotate = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageRef.current) return;
    setActualControlsVisible(true);

    const rect = imageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    setIsRotating(true);
    setRotateStart({
      centerX,
      centerY,
      startAngle,
      initialRotation: initialState.rotation,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dragStart) {
      const dx = e.clientX - dragStart.mouseX;
      const dy = e.clientY - dragStart.mouseY;
      onUpdate({ x: dragStart.x + dx, y: dragStart.y + dy });
    } else if (isResizing && resizeStart && initialState.originalWidth && initialState.originalHeight) {
      const dx = e.clientX - resizeStart.mouseX;
      const newWidth = Math.max(50, resizeStart.width + dx); // Min width 50px
      const aspectRatio = initialState.originalWidth / initialState.originalHeight;
      const newHeight = newWidth / aspectRatio;
      onUpdate({ width: newWidth, height: newHeight });

    } else if (isRotating && rotateStart) {
      const currentAngle = Math.atan2(e.clientY - rotateStart.centerY, e.clientX - rotateStart.centerX);
      const angleDiff = currentAngle - rotateStart.startAngle;
      onUpdate({ rotation: rotateStart.initialRotation + (angleDiff * 180) / Math.PI });
    }
  }, [isDragging, dragStart, isResizing, resizeStart, isRotating, rotateStart, onUpdate, initialState.originalWidth, initialState.originalHeight]);

  const stopAllInteractions = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setDragStart(null);
    setResizeStart(null);
    setRotateStart(null);
  }, []);


  useEffect(() => {
    const handleGlobalMouseUp = () => {
        stopAllInteractions();
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, isRotating, handleMouseMove, stopAllInteractions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageRef.current && !imageRef.current.contains(event.target as Node)) {
        setActualControlsVisible(false);
        stopAllInteractions();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stopAllInteractions]);

  useEffect(() => {
    if (!initialState.isVisible) {
        setActualControlsVisible(false);
        stopAllInteractions();
    }
  }, [initialState.isVisible, stopAllInteractions]);


  if (!initialState.src || !initialState.isVisible) {
    return null;
  }

  const controlHandleStyle: React.CSSProperties = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: 'rgba(168, 85, 247, 0.7)', // purple-500 with opacity
    border: '1px solid white',
    borderRadius: '50%',
    zIndex: 10,
  };

  const closeButtonTitle = "Close Overlay"; // Simplified

  return (
    <div
      ref={imageRef}
      style={{
        position: 'fixed',
        left: `${initialState.x}px`,
        top: `${initialState.y}px`,
        width: `${initialState.width}px`,
        height: `${initialState.height}px`,
        transform: `rotate(${initialState.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : (actualControlsVisible ? 'grab' : 'default'),
        zIndex: 1000,
        userSelect: 'none',
        touchAction: 'none',
        border: actualControlsVisible ? '2px dashed rgba(255,255,255,0.5)' : 'none',
        boxSizing: 'border-box',
      }}
      onMouseDown={handleMouseDownDrag}
      onMouseEnter={() => setActualControlsVisible(true)}
      onMouseLeave={() => {
        if (!isDragging && !isResizing && !isRotating) {
          setActualControlsVisible(false);
        }
      }}
      role="dialog"
      aria-roledescription="movable image"
      aria-label="Interactive PNG overlay"
    >
      <img
        src={initialState.src}
        alt="Overlay"
        style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
      />

      {actualControlsVisible && (
        <>
          <div
            data-interactive-handle="true"
            style={{
              ...controlHandleStyle,
              bottom: '-6px',
              right: '-6px',
              cursor: 'nwse-resize',
            }}
            onMouseDown={handleMouseDownResize}
            aria-label="Resize overlay image"
          />

          <div
            data-interactive-handle="true"
            style={{
              ...controlHandleStyle,
              top: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'grab',
              width: '16px',
              height: '16px',
              backgroundColor: 'rgba(236, 72, 153, 0.7)',
            }}
            onMouseDown={handleMouseDownRotate}
            aria-label="Rotate overlay image"
          />

          <button
            data-interactive-handle="true"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              lineHeight: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              zIndex: 20,
            }}
            aria-label={closeButtonTitle}
            title={closeButtonTitle}
          >
            X
          </button>
        </>
      )}
    </div>
  );
};

export default GlobalOverlayImage;
