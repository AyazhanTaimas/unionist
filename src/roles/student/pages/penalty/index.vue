<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getPenalties,
  getPenaltyById,
  redeemPenalty,
  type PenaltyItem,
  type PenaltyDetail,
} from './penaltyApi'
import { getProfile } from '@/roles/student/pages/profile/ui/profileApi'
import { useI18n } from '@/app/i18n'

const DEFAULT_DISCIPLINE_LIMIT = 10

type PageMode = 'list' | 'detail'

const loading = ref(false)
const { t, locale } = useI18n()
const detailLoading = ref(false)
const redeemLoading = ref(false)
const error = ref<string | null>(null)

const penalties = ref<PenaltyItem[]>([])
const selectedPenalty = ref<PenaltyDetail | null>(null)
const pageMode = ref<PageMode>('list')
const disciplineLimit = ref(DEFAULT_DISCIPLINE_LIMIT)

const showRedeemModal = ref(false)
const penaltyRulesPdfUrl = computed(() => `/penalty_rules_${locale.value}.pdf`)

const redeemForm = ref({
  event_type: '',
  description: '',
  file_path: '',
})

const redeemFormError = ref<string | null>(null)

const activePoints = computed(() => {
  return penalties.value.reduce((total, item) => {
    if (item.redeemed || item.points <= 0) {
      return total
    }

    return total + item.points
  }, 0)
})

const scoreText = computed(() => {
  return `${activePoints.value} / ${disciplineLimit.value}`
})

const disciplineLimitReached = computed(() =>
  disciplineLimit.value > 0 && activePoints.value >= disciplineLimit.value
)

function formatPoints(value: number) {
  return value > 0
    ? `+${value} ${t('pages.penalty.point')}`
    : `${value} ${t('pages.penalty.point')}`
}

function pointsClass(value: number) {
  return value > 0 ? 'points-positive' : 'points-negative'
}

async function loadPenalties() {
  loading.value = true
  error.value = null

  try {
    penalties.value = await getPenalties()
  } catch (e) {
    console.error(e)
    error.value = t('pages.penalty.loadError')
    penalties.value = []
  } finally {
    loading.value = false
  }
}

async function loadDisciplineLimit() {
  try {
    const profile = await getProfile()
    const limit = Number(profile.discipline_limit)

    disciplineLimit.value = Number.isFinite(limit) && limit > 0
      ? limit
      : DEFAULT_DISCIPLINE_LIMIT
  } catch (e) {
    console.error(e)
    disciplineLimit.value = DEFAULT_DISCIPLINE_LIMIT
  }
}

async function openPenaltyDetail(id: number) {
  detailLoading.value = true
  error.value = null

  try {
    selectedPenalty.value = await getPenaltyById(id)
    pageMode.value = 'detail'
  } catch (e) {
    console.error(e)
    error.value = t('pages.penalty.loadDetailError')
  } finally {
    detailLoading.value = false
  }
}

function backToList() {
  pageMode.value = 'list'
  selectedPenalty.value = null
}

function openRedeemModal() {
  redeemFormError.value = null
  showRedeemModal.value = true
}

function closeRedeemModal() {
  showRedeemModal.value = false
  redeemFormError.value = null
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    redeemForm.value.file_path = ''
    return
  }

  redeemForm.value.file_path = file.name
}

async function submitRedeem() {
  if (!selectedPenalty.value) return

  if (!redeemForm.value.event_type) {
    redeemFormError.value = t('pages.penalty.chooseEvent')
    return
  }

  if (!redeemForm.value.description.trim()) {
    redeemFormError.value = t('pages.penalty.enterDescription')
    return
  }

  if (!redeemForm.value.file_path.trim()) {
    redeemFormError.value = t('pages.penalty.attachFile')
    return
  }

  redeemLoading.value = true
  redeemFormError.value = null

  try {
    await redeemPenalty(selectedPenalty.value.id, {
      event_type: redeemForm.value.event_type,
      description: redeemForm.value.description,
      file_path: redeemForm.value.file_path,
    })

    closeRedeemModal()
    await loadPenalties()
    await openPenaltyDetail(selectedPenalty.value.id)
  } catch (e: any) {
    console.error(e)
    redeemFormError.value =
      e?.response?.data?.message || t('pages.penalty.redeemSubmitError')
  } finally {
    redeemLoading.value = false
  }
}

onMounted(() => {
  void Promise.all([loadPenalties(), loadDisciplineLimit()])
})
</script>

<template>
  <div class="penalty-page">
    <div class="penalty-card-wrapper">
      <div class="accent-line"></div>

      <div class="penalty-card">
        <template v-if="pageMode === 'list'">
          <div class="summary-box">
            <div class="summary-title">{{ t('pages.penalty.title') }}: {{ scoreText }}</div>

            <button class="summary-btn" :disabled="!penalties.length">
              {{ t('pages.penalty.redeemPenalty') }}
            </button>
          </div>

          <div v-if="disciplineLimitReached" class="limit-warning">
            <strong>{{ t('pages.penalty.limitReachedStudentTitle') }}</strong>
            <span>
              {{ t('pages.penalty.limitReachedStudentText', { score: scoreText }) }}
            </span>
          </div>

          <div v-if="loading" class="state-box">
            {{ t('common.loading') }}
          </div>

          <div v-else-if="error" class="state-box state-box--error">
            {{ error }}
          </div>

          <div v-else-if="!penalties.length" class="state-box">
            {{ t('pages.penalty.noItems') }}
          </div>

          <div v-else class="penalty-list">
            <button
              v-for="item in penalties"
              :key="item.id"
              class="penalty-row"
              @click="openPenaltyDetail(item.id)"
            >
              <div class="penalty-row__title">
                {{ item.title }}
              </div>

              <div class="penalty-row__date">
                {{ item.date }}
              </div>

              <div class="penalty-row__points" :class="pointsClass(item.points)">
                {{ formatPoints(item.points) }}
              </div>
            </button>
          </div>

          <div class="rules-note">
            {{ t('pages.penalty.rulesNote') }}
            <a
              :href="penaltyRulesPdfUrl"
              class="rules-link"
              target="_blank"
              rel="noreferrer"
            >
              {{ t('pages.penalty.rulesLink') }}
            </a>
          </div>
        </template>

        <template v-else>
          <div v-if="detailLoading" class="state-box">
            {{ t('common.loading') }}
          </div>

          <template v-else-if="selectedPenalty">
            <div class="detail-header">
              <button class="back-btn" @click="backToList">← {{ t('common.back') }}</button>

              <button class="summary-btn" @click="openRedeemModal">
                {{ t('pages.penalty.redeemPenalty') }}
              </button>
            </div>

            <h2 class="detail-title">{{ selectedPenalty.title }}</h2>

            <div class="detail-date">
              {{ t('pages.penalty.dateWithValue', { date: selectedPenalty.date }) }}
            </div>

            <p class="detail-description">
              {{ selectedPenalty.description }}
            </p>

            <a
              :href="penaltyRulesPdfUrl"
              class="rules-link detail-link"
              target="_blank"
              rel="noreferrer"
            >
              {{ t('pages.penalty.rulesLink') }}
            </a>

            <div v-if="selectedPenalty.images?.length" class="images-grid">
              <div
                v-for="(image, index) in selectedPenalty.images"
                :key="index"
                class="image-card"
              >
                <img :src="image" alt="Penalty evidence" />
              </div>
            </div>

            <div v-else class="evidence-empty">
              {{ t('pages.penalty.evidenceMissing') }}
            </div>
          </template>
        </template>
      </div>
    </div>

    <transition name="modal-fade">
      <div
        v-if="showRedeemModal"
        class="modal-overlay"
        @click.self="closeRedeemModal"
      >
        <div class="modal">
          <h3 class="modal-title">{{ t('pages.penalty.addRedemption') }}</h3>

          <div class="field">
            <label class="field-label">{{ t('pages.penalty.requestType') }}</label>
            <select v-model="redeemForm.event_type" class="field-input">
              <option value="">{{ t('pages.penalty.chooseEventPlaceholder') }}</option>
              <option value="community_work">community_work</option>
              <option value="cleaning">cleaning</option>
              <option value="volunteer_work">volunteer_work</option>
            </select>
          </div>

          <div class="field">
            <label class="field-label">{{ t('common.description') }}</label>
            <textarea
              v-model="redeemForm.description"
              class="field-textarea"
              rows="5"
            />
          </div>

          <div class="field">
            <label class="field-label">{{ t('pages.penalty.attachFile') }}</label>
            <input
              type="file"
              class="field-file"
              @change="onFileChange"
            />
            <div class="file-note">
              {{ redeemForm.file_path || t('pages.penalty.fileNotSelected') }}
            </div>
          </div>

          <div v-if="redeemFormError" class="form-error">
            {{ redeemFormError }}
          </div>

          <div class="modal-actions">
            <button
              class="save-btn"
              :disabled="redeemLoading"
              @click="submitRedeem"
            >
              {{ redeemLoading ? t('common.saving') : t('common.save') }}
            </button>

            <button class="cancel-btn" @click="closeRedeemModal">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.penalty-page {
  width: 100%;
  min-height: 100%;
  margin-top:100px;
}

.penalty-card-wrapper {
  position: relative;
  width: 100%;
  margin-top: -50px;
}

.accent-line {
  position: absolute;
  left: 18px;
  top: 18px;
  bottom: 18px;
  width: 4px;
  border-radius: 10px;
  background: #4d46ff;

}

