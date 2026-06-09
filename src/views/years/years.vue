<template>
    <div>
    <base-table
        :items="years"
        :fields="fields"
        :add="true"
        @add="showModal = true"
        >
      
    </base-table>    </div>
</template>

<script>

import BaseTable from '@/views/components/my-components/table.vue'
import api from "@/libs/axios";

export default {
    name: 'years',
    components:{
        BaseTable
    },
    data(){
        return {
            years: [],
            fields: [
                {key:"name",label:"name"}
            ]
        }
    },
    mounted(){
        this.getYears();
    },
    methods: {
        getYears(){
            api.get('/years').then((response) => {
                this.years = response.data
            })
        }
    }
}

</script>