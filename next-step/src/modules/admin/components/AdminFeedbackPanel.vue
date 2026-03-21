<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminFeedback, AdminFeedbackRow, FeedbackStatus } from '../services/admin.service'
import { updateFeedbackStatus } from '../services/admin.service'

const props = defineProps<{ feedback: AdminFeedback }>()
const emit = defineEmits<{ (e: 'reload'): void }>()

const activeTab = ref<FeedbackStatus | 'all'>('new')
const editingTicket = ref<number | null>(null)
const ticketInput = ref('')
const saving = ref<number | null>(null)

const SUBJECT_LABELS: Record<string, string> = {
  feedback: 'Feedback',
  bug: 'Bug',
  feature_request: 'Feature request',
  question: 'Question',
  performance: 'Performance',
  other: 'Other',
}

const SUBJECT_COLORS: Record<string, string> = {
  bug: 'text-[--color-danger]',
  feature_request: 'text-[--color-primary]',
  performance: 'text-[--color-warning]',
  question: 'text-[--color-success]',
  feedback: 'text-text',
  other: 'text-muted',
}

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; dot: string; badge: string }> = {
  new: {
    label: 'New',
    dot: 'bg-[--color-primary]',
    badge: 'border-[--color-primary] text-[--color-primary] bg-[--color-primary-soft]',
  },
  in_progress: {
    label: 'In progress',
    dot: 'bg-[--color-warning]',
    badge: 'border-[--color-warning] text-[--color-warning] bg-[--color-warning-soft]',
  },
  archived: {
    label: 'Archived',
    dot: 'bg-[--color-border]',
    badge: 'border-border text-muted bg-surface',
  },
}

const TABS: { key: FeedbackStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'archived', label: 'Archived' },
]

const tabCount = (key: FeedbackStatus | 'all') =>
  key === 'all' ? props.feedback.total : (props.feedback.byStatus?.[key] ?? 0)

const statusConfig = (status: string) =>
  STATUS_CONFIG[status as FeedbackStatus] ?? STATUS_CONFIG.new

const rows = ref<AdminFeedbackRow[]>(props.feedback.rows)

// Keep local rows in sync when prop changes (after reload)
watch(() => props.feedback.rows, (v) => { rows.value = [...v] }, { deep: true })

const localRows = computed(() =>
  activeTab.value === 'all'
    ? rows.value
    : rows.value.filter((r) => r.status === activeTab.value)
)

const setStatus = async (row: AdminFeedbackRow, status: FeedbackStatus) => {
  saving.value = row.id
  try {
    const updated = await updateFeedbackStatus(row.id, { status })
    const idx = rows.value.findIndex((r) => r.id === row.id)
    if (idx !== -1) rows.value[idx] = updated
    emit('reload')
  } finally {
    saving.value = null
  }
}

const startEditTicket = (row: AdminFeedbackRow) => {
  editingTicket.value = row.id
  ticketInput.value = row.ticket_number ?? ''
}

const saveTicket = async (row: AdminFeedbackRow) => {
  saving.value = row.id
  try {
    const updated = await updateFeedbackStatus(row.id, { ticket_number: ticketInput.value })
    const idx = rows.value.findIndex((r) => r.id === row.id)
    if (idx !== -1) rows.value[idx] = updated
    editingTicket.value = null
  } finally {
    saving.value = null
  }
}

const cancelEditTicket = () => {
  editingTicket.value = null
  ticketInput.value = ''
}
</script>

