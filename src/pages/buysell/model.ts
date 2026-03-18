import bookImage from '@/assets/K4.png'
import laptopImage from '@/assets/K2.png'
import phoneImage from '@/assets/K3.png'

export type BuySellCategory = 'Учебники' | 'Техника' | 'Быт'
export type BuySellFilterCategory = 'Все' | BuySellCategory

export type BuySellListing = {
  id: number
  title: string
  price: number
  seller: string
  category: BuySellCategory
  condition: string
  location: string
  description: string
  accent: string
  images: [string, ...string[]]
}

export const buySellCategories: BuySellFilterCategory[] = ['Все', 'Учебники', 'Техника', 'Быт']

export const buySellListings: BuySellListing[] = [
  {
    id: 1,
    title: 'Высшая математика',
    price: 5000,
    seller: 'Ақан Т.',
    category: 'Учебники',
    condition: 'Хорошее состояние',
    location: 'Блок A, 3 этаж',
    description:
      'Продаю книгу после первого курса. Пометки карандашом есть только в двух главах, страницы целые.',
    accent: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    images: [bookImage, bookImage, bookImage, bookImage],
  },
  {
    id: 2,
    title: 'MacBook Air 13',
    price: 150000,
    seller: 'Азамат Т.',
    category: 'Техника',
    condition: 'Почти новый',
    location: 'Блок B, 5 этаж',
    description:
      'Подходит для учебы и монтажа. В комплекте оригинальная зарядка, батарея держит отлично.',
    accent: 'linear-gradient(135deg, #f97316, #ea580c)',
    images: [laptopImage, laptopImage, laptopImage],
  },
  {
    id: 3,
    title: 'USB флэшка 128 GB',
    price: 10000,
    seller: 'Жасмин С.',
    category: 'Техника',
    condition: 'Новая',
    location: 'Блок C, 2 этаж',
    description:
      'Новая флэшка в упаковке. Покупал для проекта, но так и не пригодилась.',
    accent: 'linear-gradient(135deg, #10b981, #059669)',
    images: [phoneImage, phoneImage],
  },
  {
    id: 4,
    title: 'Настольная лампа',
    price: 12000,
    seller: 'Ернур Ш.',
    category: 'Быт',
    condition: 'Исправная',
    location: 'Блок A, 6 этаж',
    description:
      'Лампа с теплым и холодным режимом света. Подходит для чтения и вечерней работы.',
    accent: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    images: [bookImage, phoneImage],
  },
  {
    id: 5,
    title: 'iPhone 13 mini',
    price: 220000,
    seller: 'Диана К.',
    category: 'Техника',
    condition: 'Отличное состояние',
    location: 'Блок D, 4 этаж',
    description:
      'Без ремонта, Face ID работает, комплект без коробки. Удобный небольшой формат.',
    accent: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    images: [phoneImage, phoneImage, phoneImage],
  },
  {
    id: 6,
    title: 'Набор конспектов по физике',
    price: 3500,
    seller: 'Сая М.',
    category: 'Учебники',
    condition: 'Аккуратный',
    location: 'Блок B, 1 этаж',
    description:
      'Конспекты и шпаргалки по механике и электричеству. Подойдут для подготовки к экзамену.',
    accent: 'linear-gradient(135deg, #ec4899, #be185d)',
    images: [bookImage, laptopImage],
  },
]

export function formatListingPrice(price: number) {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₸`
}

export function getBuySellListingById(id: number) {
  return buySellListings.find((listing) => listing.id === id) ?? null
}
