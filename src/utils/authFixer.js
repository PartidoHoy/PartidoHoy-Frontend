/**
 * 🆘 SOLUCIONADOR AUTOMÁTICO DE PROBLEMAS 403
 * Diagnostica y resuelve automáticamente problemas de autorización
 */

export const authFixer = {
  
  // 🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA 403
  diagnose403: async () => {
    console.log('🆘 === INICIANDO DIAGNÓSTICO 403 ===');
    
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      return {
        problem: 'NO_TOKEN',
        solution: 'Usuario debe hacer login',
        critical: true
      };
    }
    
    // Analizar el token JWT
    const tokenInfo = authFixer.analyzeJWT(token);
    console.log('🔍 Análisis del token:', tokenInfo);
    
    // Probar diferentes formatos de autorización
    const authFormats = await authFixer.testAuthFormats(token);
    console.log('🧪 Resultados de formatos de autorización:', authFormats);
    
    // Probar endpoint más básico
    const basicTest = await authFixer.testBasicEndpoint(token);
    console.log('🎯 Prueba de endpoint básico:', basicTest);
    
    // Generar diagnóstico
    const diagnosis = authFixer.generateDiagnosis(tokenInfo, authFormats, basicTest);
    
    console.log('📋 === DIAGNÓSTICO COMPLETO ===');
    console.table(diagnosis);
    
    return diagnosis;
  },
  
  // 🔬 ANALIZAR TOKEN JWT
  analyzeJWT: (token) => {
    try {
      // Decodificar sin verificar signature (solo para inspección)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Token no tiene 3 partes' };
      }
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      
      return {
        valid: true,
        header: header,
        payload: payload,
        subject: payload.sub,
        roles: payload.roles || payload.authorities || [],
        expired: isExpired,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
        issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Unknown'
      };
    } catch (error) {
      return { 
        valid: false, 
        error: `Error decodificando token: ${error.message}` 
      };
    }
  },
  
  // 🧪 PROBAR DIFERENTES FORMATOS DE AUTORIZACIÓN
  testAuthFormats: async (token) => {
    const formats = [
      { name: 'Bearer Standard', header: `Bearer ${token}` },
      { name: 'Bearer con espacio extra', header: `Bearer  ${token}` },
      { name: 'Token directo', header: token },
      { name: 'JWT prefix', header: `JWT ${token}` },
      { name: 'Authorization simple', header: `${token}` }
    ];
    
    const results = [];
    
    for (const format of formats) {
      try {
        console.log(`🧪 Probando formato: ${format.name}`);
        
        const response = await fetch('http://localhost:8080/auth/status', {
          method: 'GET',
          headers: {
            'Authorization': format.header,
            'Content-Type': 'application/json'
          }
        });
        
        results.push({
          name: format.name,
          status: response.status,
          ok: response.ok,
          working: response.ok
        });
        
        if (response.ok) {
          console.log(`✅ Formato funcionando: ${format.name}`);
          // Guardar formato que funciona
          localStorage.setItem('workingAuthFormat', JSON.stringify({
            name: format.name,
            header: format.header
          }));
          break;
        }
        
      } catch (error) {
        results.push({
          name: format.name,
          status: 'ERROR',
          ok: false,
          error: error.message,
          working: false
        });
      }
    }
    
    return results;
  },
  
  // 🎯 PROBAR ENDPOINT MÁS BÁSICO
  testBasicEndpoint: async (token) => {
    const endpoints = [
      'http://localhost:8080/auth/status',
      'http://localhost:8080/health',
      'http://localhost:8080/actuator/health',
      'http://localhost:8080/api/health'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🎯 Probando endpoint básico: ${endpoint}`);
        
        // Sin token
        const responseNoAuth = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Con token
        const responseWithAuth = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        results.push({
          endpoint: endpoint,
          withoutAuth: { status: responseNoAuth.status, ok: responseNoAuth.ok },
          withAuth: { status: responseWithAuth.status, ok: responseWithAuth.ok }
        });
        
      } catch (error) {
        results.push({
          endpoint: endpoint,
          error: error.message
        });
      }
    }
    
    return results;
  },
  
  // 📋 GENERAR DIAGNÓSTICO
  generateDiagnosis: (tokenInfo, authFormats, basicTest) => {
    const diagnosis = [];
    
    // Verificar token
    if (!tokenInfo.valid) {
      diagnosis.push({
        '🔍 Problema': 'Token inválido',
        '⚠️ Severidad': 'CRÍTICO',
        '💡 Solución': 'Hacer login nuevamente',
        '📝 Detalles': tokenInfo.error
      });
      return diagnosis;
    }
    
    if (tokenInfo.expired) {
      diagnosis.push({
        '🔍 Problema': 'Token expirado',
        '⚠️ Severidad': 'CRÍTICO',
        '💡 Solución': 'Hacer login nuevamente',
        '📝 Detalles': `Expiró: ${tokenInfo.expiresAt}`
      });
      return diagnosis;
    }
    
    // Verificar roles
    if (!tokenInfo.roles || tokenInfo.roles.length === 0) {
      diagnosis.push({
        '🔍 Problema': 'Sin roles/authorities',
        '⚠️ Severidad': 'CRÍTICO',
        '💡 Solución': 'Backend debe asignar ROLE_USER',
        '📝 Detalles': 'Token no contiene roles ni authorities'
      });
    } else {
      const hasUserRole = tokenInfo.roles.some(role => 
        role === 'ROLE_USER' || role === 'USER' || role.includes('USER')
      );
      
      if (!hasUserRole) {
        diagnosis.push({
          '🔍 Problema': 'Sin rol USER',
          '⚠️ Severidad': 'CRÍTICO',
          '💡 Solución': 'Backend debe asignar ROLE_USER',
          '📝 Detalles': `Roles actuales: ${tokenInfo.roles.join(', ')}`
        });
      }
    }
    
    // Verificar formatos de autorización
    const workingFormat = authFormats.find(f => f.working);
    if (!workingFormat) {
      diagnosis.push({
        '🔍 Problema': 'Ningún formato de auth funciona',
        '⚠️ Severidad': 'CRÍTICO',
        '💡 Solución': 'Revisar configuración de Spring Security',
        '📝 Detalles': 'Todos los formatos de Authorization fallan'
      });
    }
    
    // Verificar conectividad básica
    const healthEndpoint = basicTest.find(t => t.endpoint.includes('health'));
    if (healthEndpoint && (!healthEndpoint.withoutAuth?.ok && !healthEndpoint.withAuth?.ok)) {
      diagnosis.push({
        '🔍 Problema': 'Backend no responde',
        '⚠️ Severidad': 'CRÍTICO',
        '💡 Solución': 'Verificar que el backend esté ejecutándose',
        '📝 Detalles': 'Endpoints de salud no responden'
      });
    }
    
    // Si todo parece bien pero hay 403s
    if (diagnosis.length === 0) {
      diagnosis.push({
        '🔍 Problema': 'Configuración de Spring Security',
        '⚠️ Severidad': 'CRÍTICO',
        '💡 Solución': 'Agregar .requestMatchers("/api/**").hasRole("USER")',
        '📝 Detalles': 'Token válido pero endpoints devuelven 403'
      });
    }
    
    return diagnosis;
  },
  
  // 🛠️ APLICAR CORRECCIONES AUTOMÁTICAS
  autoFix: async () => {
    console.log('🛠️ Aplicando correcciones automáticas...');
    
    const diagnosis = await authFixer.diagnose403();
    const fixes = [];
    
    // Fix 1: Limpiar token corrupto
    const token = localStorage.getItem('jwt');
    if (token) {
      const tokenInfo = authFixer.analyzeJWT(token);
      if (!tokenInfo.valid || tokenInfo.expired) {
        localStorage.removeItem('jwt');
        fixes.push('✅ Token inválido/expirado eliminado');
      }
    }
    
    // Fix 2: Limpiar datos de fallback antiguos
    const fallbackKeys = Object.keys(localStorage).filter(key => 
      key.includes('fallback') || key.includes('cache')
    );
    
    fallbackKeys.forEach(key => {
      localStorage.removeItem(key);
      fixes.push(`✅ Datos antiguos eliminados: ${key}`);
    });
    
    // Fix 3: Resetear formato de autorización
    localStorage.removeItem('workingAuthFormat');
    fixes.push('✅ Formato de autorización reseteado');
    
    console.log('🔧 Correcciones aplicadas:', fixes);
    
    return {
      diagnosis: diagnosis,
      fixes: fixes,
      recommendation: '💡 Recomendación: Hacer login nuevamente y verificar configuración del backend'
    };
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.diagnose403 = authFixer.diagnose403;
  window.autoFixAuth = authFixer.autoFix;
  window.analyzeToken = () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('❌ No hay token para analizar');
      return null;
    }
    return authFixer.analyzeJWT(token);
  };
  
  console.log('🆘 Funciones de reparación 403 disponibles:');
  console.log('   diagnose403() - Diagnosticar problema 403');
  console.log('   autoFixAuth() - Aplicar correcciones automáticas');
  console.log('   analyzeToken() - Analizar token JWT actual');
}

export default authFixer;