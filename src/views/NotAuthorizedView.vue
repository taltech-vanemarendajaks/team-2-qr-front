<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm border-0 text-center p-4">
          <div class="card-body">
            <h1 class="display-6 mb-3">403</h1>
            <h2 class="h4 mb-3">Access denied</h2>
            <p class="text-muted mb-4">
              You do not have permission to view this page.
            </p>

            <div class="d-flex justify-content-center gap-2 flex-wrap">
              <router-link to="/" class="btn btn-primary">
                Go to Home
              </router-link>

              <button class="btn btn-outline-secondary" @click="goBack">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotAuthorizedView",
  methods: {
    goBack() {
      this.$router.back();
    }
  }
};
</script>