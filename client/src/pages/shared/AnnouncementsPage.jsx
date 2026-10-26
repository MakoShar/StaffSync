import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { announcementService } from '../../services/announcementService';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await announcementService.getAnnouncements();
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Company Announcements"
        subtitle="Official news, policy updates, and executive announcements across the organization."
      />

      {isLoading ? (
        <LoadingSpinner message="Loading company announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No Active Announcements"
          description="There are currently no active announcements published for your department or audience."
          icon={CampaignOutlinedIcon}
        />
      ) : (
        <Stack spacing={2.5}>
          {announcements.map((ann) => (
            <Card key={ann._id} sx={{ border: '1px solid #E2E8F0', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {ann.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <StatusChip status={ann.priority} size="small" />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Audience: <strong>{ann.targetAudience === 'Department' ? `${ann.targetDepartment} Dept` : ann.targetAudience}</strong>
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', mb: 2 }}
                >
                  {ann.content}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Published by{' '}
                    <strong>
                      {ann.author ? `${ann.author.firstName} ${ann.author.lastName}` : 'Administration'}
                    </strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
