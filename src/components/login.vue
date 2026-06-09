<template>
    <v-app>

        <div class="main">
            <h1>ماهي صفتك لتسجيل الدخول</h1>
        </div>


        <div class="cards-container">
            <v-row>
                <v-col cols="12" sm="6" md="4" v-for="data in allData" :key="data.id">
                     <div class="cards">
                <v-card
                @click="alert(data.id)"
                    class="mx-auto"
                    shaped
                    max-width="250"
                >
                <div>
                    <v-img
                    :src="data.img"
                    height="50px"
                    width="50px"
                    ></v-img>
                    <v-card-title>
                    {{data.name}}
                    </v-card-title>
                </div>
                </v-card>
                 </div>
                </v-col>
            </v-row>
        </div>
       
    </v-app>


</template>


<script>
export default {
    name :"App",
    methods:{
        alert(id){
            this.$router.push('loginpage');
        }
    },
    data(){
        return {
            allData:[
                {
                    img:require('@/assets/img/متخصص.png'),
                    name:"متخصص",
                    id:"1"
                }, {
                    img:require('@/assets/img/مدرس.png'),
                    name:"مدرس",
                    id:"2"
                }, {
                     img:require('@/assets/img/مدرسه.png'),
                    name:"مدرسه",
                    id:"3"
                }, {
                     img:require('@/assets/img/مركز.png'),
                    name:"مركز",
                    id:"4"
                }, {
                     img:require('@/assets/img/ولي الامر.png'),
                    name:"ولي امر",
                    id:"5"
                }
            ]

            
        }
    }
    
}
</script>


<style scoped>
.main {
    text-align: center;
    margin-top: 1.5rem;
    padding: 0 1rem;
}
.main h1 {
    color:#10a29b;
}

.cards-container {
    padding: 0 1rem;
}

.card {
    width: 100%;
    max-width: 15rem;
    margin: 0 auto;
    background-color: white;
}

.cards {
    margin-bottom: 1rem;
}

.v-card__subtitle, .v-card__text, .v-card__title{
    padding: 0.5rem 1rem;
    font-weight:bold;
    text-align: center;
}

.v-responsive{
    margin: 0.5rem auto;
}
</style>