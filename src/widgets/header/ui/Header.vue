<script setup lang="ts">
import BellIcon from './BellIcon.vue'
import UserIcon from './UserIcon.vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/instance'
import { resetDormAccessState } from '@/shared/lib/dormAccess'

const router = useRouter();

function goProfile() {
  router.push({ name: 'profile' });
}

async function logout() {
  try {
    await api.post('/logout')
  } finally {
    localStorage.removeItem('token')
    resetDormAccessState()
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <header class="header">
    <!-- ЛЕВАЯ ЧАСТЬ (пусто или title позже) -->
    <div />

    <!-- ПРАВО -->
    <div class="actions">
      <button class="icon-btn">
        <BellIcon />
      </button>

      <button class="icon-btn"  @click="goProfile">
        <UserIcon />
      </button>

      <button class="logout-btn" @click="logout">
        <img src="@/assets/logout.svg"/>
      </button>
    </div>
  </header>
</template>


<style scoped lang="scss">
.header {
  height: 64px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: transparent;
}

.actions {
  display: flex;
  gap: 16px;
}

.icon-btn {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;

  color: #4f46e5;
  transition: background 0.2s;

  &:hover {
    background: #eef2ff;
  }

  svg {
    width: 22px;
    height: 22px;
  }
}

.logout-btn {
  height: 20px;
  padding: 4px;
  border-radius: 10px;
  border: none;
  background: #eef2ff;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  color:#4f46e5
}

.logout-btn img {
  width: 22px;
  height: 22px;
  color:#4f46e5
}

.logout-btn:hover {
  color: #e0e7ff;
}

</style>
