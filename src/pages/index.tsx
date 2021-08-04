import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

export default function Home(): JSX.Element {
  const fetchImages = async ({ pageParam = null }): Promise<any> => {
    const url = pageParam ? `/api/images?after=${pageParam}` : '/api/images';
    const { data } = await api.get(url);

    return data;
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImages, {
    getNextPageParam: lastPage => (lastPage.after ? lastPage.after : null),
  });

  const formattedData = useMemo(
    () => data?.pages.map(page => page.data).flat(),
    [data]
  );

  if (isLoading) return <Loading />;

  if (isError) return <Error />;

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        <Box pt={4}>
          {hasNextPage && (
            <Button name="Carregar mais" onClick={() => fetchNextPage()}>
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
