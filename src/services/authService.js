import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS, HEADERS, createAuthHeaders } from '../utils/apiConfig';

// 🎯 IMPORTAR CONFIGURACIÓN EXACTA PARA TU BACKEND
const BACKEND_ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',         // POST - Exacto de tu backend
  AUTH_REGISTER: '/api/auth/register',   // POST - Exacto de tu backend
  USERS_ME: '/api/users/me',            // GET/PUT - Exacto de tu backend
  PROFILES_ME: '/api/profiles/me'        // GET/PUT - Exacto de tu backend (¡PUT no POST!)
};

export const authService = {
  // 📝 REGISTRO - Endpoint exacto de tu backend
  register: async (nombre, email, password) => {
    console.log('📝 authService.register: enviando datos de registro');
    
    const response = await fetch(`http://localhost:8080${BACKEND_ENDPOINTS.AUTH_REGISTER}`, {
      method: 'POST',
      headers: HEADERS.JSON,
      body: JSON.stringify({ nombre, email, password })
    });
    
    console.log('📝 Register response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ Register success:', data);
    
    // Guardar token automáticamente
    if (data.token) {
      localStorage.setItem('jwt', data.token);
      console.log('💾 Token saved to localStorage');
    }
    
    return data;
  },

  // 🔐 LOGIN - Endpoint exacto de tu backend
  login: async (email, password) => {
    console.log('🔐 authService.login: intentando login');
    
    const response = await fetch(`http://localhost:8080${BACKEND_ENDPOINTS.AUTH_LOGIN}`, {
      method: 'POST',
      headers: HEADERS.JSON,
      body: JSON.stringify({ email, password })
    });
    
    console.log('🔐 Login response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ Login success:', data);
    
    // Guardar token automáticamente
    if (data.token) {
      localStorage.setItem('jwt', data.token);
      console.log('💾 Token saved to localStorage');
    }
    
    return data;
  },

  // 🚪 LOGOUT - Endpoint 6
  logout: async () => {
    const token = localStorage.getItem('jwt');
    
    if (token) {
      try {
        console.log('🚪 authService.logout: notificando al servidor');
        
        await fetch(AUTH_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: createAuthHeaders(token)
        });
        
        console.log('✅ Logout notificado al servidor');
      } catch (error) {
        console.warn('⚠️ Error notificando logout al servidor:', error.message);
        // No lanzar error - seguir con logout local
      }
    }
    
    // Limpiar token local siempre
    localStorage.removeItem('jwt');
    console.log('🧹 Token removed from localStorage');
  },

  // 👤 VERIFICAR AUTENTICACIÓN
  isAuthenticated: () => {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    
    try {
      // Verificar que el token no esté expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.log('⏰ Token expirado, limpiando...');
        localStorage.removeItem('jwt');
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ Error validando token:', error.message);
      return false;
    }
  },

  // 📊 OBTENER USUARIO ACTUAL - Endpoint confirmado: /api/users/me
  getCurrentUser: async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    
    console.log('👤 authService.getCurrentUser: obteniendo info del usuario');
    
    // Usar el endpoint confirmado del backend
    const response = await fetch(PROFILE_ENDPOINTS.GET_USER_INFO, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });
    
    console.log('📡 getCurrentUser response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ getCurrentUser failed with status:', response.status);
      
      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(`Error getting user info: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log('✅ getCurrentUser success:', userData);
    return userData;
  },

  // 📧 VERIFICAR EMAIL DISPONIBLE - Endpoint 4
  checkEmailAvailable: async (email) => {
    console.log('📧 authService.checkEmailAvailable:', email);
    
    const response = await fetch(`${AUTH_ENDPOINTS.CHECK_EMAIL}?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: HEADERS.JSON
    });
    
    if (!response.ok) {
      throw new Error(`Error checking email: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📧 Email check result:', result);
    return result;
  },

  // 🔒 CAMBIAR CONTRASEÑA - Endpoint 7
  changePassword: async (currentPassword, newPassword) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    
    console.log('🔒 authService.changePassword: cambiando contraseña');
    
    const response = await fetch(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Password changed successfully');
    return result;
  },

  // � ACTUALIZAR PERFIL - MÉTODO CRÍTICO PARA SOLUCIONAR EL BUCLE
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    
    console.log('👥 authService.updateProfile: actualizando perfil con datos:', profileData);
    
    // ⚠️ CRÍTICO: Tu backend usa PUT, no POST
    const response = await fetch(`http://localhost:8080${BACKEND_ENDPOINTS.PROFILES_ME}`, {
      method: 'PUT',  // ¡IMPORTANTE! Tu backend requiere PUT
      headers: createAuthHeaders(token),
      body: JSON.stringify(profileData)
    });
    
    console.log('👥 updateProfile response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.log('❌ updateProfile error data:', errorData);
      } catch {
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.log('❌ updateProfile error text:', errorText);
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ updateProfile success:', result);
    return result;
  },

  // 👤 OBTENER PERFIL COMPLETO
  getProfile: async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    
    console.log('👤 authService.getProfile: obteniendo perfil completo');
    
    const response = await fetch(`http://localhost:8080${BACKEND_ENDPOINTS.PROFILES_ME}`, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });
    
    console.log('👤 getProfile response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ getProfile failed with status:', response.status);
      
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      
      if (response.status === 404) {
        console.log('ℹ️ Perfil no encontrado, devolviendo null');
        return null; // Perfil no existe aún
      }
      
      throw new Error(`Error getting profile: ${response.status}`);
    }
    
    const profileData = await response.json();
    console.log('✅ getProfile success:', profileData);
    return profileData;
  },

  // �💓 VERIFICAR ESTADO DEL SERVICIO - Endpoint 3
  checkServiceStatus: async () => {
    console.log('💓 authService.checkServiceStatus: verificando estado del servicio');
    
    try {
      const response = await fetch(AUTH_ENDPOINTS.STATUS, {
        method: 'GET',
        headers: HEADERS.JSON
      });
      
      if (response.ok) {
        const status = await response.json();
        console.log('✅ Service status:', status);
        return status;
      } else {
        console.log('⚠️ Service status check failed:', response.status);
        return { status: 'error', code: response.status };
      }
    } catch (error) {
      console.log('❌ Service status error:', error.message);
      return { status: 'offline', error: error.message };
    }
  }
};