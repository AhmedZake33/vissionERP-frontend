<template>
  <div>
    <b-card>
      <b-row class="mb-2">
        <b-col cols="12" md="4">
          <h4>{{ $t('reservation.reservationsList') }}</h4>
        </b-col>
        <b-col cols="12" md="8" class="text-right">
          <b-button variant="primary" @click="showAddModal">
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('actions.newReservation') }}
          </b-button>
        </b-col>
      </b-row>

      <b-form @submit.prevent="applyFilters" class="mb-2">
        <b-row>
          <b-col cols="12" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.search" :placeholder="$t('reservation.searchByClientOrNotes')" />
          </b-col>
          <b-col cols="6" md="2" class="mb-1 mb-md-0">
            <b-form-select v-model="filters.status" :options="statusOptions" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.date_from" type="date" :placeholder="$t('reservation.from')" />
          </b-col>
          <b-col cols="6" md="2" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.date_to" type="date" :placeholder="$t('reservation.to')" />
          </b-col>
          <b-col cols="12" md="12" class="text-right mt-1">
            <b-button type="submit" variant="primary" class="mr-1" :disabled="loading">
              {{ $t('filters.apply') }}
            </b-button>
            <b-button variant="outline-secondary" size="sm" @click="resetFilters" :disabled="loading">
              {{ $t('filters.reset') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>

      <b-table
        :items="reservations"
        :fields="translatedFields"
        responsive
        striped
        hover
        :busy="loading"
        show-empty
      >
        <template #cell(status)="data">
          <b-badge :variant="getStatusVariant(data.value)">
            {{ $t('reservation.' + data.value) }}
          </b-badge>
          <b-badge v-if="data.item.checked_in_at" variant="success" pill class="ml-50">
            <feather-icon icon="LogInIcon" size="12" class="mr-25" />
            #{{ data.item.waiting_number }}
          </b-badge>
        </template>

        <template #cell(requirements)="data">
          <span v-if="!data.item.requires_xray && !data.item.requires_lab" class="text-muted">—</span>
          <span v-else>
            <b-badge v-if="data.item.requires_xray" variant="warning" class="mr-50">
              <feather-icon icon="ImageIcon" size="12" class="mr-25" />
              {{ $t('reservation.xray') }}
            </b-badge>
            <b-badge v-if="data.item.requires_lab" variant="info">
              <feather-icon icon="ActivityIcon" size="12" class="mr-25" />
              {{ $t('reservation.lab') }}
            </b-badge>
          </span>
        </template>

        <template #cell(actions)="data">
          <b-button
            v-b-tooltip.hover
            :title="$t('actions.view')"
            variant="info"
            size="sm"
            class="mr-1"
            @click="viewReservation(data.item)"
          >
            <feather-icon icon="EyeIcon" />
          </b-button>
          <b-button
            v-if="!data.item.checked_in_at && (data.item.status === 'pending' || data.item.status === 'confirmed')"
            v-b-tooltip.hover
            :title="$t('queue.checkIn')"
            variant="primary"
            size="sm"
            class="mr-1"
            @click="checkInPatient(data.item)"
          >
            <feather-icon icon="LogInIcon" />
          </b-button>
          <b-button
            v-if="data.item.status === 'pending'"
            v-b-tooltip.hover
            :title="$t('actions.confirm')"
            variant="success"
            size="sm"
            class="mr-1"
            @click="confirmReservation(data.item)"
          >
            <feather-icon icon="CheckCircleIcon" />
          </b-button>
          <b-button
            v-if="data.item.status !== 'completed' && data.item.status !== 'cancelled'"
            v-b-tooltip.hover
            :title="$t('reservation.completeReservation')"
            variant="success"
            size="sm"
            class="mr-1"
            @click="completeReservation(data.item)"
          >
            <feather-icon icon="CheckIcon" />
          </b-button>
          <b-button
            v-if="data.item.status !== 'completed' && data.item.status !== 'cancelled'"
            v-b-tooltip.hover
            :title="$t('actions.edit')"
            variant="warning"
            size="sm"
            class="mr-1"
            @click="showEditModal(data.item)"
          >
            <feather-icon icon="EditIcon" />
          </b-button>
          <b-button
            v-if="data.item.status !== 'completed' && data.item.status !== 'cancelled'"
            v-b-tooltip.hover
            :title="$t('actions.cancel')"
            variant="danger"
            size="sm"
            @click="cancelReservation(data.item)"
          >
            <feather-icon icon="XCircleIcon" />
          </b-button>
          <b-button
            v-if="data.item.status === 'completed' && data.item.treatment"
            v-b-tooltip.hover
            :title="$t('reservation.printMedicinesPrescription')"
            variant="primary"
            size="sm"
            class="ml-1"
            @click="printMedicinesPrescription(data.item)"
          >
            <feather-icon icon="PrinterIcon" />
          </b-button>
        </template>

        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
        </template>
      </b-table>

      <b-pagination
        v-model="pagination.current_page"
        :total-rows="pagination.total"
        :per-page="pagination.per_page"
        @change="onPageChange"
        class="mt-2"
        align="center"
      />
      <div class="text-center text-muted small mt-1" v-if="pagination.total">
        {{ paginationCountText(pagination) }}
      </div>
    </b-card>

    <!-- Add Reservation Modal -->
    <b-modal
      v-model="modalShow"
      :title="$t('actions.newReservation')"
      hide-footer
      size="lg"
    >
      <b-form @submit.prevent="saveReservation">
        <b-form-group :label="$t('table.client')" label-for="client">
          <b-form-input
            id="client-search"
            v-model="clientSearch"
            :placeholder="$t('client.searchPlaceholder')"
            autocomplete="off"
            @focus="openClientSearch"
          />
          <div v-if="clientDropdownOpen && clientsLoading" class="client-search-dropdown">
            <div class="client-search-item text-muted">
              <b-spinner small class="mr-50" />
              {{ $t('messages.loading') }}
            </div>
          </div>
          <div v-else-if="clientDropdownOpen && filteredClients.length" class="client-search-dropdown">
            <div
              v-for="client in filteredClients"
              :key="client.id"
              class="client-search-item"
              @mousedown.prevent="selectClient(client)"
            >
              <strong>{{ client.name }}</strong>
              <small class="text-muted d-block">
                {{ client.phone }}
                <span v-if="client.whatsapp_number"> | {{ client.whatsapp_number }}</span>
              </small>
            </div>
          </div>
          <div v-else-if="clientDropdownOpen && clientSearch && !filteredClients.length" class="client-search-dropdown">
            <div class="client-search-item text-muted">{{ $t('messages.noData') }}</div>
          </div>
          <small v-if="form.client_id && selectedClientDisplay" class="text-success">
            {{ $t('reservation.selected') }}: {{ selectedClientDisplay }}
          </small>
        </b-form-group>

        <b-form-group :label="$t('table.doctor')" label-for="doctor">
          <b-form-select
            id="doctor"
            v-model="form.doctor_id"
            :options="doctorOptions"
            required
          >
            <template #first>
              <b-form-select-option :value="null" disabled>
                {{ $t('reservation.selectDoctor') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>

        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('reservation.appointmentDate')" label-for="appointment-date">
              <b-form-input
                id="appointment-date"
                v-model="form.appointment_date_only"
                type="date"
                required
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('reservation.appointmentTime')" label-for="appointment-time">
              <b-form-select
                id="appointment-time"
                v-model="form.selected_time"
                :options="availableTimeOptions"
                :disabled="!form.doctor_id || !form.appointment_date_only || availabilityLoading"
                required
              >
                <template #first>
                  <b-form-select-option :value="null" disabled>
                    {{ availabilityLoading ? $t('messages.loading') : (availableTimeSlots.length === 0 && form.doctor_id && form.appointment_date_only ? $t('reservation.noAvailableTimes') : $t('reservation.selectTime')) }}
                  </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
        <div class="mb-1">
          <b-alert v-if="availabilityLoading" show variant="info">{{ $t('reservation.loadingAvailableTimes') }}</b-alert>
          <b-alert v-else-if="timeSlotsMessage" :variant="timeSlotsMessageVariant" show>
            {{ timeSlotsMessage }}
          </b-alert>
        </div>

        <b-form-group :label="$t('reservation.notes')" label-for="notes">
          <b-form-textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            :placeholder="$t('reservation.notes')"
          />
        </b-form-group>

        <hr>
        <div class="d-flex justify-content-between align-items-center mb-1">
          <h6 class="mb-0">{{ $t('services.additionalServices') }}</h6>
          <small v-if="!form.doctor_id" class="text-muted">{{ $t('reservation.selectDoctor') }}</small>
        </div>

        <div>
          <b-form-group :label="$t('services.selectFromCatalog')" label-for="create-svc-catalog">
            <b-form-select
              id="create-svc-catalog"
              v-model="createServiceForm.doctor_service_id"
              :options="doctorServiceOptions"
              :disabled="!form.doctor_id"
              @change="onCreateCatalogServiceChange"
            />
          </b-form-group>

          <b-form-group :label="$t('services.name')" label-for="create-service-name">
            <b-form-input
              id="create-service-name"
              v-model="createServiceForm.service_name"
              :disabled="!form.doctor_id"
            />
          </b-form-group>

          <b-row>
            <b-col cols="6">
              <b-form-group :label="$t('services.price')" label-for="create-service-price">
                <b-form-input
                  id="create-service-price"
                  v-model="createServiceForm.unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  :disabled="!form.doctor_id"
                />
              </b-form-group>
            </b-col>
            <b-col cols="6">
              <b-form-group :label="$t('services.quantity')" label-for="create-service-quantity">
                <b-form-input
                  id="create-service-quantity"
                  v-model="createServiceForm.quantity"
                  type="number"
                  min="1"
                  :disabled="!form.doctor_id"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <div class="mb-1 p-1 bg-light rounded text-center">
            <strong>{{ $t('services.total') }}: {{ createServiceTotal.toFixed(2) }}</strong>
          </div>

          <b-form-group :label="$t('services.invoiceOption')" label-for="create-service-invoice">
            <div class="d-flex">
              <b-form-radio v-model="createServiceForm.with_invoice" :value="true" class="mr-2" :disabled="!form.doctor_id">
                {{ $t('services.withInvoice') }}
              </b-form-radio>
              <b-form-radio v-model="createServiceForm.with_invoice" :value="false" :disabled="!form.doctor_id">
                {{ $t('services.noInvoice') }}
              </b-form-radio>
            </div>
          </b-form-group>

          <b-form-group :label="$t('services.notes')" label-for="create-service-notes">
            <b-form-input
              id="create-service-notes"
              v-model="createServiceForm.notes"
              :placeholder="$t('services.notesPlaceholder')"
              :disabled="!form.doctor_id"
            />
          </b-form-group>

          <div class="text-right mb-1">
            <b-button type="button" size="sm" variant="outline-primary" :disabled="!form.doctor_id || !createServiceForm.service_name" @click="addPendingReservationService">
              <feather-icon icon="PlusIcon" size="14" class="mr-25" />
              {{ $t('services.addService') }}
            </b-button>
          </div>
        </div>

        <div v-if="pendingReservationServices.length === 0" class="text-muted small text-center py-1">
          {{ $t('services.noServicesOnReservation') }}
        </div>
        <b-table
          v-else
          :items="pendingReservationServices"
          :fields="createServicesTableFields"
          small
          responsive
          striped
        >
          <template #cell(service_name)="data">
            {{ data.item.service_name }}
            <span v-if="data.item.notes" class="text-muted d-block small">{{ data.item.notes }}</span>
          </template>
          <template #cell(total_price)="data">
            {{ Number(data.item.unit_price).toFixed(2) }} × {{ data.item.quantity }} = <strong>{{ Number(data.item.total_price).toFixed(2) }}</strong>
          </template>
          <template #cell(with_invoice)="data">
            <b-badge :variant="data.item.with_invoice ? 'success' : 'secondary'">
              {{ data.item.with_invoice ? $t('services.withInvoice') : $t('services.noInvoice') }}
            </b-badge>
          </template>
          <template #cell(actions)="data">
            <b-button
              v-b-tooltip.hover
              :title="$t('actions.delete')"
              size="sm"
              variant="flat-danger"
              class="btn-icon"
              @click="removePendingReservationService(data.index)"
            >
              <feather-icon icon="TrashIcon" />
            </b-button>
          </template>
        </b-table>

        <div v-if="pendingReservationServices.length" class="text-right mt-50">
          <strong>{{ $t('services.totalServices') }}: {{ pendingServicesTotal.toFixed(2) }}</strong>
        </div>

        <hr>
        <h6 class="mb-1">{{ $t('financial.financial') }}</h6>

        <b-row>
          <b-col cols="12" sm="6" md="4">
            <b-form-group :label="$t('financial.amount')" label-for="amount">
              <b-form-input
                id="amount"
                v-model.number="form.amount"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" sm="6" md="4">
            <b-form-group :label="$t('financial.paid')" label-for="paid">
              <b-form-input
                id="paid"
                v-model.number="form.paid"
                type="number"
                min="0"
                step="0.01"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" sm="6" md="4">
            <b-form-group :label="$t('financial.paymentMethod')" label-for="payment_method">
              <b-form-select
                id="payment_method"
                v-model="form.payment_method"
                :options="paymentMethodOptions"
                required
              />
            </b-form-group>
          </b-col>
        </b-row>

        <div class="text-right">
          <b-button type="button" variant="secondary" class="mr-1" @click="modalShow = false">
            {{ $t('actions.cancel') }}
          </b-button>
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-1" />
            {{ $t('actions.createReservation') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- View Modal -->
    <b-modal
      v-model="viewModalShow"
      :title="$t('reservation.reservationDetails')"
      ok-only
      size="lg"
    >
      <div v-if="selectedReservation">
        <div class="d-flex flex-wrap justify-content-end mb-2">
          <b-button
            v-if="selectedReservation.status === 'completed'"
            variant="primary"
            size="sm"
            class="mr-1 mb-50"
            @click="printMedicinesPrescription(selectedReservation)"
          >
            <feather-icon icon="PrinterIcon" class="mr-50" />
            {{ $t('reservation.printMedicinesPrescription') }}
          </b-button>
          <b-button
            v-if="selectedReservation.status !== 'cancelled'"
            variant="outline-primary"
            size="sm"
            class="mb-50"
            @click="printReservationDetails(selectedReservation)"
          >
            <feather-icon icon="FileTextIcon" class="mr-50" />
            {{ $t('reservation.printReservationDetails') }}
          </b-button>
        </div>

        <!-- Client Details -->
        <b-card v-if="selectedReservation.client" class="mb-2" no-body>
          <b-card-header>
            <h6 class="mb-0">{{ $t('client.clientDetails') }}</h6>
          </b-card-header>
          <b-card-body>
            <b-row>
              <b-col cols="12" md="6">
                <p class="mb-50"><strong>{{ $t('client.name') }}:</strong> {{ selectedReservation.client.name }}</p>
                <p class="mb-50"><strong>{{ $t('client.phone') }}:</strong> {{ selectedReservation.client.phone }}</p>
                <p class="mb-50"><strong>{{ $t('client.whatsappNumber') }}:</strong> {{ selectedReservation.client.whatsapp_number || $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.dateOfBirth') }}:</strong> {{ selectedReservation.client.date_of_birth || $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.age') }}:</strong> {{ calculateAge(selectedReservation.client.date_of_birth) }}</p>
              </b-col>
              <b-col cols="12" md="6">
                <p class="mb-50"><strong>{{ $t('client.height') }}:</strong> {{ selectedReservation.client.height ? selectedReservation.client.height + ' cm' : $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.weight') }}:</strong> {{ selectedReservation.client.weight ? selectedReservation.client.weight + ' kg' : $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.address') }}:</strong> {{ selectedReservation.client.address || $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.job') }}:</strong> {{ selectedReservation.client.job || $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.chronicIllnesses') }}:</strong> {{ formatClientChronicIllnesses(selectedReservation.client.chronic_illnesses) }}</p>
              </b-col>
            </b-row>
            <div v-if="selectedReservation.client.medical_history" class="mt-50">
              <p class="mb-25"><strong>{{ $t('client.medicalHistory') }}:</strong></p>
              <b-alert variant="warning" show class="mb-0">{{ selectedReservation.client.medical_history }}</b-alert>
            </div>
          </b-card-body>
        </b-card>

        <b-row>
          <b-col cols="12" md="6">
            <p v-if="selectedReservation.doctor"><strong>{{ $t('table.doctor') }}:</strong> {{ selectedReservation.doctor.name }}</p>
            <p><strong>{{ $t('table.status') }}:</strong> 
              <b-badge :variant="getStatusVariant(selectedReservation.status)">
                {{ $t('reservation.' + selectedReservation.status) }}
              </b-badge>
            </p>
          </b-col>
          <b-col cols="12" md="6">
            <p><strong>{{ $t('table.appointment') }}:</strong> {{ formatDateTime(selectedReservation.appointment_date) }}</p>
            <p><strong>{{ $t('table.created') }}:</strong> {{ formatDateTime(selectedReservation.created_at) }}</p>
            <p v-if="selectedReservation.completed_at">
              <strong>{{ $t('table.completed') }}:</strong> {{ formatDateTime(selectedReservation.completed_at) }}
            </p>
            <p v-if="selectedReservation.checked_in_at">
              <strong>{{ $t('queue.checkedInAt') }}:</strong> {{ formatDateTime(selectedReservation.checked_in_at) }}
              <b-badge variant="success" pill class="ml-50">
                {{ $t('queue.waitingNumber') }}: #{{ selectedReservation.waiting_number }}
              </b-badge>
            </p>
          </b-col>
        </b-row>
        <hr>
        <p><strong>{{ $t('reservation.notes') }}:</strong></p>
        <p>{{ selectedReservation.notes || $t('reservation.na') }}</p>
        <div v-if="selectedReservation.diagnosis">
          <p><strong>{{ $t('reservation.diagnosis') }}:</strong></p>
          <p>{{ selectedReservation.diagnosis }}</p>
        </div>
        <div v-if="selectedReservation.treatment">
          <p><strong>{{ $t('reservation.treatment') }}:</strong></p>
          <p>{{ selectedReservation.treatment }}</p>
        </div>
        <div v-if="selectedReservation.current_procedures">
          <p><strong>{{ $t('reservation.currentProcedures') }}:</strong></p>
          <p>{{ selectedReservation.current_procedures }}</p>
        </div>
        <div v-if="selectedReservation.procedure_notes">
          <p><strong>{{ $t('reservation.procedureNotes') }}:</strong></p>
          <p>{{ selectedReservation.procedure_notes }}</p>
        </div>
        <div v-if="selectedReservation.next_procedures">
          <p><strong>{{ $t('reservation.nextProcedures') }}:</strong></p>
          <p>{{ selectedReservation.next_procedures }}</p>
        </div>
        <div v-if="selectedReservation.completion_files && selectedReservation.completion_files.length">
          <hr>
          <p><strong>{{ $t('reservation.completionFiles') }}:</strong></p>
          <div class="d-flex flex-column">
            <b-button
              v-for="file in selectedReservation.completion_files"
              :key="file.id"
              variant="outline-primary"
              size="sm"
              class="mb-50 text-left"
              @click="downloadCompletionFile(file)"
            >
              <feather-icon icon="PaperclipIcon" size="14" class="mr-50" />
              {{ file.file_name }}
              <span v-if="file.size_text" class="text-muted ml-50">({{ file.size_text }})</span>
            </b-button>
          </div>
        </div>

        <div v-if="selectedReservation.requires_xray || selectedReservation.requires_lab">
          <hr>
          <h6>{{ $t('reservation.additionalRequirements') }}</h6>
          <div v-if="selectedReservation.requires_xray" class="mb-1">
            <b-badge variant="warning" class="mr-1">
              <feather-icon icon="ImageIcon" size="12" class="mr-25" />
              {{ $t('reservation.requiresXray') }}
            </b-badge>
            <p v-if="selectedReservation.xray_notes" class="mt-50 text-muted small">{{ selectedReservation.xray_notes }}</p>
          </div>
          <div v-if="selectedReservation.requires_lab">
            <b-badge variant="info" class="mr-1">
              <feather-icon icon="ActivityIcon" size="12" class="mr-25" />
              {{ $t('reservation.requiresLab') }}
            </b-badge>
            <p v-if="selectedReservation.lab_notes" class="mt-50 text-muted small">{{ selectedReservation.lab_notes }}</p>
          </div>
        </div>

        <hr>
        <h6 class="mb-1">{{ $t('reservation.activityLog') }}</h6>
        <div v-if="selectedReservation.logs && selectedReservation.logs.length">
          <div
            v-for="log in selectedReservation.logs"
            :key="log.id"
            class="d-flex justify-content-between align-items-start border-bottom py-50"
          >
            <div>
              <b-badge :variant="getReservationLogVariant(log.action)" class="mr-50">
                {{ getReservationLogLabel(log.action) }}
              </b-badge>
              <span>{{ getReservationLogDescription(log) }}</span>
              <div class="small text-muted">
                {{ log.actor ? log.actor.name : $t('reservation.na') }}
                <span v-if="log.actor && log.actor.role">({{ log.actor.role }})</span>
              </div>
            </div>
            <small class="text-muted text-nowrap ml-1">{{ formatDateTime(log.created_at) }}</small>
          </div>
        </div>
        <div v-else class="text-muted small text-center py-1">
          {{ $t('reservation.noActivityLog') }}
        </div>

        <hr>
        <div class="d-flex justify-content-between align-items-center mb-1">
          <h6 class="mb-0">{{ $t('services.additionalServices') }}</h6>
          <b-button
            v-if="selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled'"
            size="sm"
            variant="outline-primary"
            @click="openAddServiceModal"
          >
            <feather-icon icon="PlusIcon" size="14" class="mr-25" />
            {{ $t('services.addService') }}
          </b-button>
        </div>

        <div v-if="loadingResServices" class="text-center py-1">
          <b-spinner small />
        </div>
        <div v-else-if="reservationServices.length === 0" class="text-muted small text-center py-1">
          {{ $t('services.noServicesOnReservation') }}
        </div>
        <b-table
          v-else
          :items="reservationServices"
          :fields="servicesTableFields"
          small
          responsive
          striped
        >
          <template #cell(service_name)="data">
            {{ data.item.service_name }}
            <span v-if="data.item.notes" class="text-muted d-block small">{{ data.item.notes }}</span>
          </template>
          <template #cell(total_price)="data">
            {{ Number(data.item.unit_price).toFixed(2) }} × {{ data.item.quantity }} = <strong>{{ Number(data.item.total_price).toFixed(2) }}</strong>
          </template>
          <template #cell(with_invoice)="data">
            <b-badge :variant="data.item.with_invoice ? 'success' : 'secondary'">
              {{ data.item.with_invoice ? $t('services.withInvoice') : $t('services.noInvoice') }}
            </b-badge>
          </template>
        </b-table>

        <div v-if="reservationServices.length" class="text-right mt-50">
          <strong>{{ $t('services.totalServices') }}:
            {{ reservationServices.reduce((sum, s) => sum + Number(s.total_price), 0).toFixed(2) }}
          </strong>
        </div>
      </div>
    </b-modal>

    <b-modal
      v-model="addServiceModalShow"
      :title="$t('services.addService')"
      no-close-on-backdrop
      @hidden="resetServiceForm"
    >
      <b-form @submit.prevent="saveReservationService">
        <b-form-group :label="$t('services.selectFromCatalog')" label-for="svc-catalog-assistant">
          <b-form-select
            id="svc-catalog-assistant"
            v-model="serviceForm.doctor_service_id"
            :options="doctorServiceOptions"
            @change="onCatalogServiceChange"
          />
        </b-form-group>

        <b-form-group :label="$t('services.name')" label-for="assistant-service-name">
          <b-form-input
            id="assistant-service-name"
            v-model="serviceForm.service_name"
            required
          />
        </b-form-group>

        <b-row>
          <b-col cols="6">
            <b-form-group :label="$t('services.price')" label-for="assistant-service-price">
              <b-form-input
                id="assistant-service-price"
                v-model="serviceForm.unit_price"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group :label="$t('services.quantity')" label-for="assistant-service-quantity">
              <b-form-input
                id="assistant-service-quantity"
                v-model="serviceForm.quantity"
                type="number"
                min="1"
                required
              />
            </b-form-group>
          </b-col>
        </b-row>

        <div class="mb-1 p-1 bg-light rounded text-center">
          <strong>{{ $t('services.total') }}: {{ serviceTotal.toFixed(2) }}</strong>
        </div>

        <b-form-group :label="$t('services.invoiceOption')" label-for="assistant-service-invoice">
          <div class="d-flex">
            <b-form-radio v-model="serviceForm.with_invoice" :value="true" class="mr-2">
              {{ $t('services.withInvoice') }}
            </b-form-radio>
            <b-form-radio v-model="serviceForm.with_invoice" :value="false">
              {{ $t('services.noInvoice') }}
            </b-form-radio>
          </div>
        </b-form-group>

        <b-form-group :label="$t('services.notes')" label-for="assistant-service-notes">
          <b-form-input
            id="assistant-service-notes"
            v-model="serviceForm.notes"
            :placeholder="$t('services.notesPlaceholder')"
          />
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="addServiceModalShow = false">{{ $t('actions.cancel') }}</b-button>
        <b-button variant="primary" :disabled="savingService" @click="saveReservationService">
          <b-spinner v-if="savingService" small class="mr-50" />
          {{ $t('actions.add') }}
        </b-button>
      </template>
    </b-modal>

    <!-- Edit Reservation Modal -->
    <b-modal
      v-model="editModalShow"
      :title="$t('actions.editReservation')"
      hide-footer
      size="lg"
    >
      <b-form @submit.prevent="updateSelectedReservation">
        <b-form-group :label="$t('table.client')" label-for="edit-client">
          <b-form-select
            id="edit-client"
            v-model="editForm.client_id"
            :options="clientOptions"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('table.doctor')" label-for="edit-doctor">
          <b-form-select
            id="edit-doctor"
            v-model="editForm.doctor_id"
            :options="doctorOptions"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.appointmentDate')" label-for="edit-datetime">
          <b-form-input
            id="edit-datetime"
            v-model="editForm.appointment_date"
            type="datetime-local"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('table.status')" label-for="edit-status">
          <b-form-select
            id="edit-status"
            v-model="editForm.status"
            :options="editStatusOptions"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.notes')" label-for="edit-notes">
          <b-form-textarea
            id="edit-notes"
            v-model="editForm.notes"
            rows="3"
            :placeholder="$t('reservation.notes')"
          />
        </b-form-group>

        <div class="text-right">
          <b-button variant="secondary" class="mr-1" @click="editModalShow = false">
            {{ $t('actions.cancel') }}
          </b-button>
          <b-button type="submit" variant="primary" :disabled="updating">
            <b-spinner v-if="updating" small class="mr-1" />
            {{ $t('actions.save') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import {
  BCard,
  BRow,
  BCol,
  BButton,
  BTable,
  BPagination,
  BModal,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BFormSelectOption,
  BSpinner,
  BBadge,
  BAlert,
  VBTooltip,
} from 'bootstrap-vue'
import reservationsService from '@/services/reservations'
import clientsService from '@/services/clients'
import scheduleService from '@/services/schedule'
import doctorServicesApi from '@/services/doctorServices'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { formatChronicIllnesses } from '@/utils/clientChronicIllnesses'
import { formatAgeFromBirthDate } from '@/utils/clientAge'

export default {
  components: {
    BCard,
    BRow,
    BCol,
    BButton,
    BTable,
    BPagination,
    BModal,
    BForm,
    BFormGroup,
    BFormInput,
    BFormTextarea,
    BFormSelect,
    BFormSelectOption,
    BSpinner,
    BBadge,
    BAlert,
    BCardHeader: () => import('bootstrap-vue').then(m => m.BCardHeader),
    BCardBody: () => import('bootstrap-vue').then(m => m.BCardBody),
    BFormRadio: () => import('bootstrap-vue').then(m => m.BFormRadio),
  },
  directives: {
    'b-tooltip': VBTooltip,
  },
  data() {
    return {
      reservations: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
      clients: [],
      doctors: [],
      loading: false,
      modalShow: false,
      viewModalShow: false,
      editModalShow: false,
      saving: false,
      updating: false,
      selectedReservation: null,
      clientSearch: '',
      clientDropdownOpen: false,
      clientsLoading: false,
      clientSearchTimer: null,
      suppressClientSearchWatch: false,
      availabilityLoading: false,
      availableTimeSlots: [],
      timeSlotsMessage: '',
      timeSlotsMessageVariant: 'warning',
      reservationServices: [],
      loadingResServices: false,
      doctorServicesCatalog: [],
      pendingReservationServices: [],
      addServiceModalShow: false,
      savingService: false,
      createServiceForm: {
        doctor_service_id: null,
        service_name: '',
        quantity: 1,
        unit_price: 0,
        with_invoice: true,
        notes: '',
      },
      serviceForm: {
        doctor_service_id: null,
        service_name: '',
        quantity: 1,
        unit_price: 0,
        with_invoice: true,
        notes: '',
      },
      filters: {
        search: '',
        status: '',
        date_from: '',
        date_to: '',
      },
      form: {
        client_id: null,
        doctor_id: null,
        appointment_date_only: '',
        selected_time: null,
        notes: '',
        amount: 0,
        paid: 0,
        payment_method: 'cash',
      },
      editForm: {
        id: null,
        client_id: null,
        doctor_id: null,
        appointment_date: '',
        status: '',
        notes: '',
      },
      fields: [
        { key: 'client.name', label: 'table.client', sortable: true },
        { key: 'doctor.name', label: 'table.doctor', sortable: true },
        { key: 'appointment_date', label: 'table.appointment', formatter: this.formatDateTime, sortable: true },
        { key: 'status', label: 'table.status', sortable: true },
        { key: 'requirements', label: 'reservation.requirements' },
        { key: 'actions', label: 'table.actions' },
      ],
    }
  },
  watch: {
    'form.doctor_id': function (doctorId) {
      this.fetchAvailableTimes()
      this.pendingReservationServices = []
      this.resetCreateServiceForm()
      this.fetchDoctorServicesCatalogForDoctor(doctorId)
    },
    'form.appointment_date_only': function () {
      this.fetchAvailableTimes()
    },
    clientSearch(search) {
      if (this.suppressClientSearchWatch) {
        this.suppressClientSearchWatch = false
        return
      }

      this.clientDropdownOpen = true
      this.form.client_id = null
      this.queueClientSearch(search)
    },
    '$store.state.broadcast.eventCounter'() {
      this.fetchReservations()
    },
  },
  computed: {
    translatedFields() {
      return this.fields.map(field => ({
        ...field,
        label: this.$t(field.label),
      }))
    },
    clientOptions() {
      return this.clients.map(client => ({
        value: client.id,
        text: `${client.name} - ${client.phone}`,
      }))
    },
    filteredClients() {
      return this.clients
    },
    selectedClientDisplay() {
      const c = this.clients.find(cl => cl.id === this.form.client_id)
      return c ? `${c.name} - ${c.phone}` : ''
    },
    doctorOptions() {
      return this.doctors.map(doctor => ({
        value: doctor.id,
        text: doctor.name,
      }))
    },
    statusOptions() {
      return [
        { value: '', text: this.$t('filters.all') + ' ' + this.$t('table.status') },
        { value: 'pending', text: this.$t('reservation.pending') },
        { value: 'confirmed', text: this.$t('reservation.confirmed') },
        { value: 'completed', text: this.$t('reservation.completed') },
        { value: 'cancelled', text: this.$t('reservation.cancelled') },
      ]
    },
    editStatusOptions() {
      const current = this.editForm.status
      const transitions = {
        pending: ['pending', 'confirmed', 'cancelled'],
        confirmed: ['confirmed', 'cancelled'],
        completed: ['completed'],
        cancelled: ['cancelled'],
      }
      const allowed = transitions[current] || [current]
      return allowed.map(s => ({ value: s, text: this.$t('reservation.' + s) }))
    },
    paymentMethodOptions() {
      return [
        { value: 'cash', text: this.$t('financial.cash') },
        { value: 'card', text: this.$t('financial.card') },
        { value: 'transfer', text: this.$t('financial.transfer') },
        { value: 'other', text: this.$t('financial.other') },
      ]
    },
    availableTimeOptions() {
      return this.availableTimeSlots
        .filter(s => !s.booked)
        .map(s => ({
          value: s.time,
          text: s.label,
        }))
    },
    servicesTableFields() {
      return [
        { key: 'service_name', label: this.$t('services.name') },
        { key: 'total_price', label: this.$t('services.priceQty') },
        { key: 'with_invoice', label: this.$t('services.invoice') },
      ]
    },
    createServicesTableFields() {
      return [
        { key: 'service_name', label: this.$t('services.name') },
        { key: 'total_price', label: this.$t('services.priceQty') },
        { key: 'with_invoice', label: this.$t('services.invoice') },
        { key: 'actions', label: this.$t('table.actions') },
      ]
    },
    doctorServiceOptions() {
      const opts = [{ value: null, text: `— ${this.$t('services.customService')} —` }]
      this.doctorServicesCatalog.forEach(s => {
        if (s.is_active) opts.push({ value: s.id, text: `${s.name}${s.name_en ? ' / ' + s.name_en : ''} (${Number(s.price).toFixed(2)})` })
      })
      return opts
    },
    serviceTotal() {
      return Number(this.serviceForm.quantity || 0) * Number(this.serviceForm.unit_price || 0)
    },
    createServiceTotal() {
      return Number(this.createServiceForm.quantity || 0) * Number(this.createServiceForm.unit_price || 0)
    },
    pendingServicesTotal() {
      return this.pendingReservationServices.reduce((sum, s) => sum + Number(s.total_price || 0), 0)
    },
  },
  mounted() {
    if (!this.filters.date_from) {
      this.filters.date_from = this.getTodayDate()
    }
    if (!this.filters.date_to) {
      this.filters.date_to = this.getTodayDate()
    }
    this.fetchReservations()
    this.fetchClients()
    this.fetchDoctors()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    if (this.clientSearchTimer) {
      clearTimeout(this.clientSearchTimer)
    }
  },
  methods: {
    handleClickOutside(e) {
      const el = document.getElementById('client-search')
      if (el && !el.contains(e.target)) {
        this.clientDropdownOpen = false
      }
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async fetchReservations() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.current_page,
        }
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.status) params.status = this.filters.status
        if (this.filters.date_from) params.date_from = this.filters.date_from
        if (this.filters.date_to) params.date_to = this.filters.date_to
        const response = await reservationsService.getReservations(params)
        this.reservations = response.data.data
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        }
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.loadReservationsError'),
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetchReservations()
    },
    resetFilters() {
      this.filters = { search: '', status: '', date_from: '', date_to: '' }
      this.pagination.current_page = 1
      this.fetchReservations()
    },
    onPageChange(page) {
      this.pagination.current_page = page
      this.fetchReservations()
    },
    openClientSearch() {
      this.clientDropdownOpen = true
      if (!this.clients.length) {
        this.fetchClients()
      }
    },
    queueClientSearch(search) {
      if (this.clientSearchTimer) {
        clearTimeout(this.clientSearchTimer)
      }

      this.clientSearchTimer = setTimeout(() => {
        this.fetchClients(search)
      }, 300)
    },
    selectClient(client) {
      if (this.clientSearchTimer) {
        clearTimeout(this.clientSearchTimer)
      }

      this.suppressClientSearchWatch = true
      this.form.client_id = client.id
      this.clientSearch = `${client.name} - ${client.phone}`
      this.clientDropdownOpen = false
    },
    async fetchClients(search = '') {
      this.clientsLoading = true
      try {
        const params = {}
        if (search && search.trim()) {
          params.search = search.trim()
        }

        const response = await clientsService.getClients(params)
        // Handle both paginated and non-paginated responses
        this.clients = Array.isArray(response.data) ? response.data : (response.data.data || [])
      } catch (error) {
        console.error('Failed to load clients', error)
      } finally {
        this.clientsLoading = false
      }
    },
    async fetchDoctors() {
      try {
        const response = await reservationsService.getDoctors()
        this.doctors = response.data
      } catch (error) {
        console.error('Failed to load doctors', error)
      }
    },
    async fetchAvailableTimes() {
      this.form.selected_time = null
      this.availableTimeSlots = []
      this.timeSlotsMessage = ''
      this.timeSlotsMessageVariant = 'warning'
      if (!this.form.doctor_id || !this.form.appointment_date_only) return
      this.availabilityLoading = true
      try {
        const res = await scheduleService.getAvailableTimes(this.form.doctor_id, this.form.appointment_date_only)
        if (res.data.available === false) {
          this.timeSlotsMessage = res.data.message || this.$t('reservation.noAvailabilityOnDate')
          this.timeSlotsMessageVariant = 'warning'
          this.availableTimeSlots = []
        } else {
          const freeSlots = res.data.slots.filter(s => !s.booked)
          this.availableTimeSlots = res.data.slots
          if (freeSlots.length === 0) {
            this.timeSlotsMessage = this.$t('reservation.allTimeSlotsBooked')
            this.timeSlotsMessageVariant = 'danger'
          } else {
            this.timeSlotsMessage = this.$t('reservation.timeSlotsAvailable', { count: freeSlots.length })
            this.timeSlotsMessageVariant = 'success'
          }
        }
      } catch (e) {
        this.timeSlotsMessage = e.response?.data?.message || e.response?.data?.error || this.$t('reservation.failedLoadTimes')
        this.timeSlotsMessageVariant = 'danger'
        this.availableTimeSlots = []
      } finally {
        this.availabilityLoading = false
      }
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    showAddModal() {
      this.form = {
        client_id: null,
        doctor_id: null,
        appointment_date_only: this.getTodayDate(),
        selected_time: null,
        notes: '',
        amount: 0,
        paid: 0,
        payment_method: 'cash',
      }
      this.availableTimeSlots = []
      this.timeSlotsMessage = ''
      this.timeSlotsMessageVariant = 'warning'
      this.clientSearch = ''
      this.clientDropdownOpen = false
      this.doctorServicesCatalog = []
      this.pendingReservationServices = []
      this.resetCreateServiceForm()
      this.modalShow = true
    },
    async fetchDoctorServicesCatalogForDoctor(doctorId) {
      this.doctorServicesCatalog = []
      if (!doctorId) return

      try {
        const { data } = await doctorServicesApi.getAllForDoctor(doctorId)
        this.doctorServicesCatalog = data
      } catch (error) {
        this.doctorServicesCatalog = []
      }
    },
    onCreateCatalogServiceChange(id) {
      if (!id) return
      const svc = this.doctorServicesCatalog.find(s => s.id === id)
      if (svc) {
        this.createServiceForm.service_name = svc.name
        this.createServiceForm.unit_price = svc.price
      }
    },
    addPendingReservationService() {
      if (!this.form.doctor_id || !this.createServiceForm.service_name) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('services.saveError'),
            variant: 'danger',
          },
        })
        return
      }

      const quantity = Number(this.createServiceForm.quantity || 0)
      const unitPrice = Number(this.createServiceForm.unit_price || 0)
      if (quantity < 1 || unitPrice < 0) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('services.saveError'),
            variant: 'danger',
          },
        })
        return
      }

      this.pendingReservationServices.push({
        ...this.createServiceForm,
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
      })
      this.resetCreateServiceForm()
    },
    removePendingReservationService(index) {
      this.pendingReservationServices.splice(index, 1)
    },
    resetCreateServiceForm() {
      this.createServiceForm = {
        doctor_service_id: null,
        service_name: '',
        quantity: 1,
        unit_price: 0,
        with_invoice: true,
        notes: '',
      }
    },
    showEditModal(reservation) {
      this.selectedReservation = reservation
      this.editForm = {
        id: reservation.id,
        client_id: reservation.client?.id || reservation.client_id,
        doctor_id: reservation.doctor?.id || reservation.doctor_id,
        appointment_date: reservation.appointment_date && reservation.appointment_date.substring(0, 16),
        status: reservation.status,
        notes: reservation.notes || '',
      }
      this.editModalShow = true
    },
    async viewReservation(reservation) {
      try {
        const response = await reservationsService.getReservation(reservation.id)
        this.selectedReservation = response.data
      } catch (error) {
        this.selectedReservation = reservation
      }
      this.viewModalShow = true
      this.fetchReservationServices(reservation.id)
      this.fetchDoctorServicesCatalog()
    },
    async fetchReservationServices(reservationId) {
      this.loadingResServices = true
      try {
        const { data } = await doctorServicesApi.getReservationServices(reservationId)
        this.reservationServices = data
      } catch (error) {
        this.reservationServices = []
      } finally {
        this.loadingResServices = false
      }
    },
    async openAddServiceModal() {
      if (!this.selectedReservation || this.selectedReservation.status === 'completed' || this.selectedReservation.status === 'cancelled') {
        return
      }

      this.resetServiceForm()
      if (this.selectedReservation && this.selectedReservation.id) {
        await this.fetchDoctorServicesCatalog()
      }
      this.addServiceModalShow = true
    },
    onCatalogServiceChange(id) {
      if (!id) return
      const svc = this.doctorServicesCatalog.find(s => s.id === id)
      if (svc) {
        this.serviceForm.service_name = svc.name
        this.serviceForm.unit_price = svc.price
      }
    },
    async fetchDoctorServicesCatalog() {
      try {
        if (this.selectedReservation && this.selectedReservation.id) {
          const { data } = await doctorServicesApi.getAllForReservation(this.selectedReservation.id)
          this.doctorServicesCatalog = data
        }
      } catch { /* silent */ }
    },
    async saveReservationService() {
      this.savingService = true
      try {
        const reservationId = this.selectedReservation.id
        const { data } = await doctorServicesApi.addToReservation(reservationId, {
          ...this.serviceForm,
          quantity: Number(this.serviceForm.quantity),
          unit_price: Number(this.serviceForm.unit_price),
        })
        this.reservationServices.push(data)
        this.addServiceModalShow = false
        this.resetServiceForm()
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('services.serviceAdded'),
            variant: 'success',
          },
        })
      } catch (error) {
        const errors = error.response?.data?.errors
        const text = errors ? Object.values(errors).flat().join('\n') : (error.response?.data?.message || this.$t('services.saveError'))
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text,
            variant: 'danger',
          },
        })
      } finally {
        this.savingService = false
      }
    },
    resetServiceForm() {
      this.serviceForm = {
        doctor_service_id: null,
        service_name: '',
        quantity: 1,
        unit_price: 0,
        with_invoice: true,
        notes: '',
      }
    },
    async downloadCompletionFile(file) {
      try {
        const response = await reservationsService.downloadArchiveFile(file.id)
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.file_name || `file_${file.id}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.downloadFileError'),
            variant: 'danger',
          },
        })
      }
    },
    async updateSelectedReservation() {
      this.updating = true
      try {
        const payload = {
          client_id: this.editForm.client_id,
          doctor_id: this.editForm.doctor_id,
          appointment_date: this.editForm.appointment_date,
          status: this.editForm.status || 'pending',
          notes: this.editForm.notes,
        }
        await reservationsService.updateReservation(this.editForm.id, payload)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.reservationUpdated'),
            variant: 'success',
          },
        })
        this.editModalShow = false
        this.fetchReservations()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || this.$t('messages.updateReservationError'),
            variant: 'danger',
          },
        })
      } finally {
        this.updating = false
      }
    },
    async saveReservation() {
      this.saving = true
      try {
        const payload = {
          ...this.form,
          appointment_date: `${this.form.appointment_date_only} ${this.form.selected_time}`,
        }
        delete payload.appointment_date_only
        delete payload.selected_time
        const res = await reservationsService.createReservation(payload)
        let serviceSaveFailed = false
        if (this.pendingReservationServices.length) {
          try {
            await Promise.all(this.pendingReservationServices.map(service => doctorServicesApi.addToReservation(res.data.id, {
              doctor_service_id: service.doctor_service_id,
              service_name: service.service_name,
              quantity: Number(service.quantity),
              unit_price: Number(service.unit_price),
              with_invoice: service.with_invoice,
              notes: service.notes,
            })))
          } catch (serviceError) {
            serviceSaveFailed = true
          }
        }
        const queuePosition = res.data.queue_position || '?'
        const reservationsBefore = res.data.reservations_before || 0
        this.modalShow = false
        this.pendingReservationServices = []
        this.resetCreateServiceForm()
        this.fetchReservations()
        this.$swal({
          icon: 'success',
          title: this.$t('messages.reservationCreated'),
          html: `<div style="font-size:1.1em">
            <p><strong>${this.$t('reservation.queuePosition')}:</strong> #${queuePosition}</p>
            <p><strong>${this.$t('reservation.reservationsBefore')}:</strong> ${reservationsBefore}</p>
          </div>`,
          confirmButtonText: this.$t('actions.ok'),
          customClass: {
            confirmButton: 'btn btn-success',
          },
          buttonsStyling: false,
        })
        if (serviceSaveFailed) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('messages.error'),
              text: this.$t('services.saveError'),
              variant: 'warning',
            },
          })
        }
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || error.response?.data?.error || this.$t('messages.saveReservationError'),
            variant: 'danger',
          },
        })
      } finally {
        this.saving = false
      }
    },
    async checkInPatient(reservation) {
      const result = await this.$swal({
        title: this.$t('queue.checkInConfirm', { name: reservation.client?.name || '' }),
        text: this.$t('queue.checkInConfirmText'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.$t('queue.checkIn'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return

      try {
        const response = await reservationsService.checkIn(reservation.id)
        const waitingNumber = response.data.waiting_number
        this.$swal({
          icon: 'success',
          title: this.$t('queue.checkInSuccess'),
          html: `<div style="font-size:1.5em; margin:10px 0"><strong>${this.$t('queue.waitingNumber')}: <span class="text-primary">#${waitingNumber}</span></strong></div>`,
          confirmButtonText: this.$t('actions.ok'),
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false,
        })
        this.fetchReservations()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.error || this.$t('queue.checkInError'),
            variant: 'danger',
          },
        })
      }
    },
    async confirmReservation(reservation) {
      const result = await this.$swal({
        title: this.$t('messages.confirmReservationTitle'),
        text: this.$t('messages.confirmReservationText', { client: reservation.client?.name || '' }),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.confirm'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return

      try {
        await reservationsService.confirmReservation(reservation.id)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.reservationConfirmed'),
            variant: 'success',
          },
        })
        this.fetchReservations()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || error.response?.data?.error || this.$t('messages.confirmReservationError'),
            variant: 'danger',
          },
        })
      }
    },
    async completeReservation(reservation) {
      const result = await this.$swal({
        title: this.$t('reservation.completeReservation'),
        text: this.$t('messages.completeReservationConfirm', { client: reservation.client?.name || '' }),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.$t('reservation.completeReservation'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return

      try {
        await reservationsService.completeReservation(reservation.id, {})
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.reservationCompleted'),
            variant: 'success',
          },
        })
        this.fetchReservations()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || error.response?.data?.error || this.$t('messages.completeReservationError'),
            variant: 'danger',
          },
        })
      }
    },
    async cancelReservation(reservation) {
      const result = await this.$swal({
        title: this.$t('messages.cancelReservationConfirm'),
        text: this.$t('messages.cancelReservationWarning', { client: reservation.client?.name || '' }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.confirm'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return

      try {
        const payload = {
          client_id: reservation.client?.id || reservation.client_id,
          doctor_id: reservation.doctor?.id || reservation.doctor_id,
          appointment_date: reservation.appointment_date,
          status: 'cancelled',
          notes: reservation.notes,
        }
        await reservationsService.updateReservation(reservation.id, payload)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.reservationCancelled'),
            variant: 'success',
          },
        })
        this.fetchReservations()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.cancelReservationError'),
            variant: 'danger',
          },
        })
      }
    },
    async printPrescription(reservation) {
      await this.printReservationPdf(
        () => reservationsService.generatePrescription(reservation.id),
        `prescription_${reservation.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        this.$t('messages.prescriptionDownloaded'),
        this.$t('messages.generatePrescriptionError')
      )
    },
    async printMedicinesPrescription(reservation) {
      await this.printReservationPdf(
        () => reservationsService.generateMedicinesPrescription(reservation.id),
        `medicines_prescription_${reservation.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        this.$t('messages.prescriptionDownloaded'),
        this.$t('messages.generatePrescriptionError')
      )
    },
    async printReservationDetails(reservation) {
      await this.printReservationPdf(
        () => reservationsService.generateReservationDetailsPdf(reservation.id),
        `reservation_details_${reservation.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        this.$t('messages.reservationDetailsDownloaded'),
        this.$t('messages.generateReservationDetailsError')
      )
    },
    async printReservationPdf(requestPdf, filename, successText, errorText) {
      try {
        const response = await requestPdf()
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: successText,
            variant: 'success',
          },
        })
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || errorText,
            variant: 'danger',
          },
        })
      }
    },
    getStatusVariant(status) {
      const variants = {
        pending: 'warning',
        confirmed: 'info',
        completed: 'success',
        cancelled: 'danger',
      }
      return variants[status] || 'secondary'
    },
    getReservationLogLabel(action) {
      const key = `reservation.log_${action}`
      const translated = this.$t(key)
      return translated === key ? action : translated
    },
    getReservationLogVariant(action) {
      const variants = {
        created: 'light-primary',
        updated: 'light-warning',
        status_changed: 'light-warning',
        confirmed: 'light-info',
        completed: 'light-success',
        checked_in: 'light-success',
        check_in_undone: 'light-secondary',
        service_added: 'light-primary',
        service_updated: 'light-warning',
        service_deleted: 'light-danger',
      }
      return variants[action] || 'light-secondary'
    },
    getReservationLogDescription(log) {
      const label = this.getReservationLogLabel(log.action)
      const meta = log.meta || {}
      if (meta.service_name) return `${label}: ${meta.service_name}`
      if (meta.waiting_number) return `${label}: #${meta.waiting_number}`
      return label
    },
    formatClientChronicIllnesses(values) {
      return formatChronicIllnesses(values, key => this.$t(key), this.$t('reservation.na'))
    },
    calculateAge(value) {
      return formatAgeFromBirthDate(value, key => this.$t(key), this.$t('reservation.na'))
    },
    formatDateTime(value) {
      if (!value) return 'N/A'
      // Parse as local time since backend returns Y-m-d H:i:s format
      const date = new Date(value + (value.includes(' ') ? '' : ''))
      return date.toLocaleString()
    },
    paginationCountText(paginationState) {
      if (!paginationState?.total) return '0 / 0'
      const from = ((paginationState.current_page - 1) * paginationState.per_page) + 1
      const to = Math.min(paginationState.current_page * paginationState.per_page, paginationState.total)
      return `${from}-${to} / ${paginationState.total}`
    },
  },
}
</script>

<style scoped>
.client-search-dropdown {
  position: absolute;
  z-index: 1050;
  width: calc(100% - 2rem);
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #d8d6de;
  border-radius: 0.357rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 2px;
}
.client-search-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}
.client-search-item:hover {
  background-color: #f8f8f8;
}
</style>


