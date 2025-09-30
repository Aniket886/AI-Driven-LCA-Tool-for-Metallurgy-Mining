import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Tabs, 
  Tab, 
  Box, 
  Paper,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Compare as CompareIcon,
  BarChart as VisualizationIcon,
  Description as ReportsIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tabs = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'New Assessment', path: '/assess', icon: <AssessmentIcon /> },
    { label: 'Compare Pathways', path: '/compare', icon: <CompareIcon /> },
    { label: 'Visualizations', path: '/visualize', icon: <VisualizationIcon /> },
    { label: 'Reports', path: '/reports', icon: <ReportsIcon /> },
    { label: 'Help', path: '/help', icon: <HelpIcon /> }
  ];

  const currentTab = tabs.findIndex(tab => tab.path === location.pathname);

  const handleTabChange = (event, newValue) => {
    navigate(tabs[newValue].path);
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab >= 0 ? currentTab : 0}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3,
            },
            minHeight: 64,
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.path}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                px: isMobile ? 2 : 3,
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  );
};

export default Navigation;