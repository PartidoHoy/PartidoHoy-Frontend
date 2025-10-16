import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

  // ✅ DASHBOARD PRINCIPAL - PERFIL COMPLETO
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header del Dashboard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          ¡Bienvenido al Dashboard, {user?.nombre || profileData?.nombre}! ⚽
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Tu perfil está completo y listo para jugar
        </Typography>
      </Box>

      {/* Información del Perfil */}
      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              📋 Tu Perfil de Jugador
            </Typography>
            {profileData && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>Posición:</strong> {profileData.posicion}
                </Typography>
                <Typography variant="body1">
                  <strong>Nivel:</strong> {profileData.nivel}
                </Typography>
                {profileData.ubicacion && (
                  <Typography variant="body1">
                    <strong>Ubicación:</strong> {profileData.ubicacion}
                  </Typography>
                )}
                {profileData.biografia && (
                  <Typography variant="body1">
                    <strong>Biografía:</strong> {profileData.biografia}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Acciones Rápidas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          🚀 Acciones Rápidas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/profile')}
          >
            Ver Mi Perfil Completo
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/users')}
          >
            Ver Otros Jugadores
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              console.log('🧪 Ejecutando diagnóstico...');
              if (window.runDiagnostic) {
                window.runDiagnostic();
              }
            }}
          >
            🔍 Diagnóstico del Sistema
          </Button>
        </Box>
      </Box>

      {/* Información del Sistema */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ℹ️ Estado del Sistema
            </Typography>
            <Typography variant="body2">
              • Usuario autenticado: {user?.email}
            </Typography>
            <Typography variant="body2">
              • Rol: {user?.roles?.join(', ') || 'Usuario'}
            </Typography>
            <Typography variant="body2">
              • Perfil: Completo ✅
            </Typography>
            <Typography variant="body2">
              • Fuente de datos: {profileData?.source === 'server' ? 'Servidor' : 'Local'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Botón de Logout */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;