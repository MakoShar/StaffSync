import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../features/notifications/notificationSlice';

export default function NotificationMenu() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    dispatch(fetchNotifications());
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="medium"
        sx={{
          color: 'text.secondary',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1.5,
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAll} sx={{ fontSize: '0.75rem' }}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No notifications
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.map((n) => (
              <ListItem
                key={n._id}
                button
                onClick={() => handleItemClick(n._id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: n.isRead ? 'transparent' : '#F0F9FF',
                  '&:hover': { backgroundColor: '#F8FAFC' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: n.isRead ? 500 : 700,
                        color: 'text.primary',
                        fontSize: '0.85rem',
                      }}
                    >
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                      >
                        {n.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} at{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}
