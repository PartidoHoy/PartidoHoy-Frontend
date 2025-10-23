import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import {
  Edit,
  CameraAlt,
  SportsSoccer,
  EmojiEvents,
  Star,
  LocationOn,
  Group,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';

const MyProfile = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('👤 MyProfile: Cargando datos del perfil...');
      
      // Cargar perfil completo y tarjeta de jugador
      const [profile, card] = await Promise.all([
        userService.getCurrentUser(),
        userService.getPlayerCard('me').catch(() => null) // Si falla, continuar sin tarjeta
      ]);
      
      setProfileData(profile);
      setPlayerCard(card);
      
      console.log('✅ MyProfile: Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      console.log('📸 Subiendo nueva foto de perfil...');
      await userService.uploadProfilePhoto(file);
      
      // Recargar datos después de subir la foto
      await loadProfileData();
      
      console.log('✅ Foto de perfil actualizada');
    } catch (error) {
      console.error('❌ Error subiendo foto:', error);
      setError('Error al subir la foto de perfil');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando perfil...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadProfileData}>
          Reintentar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header del Perfil */}
      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <Box
          sx={{
            height: 200,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            position: 'relative'
          }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 3, mt: -8 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileData?.avatar || user?.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  fontSize: '3rem'
                }}
              >
                {profileData?.nombre?.charAt(0) || user?.nombre?.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <CameraAlt />
                </IconButton>
              </label>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="white">
                {profileData?.nombre || user?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.8)">
                {profileData?.posicion || 'Posición no especificada'}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profileData?.ciudad && (
                  <Chip
                    icon={<LocationOn />}
                    label={profileData.ciudad}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
                {profileData?.nivel && (
                  <Chip
                    icon={<Star />}
                    label={`Nivel ${profileData.nivel}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
                {profileData?.verificado && (
                  <Chip
                    label="Verificado"
                    size="small"
                    color="success"
                  />
                )}
              </Box>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Edit />}
              sx={{ mb: 2, bgcolor: 'white', color: 'primary.main' }}
              onClick={() => window.location.href = '/complete-profile'}
            >
              Editar Perfil
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Estadísticas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {playerCard?.partidosJugados || profileData?.partidosJugados || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Partidos Jugados
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {playerCard?.golesAnotados || profileData?.golesAnotados || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Goles
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {playerCard?.asistencias || profileData?.asistencias || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Asistencias
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {playerCard?.partidosGanados || profileData?.partidosGanados || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Victorias
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Personal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group color="primary" />
                Información Personal
              </Typography>
              <Box sx={{ space: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {profileData?.email || user?.email}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">
                    {profileData?.telefono || 'No especificado'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Registro
                  </Typography>
                  <Typography variant="body1">
                    {profileData?.fechaRegistro ? new Date(profileData.fechaRegistro).toLocaleDateString() : 'No disponible'}
                  </Typography>
                </Box>
                {profileData?.descripcion && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Descripción
                    </Typography>
                    <Typography variant="body1">
                      {profileData.descripcion}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipos */}
        {profileData?.equipos && profileData.equipos.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents color="primary" />
                  Equipos
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profileData.equipos.map((equipo, index) => (
                    <Chip
                      key={index}
                      label={equipo}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Especialidades */}
        {profileData?.especialidades && profileData.especialidades.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsSoccer color="primary" />
                  Especialidades
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profileData.especialidades.map((especialidad, index) => (
                    <Chip
                      key={index}
                      label={especialidad}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MyProfile;