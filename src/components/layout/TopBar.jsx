import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Logout, Inventory2 } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ height, sidebarWidth }) {
  const { logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height,
        backgroundColor: 'primary.main',
        borderBottom: '1px solid',
        borderColor: 'primary.dark',
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ minHeight: `${height}px !important` }}>
        <Inventory2 sx={{ mr: 1.5, fontSize: 28 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap sx={{ color: 'white', lineHeight: 1.2 }}>
            Distrirepuestos J Marod
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1 }}>
            Sistema de Inventario
          </Typography>
        </Box>
        <Tooltip title="Cerrar sesión">
          <IconButton onClick={logout} sx={{ color: 'white' }}>
            <Logout />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
