const typeDefs = `
  type Book {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type query {
  searchBooks(query: String!): [Book]
  me: User
}

  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int
  }

  type Query {
    me: User
    user(username: String!): User
    users: [User]
    book(bookId: String!): Book
    searchBooks(query: String!): [Book] # Added searchBooks query here
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
  }

  input BookInput {
    authors: [String]
    bookId: String!
    description: String!
    image: String
    title: String!
  }

  type Auth {
    token: ID!
    user: User
  }
`;

module.exports = typeDefs;
