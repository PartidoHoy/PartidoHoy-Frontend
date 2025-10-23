import api from './api';

const teamService = {
  // Obtener todos los equipos
  getTeams: async () => {
    try {
      console.log('🔍 TeamService: Obteniendo equipos...');
      const response = await api.get('/api/teams');
      console.log('✅ TeamService: Equipos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error obteniendo equipos:', error);
      
      // Datos mock para desarrollo
      return [
        {
          id: 1,
          nombre: 'FC Barcelona Amateurs',
          descripcion: 'Equipo amateur de Barcelona para jugadores de nivel intermedio',
          ciudad: 'Barcelona',
          categoria: 'Intermedio',
          miembros: 15,
          miembrosMax: 22,
          fechaCreacion: '2024-01-15',
          capitan: {
            id: 1,
            nombre: 'Carlos Martínez',
            email: 'carlos@example.com',
            avatar: '/avatars/carlos.jpg'
          },
          logo: '/team-logos/fcb-amateurs.png',
          estado: 'activo',
          proximoPartido: {
            fecha: '2024-01-20',
            rival: 'Real Madrid Aficionados',
            ubicacion: 'Complejo Deportivo Barcelona'
          },
          estadisticas: {
            partidosJugados: 12,
            victorias: 8,
            empates: 2,
            derrotas: 2,
            golesAFavor: 28,
            golesEnContra: 15
          },
          miembrosData: [
            {
              id: 1,
              nombre: 'Carlos Martínez',
              posicion: 'Portero',
              numero: 1,
              avatar: '/avatars/carlos.jpg',
              rol: 'Capitán'
            },
            {
              id: 2,
              nombre: 'Luis García',
              posicion: 'Defensa',
              numero: 4,
              avatar: '/avatars/luis.jpg',
              rol: 'Miembro'
            },
            {
              id: 3,
              nombre: 'Ana Rodríguez',
              posicion: 'Mediocampista',
              numero: 8,
              avatar: '/avatars/ana.jpg',
              rol: 'Vicecapitán'
            }
          ]
        },
        {
          id: 2,
          nombre: 'Real Madrid Aficionados',
          descripcion: 'Equipo de aficionados del Real Madrid para competiciones locales',
          ciudad: 'Madrid',
          categoria: 'Avanzado',
          miembros: 18,
          miembrosMax: 25,
          fechaCreacion: '2023-12-01',
          capitan: {
            id: 4,
            nombre: 'Miguel Santos',
            email: 'miguel@example.com',
            avatar: '/avatars/miguel.jpg'
          },
          logo: '/team-logos/rm-aficionados.png',
          estado: 'activo',
          proximoPartido: {
            fecha: '2024-01-20',
            rival: 'FC Barcelona Amateurs',
            ubicacion: 'Campo Municipal Madrid'
          },
          estadisticas: {
            partidosJugados: 15,
            victorias: 11,
            empates: 3,
            derrotas: 1,
            golesAFavor: 35,
            golesEnContra: 12
          },
          miembrosData: [
            {
              id: 4,
              nombre: 'Miguel Santos',
              posicion: 'Delantero',
              numero: 9,
              avatar: '/avatars/miguel.jpg',
              rol: 'Capitán'
            },
            {
              id: 5,
              nombre: 'Sandra López',
              posicion: 'Mediocampista',
              numero: 10,
              avatar: '/avatars/sandra.jpg',
              rol: 'Vicecapitán'
            }
          ]
        },
        {
          id: 3,
          nombre: 'Valencia CF Amateur',
          descripcion: 'Equipo amateur de Valencia para jugadores principiantes y novatos',
          ciudad: 'Valencia',
          categoria: 'Principiante',
          miembros: 12,
          miembrosMax: 20,
          fechaCreacion: '2024-01-10',
          capitan: {
            id: 6,
            nombre: 'David Ruiz',
            email: 'david@example.com',
            avatar: '/avatars/david.jpg'
          },
          logo: '/team-logos/valencia-amateur.png',
          estado: 'reclutando',
          proximoPartido: null,
          estadisticas: {
            partidosJugados: 5,
            victorias: 2,
            empates: 1,
            derrotas: 2,
            golesAFavor: 8,
            golesEnContra: 10
          },
          miembrosData: [
            {
              id: 6,
              nombre: 'David Ruiz',
              posicion: 'Mediocampista',
              numero: 6,
              avatar: '/avatars/david.jpg',
              rol: 'Capitán'
            }
          ]
        }
      ];
    }
  },

  // Crear nuevo equipo
  createTeam: async (teamData) => {
    try {
      console.log('🆕 TeamService: Creando equipo:', teamData);
      const response = await api.post('/api/teams', teamData);
      console.log('✅ TeamService: Equipo creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error creando equipo:', error);
      
      // Simular creación exitosa
      const newTeam = {
        id: Date.now(),
        ...teamData,
        miembros: 1,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estado: 'activo',
        estadisticas: {
          partidosJugados: 0,
          victorias: 0,
          empates: 0,
          derrotas: 0,
          golesAFavor: 0,
          golesEnContra: 0
        },
        miembrosData: []
      };
      
      return newTeam;
    }
  },

  // Unirse a un equipo
  joinTeam: async (teamId) => {
    try {
      console.log(`🤝 TeamService: Uniéndose al equipo ${teamId}`);
      const response = await api.post(`/api/teams/${teamId}/join`);
      console.log('✅ TeamService: Se unió al equipo exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error uniéndose al equipo:', error);
      throw error;
    }
  },

  // Salir de un equipo
  leaveTeam: async (teamId) => {
    try {
      console.log(`🚪 TeamService: Saliendo del equipo ${teamId}`);
      const response = await api.post(`/api/teams/${teamId}/leave`);
      console.log('✅ TeamService: Salió del equipo exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error saliendo del equipo:', error);
      throw error;
    }
  },

  // Obtener equipos del usuario
  getMyTeams: async () => {
    try {
      console.log('🔍 TeamService: Obteniendo mis equipos...');
      const response = await api.get('/api/teams/my-teams');
      console.log('✅ TeamService: Mis equipos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error obteniendo mis equipos:', error);
      
      // Datos mock
      return [
        {
          id: 1,
          nombre: 'FC Barcelona Amateurs',
          rol: 'Miembro',
          fechaUnion: '2024-01-15'
        }
      ];
    }
  },

  // Obtener detalles de un equipo
  getTeamDetails: async (teamId) => {
    try {
      console.log(`🔍 TeamService: Obteniendo detalles del equipo ${teamId}`);
      const response = await api.get(`/api/teams/${teamId}`);
      console.log('✅ TeamService: Detalles del equipo obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error obteniendo detalles del equipo:', error);
      throw error;
    }
  },

  // Actualizar equipo
  updateTeam: async (teamId, teamData) => {
    try {
      console.log(`📝 TeamService: Actualizando equipo ${teamId}:`, teamData);
      const response = await api.put(`/api/teams/${teamId}`, teamData);
      console.log('✅ TeamService: Equipo actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error actualizando equipo:', error);
      throw error;
    }
  },

  // Eliminar equipo
  deleteTeam: async (teamId) => {
    try {
      console.log(`🗑️ TeamService: Eliminando equipo ${teamId}`);
      const response = await api.delete(`/api/teams/${teamId}`);
      console.log('✅ TeamService: Equipo eliminado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error eliminando equipo:', error);
      throw error;
    }
  },

  // Invitar jugador al equipo
  invitePlayer: async (teamId, playerEmail) => {
    try {
      console.log(`📧 TeamService: Invitando jugador ${playerEmail} al equipo ${teamId}`);
      const response = await api.post(`/api/teams/${teamId}/invite`, { email: playerEmail });
      console.log('✅ TeamService: Invitación enviada exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error enviando invitación:', error);
      throw error;
    }
  },

  // Expulsar miembro del equipo
  removeMember: async (teamId, memberId) => {
    try {
      console.log(`🚫 TeamService: Expulsando miembro ${memberId} del equipo ${teamId}`);
      const response = await api.delete(`/api/teams/${teamId}/members/${memberId}`);
      console.log('✅ TeamService: Miembro expulsado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error expulsando miembro:', error);
      throw error;
    }
  },

  // Transferir capitanía
  transferCaptaincy: async (teamId, newCaptainId) => {
    try {
      console.log(`👑 TeamService: Transfiriendo capitanía del equipo ${teamId} a ${newCaptainId}`);
      const response = await api.post(`/api/teams/${teamId}/transfer-captaincy`, { newCaptainId });
      console.log('✅ TeamService: Capitanía transferida exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error transfiriendo capitanía:', error);
      throw error;
    }
  },

  // Buscar equipos con filtros
  searchTeams: async (filters = {}) => {
    try {
      console.log('🔍 TeamService: Buscando equipos con filtros:', filters);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/teams/search?${params}`);
      console.log('✅ TeamService: Búsqueda de equipos completada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TeamService Error buscando equipos:', error);
      
      // Retornar datos mock filtrados
      const allTeams = await teamService.getTeams();
      let filteredTeams = allTeams;

      if (filters.ciudad) {
        filteredTeams = filteredTeams.filter(team => 
          team.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())
        );
      }

      if (filters.categoria) {
        filteredTeams = filteredTeams.filter(team => team.categoria === filters.categoria);
      }

      if (filters.busqueda) {
        filteredTeams = filteredTeams.filter(team =>
          team.nombre.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
          team.descripcion.toLowerCase().includes(filters.busqueda.toLowerCase())
        );
      }

      return filteredTeams;
    }
  }
};

export default teamService;