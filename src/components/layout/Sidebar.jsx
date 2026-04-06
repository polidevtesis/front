import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider,
} from '@mui/material';
import {
  Dashboard, Inventory2, Category, Business,
  PointOfSale, SwapVert, AutoAwesome,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/dashboard',   icon: <Dashboard /> },
  { label: 'Productos',    path: '/products',    icon: <Inventory2 /> },
  { label: 'Categorías',   path: '/categories',  icon: <Category /> },
  { label: 'Proveedores',  path: '/providers',   icon: <Business /> },
  { label: 'Ventas',       path: '/sales',       icon: <PointOfSale /> },
  { label: 'Movimientos',  path: '/movements',   icon: <SwapVert /> },
  { label: 'Orden IA',     path: '/ai/order',    icon: <AutoAwesome /> },
];

export default function Sidebar({ width, topBarHeight }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          top: `${topBarHeight}px`,
          height: `calc(100% - ${topBarHeight}px)`,
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Menú
        </Typography>
      </Box>
      <Divider />
      <List disablePadding sx={{ pt: 1 }}>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <ListItemButton
              key={path}
              selected={active}
              onClick={() => navigate(path)}
              sx={{
                mx: 1,
                my: 0.25,
                borderRadius: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
