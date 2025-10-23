import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
  useTheme,
  Tooltip,
  Divider,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  CalendarToday,
  AccessTime,
  LocationOn,
  Group,
  Euro,
  Edit,
  Delete,
  PersonAdd,
  PersonRemove,
  Cancel,
  CheckCircle,
  Pending,
  ChevronLeft,
  ChevronRight,
  Today,
  Event,
  SportsFootball,
  School,
  EmojiEvents,
  BusinessCenter,
  FilterList
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import calendarService from '../services/calendarService';

// Componente de calendario simple
const CalendarGrid = ({ events, currentDate, onDateChange, onEventClick }) => {
  const theme = useTheme();
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Días en blanco del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Box key={`empty-${i}`} sx={{ 
          minHeight: 100, 
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'action.hover' 
        }} />
      );
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.fecha);
        return eventDate.getDate() === day &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear();
      });

      const isToday = new Date().toDateString() === 
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <Box
          key={day}
          sx={{
            minHeight: 100,
            border: `1px solid ${theme.palette.divider}`,
            p: 1,
            cursor: 'pointer',
            bgcolor: isToday ? theme.palette.primary.light + '20' : 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => onDateChange && onDateChange(day)}
        >
          <Typography
            variant="body2"
            fontWeight={isToday ? 'bold' : 'normal'}
            color={isToday ? 'primary' : 'text.primary'}
            sx={{ mb: 1 }}
          >
            {day}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {dayEvents.slice(0, 2).map(event => (
              <Chip
                key={event.id}
                label={event.titulo}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  bgcolor: event.color || theme.palette.primary.main,
                  color: 'white',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick && onEventClick(event);
                }}
              />
            ))}
            {dayEvents.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{dayEvents.length - 2} más
              </Typography>
            )}
          </Box>
        </Box>
      );
    }

    return days;
  };

  return (
    <Box>
      {/* Días de la semana */}
      <Grid container>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <Grid item xs key={day}>
            <Box sx={{ 
              p: 1, 
              textAlign: 'center', 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 'bold'
            }}>
              <Typography variant="body2">{day}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {/* Días del mes */}
      <Grid container>
        {renderCalendarDays().map((day, index) => (
          <Grid item xs key={index}>
            {day}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const Calendar = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('calendar'); // 'calendar' | 'list' | 'my-events'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Estado para crear evento
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'partido',
    fecha: '',
    hora: '',
    ubicacion: '',
    precio: 0,
    capacidadMaxima: 22
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('🗓️ Calendar: Cargando eventos...');
        const [eventsData, myEventsData] = await Promise.all([
          calendarService.getEvents(currentDate.getMonth() + 1, currentDate.getFullYear()),
          calendarService.getMyEvents()
        ]);
        
        setEvents(eventsData);
        setMyEvents(myEventsData);
        console.log(`✅ Calendar: ${eventsData.length} eventos y ${myEventsData.length} mis eventos cargados`);
      } catch (error) {
        console.error('❌ Error cargando eventos:', error);
        setError('Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDate]);

  const reloadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Calendar: Recargando eventos...');
      const [eventsData, myEventsData] = await Promise.all([
        calendarService.getEvents(currentDate.getMonth() + 1, currentDate.getFullYear()),
        calendarService.getMyEvents()
      ]);
      
      setEvents(eventsData);
      setMyEvents(myEventsData);
      console.log(`✅ Calendar: Eventos recargados`);
    } catch (error) {
      console.error('❌ Error recargando eventos:', error);
      setError('Error al recargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setActionLoading({ create: true });
      console.log('🆕 Creando nuevo evento:', newEvent);
      
      const createdEvent = await calendarService.createEvent(newEvent);
      
      // Agregar el nuevo evento a la lista
      setEvents(prev => [createdEvent, ...prev]);
      
      // Limpiar formulario y cerrar dialog
      setNewEvent({
        titulo: '',
        descripcion: '',
        tipo: 'partido',
        fecha: '',
        hora: '',
        ubicacion: '',
        precio: 0,
        capacidadMaxima: 22
      });
      setCreateDialogOpen(false);
      
      console.log('✅ Evento creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      setError('Error al crear el evento');
    } finally {
      setActionLoading({ create: false });
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      setActionLoading({ [`join_${eventId}`]: true });
      console.log(`🤝 Uniéndose al evento ${eventId}`);
      
      await calendarService.joinEvent(eventId);
      
      // Recargar datos
      await reloadData();
      
      console.log('✅ Te has unido al evento exitosamente');
    } catch (error) {
      console.error('❌ Error uniéndose al evento:', error);
      setError('Error al unirse al evento');
    } finally {
      setActionLoading({ [`join_${eventId}`]: false });
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      setActionLoading({ [`leave_${eventId}`]: true });
      console.log(`🚪 Saliendo del evento ${eventId}`);
      
      await calendarService.leaveEvent(eventId);
      
      // Recargar datos
      await reloadData();
      
      console.log('✅ Has salido del evento exitosamente');
    } catch (error) {
      console.error('❌ Error saliendo del evento:', error);
      setError('Error al salir del evento');
    } finally {
      setActionLoading({ [`leave_${eventId}`]: false });
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'partido': return <SportsFootball />;
      case 'entrenamiento': return <School />;
      case 'torneo': return <EmojiEvents />;
      case 'reunion': return <BusinessCenter />;
      default: return <Event />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'partido': return 'success';
      case 'entrenamiento': return 'primary';
      case 'torneo': return 'warning';
      case 'reunion': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado': return <CheckCircle color="success" />;
      case 'pendiente': return <Pending color="warning" />;
      case 'cancelado': return <Cancel color="error" />;
      default: return <Event />;
    }
  };

  const isUserInEvent = (event) => {
    return myEvents.some(myEvent => myEvent.id === event.id);
  };

  const isUserOrganizer = (event) => {
    return event.organizador?.email === user?.email || event.organizador?.id === user?.id;
  };

  const filteredEvents = filterType ? events.filter(event => event.tipo === filterType) : events;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando calendario...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          📅 Calendario
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Gestiona tus eventos deportivos y actividades
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Controles del calendario */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigateMonth(-1)} size="large">
                <ChevronLeft />
              </IconButton>
              <Typography variant="h5" fontWeight="600" sx={{ minWidth: 200, textAlign: 'center' }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Typography>
              <IconButton onClick={() => navigateMonth(1)} size="large">
                <ChevronRight />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<Today />}
                onClick={goToToday}
                size="small"
              >
                Hoy
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={view === 'calendar' ? 'contained' : 'outlined'}
                onClick={() => setView('calendar')}
                startIcon={<CalendarToday />}
                size="small"
              >
                Calendario
              </Button>
              <Button
                variant={view === 'list' ? 'contained' : 'outlined'}
                onClick={() => setView('list')}
                startIcon={<Event />}
                size="small"
              >
                Lista
              </Button>
              <Button
                variant={view === 'my-events' ? 'contained' : 'outlined'}
                onClick={() => setView('my-events')}
                startIcon={<Group />}
                size="small"
              >
                Mis Eventos ({myEvents.length})
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filtro</InputLabel>
                <Select
                  value={filterType}
                  label="Filtro"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="partido">Partidos</MenuItem>
                  <MenuItem value="entrenamiento">Entrenamientos</MenuItem>
                  <MenuItem value="torneo">Torneos</MenuItem>
                  <MenuItem value="reunion">Reuniones</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Vista de Calendario */}
      {view === 'calendar' && (
        <Paper sx={{ mb: 4 }}>
          <CalendarGrid
            events={filteredEvents}
            currentDate={currentDate}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setEventDialogOpen(true);
            }}
          />
        </Paper>
      )}

      {/* Vista de Lista */}
      {view === 'list' && (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr: 1 }}>
                      {getEventTypeIcon(event.tipo)}
                      <Typography variant="h6" fontWeight="600" sx={{ ml: 1 }}>
                        {event.titulo}
                      </Typography>
                    </Box>
                    <Chip
                      label={event.tipo}
                      color={getEventTypeColor(event.tipo)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.descripcion}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(event.fecha).toLocaleDateString()} • {event.hora}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.ubicacion}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Group sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {event.participantes} participantes
                      </Typography>
                    </Box>
                    {event.precio > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Euro sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          €{event.precio}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(event.estado)}
                    <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {event.estado}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={event.organizador?.avatar}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {event.organizador?.nombre?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="500">
                      {event.organizador?.nombre}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isUserOrganizer(event) ? (
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        variant="outlined"
                        sx={{ flex: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Cancel />}
                        variant="outlined"
                        color="error"
                        sx={{ flex: 1 }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  ) : isUserInEvent(event) ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={actionLoading[`leave_${event.id}`] ? <CircularProgress size={16} /> : <PersonRemove />}
                      onClick={() => handleLeaveEvent(event.id)}
                      disabled={actionLoading[`leave_${event.id}`]}
                    >
                      Salir del Evento
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={actionLoading[`join_${event.id}`] ? <CircularProgress size={16} /> : <PersonAdd />}
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={actionLoading[`join_${event.id}`]}
                    >
                      Unirse al Evento
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vista de Mis Eventos */}
      {view === 'my-events' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Mis Próximos Eventos
            </Typography>
            <List>
              {myEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getEventTypeIcon(event.tipo)}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.titulo}
                      secondary={`${new Date(event.fecha).toLocaleDateString()} • ${event.hora} • ${event.rol}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={event.tipo}
                        color={getEventTypeColor(event.tipo)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < myEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {myEvents.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No tienes eventos próximos"
                    secondary="Únete a eventos disponibles o crea uno nuevo"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* FAB para crear evento */}
      <Fab
        color="primary"
        aria-label="crear evento"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Dialog para crear evento */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🆕 Crear Nuevo Evento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del evento"
                  value={newEvent.titulo}
                  onChange={(e) => setNewEvent({ ...newEvent, titulo: e.target.value })}
                  placeholder="ej: Partido de Fútbol 11vs11"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={newEvent.descripcion}
                  onChange={(e) => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                  placeholder="Describe el evento, actividades, etc."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de evento</InputLabel>
                  <Select
                    value={newEvent.tipo}
                    label="Tipo de evento"
                    onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value })}
                  >
                    <MenuItem value="partido">Partido</MenuItem>
                    <MenuItem value="entrenamiento">Entrenamiento</MenuItem>
                    <MenuItem value="torneo">Torneo</MenuItem>
                    <MenuItem value="reunion">Reunión</MenuItem>
                    <MenuItem value="clinica">Clínica/Curso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  value={newEvent.fecha}
                  onChange={(e) => setNewEvent({ ...newEvent, fecha: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora"
                  value={newEvent.hora}
                  onChange={(e) => setNewEvent({ ...newEvent, hora: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  value={newEvent.ubicacion}
                  onChange={(e) => setNewEvent({ ...newEvent, ubicacion: e.target.value })}
                  placeholder="Lugar donde se realizará el evento"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Precio (€)"
                  value={newEvent.precio}
                  onChange={(e) => setNewEvent({ ...newEvent, precio: parseFloat(e.target.value) })}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Capacidad máxima"
                  value={newEvent.capacidadMaxima}
                  onChange={(e) => setNewEvent({ ...newEvent, capacidadMaxima: parseInt(e.target.value) })}
                  inputProps={{ min: 2, max: 100 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateEvent}
            disabled={!newEvent.titulo || !newEvent.fecha || !newEvent.hora || actionLoading.create}
            startIcon={actionLoading.create ? <CircularProgress size={16} /> : <Add />}
          >
            Crear Evento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para detalles del evento */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEventTypeIcon(selectedEvent.tipo)}
                {selectedEvent.titulo}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedEvent.descripcion}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(selectedEvent.fecha).toLocaleDateString()} • {selectedEvent.hora}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedEvent.ubicacion}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedEvent.participantes} participantes
                    </Typography>
                  </Box>
                </Grid>
                {selectedEvent.precio > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Euro sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        €{selectedEvent.precio}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={selectedEvent.organizador?.avatar}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  {selectedEvent.organizador?.nombre?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    Organizador: {selectedEvent.organizador?.nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(selectedEvent.estado)}
                    <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      Estado: {selectedEvent.estado}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEventDialogOpen(false)}>
                Cerrar
              </Button>
              {!isUserOrganizer(selectedEvent) && (
                isUserInEvent(selectedEvent) ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PersonRemove />}
                    onClick={() => {
                      handleLeaveEvent(selectedEvent.id);
                      setEventDialogOpen(false);
                    }}
                  >
                    Salir del Evento
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                      handleJoinEvent(selectedEvent.id);
                      setEventDialogOpen(false);
                    }}
                  >
                    Unirse al Evento
                  </Button>
                )
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Calendar;