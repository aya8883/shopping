import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBasket } from '../contexts/BasketContext';

const tabs = [
  { path: '/', key: 'home', icon: <HomeOutlinedIcon />, emphasize: false },
  { path: '/search', key: 'search', icon: <SearchOutlinedIcon />, emphasize: false },
  { path: '/list', key: 'basket', icon: <ShoppingCartOutlinedIcon />, badge: true, emphasize: true },
  { path: '/offers', key: 'offers', icon: <LocalOfferOutlinedIcon />, emphasize: false },
  { path: '/profile', key: 'profile', icon: <PersonOutlineOutlinedIcon />, emphasize: false },
] as const;

export function MobileBottomNavigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useBasket();

  const current =
    tabs.find((tab) =>
      tab.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(tab.path) ||
          (tab.path === '/list' && location.pathname.startsWith('/plan')),
    )?.path ?? false;

  return (
    <Paper
      elevation={0}
      className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-app md:max-w-desktop"
      sx={{
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(26,26,26,0.06)',
        borderBottom: 'none',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 -8px 28px rgba(15, 23, 42, 0.08)',
      }}
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_e, value: string) => navigate(value)}
        sx={{
          height: 76,
          '& .MuiBottomNavigationAction-root': {
            gap: 0.25,
            minWidth: 0,
            px: 0.5,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.68rem',
            fontWeight: 700,
            mt: 0.25,
          },
          '& .MuiBottomNavigationAction-root.Mui-selected .nav-icon-wrap': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: '0 6px 14px rgba(245,196,0,0.35)',
          },
          '& .MuiBottomNavigationAction-root.nav-emphasize .nav-icon-wrap': {
            width: 48,
            height: 40,
            transform: 'translateY(-4px)',
            bgcolor: '#1A1A1A',
            color: '#F5C400',
            boxShadow: '0 8px 18px rgba(0,0,0,0.22)',
          },
          '& .MuiBottomNavigationAction-root.nav-emphasize.Mui-selected .nav-icon-wrap': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          },
        }}
      >
        {tabs.map((tab) => {
          const rawIcon =
            'badge' in tab && tab.badge ? (
              <Badge
                color="error"
                badgeContent={itemCount}
                max={99}
                sx={{ '& .MuiBadge-badge': { fontWeight: 800, fontSize: '0.65rem' } }}
              >
                {tab.icon}
              </Badge>
            ) : (
              tab.icon
            );

          return (
            <BottomNavigationAction
              key={tab.path}
              value={tab.path}
              label={t(`nav.${tab.key}`)}
              className={tab.emphasize ? 'nav-emphasize' : undefined}
              icon={
                <Box
                  className="nav-icon-wrap"
                  sx={{
                    width: 40,
                    height: 32,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                  }}
                >
                  {rawIcon}
                </Box>
              }
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
