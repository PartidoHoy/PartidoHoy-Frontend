import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestConnection from './pages/TestConnection';
import SimpleAuth from './pages/SimpleAuth';
import DetailedTestConnection from './pages/DetailedTestConnection';
import UserProfile from './pages/UserProfile';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import CompleteProfile from './pages/CompleteProfile';
import Players from './pages/Players';
import Matches from './pages/Matches';
import CreateMatch from './pages/CreateMatch';
import Teams from './pages/Teams';
import Calendar from './pages/Calendar';
import Stats from './pages/Stats';

// Tema personalizado para PartidoHoy
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a5f3f', // Verde fútbol
    },
    secondary: {
      main: '#4ade80',
    },
  },
  typography: {
    h1: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-connection" element={<TestConnection />} />
            <Route path="/detailed-test" element={<DetailedTestConnection />} />
            <Route path="/simple-auth" element={<SimpleAuth />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complete-profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompleteProfile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserList />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/:userId" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserDetail />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/players" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Players />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Matches />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-match" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateMatch />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teams" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Teams />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stats" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Stats />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
