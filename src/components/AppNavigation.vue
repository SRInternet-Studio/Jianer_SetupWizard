<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  value: String,
  options: Array,
  collapsed: Boolean
})

const emit = defineEmits(['update:value', 'click'])

const navRef = ref(null)
const itemRefs = ref({})

// Indicator state
const indicatorStyle = ref({
  top: '10px',
  height: '24px',
  opacity: 0
})

const setItemRef = (el, key) => {
  if (el) {
    itemRefs.value[key] = el
  }
}

const updateIndicator = async () => {
  await nextTick()
  const activeKey = props.value
  const activeEl = itemRefs.value[activeKey]

  if (activeEl && navRef.value) {
    const offsetTop = activeEl.offsetTop
    const itemHeight = activeEl.offsetHeight
    
    // Match the style.css logic: top 10px, bottom 10px inside the item
    // Item is relative. Floater is absolute in Nav.
    // Floater Top = Item Top + 10px
    // Floater Height = Item Height - 20px
    const indicatorHeight = itemHeight - 20
    const top = offsetTop + 10

    indicatorStyle.value = {
      top: `${top}px`,
      height: `${indicatorHeight}px`,
      opacity: 1
    }
  } else {
    indicatorStyle.value = {
      ...indicatorStyle.value,
      opacity: 0
    }
  }
}

watch(() => props.value, updateIndicator, { immediate: true })
watch(() => props.collapsed, updateIndicator)
watch(() => props.options, updateIndicator, { deep: true }) // In case options change

onMounted(() => {
  updateIndicator()
  // Add resize observer to handle layout changes
  const resizeObserver = new ResizeObserver(() => {
    updateIndicator()
  })
  if (navRef.value) resizeObserver.observe(navRef.value)
})

const handleClick = (key) => {
  emit('update:value', key)
  emit('click', key)
}
</script>

<template>
  <nav class="custom-nav" ref="navRef">
    <!-- Floating Indicator -->
    <div class="active-indicator-floater" :style="indicatorStyle" />

    <div
      v-for="item in options"
      :key="item.key"
      :ref="el => setItemRef(el, item.key)"
      class="custom-nav-item"
      :class="{ 'active': value === item.key }"
      @click="handleClick(item.key)"
      :title="collapsed ? item.label : undefined"
    >
      <div class="custom-nav-icon">
        <component :is="item.icon" />
      </div>
      <Transition name="fade" mode="out-in">
        <span class="custom-nav-label" v-if="!collapsed">
          {{ item.label }}
        </span>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.custom-nav {
  position: relative;
  /* Ensure we inherit styles from global CSS */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.active-indicator-floater {
  position: absolute;
  left: 4px;
  width: 3px;
  border-radius: 99px;
  background-color: var(--accent);
  box-shadow: 0 0 4px rgba(var(--accent-rgb), 0.4);
  /* The Magic: Smooth Transition */
  transition: top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.2s ease;
  pointer-events: none;
  z-index: 10;
}

/* Ensure global styles for items apply correctly */
/* We don't need to redefine custom-nav-item here as it's in style.css */
</style>
