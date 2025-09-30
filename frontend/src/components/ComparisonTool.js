import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Delete,
  Compare,
  TrendingUp,
  TrendingDown,
  Remove,
  Nature,
  Speed,
  Loop,
  Water,
  LocalFireDepartment
} from '@mui/icons-material';
// import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import axios from 'axios';

const ComparisonTool = ({ assessmentHistory }) => {
  const [selectedAssessments, setSelectedAssessments] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [availableAssessments, setAvailableAssessments] = useState([]);

  useEffect(() => {
    // Filter assessments that have results
    const validAssessments = assessmentHistory.filter(assessment => 
      assessment.results && Object.keys(assessment.results).length > 0
    );
    setAvailableAssessments(validAssessments);
  }, [assessmentHistory]);

  const handleAddAssessment = (assessmentIndex) => {
    if (selectedAssessments.length < 4 && !selectedAssessments.includes(assessmentIndex)) {
      setSelectedAssessments([...selectedAssessments, assessmentIndex]);
    }
  };

  const handleRemoveAssessment = (assessmentIndex) => {
    setSelectedAssessments(selectedAssessments.filter(index => index !== assessmentIndex));
    setComparisonResults(null);
  };

  const runComparison = async () => {
    if (selectedAssessments.length < 2) {
      setError('Please select at least 2 assessments to compare');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const assessmentsData = selectedAssessments.map(index => availableAssessments[index]);
      const response = await axios.post('http://localhost:5000/api/compare', {
        assessments: assessmentsData
      });
      setComparisonResults(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred during comparison');
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value, metric) => {
    // Lower is better for carbon footprint, energy, water, waste
    const lowerIsBetter = ['carbon_footprint', 'energy_consumption', 'water_usage', 'waste_generation'];
    // Higher is better for sustainability, circularity, efficiency
    const higherIsBetter = ['sustainability_score', 'circularity_index', 'material_efficiency', 'recycling_potential'];

    if (lowerIsBetter.includes(metric)) {
      return value < 50 ? 'success' : value < 100 ? 'warning' : 'error';
    } else if (higherIsBetter.includes(metric)) {
      return value > 80 ? 'success' : value > 60 ? 'warning' : 'error';
    }
    return 'primary';
  };

  const getImprovementIcon = (current, baseline) => {
    const improvement = ((baseline - current) / baseline) * 100;
    if (improvement > 5) return <TrendingUp color="success" />;
    if (improvement < -5) return <TrendingDown color="error" />;
    return <Remove color="warning" />;
  };

  const renderComparisonTable = () => {
    if (!comparisonResults) return null;

    const metrics = [
      { key: 'carbon_footprint', label: 'Carbon Footprint', unit: 'kg CO₂', icon: <Nature /> },
      { key: 'energy_consumption', label: 'Energy Consumption', unit: 'kWh', icon: <LocalFireDepartment /> },
      { key: 'water_usage', label: 'Water Usage', unit: 'L', icon: <Water /> },
      { key: 'sustainability_score', label: 'Sustainability Score', unit: '/100', icon: <Speed /> },
      { key: 'circularity_index', label: 'Circularity Index', unit: '', icon: <Loop /> },
      { key: 'material_efficiency', label: 'Material Efficiency', unit: '%', icon: <TrendingUp /> }
    ];

    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Metric
                  </Typography>
                </Box>
              </TableCell>
              {selectedAssessments.map((index, i) => {
                const assessment = availableAssessments[index];
                return (
                  <TableCell key={i} align="center">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {assessment.metal_type?.charAt(0).toUpperCase() + assessment.metal_type?.slice(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {assessment.production_route?.charAt(0).toUpperCase() + assessment.production_route?.slice(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                );
              })}
              <TableCell align="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Best
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric) => {
              const values = selectedAssessments.map(index => 
                availableAssessments[index].results[metric.key] || 0
              );
              const bestValue = metric.key === 'carbon_footprint' || metric.key === 'energy_consumption' || metric.key === 'water_usage'
                ? Math.min(...values)
                : Math.max(...values);
              const bestIndex = values.indexOf(bestValue);

              return (
                <TableRow key={metric.key}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {metric.icon}
                      <Typography variant="body2">
                        {metric.label}
                      </Typography>
                    </Box>
                  </TableCell>
                  {values.map((value, i) => (
                    <TableCell key={i} align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Chip
                          label={`${value.toFixed(1)} ${metric.unit}`}
                          color={i === bestIndex ? 'success' : getMetricColor(value, metric.key)}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        {i > 0 && getImprovementIcon(value, values[0])}
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Chip
                      label={selectedAssessments[bestIndex] !== undefined ? 
                        `Option ${bestIndex + 1}` : 'N/A'}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderComparisonCharts = () => {
    if (!comparisonResults) return null;

    const assessmentLabels = selectedAssessments.map((index, i) => {
      const assessment = availableAssessments[index];
      return `${assessment.metal_type} (${assessment.production_route})`;
    });

    const carbonData = selectedAssessments.map(index => 
      availableAssessments[index].results.carbon_footprint || 0
    );

    const sustainabilityData = selectedAssessments.map(index => 
      availableAssessments[index].results.sustainability_score || 0
    );

    const circularityData = selectedAssessments.map(index => 
      availableAssessments[index].results.circularity_index || 0
    );

    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carbon Footprint Comparison
              </Typography>
              <Plot
                data={[{
                  x: assessmentLabels,
                  y: carbonData,
                  type: 'bar',
                  marker: { color: '#f44336' }
                }]}
                layout={{
                  height: 300,
                  margin: { t: 20, b: 80, l: 50, r: 20 },
                  yaxis: { title: 'kg CO₂' },
                  xaxis: { tickangle: -45 }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sustainability Score
              </Typography>
              <Plot
                data={[{
                  x: assessmentLabels,
                  y: sustainabilityData,
                  type: 'bar',
                  marker: { color: '#4caf50' }
                }]}
                layout={{
                  height: 300,
                  margin: { t: 20, b: 80, l: 50, r: 20 },
                  yaxis: { title: 'Score (0-100)' },
                  xaxis: { tickangle: -45 }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Circularity Index
              </Typography>
              <Plot
                data={[{
                  x: assessmentLabels,
                  y: circularityData,
                  type: 'bar',
                  marker: { color: '#9c27b0' }
                }]}
                layout={{
                  height: 300,
                  margin: { t: 20, b: 80, l: 50, r: 20 },
                  yaxis: { title: 'Index (0-1)' },
                  xaxis: { tickangle: -45 }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <div>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Pathway Comparison Tool
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Compare different production pathways to identify the most sustainable options
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {availableAssessments.length === 0 ? (
            <Alert severity="info">
              No completed assessments available for comparison. Please complete some assessments first.
            </Alert>
          ) : (
            <>
              {/* Assessment Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Select Assessments to Compare (Max 4)
                </Typography>
                <Grid container spacing={2}>
                  {availableAssessments.map((assessment, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedAssessments.includes(index) ? 2 : 1,
                          borderColor: selectedAssessments.includes(index) ? 'primary.main' : 'divider'
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {assessment.metal_type?.charAt(0).toUpperCase() + assessment.metal_type?.slice(1)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {assessment.production_route?.charAt(0).toUpperCase() + assessment.production_route?.slice(1)} Route
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Score: {assessment.results?.sustainability_score?.toFixed(1)}/100
                              </Typography>
                            </Box>
                            {selectedAssessments.includes(index) ? (
                              <Tooltip title="Remove from comparison">
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleRemoveAssessment(index)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Add to comparison">
                                <IconButton 
                                  color="primary" 
                                  onClick={() => handleAddAssessment(index)}
                                  disabled={selectedAssessments.length >= 4}
                                >
                                  <Add />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Selected Assessments */}
              {selectedAssessments.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Selected for Comparison ({selectedAssessments.length}/4)
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selectedAssessments.map((index, i) => {
                      const assessment = availableAssessments[index];
                      return (
                        <Chip
                          key={i}
                          label={`${assessment.metal_type} (${assessment.production_route})`}
                          onDelete={() => handleRemoveAssessment(index)}
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Compare Button */}
              <Box display="flex" justifyContent="center" sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <Compare />}
                  onClick={runComparison}
                  disabled={selectedAssessments.length < 2 || loading}
                >
                  {loading ? 'Comparing...' : 'Run Comparison'}
                </Button>
              </Box>

              {/* Comparison Results */}
              {comparisonResults && (
                <Box>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Comparison Results
                  </Typography>

                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Table View" />
                    <Tab label="Chart View" />
                    <Tab label="Recommendations" />
                  </Tabs>

                  {tabValue === 0 && renderComparisonTable()}
                  {tabValue === 1 && renderComparisonCharts()}
                  {tabValue === 2 && (
                    <Box sx={{ mt: 3 }}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Key Recommendations:
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          <li>Consider switching to the pathway with the highest sustainability score</li>
                          <li>Focus on improving circularity metrics through increased recycled content</li>
                          <li>Optimize energy consumption by using renewable energy sources</li>
                          <li>Implement water conservation measures to reduce environmental impact</li>
                        </ul>
                      </Alert>
                      {comparisonResults.recommendations && (
                        <Alert severity="info">
                          <Typography variant="body2">
                            {comparisonResults.recommendations}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonTool;