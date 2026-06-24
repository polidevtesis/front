import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const SIDEBAR_WIDTH = 240;
const TOPBAR_HEIGHT = 64;

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar width={SIDEBAR_WIDTH} topBarHeight={TOPBAR_HEIGHT} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar height={TOPBAR_HEIGHT} sidebarWidth={SIDEBAR_WIDTH} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: `${TOPBAR_HEIGHT}px`,
            py: 3,
            px: 2,
            minWidth: 0,
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
