import Image from 'next/image'

export const ImageComponent = ({image})=>{

  const imageUrl = image && image.source.includes('https://cdn.prod.website-files.com/')? image.source :process.env.APP_URL + `/api/images/${image.source}/${image.fileName}`


  return image && <>
    <Image
        src={imageUrl}
        alt={image.description}
        width={16000}
        height={900}
    />
    {
      image.photographer && <figcaption>{image.photographer}</figcaption>
    }
  </>
}