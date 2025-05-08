import {NextResponse} from "next/server"
import {client} from "@/app/lib/elastic"

export async function GET(request){

  const searchParams = request.nextUrl.searchParams

  const page = Number(searchParams.get('page'))
  const size = Number(searchParams.get('size'))
  const q = searchParams.get('q');
  const locale = searchParams.get('locale');

  const from = (page - 1) * size

  const response = await client.search({
    index: 'articles',
    from,
    size,
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: q,
              fields: ["title^3", "lead^2", "content"],
              type: "best_fields",
              operator: "and",  // crește relevanța pentru toate cuvintele cheie
              fuzziness: "AUTO" // permite potriviri aproximative
            }
          }
        ],
        filter: [
          {
            term: {
              "language.keyword": locale // folosește câmpul `.keyword` pentru potrivire exactă
            }
          }
        ]
      }
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
