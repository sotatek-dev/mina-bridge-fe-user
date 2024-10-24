'use client';
import { Flex, FlexProps, useToken } from '@chakra-ui/react';
import { useMemo } from 'react';

import { useHistoryState } from '../context';

import ReactPaginateWithChakra from '@/components/elements/pagination';
import useWindowSize from '@/hooks/useWindowSize';
import LeftIcon from '@public/assets/icons/icon.arrow.left.pagination.svg';
import RightIcon from '@public/assets/icons/icon.arrow.right.pagination.svg';

const btnNavigateStyles: FlexProps = {
  border: '1px solid rgba(28, 34, 55, 0.10)',
  bg: 'background.0',
  borderRadius: '4px',
  w: '35px',
  h: '35px',
  justify: 'center',
  alignItems: 'center',
  margin: '4px',
};

function Pagination() {
  const { state, methods } = useHistoryState();

  const handlePageClick = (value: number) => {
    methods.updateMetaData({ ...state.pagingData, currentPage: value + 1 });
  };

  const btnPrevStyle: FlexProps = {
    cursor: state.pagingData?.currentPage === 1 ? 'not-allowed' : 'default',
    opacity: state.pagingData?.currentPage === 1 ? 0.7 : 1,
  };

  const btnNextStyle: FlexProps = {
    cursor:
      state.pagingData?.currentPage === state.pagingData?.totalOfPages
        ? 'not-allowed'
        : 'default',
    opacity:
      state.pagingData?.currentPage === state.pagingData?.totalOfPages
        ? 0.7
        : 1,
  };

  const [md] = useToken('breakpoints', ['md']);

  const { width } = useWindowSize();
  const isMdSize = useMemo(
    () => width / 16 >= Number(md.replace('em', '')),
    [width, md]
  );

  const showMarginPage = useMemo(() => {
    if (isMdSize) return 2;
    // Fix mobile paginate overflowed resposive
    const specialPages = [
      1,
      2,
      state.pagingData?.totalOfPages,
      state.pagingData?.totalOfPages,
    ];
    if (
      state.pagingData?.currentPage &&
      specialPages.includes(state.pagingData?.currentPage)
    )
      return 1;
    return 0;
  }, [state.pagingData, isMdSize]);

  return (
    <Flex flexDirection={'row'} mt={'16px'}>
      <ReactPaginateWithChakra
        breakLabel={'...'}
        marginPagesDisplayed={showMarginPage}
        previousLabel={
          <Flex {...btnNavigateStyles} {...btnPrevStyle}>
            <LeftIcon color={'var(--text-500)'} />
          </Flex>
        }
        onPageChange={(selectedItem) => handlePageClick(selectedItem.selected)}
        pageCount={state.pagingData.totalOfPages}
        nextLabel={
          <Flex {...btnNavigateStyles} {...btnNextStyle}>
            <RightIcon color={'var(--text-500)'} />
          </Flex>
        }
        renderOnZeroPageCount={null}
        gap={'5'}
        listStyleType={'none'}
        display={'flex'}
        alignItems={'center'}
        pageClassName={'custom-pagination__item'}
        activeClassName={'custom-pagination__item-active'}
        sx={{
          '.custom-pagination__item': {
            width: '35px',
            height: '35px',
            lineHeight: '35px',
            textAlign: 'center',
            border: 'solid 1px #1c22371a',
            bg: 'background.0',
            borderRadius: '4px',
            color: 'text.700',
            a: {
              display: 'block',
              width: 'full',
            },
            '&-active': {
              bg: 'primary.purple',
              color: 'text.0',
            },
          },
        }}
      />
    </Flex>
  );
}

export default Pagination;
