import api from './api';

const calendarService = {
  // Obtener eventos del calendario
  getEvents: async (month, year) => {
    try {
      console.log(`🗓️ CalendarService: Obteniendo eventos para ${month}/${year}`);
      const response = await api.get('/api/calendar/events', {
        params: { month, year }
      });
      console.log('✅ CalendarService: Eventos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error obteniendo eventos:', error);
      
      // Datos mock para desarrollo
      const mockEvents = [
        {
          id: 1,
          titulo: 'Partido vs Real Madrid Aficionados',
          tipo: 'partido',
          fecha: '2024-01-20',
          hora: '18:00',
          ubicacion: 'Complejo Deportivo Barcelona',
          descripcion: 'Partido amistoso entre equipos amateur',
          equipoLocal: 'FC Barcelona Amateurs',
          equipoVisitante: 'Real Madrid Aficionados',
          estado: 'confirmado',
          organizador: {
            id: 1,
            nombre: 'Carlos Martínez',
            avatar: '/avatars/carlos.jpg'
          },
          participantes: 22,
          color: '#4caf50'
        },
        {
          id: 2,
          titulo: 'Entrenamiento Semanal',
          tipo: 'entrenamiento',
          fecha: '2024-01-22',
          hora: '19:30',
          ubicacion: 'Campo Municipal Norte',
          descripcion: 'Entrenamiento regular del equipo',
          equipo: 'FC Barcelona Amateurs',
          estado: 'confirmado',
          organizador: {
            id: 1,
            nombre: 'Carlos Martínez',
            avatar: '/avatars/carlos.jpg'
          },
          participantes: 15,
          color: '#2196f3'
        },
        {
          id: 3,
          titulo: 'Torneo Inter-Barrios',
          tipo: 'torneo',
          fecha: '2024-01-25',
          hora: '10:00',
          ubicacion: 'Polideportivo Central',
          descripcion: 'Torneo de fútbol 7 entre barrios de la ciudad',
          estado: 'abierto',
          organizador: {
            id: 2,
            nombre: 'Ayuntamiento Barcelona',
            avatar: '/avatars/ayuntamiento.jpg'
          },
          participantes: 120,
          equiposInscritos: 16,
          color: '#ff9800'
        },
        {
          id: 4,
          titulo: 'Reunión de Capitanes',
          tipo: 'reunion',
          fecha: '2024-01-18',
          hora: '20:00',
          ubicacion: 'Bar Central',
          descripcion: 'Reunión mensual de capitanes de equipos locales',
          estado: 'confirmado',
          organizador: {
            id: 3,
            nombre: 'Liga Amateur Barcelona',
            avatar: '/avatars/liga.jpg'
          },
          participantes: 8,
          color: '#9c27b0'
        },
        {
          id: 5,
          titulo: 'Partido de Futsal',
          tipo: 'partido',
          fecha: '2024-01-28',
          hora: '21:00',
          ubicacion: 'Pabellón Deportivo Sur',
          descripcion: 'Partido de futsal indoor',
          equipoLocal: 'Valencia CF Amateur',
          equipoVisitante: 'Levante UD Amateur',
          estado: 'pendiente',
          organizador: {
            id: 6,
            nombre: 'David Ruiz',
            avatar: '/avatars/david.jpg'
          },
          participantes: 10,
          color: '#f44336'
        },
        {
          id: 6,
          titulo: 'Clinic de Técnica',
          tipo: 'clinica',
          fecha: '2024-01-30',
          hora: '17:00',
          ubicacion: 'Academia Fútbol Pro',
          descripcion: 'Clínica de mejora técnica para jugadores amateur',
          instructor: 'Juan Pérez (Ex-profesional)',
          estado: 'abierto',
          organizador: {
            id: 7,
            nombre: 'Academia Fútbol Pro',
            avatar: '/avatars/academia.jpg'
          },
          participantes: 25,
          precio: 15,
          color: '#795548'
        }
      ];

      // Filtrar por mes y año si se proporciona
      if (month && year) {
        return mockEvents.filter(event => {
          const eventDate = new Date(event.fecha);
          return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
        });
      }

      return mockEvents;
    }
  },

  // Obtener eventos del usuario
  getMyEvents: async () => {
    try {
      console.log('🔍 CalendarService: Obteniendo mis eventos...');
      const response = await api.get('/api/calendar/my-events');
      console.log('✅ CalendarService: Mis eventos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error obteniendo mis eventos:', error);
      
      // Mock de eventos del usuario
      return [
        {
          id: 1,
          titulo: 'Partido vs Real Madrid Aficionados',
          tipo: 'partido',
          fecha: '2024-01-20',
          hora: '18:00',
          rol: 'jugador'
        },
        {
          id: 2,
          titulo: 'Entrenamiento Semanal',
          tipo: 'entrenamiento',
          fecha: '2024-01-22',
          hora: '19:30',
          rol: 'jugador'
        }
      ];
    }
  },

  // Crear nuevo evento
  createEvent: async (eventData) => {
    try {
      console.log('🆕 CalendarService: Creando evento:', eventData);
      const response = await api.post('/api/calendar/events', eventData);
      console.log('✅ CalendarService: Evento creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error creando evento:', error);
      
      // Simular creación exitosa
      const newEvent = {
        id: Date.now(),
        ...eventData,
        estado: 'confirmado',
        participantes: 1,
        organizador: {
          id: 1,
          nombre: 'Usuario Actual',
          avatar: '/avatars/user.jpg'
        }
      };
      
      return newEvent;
    }
  },

  // Unirse a evento
  joinEvent: async (eventId) => {
    try {
      console.log(`🤝 CalendarService: Uniéndose al evento ${eventId}`);
      const response = await api.post(`/api/calendar/events/${eventId}/join`);
      console.log('✅ CalendarService: Se unió al evento exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error uniéndose al evento:', error);
      throw error;
    }
  },

  // Salir de evento
  leaveEvent: async (eventId) => {
    try {
      console.log(`🚪 CalendarService: Saliendo del evento ${eventId}`);
      const response = await api.post(`/api/calendar/events/${eventId}/leave`);
      console.log('✅ CalendarService: Salió del evento exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error saliendo del evento:', error);
      throw error;
    }
  },

  // Obtener detalles de evento
  getEventDetails: async (eventId) => {
    try {
      console.log(`🔍 CalendarService: Obteniendo detalles del evento ${eventId}`);
      const response = await api.get(`/api/calendar/events/${eventId}`);
      console.log('✅ CalendarService: Detalles del evento obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error obteniendo detalles del evento:', error);
      throw error;
    }
  },

  // Actualizar evento
  updateEvent: async (eventId, eventData) => {
    try {
      console.log(`📝 CalendarService: Actualizando evento ${eventId}:`, eventData);
      const response = await api.put(`/api/calendar/events/${eventId}`, eventData);
      console.log('✅ CalendarService: Evento actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error actualizando evento:', error);
      throw error;
    }
  },

  // Cancelar evento
  cancelEvent: async (eventId, reason = '') => {
    try {
      console.log(`❌ CalendarService: Cancelando evento ${eventId}`);
      const response = await api.post(`/api/calendar/events/${eventId}/cancel`, { reason });
      console.log('✅ CalendarService: Evento cancelado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error cancelando evento:', error);
      throw error;
    }
  },

  // Buscar eventos disponibles
  searchEvents: async (filters = {}) => {
    try {
      console.log('🔍 CalendarService: Buscando eventos con filtros:', filters);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/calendar/events/search?${params}`);
      console.log('✅ CalendarService: Búsqueda de eventos completada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error buscando eventos:', error);
      
      // Filtrar eventos mock
      const allEvents = await calendarService.getEvents();
      let filteredEvents = allEvents;

      if (filters.tipo) {
        filteredEvents = filteredEvents.filter(event => event.tipo === filters.tipo);
      }

      if (filters.fecha) {
        filteredEvents = filteredEvents.filter(event => event.fecha === filters.fecha);
      }

      if (filters.ubicacion) {
        filteredEvents = filteredEvents.filter(event =>
          event.ubicacion.toLowerCase().includes(filters.ubicacion.toLowerCase())
        );
      }

      if (filters.estado) {
        filteredEvents = filteredEvents.filter(event => event.estado === filters.estado);
      }

      return filteredEvents;
    }
  },

  // Obtener eventos próximos
  getUpcomingEvents: async (limit = 5) => {
    try {
      console.log(`🔮 CalendarService: Obteniendo próximos ${limit} eventos`);
      const response = await api.get('/api/calendar/events/upcoming', {
        params: { limit }
      });
      console.log('✅ CalendarService: Próximos eventos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error obteniendo próximos eventos:', error);
      
      // Mock de próximos eventos
      const allEvents = await calendarService.getEvents();
      const now = new Date();
      
      return allEvents
        .filter(event => new Date(event.fecha) >= now)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(0, limit);
    }
  },

  // Obtener estadísticas del calendario
  getCalendarStats: async () => {
    try {
      console.log('📊 CalendarService: Obteniendo estadísticas del calendario');
      const response = await api.get('/api/calendar/stats');
      console.log('✅ CalendarService: Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService Error obteniendo estadísticas:', error);
      
      // Mock de estadísticas
      return {
        totalEventos: 25,
        eventosEstesMes: 8,
        partidosJugados: 12,
        entrenamientosAsistidos: 18,
        proximosEventos: 3,
        eventosPorTipo: {
          partido: 12,
          entrenamiento: 8,
          torneo: 3,
          reunion: 2
        }
      };
    }
  }
};

export default calendarService;