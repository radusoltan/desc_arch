import Parser from 'rss-parser'
import dbConnect from "@/app/lib/mongoose"
import TgPost from "@/app/models/TgPost";
import TelegramBot from 'node-telegram-bot-api'

export async function GET() {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = "-1002488941068"
  const bot = new TelegramBot(BOT_TOKEN)
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'media'],
      ]
    }
  })

  const feed = await parser.parseURL('https://www.deschide.md/articole/rss.xml')

  try {
    await dbConnect();
    const feed = await parser.parseURL('https://www.deschide.md/articole/rss.xml');

    const items = await Promise.all(feed.items.map(async (item, index) => {
      // Verificăm dacă URL-ul există deja în baza de date
      const existingPost = await TgPost.findOne({ url: item.link });

      if(!existingPost && index < 10){
        const message = `<b>${item.title}</b>\n\n${item.content || ''}\n\n<a href="${item.link}">🔗 Citește mai mult</a>`
        const resp = await bot.sendPhoto(CHAT_ID, item.media?.$?.url || null,{
          caption: message,
          parse_mode: 'HTML'
        })
        if(resp.message_id){
          await TgPost.create({
            url: item.link,
            tg_id: resp.message_id,
          })
        }
      }
      return {
        message: `<b>${item.title}</b> A fost publicat pe TG si salvat in BD`,
      }
    }));

    return Response.json({ items });
  } catch (error) {
    console.error('Error processing RSS feed:', error);
    return Response.json({ error: 'Failed to process RSS feed' }, { status: 500 });
  }

  return Response.json({ items })
}