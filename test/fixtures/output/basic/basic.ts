import { computed, ref, shallowRef } from 'vue'

export function useMyCustomComposable() {
  const x = ref(1)
  const y = shallowRef(1)

  const z = computed(() => (x.value + y.value) * MULTIPLIER)

  return z
}
