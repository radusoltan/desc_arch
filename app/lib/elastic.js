import {Client} from "@elastic/elasticsearch"

export const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
  ssl: {
    rejectUnauthorized: false, // <- Ignoră validarea certificatului
  },
})