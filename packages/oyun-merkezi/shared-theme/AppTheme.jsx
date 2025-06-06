import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const AppTheme = ({ children, mode = 'light' }) => {
  const theme = createTheme({
    palette: {
      mode,
    },
    typography: {
      fontFamily: '"Underdog", system-ui', 
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppTheme;