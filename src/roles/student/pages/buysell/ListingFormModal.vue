<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  createBuySellListing,
  updateBuySellListing,
  type BuySellListing,
  type BuySellOption,
} from './api'

const props = defineProps<{
  listing?: BuySellListing | null
  categories: BuySellOption[]
  conditions: BuySellOption[]
  statuses: BuySellOption[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

type ExistingImage = {
  path: string
  url: string
}

type NewImagePreview = {
  file: File
  url: string
}

const title = ref('')
const description = ref('')
const price = ref('')
const category = ref('')
const condition = ref('')
const status = ref('active')
const pickupLocation = ref('')
const contactPhone = ref('')
const existingImages = ref<ExistingImage[]>([])
const newImages = ref<NewImagePreview[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const isEditing = computed(() => Boolean(props.listing))

function resetForm() {
  title.value = props.listing?.title ?? ''
  description.value = props.listing?.description ?? ''
  price.value = props.listing ? String(props.listing.price) : ''
  category.value = props.listing?.category ?? props.categories[0]?.value ?? ''
  condition.value = props.listing?.condition ?? props.conditions[0]?.value ?? ''
  status.value = props.listing?.status ?? 'active'
  pickupLocation.value = props.listing?.pickup_location ?? ''
  contactPhone.value = props.listing?.contact_phone ?? ''
  existingImages.value = props.listing
    ? props.listing.image_paths.map((path, index) => ({
        path,
        url: props.listing?.images[index] ?? '',
      }))
    : []
  clearNewImages()
  error.value = null
}

function clearNewImages() {
  newImages.value.forEach((item) => URL.revokeObjectURL(item.url))
  newImages.value = []
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  if (!files.length) return

  const remainingSlots = 5 - (existingImages.value.length + newImages.value.length)
  const acceptedFiles = files.slice(0, Math.max(remainingSlots, 0))

  acceptedFiles.forEach((file) => {
    newImages.value.push({
      file,
      url: URL.createObjectURL(file),
    })
  })

  input.value = ''
}

function removeExistingImage(path: string) {
  existingImages.value = existingImages.value.filter((image) => image.path !== path)
}

function removeNewImage(url: string) {
  const target = newImages.value.find((image) => image.url === url)
  if (target) {
    URL.revokeObjectURL(target.url)
  }

  newImages.value = newImages.value.filter((image) => image.url !== url)
}

async function submit() {
  error.value = null

  if (!title.value.trim()) {
    error.value = 'Введите название товара'
    return
  }

  if (existingImages.value.length + newImages.value.length < 1) {
    error.value = 'Добавьте хотя бы одно изображение'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('title', title.value.trim())
    formData.append('description', description.value.trim())
    formData.append('price', price.value || '0')
    formData.append('category', category.value)
    formData.append('condition', condition.value)
    formData.append('status', status.value)
    formData.append('pickup_location', pickupLocation.value.trim())
    formData.append('contact_phone', contactPhone.value.trim())

    existingImages.value.forEach((image) => {
      formData.append('existing_images[]', image.path)
    })

    newImages.value.forEach((image) => {
      formData.append('images[]', image.file)
    })

    if (props.listing) {
      await updateBuySellListing(props.listing.id, formData)
    } else {
      await createBuySellListing(formData)
    }

    emit('saved')
  } catch (e: any) {
    console.error(e)

    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.errors?.images?.[0] ||
      'Не удалось сохранить объявление'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.listing, props.categories, props.conditions],
  () => {
    resetForm()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearNewImages()
})
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-head">
        <div>
          <div class="kicker">Buy-sell</div>
          <h2>{{ isEditing ? 'Редактировать объявление' : 'Новое объявление' }}</h2>
        </div>

        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <div class="form-grid">
        <label class="field field--wide">
          <span>Название</span>
          <input v-model="title" type="text" placeholder="Например, Калькулятор Casio" />
        </label>

        <label class="field field--wide">
          <span>Описание</span>
          <textarea
            v-model="description"
            rows="5"
            placeholder="Опишите товар, состояние и комплект"
          />
        </label>

        <label class="field">
          <span>Цена, ₸</span>
          <input v-model="price" type="number" min="0" placeholder="0" />
        </label>

        <label class="field">
          <span>Категория</span>
          <select v-model="category">
            <option v-for="item in categories" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Состояние</span>
          <select v-model="condition">
            <option v-for="item in conditions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Статус</span>
          <select v-model="status">
            <option v-for="item in statuses" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Локация</span>
          <input
            v-model="pickupLocation"
            type="text"
            placeholder="Блок A, 3 этаж или вахта"
          />
        </label>

        <label class="field">
          <span>Телефон</span>
          <input v-model="contactPhone" type="text" placeholder="+7 777 000 00 00" />
        </label>

        <label class="field field--wide">
          <span>Фото товара</span>
          <input
            type="file"
            accept="image/*"
            multiple
            :disabled="existingImages.length + newImages.length >= 5"
            @change="handleFileChange"
          />
          <small>До 5 изображений</small>
        </label>
      </div>

      <div v-if="existingImages.length || newImages.length" class="preview-grid">
        <div v-for="image in existingImages" :key="image.path" class="preview-card">
          <img :src="image.url" alt="" />
          <button class="remove-btn" @click="removeExistingImage(image.path)">Удалить</button>
        </div>

        <div v-for="image in newImages" :key="image.url" class="preview-card">
          <img :src="image.url" alt="" />
          <button class="remove-btn" @click="removeNewImage(image.url)">Удалить</button>
        </div>
      </div>

      <div class="actions">
        <button class="secondary-btn" @click="emit('close')">Отмена</button>
        <button class="primary-btn" :disabled="loading" @click="submit">
          {{ loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Опубликовать' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(6px);
}

.modal {
  width: min(860px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.28);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.kicker {
  color: #68789e;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.76rem;
  font-weight: 700;
}

.modal-head h2 {
  margin: 10px 0 0;
  color: #0f172a;
}

.close-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #eef2ff;
  color: #1f2a44;
  font-size: 1.5rem;
  cursor: pointer;
}

.error-banner {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fee2e2;
  color: #991b1b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.field {
  display: grid;
  gap: 8px;
}

.field--wide {
  grid-column: 1 / -1;
}

.field span,
.field small {
  color: #5b6785;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid #dbe2f1;
  border-radius: 16px;
  padding: 14px 16px;
  background: #fff;
  font: inherit;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.preview-card {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #dbe2f1;
}

.preview-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 14px;
}

.remove-btn,
.secondary-btn,
.primary-btn {
  border: none;
  font: inherit;
  cursor: pointer;
  border-radius: 14px;
}

.remove-btn {
  min-height: 40px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.secondary-btn,
.primary-btn {
  min-width: 140px;
  min-height: 48px;
  padding: 0 18px;
}

.secondary-btn {
  background: #eef2ff;
  color: #2b3561;
}

.primary-btn {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
}

@media (max-width: 720px) {
  .modal {
    padding: 18px;
    border-radius: 22px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .secondary-btn,
  .primary-btn {
    width: 100%;
  }
}
</style>
