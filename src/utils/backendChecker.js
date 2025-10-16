// Herramienta para verificar qué endpoints están disponibles en el backend
const API_BASE_URL = 'http://localhost:8080';

const checkBackendEndpoints = async () => {
  console.log('🔍 === VERIFICACIÓN COMPLETA DEL BACKEND ===');
  
  const token = localStorage.getItem('jwt');
  console.log('🔑 Token disponible:', !!token);
  
  // Lista exhaustiva de posibles endpoints
  const endpointsToCheck = [
    // Autenticación
    { path: '/auth/status', method: 'GET', description: 'Estado de auth' },
    { path: '/auth/login', method: 'POST', description: 'Login' },
    { path: '/auth/register', method: 'POST', description: 'Registro' },
    
    // Usuarios - variaciones comunes
    { path: '/api/users', method: 'GET', description: 'Lista usuarios' },
    { path: '/api/users/me', method: 'GET', description: 'Usuario actual (GET)' },
    { path: '/api/users/me', method: 'PUT', description: 'Actualizar usuario (PUT)' },
    { path: '/api/users/me', method: 'PATCH', description: 'Actualizar usuario (PATCH)' },
    { path: '/api/users/profile', method: 'GET', description: 'Perfil usuario (GET)' },
    { path: '/api/users/profile', method: 'PUT', description: 'Perfil usuario (PUT)' },
    { path: '/api/users/profile', method: 'POST', description: 'Perfil usuario (POST)' },
    
    // Perfiles
    { path: '/api/profiles', method: 'GET', description: 'Lista perfiles' },
    { path: '/api/profiles/me', method: 'GET', description: 'Mi perfil (GET)' },
    { path: '/api/profiles/me', method: 'PUT', description: 'Mi perfil (PUT)' },
    { path: '/api/profiles/me', method: 'PATCH', description: 'Mi perfil (PATCH)' },
    
    // Endpoints alternativos comunes en Spring Boot
    { path: '/users/me', method: 'GET', description: 'Usuario (sin /api)' },
    { path: '/users/profile', method: 'PUT', description: 'Perfil (sin /api)' },
    { path: '/profile', method: 'GET', description: 'Perfil simple' },
    { path: '/profile', method: 'PUT', description: 'Perfil simple (PUT)' },
    
    // Endpoints específicos de actualización
    { path: '/api/users/update-profile', method: 'POST', description: 'Actualizar perfil específico' },
    { path: '/api/profile/update', method: 'POST', description: 'Actualización de perfil' },
    
    // Health check y info
    { path: '/health', method: 'GET', description: 'Health check' },
    { path: '/actuator/health', method: 'GET', description: 'Actuator health' },
    { path: '/info', method: 'GET', description: 'Info del servidor' }
  ];
  
  const workingEndpoints = [];
  const blockedEndpoints = [];
  
  for (const endpoint of endpointsToCheck) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token && !endpoint.path.includes('login') && !endpoint.path.includes('register')) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers,
        body: endpoint.method !== 'GET' ? JSON.stringify({}) : undefined
      });
      
      const status = response.status;
      console.log(`${status === 200 ? '✅' : status === 403 ? '🚫' : '⚠️'} ${endpoint.method} ${endpoint.path} - ${status} (${endpoint.description})`);
      
      if (status === 200 || status === 201) {
        workingEndpoints.push({...endpoint, status});
      } else if (status === 403) {
        blockedEndpoints.push({...endpoint, status});
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
    }
    
    // Pequeña pausa para no saturar el servidor
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 === RESUMEN ===');
  console.log(`✅ Endpoints funcionando: ${workingEndpoints.length}`);
  console.log(`🚫 Endpoints bloqueados (403): ${blockedEndpoints.length}`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n🎯 Endpoints que SÍ funcionan:');
    workingEndpoints.forEach(ep => {
      console.log(`  • ${ep.method} ${ep.path} - ${ep.description}`);
    });
  }
  
  console.log('\n💡 Recomendaciones:');
  if (workingEndpoints.some(ep => ep.path.includes('/users') || ep.path.includes('/profile'))) {
    console.log('• Hay endpoints de usuario/perfil funcionando - revisar cuáles usar');
  } else {
    console.log('• No hay endpoints de perfil funcionando - problema de configuración del backend');
    console.log('• El backend necesita configurar Spring Security para permitir acceso a endpoints de perfil');
  }
  
  return { workingEndpoints, blockedEndpoints };
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.checkBackendEndpoints = checkBackendEndpoints;
  console.log('💡 Ejecuta checkBackendEndpoints() para verificar todos los endpoints disponibles');
}

export { checkBackendEndpoints };