<template>
  <div>
    <b-card>
      <b-row class="mb-2">
        <b-col cols="12" md="4">
          <h4>{{ $t('reservation.myReservations') }}</h4>
        </b-col>
      </b-row>

      <b-form @submit.prevent="applyFilters" class="mb-2">
        <b-row>
          <b-col cols="12" md="4" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.search" :placeholder="$t('reservation.searchByClientOrNotes')" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-select v-model="filters.status" :options="statusOptions" />
          </b-col>
          <b-col cols="6" md="2" class="mb-1 mb-md-0">
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
        :fields="fields"
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
            v-if="data.item.status !== 'completed' && data.item.status !== 'cancelled'"
            variant="success"
            size="sm"
            class="mr-1"
            @click="showCompleteModal(data.item)"
          >
            <feather-icon icon="CheckIcon" class="mr-50" />
            {{ $t('reservation.completeReservation') }}
          </b-button>
          <b-button
            v-if="data.item.status === 'completed' && data.item.treatment"
            v-b-tooltip.hover
            :title="$t('reservation.printMedicinesPrescription')"
            variant="primary"
            size="sm"
            @click="printMedicinesPrescription(data.item)"
          >
            <feather-icon icon="PrinterIcon" class="mr-50" />
            {{ $t('reservation.printMedicinesPrescription') }}
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

    <!-- Complete Modal -->
    <b-modal
      v-model="completeModalShow"
      :title="$t('reservation.completeReservation')"
      hide-footer
      size="lg"
    >
      <b-form @submit.prevent="completeReservation">
        <b-alert variant="info" show>
          <div v-if="selectedReservation && selectedReservation.client">
            <p class="mb-25"><strong>{{ $t('reservation.client') }}:</strong> {{ selectedReservation.client.name }}</p>
            <p class="mb-25"><strong>{{ $t('reservation.clientPhone') }}:</strong> {{ selectedReservation.client.phone }}</p>
            <p class="mb-25"><strong>{{ $t('client.whatsappNumber') }}:</strong> {{ selectedReservation.client.whatsapp_number || $t('reservation.na') }}</p>
            <p class="mb-25" v-if="selectedReservation.client.date_of_birth"><strong>{{ $t('client.dateOfBirth') }}:</strong> {{ formatDate(selectedReservation.client.date_of_birth) }}</p>
            <p class="mb-25"><strong>{{ $t('client.age') }}:</strong> {{ calculateAge(selectedReservation.client.date_of_birth) }}</p>
            <p class="mb-25"><strong>{{ $t('client.address') }}:</strong> {{ selectedReservation.client.address || $t('reservation.na') }}</p>
            <p class="mb-25"><strong>{{ $t('client.job') }}:</strong> {{ selectedReservation.client.job || $t('reservation.na') }}</p>
            <p class="mb-25" v-if="selectedReservation.client.height"><strong>{{ $t('client.height') }}:</strong> {{ selectedReservation.client.height }} cm</p>
            <p class="mb-25" v-if="selectedReservation.client.weight"><strong>{{ $t('client.weight') }}:</strong> {{ selectedReservation.client.weight }} kg</p>
            <p class="mb-25"><strong>{{ $t('client.chronicIllnesses') }}:</strong> {{ formatClientChronicIllnesses(selectedReservation.client.chronic_illnesses) }}</p>
            <p class="mb-0" v-if="selectedReservation.client.medical_history"><strong>{{ $t('client.medicalHistory') }}:</strong> {{ selectedReservation.client.medical_history }}</p>
          </div>
          <p v-if="selectedReservation" class="mb-0 mt-50"><strong>{{ $t('reservation.appointment') }}:</strong> {{ formatDateTime(selectedReservation.appointment_date) }}</p>
        </b-alert>

        <b-form-group :label="$t('reservation.diagnosis')" label-for="diagnosis">
          <b-form-textarea
            id="diagnosis"
            v-model="completeForm.diagnosis"
            rows="4"
            :placeholder="$t('reservation.enterDiagnosis')"
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.currentProcedures')" label-for="current-procedures">
          <b-form-textarea
            id="current-procedures"
            v-model="completeForm.current_procedures"
            rows="3"
            :placeholder="$t('reservation.enterCurrentProcedures')"
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.procedureNotes')" label-for="procedure-notes">
          <b-form-textarea
            id="procedure-notes"
            v-model="completeForm.procedure_notes"
            rows="3"
            :placeholder="$t('reservation.enterProcedureNotes')"
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.nextProcedures')" label-for="next-procedures">
          <b-form-textarea
            id="next-procedures"
            v-model="completeForm.next_procedures"
            rows="3"
            :placeholder="$t('reservation.enterNextProcedures')"
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.treatment')" label-for="treatment">
          <b-form-textarea
            id="treatment"
            v-model="completeForm.treatment"
            rows="4"
            :placeholder="$t('reservation.enterTreatment')"
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.completionFiles')" label-for="completion-files">
          <b-form-file
            id="completion-files"
            v-model="completionFiles"
            multiple
            :placeholder="$t('reservation.selectCompletionFiles')"
            :browse-text="$t('actions.add')"
          />
          <small v-if="completionFiles.length" class="text-muted d-block mt-50">
            {{ completionFiles.map(file => file.name).join(', ') }}
          </small>
        </b-form-group>

        <!-- Drug Search with Tabs -->
        <b-card class="mb-2">
          <b-tabs v-model="drugTabIndex" content-class="mt-1" fill>
            <!-- Egypt Drugs Tab -->
            <b-tab :title="$t('openfda.egyptDrugs')" active>
              <b-row class="mb-1">
                <b-col cols="12" md="5">
                  <b-form-input
                    v-model="egyptDrugQuery"
                    :placeholder="$t('openfda.egyptSearchPlaceholder')"
                    @keyup.enter="searchEgyptDrugs"
                    :disabled="egyptSearching"
                    size="sm"
                  />
                </b-col>
                <b-col cols="6" md="3">
                  <b-form-select
                    v-model="egyptCategoryFilter"
                    :options="egyptCategoryOptions"
                    size="sm"
                  />
                </b-col>
                <b-col cols="6" md="3">
                  <b-form-select
                    v-model="egyptFormFilter"
                    :options="egyptFormOptions"
                    size="sm"
                  />
                </b-col>
                <b-col cols="12" md="1">
                  <b-button variant="primary" size="sm" block @click="searchEgyptDrugs" :disabled="egyptSearching || !egyptDrugQuery">
                    <b-spinner v-if="egyptSearching" small />
                    <feather-icon v-else icon="SearchIcon" />
                  </b-button>
                </b-col>
              </b-row>

              <div v-if="egyptResults.length > 0">
                <small class="text-muted d-block mb-1">{{ $t('openfda.resultsFound', { count: egyptResultsTotal }) }}</small>
                <div class="drug-results-scroll">
                  <div
                    v-for="(drug, index) in egyptResults"
                    :key="'eg-' + index"
                    class="border rounded p-1 mb-1"
                    style="cursor: pointer;"
                    :class="{ 'border-success bg-light': selectedEgyptDrug === drug }"
                    @click="selectedEgyptDrug = selectedEgyptDrug === drug ? null : drug"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ drug.name }}</strong>
                        <div class="d-flex flex-wrap mt-25">
                          <b-badge v-if="drug.form" variant="light-info" class="mr-50 mb-25">{{ drug.form }}</b-badge>
                          <b-badge v-if="drug.category" variant="light-primary" class="mr-50 mb-25">{{ drug.category }}</b-badge>
                        </div>
                        <small v-if="drug.company" class="text-muted d-block">{{ drug.company }}</small>
                      </div>
                      <b-button
                        size="sm"
                        variant="outline-success"
                        @click.stop="appendEgyptDrugToTreatment(drug)"
                      >
                        <feather-icon icon="PlusIcon" size="14" />
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>

              <b-alert v-if="egyptSearched && egyptResults.length === 0" variant="warning" show class="mb-0 mt-1">
                {{ $t('openfda.noResults') }}
              </b-alert>
            </b-tab>

            <!-- OpenFDA International Tab -->
            <b-tab :title="$t('openfda.fdaDrugs')">
              <b-input-group class="mb-1">
                <b-form-input
                  v-model="drugSearchQuery"
                  :placeholder="$t('openfda.searchPlaceholder')"
                  @keyup.enter="searchDrugs"
                  :disabled="drugSearching"
                  size="sm"
                />
                <b-input-group-append>
                  <b-button variant="outline-primary" size="sm" @click="searchDrugs" :disabled="drugSearching || !drugSearchQuery">
                    <b-spinner v-if="drugSearching" small />
                    <feather-icon v-else icon="SearchIcon" />
                  </b-button>
                </b-input-group-append>
              </b-input-group>

              <div v-if="drugResults.length > 0">
                <small class="text-muted d-block mb-1">{{ $t('openfda.resultsFound', { count: drugResultsTotal }) }}</small>
                <div class="drug-results-scroll">
                  <div
                    v-for="(drug, index) in drugResults"
                    :key="'fda-' + index"
                    class="border rounded p-1 mb-1"
                    :class="{ 'border-primary bg-light': selectedDrug === drug }"
                    @click="selectDrug(drug)"
                    style="cursor: pointer;"
                  >
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{{ drug.brand_name || drug.generic_name }}</strong>
                        <small v-if="drug.generic_name && drug.brand_name" class="text-muted d-block">
                          {{ $t('openfda.genericName') }}: {{ drug.generic_name }}
                        </small>
                        <small v-if="drug.manufacturer" class="text-muted d-block">
                          {{ $t('openfda.manufacturer') }}: {{ drug.manufacturer }}
                        </small>
                        <small v-if="drug.dosage_form" class="text-muted d-block">
                          {{ $t('openfda.dosageForm') }}: {{ drug.dosage_form }}
                        </small>
                        <small v-if="drug.route" class="text-muted d-block">
                          {{ $t('openfda.route') }}: {{ drug.route }}
                        </small>
                      </div>
                      <div>
                        <b-button
                          size="sm"
                          variant="outline-info"
                          class="mr-50"
                          @click.stop="showDrugDetails(drug)"
                        >
                          <feather-icon icon="InfoIcon" size="14" />
                        </b-button>
                        <b-button
                          size="sm"
                          variant="outline-success"
                          @click.stop="appendDrugToTreatment(drug)"
                        >
                          <feather-icon icon="PlusIcon" size="14" />
                        </b-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <b-alert v-if="drugSearched && drugResults.length === 0" variant="warning" show class="mb-0">
                {{ $t('openfda.noResults') }}
              </b-alert>
            </b-tab>
          </b-tabs>
        </b-card>

        <!-- Drug Details Modal -->
        <b-modal
          v-model="drugDetailModalShow"
          :title="drugDetailData ? (drugDetailData.brand_name || drugDetailData.generic_name) : ''"
          ok-only
          size="lg"
          scrollable
        >
          <div v-if="drugDetailLoading" class="text-center my-3">
            <b-spinner />
          </div>
          <div v-else-if="drugDetailData">
            <b-row>
              <b-col cols="12" md="6">
                <p v-if="drugDetailData.brand_name"><strong>{{ $t('openfda.brandName') }}:</strong> {{ drugDetailData.brand_name }}</p>
                <p v-if="drugDetailData.generic_name"><strong>{{ $t('openfda.genericName') }}:</strong> {{ drugDetailData.generic_name }}</p>
                <p v-if="drugDetailData.manufacturer"><strong>{{ $t('openfda.manufacturer') }}:</strong> {{ drugDetailData.manufacturer }}</p>
                <p v-if="drugDetailData.dosage_form"><strong>{{ $t('openfda.dosageForm') }}:</strong> {{ drugDetailData.dosage_form }}</p>
              </b-col>
              <b-col cols="12" md="6">
                <p v-if="drugDetailData.route"><strong>{{ $t('openfda.route') }}:</strong> {{ drugDetailData.route }}</p>
                <p v-if="drugDetailData.substance_name"><strong>{{ $t('openfda.substanceName') }}:</strong> {{ drugDetailData.substance_name }}</p>
                <p v-if="drugDetailData.product_type"><strong>{{ $t('openfda.productType') }}:</strong> {{ drugDetailData.product_type }}</p>
              </b-col>
            </b-row>

            <div v-if="drugDetailData.indications">
              <hr>
              <h6>{{ $t('openfda.indications') }}</h6>
              <p class="small">{{ truncateText(drugDetailData.indications, 800) }}</p>
            </div>

            <div v-if="drugDetailData.dosage">
              <hr>
              <h6>{{ $t('openfda.dosage') }}</h6>
              <p class="small">{{ truncateText(drugDetailData.dosage, 800) }}</p>
            </div>

            <div v-if="drugDetailData.warnings">
              <hr>
              <h6 class="text-danger">{{ $t('openfda.warnings') }}</h6>
              <p class="small text-danger">{{ truncateText(drugDetailData.warnings, 800) }}</p>
            </div>

            <div v-if="drugDetailData.adverse_reactions">
              <hr>
              <h6 class="text-warning">{{ $t('openfda.adverseReactions') }}</h6>
              <p class="small">{{ truncateText(drugDetailData.adverse_reactions, 600) }}</p>
            </div>

            <div v-if="drugDetailData.drug_interactions">
              <hr>
              <h6>{{ $t('openfda.drugInteractions') }}</h6>
              <p class="small">{{ truncateText(drugDetailData.drug_interactions, 600) }}</p>
            </div>

            <div v-if="drugDetailData.contraindications">
              <hr>
              <h6 class="text-danger">{{ $t('openfda.contraindications') }}</h6>
              <p class="small">{{ truncateText(drugDetailData.contraindications, 600) }}</p>
            </div>
          </div>

          <template #modal-footer="{ ok }">
            <b-button variant="success" class="mr-1" @click="appendDrugToTreatment(drugDetailData); ok()">
              <feather-icon icon="PlusIcon" size="14" class="mr-50" />
              {{ $t('openfda.addToTreatment') }}
            </b-button>
            <b-button variant="secondary" @click="ok()">
              {{ $t('actions.close') }}
            </b-button>
          </template>
        </b-modal>

        <hr>
        <h6>{{ $t('reservation.additionalRequirements') }}</h6>

        <b-form-checkbox
          v-model="completeForm.requires_xray"
          switch
          class="mb-1"
        >
          {{ $t('reservation.requiresXray') }}
        </b-form-checkbox>
        <b-form-group
          v-if="completeForm.requires_xray"
          :label="$t('reservation.xrayNotes')"
          label-for="xray-notes"
        >
          <b-form-textarea
            id="xray-notes"
            v-model="completeForm.xray_notes"
            rows="2"
            :placeholder="$t('reservation.enterXrayNotes')"
          />
        </b-form-group>

        <b-form-checkbox
          v-model="completeForm.requires_lab"
          switch
          class="mb-1"
        >
          {{ $t('reservation.requiresLab') }}
        </b-form-checkbox>
        <b-form-group
          v-if="completeForm.requires_lab"
          :label="$t('reservation.labNotes')"
          label-for="lab-notes"
        >
          <b-form-textarea
            id="lab-notes"
            v-model="completeForm.lab_notes"
            rows="2"
            :placeholder="$t('reservation.enterLabNotes')"
          />
        </b-form-group>

        <div class="text-right">
          <b-button variant="secondary" class="mr-1" @click="completeModalShow = false">
            {{ $t('actions.cancel') }}
          </b-button>
          <b-button type="submit" variant="success" :disabled="completing">
            <b-spinner v-if="completing" small class="mr-1" />
            {{ $t('reservation.completeReservation') }}
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
            variant="success"
            size="sm"
            class="mr-1 mb-50"
            @click="openFutureReservationModal"
          >
            <feather-icon icon="CalendarIcon" class="mr-50" />
            {{ $t('reservation.createFutureReservation') }}
          </b-button>
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

        <!-- Client Details Card -->
        <b-card v-if="selectedReservation.client" class="mb-2" no-body>
          <b-card-header class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ $t('client.clientDetails') }}</h6>
            <b-button size="sm" variant="outline-primary" @click="openEditClientModal(selectedReservation.client)">
              <feather-icon icon="EditIcon" size="14" class="mr-25" />
              {{ $t('client.editClient') }}
            </b-button>
          </b-card-header>
          <b-card-body>
            <b-row>
              <b-col cols="12" md="6">
                <p class="mb-50"><strong>{{ $t('client.name') }}:</strong> {{ selectedReservation.client.name }}</p>
                <p class="mb-50"><strong>{{ $t('reservation.clientEmail') }}:</strong> {{ selectedReservation.client.email }}</p>
                <p class="mb-50"><strong>{{ $t('reservation.clientPhone') }}:</strong> {{ selectedReservation.client.phone }}</p>
                <p class="mb-50"><strong>{{ $t('client.whatsappNumber') }}:</strong> {{ selectedReservation.client.whatsapp_number || $t('reservation.na') }}</p>
                <p class="mb-50"><strong>{{ $t('client.dateOfBirth') }}:</strong> {{ formatDate(selectedReservation.client.date_of_birth) || $t('reservation.na') }}</p>
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
              <b-alert variant="warning" show class="mb-0">
                {{ selectedReservation.client.medical_history }}
              </b-alert>
            </div>
          </b-card-body>
        </b-card>

        <b-row>
          <b-col cols="12" md="6">
            <p><strong>{{ $t('reservation.status') }}:</strong> 
              <b-badge :variant="getStatusVariant(selectedReservation.status)">
                {{ selectedReservation.status }}
              </b-badge>
            </p>
          </b-col>
          <b-col cols="12" md="6">
            <p><strong>{{ $t('reservation.appointment') }}:</strong> {{ formatDateTime(selectedReservation.appointment_date) }}</p>
            <p><strong>{{ $t('reservation.created') }}:</strong> {{ formatDateTime(selectedReservation.created_at) }}</p>
            <p v-if="selectedReservation.completed_at">
              <strong>{{ $t('reservation.completedAt') }}:</strong> {{ formatDateTime(selectedReservation.completed_at) }}
            </p>
          </b-col>
        </b-row>
        <hr>
        <p><strong>{{ $t('reservation.notes') }}:</strong></p>
        <p>{{ selectedReservation.notes || $t('reservation.na') }}</p>

        <div v-if="selectedReservation.diagnosis">
          <hr>
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

          <!-- Image previews -->
          <div v-if="imageFiles.length" class="d-flex flex-wrap mb-1">
            <div
              v-for="file in imageFiles"
              :key="file.id"
              class="mr-1 mb-1 position-relative"
              style="cursor: pointer;"
              @click="openImagePreview(file)"
            >
              <img
                v-if="filePreviewUrls[file.id]"
                :src="filePreviewUrls[file.id]"
                :alt="file.file_name"
                class="rounded border"
                style="width: 120px; height: 120px; object-fit: cover;"
              >
              <div v-else class="rounded border d-flex align-items-center justify-content-center bg-light" style="width: 120px; height: 120px;">
                <b-spinner small />
              </div>
              <small class="d-block text-center text-truncate mt-25" style="max-width: 120px;">{{ file.file_name }}</small>
            </div>
          </div>

          <!-- Non-image files (download) -->
          <div v-if="nonImageFiles.length" class="d-flex flex-column">
            <b-button
              v-for="file in nonImageFiles"
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

        <!-- Image preview modal -->
        <b-modal
          v-model="imagePreviewModalShow"
          :title="previewImageName"
          size="xl"
          centered
          hide-footer
          body-class="text-center p-0"
        >
          <img
            v-if="previewImageUrl"
            :src="previewImageUrl"
            :alt="previewImageName"
            class="img-fluid"
            style="max-height: 80vh;"
          >
        </b-modal>

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

        <!-- Additional Services -->
        <hr>
        <div class="d-flex justify-content-between align-items-center mb-1">
          <h6 class="mb-0">{{ $t('services.additionalServices') }}</h6>
          <b-button
            v-if="selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled'"
            v-permission="['reservation-services.create','doctor.create-reservation-services','assistant.create-reservation-services']"
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
          <template #cell(actions)="data">
            <b-button v-permission="['reservation-services.delete','doctor.delete-reservation-services','assistant.delete-reservation-services']" size="sm" variant="flat-danger" class="btn-icon" @click="deleteReservationService(data.item)">
              <feather-icon icon="TrashIcon" size="14" />
            </b-button>
          </template>
        </b-table>

        <div v-if="reservationServices.length" class="text-right mt-50">
          <strong>{{ $t('services.totalServices') }}:
            {{ reservationServices.reduce((sum, s) => sum + Number(s.total_price), 0).toFixed(2) }}
          </strong>
        </div>
      </div>
    </b-modal>

    <!-- Add Service to Reservation Modal -->
    <b-modal
      v-model="addServiceModalShow"
      :title="$t('services.addService')"
      no-close-on-backdrop
      @hidden="resetServiceForm"
    >
      <b-form @submit.prevent="saveReservationService">
        <b-form-group :label="$t('services.selectFromCatalog')" label-for="svc-catalog">
          <b-form-select
            id="svc-catalog"
            v-model="serviceForm.doctor_service_id"
            :options="doctorServiceOptions"
            @change="onCatalogServiceChange"
          />
        </b-form-group>

        <b-form-group :label="$t('services.name')" label-for="svc-rname">
          <b-form-input id="svc-rname" v-model="serviceForm.service_name" required />
        </b-form-group>

        <b-row>
          <b-col cols="6">
            <b-form-group :label="$t('services.price')" label-for="svc-uprice">
              <b-form-input id="svc-uprice" v-model="serviceForm.unit_price" type="number" step="0.01" min="0" required />
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group :label="$t('services.quantity')" label-for="svc-qty">
              <b-form-input id="svc-qty" v-model="serviceForm.quantity" type="number" min="1" required />
            </b-form-group>
          </b-col>
        </b-row>

        <div class="mb-1 p-1 bg-light rounded text-center">
          <strong>{{ $t('services.total') }}: {{ (Number(serviceForm.unit_price) * Number(serviceForm.quantity)).toFixed(2) }}</strong>
        </div>

        <b-form-group :label="$t('services.invoiceOption')" label-for="svc-invoice">
          <div class="d-flex">
            <b-form-radio v-model="serviceForm.with_invoice" :value="true" class="mr-2">
              {{ $t('services.withInvoice') }}
            </b-form-radio>
            <b-form-radio v-model="serviceForm.with_invoice" :value="false">
              {{ $t('services.noInvoice') }}
            </b-form-radio>
          </div>
        </b-form-group>

        <b-form-group :label="$t('services.notes')" label-for="svc-notes">
          <b-form-input id="svc-notes" v-model="serviceForm.notes" :placeholder="$t('services.notesPlaceholder')" />
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

    <b-modal
      v-model="futureReservationModalShow"
      :title="$t('reservation.futureReservation')"
      no-close-on-backdrop
      @hidden="resetFutureReservationForm"
    >
      <b-form @submit.prevent="saveFutureReservation">
        <b-alert v-if="selectedReservation && selectedReservation.client" variant="info" show>
          <p class="mb-25"><strong>{{ $t('reservation.client') }}:</strong> {{ selectedReservation.client.name }}</p>
          <p class="mb-0"><strong>{{ $t('reservation.doctor') }}:</strong> {{ selectedReservation.doctor ? selectedReservation.doctor.name : $t('reservation.na') }}</p>
        </b-alert>

        <b-form-group :label="$t('reservation.futureAppointmentDate')" label-for="future-appointment-date">
          <b-form-input
            id="future-appointment-date"
            v-model="futureReservationForm.appointment_date"
            type="datetime-local"
            :min="getDatetimeLocalMin()"
            required
          />
        </b-form-group>

        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('financial.amount')" label-for="future-amount">
              <b-form-input id="future-amount" v-model.number="futureReservationForm.amount" type="number" step="0.01" min="0" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('financial.paid')" label-for="future-paid">
              <b-form-input id="future-paid" v-model.number="futureReservationForm.paid" type="number" step="0.01" min="0" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group :label="$t('financial.paymentMethod')" label-for="future-payment-method">
          <b-form-select
            id="future-payment-method"
            v-model="futureReservationForm.payment_method"
            :options="paymentMethodOptions"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.notes')" label-for="future-notes">
          <b-form-textarea
            id="future-notes"
            v-model="futureReservationForm.notes"
            rows="3"
            :placeholder="$t('reservation.notes')"
          />
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="futureReservationModalShow = false">
          {{ $t('actions.cancel') }}
        </b-button>
        <b-button variant="primary" :disabled="savingFutureReservation" @click="saveFutureReservation">
          <b-spinner v-if="savingFutureReservation" small class="mr-50" />
          {{ $t('reservation.createFutureReservation') }}
        </b-button>
      </template>
    </b-modal>

    <b-modal
      v-model="editClientModalShow"
      :title="$t('client.editClient')"
      hide-footer
      size="lg"
    >
      <b-form @submit.prevent="saveClientData">
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.name')" label-for="client-name">
              <b-form-input id="client-name" v-model="clientForm.name" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group label="Email" label-for="client-email">
              <b-form-input id="client-email" v-model="clientForm.email" type="email" required />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.phone')" label-for="client-phone">
              <b-form-input id="client-phone" v-model="clientForm.phone" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.whatsappNumber')" label-for="client-whatsapp-number">
              <b-form-input id="client-whatsapp-number" v-model="clientForm.whatsapp_number" :placeholder="$t('client.whatsappPlaceholder')" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.dateOfBirth')" label-for="client-dob">
              <b-form-input id="client-dob" v-model="clientForm.date_of_birth" type="date" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" />
        </b-row>
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.height')" label-for="client-height">
              <b-form-input id="client-height" v-model="clientForm.height" type="number" step="0.01" min="0" max="300" :placeholder="$t('client.heightPlaceholder')" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.weight')" label-for="client-weight">
              <b-form-input id="client-weight" v-model="clientForm.weight" type="number" step="0.01" min="0" max="500" :placeholder="$t('client.weightPlaceholder')" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-form-group :label="$t('client.address')" label-for="client-address">
          <b-form-textarea id="client-address" v-model="clientForm.address" rows="2" />
        </b-form-group>
        <b-form-group :label="$t('client.job')" label-for="client-job">
          <b-form-input id="client-job" v-model="clientForm.job" :placeholder="$t('client.jobPlaceholder')" />
        </b-form-group>
        <b-form-group :label="$t('client.medicalHistory')" label-for="client-history">
          <b-form-textarea id="client-history" v-model="clientForm.medical_history" rows="3" />
        </b-form-group>
        <b-form-group :label="$t('client.chronicIllnesses')" label-for="client-chronic-illnesses">
          <b-form-checkbox-group
            id="client-chronic-illnesses"
            v-model="clientForm.chronic_illnesses"
            :options="chronicIllnessOptions"
            stacked
          />
          <small class="text-muted d-block mt-50">{{ $t('client.selectChronicIllnesses') }}</small>
        </b-form-group>
        <div class="text-right">
          <b-button variant="secondary" class="mr-1" @click="editClientModalShow = false">
            {{ $t('actions.cancel') }}
          </b-button>
          <b-button type="submit" variant="primary" :disabled="savingClient">
            <b-spinner v-if="savingClient" small class="mr-1" />
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
  BFormCheckboxGroup,
  BFormInput,
  BFormTextarea,
  BFormFile,
  BFormCheckbox,
  BSpinner,
  BBadge,
  BAlert,
  BInputGroup,
  BInputGroupAppend,
  BTabs,
  BTab,
  VBTooltip,
} from 'bootstrap-vue'
import reservationsService from '@/services/reservations'
import openfdaService from '@/services/openfda'
import clientsService from '@/services/clients'
import doctorServicesApi from '@/services/doctorServices'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { buildChronicIllnessOptions, formatChronicIllnesses } from '@/utils/clientChronicIllnesses'
import { formatAgeFromBirthDate } from '@/utils/clientAge'

export default {
  directives: {
    'b-tooltip': VBTooltip,
  },
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
    BFormCheckboxGroup,
    BFormInput,
    BFormTextarea,
    BFormFile,
    BFormCheckbox,
    BSpinner,
    BBadge,
    BAlert,
    BInputGroup,
    BInputGroupAppend,
    BTabs,
    BTab,
    BCardHeader: () => import('bootstrap-vue').then(m => m.BCardHeader),
    BCardBody: () => import('bootstrap-vue').then(m => m.BCardBody),
    BFormRadio: () => import('bootstrap-vue').then(m => m.BFormRadio),
    BFormSelect: () => import('bootstrap-vue').then(m => m.BFormSelect),
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
      loading: false,
      completeModalShow: false,
      viewModalShow: false,
      completing: false,
      selectedReservation: null,
      completeForm: {
        diagnosis: '',
        treatment: '',
        current_procedures: '',
        procedure_notes: '',
        next_procedures: '',
        requires_xray: false,
        xray_notes: '',
        requires_lab: false,
        lab_notes: '',
      },
      completionFiles: [],
      filePreviewUrls: {},
      imagePreviewModalShow: false,
      previewImageUrl: null,
      previewImageName: '',
      // OpenFDA drug search
      drugTabIndex: 0,
      drugSearchQuery: '',
      drugResults: [],
      drugResultsTotal: 0,
      drugSearching: false,
      drugSearched: false,
      selectedDrug: null,
      drugDetailModalShow: false,
      drugDetailData: null,
      drugDetailLoading: false,
      // Egypt drug search
      egyptDrugQuery: '',
      egyptResults: [],
      egyptResultsTotal: 0,
      egyptSearching: false,
      egyptSearched: false,
      selectedEgyptDrug: null,
      egyptCategoryFilter: '',
      egyptFormFilter: '',
      egyptCategories: [],
      egyptForms: [],
      chronicIllnessOptionValues: [],
      filters: {
        search: '',
        status: '',
        date_from: '',
        date_to: '',
      },
      // Client edit
      editClientModalShow: false,
      savingClient: false,
      editingClientId: null,
      clientForm: {
        name: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        date_of_birth: '',
        height: '',
        weight: '',
        address: '',
        job: '',
        medical_history: '',
        chronic_illnesses: [],
      },

      // Reservation services (additional services)
      doctorServicesCatalog: [],
      reservationServices: [],
      loadingResServices: false,
      addServiceModalShow: false,
      savingService: false,
      futureReservationModalShow: false,
      savingFutureReservation: false,
      futureReservationForm: {
        appointment_date: '',
        amount: 0,
        paid: 0,
        payment_method: 'cash',
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
    }
  },
  mounted() {
    if (!this.filters.date_from) this.filters.date_from = this.getTodayDate()
    if (!this.filters.date_to) this.filters.date_to = this.getTodayDate()
    this.fetchReservations()
    this.fetchEgyptDrugFilters()
    this.fetchClientOptions()
  },
  beforeDestroy() {
    this.revokePreviewUrls()
  },
  watch: {
    '$store.state.broadcast.eventCounter'() {
      this.fetchReservations()
    },
  },
  computed: {
    fields() {
      return [
        { key: 'client.name', label: this.$t('table.client'), sortable: true },
        { key: 'appointment_date', label: this.$t('reservation.appointment'), formatter: this.formatDateTime, sortable: true },
        { key: 'status', label: this.$t('table.status'), sortable: true },
        { key: 'actions', label: this.$t('table.actions') },
      ]
    },
    statusOptions() {
      return [
        { value: '', text: this.$t('filters.all') },
        { value: 'pending', text: this.$t('reservation.pending') },
        { value: 'confirmed', text: this.$t('reservation.confirmed') },
        { value: 'completed', text: this.$t('reservation.completed') },
        { value: 'cancelled', text: this.$t('reservation.cancelled') },
      ]
    },
    egyptCategoryOptions() {
      return [
        { value: '', text: this.$t('openfda.allCategories') },
        ...this.egyptCategories.map(c => ({ value: c, text: c })),
      ]
    },
    egyptFormOptions() {
      return [
        { value: '', text: this.$t('openfda.allForms') },
        ...this.egyptForms.map(f => ({ value: f, text: f })),
      ]
    },
    chronicIllnessOptions() {
      return buildChronicIllnessOptions(this.chronicIllnessOptionValues, key => this.$t(key))
    },
    imageFiles() {
      if (!this.selectedReservation?.completion_files) return []
      return this.selectedReservation.completion_files.filter(f => this.isImageFile(f))
    },
    nonImageFiles() {
      if (!this.selectedReservation?.completion_files) return []
      return this.selectedReservation.completion_files.filter(f => !this.isImageFile(f))
    },
    servicesTableFields() {
      return [
        { key: 'service_name', label: this.$t('services.name') },
        { key: 'total_price',  label: this.$t('services.priceQty') },
        { key: 'with_invoice', label: this.$t('services.invoice') },
        { key: 'actions',      label: '' },
      ]
    },
    doctorServiceOptions() {
      const opts = [{ value: null, text: `— ${this.$t('services.customService')} —` }]
      this.doctorServicesCatalog.forEach(s => {
        if (s.is_active) opts.push({ value: s.id, text: `${s.name}${s.name_en ? ' / ' + s.name_en : ''} (${Number(s.price).toFixed(2)})` })
      })
      return opts
    },
    paymentMethodOptions() {
      return [
        { value: 'cash', text: this.$t('financial.cash') },
        { value: 'card', text: this.$t('financial.card') },
        { value: 'transfer', text: this.$t('financial.transfer') },
        { value: 'other', text: this.$t('financial.other') },
      ]
    },
  },
  methods: {
    formatDate(value) {
      if (!value) return null
      return new Date(value).toLocaleDateString()
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getDatetimeLocalMin() {
      const d = new Date()
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      return d.toISOString().slice(0, 16)
    },
    formatDateTimeForApi(value) {
      if (!value) return ''
      return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ')
    },
    async fetchReservations() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.current_page,
          own_only: 1,
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
            title: 'Error',
            text: 'Failed to load reservations',
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
    showCompleteModal(reservation) {
      this.selectedReservation = reservation
      this.completeForm = {
        diagnosis: '',
        treatment: '',
        current_procedures: '',
        procedure_notes: '',
        next_procedures: '',
        requires_xray: false,
        xray_notes: '',
        requires_lab: false,
        lab_notes: '',
      }
      this.completionFiles = []
      // Reset drug search state
      this.drugSearchQuery = ''
      this.drugResults = []
      this.drugResultsTotal = 0
      this.drugSearched = false
      this.selectedDrug = null
      // Reset Egypt drug search state
      this.egyptDrugQuery = ''
      this.egyptResults = []
      this.egyptResultsTotal = 0
      this.egyptSearched = false
      this.selectedEgyptDrug = null
      this.egyptCategoryFilter = ''
      this.egyptFormFilter = ''
      this.drugTabIndex = 0
      this.completeModalShow = true
    },
    async viewReservation(reservation) {
      this.revokePreviewUrls()
      try {
        const response = await reservationsService.getReservation(reservation.id)
        this.selectedReservation = response.data
      } catch (error) {
        this.selectedReservation = reservation
      }
      this.viewModalShow = true
      this.$nextTick(() => this.loadFilePreviewUrls())
      // Load reservation services and doctor catalog
      this.fetchReservationServices(reservation.id)
      this.fetchDoctorServicesCatalog()
    },
    openFutureReservationModal() {
      if (!this.selectedReservation) return
      this.futureReservationForm = {
        appointment_date: '',
        amount: 0,
        paid: 0,
        payment_method: 'cash',
        notes: '',
      }
      this.futureReservationModalShow = true
    },
    resetFutureReservationForm() {
      this.savingFutureReservation = false
      this.futureReservationForm = {
        appointment_date: '',
        amount: 0,
        paid: 0,
        payment_method: 'cash',
        notes: '',
      }
    },
    async saveFutureReservation() {
      if (!this.selectedReservation) return
      this.savingFutureReservation = true
      try {
        await reservationsService.createReservation({
          client_id: this.selectedReservation.client_id,
          doctor_id: this.selectedReservation.doctor_id,
          source_reservation_id: this.selectedReservation.id,
          appointment_date: this.formatDateTimeForApi(this.futureReservationForm.appointment_date),
          amount: Number(this.futureReservationForm.amount || 0),
          paid: Number(this.futureReservationForm.paid || 0),
          payment_method: this.futureReservationForm.payment_method,
          notes: this.futureReservationForm.notes,
        })

        this.futureReservationModalShow = false
        this.fetchReservations()
        if (this.selectedReservation.id) {
          await this.viewReservation(this.selectedReservation)
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.futureReservationCreated'),
            variant: 'success',
          },
        })
      } catch (error) {
        const errors = error.response?.data?.errors
        const text = errors
          ? Object.values(errors).flat().join('\n')
          : (error.response?.data?.error || error.response?.data?.message || this.$t('messages.saveReservationError'))
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text,
            variant: 'danger',
          },
        })
      } finally {
        this.savingFutureReservation = false
      }
    },
    async completeReservation() {
      this.completing = true
      try {
        const formData = new FormData()
        Object.entries(this.completeForm).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0')
          } else {
            formData.append(key, value ?? '')
          }
        })

        this.completionFiles.forEach(file => {
          formData.append('files[]', file)
        })

        await reservationsService.completeReservation(
          this.selectedReservation.id,
          formData
        )
        // this.$toast({
        //   component: ToastificationContent,
        //   props: {
        //     title: this.$t('messages.success'),
        //     text: this.$t('messages.reservationCompleted'),
        //     variant: 'success',
        //   },
        // })
        this.completeModalShow = false
        this.fetchReservations()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || this.$t('messages.completeReservationError'),
            variant: 'danger',
          },
        })
      } finally {
        this.completing = false
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
    isImageFile(file) {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
      if (file.application_type && imageTypes.includes(file.application_type)) return true
      if (file.file_name) {
        const ext = file.file_name.split('.').pop().toLowerCase()
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
      }
      return false
    },
    async loadFilePreviewUrls() {
      if (!this.selectedReservation?.completion_files) return
      const images = this.selectedReservation.completion_files.filter(f => this.isImageFile(f))
      for (const file of images) {
        if (this.filePreviewUrls[file.id]) continue
        try {
          const response = await reservationsService.previewArchiveFile(file.id)
          const blob = new Blob([response.data], { type: file.application_type || 'image/jpeg' })
          this.$set(this.filePreviewUrls, file.id, window.URL.createObjectURL(blob))
        } catch {
          // skip failed previews
        }
      }
    },
    openImagePreview(file) {
      this.previewImageUrl = this.filePreviewUrls[file.id] || null
      this.previewImageName = file.file_name || ''
      this.imagePreviewModalShow = true
    },
    revokePreviewUrls() {
      Object.values(this.filePreviewUrls).forEach(url => window.URL.revokeObjectURL(url))
      this.filePreviewUrls = {}
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
    async fetchEgyptDrugFilters() {
      try {
        const response = await openfdaService.getEgyptDrugFilters()
        this.egyptCategories = response.data.categories || []
        this.egyptForms = response.data.forms || []
      } catch (error) {
        // Silently fail — filters are optional
      }
    },
    async fetchClientOptions() {
      try {
        const response = await clientsService.getClientOptions()
        this.chronicIllnessOptionValues = response.data.chronic_illnesses || []
      } catch (error) {
        this.chronicIllnessOptionValues = []
      }
    },
    async searchEgyptDrugs() {
      if (!this.egyptDrugQuery || this.egyptDrugQuery.length < 1) return
      this.egyptSearching = true
      this.egyptSearched = false
      try {
        const response = await openfdaService.searchEgyptDrugs(this.egyptDrugQuery, {
          category: this.egyptCategoryFilter || undefined,
          form: this.egyptFormFilter || undefined,
        })
        this.egyptResults = response.data.results || []
        this.egyptResultsTotal = response.data.total || 0
      } catch (error) {
        this.egyptResults = []
        this.egyptResultsTotal = 0
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('openfda.searchError'),
            variant: 'danger',
          },
        })
      } finally {
        this.egyptSearching = false
        this.egyptSearched = true
      }
    },
    appendEgyptDrugToTreatment(drug) {
      if (!drug) return
      const name = drug.name
      const form = drug.form ? ` - ${drug.form}` : ''
      const entry = `${name}${form}`

      if (this.completeForm.treatment) {
        this.completeForm.treatment += '\n' + entry
      } else {
        this.completeForm.treatment = entry
      }

      this.$toast({
        component: ToastificationContent,
        props: {
          title: this.$t('messages.success'),
          text: this.$t('openfda.drugAdded', { name }),
          variant: 'success',
        },
      })
    },
    async searchDrugs() {
      if (!this.drugSearchQuery || this.drugSearchQuery.length < 2) return
      this.drugSearching = true
      this.drugSearched = false
      try {
        const response = await openfdaService.searchDrugs(this.drugSearchQuery)
        this.drugResults = response.data.results || []
        this.drugResultsTotal = response.data.total || 0
      } catch (error) {
        this.drugResults = []
        this.drugResultsTotal = 0
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('openfda.searchError'),
            variant: 'danger',
          },
        })
      } finally {
        this.drugSearching = false
        this.drugSearched = true
      }
    },
    selectDrug(drug) {
      this.selectedDrug = this.selectedDrug === drug ? null : drug
    },
    appendDrugToTreatment(drug) {
      if (!drug) return
      const name = drug.brand_name || drug.generic_name
      const generic = drug.generic_name && drug.brand_name ? ` (${drug.generic_name})` : ''
      const form = drug.dosage_form ? ` - ${drug.dosage_form}` : ''
      const route = drug.route ? ` [${drug.route}]` : ''
      const entry = `${name}${generic}${form}${route}`

      if (this.completeForm.treatment) {
        this.completeForm.treatment += '\n' + entry
      } else {
        this.completeForm.treatment = entry
      }

      this.$toast({
        component: ToastificationContent,
        props: {
          title: this.$t('messages.success'),
          text: this.$t('openfda.drugAdded', { name }),
          variant: 'success',
        },
      })
    },
    async showDrugDetails(drug) {
      const name = drug.brand_name || drug.generic_name
      if (!name) return
      this.drugDetailModalShow = true
      this.drugDetailLoading = true
      this.drugDetailData = null
      try {
        const response = await openfdaService.getDrugDetails(name)
        this.drugDetailData = response.data
      } catch (error) {
        this.drugDetailData = drug // fallback to search result data
      } finally {
        this.drugDetailLoading = false
      }
    },
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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
        future_reservation_created: 'light-primary',
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
    formatDateTime(value) {
      if (!value) return 'N/A'
      // Parse as local time since backend returns Y-m-d H:i:s format
      const date = new Date(value + (value.includes(' ') ? '' : ''))
      return date.toLocaleString()
    },
    formatClientChronicIllnesses(values) {
      return formatChronicIllnesses(values, key => this.$t(key), this.$t('reservation.na'))
    },
    calculateAge(value) {
      return formatAgeFromBirthDate(value, key => this.$t(key), this.$t('reservation.na'))
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    paginationCountText(paginationState) {
      if (!paginationState?.total) return '0 / 0'
      const from = ((paginationState.current_page - 1) * paginationState.per_page) + 1
      const to = Math.min(paginationState.current_page * paginationState.per_page, paginationState.total)
      return `${from}-${to} / ${paginationState.total}`
    },
    openEditClientModal(client) {
      this.editingClientId = client.id
      this.clientForm = {
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        whatsapp_number: client.whatsapp_number || '',
        date_of_birth: client.date_of_birth ? client.date_of_birth.substring(0, 10) : '',
        height: client.height || '',
        weight: client.weight || '',
        address: client.address || '',
        job: client.job || '',
        medical_history: client.medical_history || '',
        chronic_illnesses: [...(client.chronic_illnesses || [])],
      }
      this.editClientModalShow = true
    },
    async saveClientData() {
      this.savingClient = true
      try {
        const { data } = await clientsService.updateClient(this.editingClientId, this.clientForm)
        // Update client in selected reservation
        if (this.selectedReservation && this.selectedReservation.client) {
          Object.assign(this.selectedReservation.client, data)
        }
        this.editClientModalShow = false
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.updateSuccess'),
            variant: 'success',
          },
        })
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || this.$t('messages.saveError'),
            variant: 'danger',
          },
        })
      } finally {
        this.savingClient = false
      }
    },

    // ── Doctor Services ───────────────────────────────────────────
    async fetchDoctorServicesCatalog() {
      try {
        const { data } = await doctorServicesApi.getAll()
        this.doctorServicesCatalog = data
      } catch { /* silent */ }
    },

    async fetchReservationServices(reservationId) {
      this.loadingResServices = true
      try {
        const { data } = await doctorServicesApi.getReservationServices(reservationId)
        this.reservationServices = data
      } catch { /* silent */ } finally {
        this.loadingResServices = false
      }
    },

    openAddServiceModal() {
      if (!this.selectedReservation || this.selectedReservation.status === 'completed' || this.selectedReservation.status === 'cancelled') {
        return
      }

      this.resetServiceForm()
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
          props: { title: this.$t('messages.success'), text: this.$t('services.serviceAdded'), variant: 'success' },
        })
      } catch (error) {
        const errors = error.response?.data?.errors
        const text = errors ? Object.values(errors).flat().join('\n') : (error.response?.data?.message || this.$t('services.saveError'))
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.error'), text, variant: 'danger' },
        })
      } finally {
        this.savingService = false
      }
    },

    async deleteReservationService(rs) {
      try {
        await doctorServicesApi.deleteReservationService(this.selectedReservation.id, rs.id)
        this.reservationServices = this.reservationServices.filter(s => s.id !== rs.id)
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.success'), text: this.$t('services.serviceRemoved'), variant: 'success' },
        })
      } catch {
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.error'), text: this.$t('services.deleteError'), variant: 'danger' },
        })
      }
    },

    resetServiceForm() {
      this.serviceForm = { doctor_service_id: null, service_name: '', quantity: 1, unit_price: 0, with_invoice: true, notes: '' }
    },
  },
}
</script>

<style scoped>
.drug-results-scroll {
  max-height: 300px;
  overflow-y: auto;
}
</style>


