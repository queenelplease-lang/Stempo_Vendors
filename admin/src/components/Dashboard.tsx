import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useGetList } from 'react-admin';

export const Dashboard = () => {
  const { total: newsTotal } = useGetList('news', {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: programsTotal } = useGetList('bonus-programs', {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: citiesTotal } = useGetList('cities', {
    pagination: { page: 1, perPage: 1 },
  });

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                News
              </Typography>
              <Typography variant="h4">{newsTotal || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Bonus Programs
              </Typography>
              <Typography variant="h4">{programsTotal || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cities
              </Typography>
              <Typography variant="h4">{citiesTotal || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
