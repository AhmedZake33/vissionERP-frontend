<template>
  <div>
    <h2>{{ isEdit ? $t('purchases.editPurchase') : $t('purchases.newPurchase') }}</h2>
    <form @submit.prevent="submit">
      <div class="form-group">
        <label>{{ $t('purchases.itemName') }}</label>
        <input v-model="form.item_name" class="form-control" required />
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.category') }}</label>
        <select v-model="form.category" class="form-control">
          <option>Medical Supplies</option>
          <option>Equipment</option>
          <option>Services</option>
          <option>Maintenance</option>
          <option>Other</option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.quantity') }}</label>
        <input type="number" v-model.number="form.quantity" class="form-control" />
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.amountPaid') }}</label>
        <input type="number" step="0.01" v-model.number="form.amount_paid" class="form-control" required />
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.supplier') }}</label>
        <input v-model="form.supplier" class="form-control" />
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.paymentMethod') }}</label>
        <select v-model="form.payment_method" class="form-control">
          <option>Cash</option>
          <option>Card</option>
          <option>Bank Transfer</option>
          <option>Other</option>
          <option>InstaPay</option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.purchaseDate') }}</label>
        <input type="date" v-model="form.purchase_date" class="form-control" required />
      </div>

      <div class="form-group">
        <label>{{ $t('purchases.notes') }}</label>
        <textarea v-model="form.notes" class="form-control"></textarea>
      </div>

      <button class="btn btn-primary" type="submit">{{ $t('actions.save') }}</button>
    </form>
  </div>
</template>

<script>
import purchasesApi from '@/services/purchases'

export default {
  props: {
    modalMode: {
      type: Boolean,
      default: false,
    },
    purchaseId: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      form: {
        item_name: '',
        category: 'Other',
        quantity: null,
        amount_paid: 0,
        supplier: '',
        payment_method: 'Cash',
        purchase_date: new Date().toISOString().substr(0, 10),
        notes: '',
      },
      isEdit: false,
    }
  },
  async created() {
    const routeId = this.$route && this.$route.params ? this.$route.params.id : null
    const id = this.purchaseId || routeId
    if (id) {
      this.isEdit = true
      const res = await purchasesApi.getPurchase(id)
      this.form = res.data
    }
  },
  methods: {
    async submit() {
      let res
      if (this.isEdit) {
        res = await purchasesApi.updatePurchase(this.form.id, this.form)
      } else {
        res = await purchasesApi.createPurchase(this.form)
      }

      if (this.modalMode) {
        this.$emit('saved', res.data)
      } else {
        this.$router.push({ name: this.isDoctorRoute() ? 'doctor-purchases' : 'assistant-purchases' })
      }
    },
    isDoctorRoute() {
      return this.$route && this.$route.name && String(this.$route.name).startsWith('doctor-')
    },
  },
}
</script>
