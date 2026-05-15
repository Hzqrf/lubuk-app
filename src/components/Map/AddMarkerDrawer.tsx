'use client';

import { useState } from 'react';
import { Drawer, Button, Select, Textarea, Group, Stack, FileInput, Image as MantineImage, LoadingOverlay, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload } from '@tabler/icons-react';
import { useMarkerStore, FishSpecies } from '@/lib/store/useMarkerStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { FISH_SPECIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

interface AddMarkerDrawerProps {
  opened: boolean;
  onClose: () => void;
  coordinates: { lat: number; lng: number } | null;
}

const supabase = createClient();

export function AddMarkerDrawer({ opened, onClose, coordinates }: AddMarkerDrawerProps) {
  const addMarker = useMarkerStore((state) => state.addMarker);
  const user = useAuthStore((state) => state.user);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      species: '' as FishSpecies | '',
      note: '',
      image: null as File | null,
    },
    validate: {
      species: (value) => (value ? null : 'Please select a fish species'),
    },
  });

  const handleFileChange = (file: File | null) => {
    form.setFieldValue('image', file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('catches-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data } = supabase.storage
      .from('catches-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!coordinates || !values.species || !user) return;

    try {
      setIsUploading(true);
      let imageUrl = undefined;

      if (values.image) {
        const uploadedUrl = await uploadImage(values.image);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      await addMarker({
        user_id: user.id,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        species: values.species,
        note: values.note,
        image_url: imageUrl,
      });

      form.reset();
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      alert('Failed to save catch. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const speciesData = FISH_SPECIES.map((s) => ({
    value: s.value,
    label: `${s.emoji} ${s.label}`,
  }));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">Add New Catch</Text>}
      position="bottom"
      size="md"
      overlayProps={{ opacity: 0.5, blur: 4 }}
      styles={{
        content: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
        header: { padding: '16px 24px' },
        body: { padding: '24px', position: 'relative' },
      }}
    >
      <LoadingOverlay visible={isUploading} overlayProps={{ blur: 2 }} loaderProps={{ color: 'blue', type: 'bars' }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Fish Species"
            placeholder="Select a species"
            data={speciesData}
            {...form.getInputProps('species')}
            size="md"
            comboboxProps={{ shadow: 'md' }}
          />
          
          <FileInput
            label="Photo (Optional)"
            placeholder="Upload a picture of your catch"
            accept="image/png,image/jpeg,image/webp"
            leftSection={<IconUpload size={16} />}
            value={form.values.image}
            onChange={handleFileChange}
            size="md"
          />

          {previewUrl && (
            <MantineImage
              src={previewUrl}
              alt="Catch preview"
              radius="md"
              h={150}
              fit="cover"
            />
          )}

          <Textarea
            label="Note (Optional)"
            placeholder="How big was it? What bait did you use?"
            minRows={3}
            autosize
            {...form.getInputProps('note')}
            size="md"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={isUploading}>
              Save Catch
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
