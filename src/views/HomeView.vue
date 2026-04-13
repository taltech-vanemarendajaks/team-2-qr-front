<template>
  <section class="home-view">
    <div class="home-view__topbar fade-in fade-in--1">
      <LoginCreateAccountMenu />
    </div>

    <div class="home-view__inner">
      <div class="home-view__content">
        <div class="home-view__heading-group fade-in fade-in--2">
          <h1 class="home-view__welcome">Welcome to</h1>
          <div class="home-view__logo-wrap">
            <img
                class="home-view__logo"
                src="@/assets/images/logo.webp"
                alt="Tagly logo"
            >
          </div>
        </div>

        <p class="home-view__description fade-in fade-in--3">
          Keep track of your belongings — all details in one place
        </p>

        <ul class="home-view__feature-list fade-in fade-in--4" aria-label="Tagly features">
          <li class="home-view__feature-item">
            <font-awesome-icon icon="fa-solid fa-check" class="home-view__feature-icon" />
            <span class="home-view__feature-text">Save receipts</span>
          </li>

          <li class="home-view__feature-item">
            <font-awesome-icon icon="fa-solid fa-check" class="home-view__feature-icon" />
            <span class="home-view__feature-text">Track warranty</span>
          </li>

          <li class="home-view__feature-item">
            <font-awesome-icon icon="fa-solid fa-check" class="home-view__feature-icon" />
            <span class="home-view__feature-text">Access by QR code</span>
          </li>
        </ul>
      </div>

      <FeatureShowcasePanel class="home-view__showcase fade-in fade-in--5" />
    </div>
  </section>
</template>

<style scoped src="@/assets/css/views/home-view.css"></style>

<script>
import LoginCreateAccountMenu from "@/components/LoginCreateAccountMenu.vue";
import FeatureShowcasePanel from "@/components/FeatureShowcasePanel.vue";

export default {
  name: 'HomeView',
  components: { LoginCreateAccountMenu, FeatureShowcasePanel }
}
</script>