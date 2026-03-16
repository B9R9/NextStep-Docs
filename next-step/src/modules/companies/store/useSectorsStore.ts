import { defineStore } from 'pinia'
import { INDUSTRY_VALUES } from '@/shared/references/catalog'

const globalSectors = [...INDUSTRY_VALUES]

export const useSectorsStore = defineStore('sectors', {
  state: () => ({
    global: globalSectors,
  }),
})
