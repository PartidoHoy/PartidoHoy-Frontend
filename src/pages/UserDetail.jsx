import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Message
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import UserCard from '../components/user/UserCard';
import userService from '../services/userService';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Cargar datos del usuario y estadísticas
        const [userData, statsData] = await Promise.all([
          userService.getUserById(userId),
          userService.getUserStats(userId).catch(() => ({
            partidosJugados: 0,
            goles: 0,
            asistencias: 0,
            rating: 0
          }))
        ]);

        setUser(userData);
        setUserStats(statsData);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Error al cargar los datos del usuario: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const handleBack = () => {
    navigate('/users');
  };

  const handleSendMessage = () => {
    // TODO: Implementar funcionalidad de mensajes
    console.log('Enviar mensaje a:', user);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando perfil...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Usuario no encontrado.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header con navegación */}
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Columna izquierda - Card del usuario */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <UserCard 
              user={{
                ...user,
                estadisticas: userStats
              }}
              variant="detailed"
            />
            
            {/* Botones de acción */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Message />}
                onClick={handleSendMessage}
                fullWidth
              >
                Enviar Mensaje
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Columna derecha - Información detallada */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {user.nombre}
            </Typography>

            {/* Información adicional */}
            {user.descripcion && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Sobre mí
                </Typography>
                <Typography variant="body1" paragraph>
                  {user.descripcion}
                </Typography>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* Información de contacto */}
            <Typography variant="h6" gutterBottom>
              Información de Contacto
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {user.email && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                </Grid>
              )}
              {user.telefono && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">
                    {user.telefono}
                  </Typography>
                </Grid>
              )}
              {user.ubicacion && user.ubicacion !== 'No especificada' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ubicación
                  </Typography>
                  <Typography variant="body1">
                    {user.ubicacion}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Estadísticas detalladas */}
            {userStats && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Estadísticas Detalladas
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {userStats.partidosJugados || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partidos Jugados
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {userStats.goles || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Goles
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {userStats.asistencias || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Asistencias
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {userStats.rating ? `${userStats.rating}/5` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Información de perfil de juego */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Perfil de Juego
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Posición Favorita
                </Typography>
                <Typography variant="body1">
                  {user.posicion || 'No especificada'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Nivel de Juego
                </Typography>
                <Typography variant="body1">
                  {user.nivel || 'No especificado'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDetail;