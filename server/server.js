const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    console.log('Request received for context creation');
    const context = authMiddleware({ req });
    console.log('Context in Apollo Server:', context);
    return context;
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware to ensure Express is receiving requests
app.use((req, res, next) => {
  console.log(`Express received a request: ${req.method} ${req.url}`);
  next();
});

const startApolloServer = async () => {

  // Start Apollo Server
  await server.start();

  // Apply Apollo Server middleware
  console.log('Starting Apollo Server middleware');
  app.use('/graphql', expressMiddleware(server, {context: authMiddleware}));
  console.log('Apollo Server middleware started');

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // Root route for sanity check
  app.get('/', (req, res) => {
    res.send('Server is running');
  });

  // Start the Express server
  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
};

// Call the function to start the Apollo Server
startApolloServer();
