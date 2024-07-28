import { gql } from '@apollo/client';

// Queries
export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        image
        link
        title
      }
      bookCount
    }
  }
`;

export const GET_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        image
        link
        title
      }
      bookCount
    }
  }
`;

export const GET_USERS = gql`
  query users {
    users {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        image
        link
        title
      }
      bookCount
    }
  }
`;

export const GET_BOOK = gql`
  query book($bookId: String!) {
    book(bookId: $bookId) {
      bookId
      authors
      description
      image
      link
      title
    }
  }

  
`;

export const SEARCH_BOOKS = gql`
  query searchBooks($query: String!) {
    searchBooks(query: $query) {
      bookId
      authors
      title
      description
      image
    }
  }
`;