/**
 * 📋 CONFIGURACIÓN COMPLETA DE ENDPOINTS - PARTIDOHOY BACKEND
 * 
 * Esta es la documentación oficial de todos los endpoints disponibles
 * en el backend de PartidoHoy.
 */

const API_BASE_URL = 'http://localhost:8080';

// 🔑 ENDPOINTS DE AUTENTICACIÓN
export const AUTH_ENDPOINTS = {
  // 1. Registro de Usuario
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // 2. Login
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // 3. Estado del Servicio (Público)
  STATUS: `${API_BASE_URL}/auth/status`,
  
  // 4. Verificar Email Disponible
  CHECK_EMAIL: `${API_BASE_URL}/auth/check-email`,
  
  // 5. Información del Usuario Actual (Requiere Auth)
  USER_INFO: `${API_BASE_URL}/auth/user`,
  
  // 6. Cerrar Sesión (Requiere Auth)
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // 7. Cambiar Contraseña (Requiere Auth)
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`
};

// 👤 ENDPOINTS DE PERFILES DE USUARIO
export const PROFILE_ENDPOINTS = {
  // 8. Obtener Mi Perfil (Requiere Auth) - CONFIRMADO ✅
  GET_MY_PROFILE: `${API_BASE_URL}/api/profiles/me`,
  
  // 9. Actualizar Mi Perfil (Requiere Auth) - CONFIRMADO ✅
  UPDATE_MY_PROFILE: `${API_BASE_URL}/api/profiles/me`,
  
  // 10. Subir Foto de Perfil (Requiere Auth) - ACTUALIZADO ✅
  UPLOAD_PHOTO: `${API_BASE_URL}/api/profiles/upload-photo`,
  
  // 11. Obtener Mi Tarjeta (Requiere Auth)
  GET_MY_CARD: `${API_BASE_URL}/api/profiles/me/card`,
  
  // 12. Ver Perfil de Otro Usuario (Requiere Auth)
  GET_USER_PROFILE: (userId) => `${API_BASE_URL}/api/profiles/${userId}`,
  
  // 13. Ver Tarjeta de Otro Usuario (Requiere Auth)
  GET_USER_CARD: (userId) => `${API_BASE_URL}/api/profiles/${userId}/card`,
  
  // 14. Buscar Perfiles por Criterios (Requiere Auth) - CONFIRMADO ✅
  SEARCH_CARDS: `${API_BASE_URL}/api/profiles/search`,
  
  // 15. Top Jugadores por Estadísticas (Requiere Auth) - CONFIRMADO ✅
  TOP_GOALS: `${API_BASE_URL}/api/profiles/top-players`,
  
  // 16. Top Jugadores por Asistencias (Requiere Auth)
  TOP_ASSISTS: `${API_BASE_URL}/api/profiles/top/assists`,
  
  // 17. Top Jugadores por Partidos (Requiere Auth)
  TOP_MATCHES: `${API_BASE_URL}/api/profiles/top/matches`,
  
  // 18. Información Básica del Usuario (Requiere Auth) - CONFIRMADO ✅
  GET_USER_INFO: `${API_BASE_URL}/api/users/me`
};

// 🏥 ENDPOINTS DE SALUD Y UTILIDADES
export const HEALTH_ENDPOINTS = {
  // Health Check (Público) - CONFIRMADO ✅
  CHECK: `${API_BASE_URL}/health`,
  
  // Actuator Health (Público)
  ACTUATOR_HEALTH: `${API_BASE_URL}/actuator/health`,
  
  // Ping (Público)
  PING: `${API_BASE_URL}/ping`
};

// 🔧 CONFIGURACIÓN DE HEADERS
export const HEADERS = {
  // Para peticiones JSON
  JSON: {
    'Content-Type': 'application/json'
  },
  
  // Para peticiones autenticadas (JSON)
  AUTH_JSON: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }),
  
  // Para subir archivos (autenticado)
  AUTH_UPLOAD: (token) => ({
    'Authorization': `Bearer ${token}`
    // No incluir Content-Type para FormData
  })
};

// 📝 FUNCIONES DE UTILIDAD PARA REQUESTS
export const createAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

export const createUploadHeaders = (token) => ({
  'Authorization': `Bearer ${token}`
  // FormData establecerá Content-Type automáticamente
});

// 🎯 CONFIGURACIÓN DE BÚSQUEDA
export const SEARCH_PARAMS = {
  // Parámetros disponibles para búsqueda de tarjetas
  POSITION: 'posicion',      // Portero, Defensa, Centrocampista, Delantero
  LEVEL: 'nivel',           // Principiante, Intermedio, Avanzado, Profesional
  LOCATION: 'ubicacion',    // Ciudad o región
  AVAILABLE: 'disponible',  // true/false
  LIMIT: 'limit',          // Número máximo de resultados
  OFFSET: 'offset'         // Para paginación
};

// 🏆 CONFIGURACIÓN DE RANKINGS
export const RANKING_PARAMS = {
  LIMIT: 'limit',    // Número de jugadores a obtener (default: 10)
  OFFSET: 'offset'   // Para paginación
};

// ⚠️ CÓDIGOS DE ERROR COMUNES
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500
};

// 📊 RESPUESTAS DE EJEMPLO
export const EXAMPLE_RESPONSES = {
  // Registro exitoso
  REGISTER_SUCCESS: {
    message: "Usuario registrado exitosamente",
    token: "eyJhbGciOiJIUzI1NiJ9...",
    user: {
      id: 1,
      nombre: "Juan Test",
      email: "juan.test@ejemplo.com"
    }
  },
  
  // Login exitoso
  LOGIN_SUCCESS: {
    message: "Login exitoso",
    token: "eyJhbGciOiJIUzI1NiJ9...",
    user: {
      id: 1,
      nombre: "Juan Test",
      email: "juan.test@ejemplo.com"
    }
  },
  
  // Perfil de usuario
  USER_PROFILE: {
    id: 1,
    nombre: "Juan Test",
    email: "juan.test@ejemplo.com",
    posicion: "Portero",
    nivel: "Intermedio",
    biografia: "Portero experimentado con 5 años jugando",
    ubicacion: "Madrid",
    disponible: true,
    fotoUrl: "/uploads/profiles/1/photo.jpg",
    fechaRegistro: "2025-01-15T10:30:00Z"
  }
};

export default {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  PROFILE_ENDPOINTS,
  HEALTH_ENDPOINTS,
  HEADERS,
  SEARCH_PARAMS,
  RANKING_PARAMS,
  ERROR_CODES,
  EXAMPLE_RESPONSES,
  createAuthHeaders,
  createUploadHeaders
};