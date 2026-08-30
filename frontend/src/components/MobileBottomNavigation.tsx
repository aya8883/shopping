import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Badge from '@mui/material/Badge';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBasket } from '../contexts/BasketContext';

const tabs = [
  { path: '/', key: 'home', icon: <HomeOutlinedIcon /> },
  { path: '/compare', key: 'compare', icon: <CompareArrowsOutlinedIcon /> },
  { path: '/offers', key: 'offers', icon: <LocalOfferOutlinedIcon /> },
  { path: '/list', key: 'myList', icon: <PlaylistAddCheckOutlinedIcon />, badge: true },
  { path: '/profile', key: 'profile', icon: <PersonOutlineOutlinedIcon /> },
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
        : location.pathname.startsWith(tab.path),
    )?.path ?? '/';

  return (
    <Paper
      elevation={8}
      className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-app md:max-w-desktop"
      sx={{ borderRadius: '18px 18px 0 0' }}
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_e, value: string) => navigate(value)}
        sx={{ height: 68 }}
      >
        {tabs.map((tab) => {
          const icon =
            'badge' in tab && tab.badge ? (
              <Badge color="primary" badgeContent={itemCount} max={99}>
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
              icon={icon}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
