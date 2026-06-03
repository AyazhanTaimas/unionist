import { nextTick, watch } from 'vue'
import { locale, type Locale } from '@/app/i18n'

type StaticTranslations = Record<string, Record<Locale, string>>

const staticTranslations: StaticTranslations = {
  'Новости': {
    kk: 'Жаңалықтар',
    ru: 'Новости',
    en: 'News',
  },
  'Уведомления': {
    kk: 'Хабарламалар',
    ru: 'Уведомления',
    en: 'Notifications',
  },
  'Пользователи': {
    kk: 'Пайдаланушылар',
    ru: 'Пользователи',
    en: 'Users',
  },
  'Заявки на проживание': {
    kk: 'Тұру өтінімдері',
    ru: 'Заявки на проживание',
    en: 'Housing requests',
  },
  'Смена комнаты': {
    kk: 'Бөлмені ауыстыру',
    ru: 'Смена комнаты',
    en: 'Change room',
  },
  'Проживание': {
    kk: 'Тұру',
    ru: 'Проживание',
    en: 'Housing',
  },
  'Мои запросы': {
    kk: 'Менің өтінімдерім',
    ru: 'Мои запросы',
    en: 'My requests',
  },
  'Ремонт': {
    kk: 'Жөндеу',
    ru: 'Ремонт',
    en: 'Repairs',
  },
  'Финансовый кабинет': {
    kk: 'Қаржы кабинеті',
    ru: 'Финансовый кабинет',
    en: 'Finance',
  },
  'Штрафы': {
    kk: 'Айыппұлдар',
    ru: 'Штрафы',
    en: 'Penalties',
  },
  'Тренажерный зал': {
    kk: 'Спортзал',
    ru: 'Тренажерный зал',
    en: 'Gym',
  },
  'Купи-продай': {
    kk: 'Сатып алу-сату',
    ru: 'Купи-продай',
    en: 'Buy and sell',
  },
  'Загрузка...': {
    kk: 'Жүктелуде...',
    ru: 'Загрузка...',
    en: 'Loading...',
  },
  'Загрузка данных...': {
    kk: 'Деректер жүктелуде...',
    ru: 'Загрузка данных...',
    en: 'Loading data...',
  },
  'Загрузка заявок...': {
    kk: 'Өтінімдер жүктелуде...',
    ru: 'Загрузка заявок...',
    en: 'Loading requests...',
  },
  'Загрузка штрафов...': {
    kk: 'Айыппұлдар жүктелуде...',
    ru: 'Загрузка штрафов...',
    en: 'Loading penalties...',
  },
  'Загрузка формы...': {
    kk: 'Форма жүктелуде...',
    ru: 'Загрузка формы...',
    en: 'Loading form...',
  },
  'Обновить': {
    kk: 'Жаңарту',
    ru: 'Обновить',
    en: 'Refresh',
  },
  'Обновление...': {
    kk: 'Жаңартылуда...',
    ru: 'Обновление...',
    en: 'Refreshing...',
  },
  'Сохранить': {
    kk: 'Сақтау',
    ru: 'Сохранить',
    en: 'Save',
  },
  'Сохранение...': {
    kk: 'Сақталуда...',
    ru: 'Сохранение...',
    en: 'Saving...',
  },
  'Сохранение…': {
    kk: 'Сақталуда...',
    ru: 'Сохранение…',
    en: 'Saving...',
  },
  'Отмена': {
    kk: 'Бас тарту',
    ru: 'Отмена',
    en: 'Cancel',
  },
  'Отправить': {
    kk: 'Жіберу',
    ru: 'Отправить',
    en: 'Send',
  },
  'Отправка...': {
    kk: 'Жіберілуде...',
    ru: 'Отправка...',
    en: 'Sending...',
  },
  'Да': {
    kk: 'Иә',
    ru: 'Да',
    en: 'Yes',
  },
  'Нет': {
    kk: 'Жоқ',
    ru: 'Нет',
    en: 'No',
  },
  'Все': {
    kk: 'Барлығы',
    ru: 'Все',
    en: 'All',
  },
  'Всего': {
    kk: 'Барлығы',
    ru: 'Всего',
    en: 'Total',
  },
  'Активные': {
    kk: 'Белсенді',
    ru: 'Активные',
    en: 'Active',
  },
  'Закрытые': {
    kk: 'Жабылған',
    ru: 'Закрытые',
    en: 'Closed',
  },
  'На рассмотрении': {
    kk: 'Қаралуда',
    ru: 'На рассмотрении',
    en: 'Pending',
  },
  'Принято': {
    kk: 'Қабылданды',
    ru: 'Принято',
    en: 'Accepted',
  },
  'Принята': {
    kk: 'Қабылданды',
    ru: 'Принята',
    en: 'Accepted',
  },
  'Отклонено': {
    kk: 'Қабылданбады',
    ru: 'Отклонено',
    en: 'Rejected',
  },
  'Отклонена': {
    kk: 'Қабылданбады',
    ru: 'Отклонена',
    en: 'Rejected',
  },
  'История': {
    kk: 'Тарих',
    ru: 'История',
    en: 'History',
  },
  'Статус': {
    kk: 'Күйі',
    ru: 'Статус',
    en: 'Status',
  },
  'Действия': {
    kk: 'Әрекеттер',
    ru: 'Действия',
    en: 'Actions',
  },
  'Телефон': {
    kk: 'Телефон',
    ru: 'Телефон',
    en: 'Phone',
  },
  'Email': {
    kk: 'Email',
    ru: 'Email',
    en: 'Email',
  },
  'Пол': {
    kk: 'Жынысы',
    ru: 'Пол',
    en: 'Gender',
  },
  'Пароль': {
    kk: 'Құпиясөз',
    ru: 'Пароль',
    en: 'Password',
  },
  'Старый пароль': {
    kk: 'Ескі құпиясөз',
    ru: 'Старый пароль',
    en: 'Old password',
  },
  'Новый пароль': {
    kk: 'Жаңа құпиясөз',
    ru: 'Новый пароль',
    en: 'New password',
  },
  'Повторите новый пароль': {
    kk: 'Жаңа құпиясөзді қайталаңыз',
    ru: 'Повторите новый пароль',
    en: 'Repeat new password',
  },
  'Комната': {
    kk: 'Бөлме',
    ru: 'Комната',
    en: 'Room',
  },
  'Адрес': {
    kk: 'Мекенжай',
    ru: 'Адрес',
    en: 'Address',
  },
  'Комментарий': {
    kk: 'Пікір',
    ru: 'Комментарий',
    en: 'Comment',
  },
  'Описание': {
    kk: 'Сипаттама',
    ru: 'Описание',
    en: 'Description',
  },
  'Документы': {
    kk: 'Құжаттар',
    ru: 'Документы',
    en: 'Documents',
  },
  'Фотографии': {
    kk: 'Фотосуреттер',
    ru: 'Фотографии',
    en: 'Photos',
  },
  'Доказательства': {
    kk: 'Дәлелдер',
    ru: 'Доказательства',
    en: 'Evidence',
  },
  'Файл': {
    kk: 'Файл',
    ru: 'Файл',
    en: 'File',
  },
  'Баллы': {
    kk: 'Ұпайлар',
    ru: 'Баллы',
    en: 'Points',
  },
  'Выдан': {
    kk: 'Берілді',
    ru: 'Выдан',
    en: 'Issued',
  },
  'Создал': {
    kk: 'Құрған',
    ru: 'Создал',
    en: 'Created by',
  },
  'Отправлена': {
    kk: 'Жіберілді',
    ru: 'Отправлена',
    en: 'Sent',
  },
  'Обновлена': {
    kk: 'Жаңартылды',
    ru: 'Обновлена',
    en: 'Updated',
  },
  'Создана': {
    kk: 'Құрылды',
    ru: 'Создана',
    en: 'Created',
  },
  'Категория': {
    kk: 'Санат',
    ru: 'Категория',
    en: 'Category',
  },
  'Сантехника': {
    kk: 'Сантехника',
    ru: 'Сантехника',
    en: 'Plumbing',
  },
  'Электрика': {
    kk: 'Электр',
    ru: 'Электрика',
    en: 'Electrical',
  },
  'Мебель': {
    kk: 'Жиһаз',
    ru: 'Мебель',
    en: 'Furniture',
  },
  'Отопление': {
    kk: 'Жылыту',
    ru: 'Отопление',
    en: 'Heating',
  },
  'Другое': {
    kk: 'Басқа',
    ru: 'Другое',
    en: 'Other',
  },
  'Новая': {
    kk: 'Жаңа',
    ru: 'Новая',
    en: 'New',
  },
  'В работе': {
    kk: 'Жұмыста',
    ru: 'В работе',
    en: 'In progress',
  },
  'Исправлено': {
    kk: 'Түзетілді',
    ru: 'Исправлено',
    en: 'Fixed',
  },
  'Активен': {
    kk: 'Белсенді',
    ru: 'Активен',
    en: 'Active',
  },
  'Закрыт': {
    kk: 'Жабылды',
    ru: 'Закрыт',
    en: 'Closed',
  },
  'Отменен': {
    kk: 'Бас тартылды',
    ru: 'Отменен',
    en: 'Cancelled',
  },
  'Одобрить': {
    kk: 'Мақұлдау',
    ru: 'Одобрить',
    en: 'Approve',
  },
  'Отклонить': {
    kk: 'Қабылдамау',
    ru: 'Отклонить',
    en: 'Reject',
  },
  'Принять': {
    kk: 'Қабылдау',
    ru: 'Принять',
    en: 'Accept',
  },
  'Принятие...': {
    kk: 'Қабылдануда...',
    ru: 'Принятие...',
    en: 'Accepting...',
  },
  'Отклонение...': {
    kk: 'Қабылданбауда...',
    ru: 'Отклонение...',
    en: 'Rejecting...',
  },
  'Одобрение...': {
    kk: 'Мақұлдануда...',
    ru: 'Одобрение...',
    en: 'Approving...',
  },
  'Отменить штраф': {
    kk: 'Айыппұлды болдырмау',
    ru: 'Отменить штраф',
    en: 'Cancel penalty',
  },
  'Не указан': {
    kk: 'Көрсетілмеген',
    ru: 'Не указан',
    en: 'Not specified',
  },
  'Неизвестно': {
    kk: 'Белгісіз',
    ru: 'Неизвестно',
    en: 'Unknown',
  },
  'Дата неизвестна': {
    kk: 'Күні белгісіз',
    ru: 'Дата неизвестна',
    en: 'Unknown date',
  },
  'Без ID': {
    kk: 'ID жоқ',
    ru: 'Без ID',
    en: 'No ID',
  },
  'без ID': {
    kk: 'ID жоқ',
    ru: 'без ID',
    en: 'no ID',
  },
  'Без email': {
    kk: 'Email жоқ',
    ru: 'Без email',
    en: 'No email',
  },
  'Без имени': {
    kk: 'Аты жоқ',
    ru: 'Без имени',
    en: 'No name',
  },
  'Без названия': {
    kk: 'Атауы жоқ',
    ru: 'Без названия',
    en: 'Untitled',
  },
  'Студент не найден': {
    kk: 'Студент табылмады',
    ru: 'Студент не найден',
    en: 'Student not found',
  },
  'Комментарий не указан': {
    kk: 'Пікір көрсетілмеген',
    ru: 'Комментарий не указан',
    en: 'Comment not specified',
  },
  'Комната не указана': {
    kk: 'Бөлме көрсетілмеген',
    ru: 'Комната не указана',
    en: 'Room not specified',
  },
  'Комната не выбрана': {
    kk: 'Бөлме таңдалмаған',
    ru: 'Комната не выбрана',
    en: 'Room not selected',
  },
  'Нет активного заселения': {
    kk: 'Белсенді тұру жоқ',
    ru: 'Нет активного заселения',
    en: 'No active housing',
  },
  'Уже заселен': {
    kk: 'Қазірдің өзінде қоныстанған',
    ru: 'Уже заселен',
    en: 'Already housed',
  },
  'Личная информация': {
    kk: 'Жеке ақпарат',
    ru: 'Личная информация',
    en: 'Personal information',
  },
  'Сменить пароль': {
    kk: 'Құпиясөзді өзгерту',
    ru: 'Сменить пароль',
    en: 'Change password',
  },
  'Сохранить изменения': {
    kk: 'Өзгерістерді сақтау',
    ru: 'Сохранить изменения',
    en: 'Save changes',
  },
  'Текущий абонемент': {
    kk: 'Ағымдағы абонемент',
    ru: 'Текущий абонемент',
    en: 'Current membership',
  },
  'Выбор абонемента': {
    kk: 'Абонемент таңдау',
    ru: 'Выбор абонемента',
    en: 'Choose membership',
  },
  'Выберите тариф': {
    kk: 'Тариф таңдаңыз',
    ru: 'Выберите тариф',
    en: 'Choose a plan',
  },
  'Осталось занятий': {
    kk: 'Қалған сабақтар',
    ru: 'Осталось занятий',
    en: 'Sessions left',
  },
  'Длительность': {
    kk: 'Ұзақтығы',
    ru: 'Длительность',
    en: 'Duration',
  },
  'Формат': {
    kk: 'Формат',
    ru: 'Формат',
    en: 'Format',
  },
  'Действует до': {
    kk: 'Дейін жарамды',
    ru: 'Действует до',
    en: 'Valid until',
  },
  'Текущий визит': {
    kk: 'Ағымдағы кіру',
    ru: 'Текущий визит',
    en: 'Current visit',
  },
  'Календарь активности': {
    kk: 'Белсенділік күнтізбесі',
    ru: 'Календарь активности',
    en: 'Activity calendar',
  },
  'Пн': {
    kk: 'Дс',
    ru: 'Пн',
    en: 'Mon',
  },
  'Вт': {
    kk: 'Сс',
    ru: 'Вт',
    en: 'Tue',
  },
  'Ср': {
    kk: 'Ср',
    ru: 'Ср',
    en: 'Wed',
  },
  'Чт': {
    kk: 'Бс',
    ru: 'Чт',
    en: 'Thu',
  },
  'Пт': {
    kk: 'Жм',
    ru: 'Пт',
    en: 'Fri',
  },
  'Сб': {
    kk: 'Сн',
    ru: 'Сб',
    en: 'Sat',
  },
  'Вс': {
    kk: 'Жс',
    ru: 'Вс',
    en: 'Sun',
  },
}

