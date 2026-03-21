<script setup lang="ts">
import { ref, computed } from 'vue'
import { submitFeedback } from '@/modules/feedback/services/feedback.service'
import type { FeedbackSubject } from '@/modules/feedback/services/feedback.service'
import RoadmapModal from './RoadmapModal.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const SUBJECTS: { value: FeedbackSubject; label: string }[] = [
  { value: 'feedback', label: 'General feedback' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'question', label: 'Question' },
  { value: 'performance', label: 'Performance issue' },
  { value: 'other', label: 'Other' },
]

const subject = ref<FeedbackSubject>('feedback')
const message = ref('')
const isAnonymous = ref(true)
const isSubmitting = ref(false)
const submitted = ref(false)
const error = ref('')
const isRoadmapOpen = ref(false)

const MIN_LENGTH = 20
const MAX_LENGTH = 2000
const remaining = computed(() => MAX_LENGTH - message.value.length)
const isTooShort = computed(() => message.value.trim().length < MIN_LENGTH)

const reset = () => {
  subject.value = 'feedback'
  message.value = ''
  isAnonymous.value = true
  isSubmitting.value = false
  submitted.value = false
  error.value = ''
}

const close = () => {
  reset()
  emit('close')
}

const handleSubmit = async () => {
  if (!message.value.trim()) return
  error.value = ''
  isSubmitting.value = true
  try {
    await submitFeedback({ subject: subject.value, message: message.value, is_anonymous: isAnonymous.value })
    submitted.value = true
  } catch {
    error.value = 'Failed to send feedback. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

      <!-- Panel -->
      <div class="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-[20px] text-primary">feedback</span>
            <p class="text-sm font-semibold">Send feedback</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-1 text-xs text-muted hover:text-primary" @click="isRoadmapOpen = true">
              <span class="material-symbols-rounded text-[15px]">rocket_launch</span>
              Roadmap
            </button>
            <button class="text-muted hover:text-text" @click="close">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>
        </div>

        <!-- Success state -->
        <div v-if="submitted" class="flex flex-col items-center gap-4 px-5 py-10 text-center">
          <span class="material-symbols-rounded text-[48px] text-success">check_circle</span>
          <p class="text-sm font-semibold">Thank you for your feedback!</p>
          <p class="text-xs text-muted">We'll review it shortly.</p>
          <button class="ns-btn ns-btn-primary mt-2" @click="close">Close</button>
        </div>

        <!-- Form -->
        <form v-else class="space-y-4 px-5 py-5" @submit.prevent="handleSubmit">
          <!-- Subject -->
          <label class="block text-xs font-semibold text-muted">
            Subject
            <select v-model="subject" class="ns-input mt-1.5 w-full">
              <option v-for="opt in SUBJECTS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>

          <!-- Message -->
          <label class="block text-xs font-semibold text-muted">
            Message
            <textarea
              v-model="message"
              class="ns-input mt-1.5 w-full resize-none"
              rows="5"
              placeholder="Describe your feedback, bug, or question..."
              maxlength="2000"
            />
            <div class="mt-1 flex items-center justify-between text-[11px]">
              <span :class="isTooShort && message.length > 0 ? 'text-[--color-warning]' : 'text-muted'">
                {{ isTooShort && message.length > 0 ? `${MIN_LENGTH - message.trim().length} more characters needed` : '&nbsp;' }}
              </span>
              <span :class="remaining < 100 ? 'text-[--color-warning]' : 'text-muted'">
                {{ message.length }}/{{ MAX_LENGTH }}
              </span>
            </div>
          </label>

          <!-- Anonymous toggle -->
          <label class="flex cursor-pointer items-center gap-3">
            <div
              class="relative h-5 w-9 rounded-full transition-colors"
              :style="{ background: isAnonymous ? 'var(--color-border)' : 'var(--color-primary)' }"
              @click="isAnonymous = !isAnonymous"
            >
              <div
                class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                :class="isAnonymous ? 'left-0.5' : 'left-[18px]'"
              />
            </div>
            <span class="text-xs text-muted">
              {{ isAnonymous ? 'Send anonymously' : 'Send with my email' }}
            </span>
          </label>

          <p v-if="error" class="text-xs text-danger">{{ error }}</p>

          <div class="flex justify-end gap-2 pt-1">
            <button type="button" class="ns-btn ns-btn-ghost text-sm" @click="close">Cancel</button>
            <button
              type="submit"
              class="ns-btn ns-btn-primary text-sm"
              :disabled="isSubmitting || isTooShort"
            >
              {{ isSubmitting ? 'Sending…' : 'Send feedback' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <RoadmapModal :open="isRoadmapOpen" @close="isRoadmapOpen = false" />
</template>
