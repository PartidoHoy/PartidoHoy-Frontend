import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import HomePage from './HomePage';
import CompleteProfile from './CompleteProfile';

const Dashboard = () => {
  const location = useLocation();
  const [profileStatus, setProfileStatus] = useState('checking'); // 'checking', 'complete', 'incomplete'

  // 🎯 VERIFICAR PERFIL AL CARGAR EL COMPONENTE Y CUANDO CAMBIE LA UBICACIÓN
  useEffect(() => {
    checkProfileCompleteness();
    
    // Escuchar evento de perfil completado
    const handleProfileCompleted = () => {
      console.log('📢 Dashboard: Perfil completado detectado, recargando...');
      setProfileStatus('checking');
      setTimeout(() => {
        checkProfileCompleteness();
      }, 500);
    };

    window.addEventListener('profileCompleted', handleProfileCompleted);
    
    return () => {
      window.removeEventListener('profileCompleted', handleProfileCompleted);
    };
  }, [location.pathname]); // Agregar location.pathname como dependencia

  const checkProfileCompleteness = async () => {
    try {
      console.log('🔍 Dashboard: Verificando completitud del perfil...');
      
      // Limpiar cualquier cache previo
      if (window.profileCache) {
        delete window.profileCache;
      }
      
      // Usar el validador unificado
      if (window.isProfileComplete) {
        const validation = await window.isProfileComplete();
        
        if (validation.profileComplete) {
          setProfileStatus('complete');
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
            console.log('✅ Dashboard: Perfil completo (fallback)');
          } else {
            setProfileStatus('incomplete');
            console.log('❌ Dashboard: Perfil incompleto (fallback)');
          }
        } else {
          setProfileStatus('incomplete');
          console.log('❌ Dashboard: Sin perfil detectado');
        }
      }
    } catch (error) {
      console.error('❌ Error verificando perfil:', error);
      setProfileStatus('incomplete');
    }
  };

  // 🔄 MOSTRAR LOADING MIENTRAS VERIFICA PERFIL
  if (profileStatus === 'checking') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 70px)',
        bgcolor: 'background.default'
      }}>
        <Typography variant="h6" color="text.secondary">
          Verificando perfil...
        </Typography>
      </Box>
    );
  }

  // ❌ MOSTRAR MENSAJE DE COMPLETAR PERFIL SOLO SI REALMENTE ESTÁ INCOMPLETO
  if (profileStatus === 'incomplete') {
    return <CompleteProfile />;
  }

  // ✅ DASHBOARD PRINCIPAL - PERFIL COMPLETO
  return <HomePage />;
};

export default Dashboard;