"use client";

import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft, faCircleRight } from "@fortawesome/free-solid-svg-icons";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ total, page = 1, size = 20 }) => {
  const { locale } = useParams();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / size);

  const handlePageChange = (e) => {
    const query = searchParams.get('query') ? `&query=${searchParams.get('query')}` : '';
    router.push(`/${locale}${path}?page=${e.selected + 1}&size=${size}${query}`);
  };

  return (
      <ReactPaginate
          onPageChange={handlePageChange}
          page={page - 1}
          pageCount={totalPages}
          breakLabel="..."
          nextLabel={<FontAwesomeIcon icon={faCircleRight} />}
          pageRangeDisplayed={5}
          previousLabel={<FontAwesomeIcon icon={faCircleLeft} />}
          containerClassName="inline-flex -space-x-px text-base h-10"
          pageLinkClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          activeLinkClassName="flex items-center justify-center px-4 h-10 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
          breakLinkClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          previousLinkClassName="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          nextLinkClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      />
  );
};

export default Pagination;