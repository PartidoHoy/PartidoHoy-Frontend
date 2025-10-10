// Script para probar la conexión con el backend
// Ejecuta esto en la consola del navegador para diagnosticar problemas

const testBackendConnection = async () => {
  console.log('🔧 Diagnóstico de Conexión PartidoHoy');
  console.log('==================================');
  
  const API_BASE_URL = 'http://localhost:8080';
  
  // Test 1: Verificar si el backend está corriendo
  console.log('\n1. 🔍 Verificando si el backend está corriendo...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    console.log('✅ Backend responde:', response.status);
  } catch (error) {
    console.log('❌ Backend no responde:', error.message);
    console.log('💡 Asegúrate de que tu backend esté corriendo en puerto 8080');
    return;
  }
  
  // Test 2: Probar endpoint de registro
  console.log('\n2. 📝 Probando endpoint de registro...');
  const testUser = {
    nombre: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: '12345678'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      console.log('✅ Registro exitoso:', response.status);
      const data = await response.json();
      console.log('📄 Respuesta:', data);
    } else {
      console.log('⚠️ Error en registro:', response.status);
      const errorData = await response.json();
      console.log('📄 Error:', errorData);
    }
  } catch (error) {
    console.log('❌ Error de conexión en registro:', error.message);
  }
  
  // Test 3: Probar endpoint de login
  console.log('\n3. 🔐 Probando endpoint de login...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    if (response.ok) {
      console.log('✅ Login exitoso:', response.status);
      const data = await response.json();
      console.log('📄 Respuesta:', data);
      if (data.token) {
        console.log('🎟️ Token recibido correctamente');
      }
    } else {
      console.log('⚠️ Error en login:', response.status);
      const errorData = await response.json();
      console.log('📄 Error:', errorData);
    }
  } catch (error) {
    console.log('❌ Error de conexión en login:', error.message);
  }
  
  console.log('\n✨ Diagnóstico completado');
};

// Ejecutar automáticamente si se carga este script
if (typeof window !== 'undefined') {
  window.testBackendConnection = testBackendConnection;
  console.log('🚀 Script cargado. Ejecuta testBackendConnection() para probar la conexión');
}

export { testBackendConnection };