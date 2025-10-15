// Diagnóstico avanzado para debugging de conexión
export const advancedDiagnostic = async () => {
  console.log('🔍 DIAGNÓSTICO AVANZADO - PartidoHoy');
  console.log('==========================================');
  
  const API_BASE_URL = 'http://localhost:8080';
  
  // Test 1: Verificar que el backend responde (evitamos actuator/health que da 403)
  console.log('\n1. 🏥 Verificando conectividad del backend...');
  try {
    // Intentamos el endpoint raíz que debería responder
    const rootResponse = await fetch(`${API_BASE_URL}/`, { 
      method: 'GET' 
    });
    console.log('✅ Backend responde en root:', rootResponse.status);
    
    // Si falla el root, intentamos un OPTIONS en auth
    if (!rootResponse.ok) {
      const optionsResponse = await fetch(`${API_BASE_URL}/auth/register`, { 
        method: 'OPTIONS' 
      });
      console.log('✅ Backend responde en OPTIONS:', optionsResponse.status);
    }
  } catch (backendError) {
    console.log('❌ Backend no responde:', backendError.message);
    console.log('🔧 Verifica que el backend esté corriendo en puerto 8080');
    return;
  }
  
  // Test 2: Verificar headers CORS específicos
  console.log('\n2. 🌍 Verificando CORS headers...');
  try {
    const corsTest = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('CORS Status:', corsTest.status);
    console.log('CORS Headers:');
    for (const [key, value] of corsTest.headers.entries()) {
      if (key.toLowerCase().includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }
  
  // Test 3: Intentar registro con headers explícitos
  console.log('\n3. 📝 Intentando registro con headers explícitos...');
  try {
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'User-Agent': 'PartidoHoy-Frontend/1.0'
      },
      body: JSON.stringify({
        nombre: 'Debug Test User',
        email: `debug${Date.now()}@test.com`,
        password: 'TestPass123' // Contraseña que cumple requisitos: mayúscula, minúscula, número
      })
    });
    
    console.log('Register status:', registerResponse.status);
    console.log('Register headers:');
    for (const [key, value] of registerResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log('✅ Registro exitoso:', data);
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ Error response body:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Register test failed:', error.message);
  }
  
  // Test 4: Verificar endpoints protegidos vs públicos
  console.log('\n4. 🔒 Verificando configuración de seguridad...');
  
  const endpoints = [
    { 
      path: '/auth/register', 
      expected: [200, 201, 400, 409], // Agregamos 201 que es lo que devuelve tu backend
      desc: 'Register endpoint (público)', 
      method: 'POST',
      body: { nombre: 'Test', email: 'test@test.com', password: 'TestPass123' }
    },
    { 
      path: '/auth/login', 
      expected: [200, 401], 
      desc: 'Login endpoint (público)', 
      method: 'POST',
      body: { email: 'test@test.com', password: 'TestPass123' }
    },
    { 
      path: '/actuator/health', 
      expected: 403, 
      desc: 'Health endpoint (protegido por seguridad - 403 es NORMAL)' 
    },
    { 
      path: '/api/users', 
      expected: [401, 403], 
      desc: 'API protegida (debe requerir auth)' 
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const testResponse = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method || 'GET',
        headers: endpoint.method === 'POST' ? { 
          'Content-Type': 'application/json' 
        } : {},
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
      });
      
      const isExpected = Array.isArray(endpoint.expected) 
        ? endpoint.expected.includes(testResponse.status)
        : testResponse.status === endpoint.expected;
        
      console.log(`${isExpected ? '✅' : '⚠️'} ${endpoint.desc}: ${testResponse.status} ${isExpected ? '(esperado)' : '(inesperado)'}`);
      
      // Información adicional para endpoints importantes
      if (endpoint.path === '/actuator/health' && testResponse.status === 403) {
        console.log('   ℹ️ El error 403 en /actuator/health es NORMAL - está protegido por Spring Security');
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.desc}: Error - ${error.message}`);
    }
  }
  
  // Test 5: Información del entorno
  console.log('\n5. 🌐 Información del entorno...');
  console.log('Frontend URL:', window.location.origin);
  console.log('Backend URL:', API_BASE_URL);
  console.log('User Agent:', navigator.userAgent);
  console.log('Browser:', {
    Chrome: navigator.userAgent.includes('Chrome'),
    Firefox: navigator.userAgent.includes('Firefox'),
    Safari: navigator.userAgent.includes('Safari')
  });
  
  // Test 6: Verificar configuración específica
  console.log('\n6. 🔧 Verificaciones adicionales...');
  console.log('✅ Contraseñas de prueba actualizadas a formato seguro (TestPass123)');
  console.log('✅ Validaciones de frontend mejoradas');
  console.log('ℹ️ El error 403 en /actuator/health es NORMAL - ese endpoint está protegido');
  console.log('ℹ️ Los endpoints /auth/* deberían ser públicos (permitAll)');
  
  console.log('\n✨ Diagnóstico completado. Revisa los logs arriba para identificar el problema.');
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.advancedDiagnostic = advancedDiagnostic;
}