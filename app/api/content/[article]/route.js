import {NextResponse} from "next/server";
import {client} from "@/app/lib/elastic";
export async function GET(request, {params}) {

  const article = (await params).article
  console.log("article", article)

  const response = await client.search({
    index: 'articles',
    query: {
      bool: {
        must: [
          { match: {"slug": article} }
        ]
      }
    }
  })

  return NextResponse.json({
    ...response.hits.hits[0]._source,
  })
}