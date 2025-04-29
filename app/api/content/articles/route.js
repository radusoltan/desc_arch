import {NextResponse} from "next/server";
import {client} from "@/app/lib/elastic";

export async function GET(request){

  const locale = request.nextUrl.searchParams.get('locale')
  const page = request.nextUrl.searchParams.get('page')
  const size = request.nextUrl.searchParams.get('size')

  const from = (Number(page) -1) * Number(size)

  const countResponse = await client.count({
    index: 'articles',
    query: {
      bool: {
        must: [
            { match: { "language": locale }}
        ]
      }
    }
  })

  const articleResponse = await client.search({
    index: 'articles',
    query: {
      "bool": {
        "must": [
          { "match": {"language": locale} }
        ]
      }
    },
    size: Number(size),
    from,
    sort: [
      { "published_at": { order: "desc", format: "strict_date_optional_time_nanos"} }
    ]
  })

  return NextResponse.json({
    articles: articleResponse.hits.hits.map(article => ({
      id: article._id,
      ...article._source
    })),
    total: countResponse.count
  })
}