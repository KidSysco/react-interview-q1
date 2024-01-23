import './styles.css';

import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { isNameValid, getLocations } from './mock-api/apis';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';

const AddUsers = () => {
  const [name, setName] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState(true);
  const [location, setLocation] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [data, setData] = useState([]);
  const [nameValidationError, setNameValidationError] = useState(false);
  const [locationValidationError, setLocationValidationError] = useState(false);
  const nameRef = useRef('');

  const onNameChange = async (event) => {
    const newName = event.target.value;
    setName(newName);
    // Store the current value in the ref
    nameRef.current = newName;

    // Validate the name using the mock API
    try {
      const isValid = await isNameValid(newName);

      // Check if the current value matches the ref value
      if (nameRef.current === newName) {
        // value of the input field has NOT changed since the validation started
        // so we need to re-validate.
        setIsNameAvailable(isValid);
        setNameValidationError(!isValid);
      }
    } catch (error) {
      console.error('Error validating name:', error);
    }
  };

  const onLocationChange = (event) => {
    const newLocation = event.target.value;
    setLocation(newLocation);
  };

  useEffect(() => {
    // Fetch locations using the mock API
    const fetchLocations = async () => {
      try {
        const locations = await getLocations();
        setLocationOptions(locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    // Run once on component mount
    fetchLocations();
  }, []);

  const onClear = () => {
    setData([]);
    setName('');
    setLocation('');
    setNameValidationError(false);
    setLocationValidationError(false);
    // Reset the availability state as well to handle edge case 
    // for clearing after adding a valid record, and also trying
    // to add another record that fails validation, then hit clear.
    setIsNameAvailable(true);
  };

  useEffect(() => {
    // Reset the name error state after state updates
    const timeoutId = setTimeout(() => {
      setNameValidationError(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [name, location]);

  const handleAdd = () => {
    if (!name || !isNameAvailable) {
      setNameValidationError(true);
      return;
    }

    if (!location) {
      setLocationValidationError(true);
      return;
    }

    // Clear validation error states
    setNameValidationError(false);
    setLocationValidationError(false);

    const newData = [...data, { id: data.length + 1, name, location }];
    setData(newData);

    // reset the form after add.
    setName('');
    setLocation('');
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
  ];

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh" // Prevent scrolling on mobile
      width="100vw"  // Prevent scrolling on mobile
      overflowX="hidden"  // Prevent scrolling on mobile
      className="bg-black-shine"
    >
      <Card
        variant="outlined"
        className="mx-8"
        sx={{
          maxWidth: 800,
          width: '100%',
          padding: 2,
          boxSizing: 'border-box',
          borderRadius: '20px',
        }}
      >
        <CardHeader title="Add Users Component" />
        <CardContent>
          <Grid container spacing={2} className="custom-grid-padding">
            <Grid item xs={12}>
              <div className="custom-input-wrapper">
                <label htmlFor="user-name">Name:</label>
                <TextField
                  id="user-name"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={name}
                  onChange={onNameChange}
                  error={!isNameAvailable || nameValidationError}
                  helperText={
                    !isNameAvailable
                      ? 'This name has already been taken.' // Talk with PM about text change.
                      : nameValidationError
                        ? 'Name is required.' // Talk with PM about this rule.
                        : ''
                  }
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="custom-input-wrapper">
                <label htmlFor="location">Location:</label>

                <FormControl fullWidth size="small">

                  <Select
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    id="location"
                    value={location}
                    onChange={onLocationChange}
                    className="text-left"
                  >
                    {locationOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="location-error">
                {/* 
                  Talk with PM about this rule added here too.
                  This is not a real, or good comment, but works for the demo.
                  Several validation rules were added to create a better UX.
                  These were not requirements so we should discuss with the PM.
                */}
                {locationValidationError && (
                  <span style={{ color: 'red', marginLeft: '8px' }}>
                    Please choose a location.
                  </span>
                )}
              </div>
            </Grid>
            <Grid item xs={12} className="text-right pr-8">

              <Button onClick={onClear} variant="outlined" color="error" sx={{ marginRight: 2, width: '100px' }}>
                Clear
              </Button>
              <Button onClick={handleAdd} variant="contained" color="primary" sx={{ width: '100px' }}>
                Add
              </Button>

            </Grid>
            <Grid item xs={12}>
              <div className="px-8">
                <DataGrid
                  sx={{ height: '300px' }}
                  rows={data}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
                  }
                />
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddUsers;
