import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { runDiagnostic } from '../utils/diagnostic';
import { checkBackendEndpoints } from '../utils/backendChecker';
import { clearAuthSession, runFullAuthDiagnosis } from '../utils/authUtils';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState('checking'); // 'checking', 'complete', 'incomplete'
  const [profileData, setProfileData] = useState(null);

  // 🎯 VERIFICAR PERFIL AL CARGAR EL COMPONENTE
  useEffect(() => {
    checkProfileCompleteness();
  }, []);

  const checkProfileCompleteness = async () => {
    try {
      console.log('🔍 Dashboard: Verificando completitud del perfil...');
      
      // Usar el validador unificado
      if (window.isProfileComplete) {
        const validation = await window.isProfileComplete();
        
        if (validation.profileComplete) {
          setProfileStatus('complete');
          setProfileData(validation.profileData);
          console.log('✅ Dashboard: Perfil completo detectado');
        } else {
          setProfileStatus('incomplete');
          console.log('❌ Dashboard: Perfil incompleto detectado');
        }
      } else {
        // Fallback si el validador no está disponible
        const tempProfile = localStorage.getItem('tempProfile');
        if (tempProfile) {
          const profile = JSON.parse(tempProfile);
          if (profile.posicion && profile.nivel) {
            setProfileStatus('complete');
            setProfileData(profile);
          } else {
            setProfileStatus('incomplete');
          }
        } else {
          setProfileStatus('incomplete');
        }
      }
    } catch (error) {
      console.error('❌ Error verificando perfil:', error);
      setProfileStatus('incomplete');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🔄 MOSTRAR LOADING MIENTRAS VERIFICA PERFIL
  if (profileStatus === 'checking') {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <Typography variant="h6">
              Verificando perfil...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ❌ MOSTRAR MENSAJE DE COMPLETAR PERFIL SOLO SI REALMENTE ESTÁ INCOMPLETO
  if (profileStatus === 'incomplete') {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              ¡Bienvenido, {user?.nombre}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Para comenzar a usar PartidoHoy, necesitas completar tu perfil de jugador.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/complete-profile')}
              sx={{ mr: 2 }}
            >
              Completar Perfil
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Mostrar alerta si está en modo fallback */}
      {hasFallbackProfile && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#856404', mb: 1 }}>
                ⚠️ Perfil en Modo Temporal (Backend No Disponible)
              </Typography>
              <Typography variant="body2" sx={{ color: '#856404' }}>
                <strong>Problema detectado:</strong> Todos los endpoints de perfil devuelven 403 Forbidden.
                El backend Spring Boot necesita configurar Spring Security para permitir acceso a endpoints de perfil.
              </Typography>
              <Typography variant="body2" sx={{ color: '#856404', mt: 1 }}>
                <strong>Datos guardados localmente:</strong> {hasFallbackProfile.posicion}, Nivel {hasFallbackProfile.nivel}
                {hasFallbackProfile.ubicacion && `, Ubicación: ${hasFallbackProfile.ubicacion}`}
              </Typography>
              <Typography variant="body2" sx={{ color: '#856404', mt: 1 }}>
                <strong>Para el desarrollador:</strong> Verificar SecurityConfig.java - los endpoints como /api/users/me, /api/profiles/me necesitan permisos ROLE_USER.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={async () => {
                    try {
                      // Intentar sincronizar los datos fallback
                      const userService = await import('../services/userService');
                      await userService.default.updateProfile(hasFallbackProfile);
                      // Si funciona, limpiar fallback y recargar
                      localStorage.removeItem('tempProfile');
                      window.location.reload();
                    } catch (error) {
                      console.log('Servidor aún no disponible:', error);
                    }
                  }}
                  sx={{ color: '#856404', borderColor: '#856404' }}
                >
                  Intentar Sincronizar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          ¡Bienvenido, {user?.nombre || 'Usuario'}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Panel de Control - PartidoHoy
        </Typography>
        
        {/* Debug info - siempre visible para debug */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            <strong>Debug - Datos del usuario:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            Nombre: {user?.nombre || 'No definido'}
          </Typography>
          <Typography variant="caption" display="block">
            Email: {user?.email || 'No definido'}
          </Typography>
          <Typography variant="caption" display="block">
            Posición: {user?.posicion || 'No definido'}
          </Typography>
          <Typography variant="caption" display="block">
            Nivel: {user?.nivel || 'No definido'}
          </Typography>
          <Typography variant="caption" display="block">
            Token en localStorage: {localStorage.getItem('jwt') ? 'Sí' : 'No'}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button 
              size="small" 
              variant="outlined" 
              color="error"
              onClick={clearAuthSession}
              sx={{ mr: 1 }}
            >
              Limpiar y Volver a Login
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              color="info"
              onClick={runDiagnostic}
              sx={{ mr: 1 }}
            >
              Ejecutar Diagnóstico
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              color="success"
              onClick={checkBackendEndpoints}
              sx={{ mr: 1 }}
            >
              Verificar Endpoints
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              color="primary"
              onClick={runFullAuthDiagnosis}
            >
              Diagnóstico Completo
            </Button>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información del Usuario
          </Typography>
          <Typography variant="body1">
            Email: {user?.email}
          </Typography>
          {user?.posicion && (
            <Typography variant="body1">
              Posición: {user.posicion}
            </Typography>
          )}
          {user?.nivel && (
            <Typography variant="body1">
              Nivel: {user.nivel}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/profile')}
          sx={{ minWidth: 150 }}
        >
          Mi Perfil
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => navigate('/users')}
          sx={{ minWidth: 150 }}
        >
          Ver Jugadores
        </Button>

        <Button 
          variant="outlined" 
          color="error"
          onClick={handleLogout}
          sx={{ minWidth: 150 }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;