const translatableAttrs = ['placeholder', 'title', 'aria-label', 'alt']
const skippedTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE'])
let observer: MutationObserver | null = null
let scheduled = false

const findSourceText = (value: string) => {
  if (staticTranslations[value]) return value

  return Object.keys(staticTranslations).find((source) =>
    Object.values(staticTranslations[source]!).includes(value)
  )
}

const translateStatic = (value: string) => {
  const match = value.match(/^(\s*)(.*?)(\s*)$/s)
  if (!match) return value

  const [, leading = '', content = '', trailing = ''] = match
  const source = findSourceText(content)
  if (!source) return value

  return `${leading}${staticTranslations[source]![locale.value]}${trailing}`
}

const translateTextNode = (node: Text) => {
  const translated = translateStatic(node.data)
  if (translated !== node.data) {
    node.data = translated
  }
}

const translateElementAttrs = (element: Element) => {
  translatableAttrs.forEach((attr) => {
    const value = element.getAttribute(attr)
    if (!value) return

    const translated = translateStatic(value)
    if (translated !== value) {
      element.setAttribute(attr, translated)
    }
  })
}

const walk = (node: Node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node as Text)
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return
  }

  const element = node as Element
  if (skippedTags.has(element.tagName)) {
    return
  }

  translateElementAttrs(element)
  Array.from(element.childNodes).forEach(walk)
}

const applyStaticTranslations = () => {
  const root = document.getElementById('app')
  if (!root) return

  observer?.disconnect()
  walk(root)
  observer?.observe(root, {
    attributes: true,
    attributeFilter: translatableAttrs,
    childList: true,
    characterData: true,
    subtree: true,
  })
}

export const scheduleStaticTranslations = () => {
  if (typeof document === 'undefined' || scheduled) return

  scheduled = true
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      scheduled = false
      applyStaticTranslations()
    })
  })
}

export const initStaticTranslations = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const root = document.getElementById('app')
  if (!root) return

  observer = new MutationObserver(scheduleStaticTranslations)
  scheduleStaticTranslations()
  watch(locale, scheduleStaticTranslations)
}
