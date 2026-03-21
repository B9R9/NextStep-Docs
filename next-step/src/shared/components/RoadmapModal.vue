<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const phases = [
  {
    version: '0.1.0',
    label: 'MVP — Core tracking',
    status: 'done' as const,
    description: 'The foundation: full job application tracking with 11 statuses, job offers, company management, calendar, notifications, and secure authentication.',
    highlights: [
      'Application funnel with 11 statuses',
      'Job offers & company management',
      'Calendar with event sync',
      'Notifications & reminders',
      'Secure auth (JWT + httpOnly cookie)',
    ],
  },
  {
    version: '0.2.0',
    label: 'Core improvements',
    status: 'in_progress' as const,
    description: 'Polishing and solidifying the experience: notification preferences, email confirmation, user statistics, and mobile support.',
    highlights: [
      'Email confirmation at registration',
      'Notification timing preferences',
      'Personal stats on the home page',
      'Mobile-friendly experience',
    ],
  },
  {
    version: '0.3.0',
    label: 'AI Integration',
    status: 'planned' as const,
    description: 'AI-assisted CV and cover letter generation. The AI guides you to express your own voice — no generic output.',
    highlights: [
      'CV generation from your own narrative',
      'Cover letter tailored per job offer',
      'PDF export',
      'AI coaching chatbot',
    ],
  },
  {
    version: '0.4.0',
    label: 'Monetization',
    status: 'planned' as const,
    description: 'A simple subscription model unlocking extended storage and premium features.',
    highlights: [],
  },
  {
    version: '0.5.0+',
    label: 'Matching & Community',
    status: 'planned' as const,
    description: 'Compatibility scoring between your profile and job offers, community resources, and recruiter access.',
    highlights: [
      'Skill profile (soft & hard skills)',
      'Job compatibility score',
      'Blog & community resources',
      'Recruiter interface',
    ],
  },
]

const STATUS = {
  done: { label: 'Done', icon: 'check_circle', color: 'text-[--color-success]', line: 'bg-[--color-success]' },
  in_progress: { label: 'In progress', icon: 'timelapse', color: 'text-[--color-primary]', line: 'bg-[--color-primary]' },
  planned: { label: 'Planned', icon: 'radio_button_unchecked', color: 'text-muted', line: 'bg-border' },
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

      <!-- Panel -->
      <div class="relative z-10 flex w-full max-w-lg flex-col rounded-xl border border-border bg-surface shadow-xl" style="max-height: 85vh">
        <!-- Header -->
        <div class="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-[20px] text-primary">rocket_launch</span>
            <p class="text-sm font-semibold">Product Roadmap</p>
          </div>
          <button class="text-muted hover:text-text" @click="emit('close')">
            <span class="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto px-5 py-5">
          <p class="mb-5 text-xs text-muted">Here's what we've built and what's coming next. Your feedback shapes these priorities.</p>

          <div class="space-y-0">
            <div v-for="(phase, i) in phases" :key="phase.version" class="flex gap-4">
              <!-- Timeline spine -->
              <div class="flex flex-col items-center">
                <span class="material-symbols-rounded text-[22px] leading-none" :class="STATUS[phase.status].color">
                  {{ STATUS[phase.status].icon }}
                </span>
                <div
                  v-if="i < phases.length - 1"
                  class="mt-1 w-px flex-1"
                  :class="STATUS[phase.status].line"
                  style="min-height: 32px"
                />
              </div>

              <!-- Content -->
              <div class="min-w-0 pb-6">
                <div class="mb-1 flex flex-wrap items-center gap-2">
                  <span class="font-mono text-xs text-muted">{{ phase.version }}</span>
                  <span class="text-sm font-semibold">{{ phase.label }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    :class="{
                      'bg-[--color-success-soft] text-[--color-success]': phase.status === 'done',
                      'bg-[--color-primary-soft] text-[--color-primary]': phase.status === 'in_progress',
                      'border border-border bg-surface text-muted': phase.status === 'planned',
                    }"
                  >{{ STATUS[phase.status].label }}</span>
                </div>
                <p class="mb-2 text-xs text-muted">{{ phase.description }}</p>
                <ul v-if="phase.highlights.length" class="space-y-0.5">
                  <li v-for="h in phase.highlights" :key="h" class="flex items-center gap-1.5 text-xs text-muted">
                    <span
                      class="material-symbols-rounded text-[13px]"
                      :class="phase.status === 'done' ? 'text-[--color-success]' : 'text-border'"
                    >{{ phase.status === 'done' ? 'check' : 'arrow_right' }}</span>
                    {{ h }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
