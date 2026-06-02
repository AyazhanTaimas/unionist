<template>
  <div class="manager-home">
    <h1>Manager</h1>
    <p>Раздел менеджера.</p>
  </div>
</template>

<style scoped>
.manager-home {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  color: #111827;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.manager-home h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.manager-home p {
  margin: 0;
  color: #4b5563;
}

@media (max-width: 700px) {
  .manager-home {
    padding: 18px;
    border-radius: 18px;
  }

  .manager-home h1 {
    font-size: 24px;
  }
}
</style>
