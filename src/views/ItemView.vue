<template>
  <div class="item-page"
       :class="{
      'item-page--view': isView,
      'item-page--edit': isEdit,
      'item-page--add': isAdd
    }"
  >
    <section class="item-shell">
      <div class="item-alerts" v-if="errorMessage || successMessage">
        <div v-if="errorMessage" class="item-alert item-alert--error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="item-alert item-alert--success">
          {{ successMessage }}
        </div>
      </div>

      <div v-if="loading" class="item-loading-state">
        <div class="item-spinner" aria-hidden="true"></div>
        <p class="item-loading-text">Loading item...</p>
      </div>

      <div v-else-if="errorResponse" class="item-alert item-alert--error">
        {{ errorResponse.message || "An unknown error occurred." }}
      </div>

      <div v-else class="item-content">
        <div class="item-top">
          <div class="item-title-wrap">
            <h1 class="item-title" v-if="isAdd">Add New Item</h1>
            <h1 class="item-title" v-else-if="isEdit">Edit Item #{{ item.itemName }}</h1>
            <h1 class="item-title" v-else>View Item #{{ item.itemName }}</h1>
          </div>

          <div v-if="qrCode && !isAdd" class="item-qr-wrap">
            <QrImage :qr-code="qrCode" :size="56"/>
          </div>
        </div>

        <div class="item-body">
          <ItemDetails
              ref="itemDetails"
              :is-view="isView"
              :item="item"
              :reset-image-input="resetImageInput"
              :validation-errors="validationErrors"
              @event-item-name-updated="setItemItemName"
              @event-item-date-updated="setItemItemDate"
              @event-item-model-updated="setItemModel"
              @event-item-comment-updated="setItemComment"
              @event-new-image-selected="setItemImageData"
              @event-chosen-image-cleared="handleDeleteImage"
          />

          <div class="item-alerts item-alerts--mobile" v-if="errorMessage || successMessage">
            <div v-if="errorMessage" class="item-alert item-alert--error">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="item-alert item-alert--success">
              {{ successMessage }}
            </div>
          </div>

          <div class="item-actions">
            <button
                v-if="isView || isAdd"
                type="button"
                class="modal-button"
                @click="goBack"
            >
              Back
            </button>

            <button
                v-if="isView"
                type="button"
                class="modal-button"
                @click="enableEdit"
            >
              Edit
            </button>

            <button
                v-if="isView"
                type="button"
                class="modal-button modal-button--delete"
                @click="displayDeleteItemModal"
            >
              Delete
            </button>

            <button
                v-if="isEdit"
                type="button"
                class="modal-button"
                @click="disableEdit"
            >
              Close
            </button>

            <button
                v-if="isEdit"
                type="button"
                class="modal-button"
                @click="processUpdateItem"
            >
              Save
            </button>

            <button
                v-if="isAdd"
                type="button"
                class="modal-button"
                @click="processAddItem"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </section>

    <DeleteItemModal
        :delete-item-modal-is-open="deleteItemModalIsOpen"
        @event-close-modal="closeDeleteItemModal"
        @event-confirm-delete="deleteItem"
    />
  </div>
</template>

<script>
import ItemService from "@/services/ItemService";
import { useRoute } from "vue-router";
import ItemDetails from "@/components/ItemDetails.vue";
import NavigationService from "@/services/NavigationService";
import SessionStorageService from "@/services/SessionStorageService";
import QrCodeService from "@/services/QrCodeService";
import DeleteItemModal from "@/modal/DeleteItemModal.vue";
import QrImage from "@/components/QrImage.vue";

