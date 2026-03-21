<script setup lang="ts">
import type { AdminFeedback } from '../services/admin.service'

defineProps<{ feedback: AdminFeedback }>()

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
</script>

<template>
  <div class="rounded-lg border border-border bg-surface-2 p-4">
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm font-semibold">User feedback</p>
      <span class="text-xs text-muted">{{ feedback.total }} total · {{ feedback.anonymousCount }} anonymous</span>
    </div>

    <!-- By subject -->
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

    <!-- Rows -->
    <div v-if="feedback.rows.length" class="space-y-3">
      <div
        v-for="row in feedback.rows"
        :key="row.id"
        class="rounded-lg border border-border bg-surface p-3 text-xs"
      >
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span
            class="font-medium capitalize"
            :class="SUBJECT_COLORS[row.subject] || 'text-text'"
          >
            {{ SUBJECT_LABELS[row.subject] || row.subject }}
          </span>
          <div class="flex items-center gap-2 text-muted">
            <span v-if="!row.is_anonymous && row.email">{{ row.email }}</span>
            <span v-else class="italic">anonymous</span>
            <span>{{ new Date(row.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
        <p class="text-muted" style="white-space: pre-wrap">{{ row.message }}</p>
      </div>
    </div>
    <p v-else class="text-xs text-muted">No feedback received yet.</p>
  </div>
</template>
