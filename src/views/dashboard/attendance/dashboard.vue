<template>
  <div>
    {{ $store.getters['auth/userRole'] }}
    <loading :visible="load" text="Processing..." />

    <b-row>
      <b-col cols="12" md="6">
        <b-card class="stat-card">
          <h4 class="stat-title">Total Employees: {{ summary.totalEmployees }}</h4>
        </b-card>
        <b-card class="stat-card">
          <h4 class="stat-title">Present Today: {{ summary.presentToday }}</h4>
        </b-card>
      </b-col>
      <b-col cols="12" md="6">
        <b-card title="Attendance Stats">
          <line-chart :data="chartData" :options="chartOptions" class="chart-container" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from "@/libs/axios";
import LineChart from '@/components/charts/LineChart.js'
import loading from "@/views/components/my-components/loading.vue";


export default {
  components: {
    LineChart, loading
  },
  data() {
    return {
      summary: {
        totalEmployees: 0,
        presentToday: 0,
        series: [],
        load: false
      },
      chartData: {
        labels: [],
        datasets: []
      },
      chartOptions: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        xAxes: [
        {
            offset: true,
            gridLines: {
            display: true,
            drawBorder: false,
            },
            ticks: {
            autoSkip: false,
            padding: 10,
            },
        },
        ],
        yAxes: [
        {
            ticks: {
            beginAtZero: true,
            },
        },
        ],
    },
    legend: {
        display: true,
        position: 'top',
    },
    }

    };
  },
  async created() {
    this.load = true
    const res = await api.get("/dashboard/summary");
    this.summary = res.data;
    const series = res.data.series || []
    this.load = false
    const labels = series.map(item => item.date)
    const values = series.map(item => item.cnt)
    this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Attendance',
            data: values,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66,165,245,0.2)',
            fill: false,          // no area fill
            lineTension: 0.1,     // makes smooth line (0 = straight)
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#42A5F5',
            showLine: true,       // show line between points
                  type: 'line',            // 👈 force line type
          },
        ],
      }
  },
};
</script>

<style scoped>
.stat-card {
  min-height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-title {
  margin: 0;
}
.chart-container {
  height: 18.75rem;
  width: 100%;
}
</style>
