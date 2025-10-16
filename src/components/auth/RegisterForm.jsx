import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateField } from '../../utils/validators';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let fieldError = null;
    if (name === 'confirmPassword') {
      fieldError = value !== formData.password ? 'Las contraseñas no coinciden' : null;
    } else {
      fieldError = validateField(name, value);
    }

    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    const nombreError = validateField('nombre', formData.nombre);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword ? 'Las contraseñas no coinciden' : null;

    if (nombreError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        nombre: nombreError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError
      });
      setLoading(false);
      return;
    }

    try {
      await register(formData.nombre, formData.email, formData.password);
      setSuccess('Registro exitoso. Iniciando sesión...');
      
      // Hacer login automático después del registro
      try {
        await login(formData.email, formData.password);
        setTimeout(() => {
          navigate('/complete-profile');
        }, 1500);
      } catch (loginErr) {
        console.error('Auto-login failed:', loginErr);
        setSuccess('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Manejo detallado de errores
      if (err.response?.status === 403) {
        setError(`Acceso denegado (403). Tu configuración CORS se ve correcta, pero verifica:

1. ¿Reiniciaste el backend después del cambio?
2. ¿El backend está en puerto 8080?
3. ¿Hay algún filtro de seguridad adicional?

Usa /test-connection para diagnóstico detallado.`);
      } else if (err.response?.status === 409) {
        setError('El email ya está registrado. Intenta con otro email.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Datos inválidos. Verifica los campos.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8080');
      } else {
        setError(err.response?.data?.message || `Error del servidor: ${err.response?.status || 'Desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            PartidoHoy
          </Typography>
          <Typography component="h2" variant="h5" align="center" sx={{ mb: 3 }}>
            Crear Cuenta
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nombre"
              label="Nombre Completo"
              name="nombre"
              autoComplete="name"
              autoFocus
              value={formData.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Cuenta'}
            </Button>
            <Box textAlign="center">
              <Link to="/login">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
              <br />
              <Link to="/test-connection" style={{ fontSize: '0.85rem', marginTop: '8px', display: 'inline-block' }}>
                🔧 ¿Problemas de conexión? Diagnóstico
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterForm;