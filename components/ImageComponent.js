import Image from 'next/image'

export const ImageComponent = ({image})=>{
  const imageUrl = process.env.APP_URL + `/api/images/${image.source}/${image.fileName}`
  return <>
    <Image
        src={imageUrl}
        alt={image.description}
        width={image.width}
        height={image.height}
    />
    {
      image.photographer && <figcaption>{image.photographer}</figcaption>
    }
  </>
}