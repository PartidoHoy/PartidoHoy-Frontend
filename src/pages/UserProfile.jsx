import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PhotoCamera,
  Edit,
  Save,
  Cancel,
  Person,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import UserCard from '../components/user/UserCard';

const UserProfile = () => {
  const { user: _authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoDialog, setPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [userStats, setUserStats] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    posicion: '',
    nivel: '',
    ubicacion: '',
    telefono: '',
    descripcion: ''
  });

  // Opciones para los selects
  const posiciones = [
    'Portero',
    'Defensa',
    'Centrocampista',
    'Delantero'
  ];

  const niveles = [
    'Principiante',
    'Intermedio',
    'Avanzado',
    'Profesional'
  ];

  // Función para mapear posiciones legacy a las nuevas opciones
  const mapearPosicionLegacy = (posicion) => {
    if (!posicion) return '';
    
    const posicionLower = posicion.toLowerCase();
    
    // Mapear posiciones específicas a categorías generales
    if (posicionLower.includes('portero') || posicionLower.includes('arquero')) {
      return 'Portero';
    }
    if (posicionLower.includes('lateral') || 
        posicionLower.includes('defensa') || 
        posicionLower.includes('central') ||
        posicionLower.includes('libero')) {
      return 'Defensa';
    }
    if (posicionLower.includes('medio') || 
        posicionLower.includes('centro') ||
        posicionLower.includes('volante') ||
        posicionLower.includes('centrocampista')) {
      return 'Centrocampista';
    }
    if (posicionLower.includes('delantero') || 
        posicionLower.includes('atacante') ||
        posicionLower.includes('extremo') ||
        posicionLower.includes('punta')) {
      return 'Delantero';
    }
    
    // Si no hay coincidencia, verificar si es una de las opciones válidas
    if (posiciones.includes(posicion)) {
      return posicion;
    }
    
    // Por defecto, devolver vacío para que el usuario seleccione
    console.warn(`⚠️ Posición desconocida: "${posicion}", requiere mapeo manual`);
    return '';
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos del usuario y estadísticas
      const [userData, statsData] = await Promise.all([
        userService.getCurrentUser(),
        userService.getUserStats().catch(() => ({
          partidosJugados: 0,
          goles: 0,
          asistencias: 0,
          rating: 0
        }))
      ]);

      setUser(userData);
      setUserStats(statsData);
      setFormData({
        nombre: userData.nombre || '',
        email: userData.email || '',
        posicion: mapearPosicionLegacy(userData.posicion) || '',
        nivel: userData.nivel || 'Principiante',
        ubicacion: userData.ubicacion || '',
        telefono: userData.telefono || '',
        descripcion: userData.descripcion || ''
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Error al cargar los datos del usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      posicion: mapearPosicionLegacy(user.posicion) || '',
      nivel: user.nivel || 'Principiante',
      ubicacion: user.ubicacion || '',
      telefono: user.telefono || '',
      descripcion: user.descripcion || ''
    });
    setEditMode(false);
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen.');
        return;
      }

      setSelectedPhoto(file);
      setPhotoDialog(true);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    try {
      setSaving(true);
      setError('');
      
      const result = await userService.uploadProfilePhoto(selectedPhoto);
      setUser(prev => ({ ...prev, foto: result.photoUrl }));
      setPhotoDialog(false);
      setSelectedPhoto(null);
      setSuccess('Foto de perfil actualizada correctamente');
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Error al subir la foto: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando perfil...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No se pudo cargar la información del usuario.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Columna izquierda - Preview del perfil */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Vista Previa
            </Typography>
            <UserCard 
              user={{
                ...user,
                ...formData,
                estadisticas: userStats
              }}
              variant="detailed"
            />
          </Paper>
        </Grid>

        {/* Columna derecha - Formulario de edición */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Mi Perfil
              </Typography>
              {!editMode && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                >
                  Editar Perfil
                </Button>
              )}
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Sección de foto */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Foto de Perfil
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={user.foto}
                    sx={{ width: 80, height: 80 }}
                  >
                    <Person sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoChange}
                    />
                    <label htmlFor="photo-upload">
                      <IconButton color="primary" component="span">
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    <Typography variant="body2" color="text.secondary">
                      Haz clic para cambiar tu foto
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Formulario */}
            <Box component="form">
              <Grid container spacing={3}>
                {/* Información básica */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Información Básica
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true} // Email no se puede cambiar
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Posición</InputLabel>
                    <Select
                      name="posicion"
                      value={formData.posicion}
                      onChange={handleInputChange}
                      label="Posición"
                    >
                      {posiciones.map((pos) => (
                        <MenuItem key={pos} value={pos}>
                          {pos}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Nivel</InputLabel>
                    <Select
                      name="nivel"
                      value={formData.nivel}
                      onChange={handleInputChange}
                      label="Nivel"
                    >
                      {niveles.map((nivel) => (
                        <MenuItem key={nivel} value={nivel}>
                          {nivel}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ubicación"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="descripcion"
                    multiline
                    rows={4}
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="Cuéntanos sobre ti, tu experiencia jugando fútbol..."
                  />
                </Grid>

                {/* Estadísticas */}
                {userStats && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Estadísticas
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Partidos Jugados"
                        value={userStats.partidosJugados || 0}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Goles"
                        value={userStats.goles || 0}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Asistencias"
                        value={userStats.asistencias || 0}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Rating"
                        value={userStats.rating ? `${userStats.rating}/5` : 'N/A'}
                        disabled
                      />
                    </Grid>
                  </>
                )}

                {/* Botones de acción */}
                {editMode && (
                  <Grid item xs={12} sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={20} /> : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para confirmar subida de foto */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)}>
        <DialogTitle>Subir Foto de Perfil</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres subir esta foto como tu nueva foto de perfil?
          </Typography>
          {selectedPhoto && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img 
                src={URL.createObjectURL(selectedPhoto)} 
                alt="Preview" 
                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePhotoUpload} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Subir Foto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;