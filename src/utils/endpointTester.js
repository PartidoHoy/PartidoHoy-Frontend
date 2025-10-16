/**
 * 🧪 TESTER DE ENDPOINTS ACTUALIZADOS
 * Prueba todos los endpoints confirmados del backend
 */

import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS, HEALTH_ENDPOINTS } from './apiConfig';

export const endpointTester = {
  
  // ✅ PROBAR TODOS LOS ENDPOINTS CONFIRMADOS
  testUpdatedEndpoints: async () => {
    console.log('🧪 === PROBANDO ENDPOINTS ACTUALIZADOS ===');
    
    const results = {
      timestamp: new Date().toISOString(),
      backend: 'localhost:8080',
      tests: {}
    };
    
    // 1. Probar endpoints públicos
    console.log('🔓 Probando endpoints públicos...');
    results.tests.public = await endpointTester.testPublicEndpoints();
    
    // 2. Probar endpoints autenticados (si hay token)
    const token = localStorage.getItem('jwt');
    if (token) {
      console.log('🔐 Probando endpoints autenticados...');
      results.tests.authenticated = await endpointTester.testAuthenticatedEndpoints(token);
    } else {
      console.log('ℹ️ No hay token - omitiendo endpoints autenticados');
      results.tests.authenticated = { message: 'No token available' };
    }
    
    // 3. Generar resumen
    const summary = endpointTester.generateSummary(results);
    
    console.log('📊 === RESUMEN DE PRUEBAS ===');
    console.table(summary);
    
    return results;
  },
  
  // 🔓 PROBAR ENDPOINTS PÚBLICOS
  testPublicEndpoints: async () => {
    const publicTests = [
      { name: 'Health Check', url: HEALTH_ENDPOINTS.CHECK, method: 'GET' },
      { name: 'Auth Status', url: AUTH_ENDPOINTS.STATUS, method: 'GET' }
    ];
    
    const results = {};
    
    for (const test of publicTests) {
      try {
        console.log(`🔍 Probando: ${test.name} - ${test.url}`);
        
        const response = await fetch(test.url, {
          method: test.method,
          headers: { 'Content-Type': 'application/json' }
        });
        
        results[test.name] = {
          url: test.url,
          status: response.status,
          ok: response.ok,
          working: response.ok,
          details: response.ok ? 'Funcionando correctamente' : `Error ${response.status}`
        };
        
        console.log(`${response.ok ? '✅' : '❌'} ${test.name}: ${response.status}`);
        
      } catch (error) {
        results[test.name] = {
          url: test.url,
          status: 'ERROR',
          ok: false,
          working: false,
          error: error.message,
          details: `Error de conexión: ${error.message}`
        };
        
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      }
    }
    
    return results;
  },
  
  // 🔐 PROBAR ENDPOINTS AUTENTICADOS
  testAuthenticatedEndpoints: async (token) => {
    const authTests = [
      { name: 'Get User Info', url: PROFILE_ENDPOINTS.GET_USER_INFO, method: 'GET' },
      { name: 'Get My Profile', url: PROFILE_ENDPOINTS.GET_MY_PROFILE, method: 'GET' },
      { name: 'Search Profiles', url: PROFILE_ENDPOINTS.SEARCH_CARDS, method: 'GET' },
      { name: 'Top Players', url: PROFILE_ENDPOINTS.TOP_GOALS, method: 'GET' }
    ];
    
    const results = {};
    
    for (const test of authTests) {
      try {
        console.log(`🔍 Probando: ${test.name} - ${test.url}`);
        
        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        results[test.name] = {
          url: test.url,
          status: response.status,
          ok: response.ok,
          working: response.ok,
          details: response.ok ? 'Funcionando correctamente' : `Error ${response.status}`
        };
        
        console.log(`${response.ok ? '✅' : '❌'} ${test.name}: ${response.status}`);
        
        // Si funciona, intentar leer respuesta
        if (response.ok) {
          try {
            const data = await response.json();
            results[test.name].sampleData = typeof data === 'object' ? Object.keys(data) : 'Data received';
          } catch {
            results[test.name].sampleData = 'Response received but not JSON';
          }
        }
        
      } catch (error) {
        results[test.name] = {
          url: test.url,
          status: 'ERROR',
          ok: false,
          working: false,
          error: error.message,
          details: `Error de conexión: ${error.message}`
        };
        
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      }
    }
    
    return results;
  },
  
  // 📊 GENERAR RESUMEN
  generateSummary: (results) => {
    const summary = [];
    
    // Endpoints públicos
    Object.entries(results.tests.public || {}).forEach(([name, result]) => {
      summary.push({
        '🔍 Endpoint': name,
        '🌐 Tipo': 'Público',
        '📊 Estado': result.working ? '✅ Funcionando' : '❌ Error',
        '📝 Detalles': result.details,
        '🔗 URL': result.url
      });
    });
    
    // Endpoints autenticados
    if (results.tests.authenticated && results.tests.authenticated.message !== 'No token available') {
      Object.entries(results.tests.authenticated).forEach(([name, result]) => {
        summary.push({
          '🔍 Endpoint': name,
          '🌐 Tipo': 'Autenticado',
          '📊 Estado': result.working ? '✅ Funcionando' : '❌ Error',
          '📝 Detalles': result.details,
          '🔗 URL': result.url
        });
      });
    }
    
    return summary;
  },
  
  // 🎯 PROBAR ENDPOINT ESPECÍFICO
  testSpecificEndpoint: async (url, method = 'GET', needsAuth = true) => {
    console.log(`🎯 Probando endpoint específico: ${method} ${url}`);
    
    const headers = { 'Content-Type': 'application/json' };
    
    if (needsAuth) {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { error: 'No token available for authenticated endpoint' };
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, { method, headers });
      
      const result = {
        url: url,
        method: method,
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString()
      };
      
      if (response.ok) {
        try {
          const data = await response.json();
          result.data = data;
        } catch {
          result.data = 'Not JSON response';
        }
      }
      
      console.log(`${response.ok ? '✅' : '❌'} Resultado:`, result);
      return result;
      
    } catch (error) {
      const result = {
        url: url,
        method: method,
        status: 'ERROR',
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.log('❌ Error:', result);
      return result;
    }
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.testEndpoints = endpointTester.testUpdatedEndpoints;
  window.testEndpoint = endpointTester.testSpecificEndpoint;
  
  console.log('🧪 Tester de endpoints disponible:');
  console.log('   testEndpoints() - Probar todos los endpoints');
  console.log('   testEndpoint(url, method, needsAuth) - Probar endpoint específico');
}

export default endpointTester;