const API_BASE_URL = 'http://localhost:8080';

export const authService = {
  // 📝 REGISTRO
  register: async (nombre, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      // Intentar leer el error como JSON, si falla usar texto
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no es JSON válido, leer como texto
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  },

  // 🔐 LOGIN
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      // Intentar leer el error como JSON, si falla usar texto
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
    
    // Guardar token automáticamente
    if (data.token) {
      localStorage.setItem('jwt', data.token);
    }
    
    return data;
  },

  // 🚪 LOGOUT
  logout: () => {
    localStorage.removeItem('jwt');
  },

  // 👤 VERIFICAR AUTENTICACIÓN
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt');
  },

  // 📊 OBTENER USUARIO ACTUAL (usando fetch para consistencia)
  getCurrentUser: async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // Limpiar token inválido
      localStorage.removeItem('jwt');
      throw new Error('Error getting user info');
    }
    
    return await response.json();
  }
};