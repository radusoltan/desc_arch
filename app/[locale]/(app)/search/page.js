import Link from "next/link";
import moment from "moment";
import Pagination from "@/components/Pagination";

const getSearchResults = async (q, page, size) => {
  const result = await fetch(`${process.env.APP_URL}/api/search?q=${q}&page=${page}&size=${size}`);
  return await result.json()
}

export const dynamic = 'force-dynamic'

const SearchPage = async ({params,searchParams})=>{
  const {locale} = await params
  const {query, page = 1, size = 10} = await searchParams

  const {total, results} = await getSearchResults(query, page, size)

  return <div className="container mx-auto">
    {total === 0 ? <>NO RESULTS</>: results.map(res=><div key={res._id} className="mt-6 border-t border-gray-100">
      <article
          className="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-5 text-gray-500">
          <Link href={`/${locale}/${res._source.category.slug}/${res._id}/${res._source.slug}`}><span
              className="bg-primary-100 text-primary-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">
                      {res._source.category.title}
                  </span></Link>
          <span className="text-sm">{
            moment(res._source.published_at).fromNow()
          }</span>
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"><Link
            href={`/${locale}/${res._source.category.slug}/${res._id}/${res._source.slug}`}>{res._source.title}</Link>
        </h2>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-medium dark:text-white"> {
              res._source.authors.length > 0 ?
                  res._source.authors.map(author => author.full_name).join(', ') : "Deschide.MD"
            }</span>
          </div>
          <Link href={`/${locale}/${res._source.category.slug}/${res._id}/${res._source.slug}`}
                className="inline-flex items-center font-medium text-primary-600 dark:text-primary-500 hover:underline">
            Read more
            <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"></path>
            </svg>
          </Link>
        </div>
      </article>
    </div>)}
    <Pagination page={page} size={size} total={total} />

  </div>
}
export default SearchPage