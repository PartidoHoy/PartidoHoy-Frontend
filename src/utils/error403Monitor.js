/**
 * 🚨 DETECTOR Y SOLUCIONADOR AUTOMÁTICO DE ERRORES 403
 * Se ejecuta automáticamente cuando detecta múltiples errores 403
 */

class Error403Monitor {
  constructor() {
    this.errorCount = 0;
    this.errorHistory = [];
    this.autoFixAttempted = false;
    this.init();
  }

  init() {
    console.log('🚨 Iniciando monitor de errores 403...');
    
    // Interceptar fetch para detectar errores 403
    this.interceptFetch();
    
    // Verificar si hay problemas persistentes
    this.checkPersistentIssues();
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 403) {
          this.handle403Error(args[0], response);
        } else if (response.ok) {
          // Reset counter en caso de éxito
          this.resetErrorCount();
        }
        
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    };
  }

  handle403Error(url, response) {
    this.errorCount++;
    this.errorHistory.push({
      url: url,
      timestamp: new Date().toISOString(),
      status: response.status
    });

    console.warn(`🚨 Error 403 detectado #${this.errorCount}: ${url}`);

    // Si hay muchos errores 403, intentar auto-fix
    if (this.errorCount >= 3 && !this.autoFixAttempted) {
      console.error('🆘 MÚLTIPLES ERRORES 403 DETECTADOS - INICIANDO AUTO-REPARACIÓN');
      this.triggerAutoFix();
    }
  }

  async triggerAutoFix() {
    this.autoFixAttempted = true;
    
    try {
      console.log('🛠️ Ejecutando diagnóstico automático...');
      
      // Importar authFixer dinámicamente
      const { default: authFixer } = await import('./authFixer.js');
      
      // Ejecutar diagnóstico
      const result = await authFixer.autoFix();
      
      console.log('📋 Resultado del auto-fix:', result);
      
      // Mostrar notificación al usuario
      this.showNotification(result);
      
      // Reset contador después del fix
      setTimeout(() => {
        this.resetErrorCount();
        this.autoFixAttempted = false;
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error durante auto-fix:', error);
    }
  }

  showNotification(result) {
    // Crear notificación visual para el usuario
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: #ff6b6b; 
        color: white; 
        padding: 15px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 400px;
        font-family: Arial, sans-serif;
      ">
        <h4 style="margin: 0 0 10px 0;">🚨 Problema de Autenticación Detectado</h4>
        <p style="margin: 0 0 10px 0;">Se han detectado múltiples errores 403. Se aplicaron las siguientes correcciones:</p>
        <ul style="margin: 0; padding-left: 20px;">
          ${result.fixes.map(fix => `<li>${fix}</li>`).join('')}
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 12px;">
          ${result.recommendation}
        </p>
        <button onclick="this.parentNode.parentNode.remove()" style="
          background: white; 
          color: #ff6b6b; 
          border: none; 
          padding: 5px 10px; 
          border-radius: 4px; 
          cursor: pointer; 
          margin-top: 10px;
        ">Cerrar</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 15 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 15000);
  }

  resetErrorCount() {
    if (this.errorCount > 0) {
      console.log('✅ Reseteando contador de errores 403');
      this.errorCount = 0;
      this.errorHistory = [];
    }
  }

  checkPersistentIssues() {
    // Verificar si hay problemas conocidos en localStorage
    const token = localStorage.getItem('jwt');
    
    if (token) {
      try {
        // Verificar si el token parece corrupto
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('⚠️ Token JWT malformado detectado');
          localStorage.removeItem('jwt');
        } else {
          // Verificar expiración
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.warn('⚠️ Token expirado detectado');
            localStorage.removeItem('jwt');
          }
        }
      } catch (error) {
        console.warn('⚠️ Error analizando token, removiendo:', error.message);
        localStorage.removeItem('jwt');
      }
    }
  }

  getStatus() {
    return {
      errorCount: this.errorCount,
      errorHistory: this.errorHistory,
      autoFixAttempted: this.autoFixAttempted
    };
  }
}

// Inicializar monitor automáticamente
const error403Monitor = new Error403Monitor();

// Exponer globalmente para debug
if (typeof window !== 'undefined') {
  window.error403Monitor = error403Monitor;
  window.get403Status = () => error403Monitor.getStatus();
  
  console.log('🚨 Monitor de errores 403 activo');
  console.log('   get403Status() - Ver estado del monitor');
}

export default error403Monitor;