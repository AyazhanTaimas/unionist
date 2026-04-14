<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from './LoginApi'
import {
  persistDormAccessUser,
  resetDormAccessState,
} from '@/roles/student/shared/lib/dormAccess'
import { setAuthSession } from '@/app/session/authStorage'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  error.value = null
  loading.value = true

  try {
    const response = await login({
      email: email.value,
      password: password.value,
    })

    const user = response.data.user
    const role = user.role ?? 'student'

    resetDormAccessState()
    setAuthSession(response.data.token.access_token, role)
    persistDormAccessUser({
      ...user,
      role,
    })

    if (role === 'manager') {
      router.push('/manager')
    } else if (role === 'admin') {
      router.push('/manager')
    } else if (role === 'dorm-admin') {
      router.push('/dorm-admin/news')
    } else if (role === 'employee') {
      router.push('/employee/news')
    } else {
      router.push('/news')
    }
  } catch (e: any) {
    error.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <img src="@/assets/Group 26.svg" class="logo" />

    <div class="login-card">
      <h2>E-mail</h2>
      <input
        v-model="email"
        type="email"
        placeholder="Enter your email"
      />

      <h2>Password</h2>
      <div class="password-wrapper">
        <input
          v-model="password"
          type="password"
          placeholder="Enter your password"
        />
      </div>

      <div class="forgot">Forgot your password?</div>

      <button
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 32px 20px;
  background: #dfe7e7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.logo {
  width: min(260px, 62vw);
}

.login-card {
  width: min(420px, 100%);
  background: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h2 {
  font-size: 14px;
  font-weight: 600;
  color: #1f1f1f;
}

input {
  height: 48px;
  border-radius: 12px;
  border: none;
  padding: 0 16px;
  background: #f3f4f6;
  font-size: 14px;
  width: 100%;
}

button {
  margin-top: 20px;
  height: 50px;
  border-radius: 14px;
  border: none;
  background: #1e0a78;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
}

.forgot {
  font-size: 13px;
  text-align: center;
  color: #4f46e5;
  cursor: pointer;
}

.error {
  color: red;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 700px) {
  .login-page {
    gap: 28px;
    padding: 24px 16px;
  }

  .login-card {
    padding: 28px 20px;
    border-radius: 18px;
  }

  .logo {
    width: min(220px, 58vw);
  }
}
</style>
