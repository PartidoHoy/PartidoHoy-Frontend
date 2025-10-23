import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Button,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Search,
  SportsSoccer,
  Logout,
  Settings,
  Person,
  Dashboard,
  Group,
  EmojiEvents,
  CalendarToday,
  LocationOn,
  Message,
  Close,
  Home,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Estado para notificaciones (datos de ejemplo)
  const [notifications] = useState([
    { id: 1, type: 'match', message: 'Nuevo partido disponible en tu zona', time: '5 min', unread: true },
    { id: 2, type: 'team', message: 'Te han invitado a unirte a un equipo', time: '1 h', unread: true },
    { id: 3, type: 'achievement', message: '¡Has desbloqueado un nuevo logro!', time: '2 h', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Elementos de navegación principal
  const navigationItems = [
    { label: 'Inicio', icon: <Home />, path: '/dashboard', exact: true },
    { label: 'Buscar Partidos', icon: <SportsSoccer />, path: '/matches' },
    { label: 'Jugadores', icon: <Group />, path: '/players' },
    { label: 'Mis Equipos', icon: <EmojiEvents />, path: '/teams' },
    { label: 'Calendario', icon: <CalendarToday />, path: '/calendar' },
    { label: 'Estadísticas', icon: <TrendingUp />, path: '/stats' }
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match': return <SportsSoccer color="primary" />;
      case 'team': return <Group color="secondary" />;
      case 'achievement': return <EmojiEvents color="warning" />;
      default: return <Notifications />;
    }
  };

  // Contenido del drawer móvil
  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsSoccer sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            PartidoHoy
          </Typography>
        </Box>
        <IconButton onClick={() => setMobileDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ px: 1, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              cursor: 'pointer',
              bgcolor: isActiveRoute(item.path, item.exact) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isActiveRoute(item.path, item.exact) ? 'primary.main' : 'text.secondary',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: isActiveRoute(item.path, item.exact) ? 600 : 400,
                color: isActiveRoute(item.path, item.exact) ? 'primary.main' : 'text.primary'
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={user?.avatar}
            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
          >
            {user?.nombre?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {user?.nombre || 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ver perfil
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ borderRadius: 2 }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, sm: 2 }, minHeight: 70 }}>
            {/* Botón de menú móvil */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                 onClick={() => navigate('/dashboard')}>
              <SportsSoccer sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                PartidoHoy
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      py: 1,
                      color: isActiveRoute(item.path, item.exact) ? 'primary.main' : 'text.secondary',
                      bgcolor: isActiveRoute(item.path, item.exact) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      fontWeight: isActiveRoute(item.path, item.exact) ? 600 : 400,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Search Button */}
              <Tooltip title="Buscar">
                <IconButton
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <Search />
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notificaciones">
                <IconButton onClick={handleNotificationsOpen}>
                  <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* User Status Chip */}
              <Chip
                icon={<LocationOn />}
                label="Disponible"
                size="small"
                color="success"
                variant="outlined"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              />

              {/* Profile Avatar */}
              <Tooltip title="Perfil">
                <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                  <Avatar
                    src={user?.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    {user?.nombre?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              mx: 1,
              my: 0.5
            }
          }
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <Person sx={{ mr: 2 }} />
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <Settings sx={{ mr: 2 }} />
          Configuración
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 2 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxWidth: 400,
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="600">
            Notificaciones
          </Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              alignItems: 'flex-start',
              bgcolor: notification.unread ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
            }}
          >
            <Box sx={{ mr: 2, mt: 0.5 }}>
              {getNotificationIcon(notification.type)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: notification.unread ? 600 : 400 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
            {notification.unread && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  mt: 1
                }}
              />
            )}
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem sx={{ justifyContent: 'center', color: 'primary.main' }}>
          <Typography variant="body2" fontWeight="600">
            Ver todas las notificaciones
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;