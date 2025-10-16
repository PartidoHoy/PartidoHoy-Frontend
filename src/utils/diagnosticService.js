/**
 * 🛠️ SERVICIO DE DIAGNÓSTICO AVANZADO
 * Para diagnosticar y solucionar problemas de autenticación y backend
 */

import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS, HEALTH_ENDPOINTS } from './apiConfig';

export const diagnosticService = {
  
  // 🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA
  runCompleteDiagnostic: async () => {
    console.log('🚀 === INICIANDO DIAGNÓSTICO COMPLETO ===');
    
    const results = {
      timestamp: new Date().toISOString(),
      frontend: await diagnosticService.checkFrontendState(),
      backend: await diagnosticService.checkBackendHealth(),
      authentication: await diagnosticService.checkAuthenticationFlow(),
      endpoints: await diagnosticService.checkAllEndpoints(),
      localStorage: diagnosticService.checkLocalStorage(),
      summary: {}
    };
    
    // Generar resumen
    results.summary = diagnosticService.generateSummary(results);
    
    console.log('📊 === RESULTADOS DEL DIAGNÓSTICO ===');
    console.table(results.summary);
    
    return results;
  },

  // 🖥️ ESTADO DEL FRONTEND
  checkFrontendState: async () => {
    console.log('🖥️ Verificando estado del frontend...');
    
    return {
      reactVersion: 'React App',
      url: window.location.href,
      userAgent: navigator.userAgent,
      localStorage: {
        jwtExists: !!localStorage.getItem('jwt'),
        jwtLength: localStorage.getItem('jwt')?.length || 0,
        fallbackProfile: !!localStorage.getItem('fallbackProfile')
      },
      sessionStorage: {
        hasData: sessionStorage.length > 0,
        keys: Object.keys(sessionStorage)
      }
    };
  },

  // 🏥 SALUD DEL BACKEND
  checkBackendHealth: async () => {
    console.log('🏥 Verificando salud del backend...');
    
    const results = {};
    
    // Probar endpoint de salud
    try {
      const response = await fetch(HEALTH_ENDPOINTS.CHECK, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.health = {
        status: response.status,
        ok: response.ok,
        message: response.ok ? 'Backend funcionando' : 'Backend con problemas'
      };
      
      if (response.ok) {
        const data = await response.json();
        results.health.data = data;
      }
    } catch (error) {
      results.health = {
        status: 'ERROR',
        ok: false,
        message: `Error de conexión: ${error.message}`,
        error: error.toString()
      };
    }
    
    return results;
  },

  // 🔐 FLUJO DE AUTENTICACIÓN
  checkAuthenticationFlow: async () => {
    console.log('🔐 Verificando flujo de autenticación...');
    
    const results = {
      tokenStatus: 'NO_TOKEN',
      authEndpoints: {},
      userInfo: null
    };
    
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      results.tokenStatus = 'NO_TOKEN';
      results.message = 'No hay token en localStorage';
      return results;
    }
    
    results.tokenStatus = 'TOKEN_EXISTS';
    results.tokenLength = token.length;
    
    // Probar endpoint de estado de auth
    try {
      const response = await fetch(AUTH_ENDPOINTS.STATUS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.authEndpoints.status = {
        status: response.status,
        ok: response.ok
      };
      
      if (response.ok) {
        const data = await response.json();
        results.userInfo = data;
        results.tokenStatus = 'VALID_TOKEN';
      } else {
        results.tokenStatus = 'INVALID_TOKEN';
      }
    } catch (error) {
      results.authEndpoints.status = {
        status: 'ERROR',
        error: error.message
      };
      results.tokenStatus = 'ERROR';
    }
    
    return results;
  },

  // 🌐 VERIFICAR TODOS LOS ENDPOINTS
  checkAllEndpoints: async () => {
    console.log('🌐 Verificando todos los endpoints...');
    
    const token = localStorage.getItem('jwt');
    const results = {};
    
    // Endpoints públicos (sin token)
    const publicEndpoints = [
      { name: 'Health Check', url: HEALTH_ENDPOINTS.CHECK, method: 'GET' }
    ];
    
    // Endpoints protegidos (con token)
    const protectedEndpoints = [
      { name: 'Auth Status', url: AUTH_ENDPOINTS.STATUS, method: 'GET' },
      { name: 'Get My Profile', url: PROFILE_ENDPOINTS.GET_MY_PROFILE, method: 'GET' },
      { name: 'Get My Card', url: PROFILE_ENDPOINTS.GET_MY_CARD, method: 'GET' }
    ];
    
    // Probar endpoints públicos
    for (const endpoint of publicEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' }
        });
        
        results[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          type: 'public'
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'ERROR',
          ok: false,
          error: error.message,
          type: 'public'
        };
      }
    }
    
    // Probar endpoints protegidos (solo si hay token)
    if (token) {
      for (const endpoint of protectedEndpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          results[endpoint.name] = {
            status: response.status,
            ok: response.ok,
            type: 'protected'
          };
        } catch (error) {
          results[endpoint.name] = {
            status: 'ERROR',
            ok: false,
            error: error.message,
            type: 'protected'
          };
        }
      }
    }
    
    return results;
  },

  // 💾 VERIFICAR LOCALSTORAGE
  checkLocalStorage: () => {
    console.log('💾 Verificando localStorage...');
    
    const data = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      data[key] = {
        length: value.length,
        type: typeof value,
        preview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
      };
    }
    
    return {
      totalKeys: localStorage.length,
      data: data
    };
  },

  // 📋 GENERAR RESUMEN
  generateSummary: (results) => {
    const summary = [];
    
    // Estado general
    summary.push({
      '🔍 Aspecto': 'Backend',
      '📊 Estado': results.backend?.health?.ok ? '✅ Funcionando' : '❌ Con problemas',
      '📝 Detalles': results.backend?.health?.message || 'No verificado'
    });
    
    summary.push({
      '🔍 Aspecto': 'Token JWT',
      '📊 Estado': results.authentication?.tokenStatus === 'VALID_TOKEN' ? '✅ Válido' : 
                  results.authentication?.tokenStatus === 'NO_TOKEN' ? '⚠️ No existe' : '❌ Inválido',
      '📝 Detalles': `Longitud: ${results.authentication?.tokenLength || 0}`
    });
    
    summary.push({
      '🔍 Aspecto': 'LocalStorage',
      '📊 Estado': results.localStorage?.totalKeys > 0 ? '✅ Con datos' : '⚠️ Vacío',
      '📝 Detalles': `${results.localStorage?.totalKeys || 0} keys almacenadas`
    });
    
    // Endpoints
    let workingEndpoints = 0;
    let totalEndpoints = 0;
    
    Object.values(results.endpoints || {}).forEach(endpoint => {
      totalEndpoints++;
      if (endpoint.ok) workingEndpoints++;
    });
    
    summary.push({
      '🔍 Aspecto': 'Endpoints',
      '📊 Estado': workingEndpoints === totalEndpoints ? '✅ Todos funcionando' : 
                  workingEndpoints > 0 ? '⚠️ Algunos funcionando' : '❌ Ninguno funciona',
      '📝 Detalles': `${workingEndpoints}/${totalEndpoints} funcionando`
    });
    
    return summary;
  },

  // 🧪 PRUEBA DE LOGIN DE EMERGENCIA
  emergencyLoginTest: async (credentials) => {
    console.log('🧪 Iniciando prueba de login de emergencia...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      credentials: { username: credentials.username, password: '***' },
      attempts: []
    };
    
    // Intento 1: Endpoint oficial
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      testResults.attempts.push({
        method: 'Endpoint oficial',
        url: AUTH_ENDPOINTS.LOGIN,
        status: response.status,
        ok: response.ok,
        result: response.ok ? 'SUCCESS' : 'FAILED'
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.success = true;
        testResults.token = data.token;
        return testResults;
      }
    } catch (error) {
      testResults.attempts.push({
        method: 'Endpoint oficial',
        url: AUTH_ENDPOINTS.LOGIN,
        status: 'ERROR',
        ok: false,
        error: error.message,
        result: 'ERROR'
      });
    }
    
    // Intento 2: Endpoints alternativos
    const alternativeEndpoints = [
      `${AUTH_ENDPOINTS.BASE_URL}/login`,
      `${AUTH_ENDPOINTS.BASE_URL}/authenticate`,
      `${AUTH_ENDPOINTS.BASE_URL}/signin`,
      `http://localhost:8080/login`,
      `http://localhost:8080/authenticate`
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        testResults.attempts.push({
          method: 'Endpoint alternativo',
          url: endpoint,
          status: response.status,
          ok: response.ok,
          result: response.ok ? 'SUCCESS' : 'FAILED'
        });
        
        if (response.ok) {
          const data = await response.json();
          testResults.success = true;
          testResults.token = data.token;
          testResults.workingEndpoint = endpoint;
          return testResults;
        }
      } catch (error) {
        testResults.attempts.push({
          method: 'Endpoint alternativo',
          url: endpoint,
          status: 'ERROR',
          ok: false,
          error: error.message,
          result: 'ERROR'
        });
      }
    }
    
    testResults.success = false;
    return testResults;
  },

  // 🔄 LIMPIAR Y RESETEAR ESTADO
  resetApplicationState: () => {
    console.log('🔄 Reseteando estado de la aplicación...');
    
    const clearedItems = [];
    
    // Limpiar localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.includes('jwt') || key.includes('token') || key.includes('auth') || key.includes('fallback'))) {
        localStorage.removeItem(key);
        clearedItems.push(`localStorage.${key}`);
      }
    }
    
    // Limpiar sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('jwt') || key.includes('token') || key.includes('auth'))) {
        sessionStorage.removeItem(key);
        clearedItems.push(`sessionStorage.${key}`);
      }
    }
    
    console.log('✅ Estado reseteado. Items eliminados:', clearedItems);
    
    return {
      success: true,
      clearedItems: clearedItems,
      message: `Se eliminaron ${clearedItems.length} items relacionados con autenticación`
    };
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE PARA LA CONSOLA
if (typeof window !== 'undefined') {
  window.runDiagnostic = diagnosticService.runCompleteDiagnostic;
  window.checkBackendEndpoints = diagnosticService.checkAllEndpoints;
  window.emergencyLogin = diagnosticService.emergencyLoginTest;
  window.resetAuth = diagnosticService.resetApplicationState;
  
  console.log('🛠️ Funciones de diagnóstico disponibles:');
  console.log('   runDiagnostic() - Diagnóstico completo');
  console.log('   checkBackendEndpoints() - Verificar endpoints');
  console.log('   emergencyLogin({username: "test", password: "test"}) - Prueba de login');
  console.log('   resetAuth() - Resetear autenticación');
}

export default diagnosticService;