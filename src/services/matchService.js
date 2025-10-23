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
      
      const response = await fetch(`http://localhost:8080/api/partidos?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const matches = await response.json();
        console.log('✅ getMatches success:', matches);
        return Array.isArray(matches) ? matches : matches.data || [];
      } else {
        // Fallback con datos de ejemplo
        console.log('⚠️ Endpoint no disponible, usando datos de ejemplo');
        return mockMatches;
      }
    } catch (error) {
      console.warn('⚠️ getMatches error:', error.message);
      return mockMatches;
    }
  },

  // 🆕 CREAR NUEVO PARTIDO
  createMatch: async (matchData) => {
    try {
      const response = await fetch('http://localhost:8080/api/partidos', {
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
      const response = await fetch(`http://localhost:8080/api/partidos/${matchId}/unirse`, {
        method: 'POST',
        headers: getAuthHeaders()
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
      const response = await fetch(`http://localhost:8080/api/partidos/${matchId}/salir`, {
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

  // 📋 OBTENER MIS PARTIDOS
  getMyMatches: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/partidos/mis-partidos', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const matches = await response.json();
        console.log('✅ getMyMatches success:', matches);
        return Array.isArray(matches) ? matches : matches.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.warn('⚠️ getMyMatches error:', error.message);
      return [];
    }
  },

  // 📊 OBTENER DETALLES DE PARTIDO
  getMatchDetails: async (matchId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/partidos/${matchId}`, {
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
      const response = await fetch(`http://localhost:8080/api/partidos/${matchId}`, {
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
      const response = await fetch(`http://localhost:8080/api/partidos/${matchId}/cancelar`, {
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

// 📝 DATOS DE EJEMPLO PARA DESARROLLO
const mockMatches = [
  {
    id: 1,
    titulo: 'Partido de Fútbol 5vs5',
    descripcion: 'Partido amistoso en cancha de césped sintético',
    fecha: '2024-10-20',
    hora: '18:00',
    ubicacion: 'Complejo Deportivo Los Álamos',
    direccion: 'Av. Principal 123, Madrid',
    ciudad: 'Madrid',
    capacidadMaxima: 10,
    jugadoresActuales: 6,
    precio: 15,
    nivelRequerido: 'Intermedio',
    tipoCancha: 'Césped sintético',
    estado: 'abierto',
    organizador: {
      id: 1,
      nombre: 'Carlos Rodríguez',
      avatar: '',
      rating: 4.8
    },
    jugadores: [
      { id: 1, nombre: 'Carlos Rodríguez', posicion: 'Delantero' },
      { id: 2, nombre: 'Ana García', posicion: 'Mediocampista' },
      { id: 3, nombre: 'Miguel Torres', posicion: 'Defensa' },
      { id: 4, nombre: 'Laura Martínez', posicion: 'Portera' },
      { id: 5, nombre: 'Diego López', posicion: 'Mediocampista' },
      { id: 6, nombre: 'Sofia Ruiz', posicion: 'Delantera' }
    ],
    etiquetas: ['Amistoso', 'Fútbol 5', 'Césped sintético'],
    createdAt: '2024-10-16T10:00:00Z',
    updatedAt: '2024-10-16T10:00:00Z'
  },
  {
    id: 2,
    titulo: 'Torneo Relámpago',
    descripcion: 'Torneo de eliminación directa, premios para los ganadores',
    fecha: '2024-10-25',
    hora: '16:00',
    ubicacion: 'Polideportivo Municipal',
    direccion: 'Calle del Deporte 45, Barcelona',
    ciudad: 'Barcelona',
    capacidadMaxima: 16,
    jugadoresActuales: 12,
    precio: 25,
    nivelRequerido: 'Avanzado',
    tipoCancha: 'Césped natural',
    estado: 'abierto',
    organizador: {
      id: 2,
      nombre: 'Ana García',
      avatar: '',
      rating: 4.6
    },
    jugadores: [],
    etiquetas: ['Torneo', 'Competitivo', 'Premios'],
    createdAt: '2024-10-15T14:30:00Z',
    updatedAt: '2024-10-15T14:30:00Z'
  },
  {
    id: 3,
    titulo: 'Fútbol Femenino 7vs7',
    descripcion: 'Partido exclusivo para mujeres, todos los niveles bienvenidos',
    fecha: '2024-10-22',
    hora: '19:30',
    ubicacion: 'Centro Deportivo Femenino',
    direccion: 'Plaza de las Flores 12, Valencia',
    ciudad: 'Valencia',
    capacidadMaxima: 14,
    jugadoresActuales: 8,
    precio: 12,
    nivelRequerido: 'Todos los niveles',
    tipoCancha: 'Césped sintético',
    estado: 'abierto',
    organizador: {
      id: 3,
      nombre: 'Laura Martínez',
      avatar: '',
      rating: 4.9
    },
    jugadores: [],
    etiquetas: ['Femenino', 'Inclusivo', 'Fútbol 7'],
    createdAt: '2024-10-14T09:15:00Z',
    updatedAt: '2024-10-14T09:15:00Z'
  }
];

export default matchService;