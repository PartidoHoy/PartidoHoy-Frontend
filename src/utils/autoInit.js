/**
 * 🚀 INICIALIZADOR AUTOMÁTICO DE REPARACIONES
 * Se ejecuta automáticamente al cargar la aplicación
 */

import autoFixer from './autoFixer';

// 🔄 EJECUCIÓN AUTOMÁTICA AL CARGAR
const autoInitFixer = {
  
  // 🚀 INICIALIZAR REPARACIONES AUTOMÁTICAS
  init: async () => {
    console.log('🚀 Inicializando reparaciones automáticas...');
    
    // Esperar un poco para que la app se cargue
    setTimeout(async () => {
      try {
        // 1. Verificar si hay token
        const token = localStorage.getItem('jwt');
        
        if (!token) {
          console.log('ℹ️ No hay token - no se necesita reparación');
          return;
        }
        
        console.log('🔍 Token detectado - verificando funcionalidad...');
        
        // 2. Probar una llamada simple de autenticación
        const testResponse = await fetch('http://localhost:8080/auth/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (testResponse.ok) {
          console.log('✅ Autenticación funcionando correctamente');
          return;
        }
        
        console.log('⚠️ Problema de autenticación detectado - iniciando reparación...');
        
        // 3. Ejecutar auto-reparación
        const fixResult = await autoFixer.autoFix403Problems();
        
        if (fixResult.success) {
          console.log('🎉 ¡Problema reparado automáticamente!');
          
          // Mostrar notificación al usuario
          autoInitFixer.showSuccessNotification(fixResult.workingSolution);
        } else {
          console.log('❌ No se pudo reparar automáticamente');
          autoInitFixer.showManualActionNotification();
        }
        
      } catch (error) {
        console.error('🚨 Error en inicialización automática:', error);
      }
    }, 2000); // Esperar 2 segundos para que la app se cargue
  },
  
  // ✅ MOSTRAR NOTIFICACIÓN DE ÉXITO
  showSuccessNotification: (solution) => {
    const message = `🎉 Problema de autenticación reparado automáticamente!\n\n` +
                   `Solución aplicada: ${solution?.name || 'Configuración automática'}\n\n` +
                   `La aplicación debería funcionar correctamente ahora.`;
    
    // Mostrar en consola con estilo
    console.log('%c🎉 REPARACIÓN EXITOSA', 'color: green; font-size: 16px; font-weight: bold;');
    console.log(message);
    
    // También crear una notificación visual si es posible
    if (typeof document !== 'undefined') {
      autoInitFixer.createVisualNotification('✅ Autenticación reparada', 'success');
    }
  },
  
  // ⚠️ MOSTRAR NOTIFICACIÓN DE ACCIÓN MANUAL
  showManualActionNotification: () => {
    const message = `⚠️ Se requiere acción manual\n\n` +
                   `El problema de autenticación no se pudo reparar automáticamente.\n\n` +
                   `Acciones recomendadas:\n` +
                   `1. Ejecutar autoFix() en la consola\n` +
                   `2. Verificar configuración del backend\n` +
                   `3. Revisar roles del usuario en la base de datos`;
    
    console.warn('%c⚠️ ACCIÓN MANUAL REQUERIDA', 'color: orange; font-size: 16px; font-weight: bold;');
    console.warn(message);
    
    if (typeof document !== 'undefined') {
      autoInitFixer.createVisualNotification('⚠️ Acción manual requerida', 'warning');
    }
  },
  
  // 📱 CREAR NOTIFICACIÓN VISUAL
  createVisualNotification: (message, type = 'info') => {
    // Solo crear notificación si estamos en el navegador
    if (typeof document === 'undefined') return;
    
    try {
      // Crear elemento de notificación
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
      `;
      
      // Colores según tipo
      const colors = {
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3'
      };
      
      notification.style.backgroundColor = colors[type] || colors.info;
      notification.textContent = message;
      
      // Agregar animación
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      // Agregar al DOM
      document.body.appendChild(notification);
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 5000);
      
      // Remover al hacer click
      notification.addEventListener('click', () => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });
      
    } catch (error) {
      console.error('Error creando notificación visual:', error);
    }
  },
  
  // 🧪 MODO DE DESARROLLO - DIAGNÓSTICO CONTINUO
  enableDevMode: () => {
    console.log('🧪 Modo desarrollo activado - diagnóstico continuo');
    
    // Verificar cada 30 segundos si hay problemas de autenticación
    setInterval(async () => {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:8080/auth/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('⚠️ Problema de autenticación detectado en verificación continua');
          // No auto-reparar para evitar spam, solo reportar
        }
      } catch (error) {
        console.warn('⚠️ Error en verificación continua:', error.message);
      }
    }, 30000); // Cada 30 segundos
  }
};

// 🚀 AUTO-INICIALIZAR AL CARGAR
if (typeof window !== 'undefined') {
  // Exponer funciones útiles
  window.fixAuth = autoFixer.autoFix403Problems;
  window.enableDevMode = autoInitFixer.enableDevMode;
  
  // Inicializar automáticamente
  autoInitFixer.init();
  
  console.log('🔧 Auto-reparador inicializado');
  console.log('   fixAuth() - Reparar problemas de autenticación');
  console.log('   enableDevMode() - Activar diagnóstico continuo');
}

export default autoInitFixer;