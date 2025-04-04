import * as React from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ColorModeSelect(props) {
  const theme = useTheme();
  const [mode, setMode] = React.useState(theme.palette.mode);

  const handleChange = (event) => {
    setMode(event.target.value);
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <FormControl variant="outlined" {...props}>
      <InputLabel>Mode</InputLabel>
      <Select value={mode} onChange={handleChange} label="Mode">
        <MenuItem value="system">System</MenuItem>
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </Select>
    </FormControl>
  );
}