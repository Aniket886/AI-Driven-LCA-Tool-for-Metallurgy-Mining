import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Import components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import AssessmentForm from './components/AssessmentForm';
import ComparisonTool from './components/ComparisonTool';
import VisualizationDashboard from './components/VisualizationDashboard';
import ReportsPage from './components/ReportsPage';
import HelpPage from './components/HelpPage';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  const handleAssessmentComplete = (assessmentData) => {
    setCurrentAssessment(assessmentData);
    setAssessmentHistory(prev => [assessmentData, ...prev.slice(0, 9)]); // Keep last 10 assessments
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app-container">
          {/* Header */}
          <AppBar position="static" elevation={2}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                AI-Driven LCA Tool for Metallurgy & Mining
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Smart India Hackathon 2025
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Navigation */}
          <Navigation />

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    currentAssessment={currentAssessment}
                    assessmentHistory={assessmentHistory}
                  />
                } 
              />
              <Route 
                path="/assess" 
                element={
                  <AssessmentForm 
                    onAssessmentComplete={handleAssessmentComplete}
                  />
                } 
              />
              <Route 
                path="/compare" 
                element={<ComparisonTool />} 
              />
              <Route 
                path="/visualize" 
                element={
                  <VisualizationDashboard 
                    currentAssessment={currentAssessment}
                    assessmentHistory={assessmentHistory}
                  />
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ReportsPage 
                    currentAssessment={currentAssessment}
                    assessmentHistory={assessmentHistory}
                  />
                } 
              />
              <Route 
                path="/help" 
                element={<HelpPage />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>

          {/* Footer */}
          <Box 
            component="footer" 
            sx={{ 
              bgcolor: 'primary.dark', 
              color: 'white', 
              py: 2, 
              mt: 'auto' 
            }}
          >
            <Container maxWidth="xl">
              <Typography variant="body2" align="center">
                © 2025 AI-Driven LCA Tool - Advancing Circularity and Sustainability in Metallurgy
              </Typography>
            </Container>
          </Box>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;