// Diagnóstico avanzado para debugging de conexión
export const advancedDiagnostic = async () => {
  console.log('🔍 DIAGNÓSTICO AVANZADO - PartidoHoy');
  console.log('==========================================');
  
  const API_BASE_URL = 'http://localhost:8080';
  
  // Test 1: Verificar que el backend responde
  console.log('\n1. 🏥 Verificando salud del backend...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/actuator/health`, { 
      method: 'GET' 
    });
    console.log('✅ Health check:', healthResponse.status);
  } catch {
    console.log('⚠️ No health endpoint, intentando root...');
    
    try {
      const rootResponse = await fetch(`${API_BASE_URL}/`, { 
        method: 'GET' 
      });
      console.log('✅ Root responde:', rootResponse.status);
    } catch (rootError) {
      console.log('❌ Backend no responde:', rootError.message);
      return;
    }
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
        password: '12345678'
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
  
  // Test 4: Información del navegador
  console.log('\n4. 🌐 Información del entorno...');
  console.log('Frontend URL:', window.location.origin);
  console.log('Backend URL:', API_BASE_URL);
  console.log('User Agent:', navigator.userAgent);
  console.log('Browser:', {
    Chrome: navigator.userAgent.includes('Chrome'),
    Firefox: navigator.userAgent.includes('Firefox'),
    Safari: navigator.userAgent.includes('Safari')
  });
  
  console.log('\n✨ Diagnóstico completado. Revisa los logs arriba para identificar el problema.');
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.advancedDiagnostic = advancedDiagnostic;
}