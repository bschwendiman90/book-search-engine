const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { searchGoogleBooks} = require('../utils/searchBooks');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        // Ensure context.user is populated correctly
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new AuthenticationError('Not logged in');
    },
    user: async (parent, { username }) => {
      // Find user by username and populate savedBooks
      return User.findOne({ username }).populate('savedBooks');
    },
    users: async () => {
      // Return all users with populated savedBooks
      return User.find().populate('savedBooks');
    },
    book: async (parent, { bookId }) => {
      // Assuming the book data is stored in the User model's savedBooks field
      const user = await User.findOne({ "savedBooks.bookId": bookId });
      if (user) {
        return user.savedBooks.find(book => book.bookId === bookId);
      }
      throw new Error('Book not found');
    },
    searchBooks: async (_, { query }) => {
        try {
          const books = await searchGoogleBooks(query);
  
          return books.map(book => ({
            bookId: book.id,
            authors: book.volumeInfo.authors || ['No author to display'],
            title: book.volumeInfo.title,
            description: book.volumeInfo.description || 'No description available',
            image: book.volumeInfo.imageLinks?.thumbnail || '',
            link: book.volumeInfo.infoLink || '',
          }));
        } catch (error) {
          console.error('Error fetching books from Google Books API:', error);
          throw new Error('Failed to fetch books');
        }
      },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
