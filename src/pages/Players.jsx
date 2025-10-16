import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Pagination,
  Stack
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Star,
  SportsSoccer,
  EmojiEvents,
  Group,
  Verified
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import PlayerCard from '../components/common/PlayerCard';

const Players = () => {
  const theme = useTheme();
  useAuth();
  
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(12);

  // Datos de ejemplo de jugadores con perfiles completos
  const mockPlayers = [
    {
      id: 1,
      nombre: 'Carlos Rodríguez',
      avatar: '',
      posicion: 'Delantero',
      ciudad: 'Madrid',
      rating: 4.8,
      partidosJugados: 45,
      golesAnotados: 23,
      asistencias: 12,
      verificado: true,
      disponible: true,
      equipos: ['Real Madrid Aficionados', 'Los Cracks'],
      especialidades: ['Definición', 'Velocidad'],
      descripcion: 'Jugador experimentado con gran capacidad de definición',
      fechaRegistro: '2024-01-15',
      perfilCompleto: true
    },
    {
      id: 2,
      nombre: 'Ana García',
      avatar: '',
      posicion: 'Mediocampista',
      ciudad: 'Barcelona',
      rating: 4.6,
      partidosJugados: 38,
      golesAnotados: 8,
      asistencias: 19,
      verificado: true,
      disponible: true,
      equipos: ['FC Barcelona Femenino Amateur'],
      especialidades: ['Pases', 'Visión de juego'],
      descripcion: 'Excelente mediocampista con gran visión de juego',
      fechaRegistro: '2024-02-20',
      perfilCompleto: true
    },
    {
      id: 3,
      nombre: 'Miguel Torres',
      avatar: '',
      posicion: 'Defensa',
      ciudad: 'Valencia',
      rating: 4.4,
      partidosJugados: 52,
      golesAnotados: 3,
      asistencias: 7,
      verificado: false,
      disponible: true,
      equipos: ['Valencia CF Amateur'],
      especialidades: ['Marcaje', 'Juego aéreo'],
      descripcion: 'Defensa sólido y confiable',
      fechaRegistro: '2023-12-10',
      perfilCompleto: true
    },
    {
      id: 4,
      nombre: 'Laura Martínez',
      avatar: '',
      posicion: 'Portera',
      ciudad: 'Sevilla',
      rating: 4.9,
      partidosJugados: 41,
      golesAnotados: 0,
      asistencias: 2,
      verificado: true,
      disponible: false,
      equipos: ['Sevilla FC Femenino'],
      especialidades: ['Reflejos', 'Salida de balón'],
      descripcion: 'Portera con excelentes reflejos',
      fechaRegistro: '2024-01-08',
      perfilCompleto: true
    },
    {
      id: 5,
      nombre: 'Diego López',
      avatar: '',
      posicion: 'Mediocampista',
      ciudad: 'Madrid',
      rating: 4.3,
      partidosJugados: 29,
      golesAnotados: 12,
      asistencias: 15,
      verificado: false,
      disponible: true,
      equipos: ['Atlético Amateur'],
      especialidades: ['Técnica', 'Tiro libre'],
      descripcion: 'Mediocampista técnico con buen tiro',
      fechaRegistro: '2024-03-12',
      perfilCompleto: true
    },
    {
      id: 6,
      nombre: 'Sofia Ruiz',
      avatar: '',
      posicion: 'Delantera',
      ciudad: 'Bilbao',
      rating: 4.7,
      partidosJugados: 33,
      golesAnotados: 18,
      asistencias: 9,
      verificado: true,
      disponible: true,
      equipos: ['Athletic Femenino Amateur'],
      especialidades: ['Regate', 'Finalización'],
      descripcion: 'Delantera rápida y habilidosa',
      fechaRegistro: '2024-02-01',
      perfilCompleto: true
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    const loadPlayers = async () => {
      setLoading(true);
      try {
        // Aquí harías la llamada real a la API
        // const response = await api.get('/players/completed-profiles');
        // setPlayers(response.data);
        
        // Por ahora usamos datos de ejemplo
        setTimeout(() => {
          setPlayers(mockPlayers);
          setFilteredPlayers(mockPlayers);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error cargando jugadores:', error);
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Filtrar jugadores
  useEffect(() => {
    let filtered = players.filter(player => player.perfilCompleto);

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por posición
    if (positionFilter) {
      filtered = filtered.filter(player => player.posicion === positionFilter);
    }

    // Filtro por ubicación
    if (locationFilter) {
      filtered = filtered.filter(player => player.ciudad === locationFilter);
    }

    // Filtro por rating
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(player => player.rating >= minRating);
    }

    setFilteredPlayers(filtered);
    setCurrentPage(1);
  }, [searchTerm, positionFilter, locationFilter, ratingFilter, players]);

  // Obtener ciudades únicas
  const uniqueCities = [...new Set(players.map(player => player.ciudad))];
  
  // Obtener posiciones únicas
  const uniquePositions = [...new Set(players.map(player => player.posicion))];

  // Paginación
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPositionFilter('');
    setLocationFilter('');
    setRatingFilter('');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Cargando jugadores...
          </Typography>
        </Box>
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
          Jugadores Disponibles
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Encuentra y conecta con jugadores que han completado su perfil
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {filteredPlayers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jugadores Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent>
                <Verified sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {filteredPlayers.filter(p => p.verificado).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verificados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent>
                <LocationOn sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {uniqueCities.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ciudades
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent>
                <Star sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {(filteredPlayers.reduce((sum, p) => sum + p.rating, 0) / filteredPlayers.length || 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rating Promedio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(10px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FilterList />
          <Typography variant="h6" fontWeight="600">
            Filtros de Búsqueda
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Posición</InputLabel>
              <Select
                value={positionFilter}
                label="Posición"
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {uniquePositions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ciudad</InputLabel>
              <Select
                value={locationFilter}
                label="Ciudad"
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {uniqueCities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Rating Mínimo</InputLabel>
              <Select
                value={ratingFilter}
                label="Rating Mínimo"
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <MenuItem value="">Cualquiera</MenuItem>
                <MenuItem value="4.5">4.5+</MenuItem>
                <MenuItem value="4.0">4.0+</MenuItem>
                <MenuItem value="3.5">3.5+</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ height: 56 }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Resultados */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {filteredPlayers.length} jugadores encontrados
        </Typography>
      </Box>

      {/* Grid de Jugadores */}
      {currentPlayers.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {currentPlayers.map((player) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                <PlayerCard player={player} />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <SportsSoccer sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            No se encontraron jugadores
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Intenta ajustar los filtros de búsqueda
          </Typography>
          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar Filtros
          </Button>
        </Card>
      )}
    </Container>
  );
};

export default Players;