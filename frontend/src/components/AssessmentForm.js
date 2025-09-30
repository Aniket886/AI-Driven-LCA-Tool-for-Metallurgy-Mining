import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore,
  Info,
  Save,
  PlayArrow,
  Refresh,
  CheckCircle
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import axios from 'axios';

const AssessmentForm = ({ onAssessmentComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metalProperties, setMetalProperties] = useState({});
  const [advancedMode, setAdvancedMode] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      metal_type: '',
      production_route: '',
      quantity: '',
      energy_consumption: '',
      transport_distance: '',
      recycled_content: '',
      end_of_life_scenario: '',
      water_usage: '',
      waste_generation: '',
      material_efficiency: '',
      process_temperature: '',
      electricity_source: '',
      fuel_type: ''
    }
  });

  const steps = ['Basic Information', 'Production Details', 'Environmental Data', 'Review & Submit'];

  const metalTypes = ['aluminum', 'copper', 'steel', 'lithium', 'zinc', 'nickel'];
  const productionRoutes = ['primary', 'secondary', 'hybrid'];
  const endOfLifeScenarios = ['recycling', 'landfill', 'incineration', 'reuse'];
  const electricitySources = ['grid', 'renewable', 'coal', 'natural_gas', 'nuclear'];
  const fuelTypes = ['natural_gas', 'coal', 'oil', 'biomass', 'hydrogen'];

  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.metal_type) {
      fetchMetalProperties(watchedValues.metal_type);
    }
  }, [watchedValues.metal_type]);

  const fetchMetalProperties = async (metalType) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/metals/${metalType}`);
      setMetalProperties(response.data);
      
      // Auto-fill some fields based on metal properties
      if (response.data.typical_energy_consumption) {
        setValue('energy_consumption', response.data.typical_energy_consumption);
      }
      if (response.data.typical_recycled_content) {
        setValue('recycled_content', response.data.typical_recycled_content);
      }
    } catch (error) {
      console.error('Error fetching metal properties:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = () => {
    const currentData = getValues();
    setSavedData(currentData);
    setSuccess('Assessment data saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/assess', data);
      onAssessmentComplete(response.data);
      setSuccess('Assessment completed successfully!');
      setActiveStep(0);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred during assessment');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="metal_type"
                control={control}
                rules={{ required: 'Metal type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.metal_type}>
                    <InputLabel>Metal Type</InputLabel>
                    <Select {...field} label="Metal Type">
                      {metalTypes.map((metal) => (
                        <MenuItem key={metal} value={metal}>
                          {metal.charAt(0).toUpperCase() + metal.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="production_route"
                control={control}
                rules={{ required: 'Production route is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.production_route}>
                    <InputLabel>Production Route</InputLabel>
                    <Select {...field} label="Production Route">
                      {productionRoutes.map((route) => (
                        <MenuItem key={route} value={route}>
                          {route.charAt(0).toUpperCase() + route.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="quantity"
                control={control}
                rules={{ 
                  required: 'Quantity is required',
                  min: { value: 0.1, message: 'Quantity must be greater than 0' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Quantity"
                    type="number"
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="recycled_content"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Recycled Content"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>
            {metalProperties.density && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>{watchedValues.metal_type?.charAt(0).toUpperCase() + watchedValues.metal_type?.slice(1)} Properties:</strong><br/>
                    Density: {metalProperties.density} kg/m³ | 
                    Melting Point: {metalProperties.melting_point}°C | 
                    Typical Recycling Rate: {metalProperties.recycling_rate}%
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="energy_consumption"
                control={control}
                rules={{ required: 'Energy consumption is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Energy Consumption"
                    type="number"
                    error={!!errors.energy_consumption}
                    helperText={errors.energy_consumption?.message}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kWh/kg</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="transport_distance"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Transport Distance"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">km</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="electricity_source"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Electricity Source</InputLabel>
                    <Select {...field} label="Electricity Source">
                      {electricitySources.map((source) => (
                        <MenuItem key={source} value={source}>
                          {source.replace('_', ' ').charAt(0).toUpperCase() + source.replace('_', ' ').slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="fuel_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select {...field} label="Fuel Type">
                      {fuelTypes.map((fuel) => (
                        <MenuItem key={fuel} value={fuel}>
                          {fuel.replace('_', ' ').charAt(0).toUpperCase() + fuel.replace('_', ' ').slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {advancedMode && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="process_temperature"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Process Temperature"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">°C</InputAdornment>
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="material_efficiency"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Material Efficiency"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="water_usage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Water Usage"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">L/kg</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="waste_generation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Waste Generation"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg/kg</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="end_of_life_scenario"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>End of Life Scenario</InputLabel>
                    <Select {...field} label="End of Life Scenario">
                      {endOfLifeScenarios.map((scenario) => (
                        <MenuItem key={scenario} value={scenario}>
                          {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Tip:</strong> Leave fields empty if data is not available. Our AI model will predict missing values based on similar assessments.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Assessment Data
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(getValues()).map(([key, value]) => (
                value && (
                  <Grid item xs={12} sm={6} key={key}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={1} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="body2" color="text.secondary">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </Typography>
                      <Chip label={value} size="small" />
                    </Box>
                  </Grid>
                )
              ))}
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
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
              New LCA Assessment
            </Typography>
            <Box display="flex" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advancedMode}
                    onChange={(e) => setAdvancedMode(e.target.checked)}
                  />
                }
                label="Advanced Mode"
              />
              <Tooltip title="Save current progress">
                <IconButton onClick={handleSave} color="primary">
                  <Save />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ minHeight: 400 }}>
              {getStepContent(activeStep)}
            </Box>

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              <Box display="flex" gap={2}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                  >
                    {loading ? 'Processing...' : 'Run Assessment'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>

          {savedData && (
            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  <CheckCircle sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                  Saved Assessment Data
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Your assessment data has been saved and can be restored if needed.
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssessmentForm;