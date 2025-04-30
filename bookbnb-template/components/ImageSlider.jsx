import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper'

/**
 * ImageSlider shows an array of book cover images in a carousel.
 * @param {{ images: string[] }} props
 */
const ImageSlider = ({ images }) => {
  if (!images || images.length === 0) return null

  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={1}
      loop={true}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="w-full h-64 rounded-t-2xl overflow-hidden"
    >
      {images.map((url, i) => (
        <SwiperSlide key={i} className="relative w-full h-64">
          <Image
            src={url}
            alt={`Book image ${i + 1}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default ImageSlider
