import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Stats = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Estadísticas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Revisa tus estadísticas de juego y progreso deportivo.
        </Typography>
      </Box>
    </Container>
  );
};

export default Stats;