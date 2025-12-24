// src/components/MosaicCanvas.tsx

import React, { useEffect, useRef } from 'react';

type Props = {
    imageData: Uint8Array | null;
    width?: number;
    height?: number;
    className?: string;
};

export const MosaicCanvas: React.FC<Props> = ({
    imageData,
    width = 32,
    height = 32,
    className
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageData) return;

        const expectedLength = width * height * 4;
        if (imageData.length !== expectedLength) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            const imgData = new ImageData(
                new Uint8ClampedArray(imageData),
                width,
                height
            );
            ctx.putImageData(imgData, 0, 0);
        } catch (e) {
            console.error("Failed to create ImageData:", e);
        }

    }, [imageData, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            style={{
                imageRendering: 'pixelated',
                width: '320px',
                height: '320px'
            }}
        />
    );
};