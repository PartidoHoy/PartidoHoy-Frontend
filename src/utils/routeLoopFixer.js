/**
 * 🔄 SOLUCIONADOR DEL BUCLE DE RUTAS DE PERFIL
 * Soluciona el problema donde Dashboard y CompleteProfile se redirigen infinitamente
 */

export const routeLoopFixer = {
  
  // 🎯 DIAGNÓSTICO DEL BUCLE DE RUTAS
  diagnoseRouteLoop: () => {
    console.log('🔄 === DIAGNÓSTICO DEL BUCLE DE RUTAS ===');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      currentUrl: window.location.pathname,
      user: null,
      token: null,
      tempProfile: null,
      serverProfile: null,
      issues: [],
      recommendations: []
    };
    
    // 1. Verificar token
    const token = localStorage.getItem('jwt');
    diagnosis.token = {
      exists: !!token,
      valid: false
    };
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        diagnosis.token.valid = payload.exp * 1000 > Date.now();
        diagnosis.token.expires = new Date(payload.exp * 1000).toISOString();
        diagnosis.user = {
          email: payload.sub,
          roles: payload.roles || payload.authorities || []
        };
      } catch  {
        diagnosis.issues.push('Token JWT inválido o corrupto');
      }
    }
    
    // 2. Verificar perfil temporal
    const tempProfile = localStorage.getItem('tempProfile');
    if (tempProfile) {
      try {
        diagnosis.tempProfile = JSON.parse(tempProfile);
      } catch  {
        diagnosis.issues.push('Perfil temporal corrupto en localStorage');
      }
    }
    
    // 3. Verificar otros datos residuales
    const fallbackProfile = localStorage.getItem('fallbackProfile');
    const userProfile = localStorage.getItem('userProfile');
    
    if (fallbackProfile || userProfile) {
      diagnosis.issues.push('Datos residuales de perfil encontrados');
    }
    
    // 4. Analizar la situación
    const hasValidToken = diagnosis.token.exists && diagnosis.token.valid;
    const hasTempProfile = !!diagnosis.tempProfile;
    const isOnDashboard = diagnosis.currentUrl === '/dashboard';
    const isOnCompleteProfile = diagnosis.currentUrl === '/complete-profile';
    
    if (hasValidToken && hasTempProfile && (isOnDashboard || isOnCompleteProfile)) {
      diagnosis.issues.push('BUCLE DETECTADO: Perfil temporal existe pero páginas se redirigen mutuamente');
      diagnosis.recommendations.push('Limpiar perfil temporal y forzar re-creación');
    }
    
    if (!hasValidToken) {
      diagnosis.issues.push('Token inválido o expirado');
      diagnosis.recommendations.push('Hacer login nuevamente');
    }
    
    console.log('📋 Diagnóstico del bucle:', diagnosis);
    return diagnosis;
  },
  
  // 🔧 SOLUCIONAR EL BUCLE
  fixRouteLoop: async () => {
    console.log('🔧 === SOLUCIONANDO BUCLE DE RUTAS ===');
    
    const fixes = [];
    let success = false;
    
    try {
      // PASO 1: Limpiar todos los datos de perfil problemáticos
      const profileKeys = ['tempProfile', 'fallbackProfile', 'userProfile', 'profileComplete'];
      profileKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          fixes.push(`✅ Limpiado: ${key}`);
        }
      });
      
      // PASO 2: Verificar si el token es válido
      const token = localStorage.getItem('jwt');
      if (!token) {
        fixes.push('❌ No hay token - necesitas hacer login');
        return { fixes, success: false, redirect: '/login' };
      }
      
      let tokenValid = false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        tokenValid = payload.exp * 1000 > Date.now();
        
        if (!tokenValid) {
          localStorage.removeItem('jwt');
          fixes.push('❌ Token expirado - limpiado');
          return { fixes, success: false, redirect: '/login' };
        }
        
        fixes.push('✅ Token válido');
      } catch  {
        localStorage.removeItem('jwt');
        fixes.push('❌ Token corrupto - limpiado');
        return { fixes, success: false, redirect: '/login' };
      }
      
      // PASO 3: Verificar perfil real en el servidor
      try {
        fixes.push('🔍 Verificando perfil en el servidor...');
        
        const response = await fetch('http://localhost:8080/api/profiles/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const profile = await response.json();
          
          if (profile && profile.posicion && profile.nivel) {
            fixes.push('✅ Perfil completo encontrado en servidor');
            success = true;
            return { fixes, success, redirect: '/dashboard', profile };
          } else {
            fixes.push('⚠️ Perfil incompleto en servidor');
            return { fixes, success: false, redirect: '/complete-profile' };
          }
          
        } else if (response.status === 404) {
          fixes.push('ℹ️ Perfil no existe en servidor');
          return { fixes, success: false, redirect: '/complete-profile' };
          
        } else {
          fixes.push(`❌ Error del servidor: ${response.status}`);
          
          if (response.status === 403) {
            fixes.push('⚠️ PROBLEMA DE ROLES: Usuario probablemente tiene ROLE_ADMIN en lugar de ROLE_USER');
            return { 
              fixes, 
              success: false, 
              redirect: '/complete-profile',
              roleIssue: true 
            };
          }
          
          return { fixes, success: false, redirect: '/complete-profile' };
        }
        
      } catch (error) {
        fixes.push(`❌ Error de conexión: ${error.message}`);
        return { fixes, success: false, redirect: '/complete-profile' };
      }
      
    } catch (error) {
      fixes.push(`❌ Error general: ${error.message}`);
      return { fixes, success: false };
    }
  },
  
  // 🚀 FORZAR REDIRECCIÓN CORRECTA
  forceCorrectRedirection: async () => {
    console.log('🚀 === FORZANDO REDIRECCIÓN CORRECTA ===');
    
    const result = await routeLoopFixer.fixRouteLoop();
    
    if (result.redirect) {
      console.log(`🔄 Redirigiendo a: ${result.redirect}`);
      
      // Usar pushState para cambiar la URL sin recargar
      window.history.pushState({}, '', result.redirect);
      
      // Disparar evento para que React Router detecte el cambio
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      // Como respaldo, recargar la página después de un delay
      setTimeout(() => {
        if (window.location.pathname !== result.redirect) {
          window.location.href = result.redirect;
        }
      }, 1000);
    }
    
    return result;
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.diagnoseRouteLoop = routeLoopFixer.diagnoseRouteLoop;
  window.fixRouteLoop = routeLoopFixer.fixRouteLoop;
  window.forceCorrectRedirection = routeLoopFixer.forceCorrectRedirection;
  
  console.log('🔄 Solucionador de bucle de rutas disponible:');
  console.log('   diagnoseRouteLoop() - Diagnosticar bucle de rutas');
  console.log('   fixRouteLoop() - Solucionar bucle de rutas');  
  console.log('   forceCorrectRedirection() - Forzar redirección correcta');
}

export default routeLoopFixer;