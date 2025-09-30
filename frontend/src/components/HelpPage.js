import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore,
  PlayCircle,
  Assessment,
  Compare,
  Timeline,
  Description,
  Help,
  School,
  QuestionAnswer,
  VideoLibrary,
  MenuBook,
  ContactSupport,
  Lightbulb,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const HelpPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tutorialDialog, setTutorialDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const faqData = [
    {
      question: "What is Life Cycle Assessment (LCA)?",
      answer: "Life Cycle Assessment is a systematic approach to evaluating the environmental impacts of a product or process throughout its entire life cycle, from raw material extraction to end-of-life disposal."
    },
    {
      question: "How does the AI prediction work?",
      answer: "Our AI models use machine learning algorithms trained on extensive datasets to predict missing environmental parameters. The models consider factors like metal type, production route, and process conditions to provide accurate estimates."
    },
    {
      question: "What metals are supported?",
      answer: "Currently, the tool supports aluminum, copper, steel, lithium, zinc, and nickel. We're continuously adding support for more metals based on user feedback and data availability."
    },
    {
      question: "How accurate are the predictions?",
      answer: "Our AI models achieve 85-95% accuracy for most environmental parameters. Accuracy varies based on data completeness and the specific metal being assessed."
    },
    {
      question: "Can I compare different production routes?",
      answer: "Yes! The comparison tool allows you to evaluate up to 4 different assessments side-by-side, helping you identify the most sustainable production pathways."
    },
    {
      question: "What report formats are available?",
      answer: "You can generate reports in PDF, CSV, and Excel formats. Reports include comprehensive analysis, visualizations, and actionable recommendations."
    },
    {
      question: "How is the sustainability score calculated?",
      answer: "The sustainability score is a weighted composite of environmental impact metrics including carbon footprint, energy efficiency, water usage, and circularity indicators."
    },
    {
      question: "What is the circularity index?",
      answer: "The circularity index measures how well a material or process follows circular economy principles, considering factors like recycled content, recyclability, and material efficiency."
    }
  ];

  const tutorialSteps = [
    {
      label: 'Getting Started',
      description: 'Learn the basics of using the LCA tool',
      content: 'Welcome to the AI-Driven LCA Tool! Start by navigating to the Dashboard to see an overview of your assessments and key metrics.'
    },
    {
      label: 'Create Assessment',
      description: 'Step-by-step guide to creating your first assessment',
      content: 'Click on "New Assessment" to begin. Fill in the basic information about your metal and production process. The AI will help predict missing values.'
    },
    {
      label: 'Review Results',
      description: 'Understanding your assessment results',
      content: 'After running an assessment, review the environmental impact metrics, sustainability score, and circularity index in the results dashboard.'
    },
    {
      label: 'Compare Pathways',
      description: 'Compare different production routes',
      content: 'Use the comparison tool to evaluate multiple assessments side-by-side and identify the most sustainable options.'
    },
    {
      label: 'Generate Reports',
      description: 'Create comprehensive reports',
      content: 'Generate detailed reports in PDF, CSV, or Excel format with customizable sections and professional formatting.'
    }
  ];

  const quickStartGuide = [
    { step: 1, title: "Create Account", description: "Sign up and access the dashboard" },
    { step: 2, title: "Input Data", description: "Enter metal type and production details" },
    { step: 3, title: "Run Assessment", description: "Let AI analyze and predict impacts" },
    { step: 4, title: "Review Results", description: "Examine sustainability metrics" },
    { step: 5, title: "Generate Report", description: "Download comprehensive analysis" }
  ];

  const bestPractices = [
    {
      title: "Data Quality",
      tips: [
        "Provide as much accurate data as possible for better predictions",
        "Use industry-standard units and measurements",
        "Verify data sources and update regularly"
      ]
    },
    {
      title: "Assessment Strategy",
      tips: [
        "Start with primary production routes before comparing alternatives",
        "Consider multiple scenarios for comprehensive analysis",
        "Document assumptions and data sources"
      ]
    },
    {
      title: "Interpretation",
      tips: [
        "Focus on relative comparisons rather than absolute values",
        "Consider uncertainty ranges in predictions",
        "Validate results with domain experts"
      ]
    }
  ];

  const renderFAQ = () => (
    <Box>
      {faqData.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderTutorials = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PlayCircle sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Interactive Tutorial</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step-by-step guided tour of all features
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setTutorialDialog(true)}
              startIcon={<School />}
            >
              Start Tutorial
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <VideoLibrary sx={{ mr: 2, color: 'secondary.main' }} />
              <Typography variant="h6">Video Guides</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Watch detailed video explanations
            </Typography>
            <Button variant="outlined" startIcon={<PlayCircle />}>
              Watch Videos
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Start Guide
            </Typography>
            <Grid container spacing={2}>
              {quickStartGuide.map((item) => (
                <Grid item xs={12} sm={6} md={2.4} key={item.step}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                      {item.step}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBestPractices = () => (
    <Grid container spacing={3}>
      {bestPractices.map((practice, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Lightbulb sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h6">{practice.title}</Typography>
              </Box>
              <List dense>
                {practice.tips.map((tip, tipIndex) => (
                  <ListItem key={tipIndex}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={tip}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderGlossary = () => {
    const terms = [
      { term: "Carbon Footprint", definition: "Total greenhouse gas emissions caused directly and indirectly by a product or process" },
      { term: "Circularity Index", definition: "Measure of how well a material follows circular economy principles" },
      { term: "Material Efficiency", definition: "Ratio of useful output to material input in a production process" },
      { term: "Primary Production", definition: "Production from virgin raw materials" },
      { term: "Secondary Production", definition: "Production from recycled materials" },
      { term: "End-of-Life", definition: "Final stage of a product's lifecycle including disposal or recycling" },
      { term: "Sustainability Score", definition: "Composite metric evaluating overall environmental performance" },
      { term: "Life Cycle Thinking", definition: "Holistic approach considering all stages of a product's life" }
    ];

    return (
      <Grid container spacing={2}>
        {terms.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {item.term}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.definition}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
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
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Help & Documentation
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Everything you need to know about using the AI-Driven LCA Tool
          </Typography>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab icon={<QuestionAnswer />} label="FAQ" />
            <Tab icon={<School />} label="Tutorials" />
            <Tab icon={<Lightbulb />} label="Best Practices" />
            <Tab icon={<MenuBook />} label="Glossary" />
            <Tab icon={<ContactSupport />} label="Support" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Frequently Asked Questions
              </Typography>
              {renderFAQ()}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Tutorials & Guides
              </Typography>
              {renderTutorials()}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Best Practices
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Follow these guidelines to get the most accurate and useful results from your LCA assessments.
              </Alert>
              {renderBestPractices()}
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Glossary
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Key terms and definitions used in life cycle assessment
              </Typography>
              {renderGlossary()}
            </Box>
          )}

          {tabValue === 4 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Support & Contact
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Technical Support
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Get help with technical issues and bugs
                      </Typography>
                      <Button variant="contained" startIcon={<ContactSupport />}>
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Feature Requests
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Suggest new features and improvements
                      </Typography>
                      <Button variant="outlined" startIcon={<Lightbulb />}>
                        Submit Idea
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Smart India Hackathon 2025</strong><br/>
                      This tool was developed for SIH 2025. For hackathon-specific support, 
                      please contact the development team through the official SIH channels.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tutorial Dialog */}
      <Dialog open={tutorialDialog} onClose={() => setTutorialDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Interactive Tutorial</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {tutorialSteps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {step.content}
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(activeStep + 1)}
                      disabled={activeStep === tutorialSteps.length - 1}
                      sx={{ mr: 1 }}
                    >
                      {activeStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                    <Button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(activeStep - 1)}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTutorialDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default HelpPage;