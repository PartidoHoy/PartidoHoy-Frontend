import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Sports,
  Star,
  LocationOn,
  Edit,
  Person,
  EmojiEvents
} from '@mui/icons-material';

const UserCard = ({ 
  user, 
  showEditButton = false, 
  onEdit, 
  variant = 'default', // 'default', 'compact', 'detailed'
  onClick 
}) => {
  // Datos por defecto para cuando no hay información completa
  const defaultUser = {
    id: '',
    nombre: 'Usuario',
    email: '',
    posicion: 'Sin especificar',
    nivel: 'Principiante',
    foto: null,
    ubicacion: 'No especificada',
    estadisticas: {
      partidosJugados: 0,
      goles: 0,
      asistencias: 0,
      rating: 0
    },
    ...user
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(defaultUser);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Evitar que se ejecute el onClick del card
    if (onEdit) {
      onEdit(defaultUser);
    }
  };

  // Función para obtener el color según el nivel
  const getNivelColor = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'profesional':
        return 'success';
      case 'avanzado':
        return 'info';
      case 'intermedio':
        return 'warning';
      case 'principiante':
      default:
        return 'default';
    }
  };

  // Función para obtener el color según la posición
  const getPosicionColor = (posicion) => {
    switch (posicion?.toLowerCase()) {
      case 'portero':
        return 'secondary';
      case 'defensa':
        return 'primary';
      case 'centrocampista':
        return 'info';
      case 'delantero':
        return 'success';
      default:
        return 'default';
    }
  };

  // Renderizado compacto para listados
  if (variant === 'compact') {
    return (
      <Card 
        sx={{ 
          maxWidth: 280, 
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: 4
          } : {}
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ textAlign: 'center', pb: 2 }}>
          <Avatar
            src={defaultUser.foto}
            sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
          >
            <Person />
          </Avatar>
          <Typography variant="h6" noWrap>
            {defaultUser.nombre}
          </Typography>
          <Chip 
            size="small" 
            label={defaultUser.posicion} 
            color={getPosicionColor(defaultUser.posicion)}
            sx={{ mt: 0.5 }}
          />
        </CardContent>
      </Card>
    );
  }

  // Renderizado por defecto
  return (
    <Card 
      sx={{ 
        maxWidth: 350, 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 6
        } : {}
      }}
      onClick={handleCardClick}
    >
      {/* Header con foto y botón editar */}
      <Box sx={{ position: 'relative', textAlign: 'center', pt: 3, pb: 2 }}>
        <Avatar
          src={defaultUser.foto}
          sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto',
            border: '3px solid',
            borderColor: 'primary.main'
          }}
        >
          <Person sx={{ fontSize: 40 }} />
        </Avatar>
        
        {showEditButton && (
          <Tooltip title="Editar perfil">
            <IconButton 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'primary.light' }
              }}
              onClick={handleEditClick}
            >
              <Edit />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <CardContent sx={{ pt: 0 }}>
        {/* Información básica */}
        <Typography variant="h5" component="h2" textAlign="center" gutterBottom>
          {defaultUser.nombre}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Chip 
            icon={<Sports />}
            label={defaultUser.posicion} 
            color={getPosicionColor(defaultUser.posicion)}
            size="small"
          />
          <Chip 
            icon={<Star />}
            label={defaultUser.nivel} 
            color={getNivelColor(defaultUser.nivel)}
            size="small"
          />
        </Box>

        {/* Ubicación */}
        {defaultUser.ubicacion && defaultUser.ubicacion !== 'No especificada' && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LocationOn sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {defaultUser.ubicacion}
            </Typography>
          </Box>
        )}

        {/* Estadísticas */}
        {variant === 'detailed' && defaultUser.estadisticas && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEvents sx={{ mr: 0.5, fontSize: 18 }} />
              Estadísticas
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Partidos
                </Typography>
                <Typography variant="h6">
                  {defaultUser.estadisticas.partidosJugados || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Goles
                </Typography>
                <Typography variant="h6">
                  {defaultUser.estadisticas.goles || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Asistencias
                </Typography>
                <Typography variant="h6">
                  {defaultUser.estadisticas.asistencias || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
                <Typography variant="h6">
                  {defaultUser.estadisticas.rating ? `${defaultUser.estadisticas.rating}/5` : 'N/A'}
                </Typography>
                {defaultUser.estadisticas.rating && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(defaultUser.estadisticas.rating / 5) * 100}
                    sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;