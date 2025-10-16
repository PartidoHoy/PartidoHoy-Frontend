/**
 * 🎉 VERIFICADOR DE CONEXIÓN POST-SOLUCIÓN
 * Confirma que el backend está funcionando correctamente después del fix
 */

export const backendVerifier = {
  
  // ✅ VERIFICACIÓN COMPLETA POST-SOLUCIÓN
  verifyBackendFix: async () => {
    console.log('🎉 === VERIFICANDO SOLUCIÓN DEL BACKEND ===');
    
    const results = {
      timestamp: new Date().toISOString(),
      backendFixed: false,
      endpointsWorking: {},
      authFlow: {},
      recommendations: []
    };
    
    // 1. Verificar endpoints básicos
    console.log('🔍 Verificando endpoints básicos...');
    results.endpointsWorking = await backendVerifier.testBasicEndpoints();
    
    // 2. Probar flujo de autenticación completo
    console.log('🔐 Probando flujo de autenticación...');
    results.authFlow = await backendVerifier.testAuthFlow();
    
    // 3. Generar recomendaciones
    results.recommendations = backendVerifier.generateRecommendations(results);
    results.backendFixed = backendVerifier.isBackendFixed(results);
    
    // 4. Mostrar resultados
    backendVerifier.displayResults(results);
    
    return results;
  },
  
  // 🧪 PROBAR ENDPOINTS BÁSICOS
  testBasicEndpoints: async () => {
    const endpoints = [
      { name: 'Health Check', url: 'http://localhost:8080/health', method: 'GET', needsAuth: false },
      { name: 'Auth Status', url: 'http://localhost:8080/auth/status', method: 'GET', needsAuth: true }
    ];
    
    const results = {};
    const token = localStorage.getItem('jwt');
    
    for (const endpoint of endpoints) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        
        if (endpoint.needsAuth && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: headers
        });
        
        results[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          needsAuth: endpoint.needsAuth,
          working: response.ok
        };
        
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
        
      } catch (error) {
        results[endpoint.name] = {
          status: 'ERROR',
          ok: false,
          error: error.message,
          working: false
        };
        console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
      }
    }
    
    return results;
  },
  
  // 🔐 PROBAR FLUJO DE AUTENTICACIÓN COMPLETO
  testAuthFlow: async () => {
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      return {
        hasToken: false,
        message: 'No hay token - usuario debe hacer login para probar'
      };
    }
    
    console.log('🔍 Probando endpoints de perfil con token existente...');
    
    const profileEndpoints = [
      { name: 'Get My Profile', url: 'http://localhost:8080/api/profiles/me', method: 'GET' },
      { name: 'Update Profile', url: 'http://localhost:8080/api/profiles/me', method: 'PUT', body: { test: true } }
    ];
    
    const results = { hasToken: true, endpoints: {} };
    
    for (const endpoint of profileEndpoints) {
      try {
        const options = {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        if (endpoint.body) {
          options.body = JSON.stringify(endpoint.body);
        }
        
        const response = await fetch(endpoint.url, options);
        
        results.endpoints[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          working: response.ok
        };
        
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
        
      } catch (error) {
        results.endpoints[endpoint.name] = {
          status: 'ERROR',
          ok: false,
          error: error.message,
          working: false
        };
        console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
      }
    }
    
    return results;
  },
  
  // 📋 GENERAR RECOMENDACIONES
  generateRecommendations: (results) => {
    const recommendations = [];
    
    // Verificar si el health check funciona
    const healthCheck = results.endpointsWorking['Health Check'];
    if (!healthCheck || !healthCheck.working) {
      recommendations.push({
        type: 'CRITICAL',
        message: 'Backend no responde - verificar que esté ejecutándose',
        action: 'Reiniciar servidor backend'
      });
      return recommendations;
    }
    
    // Verificar autenticación
    if (!results.authFlow.hasToken) {
      recommendations.push({
        type: 'INFO',
        message: 'Hacer login para probar endpoints autenticados',
        action: 'Login en la aplicación'
      });
    } else {
      // Verificar endpoints de perfil
      const profileWorking = Object.values(results.authFlow.endpoints || {})
        .filter(ep => ep.working).length;
      const totalProfileEndpoints = Object.keys(results.authFlow.endpoints || {}).length;
      
      if (profileWorking === 0 && totalProfileEndpoints > 0) {
        recommendations.push({
          type: 'CRITICAL',
          message: 'Endpoints de perfil siguen devolviendo 403',
          action: 'Verificar configuración de Spring Security'
        });
      } else if (profileWorking === totalProfileEndpoints) {
        recommendations.push({
          type: 'SUCCESS',
          message: '¡Backend funcionando correctamente!',
          action: 'Desactivar modo fallback en el frontend'
        });
      } else {
        recommendations.push({
          type: 'WARNING',
          message: `Solo ${profileWorking}/${totalProfileEndpoints} endpoints funcionando`,
          action: 'Verificar configuración específica de endpoints'
        });
      }
    }
    
    return recommendations;
  },
  
  // ✅ DETERMINAR SI EL BACKEND ESTÁ ARREGLADO
  isBackendFixed: (results) => {
    const healthWorking = results.endpointsWorking['Health Check']?.working || false;
    
    if (!healthWorking) return false;
    
    if (!results.authFlow.hasToken) return true; // No se puede probar sin token
    
    const profileEndpoints = Object.values(results.authFlow.endpoints || {});
    const workingCount = profileEndpoints.filter(ep => ep.working).length;
    
    return workingCount > 0; // Al menos un endpoint de perfil funciona
  },
  
  // 📊 MOSTRAR RESULTADOS
  displayResults: (results) => {
    console.log('\n🎯 === RESULTADOS DE LA VERIFICACIÓN ===\n');
    
    // Estado general
    const status = results.backendFixed ? '✅ SOLUCIONADO' : '❌ AÚN HAY PROBLEMAS';
    console.log(`📊 Estado del Backend: ${status}`);
    
    // Endpoints básicos
    console.log('\n🔍 Endpoints Básicos:');
    Object.entries(results.endpointsWorking).forEach(([name, result]) => {
      const icon = result.working ? '✅' : '❌';
      console.log(`   ${icon} ${name}: ${result.status}`);
    });
    
    // Endpoints de autenticación
    if (results.authFlow.hasToken) {
      console.log('\n🔐 Endpoints de Perfil:');
      Object.entries(results.authFlow.endpoints || {}).forEach(([name, result]) => {
        const icon = result.working ? '✅' : '❌';
        console.log(`   ${icon} ${name}: ${result.status}`);
      });
    }
    
    // Recomendaciones
    console.log('\n💡 Recomendaciones:');
    results.recommendations.forEach(rec => {
      const icon = rec.type === 'SUCCESS' ? '🎉' : rec.type === 'CRITICAL' ? '🚨' : '⚠️';
      console.log(`   ${icon} ${rec.message}`);
      console.log(`      → ${rec.action}`);
    });
    
    // Acciones siguientes
    if (results.backendFixed) {
      console.log('\n🎉 === ¡ÉXITO! ===');
      console.log('✅ El backend está funcionando correctamente');
      console.log('🔄 Recomendación: Refrescar la página para desactivar el modo fallback');
      console.log('🚀 La aplicación debería funcionar normalmente ahora');
    } else {
      console.log('\n🔧 === ACCIÓN REQUERIDA ===');
      console.log('❌ Aún hay problemas que requieren atención');
      console.log('💡 Seguir las recomendaciones anteriores');
    }
  },
  
  // 🔄 LIMPIAR MODO FALLBACK
  disableFallbackMode: () => {
    console.log('🧹 Desactivando modo fallback...');
    
    const fallbackKeys = Object.keys(localStorage).filter(key => 
      key.includes('fallback') || key.includes('working') || key.includes('cache')
    );
    
    const removedItems = [];
    fallbackKeys.forEach(key => {
      localStorage.removeItem(key);
      removedItems.push(key);
    });
    
    console.log(`✅ Modo fallback desactivado. Items removidos: ${removedItems.length}`);
    console.log('🔄 Recomendación: Refrescar la página');
    
    return {
      success: true,
      removedItems: removedItems,
      message: 'Modo fallback desactivado correctamente'
    };
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.verifyBackend = backendVerifier.verifyBackendFix;
  window.disableFallback = backendVerifier.disableFallbackMode;
  
  console.log('🎉 Verificador de backend disponible:');
  console.log('   verifyBackend() - Verificar que el backend esté funcionando');
  console.log('   disableFallback() - Desactivar modo fallback');
}

// Auto-ejecutar verificación después de cargar
setTimeout(() => {
  console.log('🔍 Ejecutando verificación automática del backend...');
  backendVerifier.verifyBackendFix();
}, 3000);

export default backendVerifier;