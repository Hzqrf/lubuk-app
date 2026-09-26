'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { MarkerData } from '@/lib/store/useMarkerStore';

interface HeatmapLayerProps {
  markers: MarkerData[];
  speciesFilter: string;
  timeFilter: '24h' | '7d' | '30d' | 'all';
  visible: boolean;
}

export function HeatmapLayer({ markers, speciesFilter, timeFilter, visible }: HeatmapLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible) {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
      return;
    }

    // 1. Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400'; // above tile layer, below markers/controls
    canvasRef.current = canvas;

    const pane = map.getPane('overlayPane');
    if (pane) {
      pane.appendChild(canvas);
    }

    // 2. Color ramp generator
    const createColorRamp = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 1;
      const ctx = c.getContext('2d')!;
      
      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0.0, 'rgba(0, 0, 255, 0)');     // Transparent Blue
      grad.addColorStop(0.25, 'rgba(0, 255, 255, 0.4)'); // Teal
      grad.addColorStop(0.5, 'rgba(0, 255, 0, 0.6)');    // Green
      grad.addColorStop(0.75, 'rgba(255, 255, 0, 0.8)'); // Yellow
      grad.addColorStop(1.0, 'rgba(255, 0, 0, 0.9)');    // Glowing Red

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 1);
      return ctx.getImageData(0, 0, 256, 1).data;
    };

    const colorRamp = createColorRamp();

    // 3. Render function
    const drawHeatmap = () => {
      if (!canvasRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Adjust canvas coordinates to match map container
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      const pane = map.getPane('mapPane');
      if (!pane) return;
      const panePosition = L.DomUtil.getPosition(pane);
      if (!panePosition) return;
      const offsetX = panePosition.x;
      const offsetY = panePosition.y;

      // Reposition canvas relative to the pane
      canvas.style.transform = `translate3d(${-offsetX}px, ${-offsetY}px, 0)`;

      // Filter markers
      const now = new Date().getTime();
      const filtered = markers.filter((m) => {
        // Species filter
        if (speciesFilter !== 'All' && m.species !== speciesFilter) return false;

        // Time filter
        if (timeFilter !== 'all') {
          const timestamp = new Date(m.timestamp).getTime();
          const diff = now - timestamp;
          if (timeFilter === '24h' && diff > 24 * 60 * 60 * 1000) return false;
          if (timeFilter === '7d' && diff > 7 * 24 * 60 * 60 * 1000) return false;
          if (timeFilter === '30d' && diff > 30 * 24 * 60 * 60 * 1000) return false;
        }

        return true;
      });

      if (filtered.length === 0) {
        ctx.clearRect(0, 0, size.x, size.y);
        return;
      }

      // Step A: Draw radial gradients onto temp/mask canvas or directly
      ctx.clearRect(0, 0, size.x, size.y);

      // Adjust circle radius depending on map zoom level
      const zoom = map.getZoom();
      const radius = Math.max(15, zoom * 3);

      filtered.forEach((marker) => {
        const point = map.latLngToContainerPoint([marker.latitude, marker.longitude]);
        
        // Draw standard radial gradient (blurred point) representing weight
        const grad = ctx.createRadialGradient(point.x, point.y, 1, point.x, point.y, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)'); // Center
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');   // Edge

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Step B: Colorize black/alpha drawing to temperature scale
      const imgData = ctx.getImageData(0, 0, size.x, size.y);
      const pix = imgData.data;

      for (let i = 0, len = pix.length; i < len; i += 4) {
        const alpha = pix[i + 3]; // get opacity
        if (alpha > 0) {
          // Map alpha value to index in our color ramp (0 to 255)
          const colorIndex = Math.min(255, alpha);
          const rOffset = colorIndex * 4;

          pix[i] = colorRamp[rOffset];       // Red
          pix[i + 1] = colorRamp[rOffset + 1]; // Green
          pix[i + 2] = colorRamp[rOffset + 2]; // Blue
          pix[i + 3] = colorRamp[rOffset + 3] * 0.85; // Alpha intensity scaling
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    // 4. Attach event listeners
    map.on('move', drawHeatmap);
    map.on('zoomend', drawHeatmap);
    map.on('viewreset', drawHeatmap);

    // Initial draw
    drawHeatmap();

    // Clean up
    return () => {
      map.off('move', drawHeatmap);
      map.off('zoomend', drawHeatmap);
      map.off('viewreset', drawHeatmap);
      canvas.remove();
    };
  }, [map, markers, speciesFilter, timeFilter, visible]);

  return null;
}
