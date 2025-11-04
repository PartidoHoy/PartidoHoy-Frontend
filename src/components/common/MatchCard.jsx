import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  Group,
  Star,
  PersonAdd
} from '@mui/icons-material';

const MatchCard = ({ match, onJoin }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minWidth: 260,
        maxWidth: 340,
        mx: 'auto',
        my: 2,
        p: 0,
        background: 'white',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 8 }
      }}
    >
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>
          {match.titulo}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {new Date(match.fecha).toLocaleDateString()} {match.hora}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {match.ubicacion}, {match.ciudad}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Group sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {match.jugadoresActuales}/{match.capacidadMaxima} jugadores
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip size="small" label={match.nivelRequerido} color="primary" />
          <Chip size="small" label={match.tipoCancha} />
          <Chip size="small" label={`Tipo: ${match.tipoPartido || 'N/A'}`} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip size="small" label={`Árbitro: ${match.incluyeArbitro ? 'Sí' : 'No'}`} />
          <Chip size="small" label={`Balones: ${match.incluyeBalones ? 'Sí' : 'No'}`} />
          <Chip size="small" label={`Solo Hombres: ${match.soloHombres ? 'Sí' : 'No'}`} />
          <Chip size="small" label={`Solo Mujeres: ${match.soloMujeres ? 'Sí' : 'No'}`} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {match.descripcion}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            src={match.organizador?.avatar}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {match.organizador?.nombre?.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {match.organizador?.nombre}
          </Typography>
          <Star sx={{ fontSize: 16, color: 'warning.main', ml: 1, mr: 0.5 }} />
          <Typography variant="caption">
            {match.organizador?.rating || 'N/A'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}
          onClick={() => onJoin(match.id)}
        >
          Apuntarse
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchCard;