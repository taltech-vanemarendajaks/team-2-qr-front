<template>
  <section class="items-view">
    <div class="items-page">

      <div class="items-add-wrap">
        <button class="items-add-button" @click="navigateToAddItem">
          Add New Item +
        </button>
      </div>

      <div class="items-search-wrap">
        <div class="items-search-box">
          <input
              v-model="searchQuery"
              type="text"
              class="items-search-input"
              placeholder="Search by item name"
          />

          <span class="items-search-icon">
      <font-awesome-icon icon="magnifying-glass" />
    </span>
        </div>
      </div>

      <div class="items-results">

        <div v-if="isLoading" class="items-loading">
          Loading items...
        </div>

        <div v-else-if="processedItems.length === 0" class="items-empty-state">
          <span v-if="items.length === 0">You have no items yet :)</span>
          <span v-else>No items match your search.</span>
        </div>

        <template v-else>
          <div class="items-cards">
            <article
                v-for="item in paginatedItems"
                :key="item.itemId"
                class="item-card"
            >
              <div class="item-card-top">
                <a
                    href="#"
                    class="item-card-name"
                    @click.prevent="navigateToItemView(item.itemId)"
                >
                  {{ item.itemName }}
                </a>

                <div class="item-card-date">
                  {{ formatDate(item.itemDate) }}
                </div>
              </div>

              <div class="item-card-actions">
                <button
                    type="button"
                    class="item-action-button"
                    @click="navigateToItemView(item.itemId)"
                    aria-label="View item"
                >
                  <font-awesome-icon icon="glasses" />
                </button>

                <button
                    type="button"
                    class="item-action-button"
                    @click="navigateToEditItem(item.itemId)"
                    aria-label="Edit item"
                >
                  <font-awesome-icon icon="pen-to-square" />
                </button>

                <button
                    type="button"
                    class="item-action-button"
                    @click="navigateToDeleteItemModal(item.itemId)"
                    aria-label="Delete item"
                >
                  <font-awesome-icon icon="trash" />
                </button>

                <button
                    type="button"
                    class="item-action-button"
                    @click="navigateToQrCodeModal(item.itemId)"
                    aria-label="Open QR code"
                >
                  <font-awesome-icon icon="qrcode" />
                </button>
              </div>
            </article>
          </div>

          <div class="items-table-wrap">
            <table class="items-table">
              <thead>
              <tr>
                <th>
                  <button
                      type="button"
                      class="items-header-sort"
                      @click="setSort('itemName')"
                  >
                    <span>Item</span>
                    <span class="items-header-sort-icons">
      <span :class="{ active: sortField === 'itemName' && sortDirection === 'asc' }">▲</span>
      <span :class="{ active: sortField === 'itemName' && sortDirection === 'desc' }">▼</span>
    </span>
                  </button>
                </th>

                <th>
                  <button
                      type="button"
                      class="items-header-sort"
                      @click="setSort('itemDate')"
                  >
                    <span>Purchase Date</span>
                    <span class="items-header-sort-icons">
      <span :class="{ active: sortField === 'itemDate' && sortDirection === 'asc' }">▲</span>
      <span :class="{ active: sortField === 'itemDate' && sortDirection === 'desc' }">▼</span>
    </span>
                  </button>
                </th>
                <th></th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="item in paginatedItems" :key="item.itemId">
                <td>
                  <a
                      href="#"
                      class="items-table-link"
                      @click.prevent="navigateToItemView(item.itemId)"
                  >
                    {{ item.itemName }}
                  </a>
                </td>

                <td>{{ formatDate(item.itemDate) }}</td>

                <td>
                  <div class="items-table-actions">
                    <button
                        type="button"
                        class="item-action-button"
                        @click="navigateToItemView(item.itemId)"
                        aria-label="View item"
                    >
                      <font-awesome-icon icon="glasses" />
                    </button>

                    <button
                        type="button"
                        class="item-action-button"
                        @click="navigateToEditItem(item.itemId)"
                        aria-label="Edit item"
                    >
                      <font-awesome-icon icon="pen-to-square" />
                    </button>

                    <button
                        type="button"
                        class="item-action-button"
                        @click="navigateToDeleteItemModal(item.itemId)"
                        aria-label="Delete item"
                    >
                      <font-awesome-icon icon="trash" />
                    </button>

                    <button
                        type="button"
                        class="item-action-button"
                        @click="navigateToQrCodeModal(item.itemId)"
                        aria-label="Open QR code"
                    >
                      <font-awesome-icon icon="qrcode" />
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div v-if="totalPages > 1" class="items-pagination">
            <button
                type="button"
                class="items-page-button"
                @click="goToPreviousPage"
                :disabled="currentPage === 1"
            >
              Previous
            </button>

            <span class="items-page-indicator">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button
                type="button"
                class="items-page-button"
                @click="goToNextPage"
                :disabled="currentPage === totalPages"
            >
              Next
            </button>
          </div>
        </template>
      </div>

      <QrCodeModal
          :qr-code-modal-is-open="qrCodeModalIsOpen"
          :qr-code="qrCode"
          @event-close-modal="closeQrCodeModal"
      />
    </div>
  </section>
