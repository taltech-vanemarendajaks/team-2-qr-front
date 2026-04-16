<template>
  <section class="admin-view">
    <div class="admin-page">
      <h1 class="admin-title">Admin Panel</h1>

      <div v-if="isLoading" class="admin-loading">Loading users...</div>

      <div v-else-if="error" class="admin-error">{{ error }}</div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Auth</th>
              <th>Items</th>
              <th>Created</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="user.status === 'A' ? 'status-active' : 'status-inactive'">
                  {{ user.status === 'A' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.role }}</td>
              <td>{{ user.authProvider }}</td>
              <td>{{ user.itemCount }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
import AdminService from "@/services/AdminService";

export default {
  name: "AdminView",

  data() {
    return {
      users: [],
      isLoading: false,
      error: null
    };
  },

  methods: {
    loadUsers() {
      this.isLoading = true;
      AdminService.getAllUsers()
        .then(response => {
          this.users = response.data;
        })
        .catch(() => {
          this.error = "Failed to load users.";
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('en-GB', { month: 'short' });
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
  },

  mounted() {
    this.loadUsers();
  }
};
</script>

<style scoped>
.admin-view {
  padding: 2rem;
}

.admin-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.admin-table th,
.admin-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table thead tr {
  background-color: #f9fafb;
  font-weight: 600;
}

.admin-table tbody tr:hover {
  background-color: #f3f4f6;
}

.status-active {
  color: #16a34a;
  font-weight: 500;
}

.status-inactive {
  color: #dc2626;
  font-weight: 500;
}

.admin-loading,
.admin-error {
  padding: 1rem;
  color: #6b7280;
}

.admin-error {
  color: #dc2626;
}
</style>
