import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/layout/Layout';
import HomePage from './HomePage';
import CompleteProfile from './CompleteProfile';

const Dashboard = () => {
  const [profileStatus, setProfileStatus] = useState('checking'); // 'checking', 'complete', 'incomplete'

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

  // 🔄 MOSTRAR LOADING MIENTRAS VERIFICA PERFIL
  if (profileStatus === 'checking') {
    return (
      <Layout>
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
      </Layout>
    );
  }

  // ❌ MOSTRAR MENSAJE DE COMPLETAR PERFIL SOLO SI REALMENTE ESTÁ INCOMPLETO
  if (profileStatus === 'incomplete') {
    return (
      <Layout>
        <CompleteProfile />
      </Layout>
    );
  }

  // ✅ DASHBOARD PRINCIPAL - PERFIL COMPLETO
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

export default Dashboard;