import { createReadStream, statSync } from 'fs';
import path from 'path';

export async function GET(request, props){

  const {imagePath} = await props.params

  const imageDirectory = process.env.IMAGES_PATH

  const fullPath = path.join(imageDirectory, ...imagePath)

  try {
    // Verifică dacă imaginea există
    const stats = statSync(fullPath);
    if (!stats.isFile()) {
      return new Response('Not Found', { status: 404 });
    }

    // Creează un stream pentru imagine
    const stream = createReadStream(fullPath);

    // Determină tipul MIME al fișierului
    const extension = path.extname(fullPath).toLowerCase();
    const mimeType =
        extension === '.jpg' || extension === '.jpeg'
            ? 'image/jpeg'
            : extension === '.png'
                ? 'image/png'
                : extension === '.gif'
                    ? 'image/gif'
                    : 'application/octet-stream';

    return new Response(stream, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache pe termen lung
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}