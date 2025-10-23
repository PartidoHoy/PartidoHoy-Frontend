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
  Stack,
  Alert
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
import userService from '../services/userService';

const Players = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(12);

  // Función de debug para probar el endpoint
  const debugEndpoint = async () => {
    try {
      console.log('🔧 DEBUG: Probando endpoint de usuarios...');
      const token = localStorage.getItem('jwt');
      console.log('🔧 DEBUG: Token:', token ? 'Presente' : 'Ausente');
      
      // Probar endpoint directo
      const response = await fetch('http://localhost:8080/api/profiles/search?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('🔧 DEBUG: Response status:', response.status);
      console.log('🔧 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔧 DEBUG: Response data:', data);
      } else {
        const errorText = await response.text();
        console.log('🔧 DEBUG: Error response:', errorText);
      }
    } catch (error) {
      console.error('🔧 DEBUG: Error en prueba:', error);
    }
  };

  useEffect(() => {
    // Cargar jugadores reales desde la API
    const loadPlayers = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('🔍 Players: Cargando jugadores desde API usando endpoint de cards...');
        
        // Obtener tarjetas de jugadores desde el endpoint correcto de cards
        const playersData = await userService.getPlayerCards();
        console.log('📋 Players: Datos obtenidos:', playersData);
        console.log('📋 Players: Tipo de datos:', typeof playersData, Array.isArray(playersData));
        
        // Manejar la respuesta del backend (puede ser paginada)
        let playersArray = [];
        
        if (Array.isArray(playersData)) {
          playersArray = playersData;
        } else if (playersData?.content && Array.isArray(playersData.content)) {
          // Respuesta paginada del backend Spring Boot
          playersArray = playersData.content;
          console.log('📋 Players: Respuesta paginada - total elementos:', playersData.totalElements);
        } else if (playersData?.data && Array.isArray(playersData.data)) {
          playersArray = playersData.data;
        } else {
          console.warn('⚠️ Players: Formato de respuesta no reconocido');
          playersArray = [];
        }
        
        console.log('📋 Players: Array de jugadores extraído:', playersArray);
        
        // Filtrar solo jugadores que no sean el usuario actual
        const otherPlayers = playersArray.filter(player => 
          player.email !== user?.email && player.id !== user?.id && player.userId !== user?.id
        );
        
        console.log(`✅ Players: ${otherPlayers.length} jugadores reales encontrados (excluyendo usuario actual)`);
        
        // Transformar datos del backend para que sean compatibles con el frontend
        const transformedPlayers = otherPlayers.map(player => ({
          ...player,
          id: player.userId || player.id, // Usar userId como id principal
          perfilCompleto: true, // Los datos del backend siempre tienen perfil completo
          verificado: true, // Asumir que están verificados
          rating: player.porcentajeVictorias ? (player.porcentajeVictorias / 100 * 5) : 4.0, // Convertir porcentaje a rating
          experiencia: Math.floor((player.partidosJugados || 0) / 10) + 1, // Calcular experiencia basada en partidos
          avatar: player.fotoUrl || '', // Usar fotoUrl como avatar
          estadisticas: {
            partidos: player.partidosJugados || 0,
            victorias: Math.round((player.partidosJugados || 0) * (player.porcentajeVictorias || 50) / 100),
            goles: player.golesAnotados || 0,
            asistencias: Math.round((player.golesAnotados || 0) / 2)
          }
        }));
        
        // Usar jugadores reales si existen, sino mostrar datos de ejemplo
        if (transformedPlayers.length > 0) {
          console.log('🎉 Players: Mostrando jugadores reales del backend');
          console.log('🔍 DEBUG: Jugadores transformados:', transformedPlayers.map(p => ({
            nombre: p.nombre, 
            perfilCompleto: p.perfilCompleto,
            userId: p.userId,
            id: p.id
          })));
          setPlayers(transformedPlayers);
          // No asignar filteredPlayers aquí - dejar que el useEffect de filtros lo haga
        } else {
          console.log('ℹ️ Players: No hay jugadores en la base de datos, usando datos de ejemplo');
          const mockPlayers = [
            {
              id: 'mock-1',
              nombre: 'Diego Martínez',
              email: 'diego@ejemplo.com',
              posicion: 'Delantero',
              nivel: 'Avanzado',
              ubicacion: 'Madrid',
              partidosJugados: 23,
              golesAnotados: 15,
              avatar: '',
              experiencia: 5,
              rating: 4.2,
              disponibilidad: ['Lunes', 'Miércoles', 'Viernes'],
              estadisticas: {
                partidos: 23,
                victorias: 15,
                goles: 15,
                asistencias: 8
              },
              perfilCompleto: true,
              mode: 'demo'
            },
            {
              id: 'mock-2',
              nombre: 'Ana García',
              email: 'ana@ejemplo.com',
              posicion: 'Mediocampista',
              nivel: 'Intermedio',
              ubicacion: 'Barcelona',
              partidosJugados: 18,
              golesAnotados: 7,
              avatar: '',
              experiencia: 3,
              rating: 4.5,
              disponibilidad: ['Martes', 'Jueves', 'Sábado'],
              estadisticas: {
                partidos: 18,
                victorias: 12,
                goles: 7,
                asistencias: 12
              },
              perfilCompleto: true,
              mode: 'demo'
            },
            {
              id: 'mock-3',
              nombre: 'Carlos López',
              email: 'carlos@ejemplo.com',
              posicion: 'Defensa',
              nivel: 'Avanzado',
              ubicacion: 'Valencia',
              partidosJugados: 31,
              golesAnotados: 3,
              avatar: '',
              experiencia: 7,
              rating: 4.7,
              disponibilidad: ['Lunes', 'Martes', 'Sábado', 'Domingo'],
              estadisticas: {
                partidos: 31,
                victorias: 22,
                goles: 3,
                asistencias: 5
              },
              mode: 'demo'
            },
            {
              id: 'mock-4',
              nombre: 'Laura Fernández',
              email: 'laura@ejemplo.com',
              posicion: 'Portera',
              nivel: 'Intermedio',
              ubicacion: 'Sevilla',
              partidosJugados: 16,
              golesAnotados: 0,
              avatar: '',
              experiencia: 2,
              rating: 4.1,
              disponibilidad: ['Miércoles', 'Viernes', 'Domingo'],
              estadisticas: {
                partidos: 16,
                victorias: 10,
                goles: 0,
                asistencias: 1
              },
              perfilCompleto: true,
              mode: 'demo'
            },
            {
              id: 'mock-5',
              nombre: 'Miguel Torres',
              email: 'miguel@ejemplo.com',
              posicion: 'Delantero',
              nivel: 'Principiante',
              ubicacion: 'Madrid',
              partidosJugados: 8,
              golesAnotados: 5,
              avatar: '',
              experiencia: 1,
              rating: 3.8,
              disponibilidad: ['Sábado', 'Domingo'],
              estadisticas: {
                partidos: 8,
                victorias: 4,
                goles: 5,
                asistencias: 2
              },
              perfilCompleto: true,
              mode: 'demo'
            },
            {
              id: 'mock-6',
              nombre: 'Sofia Ruiz',
              email: 'sofia@ejemplo.com',
              posicion: 'Mediocampista',
              nivel: 'Avanzado',
              ubicacion: 'Bilbao',
              partidosJugados: 27,
              golesAnotados: 12,
              avatar: '',
              experiencia: 4,
              rating: 4.3,
              disponibilidad: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
              estadisticas: {
                partidos: 27,
                victorias: 19,
                goles: 12,
                asistencias: 15
              },
              perfilCompleto: true,
              mode: 'demo'
            }
          ];
          
          setPlayers(mockPlayers);
          console.log(`✨ Players: Mostrando ${mockPlayers.length} jugadores de ejemplo`);
          console.log('🔍 DEBUG: Mock players con perfilCompleto:', mockPlayers.map(p => ({nombre: p.nombre, perfilCompleto: p.perfilCompleto})));
          // No asignar filteredPlayers aquí - dejar que el useEffect de filtros lo haga
        }
        
      } catch (error) {
        console.error('❌ Error cargando jugadores:', error);
        setError('Error al cargar la lista de jugadores. Inténtalo de nuevo más tarde.');
        
        // En caso de error, usar datos de ejemplo como fallback
        console.log('🔄 Players: Usando datos de ejemplo como fallback por error en API');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [user?.email, user?.id]);

  // Filtrar jugadores
  useEffect(() => {
    // Filtrar solo jugadores con perfil completo (o asumir completo si no tiene la propiedad)
    let filtered = players.filter(player => player.perfilCompleto !== false);

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

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SportsSoccer sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            Error al cargar jugadores
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reintentar
          </Button>
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

        {/* Debug Button - Temporal */}
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={debugEndpoint}
          sx={{ mb: 2 }}
          size="small"
        >
          🔧 Debug Endpoint
        </Button>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
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
          <Grid size={{ xs: 6, md: 3 }}>
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
          <Grid size={{ xs: 6, md: 3 }}>
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
          <Grid size={{ xs: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, md: 3 }}>
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
          
          <Grid size={{ xs: 12, md: 2 }}>
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
          
          <Grid size={{ xs: 12, md: 2 }}>
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
          
          <Grid size={{ xs: 12, md: 2 }}>
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
          
          <Grid size={{ xs: 12, md: 3 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={player.id}>
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