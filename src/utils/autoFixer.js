/**
 * 🛠️ AUTO-REPARADOR DE PROBLEMAS DE AUTENTICACIÓN
 * Se ejecuta automáticamente para solucionar problemas comunes de 403
 */

import { AUTH_ENDPOINTS } from './apiConfig';

export const autoFixer = {
  
  // 🔧 APLICAR TODAS LAS SOLUCIONES AUTOMÁTICAMENTE
  autoFix403Problems: async () => {
    console.log('🔧 === INICIANDO AUTO-REPARACIÓN ===');
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: [],
      success: false,
      workingSolution: null
    };
    
    // Paso 1: Verificar si hay token
    const token = localStorage.getItem('jwt');
    if (!token) {
      results.steps.push({
        step: 'Token Check',
        status: 'FAILED',
        message: 'No hay token - se requiere login'
      });
      return results;
    }
    
    results.steps.push({
      step: 'Token Check',
      status: 'OK',
      message: `Token encontrado (${token.length} chars)`
    });
    
    // Paso 2: Intentar diferentes formatos de Authorization header
    const authFormats = [
      { name: 'Bearer Standard', header: `Bearer ${token}` },
      { name: 'Bearer Lowercase', header: `bearer ${token}` },
      { name: 'Token Only', header: token },
      { name: 'JWT Prefix', header: `JWT ${token}` },
      { name: 'Authorization Simple', header: `Token ${token}` }
    ];
    
    console.log('🔧 Probando diferentes formatos de autorización...');
    
    for (const format of authFormats) {
      try {
        console.log(`🧪 Probando formato: ${format.name}`);
        
        const response = await fetch(AUTH_ENDPOINTS.STATUS, {
          method: 'GET',
          headers: {
            'Authorization': format.header,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const step = {
          step: `Auth Format: ${format.name}`,
          status: response.ok ? 'SUCCESS' : 'FAILED',
          statusCode: response.status,
          format: format.header.substring(0, 20) + '...'
        };
        
        results.steps.push(step);
        
        if (response.ok) {
          console.log(`✅ ¡FORMATO FUNCIONANDO! ${format.name}`);
          results.success = true;
          results.workingSolution = format;
          
          // Actualizar los headers en localStorage para uso futuro
          localStorage.setItem('workingAuthFormat', JSON.stringify(format));
          
          break;
        } else {
          console.log(`❌ Formato ${format.name} falló: ${response.status}`);
        }
      } catch (error) {
        results.steps.push({
          step: `Auth Format: ${format.name}`,
          status: 'ERROR',
          error: error.message
        });
        console.log(`🚨 Error con formato ${format.name}:`, error.message);
      }
    }
    
    // Paso 3: Si ningún formato funciona, intentar refresco de token
    if (!results.success) {
      console.log('🔄 Intentando refresh de token...');
      
      try {
        const refreshResult = await autoFixer.attemptTokenRefresh();
        results.steps.push(refreshResult);
        
        if (refreshResult.status === 'SUCCESS') {
          results.success = true;
          results.workingSolution = { type: 'token_refresh' };
        }
      } catch (error) {
        results.steps.push({
          step: 'Token Refresh',
          status: 'ERROR',
          error: error.message
        });
      }
    }
    
    // Paso 4: Probar endpoints alternativos si el token funciona
    if (results.success && results.workingSolution) {
      console.log('🎯 Probando endpoints de perfil con formato funcionando...');
      
      const profileTest = await autoFixer.testProfileEndpoints(results.workingSolution);
      results.steps.push(profileTest);
    }
    
    // Resultado final
    console.log('📊 === RESULTADO DE AUTO-REPARACIÓN ===');
    console.table(results.steps);
    
    if (results.success) {
      console.log('✅ ¡PROBLEMA SOLUCIONADO!');
      console.log('🔧 Solución aplicada:', results.workingSolution);
    } else {
      console.log('❌ No se pudo solucionar automáticamente');
      console.log('💡 Se requiere intervención manual en el backend');
    }
    
    return results;
  },
  
  // 🔄 INTENTAR REFRESH DE TOKEN
  attemptTokenRefresh: async () => {
    const currentToken = localStorage.getItem('jwt');
    
    if (!currentToken) {
      return {
        step: 'Token Refresh',
        status: 'FAILED',
        message: 'No token to refresh'
      };
    }
    
    try {
      // Intentar varios endpoints de refresh
      const refreshEndpoints = [
        `${AUTH_ENDPOINTS.BASE_URL}/refresh`,
        `${AUTH_ENDPOINTS.BASE_URL}/token/refresh`,
        `${AUTH_ENDPOINTS.BASE_URL}/auth/refresh`
      ];
      
      for (const endpoint of refreshEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.token || data.accessToken) {
              const newToken = data.token || data.accessToken;
              localStorage.setItem('jwt', newToken);
              
              return {
                step: 'Token Refresh',
                status: 'SUCCESS',
                message: `Token refrescado desde ${endpoint}`
              };
            }
          }
        } catch (error) {
          console.log(`Refresh endpoint ${endpoint} failed:`, error.message);
        }
      }
      
      return {
        step: 'Token Refresh',
        status: 'FAILED',
        message: 'No refresh endpoint available'
      };
      
    } catch (error) {
      return {
        step: 'Token Refresh',
        status: 'ERROR',
        error: error.message
      };
    }
  },
  
  // 🎯 PROBAR ENDPOINTS DE PERFIL
  testProfileEndpoints: async (workingAuthFormat) => {
    const token = localStorage.getItem('jwt');
    const authHeader = workingAuthFormat.header || `Bearer ${token}`;
    
    const profileEndpoints = [
      'http://localhost:8080/api/profiles/me',
      'http://localhost:8080/api/users/me',
      'http://localhost:8080/api/user/profile',
      'http://localhost:8080/api/auth/profile',
      'http://localhost:8080/profile/me'
    ];
    
    const workingEndpoints = [];
    
    for (const endpoint of profileEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          workingEndpoints.push(endpoint);
          console.log(`✅ Endpoint de perfil funcionando: ${endpoint}`);
        }
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} error:`, error.message);
      }
    }
    
    // Guardar endpoints funcionando
    if (workingEndpoints.length > 0) {
      localStorage.setItem('workingProfileEndpoints', JSON.stringify(workingEndpoints));
    }
    
    return {
      step: 'Profile Endpoints Test',
      status: workingEndpoints.length > 0 ? 'SUCCESS' : 'FAILED',
      workingEndpoints: workingEndpoints,
      message: `${workingEndpoints.length} endpoints de perfil funcionando`
    };
  },
  
  // 🧹 LIMPIAR CONFIGURACIONES CORRUPTAS
  cleanupCorruptedAuth: () => {
    console.log('🧹 Limpiando configuraciones de autenticación corruptas...');
    
    const itemsToClean = [
      'jwt',
      'token',
      'authToken',
      'accessToken',
      'refreshToken',
      'user',
      'userData',
      'authUser',
      'fallbackProfile',
      'workingAuthFormat',
      'workingProfileEndpoints'
    ];
    
    const cleaned = [];
    
    itemsToClean.forEach(item => {
      if (localStorage.getItem(item)) {
        localStorage.removeItem(item);
        cleaned.push(item);
      }
    });
    
    // También limpiar sessionStorage
    itemsToClean.forEach(item => {
      if (sessionStorage.getItem(item)) {
        sessionStorage.removeItem(item);
        cleaned.push(`session.${item}`);
      }
    });
    
    console.log('✅ Limpieza completada. Items eliminados:', cleaned);
    
    return {
      success: true,
      itemsCleaned: cleaned,
      message: `Se limpiaron ${cleaned.length} items de autenticación`
    };
  },
  
  // 🔧 APLICAR SOLUCIÓN ESPECÍFICA BASADA EN PROBLEMA DETECTADO
  applySpecificFix: async (problemType) => {
    console.log(`🔧 Aplicando solución específica para: ${problemType}`);
    
    switch (problemType) {
      case 'EXPIRED_TOKEN':
        return autoFixer.cleanupCorruptedAuth();
        
      case 'WRONG_AUTH_FORMAT':
        return autoFixer.autoFix403Problems();
        
      case 'MISSING_ROLES':
        console.log('⚠️ Problema de roles - requiere acción en backend');
        return {
          success: false,
          message: 'Problema de roles requiere configuración en backend',
          recommendation: 'Verificar que el usuario tenga ROLE_USER en la base de datos'
        };
        
      case 'BACKEND_CONFIG':
        console.log('⚠️ Problema de configuración backend');
        return {
          success: false,
          message: 'Spring Security mal configurado',
          recommendation: 'Verificar SecurityConfig.java - endpoints deben tener .hasRole("USER")'
        };
        
      default:
        return autoFixer.autoFix403Problems();
    }
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.autoFix = autoFixer.autoFix403Problems;
  window.cleanAuth = autoFixer.cleanupCorruptedAuth;
  window.testFormats = () => autoFixer.autoFix403Problems();
  
  console.log('🔧 Auto-reparador disponible:');
  console.log('   autoFix() - Reparación automática completa');
  console.log('   cleanAuth() - Limpiar autenticación');
  console.log('   testFormats() - Probar formatos de token');
}

export default autoFixer;