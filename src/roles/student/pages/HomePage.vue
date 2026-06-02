<template>
  <div class="student-home">
    <h1>Новости</h1>
  </div>
</template>

<style scoped>
.student-home {
  min-height: 100%;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  color: #111827;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.student-home h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 700;
}

@media (max-width: 700px) {
  .student-home {
    padding: 18px;
    border-radius: 18px;
  }

  .student-home h1 {
    font-size: 24px;
  }
}
</style>
