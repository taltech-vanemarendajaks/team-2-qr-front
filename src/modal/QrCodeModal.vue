<template>
  <Modal
      :modal-is-open="qrCodeModalIsOpen"
      variant="preview"
      @event-close-modal="$emit('event-close-modal')"
  >
    <template #body>
      <div ref="qrContainer" class="qr-modal__content">
        <QrcodeSvg
            v-if="qrCode"
            :value="qrCode"
            :size="computedSize"
            :level="level"
        />
      </div>
    </template>

    <template #buttons>
      <button
          type="button"
          class="modal-button"
          @click="printQrImage"
      >
        Print
      </button>

      <button
          type="button"
          class="modal-button"
          @click="downloadQrImage"
      >
        Save
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/modal/Modal.vue";
import { QrcodeSvg } from "qrcode.vue";

export default {
  name: "QrCodeModal",
  components: {
    Modal,
    QrcodeSvg
  },
  props: {
    qrCodeModalIsOpen: Boolean,
    qrCode: String,
    level: {
      type: String,
      default: "H"
    }
  },
  emits: ["event-close-modal"],
  data() {
    return {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  },
  computed: {
    computedSize() {
      const width = this.screenWidth;
      const height = this.screenHeight;

      if (width < 480) {
        return 190;
      }

      if (width < 860 && width > height) {
        return 160;
      }

      if (width < 860) {
        return 260;
      }

      return 320;
    }
  },
  mounted() {
    window.addEventListener("resize", this.updateScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenSize);
  },
  methods: {
    updateScreenSize() {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    },

    printQrImage() {
      const svg = this.$refs.qrContainer?.querySelector("svg");
      if (!svg) return;

      const win = window.open("", "_blank");
      if (!win) return;

      win.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                background: white;
              }

              body {
                min-height: 100vh;
                display: grid;
                place-items: center;
                padding: 2rem;
              }

              svg {
                width: min(80vw, 24rem);
                height: auto;
                display: block;
              }
            </style>
          </head>
          <body>
            ${svg.outerHTML}
            <script>
              window.onload = function () {
                window.print();
              };
            </scr` + `ipt>
          </body>
        </html>
      `);
      win.document.close();
    },

    downloadQrImage() {
      const svg = this.$refs.qrContainer?.querySelector("svg");
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8"
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 1200;

        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);

        const pngUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "qr-code.png";
        link.click();

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  }
};
</script>