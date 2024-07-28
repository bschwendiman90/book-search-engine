import { useState, useEffect } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_BOOKS } from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';


const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // Apollo Client hook for searching books using lazy query
  const [searchBooks, { called, loading, data, error }] = useLazyQuery(SEARCH_BOOKS, {
    onCompleted: (data) => {
      const bookData = data.searchBooks.map((book) => ({
        bookId: book.bookId,
        authors: book.authors || ['No author to display'],
        title: book.title,
        description: book.description,
        image: book.image,
      }));
      setSearchedBooks(bookData);
    }
  });

  // Mutation hook for saving a book
  const [saveBook] = useMutation(SAVE_BOOK);

  // useEffect hook to save `savedBookIds` to localStorage on component unmount
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      searchBooks({ variables: { query: searchInput } });
      setSearchInput('');
    } catch (err) {
      console.error('Error while searching books:', err.message);
    }
  };

  // Handle saving a book
  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    console.log(bookToSave);
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    console.log(Auth.getToken());
    console.log(Auth.loggedIn());

    if (!token) {
        console.log('No token found');
      return false;
    }

    try {
        console.log('Trying to save book');
      const { data, errors } = await saveBook({
        variables: { bookData: { ...bookToSave } },
        context: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      if (errors) {
        console.log('mutation errors;', errors);
        throw new Error('Something went wrong!');
        }

      console.log(data);

      if (data) {
        console.log('Book saved!');
        // Update state and localStorage
        setSavedBookIds([...savedBookIds, bookToSave.bookId]);
      }
    } catch (err) {
      console.error('Error saving book;', err.message);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {loading ? 'Loading...' : (searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin')}
        </h2>
        <Row>
          {error && <p>Error occurred: {error.message}</p>}
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border='dark'>
                {book.image ? (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds.includes(book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds.includes(book.bookId)
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
