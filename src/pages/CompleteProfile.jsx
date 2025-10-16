import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  Grid
} from '@mui/material';
import {
  PhotoCamera,
  Person,
  Sports,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Verificar si ya existe un perfil completado (incluso en fallback)
  useEffect(() => {
    const fallbackProfile = localStorage.getItem('tempProfile');
    const hasFallbackProfile = fallbackProfile ? JSON.parse(fallbackProfile) : null;
    const hasServerProfile = user?.posicion && user?.nivel;
    
    if (hasServerProfile || hasFallbackProfile) {
      // Si ya tiene perfil completo, redirigir al dashboard
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const [profileData, setProfileData] = useState({
    posicion: '',
    nivel: '',
    ubicacion: '',
    biografia: ''
  });

  const steps = ['Foto de Perfil', 'Información de Jugador', 'Biografía'];
  
  const posiciones = [
    'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
    'Mediocentro Defensivo', 'Mediocentro', 'Mediocentro Ofensivo',
    'Extremo Derecho', 'Extremo Izquierdo', 'Delantero', 'Media Punta'
  ];

  const niveles = [
    'Principiante', 'Intermedio', 'Avanzado', 'Semi-profesional', 'Profesional'
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0: // Foto de perfil - opcional
        return true;
      case 1: // Información de jugador
        return profileData.posicion && profileData.nivel;
      case 2: // Biografía - opcional
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError('');
    } else {
      setError('Por favor completa todos los campos requeridos antes de continuar.');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Iniciando envío de perfil...');
      console.log('📋 Datos del perfil:', profileData);
      console.log('📸 Archivo de foto:', photoFile);

      // PRIMERO: Verificar autenticación obteniendo perfil actual
      try {
        console.log('🧪 Verificando autenticación...');
        const currentProfile = await userService.getCurrentUser();
        console.log('✅ Autenticación válida. Usuario:', { 
          id: currentProfile.id, 
          email: currentProfile.email, 
          roles: currentProfile.roles 
        });
      } catch (authError) {
        console.log('❌ Error de autenticación:', authError);
        setError('Error de autenticación. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      // SEGUNDO: Actualizar datos del perfil (operación principal)
      console.log('📤 Actualizando datos del perfil...');
      const profileResult = await userService.updateProfile(profileData);
      console.log('✅ Datos del perfil actualizados exitosamente');
      
      // Verificar si estamos en modo fallback
      if (profileResult?.fallbackMode) {
        console.log('⚠️ Modo fallback activado - datos guardados localmente');
        setSuccess('⚠️ Perfil guardado temporalmente. El servidor no está disponible para actualizaciones, pero tus datos se han guardado localmente. Puedes continuar usando la aplicación.');
      } else {
        setSuccess('¡Perfil completado exitosamente!');
      }

      // TERCERO: Subir foto (opcional - no debe bloquear si falla)
      if (photoFile) {
        try {
          console.log('📤 Subiendo foto de perfil...');
          await userService.uploadProfilePhoto(photoFile);
          console.log('✅ Foto de perfil subida exitosamente');
        } catch (photoError) {
          console.warn('⚠️ Error subiendo foto (no crítico):', photoError);
          // No bloqueamos el flujo por error de foto
        }
      }

      // Redirigir al dashboard después de un breve delay
      // Dar más tiempo en modo fallback para que el usuario lea el mensaje
      const redirectDelay = profileResult?.fallbackMode ? 4000 : 2000;
      setTimeout(() => {
        navigate('/dashboard');
      }, redirectDelay);

    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.message.includes('403')) {
        setError('⚠️ Sin permisos para actualizar el perfil. Verifica que el backend tenga la configuración de seguridad correcta para los endpoints de perfil.');
      } else if (err.message.includes('401')) {
        setError('🔑 Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Error al completar el perfil: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              ¡Bienvenido, {user?.nombre}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Vamos a completar tu perfil de jugador para que otros puedan conocerte mejor
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload">
                <IconButton color="primary" aria-label="upload picture" component="span">
                  <Avatar
                    src={photoPreview}
                    sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
                  >
                    <PhotoCamera />
                  </Avatar>
                </IconButton>
              </label>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Haz clic en el avatar para subir tu foto de perfil (opcional)
            </Typography>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sports color="primary" />
              Información de Jugador
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Posición Favorita</InputLabel>
                  <Select
                    value={profileData.posicion}
                    label="Posición Favorita"
                    onChange={(e) => handleInputChange('posicion', e.target.value)}
                  >
                    {posiciones.map((pos) => (
                      <MenuItem key={pos} value={pos}>
                        {pos}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Nivel de Juego</InputLabel>
                  <Select
                    value={profileData.nivel}
                    label="Nivel de Juego"
                    onChange={(e) => handleInputChange('nivel', e.target.value)}
                  >
                    {niveles.map((nivel) => (
                      <MenuItem key={nivel} value={nivel}>
                        {nivel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  value={profileData.ubicacion}
                  onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                  placeholder="Ciudad, Barrio o zona donde juegas"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="primary" />
              Cuéntanos sobre ti
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Biografía"
              value={profileData.biografia}
              onChange={(e) => handleInputChange('biografia', e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia en el fútbol, tus logros, lo que más disfrutas del juego..."
              sx={{ mt: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Este campo es opcional pero ayuda a otros jugadores a conocerte mejor
            </Typography>
          </Box>
        );
        
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Completar Perfil
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Atrás
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Completar Perfil'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
            >
              Siguiente
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;