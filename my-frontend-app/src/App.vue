<script setup>
import { ref } from 'vue'

// Basic reactive state
const tasks = ref(0)
const userName = 'Hamza'
</script>

<template>
  <main style="font-family: sans-serif; padding: 32px; max-width: 420px; color: #222;">
    <h1>Day 6 Dashboard (Vue)</h1>

    <!-- Rendering & Props-like interpolation -->
    <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #111;">Welcome back, {{ userName }}!</h2>
      <p style="margin: 8px 0 0; color: #555;">
        You currently have <strong>{{ tasks }}</strong> active tasks.
      </p>
    </div>

    <!-- State modification events -->
    <div style="display: flex; gap: 8px;">
      <button 
        @click="tasks++" 
        style="padding: 8px 16px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;"
      >
        Add Task
      </button>

      <button 
        @click="tasks = 0" 
        style="padding: 8px 16px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;"
      >
        Reset
      </button>
    </div>
  </main>
</template>