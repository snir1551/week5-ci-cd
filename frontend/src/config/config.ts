// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api'
  },
  production: {
    // Production backend URL from Render
    API_BASE_URL: process.env.REACT_APP_API_URL || 'https://week5-ci-cd-jjqo.onrender.com/api'
  },
  test: { // Add test environment configuration
    API_BASE_URL: 'http://localhost:5000/api' // Or a specific mock server URL
  }
};

const environment = process.env.NODE_ENV || 'development';

// Ensure that if environment is 'test', it's a valid key
const effectiveEnvironment = environment === 'test' ? 'test' : (environment || 'development');

export default config[effectiveEnvironment as keyof typeof config];
