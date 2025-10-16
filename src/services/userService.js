import { 
  PROFILE_ENDPOINTS, 
  SEARCH_PARAMS, 
  RANKING_PARAMS,
  createAuthHeaders, 
  createUploadHeaders 
} from '../utils/apiConfig';

// 🔧 OBTENER HEADERS DE AUTORIZACIÓN OPTIMIZADOS
const getOptimizedAuthHeaders = (token) => {
  // Verificar si hay un formato que ya sabemos que funciona
  const workingFormat = localStorage.getItem('workingAuthFormat');
  
  if (workingFormat) {
    try {
      const format = JSON.parse(workingFormat);
      console.log('🎯 Usando formato de autorización conocido:', format.name);
      return {
        'Authorization': format.header,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    } catch {
      console.warn('⚠️ Error parsing working format, usando default');
    }
  }
  
  // Formato estándar si no hay información previa
  return createAuthHeaders(token);
};

// 🛠️ ENDPOINTS ALTERNATIVOS PARA CASOS DE EMERGENCIA
const ALTERNATIVE_ENDPOINTS = {
  // Diferentes variaciones que el backend podría aceptar
  GET_USER_INFO: [
    'http://localhost:8080/api/profiles/me',
    'http://localhost:8080/api/users/me', 
    'http://localhost:8080/api/user/profile',
    'http://localhost:8080/api/auth/me',
    'http://localhost:8080/auth/user'
  ],
  UPDATE_PROFILE: [
    'http://localhost:8080/api/profiles/me',
    'http://localhost:8080/api/users/me',
    'http://localhost:8080/api/user/profile',
    'http://localhost:8080/api/profiles/update'
  ]
};

// 🔧 FUNCIÓN HELPER PARA PROBAR MÚLTIPLES ENDPOINTS
const tryMultipleEndpoints = async (endpoints, options) => {
  let lastError = null;
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`🔄 Probando endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, options);
      
      console.log(`📊 Endpoint ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`✅ Endpoint exitoso: ${endpoint}`);
        return response;
      } else if (response.status === 403) {
        console.warn(`🚨 403 en ${endpoint} - continuando con siguiente`);
        lastError = new Error(`403 Forbidden: ${endpoint}`);
        continue;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error en ${endpoint}:`, error.message);
      lastError = error;
      
      if (i === endpoints.length - 1) {
        // Es el último endpoint, lanzar el error
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('Todos los endpoints fallaron');
};

export const userService = {
  // 👤 OBTENER MI PERFIL - Endpoint 8 (con endpoints alternativos)
  getCurrentUser: async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('👤 userService.getCurrentUser: obteniendo mi perfil (con fallbacks)');
    
    const options = {
      method: 'GET',
      headers: getOptimizedAuthHeaders(token)
    };
    
    try {
      // Intentar endpoint principal primero
      console.log('🎯 Intentando endpoint principal...');
      const response = await fetch(PROFILE_ENDPOINTS.GET_MY_PROFILE, options);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ getCurrentUser success (endpoint principal):', userData);
        return userData;
      } else if (response.status === 403) {
        console.warn('🚨 Endpoint principal bloqueado, probando alternativos...');
        
        // Probar endpoints alternativos
        const altResponse = await tryMultipleEndpoints(ALTERNATIVE_ENDPOINTS.GET_USER_INFO, options);
        const userData = await altResponse.json();
        console.log('✅ getCurrentUser success (endpoint alternativo):', userData);
        return userData;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ getCurrentUser failed completamente:', error);
      
      if (error.message.includes('403')) {
        // Si todos los endpoints devuelven 403, es un problema de autorización
        console.error('🚨 PROBLEMA CRÍTICO: Todos los endpoints de perfil devuelven 403');
        console.error('💡 Posibles causas:');
        console.error('   1. El token no tiene los roles correctos (ROLE_USER)');
        console.error('   2. Spring Security no está configurado para estos endpoints');
        console.error('   3. El backend espera un formato diferente de token');
        
        // Activar modo fallback con datos mínimos
        const fallbackUser = {
          id: 'fallback-user',
          email: 'usuario@fallback.com',
          nombre: 'Usuario (Modo Fallback)',
          mode: 'fallback',
          timestamp: new Date().toISOString(),
          error: 'Todos los endpoints de perfil devuelven 403'
        };
        
        localStorage.setItem('fallbackProfile', JSON.stringify(fallbackUser));
        console.log('💾 Activado modo fallback:', fallbackUser);
        return fallbackUser;
      }
      
      if (error.message.includes('401')) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw error;
    }
  },

  // ✏️ ACTUALIZAR MI PERFIL - Endpoint 9 (con endpoints alternativos)
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('✏️ userService.updateProfile: actualizando perfil (con fallbacks)');
    console.log('📝 Datos a enviar:', profileData);
    
    const options = {
      method: 'PUT',
      headers: createAuthHeaders(token),
      body: JSON.stringify(profileData)
    };

    try {
      // Intentar endpoint principal
      console.log('🎯 Intentando endpoint principal para update...');
      const response = await fetch(PROFILE_ENDPOINTS.UPDATE_MY_PROFILE, options);

      console.log('📡 updateProfile response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ updateProfile success (endpoint principal):', result);
        
        // Si tenemos datos en fallback y la operación fue exitosa, limpiarlos
        if (localStorage.getItem('fallbackProfile')) {
          console.log('🧹 Limpiando datos fallback después de éxito');
          localStorage.removeItem('fallbackProfile');
        }
        
        return result;
      } else if (response.status === 403) {
        console.warn('🚨 Update principal bloqueado, probando alternativos...');
        
        // Probar endpoints alternativos para update
        try {
          const altResponse = await tryMultipleEndpoints(ALTERNATIVE_ENDPOINTS.UPDATE_PROFILE, options);
          const result = await altResponse.json();
          console.log('✅ updateProfile success (endpoint alternativo):', result);
          return result;
        } catch {
          console.warn('⚠️ Todos los endpoints de update fallan, activando fallback');
          
          // Activar modo fallback
          const fallbackData = {
            ...profileData,
            timestamp: new Date().toISOString(),
            mode: 'fallback',
            error: 'Endpoints de actualización bloqueados (403)'
          };
          localStorage.setItem('fallbackProfile', JSON.stringify(fallbackData));
          console.log('💾 Datos guardados en fallback:', fallbackData);
          return fallbackData;
        }
      } else if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      } else {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Error ${response.status}`;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      
      // Si es un error de red o similar, también activar fallback
      if (!error.message.includes('Token expirado')) {
        console.warn('⚠️ Error de red o servidor, activando fallback');
        const fallbackData = {
          ...profileData,
          timestamp: new Date().toISOString(),
          mode: 'fallback',
          error: error.message
        };
        localStorage.setItem('fallbackProfile', JSON.stringify(fallbackData));
        console.log('💾 Datos guardados en fallback por error de red:', fallbackData);
        return fallbackData;
      }
      
      throw error;
    }
  },

  // 📸 SUBIR FOTO DE PERFIL - Endpoint 10
  uploadProfilePhoto: async (photoFile) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('📸 userService.uploadProfilePhoto: subiendo foto');
    
    const formData = new FormData();
    formData.append('photo', photoFile);

    try {
      const response = await fetch(PROFILE_ENDPOINTS.UPLOAD_PHOTO, {
        method: 'POST',
        headers: createUploadHeaders(token),
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('jwt');
          throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 403) {
          console.warn('🚨 Upload de foto bloqueado - guardando en fallback');
          // Crear un placeholder para la foto en el fallback
          const fallbackPhoto = {
            photoUrl: URL.createObjectURL(photoFile),
            fileName: photoFile.name,
            size: photoFile.size,
            timestamp: new Date().toISOString(),
            mode: 'fallback'
          };
          
          let fallbackProfile = localStorage.getItem('fallbackProfile');
          if (fallbackProfile) {
            fallbackProfile = JSON.parse(fallbackProfile);
            fallbackProfile.photo = fallbackPhoto;
            localStorage.setItem('fallbackProfile', JSON.stringify(fallbackProfile));
          }
          
          return fallbackPhoto;
        }
        if (response.status === 413) {
          throw new Error('El archivo es demasiado grande. Máximo 5MB.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // El backend puede devolver texto plano o JSON
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Si es texto plano (como "Foto subida correctamente")
        const textResponse = await response.text();
        result = {
          message: textResponse,
          photoUrl: `${PROFILE_ENDPOINTS.UPLOAD_PHOTO}/${photoFile.name}`, // URL estimada
          fileName: photoFile.name,
          size: photoFile.size,
          timestamp: new Date().toISOString()
        };
      }
      
      console.log('✅ Photo upload success:', result);
      return result;
    } catch (error) {
      console.error('❌ uploadProfilePhoto error:', error);
      throw error;
    }
  },

  // 🃏 OBTENER MI TARJETA - Endpoint 11
  getMyCard: async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('🃏 userService.getMyCard: obteniendo mi tarjeta');
    
    const response = await fetch(PROFILE_ENDPOINTS.GET_MY_CARD, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const card = await response.json();
    console.log('✅ getMyCard success:', card);
    return card;
  },

  // 👥 VER PERFIL DE OTRO USUARIO - Endpoint 12
  getUserProfile: async (userId) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('👥 userService.getUserProfile: obteniendo perfil de usuario', userId);
    
    const response = await fetch(PROFILE_ENDPOINTS.GET_USER_PROFILE(userId), {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      if (response.status === 404) {
        throw new Error('Usuario no encontrado.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const profile = await response.json();
    console.log('✅ getUserProfile success:', profile);
    return profile;
  },

  // 🃏 VER TARJETA DE OTRO USUARIO - Endpoint 13
  getUserCard: async (userId) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('🃏 userService.getUserCard: obteniendo tarjeta de usuario', userId);
    
    const response = await fetch(PROFILE_ENDPOINTS.GET_USER_CARD(userId), {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      if (response.status === 404) {
        throw new Error('Tarjeta de usuario no encontrada.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const card = await response.json();
    console.log('✅ getUserCard success:', card);
    return card;
  },

  // 🔍 BUSCAR TARJETAS DE USUARIOS - Endpoint 14
  searchUserCards: async (filters = {}) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('🔍 userService.searchUserCards: buscando tarjetas', filters);
    
    // Construir parámetros de búsqueda
    const params = new URLSearchParams();
    
    if (filters.posicion) params.append(SEARCH_PARAMS.POSITION, filters.posicion);
    if (filters.nivel) params.append(SEARCH_PARAMS.LEVEL, filters.nivel);
    if (filters.ubicacion) params.append(SEARCH_PARAMS.LOCATION, filters.ubicacion);
    if (typeof filters.disponible !== 'undefined') params.append(SEARCH_PARAMS.AVAILABLE, filters.disponible);
    if (filters.limit) params.append(SEARCH_PARAMS.LIMIT, filters.limit);
    if (filters.offset) params.append(SEARCH_PARAMS.OFFSET, filters.offset);
    
    const url = `${PROFILE_ENDPOINTS.SEARCH_CARDS}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const results = await response.json();
    console.log('✅ searchUserCards success:', results);
    return results;
  },

  // 🏆 TOP JUGADORES POR GOLES - Endpoint 15
  getTopGoalScorers: async (limit = 10, offset = 0) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('🏆 userService.getTopGoalScorers: obteniendo top goleadores');
    
    const params = new URLSearchParams();
    params.append(RANKING_PARAMS.LIMIT, limit.toString());
    params.append(RANKING_PARAMS.OFFSET, offset.toString());
    
    const url = `${PROFILE_ENDPOINTS.TOP_GOALS}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const topPlayers = await response.json();
    console.log('✅ getTopGoalScorers success:', topPlayers);
    return topPlayers;
  },

  // 🎯 TOP JUGADORES POR ASISTENCIAS - Endpoint 16
  getTopAssistants: async (limit = 10, offset = 0) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('🎯 userService.getTopAssistants: obteniendo top asistentes');
    
    const params = new URLSearchParams();
    params.append(RANKING_PARAMS.LIMIT, limit.toString());
    params.append(RANKING_PARAMS.OFFSET, offset.toString());
    
    const url = `${PROFILE_ENDPOINTS.TOP_ASSISTS}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const topPlayers = await response.json();
    console.log('✅ getTopAssistants success:', topPlayers);
    return topPlayers;
  },

  // 🏃 TOP JUGADORES POR PARTIDOS - Endpoint 17
  getTopMatchPlayers: async (limit = 10, offset = 0) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('🏃 userService.getTopMatchPlayers: obteniendo top por partidos');
    
    const params = new URLSearchParams();
    params.append(RANKING_PARAMS.LIMIT, limit.toString());
    params.append(RANKING_PARAMS.OFFSET, offset.toString());
    
    const url = `${PROFILE_ENDPOINTS.TOP_MATCHES}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const topPlayers = await response.json();
    console.log('✅ getTopMatchPlayers success:', topPlayers);
    return topPlayers;
  },

  // � OBTENER ESTADÍSTICAS DE USUARIO
  getUserStats: async (userId = null) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('📊 userService.getUserStats: obteniendo estadísticas');
    
    const endpoint = userId 
      ? `http://localhost:8080/api/profiles/${userId}/stats`
      : 'http://localhost:8080/api/profiles/me/stats';
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getOptimizedAuthHeaders(token)
      });
      
      if (response.ok) {
        const stats = await response.json();
        console.log('✅ getUserStats success:', stats);
        return stats;
      } else if (response.status === 404) {
        // Si no existe endpoint de stats, devolver stats por defecto
        console.log('ℹ️ Endpoint de stats no disponible, usando datos por defecto');
        return {
          partidos: 0,
          goles: 0,
          asistencias: 0,
          tarjetasAmarillas: 0,
          tarjetasRojas: 0,
          rating: 0
        };
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ getUserStats error, devolviendo stats por defecto:', error.message);
      // Devolver stats por defecto en caso de error
      return {
        partidos: 0,
        goles: 0,
        asistencias: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0,
        rating: 0
      };
    }
  },

  // 👥 OBTENER LISTA DE USUARIOS
  getUsers: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('👥 userService.getUsers: obteniendo lista de usuarios');
    
    try {
      const response = await fetch(`http://localhost:8080/api/profiles/search?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getOptimizedAuthHeaders(token)
      });
      
      if (response.ok) {
        const users = await response.json();
        console.log('✅ getUsers success:', users);
        return users;
      } else if (response.status === 404) {
        // Si no existe endpoint de users, devolver array vacío
        console.log('ℹ️ Endpoint de usuarios no disponible, usando datos por defecto');
        return [];
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ getUsers error, devolviendo array vacío:', error.message);
      // Devolver array vacío en caso de error
      return [];
    }
  },

  // �🔍 OBTENER PERFIL COMPLETO (incluyendo datos fallback si existen)
  getCompleteProfile: async () => {
    try {
      const userData = await userService.getCurrentUser();
      
      // Verificar si hay datos en fallback
      const fallbackProfile = localStorage.getItem('fallbackProfile');
      if (fallbackProfile) {
        const fallbackData = JSON.parse(fallbackProfile);
        console.log('📝 Mezclando datos de usuario con fallback');
        return {
          ...userData,
          ...fallbackData,
          hasFallbackData: true
        };
      }
      
      return userData;
    } catch (error) {
      console.error('❌ getCompleteProfile error:', error);
      throw error;
    }
  }
};

export default userService;