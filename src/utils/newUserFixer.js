/**
 * 🚨 SOLUCIONADOR DE PROBLEMAS DE USUARIOS NUEVOS
 * Para resolver problemas de caché de perfil y visualización de usuarios
 */

export const newUserFixer = {
  
  // 🔍 DIAGNOSTICAR PROBLEMA DE USUARIO NUEVO
  diagnoseNewUserIssue: async () => {
    console.log('🚨 === DIAGNÓSTICO DE USUARIO NUEVO ===');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      currentUser: null,
      tokenInfo: null,
      cachedProfile: null,
      serverProfile: null,
      issues: [],
      recommendations: []
    };
    
    try {
      // 1. Verificar token actual
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          diagnosis.tokenInfo = {
            userId: payload.sub,
            roles: payload.roles || payload.authorities || [],
            exp: new Date(payload.exp * 1000).toISOString()
          };
          console.log('🔑 Token actual:', diagnosis.tokenInfo);
        } catch  {
          diagnosis.issues.push('Token corrupto');
        }
      }
      
      // 2. Verificar perfil en caché
      const tempProfile = localStorage.getItem('tempProfile');
      if (tempProfile) {
        try {
          diagnosis.cachedProfile = JSON.parse(tempProfile);
          console.log('💾 Perfil en caché:', diagnosis.cachedProfile);
          
          // Verificar si el perfil en caché pertenece al usuario actual
          if (diagnosis.tokenInfo && diagnosis.cachedProfile.email !== diagnosis.tokenInfo.userId) {
            diagnosis.issues.push('❌ PROBLEMA CRÍTICO: Perfil en caché pertenece a otro usuario');
            diagnosis.issues.push(`   Caché: ${diagnosis.cachedProfile.email}`);
            diagnosis.issues.push(`   Token: ${diagnosis.tokenInfo.userId}`);
            diagnosis.recommendations.push('Limpiar caché de perfil inmediatamente');
          }
        } catch  {
          diagnosis.issues.push('Perfil en caché corrupto');
        }
      }
      
      // 3. Verificar perfil en servidor
      if (token) {
        try {
          const response = await fetch('http://localhost:8080/api/profiles/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            diagnosis.serverProfile = await response.json();
            console.log('🌐 Perfil en servidor:', diagnosis.serverProfile);
            
            // Verificar si hay discrepancia entre caché y servidor
            if (diagnosis.cachedProfile && diagnosis.serverProfile) {
              if (diagnosis.cachedProfile.email !== diagnosis.serverProfile.email) {
                diagnosis.issues.push('❌ DISCREPANCIA: Caché y servidor tienen usuarios diferentes');
              }
            }
          } else if (response.status === 404) {
            console.log('ℹ️ Usuario nuevo: No tiene perfil en servidor');
            diagnosis.serverProfile = null;
          } else {
            diagnosis.issues.push(`Error del servidor: ${response.status}`);
          }
        } catch (error) {
          diagnosis.issues.push(`Error de conexión: ${error.message}`);
        }
      }
      
      // 4. Generar recomendaciones
      if (diagnosis.issues.length === 0) {
        diagnosis.recommendations.push('✅ No se detectaron problemas');
      } else {
        diagnosis.recommendations.push('🔧 Ejecutar cleanUserCache() para limpiar datos incorrectos');
        diagnosis.recommendations.push('🔧 Ejecutar testUsersList() para verificar lista de usuarios');
      }
      
    } catch (error) {
      diagnosis.issues.push(`Error general: ${error.message}`);
    }
    
    console.log('📋 Diagnóstico completo:', diagnosis);
    return diagnosis;
  },
  
  // 🧹 LIMPIAR CACHÉ DE USUARIO INCORRECTO
  cleanUserCache: () => {
    console.log('🧹 === LIMPIANDO CACHÉ DE USUARIO ===');
    
    const cleaned = [];
    const keysToClean = [
      'tempProfile',
      'fallbackProfile', 
      'userProfile',
      'profileComplete',
      'profileVerifiedAt'
    ];
    
    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleaned.push(key);
      }
    });
    
    console.log('🧹 Elementos limpiados:', cleaned);
    
    return {
      success: true,
      cleaned: cleaned,
      recommendation: 'Refrescar página para aplicar cambios'
    };
  },
  
  // 👥 PROBAR LISTA DE USUARIOS
  testUsersList: async () => {
    console.log('👥 === PROBANDO LISTA DE USUARIOS ===');
    
    const test = {
      endpoint: 'http://localhost:8080/api/profiles/search',
      results: null,
      issues: [],
      recommendations: []
    };
    
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        test.issues.push('No hay token de autenticación');
        return test;
      }
      
      console.log('📡 Probando endpoint de búsqueda de usuarios...');
      const response = await fetch(test.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Respuesta del servidor:', response.status);
      
      if (response.ok) {
        const users = await response.json();
        test.results = users;
        console.log('👥 Usuarios encontrados:', users.length || 0);
        console.log('👥 Datos de usuarios:', users);
        
        if (!users || users.length === 0) {
          test.issues.push('El endpoint funciona pero no devuelve usuarios');
          test.recommendations.push('Verificar que hay usuarios en la base de datos');
        } else {
          test.recommendations.push('✅ Endpoint de usuarios funciona correctamente');
        }
      } else {
        test.issues.push(`Endpoint falla con status: ${response.status}`);
        
        if (response.status === 403) {
          test.recommendations.push('Problema de permisos - verificar roles de usuario');
        } else if (response.status === 404) {
          test.recommendations.push('Endpoint no existe - verificar backend');
        }
      }
      
    } catch (error) {
      test.issues.push(`Error de conexión: ${error.message}`);
      test.recommendations.push('Verificar que el backend esté funcionando');
    }
    
    console.log('📋 Resultado de prueba:', test);
    return test;
  },
  
  // 🔧 SOLUCIÓN COMPLETA PARA USUARIO NUEVO
  fixNewUserIssue: async () => {
    console.log('🔧 === SOLUCIONANDO PROBLEMA DE USUARIO NUEVO ===');
    
    const steps = [];
    
    // Paso 1: Diagnosticar
    steps.push('🔍 Diagnosticando problema...');
    const diagnosis = await newUserFixer.diagnoseNewUserIssue();
    
    // Paso 2: Limpiar caché si hay problemas
    if (diagnosis.issues.length > 0) {
      steps.push('🧹 Limpiando caché incorrecto...');
      const cleanResult = newUserFixer.cleanUserCache();
      steps.push(`✅ Limpiados: ${cleanResult.cleaned.join(', ')}`);
    }
    
    // Paso 3: Probar lista de usuarios
    steps.push('👥 Probando lista de usuarios...');
    const usersTest = await newUserFixer.testUsersList();
    
    if (usersTest.results && usersTest.results.length > 0) {
      steps.push(`✅ Lista de usuarios funciona: ${usersTest.results.length} usuarios encontrados`);
    } else {
      steps.push('❌ Lista de usuarios vacía o con problemas');
    }
    
    // Paso 4: Recomendaciones finales
    steps.push('🎯 Recomendaciones:');
    steps.push('   1. Refrescar la página');
    steps.push('   2. Hacer logout y login de nuevo');
    steps.push('   3. Verificar que el perfil se complete correctamente');
    
    console.log('📋 Pasos ejecutados:', steps);
    
    return {
      success: true,
      steps: steps,
      diagnosis: diagnosis,
      usersTest: usersTest
    };
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.diagnoseNewUserIssue = newUserFixer.diagnoseNewUserIssue;
  window.cleanUserCache = newUserFixer.cleanUserCache;
  window.testUsersList = newUserFixer.testUsersList;
  window.fixNewUserIssue = newUserFixer.fixNewUserIssue;
  
  console.log('🚨 Solucionador de Usuario Nuevo disponible:');
  console.log('   diagnoseNewUserIssue() - Diagnosticar problema de usuario nuevo');
  console.log('   cleanUserCache() - Limpiar caché incorrecto');
  console.log('   testUsersList() - Probar lista de usuarios');
  console.log('   fixNewUserIssue() - Solución completa');
}

export default newUserFixer;