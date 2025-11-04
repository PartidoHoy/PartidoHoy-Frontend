// 🔧 OBTENER HEADERS DE AUTORIZACIÓN
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const matchService = {
  // 🏈 OBTENER LISTA DE PARTIDOS
  getMatches: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.ciudad) queryParams.append('ciudad', filters.ciudad);
      if (filters.fecha) queryParams.append('fecha', filters.fecha);
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.nivel) queryParams.append('nivel', filters.nivel);
      const response = await fetch(`http://localhost:8080/api/matches?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const matches = await response.json();
        console.log('✅ getMatches success:', matches);
        return Array.isArray(matches) ? matches : matches.data || [];
      } else {
        // No fallback, solo datos reales
        console.error('❌ getMatches error:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('❌ getMatches error:', error);
      return [];
    }
  },

  // 🆕 CREAR NUEVO PARTIDO
  createMatch: async (matchData) => {
    try {
  const response = await fetch('http://localhost:8080/api/matches', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(matchData)
      });
      
      if (response.ok) {
        const newMatch = await response.json();
        console.log('✅ createMatch success:', newMatch);
        return newMatch;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ createMatch error:', error);
      throw error;
    }
  },

  // 🤝 UNIRSE A PARTIDO
  joinMatch: async (matchId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/matches/${matchId}/join`, {
        method: 'POST',
        headers: getAuthHeaders()
        // No body
      });
      if (response.ok) {
        const result = await response.json();
        console.log('✅ joinMatch success:', result);
        return result;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ joinMatch error:', error);
      throw error;
    }
  },

  // 🚪 SALIR DE PARTIDO
  leaveMatch: async (matchId) => {
    try {
  const response = await fetch(`http://localhost:8080/api/matches/${matchId}/salir`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ leaveMatch success:', result);
        return result;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ leaveMatch error:', error);
      throw error;
    }
  },

  // 📋 OBTENER MIS PARTIDOS (partidos en los que el usuario participa o ha creado)
  getMyMatches: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/matches/my', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const matches = await response.json();
        console.log('✅ getMyMatches success:', matches);
        return Array.isArray(matches) ? matches : matches.data || [];
      } else {
        console.error('❌ getMyMatches error:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('❌ getMyMatches error:', error);
      return [];
    }
  },

  // 📊 OBTENER DETALLES DE PARTIDO
  getMatchDetails: async (matchId) => {
    try {
  const response = await fetch(`http://localhost:8080/api/matches/${matchId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const match = await response.json();
        console.log('✅ getMatchDetails success:', match);
        return match;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ getMatchDetails error:', error);
      throw error;
    }
  },

  // ✏️ ACTUALIZAR PARTIDO
  updateMatch: async (matchId, updateData) => {
    try {
  const response = await fetch(`http://localhost:8080/api/matches/${matchId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const updatedMatch = await response.json();
        console.log('✅ updateMatch success:', updatedMatch);
        return updatedMatch;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ updateMatch error:', error);
      throw error;
    }
  },

  // 🗑️ CANCELAR PARTIDO
  cancelMatch: async (matchId) => {
    try {
  const response = await fetch(`http://localhost:8080/api/matches/${matchId}/cancelar`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ cancelMatch success:', result);
        return result;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ cancelMatch error:', error);
      throw error;
    }
  }
};

// No mockMatches, solo datos reales
export default matchService;