import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const isActive = (path) => router.pathname === path;

  const navigationLinks = [
    ...config.navigation.main,
    ...(user?.role === 'admin' ? config.navigation.admin : []),
  ];

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.username?.[0]?.toUpperCase() || <PersonIcon />}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {user?.role === 'admin' && (
              <MenuItem
                component={Link}
                href="/admin"
                onClick={handleMenuClose}
              >
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
            )}
            <MenuItem
              component={Link}
              href="/profile"
              onClick={handleMenuClose}
            >
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      );
    }

    return (
      <Box sx={{ ml: 2 }}>
        <Button
          component={Link}
          href="/auth/login"
          color="primary"
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Login
        </Button>
        <Button
          component={Link}
          href="/auth/register"
          color="primary"
          variant="contained"
        >
          Register
        </Button>
      </Box>
    );
  };

  const drawer = (
    <List>
      {navigationLinks.map((item) => (
        <ListItem
          key={item.href}
          component={Link}
          href={item.href}
          selected={isActive(item.href)}
          onClick={handleDrawerToggle}
          sx={{
            color: isActive(item.href)
              ? 'primary.main'
              : 'text.primary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            IMS
          </Typography>

          {isMobile ? (
            <>
              {renderAuthButtons()}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true,
                }}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: 240,
                  },
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navigationLinks.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color={isActive(item.href) ? 'primary' : 'inherit'}
                  sx={{
                    mx: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {renderAuthButtons()}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;