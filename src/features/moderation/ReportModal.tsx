'use client';

import { useState } from 'react';
import { Modal, Stack, Text, Select, Button, Group, Notification } from '@mantine/core';
import { IconFlag, IconCheck } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface ReportModalProps {
  opened: boolean;
  onClose: () => void;
  catchId?: string;
  commentId?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: '🚫 Spam or fake content' },
  { value: 'inappropriate', label: '⚠️ Inappropriate / offensive' },
  { value: 'wrong_species', label: '🐟 Wrong species labeled' },
  { value: 'wrong_location', label: '📍 Wrong location' },
  { value: 'other', label: '❓ Other' },
];

const supabase = createClient();

export function ReportModal({ opened, onClose, catchId, commentId }: ReportModalProps) {
  const user = useAuthStore((state) => state.user);
  const [reason, setReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !user) return;
    setIsSubmitting(true);
    try {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        catch_id: catchId || null,
        comment_id: commentId || null,
        reason,
        status: 'pending',
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Group gap="xs"><IconFlag size={18} /><Text fw={600}>Report Content</Text></Group>}
      centered
      radius="md"
      overlayProps={{ blur: 3, opacity: 0.5 }}
    >
      {submitted ? (
        <Stack align="center" py="xl" gap="md">
          <Notification
            icon={<IconCheck size={18} />}
            color="green"
            title="Report submitted"
            withCloseButton={false}
          >
            Thank you for helping keep Lubuk safe. We will review this shortly.
          </Notification>
          <Button variant="light" onClick={handleClose} fullWidth>Close</Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            Please tell us why you are reporting this content. Reports are anonymous and reviewed by our team.
          </Text>
          <Select
            label="Reason"
            placeholder="Select a reason"
            data={REPORT_REASONS}
            value={reason}
            onChange={setReason}
            radius="md"
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose}>Cancel</Button>
            <Button
              color="red"
              disabled={!reason}
              loading={isSubmitting}
              onClick={handleSubmit}
              leftSection={<IconFlag size={16} />}
            >
              Submit Report
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
