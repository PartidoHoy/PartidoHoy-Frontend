/**
 * 🎯 VALIDADOR UNIFICADO DE PERFIL - VERSIÓN MEJORADA
 * Sistema central para determinar si un perfil está completo y evitar bucles
 * INCLUYE MANEJO DE USUARIOS NUEVOS Y LIMPIEZA DE CACHÉ
 */

export const profileValidatorImproved = {
  
  // 🔍 VERIFICAR SI EL PERFIL ESTÁ COMPLETO (VERSIÓN MEJORADA)
  isProfileComplete: async (forceRefresh = false) => {
    console.log('🔍 === VERIFICANDO COMPLETITUD DEL PERFIL (MEJORADO) ===');
    
    const validation = {
      timestamp: new Date().toISOString(),
      profileComplete: false,
      source: null,
      profileData: null,
      reasons: [],
      recommendations: [],
      currentUser: null,
      cacheCleanedUp: false
    };
    
    try {
      // 1. Verificar token válido
      const token = localStorage.getItem('jwt');
      if (!token) {
        validation.reasons.push('No hay token de autenticación');
        validation.recommendations.push('Hacer login');
        return validation;
      }
      
      // 2. Obtener información del usuario actual del token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        validation.currentUser = {
          email: payload.sub,
          roles: payload.roles || payload.authorities || [],
          exp: new Date(payload.exp * 1000)
        };
        console.log('👤 Usuario actual:', validation.currentUser.email);
      } catch  {
        validation.reasons.push('Token JWT corrupto');
        return validation;
      }
      
      // 3. 🚨 VERIFICAR Y LIMPIAR CACHÉ DE OTROS USUARIOS (CRÍTICO)
      const tempProfile = localStorage.getItem('tempProfile');
      if (tempProfile && !forceRefresh) {
        try {
          const cachedProfile = JSON.parse(tempProfile);
          
          // Verificar si el caché pertenece al usuario actual
          if (cachedProfile.email && cachedProfile.email !== validation.currentUser.email) {
            console.log('🚨 PROBLEMA CRÍTICO: Caché de otro usuario detectado');
            console.log(`   👤 Usuario actual: ${validation.currentUser.email}`);
            console.log(`   💾 Caché de: ${cachedProfile.email}`);
            
            // Limpiar TODO el caché relacionado con perfiles
            const keysToClean = ['tempProfile', 'fallbackProfile', 'profileComplete', 'profileVerifiedAt'];
            keysToClean.forEach(key => {
              localStorage.removeItem(key);
            });
            
            validation.cacheCleanedUp = true;
            validation.reasons.push(`Caché de usuario anterior limpiado: ${cachedProfile.email}`);
            console.log('🧹 Caché de usuario anterior limpiado correctamente');
          }
        } catch  {
          // Caché corrupto, limpiar
          localStorage.removeItem('tempProfile');
          validation.reasons.push('Caché corrupto limpiado');
        }
      }

      // 4. Verificar perfil en servidor (fuente de verdad)
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
        
        // 🔍 Verificar que el perfil del servidor pertenece al usuario actual
        if (serverProfile.email !== validation.currentUser.email) {
          validation.reasons.push('❌ PROBLEMA: Perfil del servidor no coincide con usuario actual');
          validation.reasons.push(`   Servidor: ${serverProfile.email}, Token: ${validation.currentUser.email}`);
          return validation;
        }
        
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
          // SOLO para el usuario actual
          localStorage.setItem('tempProfile', JSON.stringify(serverProfile));
          localStorage.setItem('profileVerifiedAt', new Date().toISOString());
          console.log('💾 Perfil sincronizado en localStorage para usuario actual');
          
        } else {
          validation.reasons.push('Perfil incompleto en servidor');
          validation.reasons.push(`Faltan campos: ${!serverProfile.posicion ? 'posición ' : ''}${!serverProfile.nivel ? 'nivel ' : ''}${!serverProfile.nombre ? 'nombre ' : ''}`);
        }
        
      } else if (serverResponse.status === 404) {
        validation.reasons.push('Perfil no existe en servidor (usuario nuevo)');
        validation.recommendations.push('Completar perfil por primera vez');
        console.log('ℹ️ Usuario nuevo detectado - no tiene perfil en servidor');
        
      } else {
        validation.reasons.push(`Error del servidor: ${serverResponse.status}`);
        console.log(`❌ Error del servidor: ${serverResponse.status}`);
      }
      
    } catch (error) {
      validation.reasons.push(`Error de conexión: ${error.message}`);
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    
    // 5. Generar recomendaciones finales
    if (validation.profileComplete) {
      validation.recommendations.push('✅ Redirigir al Dashboard');
    } else {
      validation.recommendations.push('❌ Redirigir a CompleteProfile');
    }
    
    console.log('📋 Resultado de validación mejorada:', validation);
    return validation;
  },
  
  // 🧹 LIMPIAR TODO EL CACHÉ DE PERFIL
  clearProfileCache: () => {
    console.log('🧹 === LIMPIANDO TODO EL CACHÉ DE PERFIL ===');
    
    const keysToClean = [
      'tempProfile',
      'fallbackProfile', 
      'userProfile',
      'profileComplete',
      'profileVerifiedAt'
    ];
    
    const cleaned = [];
    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleaned.push(key);
      }
    });
    
    console.log('🧹 Elementos limpiados:', cleaned);
    return cleaned;
  },
  
  // 🎯 DETERMINAR REDIRECCIÓN CORRECTA (MEJORADA)
  getCorrectRedirection: async () => {
    console.log('🎯 === DETERMINANDO REDIRECCIÓN CORRECTA (MEJORADA) ===');
    
    const validation = await profileValidatorImproved.isProfileComplete();
    
    const redirection = {
      shouldRedirectTo: validation.profileComplete ? '/dashboard' : '/complete-profile',
      reason: validation.profileComplete 
        ? 'Perfil completo, ir al Dashboard'
        : 'Perfil incompleto o usuario nuevo, ir a completar',
      profileData: validation.profileData,
      validation: validation,
      cacheCleanedUp: validation.cacheCleanedUp
    };
    
    console.log('🎯 Redirección determinada (mejorada):', redirection);
    return redirection;
  },
  
  // 🚀 EJECUTAR REDIRECCIÓN FORZADA (MEJORADA)
  executeCorrectRedirection: async () => {
    console.log('🚀 === EJECUTANDO REDIRECCIÓN CORRECTA (MEJORADA) ===');
    
    const redirection = await profileValidatorImproved.getCorrectRedirection();
    
    console.log(`🔄 Redirigiendo a: ${redirection.shouldRedirectTo}`);
    console.log(`📋 Razón: ${redirection.reason}`);
    
    if (redirection.cacheCleanedUp) {
      console.log('🧹 Se limpiaron datos de caché de otros usuarios');
    }
    
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
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE (MEJORADAS)
if (typeof window !== 'undefined') {
  // Reemplazar las funciones originales con las mejoradas
  window.isProfileComplete = profileValidatorImproved.isProfileComplete;
  window.clearProfileCache = profileValidatorImproved.clearProfileCache;
  window.getCorrectRedirection = profileValidatorImproved.getCorrectRedirection;
  window.executeCorrectRedirection = profileValidatorImproved.executeCorrectRedirection;
  
  console.log('🎯 Validador de Perfil MEJORADO disponible:');
  console.log('   isProfileComplete() - Verificar perfil (con limpieza de caché)');
  console.log('   clearProfileCache() - Limpiar todo el caché de perfil');
  console.log('   executeCorrectRedirection() - Redirección correcta (mejorada)');
}

export default profileValidatorImproved;