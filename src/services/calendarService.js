import api from './api';

const calendarService = {
  // Obtener eventos del calendario
  getEvents: async (month, year) => {
    console.log(`🗓️ CalendarService: Obteniendo eventos para ${month}/${year}`);
    const response = await api.get('/api/calendar/events', {
      params: { month, year }
    });
    console.log('✅ CalendarService: Eventos obtenidos:', response.data);
    return response.data;
  },

  // Obtener eventos del usuario
  getMyEvents: async () => {
    console.log('🔍 CalendarService: Obteniendo mis eventos...');
    const response = await api.get('/api/calendar/my-events');
    console.log('✅ CalendarService: Mis eventos obtenidos:', response.data);
    return response.data;
  },

  // Crear nuevo evento
  createEvent: async (eventData) => {
    console.log('🆕 CalendarService: Creando evento:', eventData);
    const response = await api.post('/api/calendar/events', eventData);
    console.log('✅ CalendarService: Evento creado:', response.data);
    return response.data;
  },

  // Unirse a evento
  joinEvent: async (eventId) => {
    try {
      console.log(`🤝 CalendarService: Uniéndose al evento ${eventId}`);
      // Enviar un body vacío explícito para evitar 403 si el backend lo requiere
      const response = await api.post(`/api/calendar/events/${eventId}/join`, {});
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
    console.log('🔍 CalendarService: Buscando eventos con filtros:', filters);
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/calendar/events/search?${params}`);
    console.log('✅ CalendarService: Búsqueda de eventos completada:', response.data);
    return response.data;
  },

  // Obtener eventos próximos
  getUpcomingEvents: async (limit = 5) => {
    console.log(`🔮 CalendarService: Obteniendo próximos ${limit} eventos`);
    const response = await api.get('/api/calendar/events/upcoming', {
      params: { limit }
    });
    console.log('✅ CalendarService: Próximos eventos obtenidos:', response.data);
    return response.data;
  },

  // Obtener estadísticas del calendario
  getCalendarStats: async () => {
    console.log('📊 CalendarService: Obteniendo estadísticas del calendario');
    const response = await api.get('/api/calendar/stats');
    console.log('✅ CalendarService: Estadísticas obtenidas:', response.data);
    return response.data;
  }
};

export default calendarService;