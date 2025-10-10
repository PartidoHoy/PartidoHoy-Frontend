import React from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" component="h1">
          PartidoHoy Dashboard
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bienvenido, {user?.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Email: {user?.email}
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Roles:
            </Typography>
            {user?.roles?.map((role) => (
              <Chip 
                key={role} 
                label={role} 
                color={role === 'ADMIN' ? 'error' : 'primary'} 
                size="small" 
                sx={{ mr: 1 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🏆 Bienvenido a PartidoHoy
        </Typography>
        <Typography variant="body1" paragraph>
          Tu cuenta ha sido creada exitosamente y ahora tienes acceso a todas las funcionalidades de PartidoHoy.
        </Typography>
        
        {isAdmin && (
          <Box mt={3} p={2} bgcolor="error.light" borderRadius={1}>
            <Typography variant="h6" color="error.dark">
              🔧 Panel de Administrador
            </Typography>
            <Typography variant="body2" color="error.dark">
              Tienes permisos de administrador. Aquí podrás gestionar usuarios y configuraciones del sistema.
            </Typography>
          </Box>
        )}

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Próximas funcionalidades:
          </Typography>
          <ul>
            <li>📅 Ver partidos de hoy</li>
            <li>⚽ Seguir equipos favoritos</li>
            <li>📊 Estadísticas personalizadas</li>
            <li>🔔 Notificaciones en tiempo real</li>
            <li>👥 Gestión de usuarios (Admin)</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;