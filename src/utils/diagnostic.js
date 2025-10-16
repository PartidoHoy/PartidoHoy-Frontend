// Función de diagnóstico para entender problemas de autenticación y backend
const runDiagnostic = async () => {
  console.log('🔍 === DIAGNÓSTICO DEL SISTEMA ===');
  
  // 1. Verificar localStorage
  console.log('📦 LocalStorage:');
  console.log('  - JWT:', localStorage.getItem('jwt') ? 'Presente' : 'Ausente');
  console.log('  - tempProfile:', localStorage.getItem('tempProfile') ? 'Presente' : 'Ausente');
  
  // 2. Verificar conectividad al backend
  console.log('🌐 Conectividad Backend:');
  try {
    const response = await fetch('http://localhost:8080/health', { 
      method: 'GET',
      timeout: 5000 
    });
    console.log('  - Servidor:', response.ok ? 'Disponible' : 'Error');
  } catch (error) {
    console.log('  - Servidor: No disponible -', error.message);
  }
  
  // 3. Verificar endpoints de autenticación
  console.log('🔐 Endpoints Auth:');
  const authEndpoints = [
    '/auth/status',
    '/auth/login',
    '/auth/register'
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log(`  - ${endpoint}:`, response.status);
    } catch (error) {
      console.log(`  - ${endpoint}: Error -`, error.message);
    }
  }
  
  // 4. Verificar endpoints de perfil
  console.log('👤 Endpoints Perfil:');
  const profileEndpoints = [
    '/api/users/me',
    '/api/profiles/me',
    '/api/users/profile'
  ];
  
  for (const endpoint of profileEndpoints) {
    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log(`  - ${endpoint}:`, response.status);
    } catch (error) {
      console.log(`  - ${endpoint}: Error -`, error.message);
    }
  }
  
  console.log('🔍 === FIN DIAGNÓSTICO ===');
};

// Ejecutar diagnóstico al cargar la página
if (typeof window !== 'undefined') {
  window.runDiagnostic = runDiagnostic;
  console.log('💡 Ejecuta runDiagnostic() en la consola para diagnosticar problemas');
}

export { runDiagnostic };