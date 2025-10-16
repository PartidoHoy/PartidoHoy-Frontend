/**
 * 🧪 VERIFICADOR DE FUNCIONES DEL USERSERVICE
 * Para confirmar que todas las funciones necesarias están disponibles
 */

export const userServiceChecker = {
  
  // 🔍 VERIFICAR TODAS LAS FUNCIONES
  checkAllFunctions: () => {
    console.log('🧪 === VERIFICANDO FUNCIONES DEL USERSERVICE ===');
    
    // Importar userService dinámicamente para evitar problemas de import
    import('../services/userService.js').then((module) => {
      const userService = module.default;
      
      const requiredFunctions = [
        'getCurrentUser',
        'updateProfile', 
        'uploadProfilePhoto',
        'getUserStats',
        'getUsers',
        'searchUsers',
        'getCompleteProfile'
      ];
      
      const results = {
        available: [],
        missing: [],
        total: requiredFunctions.length
      };
      
      requiredFunctions.forEach(funcName => {
        if (typeof userService[funcName] === 'function') {
          results.available.push(`✅ ${funcName}`);
        } else {
          results.missing.push(`❌ ${funcName}`);
        }
      });
      
      console.log('📋 Resultado de verificación:');
      console.log(`   Total funciones: ${results.total}`);
      console.log(`   Disponibles: ${results.available.length}`);
      console.log(`   Faltantes: ${results.missing.length}`);
      
      if (results.available.length > 0) {
        console.log('✅ Funciones disponibles:');
        results.available.forEach(func => console.log(`   ${func}`));
      }
      
      if (results.missing.length > 0) {
        console.log('❌ Funciones faltantes:');
        results.missing.forEach(func => console.log(`   ${func}`));
      }
      
      return results;
    }).catch(error => {
      console.error('❌ Error importando userService:', error);
    });
  },
  
  // 🧪 PROBAR FUNCIONES BÁSICAS
  testBasicFunctions: async () => {
    console.log('🧪 === PROBANDO FUNCIONES BÁSICAS ===');
    
    try {
      const { default: userService } = await import('../services/userService.js');
      
      const tests = [];
      
      // Test 1: getCurrentUser
      try {
        console.log('🧪 Probando getCurrentUser...');
        const user = await userService.getCurrentUser();
        tests.push('✅ getCurrentUser: Funciona');
        console.log('👤 Usuario actual:', user.nombre || user.email);
      } catch (error) {
        tests.push(`❌ getCurrentUser: ${error.message}`);
      }
      
      // Test 2: getUserStats (con manejo de errores)
      try {
        console.log('🧪 Probando getUserStats...');
        const stats = await userService.getUserStats();
        tests.push('✅ getUserStats: Funciona');
        console.log('📊 Stats:', stats);
      } catch (error) {
        tests.push(`❌ getUserStats: ${error.message}`);
      }
      
      // Test 3: getUsers (con manejo de errores)
      try {
        console.log('🧪 Probando getUsers...');
        const users = await userService.getUsers(1, 5);
        tests.push('✅ getUsers: Funciona');
        console.log('👥 Usuarios encontrados:', users.length || 0);
      } catch (error) {
        tests.push(`❌ getUsers: ${error.message}`);
      }
      
      console.log('📋 Resultados de las pruebas:');
      tests.forEach(test => console.log(`   ${test}`));
      
      return tests;
      
    } catch (error) {
      console.error('❌ Error en las pruebas:', error);
      return [`❌ Error general: ${error.message}`];
    }
  },
  
  // 🔧 SOLUCIONAR PROBLEMAS DE FUNCIONES
  fixMissingFunctions: () => {
    console.log('🔧 === SOLUCIONANDO PROBLEMAS DE FUNCIONES ===');
    
    const fixes = [
      '✅ Funciones getUserStats y getUsers agregadas al userService',
      '✅ Ambas funciones incluyen manejo de errores robusto',
      '✅ Devuelven datos por defecto si el backend no tiene los endpoints',
      '✅ Usan la misma autenticación que las funciones existentes'
    ];
    
    console.log('🔧 Correcciones aplicadas:');
    fixes.forEach(fix => console.log(`   ${fix}`));
    
    console.log('💡 Recomendación: Refresca la página para que los componentes usen las nuevas funciones');
    
    return {
      status: 'fixed',
      fixes: fixes,
      recommendation: 'Refrescar página para aplicar cambios'
    };
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.checkUserServiceFunctions = userServiceChecker.checkAllFunctions;
  window.testUserServiceFunctions = userServiceChecker.testBasicFunctions;
  window.fixUserServiceFunctions = userServiceChecker.fixMissingFunctions;
  
  console.log('🧪 Verificador de UserService disponible:');
  console.log('   checkUserServiceFunctions() - Verificar todas las funciones');
  console.log('   testUserServiceFunctions() - Probar funciones básicas');
  console.log('   fixUserServiceFunctions() - Info sobre las correcciones aplicadas');
}

export default userServiceChecker;