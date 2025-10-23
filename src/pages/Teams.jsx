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
  Tooltip,
  LinearProgress,
  Divider,
  IconButton
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  Star,
  LocationOn,
  EmojiEvents,
  PersonAdd,
  PersonRemove,
  Settings,
  SportsSoccer,
  TrendingUp,
  People,
  CalendarToday,
  Edit,
  Delete,
  WorkspacePremium
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import teamService from '../services/teamService';

const Teams = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-teams'

  // Estado para crear equipo
  const [newTeam, setNewTeam] = useState({
    nombre: '',
    descripcion: '',
    ciudad: '',
    categoria: 'Intermedio',
    miembrosMax: 22,
    logo: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('🔍 Teams: Cargando equipos y mis equipos...');
        const [teamsData, myTeamsData] = await Promise.all([
          teamService.getTeams(),
          teamService.getMyTeams()
        ]);
        
        setTeams(teamsData);
        setMyTeams(myTeamsData);
        console.log(`✅ Teams: ${teamsData.length} equipos y ${myTeamsData.length} mis equipos cargados`);
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        setError('Error al cargar los equipos');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const filterTeams = () => {
      let filtered = teams;

      // Filtro por búsqueda
      if (searchTerm) {
        filtered = filtered.filter(team =>
          team.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro por ciudad
      if (cityFilter) {
        filtered = filtered.filter(team => team.ciudad === cityFilter);
      }

      // Filtro por categoría
      if (categoryFilter) {
        filtered = filtered.filter(team => team.categoria === categoryFilter);
      }

      setFilteredTeams(filtered);
    };
    
    filterTeams();
  }, [teams, searchTerm, cityFilter, categoryFilter]);

  const reloadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Teams: Recargando datos...');
      const [teamsData, myTeamsData] = await Promise.all([
        teamService.getTeams(),
        teamService.getMyTeams()
      ]);
      
      setTeams(teamsData);
      setMyTeams(myTeamsData);
      console.log(`✅ Teams: Datos recargados`);
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
      setError('Error al recargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setActionLoading({ create: true });
      console.log('🆕 Creando nuevo equipo:', newTeam);
      
      const createdTeam = await teamService.createTeam(newTeam);
      
      // Agregar el nuevo equipo a la lista
      setTeams(prev => [createdTeam, ...prev]);
      
      // Limpiar formulario y cerrar dialog
      setNewTeam({
        nombre: '',
        descripcion: '',
        ciudad: '',
        categoria: 'Intermedio',
        miembrosMax: 22,
        logo: ''
      });
      setCreateDialogOpen(false);
      
      // Recargar mis equipos
      await reloadData();
      
      console.log('✅ Equipo creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando equipo:', error);
      setError('Error al crear el equipo');
    } finally {
      setActionLoading({ create: false });
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      setActionLoading({ [`join_${teamId}`]: true });
      console.log(`🤝 Uniéndose al equipo ${teamId}`);
      
      await teamService.joinTeam(teamId);
      
      // Actualizar los datos
      await reloadData();
      
      console.log('✅ Te has unido al equipo exitosamente');
    } catch (error) {
      console.error('❌ Error uniéndose al equipo:', error);
      setError('Error al unirse al equipo');
    } finally {
      setActionLoading({ [`join_${teamId}`]: false });
    }
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      setActionLoading({ [`leave_${teamId}`]: true });
      console.log(`🚪 Saliendo del equipo ${teamId}`);
      
      await teamService.leaveTeam(teamId);
      
      // Actualizar los datos
      await reloadData();
      
      console.log('✅ Has salido del equipo exitosamente');
    } catch (error) {
      console.error('❌ Error saliendo del equipo:', error);
      setError('Error al salir del equipo');
    } finally {
      setActionLoading({ [`leave_${teamId}`]: false });
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Principiante': return 'success';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'error';
      default: return 'primary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'success';
      case 'reclutando': return 'warning';
      case 'inactivo': return 'default';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'reclutando': return 'Reclutando';
      case 'inactivo': return 'Inactivo';
      default: return status;
    }
  };

  const isUserInTeam = (team) => {
    return myTeams.some(myTeam => myTeam.id === team.id);
  };

  const isUserCaptain = (team) => {
    return team.capitan?.email === user?.email || team.capitan?.id === user?.id;
  };

  const cities = [...new Set(teams.map(team => team.ciudad))].filter(Boolean);
  const categories = ['Principiante', 'Intermedio', 'Avanzado'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando equipos...
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
          🏆 Equipos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Encuentra tu equipo ideal o crea uno nuevo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={activeTab === 'browse' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('browse')}
              startIcon={<Search />}
            >
              Buscar Equipos
            </Button>
            <Button
              variant={activeTab === 'my-teams' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('my-teams')}
              startIcon={<Group />}
            >
              Mis Equipos ({myTeams.length})
            </Button>
          </Box>
        </Box>

        {/* Filtros - Solo en tab buscar */}
        {activeTab === 'browse' && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Buscar equipos..."
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
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Categoría"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {activeTab === 'browse' ? `${filteredTeams.length} equipos encontrados` : `${myTeams.length} equipos`}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        )}
      </Box>

      {/* Lista de Equipos */}
      <Grid container spacing={3}>
        {(activeTab === 'browse' ? filteredTeams : teams.filter(team => isUserInTeam(team))).map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr: 1 }}>
                    <Avatar
                      src={team.logo}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {team.nombre.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {team.nombre}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={team.categoria}
                          color={getCategoryColor(team.categoria)}
                          size="small"
                        />
                        <Chip
                          label={getStatusLabel(team.estado)}
                          color={getStatusColor(team.estado)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {team.descripcion}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {team.ciudad}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {team.miembros}/{team.miembrosMax} miembros
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(team.miembros / team.miembrosMax) * 100}
                      sx={{ flex: 1, ml: 2, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Creado: {new Date(team.fechaCreacion).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Capitán */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkspacePremium sx={{ fontSize: 16, mr: 1, color: 'warning.main' }} />
                  <Avatar
                    src={team.capitan?.avatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {team.capitan?.nombre?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" fontWeight="500">
                    {team.capitan?.nombre}
                  </Typography>
                </Box>

                {/* Estadísticas */}
                {team.estadisticas && (
                  <Box sx={{ mb: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Estadísticas:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            {team.estadisticas.victorias}
                          </Typography>
                          <Typography variant="caption">Victorias</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="warning.main">
                            {team.estadisticas.empates}
                          </Typography>
                          <Typography variant="caption">Empates</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="error.main">
                            {team.estadisticas.derrotas}
                          </Typography>
                          <Typography variant="caption">Derrotas</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Próximo partido */}
                {team.proximoPartido && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                      🏈 Próximo Partido
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(team.proximoPartido.fecha).toLocaleDateString()} vs {team.proximoPartido.rival}
                    </Typography>
                  </Box>
                )}

                {/* Miembros */}
                {team.miembrosData && team.miembrosData.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Miembros:
                    </Typography>
                    <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                      {team.miembrosData.map((member, index) => (
                        <Tooltip key={index} title={`${member.nombre} - ${member.posicion} ${member.numero ? `#${member.numero}` : ''}`}>
                          <Avatar
                            src={member.avatar}
                            sx={{ width: 32, height: 32 }}
                          >
                            {member.nombre?.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                {isUserCaptain(team) ? (
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <Button
                      size="small"
                      startIcon={<Settings />}
                      variant="outlined"
                      sx={{ flex: 1 }}
                    >
                      Gestionar
                    </Button>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                ) : isUserInTeam(team) ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={actionLoading[`leave_${team.id}`] ? <CircularProgress size={16} /> : <PersonRemove />}
                    onClick={() => handleLeaveTeam(team.id)}
                    disabled={actionLoading[`leave_${team.id}`]}
                  >
                    Salir del Equipo
                  </Button>
                ) : team.miembros < team.miembrosMax ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={actionLoading[`join_${team.id}`] ? <CircularProgress size={16} /> : <PersonAdd />}
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={actionLoading[`join_${team.id}`]}
                  >
                    Unirse al Equipo
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                  >
                    Equipo Completo
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Estado vacío */}
      {((activeTab === 'browse' && filteredTeams.length === 0) || 
        (activeTab === 'my-teams' && myTeams.length === 0)) && !loading && (
        <Card sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <SportsSoccer sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            {activeTab === 'browse' ? 'No se encontraron equipos' : 'No tienes equipos'}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            {activeTab === 'browse' 
              ? 'Intenta ajustar los filtros de búsqueda o crea un nuevo equipo'
              : 'Únete a un equipo existente o crea uno nuevo'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Crear Nuevo Equipo
          </Button>
        </Card>
      )}

      {/* FAB para crear equipo */}
      <Fab
        color="primary"
        aria-label="crear equipo"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Dialog para crear equipo */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🆕 Crear Nuevo Equipo
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del equipo"
                  value={newTeam.nombre}
                  onChange={(e) => setNewTeam({ ...newTeam, nombre: e.target.value })}
                  placeholder="ej: FC Barcelona Amateurs"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={newTeam.descripcion}
                  onChange={(e) => setNewTeam({ ...newTeam, descripcion: e.target.value })}
                  placeholder="Describe tu equipo, objetivos, estilo de juego, etc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={newTeam.ciudad}
                  onChange={(e) => setNewTeam({ ...newTeam, ciudad: e.target.value })}
                  placeholder="Ciudad donde juega el equipo"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={newTeam.categoria}
                    label="Categoría"
                    onChange={(e) => setNewTeam({ ...newTeam, categoria: e.target.value })}
                  >
                    <MenuItem value="Principiante">Principiante</MenuItem>
                    <MenuItem value="Intermedio">Intermedio</MenuItem>
                    <MenuItem value="Avanzado">Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Máximo de miembros"
                  value={newTeam.miembrosMax}
                  onChange={(e) => setNewTeam({ ...newTeam, miembrosMax: parseInt(e.target.value) })}
                  inputProps={{ min: 5, max: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="URL del logo (opcional)"
                  value={newTeam.logo}
                  onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
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
            onClick={handleCreateTeam}
            disabled={!newTeam.nombre || !newTeam.ciudad || actionLoading.create}
            startIcon={actionLoading.create ? <CircularProgress size={16} /> : <Add />}
          >
            Crear Equipo
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Teams;