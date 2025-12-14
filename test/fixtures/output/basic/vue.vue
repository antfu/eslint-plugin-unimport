<script setup lang="ts">
import { useRoute } from 'vue-router'
import { reactive, shallowRef, toValue, computed, ref     } from 'vue'

const a = ref(1)
const b = computed(() => a.value + 1)
</script>

<template>
  <div v-if="toValue(a)" @click="(e) => console.log(e, shallowRef(2))">
    {{ a }} + {{ b }} = {{ a + b }}
    {{ reactive(useRoute()).path }}
  </div>
</template>
