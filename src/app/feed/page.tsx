import { FeedList } from '@/features/feed/FeedList';
import { Title, Container, Box, ScrollArea } from '@mantine/core';

export default function FeedPage() {
  return (
    <ScrollArea h="100%" type="auto">
      <Box style={{ width: '100%', minHeight: '100%' }}>
        <Container 
          size="sm" 
          py="md" 
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            backgroundColor: 'var(--mantine-color-body)',
            borderBottom: '1px solid var(--mantine-color-default-border)'
          }}
        >
          <Title order={2} ta="center" fz="xl" fw={800}>Recent Catches</Title>
        </Container>
        <FeedList />
      </Box>
    </ScrollArea>
  );
}
