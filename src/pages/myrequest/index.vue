<template>
  <section class="requests-page">
    <div class="card">
      <div class="eyebrow">MY REQUESTS</div>
      <h1>Мои запросы</h1>
      <p>
        Здесь будут отображаться ваши заявки на заселение и смену комнаты.
      </p>
      <p>
        Пока для студентов доступна подача заявок через раздел
        <strong>Проживание</strong>.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.requests-page {
  padding-top: 72px;
}

.card {
  max-width: 780px;
  background: #ffffff;
  border: 1px solid #d9dde7;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #64748b;
}

h1 {
  margin: 0 0 12px;
  font-size: 40px;
  line-height: 1.1;
  color: #111827;
}

p {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.6;
  color: #475569;
}

p:last-child {
  margin-bottom: 0;
}

strong {
  color: #111827;
}

@media (max-width: 700px) {
  .requests-page {
    padding-top: 56px;
  }

  .card {
    padding: 24px;
    border-radius: 24px;
  }

  h1 {
    font-size: 30px;
  }

  p {
    font-size: 16px;
  }
}
</style>