<template>
  <div class="rounded-lg border border-border bg-surface-2 p-4">

    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm font-semibold">User feedback</p>
      <span class="text-xs text-muted">{{ feedback.total }} total · {{ feedback.anonymousCount }} anonymous</span>
    </div>

    <!-- Subject breakdown -->
    <div class="mb-4 flex flex-wrap gap-2">
      <span
        v-for="(count, subject) in feedback.bySubject"
        :key="subject"
        class="rounded-full border border-border px-2.5 py-0.5 text-xs"
        :class="SUBJECT_COLORS[subject] || 'text-text'"
      >
        {{ SUBJECT_LABELS[subject] || subject }} · {{ count }}
      </span>
    </div>

    <!-- Status tabs -->
    <div class="mb-3 flex gap-1 border-b border-border">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="px-3 py-1.5 text-xs font-medium transition-colors"
        :class="activeTab === tab.key
          ? 'border-b-2 border-[--color-primary] text-[--color-primary]'
          : 'text-muted hover:text-text'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="ml-1 rounded-full bg-surface px-1.5 py-0.5 text-[10px] tabular-nums">
          {{ tabCount(tab.key) }}
        </span>
      </button>
    </div>

    <!-- Rows -->
    <div v-if="localRows.length" class="space-y-3">
      <div
        v-for="row in localRows"
        :key="row.id"
        class="rounded-lg border border-border bg-surface p-3 text-xs"
        :class="{ 'opacity-50': row.status === 'archived' }"
      >
        <!-- Row header -->
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <!-- Subject -->
            <span class="font-medium" :class="SUBJECT_COLORS[row.subject] || 'text-text'">
              {{ SUBJECT_LABELS[row.subject] || row.subject }}
            </span>
            <!-- Status badge -->
            <span
              class="rounded-full border px-2 py-0.5 text-[10px] font-medium"
              :class="statusConfig(row.status).badge"
            >
              <span class="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle" :class="statusConfig(row.status).dot" />
              {{ statusConfig(row.status).label }}
            </span>
            <!-- Ticket number -->
            <span v-if="row.ticket_number && editingTicket !== row.id" class="font-mono text-[10px] text-muted">
              #{{ row.ticket_number }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-muted">
            <span v-if="!row.is_anonymous && row.email">{{ row.email }}</span>
            <span v-else class="italic">anonymous</span>
            <span>{{ new Date(row.created_at).toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- Message -->
        <p class="mb-3 text-muted" style="white-space: pre-wrap">{{ row.message }}</p>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2 border-t border-border pt-2">

          <!-- Status actions -->
          <template v-if="row.status === 'new'">
            <button
              class="ns-btn ns-btn-ghost py-0.5 text-[11px]"
              :disabled="saving === row.id"
              @click="setStatus(row, 'in_progress')"
            >
              <span class="material-symbols-rounded text-[13px]">play_arrow</span>
              Start
            </button>
            <button
              class="ns-btn ns-btn-ghost py-0.5 text-[11px] text-muted"
              :disabled="saving === row.id"
              @click="setStatus(row, 'archived')"
            >
              <span class="material-symbols-rounded text-[13px]">archive</span>
              Archive
            </button>
          </template>

          <template v-else-if="row.status === 'in_progress'">
            <button
              class="ns-btn ns-btn-ghost py-0.5 text-[11px] text-muted"
              :disabled="saving === row.id"
              @click="setStatus(row, 'archived')"
            >
              <span class="material-symbols-rounded text-[13px]">archive</span>
              Archive
            </button>
          </template>

          <template v-else-if="row.status === 'archived'">
            <button
              class="ns-btn ns-btn-ghost py-0.5 text-[11px]"
              :disabled="saving === row.id"
              @click="setStatus(row, 'new')"
            >
              <span class="material-symbols-rounded text-[13px]">unarchive</span>
              Restore
            </button>
          </template>

          <!-- Ticket number (only for in_progress) -->
          <template v-if="row.status === 'in_progress'">
            <div v-if="editingTicket === row.id" class="flex items-center gap-1">
              <input
                v-model="ticketInput"
                class="ns-input h-6 w-28 px-2 text-[11px]"
                placeholder="Ticket #"
                @keydown.enter="saveTicket(row)"
                @keydown.esc="cancelEditTicket"
              />
              <button class="ns-btn ns-btn-primary py-0.5 text-[11px]" :disabled="saving === row.id" @click="saveTicket(row)">Save</button>
              <button class="ns-btn ns-btn-ghost py-0.5 text-[11px]" @click="cancelEditTicket">Cancel</button>
            </div>
            <button
              v-else
              class="ns-btn ns-btn-ghost py-0.5 text-[11px]"
              @click="startEditTicket(row)"
            >
              <span class="material-symbols-rounded text-[13px]">tag</span>
              {{ row.ticket_number ? `#${row.ticket_number}` : 'Add ticket #' }}
            </button>
          </template>

        </div>
      </div>
    </div>

    <p v-else class="text-xs text-muted">No feedback in this category.</p>
  </div>
</template>