export default {
  name: "ItemView",
  components: { ItemDetails, DeleteItemModal, QrImage },

  data() {
    return {
      itemId: Number(useRoute().query.itemId),
      originalItem: null,
      errorMessage: "",
      successMessage: "",

      resetImageInput: false,
      isView: false,
      isAdd: false,
      isEdit: false,
      editEnteredFromList: false,
      qrCode: "",
      deleteItemModalIsOpen: false,

      item: {
        itemName: "",
        itemDate: "",
        model: "",
        comment: "",
        imageData: "",
        imageId: null,
        qrToken: ""
      },

      validationErrors: {
        itemName: false,
        itemDate: false
      },

      loading: false,
      errorResponse: null
    };
  },

  methods: {
    loadItem() {
      this.errorResponse = null;
      this.errorMessage = "";
      this.loading = true;

      ItemService.sendGetItemRequest(this.itemId)
          .then((response) => {
            this.item = response.data;

            if (this.item.itemDate) {
              this.item.itemDate = this.item.itemDate.slice(0, 10);
            }

            this.originalItem = JSON.parse(JSON.stringify(this.item));

            const itemForStorage = {
              ...this.item,
              imageData: ""
            };
            sessionStorage.setItem("item", JSON.stringify(itemForStorage));

            this.getQrCode();
          })
          .catch((error) => {
            this.errorResponse =
                error?.response?.data || { message: "Failed to load item data." };
          })
          .finally(() => {
            this.loading = false;
          });
    },

    getQrCode() {
      QrCodeService.sendGetQrCodeRequest(this.itemId)
          .then((response) => {
            this.qrCode = response.data;
          })
          .catch(() => {
            this.qrCode = "";
            if (!this.errorMessage) {
              this.errorMessage = "QR code could not be generated for this item.";
            }
          });
    },

    getTodayDateString() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    validateItemInput() {
      this.resetMessages();

      this.validationErrors.itemName = false;
      this.validationErrors.itemDate = false;

      const trimmedName = this.item.itemName?.trim() || "";
      const selectedDate = this.item.itemDate || "";
      const todayString = this.getTodayDateString();

      if (!trimmedName) {
        this.validationErrors.itemName = true;
      }

      if (!selectedDate) {
        this.validationErrors.itemDate = true;
      } else if (selectedDate > todayString) {
        this.validationErrors.itemDate = true;
        this.errorMessage = "Date of purchase cannot be in the future";
      }

      if (this.validationErrors.itemName || this.validationErrors.itemDate) {
        if (!this.errorMessage) {
          this.errorMessage = "Please fill in required fields";
        }
        return false;
      }

      return true;
    },

    resetMessages() {
      this.errorMessage = "";
      this.successMessage = "";
      this.validationErrors.itemName = false;
      this.validationErrors.itemDate = false;
    },

    processAddItem() {
      if (!this.validateItemInput()) {
        this.$nextTick(() => {
          this.$refs.itemDetails?.scrollToFirstInvalidField?.();
        });
        return;
      }

      this.executeAddItem();
    },

    executeAddItem() {
      ItemService.sendPostItemRequest(this.item)
          .then(() => this.handleAddItemResponse())
          .catch((error) => {
            if (this.itemNameAlreadyExists(error)) {
              this.errorMessage = "Item with this name already exists";
              return;
            }

            const status = error?.response?.status;
            const msg = error?.response?.data?.message;

            if (status === 400) {
              this.errorMessage = msg || "Please check your input";
              return;
            }

            this.errorMessage = "Could not add item. Please try again.";
          });
    },

    handleAddItemResponse() {
      this.successMessage = `New item "${this.item.itemName}" has been added!`;
      setTimeout(this.resetMessages, 4000);
      this.resetAllFields();
      this.$nextTick(() => {
        this.resetImageInput = false;
      });
    },

    itemNameAlreadyExists(error) {
      const data = error?.response?.data;
      return error?.response?.status === 403 && data?.errorCode === 333;
    },

    processUpdateItem() {
      if (!this.validateItemInput()) {
        this.$nextTick(() => {
          this.$refs.itemDetails?.scrollToFirstInvalidField?.();
        });
        return;
      }

      this.executeUpdateItem();
    },

    executeUpdateItem() {
      ItemService.sendPutItemRequest(this.itemId, this.item)
          .then(() => this.handleUpdateItemResponse())
          .catch((error) => {
            if (this.itemNameAlreadyExists(error)) {
              this.errorMessage = "Item with this name already exists";
              return;
            }

            const status = error?.response?.status;
            const msg = error?.response?.data?.message;

            if (status === 400) {
              this.errorMessage = msg || "Please check your input";
              return;
            }

            this.errorMessage = "Could not update item. Please try again.";
          });
    },

    handleUpdateItemResponse() {
      sessionStorage.setItem(
          "successMessage",
          `Item "${this.item.itemName}" updated successfully`
      );
      this.originalItem = JSON.parse(JSON.stringify(this.item));
      NavigationService.navigateToItemsView();
    },

    displayDeleteItemModal() {
      this.deleteItemModalIsOpen = true;
    },

    closeDeleteItemModal() {
      this.deleteItemModalIsOpen = false;
    },

    deleteItem() {
      ItemService.sendDeleteItem(this.itemId)
          .then(() => NavigationService.navigateToItemsView())
          .catch(() => {
            this.deleteItemModalIsOpen = false;
            this.errorMessage = "Could not delete item. Please try again.";
          });
    },

    setItemImageData(imageData) {
      this.item.imageData = imageData;
      this.item.imageId = null;
    },

    handleDeleteImage() {
      if (!this.item.imageId) {
        this.item.imageData = "";
        return;
      }

      ItemService.sendDeleteItemImageRequest(this.itemId, this.item.imageId)
          .then(() => {
            this.item.imageData = "";
            this.item.imageId = null;
            const itemForStorage = { ...this.item, imageData: "" };
            sessionStorage.setItem("item", JSON.stringify(itemForStorage));
          })
          .catch(() => {
            this.errorMessage = "Could not delete image. Please try again.";
          });
    },

    setItemItemName(itemName) {
      this.item.itemName = itemName;
    },

    setItemItemDate(itemDate) {
      this.item.itemDate = itemDate;
    },

    setItemModel(model) {
      this.item.model = model;
    },

    setItemComment(comment) {
      this.item.comment = comment;
    },

    resetAllFields() {
      this.item.itemName = "";
      this.item.itemDate = "";
      this.item.model = "";
      this.item.comment = "";
      this.item.imageData = "";
      this.item.imageId = null;
      this.resetImageInput = true;
    },

    enableEdit() {
      this.isEdit = true;
      this.isView = false;
    },

    disableEdit() {
      if (this.originalItem) {
        this.item = JSON.parse(JSON.stringify(this.originalItem));
      }
      this.isEdit = false;
      if (this.editEnteredFromList) {
        NavigationService.navigateToItemsView();
      } else {
        this.isView = true;
      }
    },

    goBack() {
      NavigationService.navigateToItemsView();
    }
  },

  mounted() {
    this.isAdd = isNaN(this.itemId);
    this.isView = !this.isAdd;

    if (this.isAdd) {
      return;
    }

    this.loadItem();

    const mode = SessionStorageService.getItemMode();
    SessionStorageService.clearItemMode();

    if (mode === "edit") {
      this.editEnteredFromList = true;
      this.enableEdit();
    } else if (mode === "delete") {
      this.displayDeleteItemModal();
    }
  }
};
</script>