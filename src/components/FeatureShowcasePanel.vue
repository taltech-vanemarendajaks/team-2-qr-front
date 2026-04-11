<template>
  <section class="story-card" :class="slides[current].layoutClass"
           aria-label="Animated product story preview">
    <div
        v-for="(slide, index) in slides"
        :key="slide.tag"
        class="scene"
        :class="{ active: current === index }"
    >
      <div class="scene-inner" :class="slide.layoutClass">
        <div class="scene-note">{{ slide.tag }}</div>

        <img
            class="product-img"
            :class="slide.imageClass"
            :src="slide.image"
            :alt="slide.alt"
        />

        <template v-if="slide.type === 'questions'">
          <div class="bubble q1">Where’s the receipt?</div>
          <div class="bubble q2">When did I buy it?</div>
          <div class="bubble q4">Is warranty still valid?</div>
          <div class="bubble q5">What’s the model name?</div>
        </template>

        <template v-if="slide.type === 'receipt'">
          <div class="feature-card fc-3">
            <h3>Easy start</h3>
            <p>Add the item while the receipt is still in your hand.</p>
          </div>
        </template>

        <template v-if="slide.type === 'item'">
          <div class="item-glow"></div>
          <div class="feature-card fc-item">
            <h3>Everything stays together</h3>
            <p>Date, receipt, model - all linked to the same item.</p>
          </div>
        </template>

        <template v-if="slide.type === 'success'">
          <div class="final-badge">Scan QR → open item</div>

          <div class="feature-card fc-bottom">
            <h3>Simple win</h3>
            <p>Tagly saves time, stress and repeat searching.</p>
          </div>
        </template>
      </div>
    </div>

    <div class="story-nav" aria-label="Story navigation">
      <button class="nav-btn nav-prev" type="button" aria-label="Previous scene" @click="prev">
        &#8592;
      </button>
      <button class="nav-btn nav-next" type="button" aria-label="Next scene" @click="next">
        &#8594;
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "FeatureShowcasePanel",

  data() {
    return {
      current: 0,
      slides: [
        {
          tag: "SOUNDS FAMILIAR?",
          image: require("@/assets/images/wm.webp"),
          alt: "Washing machine illustration with question mark",
          type: "questions",
          layoutClass: "",
          imageClass: "img-wm"
        },
        {
          tag: "ADD RECEIPT TO TAGLY",
          image: require("@/assets/images/rcpt.webp"),
          alt: "Adding item from receipt",
          type: "receipt",
          layoutClass: "receipt-layout",
          imageClass: "img-rcpt"
        },
        {
          tag: "ITEM CREATED WITH QR CODE",
          image: require("@/assets/images/item-qr.webp"),
          alt: "Saved item view",
          type: "item",
          layoutClass: "item-layout",
          imageClass: "img-item"
        },
        {
          tag: "ACCESS ANYTIME",
          image: require("@/assets/images/last.webp"),
          alt: "Washing machine with QR code and thumbs up",
          type: "success",
          layoutClass: "thumbs-layout",
          imageClass: "img-last"
        }
      ]
    }
  },

  methods: {
    next() {
      this.current = (this.current + 1) % this.slides.length
    },
    prev() {
      this.current = (this.current - 1 + this.slides.length) % this.slides.length
    }
  },

  mounted() {
    this.interval = setInterval(() => {
      this.next()
    }, 4500)
  },

  beforeUnmount() {
    clearInterval(this.interval)
  }
}
</script>

<style scoped src="@/assets/css/components/feature-panel.css"></style>