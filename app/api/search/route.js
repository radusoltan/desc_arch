import { NextResponse } from "next/server"
import { client } from "@/app/lib/elastic"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams

  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10
  const q = searchParams.get('q') || ''
  const locale = searchParams.get('locale')

  const from = (page - 1) * size

  const mustQuery = {
    multi_match: {
      query: q,
      fields: ["title^3", "lead^2", "content"],
      type: "best_fields",
      operator: "and",
      fuzziness: "AUTO"
    }
  }

  const boolQuery = {
    must: [mustQuery]
  }

  if (locale) {
    boolQuery.filter = [
      {
        term: {
          "language.keyword": locale
        }
      }
    ]
  }

  const response = await client.search({
    index: 'articles',
    from,
    size,
    query: {
      bool: boolQuery
    },
    sort: [
      { published_at: { order: "desc" } }
    ]
  })

  return NextResponse.json({
    results: response.hits.hits,
    total: response.hits.total.value,
  })
}
