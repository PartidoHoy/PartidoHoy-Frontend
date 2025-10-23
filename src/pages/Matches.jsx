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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Fab,
  useTheme,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import {
  Search,
  Add,
  LocationOn,
  AccessTime,
  Group,
  Euro,
  Star,
  SportsSoccer,
  FilterList,
  PersonAdd,
  PersonRemove,
  Edit,
  Cancel,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import matchService from '../services/matchService';

const Matches = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('abierto');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Estado para crear partido
  const [newMatch, setNewMatch] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    direccion: '',
    ciudad: '',
    capacidadMaxima: 10,
    precio: 0,
    nivelRequerido: 'Intermedio',
    tipoCancha: 'Césped sintético'
  });

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('🔍 Matches: Cargando partidos...');
        const matchesData = await matchService.getMatches();
        setMatches(matchesData);
        console.log(`✅ Matches: ${matchesData.length} partidos cargados`);
      } catch (error) {
        console.error('❌ Error cargando partidos:', error);
        setError('Error al cargar los partidos');
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, []);

  useEffect(() => {
    const filterMatches = () => {
      let filtered = matches;

      // Filtro por búsqueda
      if (searchTerm) {
        filtered = filtered.filter(match =>
          match.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro por ciudad
      if (cityFilter) {
        filtered = filtered.filter(match => match.ciudad === cityFilter);
      }

      // Filtro por nivel
      if (levelFilter) {
        filtered = filtered.filter(match => match.nivelRequerido === levelFilter);
      }

      // Filtro por estado
      if (statusFilter) {
        filtered = filtered.filter(match => match.estado === statusFilter);
      }

      setFilteredMatches(filtered);
    };
    
    filterMatches();
  }, [matches, searchTerm, cityFilter, levelFilter, statusFilter]);

  const reloadMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Matches: Recargando partidos...');
      const matchesData = await matchService.getMatches();
      setMatches(matchesData);
      console.log(`✅ Matches: ${matchesData.length} partidos recargados`);
    } catch (error) {
      console.error('❌ Error recargando partidos:', error);
      setError('Error al recargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    try {
      setActionLoading({ create: true });
      console.log('🆕 Creando nuevo partido:', newMatch);
      
      const createdMatch = await matchService.createMatch(newMatch);
      
      // Agregar el nuevo partido a la lista
      setMatches(prev => [createdMatch, ...prev]);
      
      // Limpiar formulario y cerrar dialog
      setNewMatch({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        ubicacion: '',
        direccion: '',
        ciudad: '',
        capacidadMaxima: 10,
        precio: 0,
        nivelRequerido: 'Intermedio',
        tipoCancha: 'Césped sintético'
      });
      setCreateDialogOpen(false);
      
      console.log('✅ Partido creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando partido:', error);
      setError('Error al crear el partido');
    } finally {
      setActionLoading({ create: false });
    }
  };

  const handleJoinMatch = async (matchId) => {
    try {
      setActionLoading({ [`join_${matchId}`]: true });
      console.log(`🤝 Uniéndose al partido ${matchId}`);
      
      await matchService.joinMatch(matchId);
      
      // Actualizar la lista de partidos
      await reloadMatches();
      
      console.log('✅ Te has unido al partido exitosamente');
    } catch (error) {
      console.error('❌ Error uniéndose al partido:', error);
      setError('Error al unirse al partido');
    } finally {
      setActionLoading({ [`join_${matchId}`]: false });
    }
  };

  const handleLeaveMatch = async (matchId) => {
    try {
      setActionLoading({ [`leave_${matchId}`]: true });
      console.log(`🚪 Saliendo del partido ${matchId}`);
      
      await matchService.leaveMatch(matchId);
      
      // Actualizar la lista de partidos
      await reloadMatches();
      
      console.log('✅ Has salido del partido exitosamente');
    } catch (error) {
      console.error('❌ Error saliendo del partido:', error);
      setError('Error al salir del partido');
    } finally {
      setActionLoading({ [`leave_${matchId}`]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'success';
      case 'lleno': return 'warning';
      case 'cerrado': return 'error';
      case 'cancelado': return 'default';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'abierto': return 'Abierto';
      case 'lleno': return 'Lleno';
      case 'cerrado': return 'Cerrado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Principiante': return 'success';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'error';
      default: return 'primary';
    }
  };

  const isUserInMatch = (match) => {
    return match.jugadores?.some(player => player.email === user?.email || player.id === user?.id);
  };

  const isUserOrganizer = (match) => {
    return match.organizador?.email === user?.email || match.organizador?.id === user?.id;
  };

  const cities = [...new Set(matches.map(match => match.ciudad))].filter(Boolean);
  const levels = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando partidos...
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
          ⚽ Buscar Partidos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Encuentra y únete a partidos en tu zona
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar partidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Ciudad</InputLabel>
                <Select
                  value={cityFilter}
                  label="Ciudad"
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {cities.map(city => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={levelFilter}
                  label="Nivel"
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {levels.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="abierto">Abierto</MenuItem>
                  <MenuItem value="lleno">Lleno</MenuItem>
                  <MenuItem value="cerrado">Cerrado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {filteredMatches.length} partidos encontrados
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Lista de Partidos */}
      <Grid container spacing={3}>
        {filteredMatches.map((match) => (
          <Grid item xs={12} md={6} lg={4} key={match.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600" sx={{ flex: 1, mr: 1 }}>
                    {match.titulo}
                  </Typography>
                  <Chip
                    label={getStatusLabel(match.estado)}
                    color={getStatusColor(match.estado)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {match.descripcion}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(match.fecha).toLocaleDateString()} • {match.hora}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {match.ubicacion}, {match.ciudad}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {match.jugadoresActuales}/{match.capacidadMaxima} jugadores
                    </Typography>
                  </Box>
                  {match.precio > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Euro sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        €{match.precio} por persona
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={match.nivelRequerido}
                    color={getLevelColor(match.nivelRequerido)}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={match.tipoCancha}
                    variant="outlined"
                  />
                  {match.etiquetas?.map((tag, index) => (
                    <Chip
                      key={index}
                      size="small"
                      label={tag}
                      variant="outlined"
                    />
                  ))}
                </Box>

                {/* Organizador */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={match.organizador?.avatar}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {match.organizador?.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {match.organizador?.nombre}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ fontSize: 14, color: 'warning.main', mr: 0.5 }} />
                      <Typography variant="caption">
                        {match.organizador?.rating || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Jugadores */}
                {match.jugadores && match.jugadores.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Jugadores inscritos:
                    </Typography>
                    <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                      {match.jugadores.map((player, index) => (
                        <Tooltip key={index} title={`${player.nombre} - ${player.posicion}`}>
                          <Avatar
                            src={player.avatar}
                            sx={{ width: 32, height: 32 }}
                          >
                            {player.nombre?.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                {isUserOrganizer(match) ? (
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
                ) : isUserInMatch(match) ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={actionLoading[`leave_${match.id}`] ? <CircularProgress size={16} /> : <PersonRemove />}
                    onClick={() => handleLeaveMatch(match.id)}
                    disabled={actionLoading[`leave_${match.id}`]}
                  >
                    Salir del Partido
                  </Button>
                ) : match.estado === 'abierto' && match.jugadoresActuales < match.capacidadMaxima ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={actionLoading[`join_${match.id}`] ? <CircularProgress size={16} /> : <PersonAdd />}
                    onClick={() => handleJoinMatch(match.id)}
                    disabled={actionLoading[`join_${match.id}`]}
                  >
                    Unirse al Partido
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                  >
                    {match.estado === 'lleno' ? 'Partido Lleno' : 'No Disponible'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredMatches.length === 0 && !loading && (
        <Card sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <SportsSoccer sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            No se encontraron partidos
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Intenta ajustar los filtros de búsqueda o crea un nuevo partido
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Crear Nuevo Partido
          </Button>
        </Card>
      )}

      {/* FAB para crear partido */}
      <Fab
        color="primary"
        aria-label="crear partido"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Dialog para crear partido */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🆕 Crear Nuevo Partido
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del partido"
                  value={newMatch.titulo}
                  onChange={(e) => setNewMatch({ ...newMatch, titulo: e.target.value })}
                  placeholder="ej: Partido de Fútbol 5vs5"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={newMatch.descripcion}
                  onChange={(e) => setNewMatch({ ...newMatch, descripcion: e.target.value })}
                  placeholder="Describe el partido, reglas especiales, etc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  value={newMatch.fecha}
                  onChange={(e) => setNewMatch({ ...newMatch, fecha: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora"
                  value={newMatch.hora}
                  onChange={(e) => setNewMatch({ ...newMatch, hora: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  value={newMatch.ubicacion}
                  onChange={(e) => setNewMatch({ ...newMatch, ubicacion: e.target.value })}
                  placeholder="Nombre del complejo deportivo"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={newMatch.ciudad}
                  onChange={(e) => setNewMatch({ ...newMatch, ciudad: e.target.value })}
                  placeholder="Ciudad donde se juega"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección completa"
                  value={newMatch.direccion}
                  onChange={(e) => setNewMatch({ ...newMatch, direccion: e.target.value })}
                  placeholder="Dirección exacta del lugar"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Capacidad máxima"
                  value={newMatch.capacidadMaxima}
                  onChange={(e) => setNewMatch({ ...newMatch, capacidadMaxima: parseInt(e.target.value) })}
                  inputProps={{ min: 2, max: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Precio (€)"
                  value={newMatch.precio}
                  onChange={(e) => setNewMatch({ ...newMatch, precio: parseFloat(e.target.value) })}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Nivel requerido</InputLabel>
                  <Select
                    value={newMatch.nivelRequerido}
                    label="Nivel requerido"
                    onChange={(e) => setNewMatch({ ...newMatch, nivelRequerido: e.target.value })}
                  >
                    <MenuItem value="Principiante">Principiante</MenuItem>
                    <MenuItem value="Intermedio">Intermedio</MenuItem>
                    <MenuItem value="Avanzado">Avanzado</MenuItem>
                    <MenuItem value="Todos los niveles">Todos los niveles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de cancha</InputLabel>
                  <Select
                    value={newMatch.tipoCancha}
                    label="Tipo de cancha"
                    onChange={(e) => setNewMatch({ ...newMatch, tipoCancha: e.target.value })}
                  >
                    <MenuItem value="Césped natural">Césped natural</MenuItem>
                    <MenuItem value="Césped sintético">Césped sintético</MenuItem>
                    <MenuItem value="Tierra">Tierra</MenuItem>
                    <MenuItem value="Concreto">Concreto</MenuItem>
                    <MenuItem value="Indoor">Indoor</MenuItem>
                  </Select>
                </FormControl>
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
            onClick={handleCreateMatch}
            disabled={!newMatch.titulo || !newMatch.fecha || !newMatch.hora || actionLoading.create}
            startIcon={actionLoading.create ? <CircularProgress size={16} /> : <Add />}
          >
            Crear Partido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Matches;