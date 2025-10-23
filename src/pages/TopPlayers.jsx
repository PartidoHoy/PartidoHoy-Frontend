import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  EmojiEvents,
  SportsSoccer,
  Star,
  TrendingUp,
  LocalFireDepartment
} from '@mui/icons-material';
import userService from '../services/userService';

const TopPlayers = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [topByWins, setTopByWins] = useState([]);
  const [topByGoals, setTopByGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopPlayers();
  }, []);

  const loadTopPlayers = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🏆 TopPlayers: Cargando rankings...');
      
      const [winsData, goalsData] = await Promise.all([
        userService.getTopPlayersByWins(),
        userService.getTopPlayersByGoals()
      ]);
      
      setTopByWins(Array.isArray(winsData) ? winsData : []);
      setTopByGoals(Array.isArray(goalsData) ? goalsData : []);
      
      console.log('✅ TopPlayers: Rankings cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando rankings:', error);
      setError('Error al cargar los rankings de jugadores');
    } finally {
      setLoading(false);
    }
  };

  const getRankingColor = (position) => {
    switch (position) {
      case 0: return '#FFD700'; // Oro
      case 1: return '#C0C0C0'; // Plata
      case 2: return '#CD7F32'; // Bronce
      default: return theme.palette.primary.main;
    }
  };

  const getRankingIcon = (position) => {
    if (position < 3) {
      return <EmojiEvents sx={{ color: getRankingColor(position) }} />;
    }
    return <Star sx={{ color: 'text.secondary' }} />;
  };

  const PlayerRankingCard = ({ player, position, type }) => (
    <Card 
      sx={{ 
        mb: 2,
        background: position < 3 
          ? `linear-gradient(135deg, ${alpha(getRankingColor(position), 0.1)}, ${alpha(getRankingColor(position), 0.05)})`
          : 'background.paper',
        border: position < 3 ? `2px solid ${getRankingColor(position)}` : '1px solid',
        borderColor: position < 3 ? getRankingColor(position) : 'divider'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              #{position + 1}
            </Typography>
            {getRankingIcon(position)}
          </Box>
          
          <Avatar
            src={player.avatar}
            sx={{ 
              width: 60, 
              height: 60,
              border: position < 3 ? `3px solid ${getRankingColor(position)}` : 'none'
            }}
          >
            {player.nombre?.charAt(0)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="600">
              {player.nombre || 'Jugador'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {player.posicion} • {player.ciudad || 'Sin especificar'}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {player.verificado && (
                <Chip
                  size="small"
                  label="Verificado"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                size="small"
                label={`Nivel ${player.nivel || 1}`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {type === 'wins' ? player.partidosGanados || 0 : player.golesAnotados || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {type === 'wins' ? 'Victorias' : 'Goles'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando rankings...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, #FFD700)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🏆 Top Jugadores
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Los mejores jugadores de PartidoHoy
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab 
            icon={<EmojiEvents />} 
            label="Top por Victorias" 
            iconPosition="start"
          />
          <Tab 
            icon={<SportsSoccer />} 
            label="Top por Goles" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Content */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents color="primary" />
            Jugadores con más Victorias
          </Typography>
          {topByWins.length > 0 ? (
            topByWins.map((player, index) => (
              <PlayerRankingCard 
                key={player.id || index} 
                player={player} 
                position={index} 
                type="wins"
              />
            ))
          ) : (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No hay datos de victorias disponibles
            </Typography>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsSoccer color="primary" />
            Jugadores con más Goles
          </Typography>
          {topByGoals.length > 0 ? (
            topByGoals.map((player, index) => (
              <PlayerRankingCard 
                key={player.id || index} 
                player={player} 
                position={index} 
                type="goals"
              />
            ))
          ) : (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No hay datos de goles disponibles
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default TopPlayers;