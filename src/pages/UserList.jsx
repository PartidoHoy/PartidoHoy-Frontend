import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Pagination,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  FilterList,
  GridView,
  ViewList,
  Refresh
} from '@mui/icons-material';
import UserCard from '../components/user/UserCard';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [posicionFilter, setPosicionFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const posiciones = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];
  const niveles = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'];
  const usersPerPage = 12;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await userService.getUsers(
        page - 1, // Backend usa 0-based indexing
        usersPerPage,
        searchTerm
      );

      // Filtrar por posición y nivel en el frontend si el backend no lo soporta
      let filteredUsers = response.content || response.users || response;
      
      if (posicionFilter) {
        filteredUsers = filteredUsers.filter(user => 
          user.posicion?.toLowerCase() === posicionFilter.toLowerCase()
        );
      }
      
      if (nivelFilter) {
        filteredUsers = filteredUsers.filter(user => 
          user.nivel?.toLowerCase() === nivelFilter.toLowerCase()
        );
      }

      setUsers(filteredUsers);
      setTotalPages(response.totalPages || Math.ceil(filteredUsers.length / usersPerPage));
      setTotalUsers(response.totalElements || filteredUsers.length);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar los usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, posicionFilter, nivelFilter, usersPerPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePosicionFilterChange = (e) => {
    setPosicionFilter(e.target.value);
    setPage(1);
  };

  const handleNivelFilterChange = (e) => {
    setNivelFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleUserClick = (user) => {
    // Navegar al perfil del usuario
    navigate(`/users/${user.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPosicionFilter('');
    setNivelFilter('');
    setPage(1);
  };

  const hasActiveFilters = searchTerm || posicionFilter || nivelFilter;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Jugadores
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar">
              <IconButton onClick={loadUsers} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista cuadrícula">
              <IconButton 
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <GridView />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista lista">
              <IconButton 
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filtros */}
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              placeholder="Buscar jugadores..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Posición</InputLabel>
              <Select
                value={posicionFilter}
                onChange={handlePosicionFilterChange}
                label="Posición"
              >
                <MenuItem value="">Todas</MenuItem>
                {posiciones.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={nivelFilter}
                onChange={handleNivelFilterChange}
                label="Nivel"
              >
                <MenuItem value="">Todos</MenuItem>
                {niveles.map((nivel) => (
                  <MenuItem key={nivel} value={nivel}>
                    {nivel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            {hasActiveFilters && (
              <Chip
                icon={<FilterList />}
                label="Limpiar"
                onClick={clearFilters}
                color="primary"
                variant="outlined"
                clickable
              />
            )}
          </Grid>
        </Grid>

        {/* Info de resultados */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Cargando...' : `${totalUsers} jugador${totalUsers !== 1 ? 'es' : ''} encontrado${totalUsers !== 1 ? 's' : ''}`}
          </Typography>
          
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {searchTerm && (
                <Chip size="small" label={`Búsqueda: "${searchTerm}"`} onDelete={() => setSearchTerm('')} />
              )}
              {posicionFilter && (
                <Chip size="small" label={`Posición: ${posicionFilter}`} onDelete={() => setPosicionFilter('')} />
              )}
              {nivelFilter && (
                <Chip size="small" label={`Nivel: ${nivelFilter}`} onDelete={() => setNivelFilter('')} />
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Content */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {hasActiveFilters ? 'No se encontraron jugadores con los filtros aplicados' : 'No hay jugadores registrados'}
          </Typography>
          {hasActiveFilters && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Prueba a cambiar los filtros de búsqueda
            </Typography>
          )}
        </Paper>
      ) : (
        <>
          {/* Grid de usuarios */}
          <Grid container spacing={3}>
            {users.map((user) => (
              <Grid 
                item 
                xs={12} 
                sm={viewMode === 'grid' ? 6 : 12} 
                md={viewMode === 'grid' ? 4 : 12} 
                lg={viewMode === 'grid' ? 3 : 12}
                key={user.id}
              >
                <UserCard
                  user={user}
                  onClick={handleUserClick}
                  variant={viewMode === 'list' ? 'detailed' : 'default'}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default UserList;