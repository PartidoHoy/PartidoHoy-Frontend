import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Group,
  Star,
  Favorite,
  Share,
  PlayArrow,
  FavoriteBorder
} from '@mui/icons-material';

const MatchCard = ({ match, onJoin, onFavorite, isFavorited = false }) => {
  const theme = useTheme();

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'high': return 'Urgente';
      case 'medium': return 'Pronto';
      default: return 'Disponible';
    }
  };

  const playersProgress = (parseInt(match.players.split('/')[0]) / parseInt(match.players.split('/')[1])) * 100;

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
        }
      }}
    >
      {/* Status Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1
        }}
      >
        <Chip
          label={getUrgencyLabel(match.urgency)}
          color={getUrgencyColor(match.urgency)}
          size="small"
          sx={{
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette[getUrgencyColor(match.urgency)].main, 0.9)
          }}
        />
      </Box>

      {/* Card Image/Header */}
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: 'white'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="700" sx={{ mb: 1 }}>
            {match.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 16 }} />
            <Typography variant="body2">
              {match.date} - {match.time}
            </Typography>
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Location & Distance */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            {match.location}
          </Typography>
          <Chip 
            label={match.distance} 
            size="small" 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          />
        </Box>

        {/* Players Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">
                Jugadores
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="600" color="primary">
              {match.players}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={playersProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`
              }
            }}
          />
        </Box>

        {/* Organizer & Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
              {match.organizer.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {match.organizer}
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="700" color="primary.main">
            {match.price}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => onJoin(match.id)}
          startIcon={<PlayArrow />}
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          }}
        >
          Unirse
        </Button>
        
        <Tooltip title="Agregar a favoritos">
          <IconButton
            onClick={() => onFavorite(match.id)}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                borderColor: theme.palette.error.main
              }
            }}
          >
            {isFavorited ? 
              <Favorite sx={{ color: 'error.main' }} /> : 
              <FavoriteBorder sx={{ color: 'text.secondary' }} />
            }
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Compartir">
          <IconButton
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main
              }
            }}
          >
            <Share sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default MatchCard;