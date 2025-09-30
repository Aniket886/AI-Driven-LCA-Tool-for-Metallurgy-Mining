import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timeline,
  Speed,
  Nature,
  Loop
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

const Dashboard = ({ currentAssessment, assessmentHistory }) => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalAssessments: 0,
    avgCarbonFootprint: 0,
    avgSustainabilityScore: 0,
    avgCircularityIndex: 0
  });

  useEffect(() => {
    if (assessmentHistory.length > 0) {
      const stats = assessmentHistory.reduce((acc, assessment) => {
        const results = assessment.results || {};
        return {
          totalAssessments: acc.totalAssessments + 1,
          avgCarbonFootprint: acc.avgCarbonFootprint + (results.carbon_footprint || 0),
          avgSustainabilityScore: acc.avgSustainabilityScore + (results.sustainability_score || 0),
          avgCircularityIndex: acc.avgCircularityIndex + (results.circularity_index || 0)
        };
      }, { totalAssessments: 0, avgCarbonFootprint: 0, avgSustainabilityScore: 0, avgCircularityIndex: 0 });

      setDashboardStats({
        totalAssessments: stats.totalAssessments,
        avgCarbonFootprint: stats.avgCarbonFootprint / stats.totalAssessments,
        avgSustainabilityScore: stats.avgSustainabilityScore / stats.totalAssessments,
        avgCircularityIndex: stats.avgCircularityIndex / stats.totalAssessments
      });
    }
  }, [assessmentHistory]);

  const getImpactColor = (value, type) => {
    if (type === 'carbon') {
      if (value < 50) return 'success';
      if (value < 200) return 'warning';
      return 'error';
    }
    if (type === 'sustainability' || type === 'circularity') {
      if (value > 0.8 || value > 80) return 'success';
      if (value > 0.6 || value > 60) return 'warning';
      return 'error';
    }
    return 'primary';
  };

  const StatCard = ({ title, value, unit, icon, color, description }) => (
    <div>
      <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Box sx={{ color: color, mr: 2 }}>
              {icon}
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: color, mb: 1 }}>
            {typeof value === 'number' ? value.toFixed(1) : value}
            <Typography component="span" variant="h6" sx={{ ml: 1, color: 'text.secondary' }}>
              {unit}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Box>
      {/* Welcome Section */}
      <div>
        <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 300 }}>
            Welcome to AI-Driven LCA Tool
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Advancing Circularity and Sustainability in Metallurgy and Mining
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/assess')}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Start New Assessment
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/compare')}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Compare Pathways
            </Button>
          </Box>
        </Paper>
      </div>

      {/* Current Assessment Alert */}
      {currentAssessment && (
        <div>
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/visualize')}>
                View Details
              </Button>
            }
          >
            Latest assessment completed for {currentAssessment.metal_type} with sustainability score: {currentAssessment.results?.sustainability_score?.toFixed(1)}/100
          </Alert>
        </div>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assessments"
            value={dashboardStats.totalAssessments}
            unit=""
            icon={<Assessment fontSize="large" />}
            color="#1976d2"
            description="Completed LCA evaluations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Carbon Footprint"
            value={dashboardStats.avgCarbonFootprint}
            unit="kg CO₂"
            icon={<Nature fontSize="large" />}
            color="#4caf50"
            description="Environmental impact metric"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Sustainability"
            value={dashboardStats.avgSustainabilityScore}
            unit="/100"
            icon={<TrendingUp fontSize="large" />}
            color="#ff9800"
            description="Overall performance score"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Circularity"
            value={dashboardStats.avgCircularityIndex}
            unit=""
            icon={<Loop fontSize="large" />}
            color="#9c27b0"
            description="Circular economy index"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Assessments */}
        <Grid item xs={12} md={8}>
          <div>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Timeline sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Recent Assessments
                  </Typography>
                </Box>
                {assessmentHistory.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No assessments yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start your first LCA assessment to see results here
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/assess')}>
                      Create Assessment
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {assessmentHistory.slice(0, 5).map((assessment, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <Speed sx={{ color: getImpactColor(assessment.results?.sustainability_score, 'sustainability') + '.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {assessment.metal_type?.charAt(0).toUpperCase() + assessment.metal_type?.slice(1)} - {assessment.production_route?.charAt(0).toUpperCase() + assessment.production_route?.slice(1)}
                                </Typography>
                                <Chip 
                                  label={`${assessment.results?.sustainability_score?.toFixed(0)}/100`}
                                  size="small"
                                  color={getImpactColor(assessment.results?.sustainability_score, 'sustainability')}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Carbon: {assessment.results?.carbon_footprint?.toFixed(1)} kg CO₂ | 
                                  Circularity: {assessment.results?.circularity_index?.toFixed(2)}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={assessment.results?.sustainability_score || 0} 
                                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                  color={getImpactColor(assessment.results?.sustainability_score, 'sustainability')}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < Math.min(assessmentHistory.length - 1, 4) && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <div>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assessment />}
                    onClick={() => navigate('/assess')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    New LCA Assessment
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Timeline />}
                    onClick={() => navigate('/compare')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Compare Pathways
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/visualize')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    View Visualizations
                  </Button>
                  {currentAssessment && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/reports')}
                      sx={{ py: 1.5 }}
                    >
                      Generate Report
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;