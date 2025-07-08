import moment from "moment";
import {ImageComponent} from "@/components/ImageComponent";

const getArticle = async article=>{

  const response = await fetch(`${process.env.APP_URL}/api/content/${article}`)
  return await response.json()

}

const ArticlePage = async (props)=>{

  const article = (await props.params).slug
  const locale = (await props.params).locale
  const data = await getArticle(article)
  moment.locale(locale)

  const mainImage = data.images?.find(image=>image.is_default) ?? null


  return <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
    <div className="flex flex-row flex-wrap">
      <div className="flex-shrink max-w-full w-full overflow-hidden">
        <div className="w-full py-3 mb-3">
          <h2 className="text-gray-800 text-3xl font-bold dark:text-gray-50">
            <span className="inline-block h-5 border-l-4 border-red-600 mr-2"/>
            {data.title}
          </h2>
          <div className="my-5 text-gray-500 text-sm dark:text-gray-50">
            Author: {
            data.authors.length > 0 ?
                data.authors.map(author => author.full_name || '').join(', ') :
                "Deschide.MD"
          }
          </div>
        </div>
      </div>
      <div className="my-5 text-gray-500 text-sm dark:text-gray-50">
        {moment(data.published_at).format("LL")}
      </div>
    </div>
    <div className="flex flex-row flex-wrap -mx-3">
      <div className="max-w-full w-full px-4">
        <article className="pb-4">
          <p className="mb-5 dark:text-gray-50" dangerouslySetInnerHTML={{__html: data.lead ?? data.lead}}/>
          <figure className="text-center mb-6">
            <ImageComponent image={mainImage} />
          </figure>
          {/* IMAGE */}
          <div className="mb-5 article-body " dangerouslySetInnerHTML={{__html: data.content}}/>
        </article>
      </div>
    </div>
  </div>
}
export default ArticlePage