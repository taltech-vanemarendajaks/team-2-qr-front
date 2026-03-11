<template>
  <div class="card p-3">
    <h5 class="mb-2">Having trouble logging in?</h5>
    <p class="mb-3">Verify ownership of one of your labelled items to contact the admin.</p>

    <!-- SUCCESS STATE -->
    <div v-if="requestCompleted" class="text-success">
      <h6>Message sent</h6>
      <p class="mb-0">
        Your request has been sent successfully.
        The admin will contact you shortly if needed.
      </p>
    </div>

    <!-- NORMAL FLOW -->
    <div v-else>
      <!-- STEP 1: VERIFY -->
      <div v-if="!supportToken">
        <div class="mb-2">
          <label class="form-label">Email</label>
          <input
              v-model="emailInput"
              type="email"
              class="form-control"
              placeholder="your@email.com"
          />
        </div>

        <div class="mb-2">
          <label class="form-label">QR token</label>
          <input
              v-model="qrToken"
              type="text"
              class="form-control"
              placeholder="Token from QR URL"
          />
        </div>

        <div v-if="errorMessage" class="text-danger mb-2">{{ errorMessage }}</div>

        <button class="btn btn-custom" type="button" @click="verify">
          Verify
        </button>
      </div>

      <!-- STEP 2: SEND MESSAGE -->
      <div v-else>
        <div class="mb-2">
          <label class="form-label">Message to admin</label>
          <textarea
              v-model="message"
              class="form-control"
              rows="4"
              maxlength="1000"
          ></textarea>
        </div>

        <div v-if="errorMessage" class="text-danger mb-2">{{ errorMessage }}</div>

        <button class="btn btn-custom" type="button" @click="send">
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SupportService from "@/services/SupportService";

export default {
  name: "SupportUnlockAndRequest",
  props: {
    email: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // verify step
      emailInput: this.email || "",
      qrToken: "",
      supportToken: "",

      // send step
      message: "",

      // ui state
      errorMessage: "",
      requestCompleted: false,
    };
  },
  methods: {
    verify() {
      this.errorMessage = "";
      this.requestCompleted = false;

      const emailInput = (this.emailInput || "").trim();
      const qrToken = (this.qrToken || "").trim();

      if (!this.email || !emailInput || !qrToken) {
        this.errorMessage = "Please fill in email and QR token.";
        return;
      }

      SupportService.verifyQr(this.email, emailInput, qrToken)
          .then((res) => {
            this.supportToken = res?.data?.supportToken || "";
            if (!this.supportToken) this.errorMessage = "Verification failed.";
          })
          .catch((err) => {
            const status = err?.response?.status;
            if (status === 403) {
              this.errorMessage = "Verification failed. Please check your details.";
              return;
            }
            if (status === 400) {
              this.errorMessage =
                  err?.response?.data?.message || "Please check your input.";
              return;
            }
            this.errorMessage = "Something went wrong. Please try again.";
          });
    },

    send() {
      this.errorMessage = "";

      const token = (this.supportToken || "").trim();
      const msg = (this.message || "").trim();

      if (!token) {
        this.errorMessage = "Session expired. Please verify again.";
        this.supportToken = "";
        return;
      }
      if (!msg) {
        this.errorMessage = "Message is required.";
        return;
      }

      SupportService.createSupportRequest(token, msg)
          .then(() => {
            // show success state
            this.requestCompleted = true;

            // cleanup (optional)
            this.supportToken = "";
            this.message = "";
            this.emailInput = "";
            this.qrToken = "";
          })
          .catch((err) => {
            const status = err?.response?.status;
            if (status === 403) {
              this.errorMessage = "Session expired. Please verify again.";
              this.supportToken = "";
              return;
            }
            if (status === 400) {
              this.errorMessage =
                  err?.response?.data?.message || "Please check your input.";
              return;
            }
            this.errorMessage = "Something went wrong. Please try again.";
          });
    },
  },
};
</script>

<style scoped>
.card {
  margin-bottom: 60px;
}
</style>
