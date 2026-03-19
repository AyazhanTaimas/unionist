<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close'])

const type = ref<'student' | 'room'>('student')
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header">
        <div>
          <h2>Create Penalty</h2>
          <p>Issue a new violation record for a student or room.</p>
        </div>
        <span class="close" @click="emit('close')">✕</span>
      </div>

      <!-- TYPE -->
      <div class="type-switch">
        <div
          class="type-card"
          :class="{ active: type === 'student' }"
          @click="type = 'student'"
        >
          <span>👤</span>
          <div>
            <b>Student</b>
            <p>Assign to a specific resident</p>
          </div>
        </div>

        <div
          class="type-card"
          :class="{ active: type === 'room' }"
          @click="type = 'room'"
        >
          <span>🛏</span>
          <div>
            <b>Room</b>
            <p>Assign to an entire dormitory unit</p>
          </div>
        </div>
      </div>

      <!-- FORM -->
      <div class="form">
        <label>Target Search</label>
        <input placeholder="Search name, student ID, or room number..." />

        <label>Penalty Title</label>
        <input placeholder="e.g. Noise Complaint, Unauthorized Guest" />

        <label>Detailed Description</label>
        <textarea placeholder="Provide context regarding the violation..." />

        <label>Evidence Documentation</label>
        <div class="upload">
          <span>⬆ Upload files</span>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="actions">
        <button class="cancel" @click="emit('close')">Cancel</button>
        <button class="submit">Create Penalty</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 520px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
}

/* HEADER */
.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;

  display: flex;
  justify-content: space-between;

  h2 {
    font-size: 18px;
    font-weight: 600;
  }

  p {
    font-size: 13px;
    color: #6b7280;
  }
}

.close {
  cursor: pointer;
}

/* TYPE */
.type-switch {
  display: flex;
  gap: 12px;
  padding: 20px;
}

.type-card {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;

  display: flex;
  gap: 10px;
  align-items: center;

  p {
    font-size: 12px;
    color: #6b7280;
  }

  &.active {
    border: 2px solid #4f46e5;
    background: #eef2ff;
  }
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 20px;

  label {
    font-size: 12px;
    color: #6b7280;
  }

  input,
  textarea {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }

  textarea {
    min-height: 80px;
  }
}

.upload {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

/* ACTIONS */
.actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;

  .cancel {
    flex: 1;
    background: #f3f4f6;
    border-radius: 10px;
    padding: 12px;
  }

  .submit {
    flex: 1;
    background: #4f46e5;
    color: white;
    border-radius: 10px;
    padding: 12px;
  }
}
</style>