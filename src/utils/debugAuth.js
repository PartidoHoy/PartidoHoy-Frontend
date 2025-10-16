/**
 * 🚨 DEPURACIÓN AUTOMÁTICA DE PROBLEMAS 403
 * Se ejecuta automáticamente cuando se detectan errores 403
 */

import tokenAnalyzer from './tokenAnalyzer';

export const debugAuth = {
  
  // 🔍 DEPURACIÓN AUTOMÁTICA CUANDO HAY 403
  debug403Error: async () => {
    console.log('🚨 === DEPURACIÓN AUTOMÁTICA DE ERROR 403 ===');
    
    // 1. Analizar el token actual
    console.log('📋 1. Analizando token JWT...');
    const tokenInfo = tokenAnalyzer.analyzeCurrentToken();
    
    if (!tokenInfo) {
      console.error('❌ No se puede analizar el token');
      return;
    }
    
    // 2. Verificar roles específicos
    console.log('📋 2. Verificando roles...');
    const roleCheck = tokenAnalyzer.checkRoles(['USER', 'ROLE_USER']);
    
    // 3. Identificar el problema
    console.log('📋 3. Identificando problemas...');
    const problems = [];
    
    if (tokenInfo.isExpired) {
      problems.push('🔴 Token expirado');
    }
    
    if (!roleCheck.hasRequiredRoles) {
      problems.push('🔴 Usuario no tiene roles necesarios');
      console.log('👤 Roles del usuario:', roleCheck.userRoles);
      console.log('🎫 Roles esperados:', roleCheck.requiredRoles);
    }
    
    if (problems.length === 0) {
      problems.push('🔍 Token parece válido - problema en Spring Security backend');
    }
    
    // 4. Mostrar diagnóstico
    console.log('📊 === DIAGNÓSTICO COMPLETO ===');
    console.log('🔍 Problemas detectados:', problems);
    
    // 5. Recomendaciones
    console.log('💡 === RECOMENDACIONES ===');
    
    if (tokenInfo.isExpired) {
      console.log('🔄 Eliminar token y relogar');
      localStorage.removeItem('jwt');
      return 'token_expired';
    }
    
    if (!roleCheck.hasRequiredRoles) {
      console.log('🎫 El usuario necesita rol USER o ROLE_USER');
      console.log('⚙️ Verificar configuración del backend en el registro/login');
      return 'missing_roles';
    }
    
    console.log('🔧 Problemas detectados en Spring Security:');
    console.log('   1. Verificar que el endpoint esté configurado como .hasRole("USER")');
    console.log('   2. Verificar que el JWT filter esté funcionando');
    console.log('   3. Verificar que el usuario se registre con ROLE_USER');
    
    return 'backend_config_issue';
  },
  
  // 🧪 PROBAR DIFERENTES CONFIGURACIONES
  testDifferentConfigs: async () => {
    console.log('🧪 === PROBANDO DIFERENTES CONFIGURACIONES ===');
    
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('❌ No hay token para probar');
      return;
    }
    
    const testEndpoint = 'http://localhost:8080/api/profiles/me';
    
    // Configuraciones a probar
    const configs = [
      {
        name: 'Configuración actual',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      },
      {
        name: 'Sin Content-Type',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      },
      {
        name: 'Token directo',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      },
      {
        name: 'Header X-Auth-Token',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      },
      {
        name: 'Múltiples headers',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      }
    ];
    
    const results = [];
    
    for (const config of configs) {
      try {
        console.log(`🔍 Probando: ${config.name}`);
        
        const response = await fetch(testEndpoint, {
          method: 'GET',
          headers: config.headers
        });
        
        const result = {
          config: config.name,
          status: response.status,
          ok: response.ok,
          headers: config.headers
        };
        
        results.push(result);
        
        if (response.ok) {
          console.log(`✅ ${config.name}: ÉXITO (${response.status})`);
        } else {
          console.log(`❌ ${config.name}: FALLO (${response.status})`);
        }
        
      } catch (error) {
        results.push({
          config: config.name,
          status: 'ERROR',
          ok: false,
          error: error.message,
          headers: config.headers
        });
        
        console.error(`💥 ${config.name}: ERROR - ${error.message}`);
      }
    }
    
    console.log('📊 === RESUMEN DE PRUEBAS ===');
    console.table(results);
    
    return results;
  },
  
  // 🔧 APLICAR SOLUCIONES AUTOMÁTICAS
  autoFix: async () => {
    console.log('🔧 === APLICANDO SOLUCIONES AUTOMÁTICAS ===');
    
    const diagnosis = await debugAuth.debug403Error();
    
    switch (diagnosis) {
      case 'token_expired':
        console.log('🔄 Token expirado - redirigiendo a login');
        // El token ya fue eliminado en debug403Error
        window.location.href = '/login';
        break;
        
      case 'missing_roles':
        console.log('🎫 Problema de roles - intentando refresh del token');
        // Intentar relogar para obtener roles correctos
        alert('Tu sesión necesita ser renovada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        break;
        
      case 'backend_config_issue': {
        console.log('⚙️ Problema de backend - activando modo fallback completo');
        // Activar modo fallback para toda la aplicación
        localStorage.setItem('fallbackMode', 'true');
        localStorage.setItem('fallbackReason', 'Backend Spring Security misconfigured');
        
        // Crear datos de usuario fallback
        const fallbackUser = {
          id: 'fallback-001',
          nombre: 'Usuario (Modo Fallback)',
          email: 'usuario@fallback.local',
          posicion: 'Sin especificar',
          nivel: 'Sin especificar',
          ubicacion: 'Sin especificar',
          mode: 'fallback',
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('fallbackProfile', JSON.stringify(fallbackUser));
        console.log('💾 Modo fallback activado:', fallbackUser);
        
        alert('Se ha detectado un problema de configuración en el servidor. La aplicación funcionará en modo offline limitado.');
        break;
      }
        
      default:
        console.log('🤷 No se pudo determinar una solución automática');
    }
    
    return diagnosis;
  }
};

// 🌍 EXPONER GLOBALMENTE
if (typeof window !== 'undefined') {
  window.debug403 = debugAuth.debug403Error;
  window.testConfigs = debugAuth.testDifferentConfigs;
  window.autoFixAuth = debugAuth.autoFix;
  
  console.log('🚨 Funciones de depuración 403 disponibles:');
  console.log('   debug403() - Diagnosticar error 403');
  console.log('   testConfigs() - Probar diferentes configuraciones');
  console.log('   autoFixAuth() - Aplicar soluciones automáticas');
}

export default debugAuth;