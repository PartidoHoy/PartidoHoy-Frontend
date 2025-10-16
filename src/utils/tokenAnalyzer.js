/**
 * 🔍 ANALIZADOR DE TOKENS JWT
 * Para diagnosticar problemas de autorización
 */

export const tokenAnalyzer = {
  
  // 📝 DECODIFICAR TOKEN JWT (sin verificar signature)
  decodeJWT: (token) => {
    try {
      if (!token) {
        console.error('❌ No token provided');
        return null;
      }
      
      // Remover "Bearer " si existe
      const cleanToken = token.replace('Bearer ', '');
      
      // JWT tiene 3 partes separadas por puntos
      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token malformado - debe tener 3 partes');
        return null;
      }
      
      // Decodificar header
      const header = JSON.parse(atob(parts[0]));
      
      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('🔍 === ANÁLISIS DEL TOKEN JWT ===');
      console.log('📋 Header:', header);
      console.log('📄 Payload:', payload);
      
      // Analizar roles específicamente
      const roles = payload.roles || payload.authorities || payload.auth || [];
      console.log('👤 Roles detectados:', roles);
      
      // Verificar expiración
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      
      if (isExpired) {
        console.warn('⏰ TOKEN EXPIRADO');
        console.log(`Expiraba: ${new Date(payload.exp * 1000)}`);
        console.log(`Ahora: ${new Date()}`);
      } else {
        console.log('✅ Token válido (no expirado)');
        if (payload.exp) {
          console.log(`⏰ Expira: ${new Date(payload.exp * 1000)}`);
        }
      }
      
      return {
        header,
        payload,
        roles,
        isExpired,
        username: payload.sub || payload.username,
        issued: payload.iat ? new Date(payload.iat * 1000) : null,
        expires: payload.exp ? new Date(payload.exp * 1000) : null
      };
      
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return null;
    }
  },
  
  // 🔍 ANALIZAR TOKEN ACTUAL
  analyzeCurrentToken: () => {
    console.log('🔍 === ANALIZANDO TOKEN ACTUAL ===');
    
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('❌ No hay token en localStorage');
      return null;
    }
    
    console.log('📏 Longitud del token:', token.length);
    console.log('🔤 Primeros 50 caracteres:', token.substring(0, 50) + '...');
    
    return tokenAnalyzer.decodeJWT(token);
  },
  
  // 🎯 VERIFICAR ROLES ESPECÍFICOS
  checkRoles: (requiredRoles = ['USER', 'ROLE_USER']) => {
    const analysis = tokenAnalyzer.analyzeCurrentToken();
    
    if (!analysis) {
      return {
        hasRequiredRoles: false,
        error: 'No se pudo analizar el token'
      };
    }
    
    const userRoles = analysis.roles || [];
    console.log('🎯 === VERIFICACIÓN DE ROLES ===');
    console.log('👤 Roles del usuario:', userRoles);
    console.log('🎫 Roles requeridos:', requiredRoles);
    
    const hasAnyRole = requiredRoles.some(role => 
      userRoles.includes(role) || 
      userRoles.includes(`ROLE_${role}`) ||
      userRoles.some(userRole => userRole.authority === role)
    );
    
    console.log(hasAnyRole ? '✅ Usuario tiene roles necesarios' : '❌ Usuario NO tiene roles necesarios');
    
    return {
      hasRequiredRoles: hasAnyRole,
      userRoles,
      requiredRoles,
      analysis
    };
  },
  
  // 🔄 CREAR HEADERS CON DIAGNÓSTICO
  createDiagnosticHeaders: (token) => {
    const analysis = tokenAnalyzer.decodeJWT(token);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    if (analysis) {
      console.log('📊 === HEADERS DE DIAGNÓSTICO ===');
      console.log('👤 Usuario:', analysis.username);
      console.log('🎫 Roles:', analysis.roles);
      console.log('📋 Headers enviados:', headers);
    }
    
    return headers;
  },
  
  // 🧪 PROBAR DIFERENTES FORMATOS DE TOKEN
  testTokenFormats: async (baseUrl = 'http://localhost:8080') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('❌ No hay token para probar');
      return;
    }
    
    console.log('🧪 === PROBANDO DIFERENTES FORMATOS DE TOKEN ===');
    
    const testEndpoint = `${baseUrl}/api/profiles/me`;
    const formats = [
      { name: 'Bearer token', header: `Bearer ${token}` },
      { name: 'Token directo', header: token },
      { name: 'Authorization Bearer', header: `Authorization Bearer ${token}` }
    ];
    
    const results = [];
    
    for (const format of formats) {
      try {
        console.log(`🔍 Probando: ${format.name}`);
        
        const response = await fetch(testEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': format.header
          }
        });
        
        results.push({
          format: format.name,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
        
        console.log(`📊 ${format.name}: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        results.push({
          format: format.name,
          status: 'ERROR',
          ok: false,
          error: error.message
        });
        
        console.error(`❌ ${format.name}: ${error.message}`);
      }
    }
    
    console.table(results);
    return results;
  }
};

// 🌍 EXPONER GLOBALMENTE
if (typeof window !== 'undefined') {
  window.analyzeToken = tokenAnalyzer.analyzeCurrentToken;
  window.checkRoles = tokenAnalyzer.checkRoles;
  window.testTokenFormats = tokenAnalyzer.testTokenFormats;
  
  console.log('🔍 Funciones de análisis de tokens disponibles:');
  console.log('   analyzeToken() - Analizar token actual');
  console.log('   checkRoles() - Verificar roles');
  console.log('   testTokenFormats() - Probar diferentes formatos');
}

export default tokenAnalyzer;