.penalty-card {
  margin-left: 18px;
  background: #ffffff;
  border: 1px solid #d9dde7;
  border-radius: 34px;
  padding: 18px 20px 16px;
  box-shadow: 0 5px 14px rgba(15, 23, 42, 0.1);
  min-height: 360px;
}

.summary-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #f3fbfb;
  border-radius: 24px;
  padding: 20px 18px;
  margin-bottom: 18px;
}

.summary-title {
  font-size: 28px;
  font-weight: 700;
  color: #111111;
}

.summary-btn {
  min-width: 170px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: #4d46ff;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

.summary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.limit-warning {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #991b1b;
}

.limit-warning strong {
  font-size: 15px;
}

.limit-warning span {
  color: #b91c1c;
  line-height: 1.45;
}

.penalty-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.penalty-row {
  width: 100%;
  min-height: 46px;
  border-radius: 999px;
  border: 1px solid #d6d6d6;
  background: #ffffff;
  display: grid;
  grid-template-columns: 1fr 120px 100px;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
  text-align: left;
  cursor: pointer;
}

.penalty-row__title {
  font-size: 14px;
  color: #111111;
}

.penalty-row__date {
  font-size: 13px;
  font-weight: 600;
  color: #222222;
  text-align: right;
}

.penalty-row__points {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.points-positive {
  color: #111111;
}

.points-negative {
  color: #33a340;
}

.rules-note {
  margin-top: 14px;
  text-align: center;
  font-size: 13px;
  color: #111111;
  line-height: 1.35;
}

.rules-link {
  color: #2f6fff;
  text-decoration: none;
  margin-left: 4px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-btn {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #4d46ff;
  cursor: pointer;
  padding: 0;
}

.detail-title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  color: #111111;
}

.detail-date {
  margin-bottom: 12px;
  font-size: 14px;
  color: #2d2d2d;
}

.detail-description {
  margin: 0 0 14px;
  max-width: 720px;
  font-size: 15px;
  line-height: 1.35;
  color: #111111;
}

.detail-link {
  display: inline-block;
  margin-bottom: 18px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 600px;
}

.image-card {
  height: 160px;
  border-radius: 22px;
  overflow: hidden;
  background: #ececec;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.evidence-empty {
  max-width: 420px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fafc;
  color: #64748b;
}

.state-box {
  padding: 18px;
  border-radius: 20px;
  background: #f8fafc;
  color: #334155;
}

.state-box--error {
  background: #fff1f2;
  color: #be123c;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.26);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 20px 18px 16px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
}

.modal-title {
  margin: 0 0 12px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #111111;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.field-label {
  font-size: 14px;
  color: #111111;
}

.field-input,
.field-textarea,
.field-file {
  width: 100%;
  border: 1px solid #d5d5d5;
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 14px;
  color: #111111;
  background: #ffffff;
  box-sizing: border-box;
}

.field-textarea {
  resize: none;
  min-height: 100px;
}

.file-note {
  font-size: 12px;
  color: #6b7280;
}

.form-error {
  margin-bottom: 10px;
  font-size: 13px;
  color: #dc2626;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.save-btn,
.cancel-btn {
  flex: 1;
  height: 34px;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
}

.save-btn {
  background: #4d46ff;
  color: #ffffff;
}

.cancel-btn {
  background: #d7d7d7;
  color: #ffffff;
}

@media (max-width: 900px) {
  .images-grid {
    grid-template-columns: 1fr;
    max-width: 100%;
  }

  .penalty-row {
    grid-template-columns: 1fr;
    border-radius: 18px;
    padding: 12px 14px;
  }

  .penalty-row__date,
  .penalty-row__points {
    text-align: left;
  }

  .summary-box,
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 700px) {
  .penalty-page {
    margin-top: 40px;
  }

  .penalty-card-wrapper {
    margin-top: 0;
  }

  .accent-line {
    display: none;
  }

  .penalty-card {
    margin-left: 0;
    padding: 12px;
    border-radius: 18px;
  }

  .summary-box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 12px;
    border-radius: 14px;
  }

  .summary-title {
    font-size: 20px;
  }

  .summary-btn {
    width: auto;
    min-width: 130px;
    min-height: 38px;
    padding: 0 12px;
  }

  .detail-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .detail-title {
    font-size: 20px;
  }

  .rules-link {
    display: block;
    margin: 6px 0 0;
  }

  .image-card {
    height: 120px;
    border-radius: 14px;
  }

  .modal {
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
    padding: 18px 16px;
    border-radius: 22px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .save-btn,
  .cancel-btn {
    min-height: 42px;
  }

  .penalty-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 10px;
    min-height: 0;
    padding: 10px 12px;
    border-radius: 14px;
  }

  .penalty-row__date {
    grid-column: 1;
    text-align: left;
  }

  .penalty-row__points {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    text-align: right;
  }
}

@media (max-width: 420px) {
  .summary-box,
  .detail-header {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary-btn {
    width: 100%;
  }
}
</style>
