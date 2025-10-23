import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  SportsSoccer,
  Add,
  TrendingUp,
  EmojiEvents,
  Group,
  LocationOn,
  Schedule,
  Star,
  Favorite,
  Share,
  MoreVert,
  PlayArrow,
  CalendarToday,
  Timeline,
  LocalFireDepartment,
  Bolt,
  Speed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MatchCard from '../components/common/MatchCard';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quickMatchDialog, setQuickMatchDialog] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState({
    position: '',
    level: '',
    location: '',
    time: ''
  });

  // Mock data para la página de inicio
  const [stats] = useState({
    partidos: 24,
    goles: 15,
    asistencias: 8,
    rating: 4.2
  });

  const [activeMatches] = useState([
    {
      id: 1,
      title: 'Fútbol 11 - Nivel Intermedio',
      location: 'Complejo Deportivo Norte',
      time: '19:00',
      date: 'Hoy',
      players: '8/22',
      distance: '2.3 km',
      price: '$15',
      organizer: 'Carlos Ruiz',
      urgency: 'high'
    },
    {
      id: 2,
      title: 'Fútbol 7 - Competitivo',
      location: 'Cancha La Bombonera',
      time: '20:30',
      date: 'Mañana',
      players: '12/14',
      distance: '1.8 km',
      price: '$20',
      organizer: 'Ana García',
      urgency: 'medium'
    },
    {
      id: 3,
      title: 'Fútbol 5 - Amateur',
      location: 'Centro Deportivo Sur',
      time: '18:00',
      date: 'Viernes',
      players: '6/10',
      distance: '3.1 km',
      price: '$12',
      organizer: 'Miguel Torres',
      urgency: 'low'
    }
  ]);

  const [recentActivity] = useState([
    { type: 'match', message: 'Participaste en "Fútbol 7 - La Liga"', time: '2 horas', icon: <SportsSoccer /> },
    { type: 'achievement', message: 'Desbloqueaste "Goleador del mes"', time: '1 día', icon: <EmojiEvents /> },
    { type: 'team', message: 'Te uniste al equipo "Los Tigres FC"', time: '3 días', icon: <Group /> },
    { type: 'goal', message: 'Anotaste 2 goles en el último partido', time: '1 semana', icon: <LocalFireDepartment /> }
  ]);

  const [featuredPlayers] = useState([
    { id: 1, name: 'Diego Martínez', position: 'Delantero', rating: 4.8, image: null, matches: 45 },
    { id: 2, name: 'Laura Sánchez', position: 'Centrocampista', rating: 4.6, image: null, matches: 38 },
    { id: 3, name: 'Roberto Silva', position: 'Defensa', rating: 4.7, image: null, matches: 52 }
  ]);

  const handleQuickMatch = () => {
    setQuickMatchDialog(true);
  };

  const handleJoinMatch = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  const handleFavoriteMatch = (matchId) => {
    console.log('Toggle favorite for match:', matchId);
    // TODO: Implement favorite functionality
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            ¡Hola, {user?.nombre?.split(' ')[0] || 'Jugador'}! ⚽
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Encuentra tu próximo partido y conecta con jugadores cerca de ti
          </Typography>
          
          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SportsSoccer />}
              onClick={handleQuickMatch}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Buscar Partido
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/create-match')}
              sx={{ borderRadius: 3, px: 3, py: 1.5 }}
            >
              Crear Partido
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Group />}
              onClick={() => navigate('/players')}
              sx={{ borderRadius: 3, px: 3, py: 1.5 }}
            >
              Buscar Jugadores
            </Button>

          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Quick Stats */}
            <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                  p: 3
                }}
              >
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Tus Estadísticas
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="800" color="primary">
                        {stats.partidos}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partidos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="800" color="success.main">
                        {stats.goles}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Goles
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="800" color="info.main">
                        {stats.asistencias}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Asistencias
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="h3" fontWeight="800" color="warning.main">
                          {stats.rating}
                        </Typography>
                        <Star sx={{ color: 'warning.main', fontSize: 24 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Rating
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>

            {/* Active Matches */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="600">
                    Partidos Disponibles
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate('/matches')}
                    sx={{ borderRadius: 2 }}
                  >
                    Ver todos
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {activeMatches.map((match) => (
                    <Grid size={{ xs: 12, md: 6 }} key={match.id}>
                      <MatchCard
                        match={match}
                        onJoin={handleJoinMatch}
                        onFavorite={handleFavoriteMatch}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Recent Activity */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Actividad Reciente
                </Typography>
                <List disablePadding>
                  {recentActivity.map((activity, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main'
                          }}
                        >
                          {activity.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2, borderRadius: 2 }}
                  onClick={() => navigate('/activity')}
                >
                  Ver toda la actividad
                </Button>
              </CardContent>
            </Card>

            {/* Featured Players */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Jugadores Destacados
                </Typography>
                <List disablePadding>
                  {featuredPlayers.map((player) => (
                    <ListItem key={player.id} disablePadding sx={{ mb: 2 }}>
                      <Avatar
                        src={player.image}
                        sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}
                      >
                        {player.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={player.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {player.position} • {player.matches} partidos
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                          <Typography variant="body2" fontWeight="600">
                            {player.rating}
                          </Typography>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1, borderRadius: 2 }}
                  onClick={() => navigate('/players')}
                >
                  Explorar jugadores
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`
        }}
        onClick={handleQuickMatch}
      >
        <Add />
      </Fab>

      {/* Quick Match Dialog */}
      <Dialog
        open={quickMatchDialog}
        onClose={() => setQuickMatchDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            Búsqueda Rápida de Partido
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Posición Preferida</InputLabel>
              <Select
                value={matchPreferences.position}
                label="Posición Preferida"
                onChange={(e) => setMatchPreferences({...matchPreferences, position: e.target.value})}
              >
                <MenuItem value="Portero">Portero</MenuItem>
                <MenuItem value="Defensa">Defensa</MenuItem>
                <MenuItem value="Centrocampista">Centrocampista</MenuItem>
                <MenuItem value="Delantero">Delantero</MenuItem>
                <MenuItem value="Cualquiera">Cualquiera</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={matchPreferences.level}
                label="Nivel"
                onChange={(e) => setMatchPreferences({...matchPreferences, level: e.target.value})}
              >
                <MenuItem value="Principiante">Principiante</MenuItem>
                <MenuItem value="Intermedio">Intermedio</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
                <MenuItem value="Profesional">Profesional</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Ubicación"
              placeholder="Ej: Ciudad, distrito..."
              value={matchPreferences.location}
              onChange={(e) => setMatchPreferences({...matchPreferences, location: e.target.value})}
            />

            <FormControl fullWidth>
              <InputLabel>Horario Preferido</InputLabel>
              <Select
                value={matchPreferences.time}
                label="Horario Preferido"
                onChange={(e) => setMatchPreferences({...matchPreferences, time: e.target.value})}
              >
                <MenuItem value="Mañana">Mañana (6AM - 12PM)</MenuItem>
                <MenuItem value="Tarde">Tarde (12PM - 6PM)</MenuItem>
                <MenuItem value="Noche">Noche (6PM - 11PM)</MenuItem>
                <MenuItem value="Cualquiera">Cualquier horario</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setQuickMatchDialog(false)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setQuickMatchDialog(false);
              navigate('/matches', { state: { preferences: matchPreferences } });
            }}
            sx={{ borderRadius: 2 }}
          >
            Buscar Partidos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;