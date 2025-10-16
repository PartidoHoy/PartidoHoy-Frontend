/**
 * 🎯 VALIDADOR UNIFICADO DE PERFIL
 * Sistema central para determinar si un perfil está completo y evitar bucles
 */

export const profileValidator = {
  
  // 🔍 VERIFICAR SI EL PERFIL ESTÁ COMPLETO
  isProfileComplete: async () => {
    console.log('🔍 === VERIFICANDO COMPLETITUD DEL PERFIL ===');
    
    const validation = {
      timestamp: new Date().toISOString(),
      profileComplete: false,
      source: null,
      profileData: null,
      reasons: [],
      recommendations: []
    };
    
    try {
      // 1. Verificar token válido
      const token = localStorage.getItem('jwt');
      if (!token) {
        validation.reasons.push('No hay token de autenticación');
        validation.recommendations.push('Hacer login');
        return validation;
      }
      
      // 2. Verificar perfil en servidor (fuente de verdad)
      console.log('🌐 Verificando perfil en servidor...');
      const serverResponse = await fetch('http://localhost:8080/api/profiles/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (serverResponse.ok) {
        const serverProfile = await serverResponse.json();
        console.log('📡 Perfil del servidor:', serverProfile);
        
        // Verificar campos requeridos
        const hasRequiredFields = serverProfile.posicion && 
                                 serverProfile.nivel && 
                                 serverProfile.nombre;
        
        if (hasRequiredFields) {
          validation.profileComplete = true;
          validation.source = 'server';
          validation.profileData = serverProfile;
          validation.reasons.push('Perfil completo en servidor');
          
          // Sincronizar con localStorage para evitar futuras verificaciones
          localStorage.setItem('tempProfile', JSON.stringify(serverProfile));
          console.log('💾 Perfil sincronizado en localStorage');
          
        } else {
          validation.reasons.push('Perfil incompleto en servidor');
          validation.reasons.push(`Falta: ${!serverProfile.posicion ? 'posición ' : ''}${!serverProfile.nivel ? 'nivel ' : ''}${!serverProfile.nombre ? 'nombre ' : ''}`);
        }
        
      } else if (serverResponse.status === 404) {
        validation.reasons.push('Perfil no existe en servidor');
        validation.recommendations.push('Completar perfil por primera vez');
        
      } else {
        validation.reasons.push(`Error del servidor: ${serverResponse.status}`);
        
        // Si hay error del servidor, verificar localStorage como fallback
        const tempProfile = localStorage.getItem('tempProfile');
        if (tempProfile) {
          try {
            const localProfile = JSON.parse(tempProfile);
            if (localProfile.posicion && localProfile.nivel) {
              validation.profileComplete = true;
              validation.source = 'localStorage';
              validation.profileData = localProfile;
              validation.reasons.push('Perfil completo en localStorage (fallback)');
            }
          } catch  {
            validation.reasons.push('Perfil temporal corrupto');
          }
        }
      }
      
    } catch (error) {
      validation.reasons.push(`Error de conexión: ${error.message}`);
      
      // Fallback a localStorage
      const tempProfile = localStorage.getItem('tempProfile');
      if (tempProfile) {
        try {
          const localProfile = JSON.parse(tempProfile);
          if (localProfile.posicion && localProfile.nivel) {
            validation.profileComplete = true;
            validation.source = 'localStorage';
            validation.profileData = localProfile;
            validation.reasons.push('Perfil completo en localStorage (sin conexión)');
          }
        } catch  {
          validation.reasons.push('Perfil temporal corrupto');
        }
      }
    }
    
    // 3. Generar recomendaciones
    if (validation.profileComplete) {
      validation.recommendations.push('✅ Redirigir al Dashboard');
    } else {
      validation.recommendations.push('❌ Redirigir a CompleteProfile');
    }
    
    console.log('📋 Resultado de validación:', validation);
    return validation;
  },
  
  // 🔧 FORZAR ACTUALIZACIÓN DEL ESTADO DEL PERFIL
  refreshProfileStatus: async () => {
    console.log('🔧 === REFRESCANDO ESTADO DEL PERFIL ===');
    
    // Limpiar datos temporales potencialmente corruptos
    const keysToClean = ['tempProfile', 'fallbackProfile', 'profileComplete'];
    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Limpiado: ${key}`);
      }
    });
    
    // Verificar perfil fresco desde servidor
    const validation = await profileValidator.isProfileComplete();
    
    if (validation.profileComplete) {
      console.log('✅ Perfil confirmado como completo');
      // Marcar en localStorage para evitar futuras verificaciones innecesarias
      localStorage.setItem('profileVerifiedAt', new Date().toISOString());
    }
    
    return validation;
  },
  
  // 🎯 DETERMINAR REDIRECCIÓN CORRECTA
  getCorrectRedirection: async () => {
    console.log('🎯 === DETERMINANDO REDIRECCIÓN CORRECTA ===');
    
    const validation = await profileValidator.isProfileComplete();
    
    const redirection = {
      shouldRedirectTo: validation.profileComplete ? '/dashboard' : '/complete-profile',
      reason: validation.profileComplete 
        ? 'Perfil completo, ir al Dashboard'
        : 'Perfil incompleto, ir a completar',
      profileData: validation.profileData,
      validation: validation
    };
    
    console.log('🎯 Redirección determinada:', redirection);
    return redirection;
  },
  
  // 🚀 EJECUTAR REDIRECCIÓN FORZADA
  executeCorrectRedirection: async () => {
    console.log('🚀 === EJECUTANDO REDIRECCIÓN CORRECTA ===');
    
    const redirection = await profileValidator.getCorrectRedirection();
    
    console.log(`🔄 Redirigiendo a: ${redirection.shouldRedirectTo}`);
    console.log(`📋 Razón: ${redirection.reason}`);
    
    // Cambiar URL
    window.history.pushState({}, '', redirection.shouldRedirectTo);
    
    // Forzar actualización de React Router
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    // Fallback: recargar página si React Router no responde
    setTimeout(() => {
      if (window.location.pathname !== redirection.shouldRedirectTo) {
        console.log('🔄 React Router no respondió, recargando página...');
        window.location.href = redirection.shouldRedirectTo;
      }
    }, 1000);
    
    return redirection;
  },
  
  // 🔍 DIAGNOSTICAR PROBLEMA DEL BUCLE
  diagnoseBucleIssue: async () => {
    console.log('🔍 === DIAGNÓSTICO DEL BUCLE ===');
    
    const diagnosis = {
      currentUrl: window.location.pathname,
      validation: await profileValidator.isProfileComplete(),
      localStorage: {},
      recommendations: []
    };
    
    // Verificar datos en localStorage
    ['tempProfile', 'fallbackProfile', 'jwt', 'profileComplete'].forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        diagnosis.localStorage[key] = key === 'jwt' ? 'PRESENTE' : value.substring(0, 100) + '...';
      }
    });
    
    // Analizar el problema
    if (diagnosis.currentUrl === '/dashboard' && !diagnosis.validation.profileComplete) {
      diagnosis.recommendations.push('❌ PROBLEMA: Dashboard detecta perfil incompleto pero URL es /dashboard');
      diagnosis.recommendations.push('🔧 SOLUCIÓN: Ejecutar executeCorrectRedirection()');
    }
    
    if (diagnosis.currentUrl === '/complete-profile' && diagnosis.validation.profileComplete) {
      diagnosis.recommendations.push('❌ PROBLEMA: CompleteProfile detecta perfil completo pero URL es /complete-profile');
      diagnosis.recommendations.push('🔧 SOLUCIÓN: Ejecutar executeCorrectRedirection()');
    }
    
    console.log('📋 Diagnóstico del bucle:', diagnosis);
    return diagnosis;
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.isProfileComplete = profileValidator.isProfileComplete;
  window.refreshProfileStatus = profileValidator.refreshProfileStatus;
  window.getCorrectRedirection = profileValidator.getCorrectRedirection;
  window.executeCorrectRedirection = profileValidator.executeCorrectRedirection;
  window.diagnoseBucleIssue = profileValidator.diagnoseBucleIssue;
  
  console.log('🎯 Validador de Perfil disponible:');
  console.log('   isProfileComplete() - Verificar si perfil está completo');
  console.log('   refreshProfileStatus() - Refrescar estado del perfil');
  console.log('   executeCorrectRedirection() - Ejecutar redirección correcta');
  console.log('   diagnoseBucleIssue() - Diagnosticar problema del bucle');
}

export default profileValidator;