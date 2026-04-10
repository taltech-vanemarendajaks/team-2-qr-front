<template>
  <button class="btn btn-custom mb-3" @click="navigateToAddItem">
    Add New Item +
  </button>

  <div>
    <div class="d-flex justify-content-center mb-4">
      <div class="w-100" style="max-width: 500px;">
        <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search by item name"
        />
      </div>
    </div>

    <div class="items-table-wrapper">
      <table class="items-table" v-if="filteredAndSortedItems.length >0">
        <thead>
        <tr>
          <th scope="col">
            <span class="d-inline-flex align-items-center">
            Item
           <font-awesome-icon
               icon="sort"
               class="ms-2 table-icon"
               @click="changeSort('itemName')"
           />
            </span>
          </th>
          <th scope="col">
            <span class="d-inline-flex align-items-center">
            Date of Purchase
              <font-awesome-icon
                  icon="sort"
                  class="ms-2 table-icon"
                  @click="changeSort('itemDate')"
              />
            </span>
          </th>
          <th scope="col"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in filteredAndSortedItems" :key="item.itemId">
          <td>
            <a href="#" @click.prevent="navigateToItemView(item.itemId)">{{ item.itemName }}</a>
          </td>
          <td>{{ formatDate(item.itemDate) }}</td>
          <td>
            <font-awesome-icon @click="navigateToEditItem(item.itemId)" class="table-icon me-3" icon="pen-to-square"/>
            <font-awesome-icon @click="navigateToDeleteItemModal(item.itemId)" class="table-icon me-3" icon="trash"/>
            <font-awesome-icon @click="navigateToQrCodeModal(item.itemId)" class="table-icon" icon="qrcode"/>
          </td>
        </tr>
        </tbody>
      </table>

      <div v-else>
        <span v-if="items.length === 0">You have no items yet :) </span>
        <span v-else>No items match your search.</span>
      </div>
    </div>

    <QrCodeModal
        :qr-code-modal-is-open="qrCodeModalIsOpen"
        :qr-code="qrCode"
        @event-close-modal="closeQrCodeModal"
    />
  </div>
</template>

<script>
import SessionStorageService from "@/services/SessionStorageService";
import ItemsService from "@/services/ItemService";
import NavigationService from "@/services/NavigationService";
import QrCodeService from "@/services/QrCodeService";
import QrCodeModal from "@/modal/QrCodeModal.vue";

export default {
  name: "ItemsView",
  components: {QrCodeModal},
  data() {
    return {
      items: [],
      searchQuery: '',
      sortField: 'itemDate',
      sortDirection: 'desc',
      isLoggedIn: false,
      qrCodeModalIsOpen: false,
      qrCode: '',
    }
  },

  computed: {
    filteredAndSortedItems() {
      let result = [...this.items];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(item =>
            item.itemName.toLowerCase().includes(query)
        );
      }

      result.sort((a, b) => {
        let comparison = 0;

        if (this.sortField === 'itemName') {
          comparison = a.itemName.localeCompare(b.itemName);
        } else if (this.sortField === 'itemDate') {
          comparison = new Date(a.itemDate) - new Date(b.itemDate);
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });

      return result;
    }
  },

  methods: {
    navigateToAddItem() {
      NavigationService.navigateToAddItem()
    },
    navigateToItemView(itemId) {
      NavigationService.navigateToItemView(itemId)
    },
    navigateToEditItem(itemId) {
      NavigationService.navigateToEditItem(itemId)
    },
    navigateToDeleteItemModal(itemId) {
      NavigationService.navigateToDeleteItemModal(itemId)
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
      this.qrCode = '';
    },
    loadItems() {
      const userId = sessionStorage.getItem('userId');
      ItemsService.sendGetItemsRequest(userId)
          .then(response => {
            this.items = response.data
          });
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('et-EE');
    },

    changeSort(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = field === 'itemDate' ? 'desc' : 'asc';
      }
    }
  },
  beforeMount() {
    this.isLoggedIn = SessionStorageService.isLoggedIn()
  },
  mounted() {
    this.loadItems();
  }
};
</script>