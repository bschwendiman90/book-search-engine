 // or use native fetch if available

const searchGoogleBooks = async (query) => {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching books from Google Books API:', error);
    throw error;
  }
};

module.exports = { searchGoogleBooks };
