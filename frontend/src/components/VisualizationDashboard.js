import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  PieChart,
  BarChart,
  TrendingUp,
  Refresh,
  Download,
  Fullscreen
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';

const VisualizationDashboard = ({ currentAssessment, assessmentHistory }) => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    if (currentAssessment) {
      setSelectedAssessment(currentAssessment);
    } else if (assessmentHistory.length > 0) {
      setSelectedAssessment(assessmentHistory[assessmentHistory.length - 1]);
    }
  }, [currentAssessment, assessmentHistory]);

  const getLifecycleFlowData = () => {
    if (!selectedAssessment) return null;

    const stages = [
      { name: 'Raw Material\nExtraction', x: 1, y: 3, impact: 25 },
      { name: 'Processing &\nRefinement', x: 2, y: 3, impact: 35 },
      { name: 'Manufacturing', x: 3, y: 3, impact: 20 },
      { name: 'Use Phase', x: 4, y: 3, impact: 10 },
      { name: 'End of Life', x: 5, y: 3, impact: 10 }
    ];

    const recyclingStages = [
      { name: 'Collection', x: 5, y: 1, impact: 5 },
      { name: 'Sorting &\nProcessing', x: 4, y: 1, impact: 8 },
      { name: 'Recycled\nMaterial', x: 3, y: 1, impact: 12 },
      { name: 'Back to\nProduction', x: 2, y: 1, impact: 15 }
    ];

    return { stages, recyclingStages };
  };

  const renderLifecycleFlow = () => {
    const flowData = getLifecycleFlowData();
    if (!flowData) return null;

    const { stages, recyclingStages } = flowData;
    
    // Main lifecycle flow
    const mainFlow = {
      x: stages.map(s => s.x),
      y: stages.map(s => s.y),
      text: stages.map(s => s.name),
      mode: 'markers+text+lines',
      type: 'scatter',
      marker: {
        size: stages.map(s => s.impact),
        color: stages.map(s => s.impact),
        colorscale: 'Reds',
        showscale: true,
        colorbar: { title: 'Environmental Impact' }
      },
      line: { color: '#1976d2', width: 3 },
      textposition: 'top center',
      name: 'Linear Flow'
    };

    // Recycling flow
    const recyclingFlow = {
      x: recyclingStages.map(s => s.x),
      y: recyclingStages.map(s => s.y),
      text: recyclingStages.map(s => s.name),
      mode: 'markers+text+lines',
      type: 'scatter',
      marker: {
        size: recyclingStages.map(s => s.impact),
        color: recyclingStages.map(s => s.impact),
        colorscale: 'Greens',
        showscale: false
      },
      line: { color: '#4caf50', width: 3, dash: 'dash' },
      textposition: 'bottom center',
      name: 'Circular Flow'
    };

    // Connection arrows
    const connections = {
      x: [5, 5, 4, 3, 2, 2],
      y: [3, 2, 1.5, 1.5, 1.5, 2.5],
      mode: 'lines',
      type: 'scatter',
      line: { color: '#4caf50', width: 2 },
      showlegend: false
    };

    return (
      <Plot
        data={[mainFlow, recyclingFlow, connections]}
        layout={{
          title: 'Material Lifecycle Flow',
          height: 400,
          xaxis: { 
            showgrid: false, 
            zeroline: false, 
            showticklabels: false,
            range: [0.5, 5.5]
          },
          yaxis: { 
            showgrid: false, 
            zeroline: false, 
            showticklabels: false,
            range: [0.5, 3.5]
          },
          annotations: [
            {
              x: 3.5,
              y: 2,
              text: 'Circular Economy Loop',
              showarrow: true,
              arrowhead: 2,
              arrowsize: 1,
              arrowwidth: 2,
              arrowcolor: '#4caf50'
            }
          ]
        }}
        config={{ displayModeBar: false }}
        style={{ width: '100%' }}
      />
    );
  };

  const renderEnvironmentalImpactChart = () => {
    if (!selectedAssessment?.results) return null;

    const results = selectedAssessment.results;
    const categories = ['Carbon Footprint', 'Energy Use', 'Water Usage', 'Waste Generation'];
    const values = [
      results.carbon_footprint || 0,
      results.energy_consumption || 0,
      results.water_usage || 0,
      results.waste_generation || 0
    ];

    const chartData = chartType === 'bar' ? [{
      x: categories,
      y: values,
      type: 'bar',
      marker: { color: ['#f44336', '#ff9800', '#2196f3', '#9c27b0'] }
    }] : [{
      labels: categories,
      values: values,
      type: 'pie',
      marker: { colors: ['#f44336', '#ff9800', '#2196f3', '#9c27b0'] }
    }];

    return (
      <Plot
        data={chartData}
        layout={{
          title: 'Environmental Impact Breakdown',
          height: 400,
          margin: { t: 50, b: 50, l: 50, r: 50 }
        }}
        config={{ displayModeBar: false }}
        style={{ width: '100%' }}
      />
    );
  };

  const renderSustainabilityMetrics = () => {
    if (!selectedAssessment?.results) return null;

    const results = selectedAssessment.results;
    const metrics = [
      { name: 'Sustainability Score', value: results.sustainability_score || 0, max: 100 },
      { name: 'Circularity Index', value: (results.circularity_index || 0) * 100, max: 100 },
      { name: 'Material Efficiency', value: results.material_efficiency || 0, max: 100 },
      { name: 'Recycling Potential', value: results.recycling_potential || 0, max: 100 }
    ];

    return (
      <Grid container spacing={2}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {metric.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Plot
                    data={[{
                      type: 'indicator',
                      mode: 'gauge+number',
                      value: metric.value,
                      domain: { x: [0, 1], y: [0, 1] },
                      gauge: {
                        axis: { range: [null, metric.max] },
                        bar: { color: metric.value > 80 ? '#4caf50' : metric.value > 60 ? '#ff9800' : '#f44336' },
                        steps: [
                          { range: [0, 60], color: '#ffebee' },
                          { range: [60, 80], color: '#fff3e0' },
                          { range: [80, 100], color: '#e8f5e8' }
                        ],
                        threshold: {
                          line: { color: 'red', width: 4 },
                          thickness: 0.75,
                          value: 90
                        }
                      }
                    }]}
                    layout={{
                      height: 200,
                      margin: { t: 0, b: 0, l: 0, r: 0 }
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTrendAnalysis = () => {
    if (assessmentHistory.length < 2) {
      return (
        <Alert severity="info">
          Need at least 2 assessments to show trend analysis
        </Alert>
      );
    }

    const dates = assessmentHistory.map((_, index) => `Assessment ${index + 1}`);
    const carbonTrend = assessmentHistory.map(a => a.results?.carbon_footprint || 0);
    const sustainabilityTrend = assessmentHistory.map(a => a.results?.sustainability_score || 0);
    const circularityTrend = assessmentHistory.map(a => (a.results?.circularity_index || 0) * 100);

    return (
      <Plot
        data={[
          {
            x: dates,
            y: carbonTrend,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Carbon Footprint',
            yaxis: 'y',
            line: { color: '#f44336' }
          },
          {
            x: dates,
            y: sustainabilityTrend,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Sustainability Score',
            yaxis: 'y2',
            line: { color: '#4caf50' }
          },
          {
            x: dates,
            y: circularityTrend,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Circularity Index',
            yaxis: 'y2',
            line: { color: '#9c27b0' }
          }
        ]}
        layout={{
          title: 'Performance Trends Over Time',
          height: 400,
          xaxis: { title: 'Assessments' },
          yaxis: { 
            title: 'Carbon Footprint (kg CO₂)',
            side: 'left'
          },
          yaxis2: {
            title: 'Score/Index (%)',
            side: 'right',
            overlaying: 'y'
          },
          legend: { x: 0, y: 1 }
        }}
        config={{ displayModeBar: false }}
        style={{ width: '100%' }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Visualization Dashboard
            </Typography>
            <Box display="flex" gap={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Refresh data">
                <IconButton>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download charts">
                <IconButton>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {assessmentHistory.length === 0 ? (
            <Alert severity="info">
              No assessment data available. Please complete an assessment to view visualizations.
            </Alert>
          ) : (
            <>
              {/* Assessment Selector */}
              {assessmentHistory.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Select Assessment</InputLabel>
                    <Select
                      value={selectedAssessment ? assessmentHistory.indexOf(selectedAssessment) : ''}
                      label="Select Assessment"
                      onChange={(e) => setSelectedAssessment(assessmentHistory[e.target.value])}
                    >
                      {assessmentHistory.map((assessment, index) => (
                        <MenuItem key={index} value={index}>
                          {assessment.metal_type?.charAt(0).toUpperCase() + assessment.metal_type?.slice(1)} - 
                          {assessment.production_route?.charAt(0).toUpperCase() + assessment.production_route?.slice(1)} 
                          (Assessment {index + 1})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Current Assessment Info */}
              {selectedAssessment && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">
                      Current View: {selectedAssessment.metal_type?.charAt(0).toUpperCase() + selectedAssessment.metal_type?.slice(1)}
                    </Typography>
                    <Chip 
                      label={selectedAssessment.production_route?.charAt(0).toUpperCase() + selectedAssessment.production_route?.slice(1)}
                      color="primary"
                      size="small"
                    />
                    {selectedAssessment.results?.sustainability_score && (
                      <Chip 
                        label={`Score: ${selectedAssessment.results.sustainability_score.toFixed(1)}/100`}
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                </Paper>
              )}

              {/* Visualization Tabs */}
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab icon={<Timeline />} label="Lifecycle Flow" />
                <Tab icon={<BarChart />} label="Environmental Impact" />
                <Tab icon={<PieChart />} label="Sustainability Metrics" />
                <Tab icon={<TrendingUp />} label="Trend Analysis" />
              </Tabs>

              {/* Tab Content */}
              <Box>
                {tabValue === 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Material Lifecycle Visualization
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Interactive flowchart showing linear and circular material flows
                      </Typography>
                      {renderLifecycleFlow()}
                    </CardContent>
                  </Card>
                )}

                {tabValue === 1 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Environmental Impact Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Breakdown of environmental impacts across different categories
                      </Typography>
                      {renderEnvironmentalImpactChart()}
                    </CardContent>
                  </Card>
                )}

                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Sustainability Performance Metrics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Key performance indicators for sustainability and circularity
                    </Typography>
                    {renderSustainabilityMetrics()}
                  </Box>
                )}

                {tabValue === 3 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Track improvements over multiple assessments
                      </Typography>
                      {renderTrendAnalysis()}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VisualizationDashboard;