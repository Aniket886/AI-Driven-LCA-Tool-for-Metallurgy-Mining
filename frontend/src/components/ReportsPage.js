import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  Description,
  Assessment,
  Nature,
  TrendingUp,
  Loop,
  CheckCircle,
  Info
} from '@mui/icons-material';
// import { motion } from 'framer-motion';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportsPage = ({ currentAssessment, assessmentHistory }) => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [reportType, setReportType] = useState('comprehensive');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [reportSections, setReportSections] = useState({
    executive_summary: true,
    assessment_details: true,
    environmental_impact: true,
    circularity_metrics: true,
    recommendations: true,
    methodology: true,
    appendix: false
  });
  const [customTitle, setCustomTitle] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  React.useEffect(() => {
    if (currentAssessment) {
      setSelectedAssessment(currentAssessment);
    } else if (assessmentHistory.length > 0) {
      setSelectedAssessment(assessmentHistory[assessmentHistory.length - 1]);
    }
  }, [currentAssessment, assessmentHistory]);

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Report', description: 'Full detailed analysis with all sections' },
    { value: 'executive', label: 'Executive Summary', description: 'High-level overview for decision makers' },
    { value: 'technical', label: 'Technical Report', description: 'Detailed technical analysis and methodology' },
    { value: 'comparison', label: 'Comparison Report', description: 'Compare multiple assessments' }
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: <PictureAsPdf /> },
    { value: 'csv', label: 'CSV Data', icon: <TableChart /> },
    { value: 'excel', label: 'Excel Workbook', icon: <Description /> }
  ];

  const handleSectionChange = (section) => {
    setReportSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateReport = async () => {
    if (!selectedAssessment) {
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        assessment: selectedAssessment,
        report_type: reportType,
        sections: reportSections,
        custom_title: customTitle || `LCA Report - ${selectedAssessment.metal_type}`,
        format: reportFormat
      };

      if (reportType === 'comparison' && assessmentHistory.length > 1) {
        reportData.assessments = assessmentHistory;
      }

      const response = await axios.post('http://localhost:5000/api/generate-report', reportData, {
        responseType: reportFormat === 'pdf' ? 'blob' : 'json'
      });

      if (reportFormat === 'pdf') {
        // Handle PDF download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LCA_Report_${selectedAssessment.metal_type}_${Date.now()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle CSV/Excel download
        setGeneratedReport(response.data);
        setPreviewDialog(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadGeneratedReport = () => {
    if (!generatedReport) return;

    const dataStr = reportFormat === 'csv' 
      ? generatedReport.csv_data 
      : JSON.stringify(generatedReport, null, 2);
    
    const blob = new Blob([dataStr], { 
      type: reportFormat === 'csv' ? 'text/csv' : 'application/json' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LCA_Report_${selectedAssessment.metal_type}_${Date.now()}.${reportFormat}`;
    link.click();
    window.URL.revokeObjectURL(url);
    setPreviewDialog(false);
  };

  const generateQuickPDF = async () => {
    if (!selectedAssessment) return;

    setLoading(true);
    try {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('LCA Assessment Report', 20, 30);
      
      // Assessment details
      pdf.setFontSize(12);
      pdf.text(`Metal Type: ${selectedAssessment.metal_type}`, 20, 50);
      pdf.text(`Production Route: ${selectedAssessment.production_route}`, 20, 60);
      pdf.text(`Quantity: ${selectedAssessment.quantity} kg`, 20, 70);
      
      // Results
      if (selectedAssessment.results) {
        pdf.text('Environmental Impact Results:', 20, 90);
        pdf.text(`Carbon Footprint: ${selectedAssessment.results.carbon_footprint?.toFixed(2)} kg CO₂`, 30, 100);
        pdf.text(`Energy Consumption: ${selectedAssessment.results.energy_consumption?.toFixed(2)} kWh`, 30, 110);
        pdf.text(`Sustainability Score: ${selectedAssessment.results.sustainability_score?.toFixed(1)}/100`, 30, 120);
        pdf.text(`Circularity Index: ${selectedAssessment.results.circularity_index?.toFixed(2)}`, 30, 130);
      }
      
      // Save PDF
      pdf.save(`LCA_Quick_Report_${selectedAssessment.metal_type}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating quick PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAssessmentSummary = () => {
    if (!selectedAssessment) return null;

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Assessment Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Assessment color="primary" />
              <Typography variant="body2">
                <strong>Metal:</strong> {selectedAssessment.metal_type?.charAt(0).toUpperCase() + selectedAssessment.metal_type?.slice(1)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Nature color="success" />
              <Typography variant="body2">
                <strong>Route:</strong> {selectedAssessment.production_route?.charAt(0).toUpperCase() + selectedAssessment.production_route?.slice(1)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            {selectedAssessment.results && (
              <>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TrendingUp color="warning" />
                  <Typography variant="body2">
                    <strong>Sustainability:</strong> {selectedAssessment.results.sustainability_score?.toFixed(1)}/100
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Loop color="secondary" />
                  <Typography variant="body2">
                    <strong>Circularity:</strong> {selectedAssessment.results.circularity_index?.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <div>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Report Generation
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Generate comprehensive reports for your LCA assessments
          </Typography>

          {assessmentHistory.length === 0 ? (
            <Alert severity="info">
              No assessment data available. Please complete an assessment to generate reports.
            </Alert>
          ) : (
            <>
              {/* Assessment Selection */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Custom Report Title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom title for your report"
                  />
                </Grid>
              </Grid>

              {renderAssessmentSummary()}

              {/* Report Configuration */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Report Type
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Report Type</InputLabel>
                        <Select
                          value={reportType}
                          label="Report Type"
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          {reportTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="body2" color="text.secondary">
                        {reportTypes.find(t => t.value === reportType)?.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Output Format
                      </Typography>
                      <Grid container spacing={1}>
                        {reportFormats.map((format) => (
                          <Grid item xs={4} key={format.value}>
                            <Button
                              fullWidth
                              variant={reportFormat === format.value ? 'contained' : 'outlined'}
                              startIcon={format.icon}
                              onClick={() => setReportFormat(format.value)}
                              size="small"
                            >
                              {format.label}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Report Sections */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Report Sections
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportSections).map(([section, checked]) => (
                          <Grid item xs={12} sm={6} md={4} key={section}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={checked}
                                  onChange={() => handleSectionChange(section)}
                                />
                              }
                              label={section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Box display="flex" gap={2} flexWrap="wrap">
                        <Button
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                          onClick={generateReport}
                          disabled={!selectedAssessment || loading}
                          size="large"
                        >
                          {loading ? 'Generating...' : 'Generate Full Report'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<PictureAsPdf />}
                          onClick={generateQuickPDF}
                          disabled={!selectedAssessment || loading}
                        >
                          Quick PDF
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Report Preview */}
                {selectedAssessment && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Report Preview
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Executive Summary"
                              secondary="High-level overview of assessment results and key findings"
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Environmental Impact Analysis"
                              secondary={`Carbon footprint: ${selectedAssessment.results?.carbon_footprint?.toFixed(1)} kg CO₂`}
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Circularity Metrics"
                              secondary={`Circularity index: ${selectedAssessment.results?.circularity_index?.toFixed(2)}`}
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <Info color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Recommendations"
                              secondary="AI-generated suggestions for improving sustainability"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Generated Successfully</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your report has been generated successfully. You can download it now.
          </Alert>
          {generatedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Report Summary:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Format: {reportFormat.toUpperCase()}<br/>
                Sections: {Object.entries(reportSections).filter(([_, checked]) => checked).length}<br/>
                Generated: {new Date().toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={downloadGeneratedReport} startIcon={<Download />}>
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ReportsPage;