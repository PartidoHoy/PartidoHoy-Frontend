import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Star,
  Message,
  PersonAdd,
  SportsSoccer,
  EmojiEvents,
  Verified
} from '@mui/icons-material';

const PlayerCard = ({ player, onMessage, onAddFriend, onViewProfile }) => {
  const theme = useTheme();

  const getPositionColor = (position) => {
    switch (position.toLowerCase()) {
      case 'portera':
      case 'portero': return 'error';
      case 'defensa': return 'info';
      case 'mediocampista': 
      case 'centrocampista': return 'success';
      case 'delantera':
      case 'delantero': return 'warning';
      default: return 'primary';
    }
  };

  const getPositionIcon = (position) => {
    switch (position.toLowerCase()) {
      case 'portera':
      case 'portero': return '🥅';
      case 'defensa': return '🛡️';
      case 'mediocampista':
      case 'centrocampista': return '⚡';
      case 'delantera':
      case 'delantero': return '🎯';
      default: return '⚽';
    }
  };

  // Funciones por defecto si no se proporcionan
  const handleMessage = onMessage || (() => console.log(`Mensaje a ${player.nombre}`));
  const handleAddFriend = onAddFriend || (() => console.log(`Agregar amigo: ${player.nombre}`));
  const handleViewProfile = onViewProfile || (() => console.log(`Ver perfil: ${player.nombre}`));

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
        }
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          zIndex: 0
        }}
      />

      <CardContent sx={{ p: 3, position: 'relative', textAlign: 'center' }}>
        {/* Verified Badge */}
        {player.verificado && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1
            }}
          >
            <Tooltip title="Jugador verificado">
              <Verified sx={{ color: 'primary.main', fontSize: 20 }} />
            </Tooltip>
          </Box>
        )}

        {/* Avatar */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
          <Avatar
            src={player.avatar}
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              border: `4px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[4]
            }}
          >
            {player.nombre.charAt(0)}
          </Avatar>
          
          {/* Position Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows[2],
              fontSize: '1.2rem'
            }}
          >
            {getPositionIcon(player.posicion)}
          </Box>
        </Box>

        {/* Player Info */}
        <Typography variant="h6" fontWeight="700" gutterBottom>
          {player.nombre}
        </Typography>
        
        <Chip
          label={player.posicion}
          color={getPositionColor(player.posicion)}
          size="small"
          sx={{ mb: 2, fontWeight: 600 }}
        />

        {/* Stats Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <Star sx={{ color: 'warning.main', fontSize: 18 }} />
              <Typography variant="h6" fontWeight="700" color="warning.main">
                {player.rating}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Rating
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <SportsSoccer sx={{ color: 'primary.main', fontSize: 18 }} />
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {player.partidosJugados}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Partidos
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <EmojiEvents sx={{ color: 'success.main', fontSize: 18 }} />
              <Typography variant="h6" fontWeight="700" color="success.main">
                {player.golesAnotados || 0}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Goles
            </Typography>
          </Box>
        </Box>

        {/* Location */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          📍 {player.ciudad}
        </Typography>

        {/* Availability Status */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            label={player.disponible ? 'Disponible' : 'No disponible'}
            color={player.disponible ? 'success' : 'default'}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              fontWeight: 500
            }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleViewProfile(player.id)}
          sx={{
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600
          }}
        >
          Ver Perfil
        </Button>
        
        <Tooltip title="Enviar mensaje">
          <IconButton
            onClick={() => handleMessage(player.id)}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main
              }
            }}
          >
            <Message sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Agregar amigo">
          <IconButton
            onClick={() => handleAddFriend(player.id)}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderColor: theme.palette.success.main
              }
            }}
          >
            <PersonAdd sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default PlayerCard;