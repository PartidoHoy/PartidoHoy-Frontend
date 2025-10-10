import React, { useState } from 'react';
import { SimpleRegisterForm } from '../components/auth/SimpleRegisterForm';
import { SimpleLoginForm } from '../components/auth/SimpleLoginForm';

const SimpleAuth = () => {
  const [activeTab, setActiveTab] = useState('login');

  const handleLoginSuccess = (response) => {
    console.log('Login exitoso:', response);
    alert('¡Login exitoso! Token guardado en localStorage');
    // Aquí puedes redirigir al dashboard o actualizar el estado global
  };

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    },
    tabs: {
      display: 'flex',
      marginBottom: '20px'
    },
    tab: {
      flex: 1,
      padding: '10px',
      border: 'none',
      backgroundColor: '#f5f5f5',
      cursor: 'pointer',
      borderRadius: '4px 4px 0 0'
    },
    activeTab: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <h1>PartidoHoy - Auth Simple</h1>
      
      <div style={styles.tabs}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'login' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'register' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('register')}
        >
          Registro
        </button>
      </div>

      <div style={styles.form}>
        {activeTab === 'login' ? (
          <SimpleLoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <SimpleRegisterForm />
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Endpoints configurados:</p>
        <ul>
          <li>POST /auth/register</li>
          <li>POST /auth/login</li>
        </ul>
        <p>Backend: http://localhost:8080</p>
      </div>
    </div>
  );
};

export default SimpleAuth;