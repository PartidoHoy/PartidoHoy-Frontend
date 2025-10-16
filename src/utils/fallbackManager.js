// Sistema de fallback mejorado para el frontend
const FALLBACK_STORAGE_KEY = 'partidohoy_fallback_data';

export class FallbackProfileManager {
  
  static saveProfile(profileData) {
    const fallbackData = {
      profile: profileData,
      timestamp: Date.now(),
      syncAttempts: 0,
      version: '1.0',
      needsSync: true
    };
    
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(fallbackData));
    localStorage.setItem('tempProfile', JSON.stringify(profileData)); // Mantener compatibilidad
    
    console.log('💾 Perfil guardado en modo fallback:', profileData);
    return fallbackData;
  }
  
  static getProfile() {
    const data = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing fallback data:', error);
      return null;
    }
  }
  
  static hasProfile() {
    return !!this.getProfile();
  }
  
  static async attemptSync(userService) {
    const fallbackData = this.getProfile();
    if (!fallbackData || !fallbackData.needsSync) {
      return { success: false, reason: 'No data to sync' };
    }
    
    try {
      // Incrementar contador de intentos
      fallbackData.syncAttempts = (fallbackData.syncAttempts || 0) + 1;
      fallbackData.lastSyncAttempt = Date.now();
      localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(fallbackData));
      
      // Intentar sincronizar con el backend
      const result = await userService.updateProfile(fallbackData.profile);
      
      if (result && !result.fallbackMode) {
        // Éxito - limpiar datos de fallback
        this.clearFallbackData();
        console.log('✅ Sincronización exitosa - datos enviados al servidor');
        return { success: true, data: result };
      } else {
        console.log('⚠️ Sincronización falló - servidor aún no disponible');
        return { success: false, reason: 'Backend still unavailable' };
      }
      
    } catch (error) {
      console.log('❌ Error en sincronización:', error.message);
      return { success: false, reason: error.message };
    }
  }
  
  static clearFallbackData() {
    localStorage.removeItem(FALLBACK_STORAGE_KEY);
    localStorage.removeItem('tempProfile'); // Limpiar también el legacy
    console.log('🧹 Datos de fallback limpiados');
  }
  
  static getStats() {
    const data = this.getProfile();
    if (!data) return null;
    
    const now = Date.now();
    const daysSinceCreated = Math.floor((now - data.timestamp) / (1000 * 60 * 60 * 24));
    
    return {
      daysSinceCreated,
      syncAttempts: data.syncAttempts || 0,
      lastSyncAttempt: data.lastSyncAttempt || data.timestamp,
      needsSync: data.needsSync,
      profile: data.profile
    };
  }
  
  static getStatusMessage() {
    const stats = this.getStats();
    if (!stats) return null;
    
    let message = `Perfil guardado localmente hace ${stats.daysSinceCreated} día(s). `;
    
    if (stats.syncAttempts > 0) {
      message += `${stats.syncAttempts} intento(s) de sincronización fallidos. `;
    }
    
    if (stats.daysSinceCreated > 7) {
      message += '⚠️ Datos antiguos - contacta al administrador del sistema.';
    } else {
      message += 'Los datos se sincronizarán cuando el servidor esté disponible.';
    }
    
    return message;
  }
}

// Auto-intento de sincronización cada 5 minutos si hay datos pendientes
let syncInterval = null;

export const startAutoSync = (userService) => {
  if (syncInterval) clearInterval(syncInterval);
  
  syncInterval = setInterval(async () => {
    if (FallbackProfileManager.hasProfile()) {
      console.log('🔄 Intento automático de sincronización...');
      const result = await FallbackProfileManager.attemptSync(userService);
      
      if (result.success) {
        clearInterval(syncInterval);
        console.log('✅ Auto-sincronización exitosa');
        // Recargar página para actualizar UI
        window.location.reload();
      }
    }
  }, 5 * 60 * 1000); // 5 minutos
};

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};