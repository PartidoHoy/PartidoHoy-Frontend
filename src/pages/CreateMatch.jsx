import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Add,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import matchService from '../services/matchService';

const CreateMatch = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [matchData, setMatchData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    direccion: '',
    ciudad: '',
    capacidadMaxima: 10,
    precio: 0,
    nivelRequerido: 'Intermedio',
    tipoCancha: 'Césped sintético'
  });

  const steps = ['Información Básica', 'Detalles del Lugar', 'Configuración'];

  const handleChange = (field, value) => {
    setMatchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🆕 Creando nuevo partido:', matchData);
      await matchService.createMatch(matchData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/matches');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creando partido:', error);
      setError('Error al crear el partido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return matchData.titulo && matchData.fecha && matchData.hora;
      case 1:
        return matchData.ubicacion && matchData.ciudad;
      case 2:
        return matchData.capacidadMaxima > 0;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del partido *"
                value={matchData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="ej: Partido de Fútbol 5vs5"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={matchData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Describe el partido, reglas especiales, etc."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha *"
                value={matchData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Hora *"
                value={matchData.hora}
                onChange={(e) => handleChange('hora', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación *"
                value={matchData.ubicacion}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                placeholder="Nombre del complejo deportivo"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad *"
                value={matchData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                placeholder="Ciudad donde se juega"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección completa"
                value={matchData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Dirección exacta del lugar"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de cancha</InputLabel>
                <Select
                  value={matchData.tipoCancha}
                  label="Tipo de cancha"
                  onChange={(e) => handleChange('tipoCancha', e.target.value)}
                >
                  <MenuItem value="Césped natural">Césped natural</MenuItem>
                  <MenuItem value="Césped sintético">Césped sintético</MenuItem>
                  <MenuItem value="Tierra">Tierra</MenuItem>
                  <MenuItem value="Concreto">Concreto</MenuItem>
                  <MenuItem value="Indoor">Indoor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Capacidad máxima *"
                value={matchData.capacidadMaxima}
                onChange={(e) => handleChange('capacidadMaxima', parseInt(e.target.value))}
                inputProps={{ min: 2, max: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Precio (€)"
                value={matchData.precio}
                onChange={(e) => handleChange('precio', parseFloat(e.target.value))}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Nivel requerido</InputLabel>
                <Select
                  value={matchData.nivelRequerido}
                  label="Nivel requerido"
                  onChange={(e) => handleChange('nivelRequerido', e.target.value)}
                >
                  <MenuItem value="Principiante">Principiante</MenuItem>
                  <MenuItem value="Intermedio">Intermedio</MenuItem>
                  <MenuItem value="Avanzado">Avanzado</MenuItem>
                  <MenuItem value="Todos los niveles">Todos los niveles</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 6 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            ¡Partido Creado Exitosamente!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Tu partido ha sido creado y estará visible para otros jugadores.
            Serás redirigido a la lista de partidos en unos segundos...
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/matches')}
            sx={{ mt: 2 }}
          >
            Ver Partidos
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/matches')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ⚽ Crear Nuevo Partido
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Completa la información para crear tu partido
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent(activeStep)}
        </CardContent>
        
        {/* Navigation Buttons */}
        <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Anterior
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isStepValid(activeStep) || loading}
                startIcon={loading ? <CircularProgress size={16} /> : <Add />}
                size="large"
              >
                {loading ? 'Creando...' : 'Crear Partido'}
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
        </Box>
      </Card>
    </Container>
  );
};

export default CreateMatch;