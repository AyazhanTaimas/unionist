<script setup lang="ts">
import { ref } from 'vue'
import CreatePenaltyModal from './CreatePenaltyModal.vue'

const showModal = ref(false)

const penalties = [
  {
    id: 1,
    name: 'Jordan Davis',
    sub: 'Room 402-B',
    type: 'student',
    title: 'Noise Complaint (After Hours)',
    date: 'Oct 24, 2023',
    status: 'active',
  },
  {
    id: 2,
    name: 'Common Kitchen A',
    sub: 'Level 2 South',
    type: 'room',
    title: 'Unsanitary Usage / Maintenance',
    date: 'Oct 22, 2023',
    status: 'resolved',
  },
  {
    id: 3,
    name: 'Sarah Kim',
    sub: 'Room 112-A',
    type: 'student',
    title: 'Guest Policy Violation',
    date: 'Oct 20, 2023',
    status: 'active',
  },
]
</script>

<template>
  <div class="penalties">
    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>Penalties Management</h1>
        <p>Track and manage dormitory violations and maintenance fees.</p>
        <button class="add-btn" @click="showModal = true">
        + Add
      </button>
      </div>
    
    </div>

    <!-- STATS -->
    <div class="stats">
      <div class="card">
        <span>ACTIVE PENALTIES</span>
        <h2 class="blue">12</h2>
      </div>
      <div class="card">
        <span>RESOLVED (MONTHLY)</span>
        <h2>48</h2>
      </div>
      <div class="card">
        <span>PENDING APPEALS</span>
        <h2 class="orange">3</h2>
      </div>
      <div class="card">
        <span>TOTAL COLLECTED</span>
        <h2>$1,420</h2>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table">
      <div class="thead">
        <span>Student / Room</span>
        <span>Type</span>
        <span>Title</span>
        <span>Date Issued</span>
        <span>Status</span>
        <span></span>
      </div>

      <div
        v-for="item in penalties"
        :key="item.id"
        class="row"
      >
        <!-- USER -->
        <div class="user">
          <div class="avatar">
            {{ item.name.slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <div class="name">{{ item.name }}</div>
            <div class="sub">{{ item.sub }}</div>
          </div>
        </div>

        <!-- TYPE -->
        <div>
          <span
            class="badge"
            :class="item.type"
          >
            {{ item.type }}
          </span>
        </div>

        <!-- TITLE -->
        <div>{{ item.title }}</div>

        <!-- DATE -->
        <div>{{ item.date }}</div>

        <!-- STATUS -->
        <div>
          <span
            class="status"
            :class="item.status"
          >
            ● {{ item.status }}
          </span>
        </div>

        <!-- ACTION -->
        <div class="actions">⋮</div>
      </div>
    </div>
  </div>

  <CreatePenaltyModal
  v-if="showModal"
  @close="showModal = false"
/>
</template>

<style scoped lang="scss">
.penalties {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* HEADER */
.header h1 {
  font-size: 28px;
  font-weight: 700;
}

.header p {
  color: #6b7280;
}

.add-btn {
  background: #4f46e5;
  color: white;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}

/* STATS */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;

  span {
    font-size: 12px;
    color: #6b7280;
  }

  h2 {
    margin-top: 8px;
    font-size: 28px;
    font-weight: 700;
  }

  .blue {
    color: #4f46e5;
  }

  .orange {
    color: #d97706;
  }
}

/* TABLE */
.table {
  background: white;
  border-radius: 20px;
  padding: 16px;
}

.thead {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr 1fr 40px;
  padding: 12px;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
}

.row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr 1fr 40px;
  padding: 16px 12px;
  align-items: center;
  border-top: 1px solid #f3f4f6;
}

/* USER */
.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4f46e5;
}

.name {
  font-weight: 600;
}

.sub {
  font-size: 12px;
  color: #6b7280;
}

/* BADGE */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;

  &.student {
    background: #eef2ff;
    color: #4f46e5;
  }

  &.room {
    background: #fef3c7;
    color: #92400e;
  }
}

/* STATUS */
.status {
  font-size: 14px;

  &.active {
    color: #dc2626;
  }

  &.resolved {
    color: #4f46e5;
  }
}

.actions {
  cursor: pointer;
  font-size: 20px;
}
</style>