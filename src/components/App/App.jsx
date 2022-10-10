import Notiflix from 'notiflix';
import { useState, useEffect } from 'react';
import { Searchbar } from '../Searchbar/Searchbar';
import { ImageGallery } from '../ImageGallery/ImageGallery';
import { AppContainer } from './App.styled';
import { Button } from 'components/Button/Button';
import { Loader } from 'components/Loader/Loader';
import { fetchCards } from 'components/Services/fetchCards';
import { Modal } from 'components/Modal/Modal';
const axios = require('axios').default;

export const App = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hits, setHits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldButtonShow, setShouldButtonShow] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState('');

  useEffect(() => {
    if (query !== '') {
      fetchHits(query);
    }

    async function fetchHits(query) {
      setIsLoading(true);
      setShouldButtonShow(true);

      try {
        const url = fetchCards(query, page);
        const response = await axios.get(url);

        const {
          data: { hits, totalHits },
        } = response;

        if (hits.length < 1 && page === 1) {
          setIsLoading(false);
          setHits([]);

          throw new Error(
            Notiflix.Notify.failure(
              'Sorry, there are no images matching your search query. Please try again.'
            )
          );
        }

        if (page >= Math.ceil(totalHits / 12)) {
          setShouldButtonShow(false);
        }

        if (page !== 1) {
          setHits(prevState => prevState.concat(hits));
          setIsLoading(false);
        } else {
          setHits(hits);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [page, query]);

  const toggleModal = largeImageURL => {
    setIsModalOpen(prevState => !prevState);
    setLargeImageURL(largeImageURL);
  };

  const onLoadMoreClick = () => {
    setPage(prevState => prevState + 1);
  };

  const onSubmitClick = query => {
    setPage(1);
    setQuery(query);
  };

  return (
    <AppContainer>
      <Searchbar onSubmit={onSubmitClick} />
      <ImageGallery hits={hits} toggleModal={toggleModal} />

      {isModalOpen && (
        <Modal largeImageURL={largeImageURL} onClose={toggleModal} />
      )}

      {isLoading && <Loader />}
      {hits.length > 0 && shouldButtonShow && (
        <Button onClick={onLoadMoreClick} />
      )}
    </AppContainer>
  );
};
