'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal, Button, Text, Group, Stack, Box, ActionIcon } from '@mantine/core';
import { IconShare, IconDownload, IconPhotoShare } from '@tabler/icons-react';
import { FeedCatch } from '@/lib/store/useFeedStore';
import { format } from 'date-fns';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';

interface ShareCatchCardProps {
  catchData: FeedCatch;
  opened: boolean;
  onClose: () => void;
}

export function ShareCatchCard({ catchData, opened, onClose }: ShareCatchCardProps) {
  const { profiles, species, timestamp, note, image_url, latitude, longitude } = catchData;
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speciesStore = useSpeciesStore((state) => state.species);
  const fetchSpecies = useSpeciesStore((state) => state.fetchSpecies);

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  const speciesInfo = speciesStore.find((s) => s.name.toLowerCase() === species.toLowerCase());
  const formattedDate = format(new Date(timestamp), 'MMMM dd, yyyy');

  const generateSocialCard = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;

      // 1. Draw background
      if (image_url) {
        // Load image with CORS
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Wait for image loading
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            console.warn('CORS or Image load failed, falling back to gradient background');
            resolve(null);
          };
          img.src = image_url;
        });

        if (img.complete && img.naturalWidth > 0) {
          // Crop & cover center of the 1080x1080 canvas
          const aspect = img.width / img.height;
          let drawWidth = 1080;
          let drawHeight = 1080;
          let offsetX = 0;
          let offsetY = 0;

          if (aspect > 1) {
            drawWidth = 1080 * aspect;
            offsetX = -(drawWidth - 1080) / 2;
          } else {
            drawHeight = 1080 / aspect;
            offsetY = -(drawHeight - 1080) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        } else {
          // Gradient Fallback
          drawGradientBackground(ctx);
        }
      } else {
        // Gradient Fallback
        drawGradientBackground(ctx);
      }

      // 2. Draw glassmorphic footer overlay (bottom 35% gradient panel)
      const footerGrad = ctx.createLinearGradient(0, 700, 0, 1080);
      footerGrad.addColorStop(0, 'rgba(10, 15, 30, 0.0)');
      footerGrad.addColorStop(0.2, 'rgba(10, 15, 30, 0.65)');
      footerGrad.addColorStop(0.5, 'rgba(8, 12, 24, 0.95)');
      footerGrad.addColorStop(1.0, 'rgba(5, 7, 15, 1.0)');

      ctx.fillStyle = footerGrad;
      ctx.fillRect(0, 680, 1080, 400);

      // 3. Draw subtle grid overlays to make it look technical and premium
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      
      // Horizontal guides
      ctx.beginPath();
      ctx.moveTo(80, 720); ctx.lineTo(1000, 720);
      ctx.moveTo(80, 1000); ctx.lineTo(1000, 1000);
      
      // Vertical guides
      ctx.moveTo(80, 720); ctx.lineTo(80, 1000);
      ctx.moveTo(1000, 720); ctx.lineTo(1000, 1000);
      ctx.stroke();

      // 4. Draw Brand Title (LUBUK)
      ctx.fillStyle = '#6366f1'; // Indigo logo mark
      ctx.font = 'bold 36px "Outfit", "Inter", sans-serif';
      ctx.fillText('LUBUK', 120, 780);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'normal 24px "Inter", sans-serif';
      ctx.fillText('•   FISHING MAP PLATFORM', 270, 778);

      // 5. Draw Fish Species Name
      const emoji = speciesInfo?.emoji || '🎣';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'extrabold 64px "Outfit", "Inter", sans-serif';
      ctx.fillText(`${emoji}  ${species.toUpperCase()}`, 120, 860);

      // 6. Draw User Profile Avatar Mock or text
      const userName = profiles?.display_name || 'Anonymous Angler';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'medium 24px "Inter", sans-serif';
      ctx.fillText('CAUGHT BY', 120, 920);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px "Inter", sans-serif';
      ctx.fillText(userName, 120, 960);

      // 7. Draw Location details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'medium 24px "Inter", sans-serif';
      ctx.fillText('LOCATION COORDINATES', 650, 920);

      const coordsText = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px "Inter", sans-serif';
      ctx.fillText(coordsText, 650, 960);

      // 8. Draw Date in right corner
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'normal 22px "Inter", sans-serif';
      ctx.fillText(formattedDate, 820, 780);

      // 9. Save as image download trigger
      const link = document.createElement('a');
      link.download = `lubuk-catch-${species.toLowerCase()}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Failed to generate sharing image:', e);
    } finally {
      setExporting(false);
    }
  };

  const drawGradientBackground = (ctx: CanvasRenderingContext2D) => {
    // Generate beautiful fishing lagoon gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0f172a'); // slate-900
    grad.addColorStop(0.5, '#1e3a8a'); // blue-900
    grad.addColorStop(1, '#064e3b'); // emerald-950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Draw giant abstract fish emoji placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.font = '400px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(speciesInfo?.emoji || '🎣', 540, 420);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Share Catch Card</Text>}
      size="sm"
      radius="md"
      centered
    >
      <Stack gap="md" align="center">
        {/* Mock card preview */}
        <Box
          style={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            background: image_url ? `url(${image_url}) center/cover no-repeat` : 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)'
          }}
        >
          {/* Mock Overlay */}
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}
          >
            <Text size="xs" c="indigo.4" fw={700} style={{ letterSpacing: 1.5 }}>LUBUK OUTDOORS</Text>
            <Text size="lg" fw={800} c="white" mt={2}>{speciesInfo?.emoji} {species.toUpperCase()}</Text>
            
            <Group justify="space-between" mt="sm">
              <Box>
                <Text size="9px" c="dimmed">ANGLER</Text>
                <Text size="xs" fw={700} c="gray.2">{profiles?.display_name || 'Angler'}</Text>
              </Box>
              <Box style={{ textAlign: 'right' }}>
                <Text size="9px" c="dimmed">COORDINATES</Text>
                <Text size="xs" fw={700} c="gray.2">
                  {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
                </Text>
              </Box>
            </Group>
          </Box>
        </Box>

        <Text size="xs" c="dimmed" ta="center">
          Downloads a stunning 1080x1080 px social graphic featuring catch details and Lubuk branding, ready for Instagram, Facebook, and outdoor feeds!
        </Text>

        <Button
          fullWidth
          color="indigo"
          leftSection={<IconDownload size={16} />}
          onClick={generateSocialCard}
          loading={exporting}
        >
          {exporting ? 'Generating High-Res Card...' : 'Download Social Card'}
        </Button>
      </Stack>
    </Modal>
  );
}
