// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api'
  },
  production: {
    // Production backend URL from Render
    API_BASE_URL: process.env.REACT_APP_API_URL || 'https://week5-ci-cd-jjqo.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment as keyof typeof config];
