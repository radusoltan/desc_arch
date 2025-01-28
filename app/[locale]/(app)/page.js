import ServerIntlProvider from "@/components/ServerIntlProvider"
import moment from "moment";
import getIntl from "@/app/intl"
import Link from "next/link";
import Pagination from "@/components/Pagination";


export const dynamic = 'force-dynamic'

export const getArticles = async (locale, page, size) => {
  const response = await fetch(`${process.env.APP_URL}/api/content/articles?locale=${locale}&page=${page}&size=${size}`)
  return await response.json()

}
export default async function Home({params, searchParams}) {

  const { locale} = await params
  let {page = 1, size = 10} = await searchParams
  const intl = await getIntl(locale, 'homepage')
  moment.locale(locale)
  const {total, articles} = await getArticles(locale, page, size)

  return <ServerIntlProvider messages={intl.messages} locale={intl.locale}>
    <main>

      <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
        <div className="flex flex-row flex-wrap -mx-3">
          <div className="container mx-auto mb-2">
            {
              articles.map(article => (
                  <article key={article.id}
                           className="mb-2 p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-5 text-gray-500 dark:text-gray-100">

                      <Link href={`/${locale}/${article.category.slug}/${article.id}/${article.slug}`}>
                          <span
                              className="bg-primary-100 text-primary-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">
                              {article.category.title}
                          </span>
                      </Link>
                      <span className="text-sm">{
                        moment(article.published_at).fromNow()
                      }</span>
                    </div>

                    <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      <Link
                          href={`/${locale}/${article.category.slug}/${article.id}/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                          <span className="font-medium dark:text-white"> {
                            article.authors.length > 0 ?
                                article.authors.map(author => author.full_name).join(', ') : "Deschide.MD"
                          }</span>
                      </div>
                      <Link href={`/${locale}/${article.category.slug}/${article.id}/${article.slug}`}
                            className="inline-flex items-center font-medium text-primary-600 dark:text-gray-400 dark:text-primary-500 hover:underline">
                        Read more
                        <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"></path>
                        </svg>
                      </Link>
                    </div>
                  </article>
              ))
            }
            <Pagination total={total} size={size} page={page}/>
          </div>

        </div>

      </div>

    </main>
  </ServerIntlProvider>
}
