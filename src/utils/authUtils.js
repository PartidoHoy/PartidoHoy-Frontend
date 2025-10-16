/**
 * UTILIDADES DE AUTENTICACIÓN PARA DEPURACIÓN
 * 
 * Herramientas para limpiar y diagnosticar problemas de autenticación
 */

// Limpiar completamente la sesión de autenticación
export const clearAuthSession = () => {
  console.log('🧹 === LIMPIANDO SESIÓN DE AUTENTICACIÓN ===');
  
  // Items relacionados con autenticación
  const authItems = [
    'jwt',
    'fallbackProfile', 
    'tempProfile',
    'user',
    'authData'
  ];
  
  authItems.forEach(item => {
    const value = localStorage.getItem(item);
    if (value) {
      console.log(`🗑️ Eliminando ${item}:`, value);
      localStorage.removeItem(item);
    } else {
      console.log(`✅ ${item} ya estaba vacío`);
    }
  });
  
  console.log('✅ Sesión de autenticación limpiada completamente');
  console.log('🔄 Redirigiendo a login...');
  
  // Forzar recarga para limpiar estado de React
  window.location.href = '/login';
};

// Diagnosticar estado de autenticación
export const diagnoseAuthState = () => {
  console.log('🔍 === DIAGNÓSTICO DE ESTADO DE AUTENTICACIÓN ===');
  
  const token = localStorage.getItem('jwt');
  const fallbackProfile = localStorage.getItem('fallbackProfile');
  const tempProfile = localStorage.getItem('tempProfile');
  
  console.log('🔑 Token JWT:', token ? '✅ Presente' : '❌ Ausente');
  if (token) {
    try {
      // Verificar si es un JWT válido básico
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('📄 Token payload:', payload);
        
        // Verificar expiración
        if (payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          const expired = payload.exp < now;
          console.log('⏰ Token expirado:', expired ? '❌ SÍ' : '✅ NO');
          if (expired) {
            console.log('🚨 Token expirado - debería ser eliminado');
          }
        }
      } else {
        console.log('⚠️ Token no tiene formato JWT válido');
      }
    } catch (error) {
      console.log('❌ Error al decodificar token:', error.message);
    }
  }
  
  console.log('💾 Perfil fallback:', fallbackProfile ? '✅ Presente' : '❌ Ausente');
  if (fallbackProfile) {
    try {
      const parsed = JSON.parse(fallbackProfile);
      console.log('📋 Datos fallback:', parsed);
    } catch (error) {
      console.log('❌ Error al parsear perfil fallback:', error.message);
    }
  }
  
  console.log('🔄 Perfil temporal:', tempProfile ? '✅ Presente' : '❌ Ausente');
  if (tempProfile) {
    try {
      const parsed = JSON.parse(tempProfile);
      console.log('📋 Datos temporales:', parsed);
    } catch (error) {
      console.log('❌ Error al parsear perfil temporal:', error.message);
    }
  }
  
  // Estado total del localStorage
  const allKeys = Object.keys(localStorage);
  console.log('🗄️ Todas las claves en localStorage:', allKeys);
  
  return {
    hasToken: !!token,
    hasFallbackProfile: !!fallbackProfile,
    hasTempProfile: !!tempProfile,
    totalStorageItems: allKeys.length
  };
};

// Verificar conectividad básica con backend
export const testBackendConnectivity = async () => {
  console.log('🌐 === PROBANDO CONECTIVIDAD CON BACKEND ===');
  
  const endpoints = [
    { name: 'Health Check', url: 'http://localhost:8080/health' },
    { name: 'Auth Status', url: 'http://localhost:8080/auth/status' },
    { name: 'Login', url: 'http://localhost:8080/auth/login', method: 'POST' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Probando ${endpoint.name}...`);
      
      const options = {
        method: endpoint.method || 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.name === 'Auth Status') {
        const token = localStorage.getItem('jwt');
        if (token) {
          options.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      if (endpoint.method === 'POST') {
        options.body = JSON.stringify({ email: 'test@test.com', password: 'test' });
      }
      
      const response = await fetch(endpoint.url, options);
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: OK (${response.status})`);
      } else {
        console.log(`🚫 ${endpoint.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }
  
  console.log('✅ Prueba de conectividad completada');
};

// Ejecutar diagnóstico completo
export const runFullAuthDiagnosis = async () => {
  console.log('🏥 === DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN ===');
  
  diagnoseAuthState();
  await testBackendConnectivity();
  
  const authState = diagnoseAuthState();
  
  if (authState.hasToken && !authState.hasFallbackProfile) {
    console.log('💡 RECOMENDACIÓN: Tienes token pero no perfil - intenta hacer login');
  } else if (!authState.hasToken && authState.hasFallbackProfile) {
    console.log('💡 RECOMENDACIÓN: Tienes perfil fallback pero no token - limpia la sesión');
  } else if (!authState.hasToken && !authState.hasFallbackProfile) {
    console.log('💡 RECOMENDACIÓN: No hay datos de autenticación - haz login');
  } else {
    console.log('💡 RECOMENDACIÓN: Estado mixto - considera limpiar la sesión');
  }
  
  console.log('🏁 Diagnóstico completo finalizado');
};