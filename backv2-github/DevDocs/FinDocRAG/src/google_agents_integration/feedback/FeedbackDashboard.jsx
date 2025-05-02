import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  Divider
} from '@mui/material';
import { 
  Feedback as FeedbackIcon,
  Assessment,
  Comment,
  Star,
  Category
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * Feedback Dashboard Component for displaying feedback statistics.
 */
const FeedbackDashboard = ({ apiBaseUrl = '' }) => {
  // State
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Load feedback statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${apiBaseUrl}/api/rag/feedback/stats`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch feedback statistics: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching feedback statistics:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [apiBaseUrl]);
  
  // Format rating distribution for chart
  const formatRatingDistribution = () => {
    if (!stats || !stats.ratingDistribution) return [];
    
    return Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
      rating: Number(rating),
      count
    })).sort((a, b) => a.rating - b.rating);
  };
  
  // Format feedback type distribution for chart
  const formatTypeDistribution = () => {
    if (!stats || !stats.typeDistribution) return [];
    
    return Object.entries(stats.typeDistribution).map(([type, count]) => ({
      type,
      count,
      percentage: (count / stats.totalFeedback) * 100
    }));
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  // Render empty state
  if (!stats || stats.totalFeedback === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No feedback data available yet.
      </Alert>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        <FeedbackIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Feedback Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Feedback Summary" 
              avatar={<Assessment />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Feedback
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalFeedback}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ mr: 1 }}>
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Rating 
                      value={stats.averageRating} 
                      precision={0.1} 
                      readOnly 
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Rating Distribution Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Rating Distribution" 
              avatar={<Star />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatRatingDistribution()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Ratings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Feedback Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Feedback Type Distribution" 
              avatar={<Category />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                    >
                      {formatTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage.toFixed(1)}%)`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Feedback */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Feedback" 
              avatar={<Comment />}
            />
            <Divider />
            <CardContent>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentFeedback.map((feedback) => (
                      <TableRow key={feedback.feedbackId}>
                        <TableCell>
                          <Chip 
                            label={feedback.feedbackType} 
                            size="small" 
                            color={
                              feedback.feedbackType === 'general' ? 'default' :
                              feedback.feedbackType === 'document' ? 'primary' :
                              feedback.feedbackType === 'query' ? 'secondary' :
                              'info'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Rating value={feedback.rating} readOnly size="small" />
                        </TableCell>
                        <TableCell>
                          {feedback.comment ? (
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {feedback.comment}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No comment
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(feedback.timestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackDashboard;
