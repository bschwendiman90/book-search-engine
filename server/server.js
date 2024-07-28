const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
app.use(express.json());

const startApolloServer = async () => {
  // Start Apollo Server
  await server.start();
  
  // Apply Apollo Server middleware
  app.use('/graphql', expressMiddleware(server));

  // Middleware to parse incoming requests
  app.use(express.urlencoded({ extended: true }));

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // Start the Express server
  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
};

// Call the function to start the Apollo Server
startApolloServer();