</template>

<script>
import SessionStorageService from "@/services/SessionStorageService";
import ItemsService from "@/services/ItemService";
import NavigationService from "@/services/NavigationService";
import QrCodeService from "@/services/QrCodeService";
import QrCodeModal from "@/modal/QrCodeModal.vue";

import "@/assets/css/views/items.css";

export default {
  name: "ItemsView",
  components: { QrCodeModal },

  data() {
    return {
      items: [],
      searchQuery: "",
      sortField: "itemDate",
      sortDirection: "desc",
      isLoggedIn: false,
      qrCodeModalIsOpen: false,
      qrCode: "",
      currentPage: 1,
      itemsPerPage: 5,
      isLoading: false
    };
  },

  computed: {
    processedItems() {
      let result = [...this.items];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(item =>
            item.itemName.toLowerCase().includes(query)
        );
      }

      result.sort((a, b) => {
        let comparison = 0;

        if (this.sortField === "itemName") {
          comparison = a.itemName.localeCompare(b.itemName);
        } else if (this.sortField === "itemDate") {
          comparison = new Date(a.itemDate) - new Date(b.itemDate);
        }

        return this.sortDirection === "asc" ? comparison : -comparison;
      });

      return result;
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.processedItems.length / this.itemsPerPage));
    },

    paginatedItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.processedItems.slice(startIndex, endIndex);
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
  },

  methods: {
    navigateToAddItem() {
      NavigationService.navigateToAddItem();
    },

    navigateToItemView(itemId) {
      NavigationService.navigateToItemView(itemId);
    },

    navigateToEditItem(itemId) {
      NavigationService.navigateToEditItem(itemId);
    },

    navigateToDeleteItemModal(itemId) {
      NavigationService.navigateToDeleteItemModal(itemId);
    },

    navigateToQrCodeModal(itemId) {
      this.openQrCodeForItem(itemId);
    },

    openQrCodeForItem(itemId) {
      QrCodeService.sendGetQrCodeRequest(itemId)
          .then(response => {
            this.qrCode = response.data;
            this.qrCodeModalIsOpen = true;
          })
          .catch(err => {
            console.error("Failed to load QR code:", err);
          });
    },

    closeQrCodeModal() {
      this.qrCodeModalIsOpen = false;
      this.qrCode = "";
    },

    loadItems() {
      this.isLoading = true;

      ItemsService.sendGetItemsRequest()
          .then(response => {
            this.items = response.data;
            this.currentPage = 1;
          })
          .catch(error => {
            console.error("Failed to load items:", error);
          })
          .finally(() => {
            this.isLoading = false;
          });
    },

    formatDate(dateString) {
      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("en-GB", { month: "short" });
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    },

    setSort(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortDirection = field === "itemDate" ? "desc" : "asc";
      }

      this.currentPage = 1;
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) {
        return;
      }

      this.currentPage = page;
    },

    goToPreviousPage() {
      this.goToPage(this.currentPage - 1);
    },

    goToNextPage() {
      this.goToPage(this.currentPage + 1);
    }
  },

  beforeMount() {
    this.isLoggedIn = SessionStorageService.isLoggedIn();
  },

  mounted() {
    this.loadItems();
  }
};
</script>