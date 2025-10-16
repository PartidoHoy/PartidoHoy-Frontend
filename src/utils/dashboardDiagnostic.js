/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO DEL DASHBOARD
 * Para detectar por qué no renderiza aunque los endpoints funcionen
 */

export const dashboardDiagnostic = {
  
  // 🎯 DIAGNÓSTICO COMPLETO DEL DASHBOARD
  diagnoseDashboard: async () => {
    console.log('🎯 === DIAGNÓSTICO DEL DASHBOARD ===');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      currentUrl: window.location.pathname,
      token: null,
      userFromAuth: null,
      profileFromServer: null,
      authContextStatus: null,
      renderingBlocked: [],
      recommendations: []
    };
    
    // 1. Verificar token
    const token = localStorage.getItem('jwt');
    diagnosis.token = {
      exists: !!token,
      valid: false,
      payload: null
    };
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        diagnosis.token.valid = payload.exp * 1000 > Date.now();
        diagnosis.token.payload = payload;
        console.log('🔑 Token:', {
          válido: diagnosis.token.valid,
          usuario: payload.sub,
          roles: payload.roles || payload.authorities || [],
          expira: new Date(payload.exp * 1000).toLocaleString()
        });
      } catch  {
        diagnosis.renderingBlocked.push('Token JWT corrupto');
      }
    } else {
      diagnosis.renderingBlocked.push('No hay token JWT');
    }
    
    // 2. Verificar AuthContext
    try {
      // Simular la lógica del AuthContext
      const authData = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (authData.ok) {
        diagnosis.userFromAuth = await authData.json();
        console.log('👤 Usuario del AuthContext:', diagnosis.userFromAuth);
      } else {
        diagnosis.renderingBlocked.push(`AuthContext falla: ${authData.status}`);
      }
    } catch (error) {
      diagnosis.renderingBlocked.push(`Error en AuthContext: ${error.message}`);
    }
    
    // 3. Verificar perfil del servidor
    try {
      const profileData = await fetch('http://localhost:8080/api/profiles/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileData.ok) {
        diagnosis.profileFromServer = await profileData.json();
        console.log('👥 Perfil del servidor:', diagnosis.profileFromServer);
      } else if (profileData.status === 404) {
        console.log('ℹ️ Perfil no encontrado en servidor (normal para nuevos usuarios)');
        diagnosis.profileFromServer = null;
      } else {
        diagnosis.renderingBlocked.push(`Error obteniendo perfil: ${profileData.status}`);
      }
    } catch (error) {
      diagnosis.renderingBlocked.push(`Error de conexión al perfil: ${error.message}`);
    }
    
    // 4. Analizar lógica de renderizado del Dashboard
    const tempProfile = localStorage.getItem('tempProfile');
    const hasTempProfile = !!tempProfile;
    const hasServerProfile = diagnosis.profileFromServer?.posicion && diagnosis.profileFromServer?.nivel;
    
    console.log('🔍 Análisis de perfil:');
    console.log('   - Perfil temporal:', hasTempProfile ? 'SÍ' : 'NO');
    console.log('   - Perfil en servidor:', hasServerProfile ? 'SÍ' : 'NO');
    
    // Simular la lógica del Dashboard
    const isProfileIncomplete = !hasTempProfile && !hasServerProfile;
    
    if (isProfileIncomplete) {
      diagnosis.renderingBlocked.push('Dashboard detecta perfil incompleto');
      diagnosis.recommendations.push('Dashboard redirige a /complete-profile');
    }
    
    // 5. Verificar ProtectedRoute
    const hasValidAuth = diagnosis.token.valid && diagnosis.userFromAuth;
    if (!hasValidAuth) {
      diagnosis.renderingBlocked.push('ProtectedRoute bloquea acceso');
      diagnosis.recommendations.push('ProtectedRoute redirige a /login');
    }
    
    // 6. Generar recomendaciones
    if (diagnosis.renderingBlocked.length === 0) {
      diagnosis.recommendations.push('✅ Dashboard debería renderizar correctamente');
    } else {
      diagnosis.recommendations.push('❌ Dashboard bloqueado por:');
      diagnosis.renderingBlocked.forEach(block => {
        diagnosis.recommendations.push(`   - ${block}`);
      });
    }
    
    console.log('📋 Diagnóstico completo:', diagnosis);
    return diagnosis;
  },
  
  // 🔧 FORZAR RENDERIZADO DEL DASHBOARD
  forceDashboardRender: async () => {
    console.log('🔧 === FORZANDO RENDERIZADO DEL DASHBOARD ===');
    
    const diagnosis = await dashboardDiagnostic.diagnoseDashboard();
    
    // Si hay perfil en servidor, crear perfil temporal para evitar redirección
    if (diagnosis.profileFromServer && diagnosis.profileFromServer.posicion) {
      console.log('💾 Creando perfil temporal para evitar redirección...');
      localStorage.setItem('tempProfile', JSON.stringify(diagnosis.profileFromServer));
    }
    
    // Navegar al dashboard
    console.log('🚀 Navegando al dashboard...');
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    return {
      success: true,
      profileCreated: !!diagnosis.profileFromServer,
      diagnosis
    };
  },
  
  // 🧪 SIMULAR LÓGICA DEL DASHBOARD
  simulateDashboardLogic: () => {
    console.log('🧪 === SIMULANDO LÓGICA DEL DASHBOARD ===');
    
    // Obtener datos como los obtiene el Dashboard
    const fallbackProfile = localStorage.getItem('tempProfile');
    const hasFallbackProfile = fallbackProfile ? JSON.parse(fallbackProfile) : null;
    
    console.log('📊 Estado actual:');
    console.log('   - URL:', window.location.pathname);
    console.log('   - tempProfile en localStorage:', !!fallbackProfile);
    console.log('   - Contenido tempProfile:', hasFallbackProfile);
    
    // Esta es la lógica exacta del Dashboard
    // const isProfileIncomplete = !hasFallbackProfile && (!user?.posicion || !user?.nivel);
    
    const simulation = {
      hasFallbackProfile: !!hasFallbackProfile,
      fallbackProfileData: hasFallbackProfile,
      shouldRedirectToComplete: false // Se calculará
    };
    
    // Sin acceso directo a `user`, simulamos
    if (!hasFallbackProfile) {
      simulation.shouldRedirectToComplete = true;
      console.log('❌ Dashboard redirigirá a /complete-profile porque no hay tempProfile');
    } else {
      console.log('✅ Dashboard debería renderizar porque hay tempProfile');
    }
    
    return simulation;
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.diagnoseDashboard = dashboardDiagnostic.diagnoseDashboard;
  window.forceDashboardRender = dashboardDiagnostic.forceDashboardRender;
  window.simulateDashboardLogic = dashboardDiagnostic.simulateDashboardLogic;
  
  console.log('🎯 Diagnóstico del Dashboard disponible:');
  console.log('   diagnoseDashboard() - Diagnóstico completo del Dashboard');
  console.log('   forceDashboardRender() - Forzar renderizado del Dashboard');
  console.log('   simulateDashboardLogic() - Simular lógica del Dashboard');
}

export default dashboardDiagnostic;