<template>
    <v-app>
        <div class="main">
            <div class="heading">
                <div class="heading-title">
                    <h3>{{data.name}}</h3>
                </div>
                <div class="heading-actions">
                    <v-btn style="color:white" color="#80afa8" @click="addSchool" v-if="$route.params.id == 2">إضافه مؤسسه تعليميه</v-btn>
                    <v-btn style="color:white" color="#80afa8" @click="addTo" v-if="$route.params.id == 3">إسناد متخصص  </v-btn>
                    
                    &nbsp;
                    <v-btn class="btn"  style="color:white" @click="changeType">بطاقه</v-btn>
                    <v-btn class="btn" style="color:white" @click="changeType">جدول</v-btn>
                </div> 

            </div>

            <div class="secondHeading" v-if="$route.params.id == 1 || $route.params.id == 5">
                    <v-row>
                        <v-col cols="12" lg="10">
                            <v-row>
                        <v-col cols="12" md="6">
                            <v-row align="center">
                                <v-col cols="12" sm="4">
                                    <h4>اسم الطفل :</h4>
                                </v-col>
                                <v-col cols="12" sm="8">
                                    <v-text-field
                                    solo
                                    ></v-text-field>
                                </v-col>
                                
                            </v-row>
                        </v-col>
                         <v-col cols="12" md="6">
                            <v-row align="center">
                                <v-col cols="12" sm="4">
                                    <h4>المدرسه  :</h4>
                                </v-col>
                                <v-col cols="12" sm="8">
                                    <v-text-field
                                    solo
                                    ></v-text-field>
                                </v-col>
                                
                            </v-row>
                        </v-col>

                         </v-row>
                        </v-col>
                    </v-row>

                    <v-row align="center">
                        <span style="font-weight:bold">عرض حسب : </span>
                        <v-row>
                            <v-col cols="6" sm="4" md="2">
                                <div class="filterData customButton">
                                    <h3 style="text-align:center">الاسم</h3>
                                </div>
                            </v-col>
                            <v-col cols="6" sm="4" md="2">
                                <div class="filterData">
                                    <h3 style="text-align:center">تاريخ الميلاد</h3>
                                </div>
                            </v-col>
                        </v-row>
                    </v-row>
            </div>

            <div class="secondHeading" v-if="$route.params.id == 2">
                    <v-row>
                        <v-col cols="12" lg="10">
                        <v-row>   
                            <v-col cols="12" md="6">
                                <v-row align="center">
                                    <v-col cols="12" sm="4">
                                        <h4>اسم المدرسه :</h4>
                                    </v-col>
                                    <v-col cols="12" sm="8">
                                        <v-text-field
                                        solo
                                        ></v-text-field>
                                    </v-col>
                                    
                                </v-row>
                            </v-col>
                        </v-row>
                        </v-col>
                    </v-row>
            </div>

             <div class="secondHeading" v-if="$route.params.id == 3">
                    <v-row>
                        <v-col cols="12" lg="10">
                        <v-row>   
                            <v-col cols="12" md="6">
                                <v-row align="center">
                                    <v-col cols="12" sm="4">
                                        <h4>اسم المتخصص :</h4>
                                    </v-col>
                                    <v-col cols="12" sm="8">
                                        <v-text-field
                                        solo
                                        ></v-text-field>
                                    </v-col>
                                    
                                </v-row>
                            </v-col>

                             <v-col cols="12" md="6">
                                <v-row align="center">
                                    <v-col cols="12" sm="4">
                                        <h4>المدرسه  :</h4>
                                    </v-col>
                                    <v-col cols="12" sm="8">
                                        <v-text-field
                                        solo
                                        ></v-text-field>
                                    </v-col>
                                    
                                </v-row>
                            </v-col>
                        </v-row>
                        </v-col>
                    </v-row>

                   
            </div>

            <div class="mainData div" v-if="$route.params.id == 1 || $route.params.id == 5">
                <div class="cards" v-if="type == 1">
                    <v-row>
                    <v-col cols="12" sm="6" md="4" lg="3" v-for="data in allData" :key="data.id">
                        <div class="grid-item">
                        <v-card
                        @click="addData(data.id)"
                            class="mx-auto data-card"
                        >
                        <div>
                            <v-img
                            :src="data.img"
                            height="70px"
                            width="70px"
                            class="card-img"
                            ></v-img>
                            <v-card-title>
                                
                              <h4>{{data.name}}</h4>    
                              
                            
                            </v-card-title>
                        </div>
                        </v-card>
                        </div>
                    </v-col>
                    </v-row>
                </div>

                <div class="table" v-if="type == 2">
                   <v-data-table
                    :headers="headers"
                    :items="allData"
                    :items-per-page="5"
                    class="elevation-1"
                >
                <template v-slot:item.action="{ item }">
                    <v-btn
                        color="red"
                        dark
                    >
                        {{ item.action }}
                    </v-btn>
                    </template>
                </v-data-table>
                </div>
                
            </div>

            <div class="mainData div" v-if="$route.params.id == 2">
                <div class="cards" v-if="type == 1">
                    <v-row>
                    <v-col cols="12" sm="6" md="4" lg="3" v-for="data in schools" :key="data.id">
                        <div class="grid-item">
                        <v-card
                        @click="addData(data.id)"
                            class="mx-auto data-card"
                        >
                        <div>
                            <v-img
                            :src="data.img"
                            height="70px"
                            width="70px"
                            class="card-img"
                            ></v-img>
                            <v-card-title>
                                
                              <h4>{{data.name}}</h4>    
                              
                            
                            </v-card-title>
                        </div>
                        </v-card>
                        </div>
                    </v-col>
                    </v-row>
                </div>

                <div class="table" v-if="type == 2">
                   <v-data-table
                    :headers="Schoolheaders"
                    :items="schools"
                    :items-per-page="5"
                    class="elevation-1"
                >
                <template v-slot:item.action="{ item }">
                    <v-btn
                        color="red"
                        dark
                    >
                        {{ item.action }}
                    </v-btn>
                    </template>
                </v-data-table>
                </div>
                
            </div>

            <div class="mainData div" v-if="$route.params.id == 3">
                <div class="cards" v-if="type == 1">
                    <v-row>
                    <v-col cols="12" sm="6" md="4" lg="3" v-for="data in specialists" :key="data.id">
                        <div class="grid-item">
                        <v-card
                        @click="addData(data.id)"
                            class="mx-auto data-card"
                        >
                        <div>
                            <v-img
                            :src="data.img"
                            height="70px"
                            width="70px"
                            class="card-img"
                            ></v-img>
                            <v-card-title>
                                
                              <h4>{{data.name}}</h4>    
                              
                            
                            </v-card-title>
                        </div>
                        </v-card>
                        </div>
                    </v-col>
                    </v-row>
                </div>

                <div class="table" v-if="type == 2">
                   <v-data-table
                    :headers="specialistsData"
                    :items="specialists"
                    :items-per-page="5"
                    class="elevation-1"
                >
                <template v-slot:item.action="{ item }">
                    <v-btn
                        color="red"
                        dark
                    >
                        {{ item.action }}
                    </v-btn>
                    </template>
                </v-data-table>
                </div>
                
            </div>
        </div>
      
    </v-app>

</template>


<script>
export default {

    data(){
        return{
            type:0,
            scools:[
                {
                    name:"مدرسه الامل",
                    img:require('@/assets/img/أضافه مدرسه.png'),

                }
            ],
            specialists:[
                {
                    id:1,
                    name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                    center:'مركز الامل',
                    action:'حدف'


                },
                {
                    id:1,
                   name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                     center:'مركز الامل',
                    action:'حدف'
                     

                },
                {
                    id:1,
                    name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                     center:'مركز الامل',
                    action:'حدف'

                },
                {
                    id:1,
                    name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                     center:'مركز الامل',
                    action:'حدف'


                },
                {
                    id:1,
                    name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                     center:'مركز الامل',
                    action:'حدف'


                },
                {
                    id:1,
                    name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                     center:'مركز الامل',
                    action:'حدف'


                },{
                    id:1,
                   name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                     center:'مركز الامل',
                    action:'حدف'


                },{
                    id:1,
                   name:" محمد محمد",
                    img:require('@/assets/img/أضافه متخصص.png'),
                    center:'مركز الامل',
                    action:'حدف'

                },
            ],
            schools:[
                {
                    img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"
                },
                {
                    img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"

                },
                {
                     img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"

                },{
                     img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"

                },{
                     img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"

                },{
                     img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"
                },{
                    img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"

                },{
                    img:require('@/assets/img/المدارس.png'),
                    name:"مدرسه الامل",
                    action:"حدف"

                },
            ],
             allData:[
                {
                    img:require('@/assets/img/أضافه طفل.png'),
                    name:"محمد مسعد ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"1",
                    action:'action'
                },
                {
                     img:require('@/assets/img/أضافه طفل.png'),
                    name:"ابراهيم السقا ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"2",
                    action:'action'
                },
                {
                     img:require('@/assets/img/أضافه طفل.png'),
                    name:"سعد معوض ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"3",
                    action:'action'
                },
                {
                    img:require('@/assets/img/أضافه طفل.png'),
                    name:"احمد التوني ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"4",
                    action:'action'
                },
                {
                    img:require('@/assets/img/أضافه طفل.png'),
                    name:"محمد مسعد ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"5",
                    action:'action'
                },
                {
                     img:require('@/assets/img/أضافه طفل.png'),
                    name:"ابراهيم السقا ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"6",
                    action:'action'
                },
                {
                     img:require('@/assets/img/أضافه طفل.png'),
                    name:"سعد معوض ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"7",
                    action:'action'
                },
                {
                    img:require('@/assets/img/أضافه طفل.png'),
                    name:"احمد التوني ",
                    age:12,
                    school:'طلعت حرب',
                    type:'ذكر',
                    id:"8",
                    action:'action'
                },
                
            ],
            specialistsData:[
                 {
                    text:'الاسم كامل',
                    value:'name'
                },
                {
                    text:'المركز',
                    value:'center'
                },
                { 
                    text: 'حذف',
                    value: 'action'
                },
            ],
            Schoolheaders:[
                {
                    text:'الاسم كامل',
                    value:'name'
                },
                 { text: 'حذف', value: 'action' },
            ],
            headers: [
          {
            text: 'الاسم كامل',
            align: 'start',
            sortable: false,
            value: 'name',
          },
          { text: 'العمر', value: 'age' },
          { text: 'النوع', value: 'type' },
          { text: 'المدرسه', value: 'school' },
          { text: 'حذف', value: 'action' },
        ],
        } 
    },
    mounted(){
        this.type = 1
    },
    
    watch:{
       
        type(data , old){           
                if(data == 1)
                {
                                       
                    let btn = document.getElementsByClassName('btn')[0];
                    btn.style.backgroundColor ="#80afa8"  
                    btn.style.color ="#fff"  
                    let other = document.getElementsByClassName('btn')[1];
                    other.style.backgroundColor ="#fff" 
                    other.style.color ="#80afa8"            
                }else{
                       
                    let btn = document.getElementsByClassName('btn')[1];
                    btn.style.backgroundColor ="#80afa8"
                    btn.style.color= "#fff"           
                    let other = document.getElementsByClassName('btn')[0];
                    other.style.backgroundColor ="#fff"    
                    other.style.color ="#80afa8"   
                }
            
        }
    },
    methods:{
        addTo(){
            this.$router.push('/addTo/'+1);
        },
        addSchool(){
            this.$router.push('/addData/'+2);
        },
         changeType(){
            if(this.type == 1)
            {
                this.type = 2
            }else{
                this.type = 1
            }
        },
    },
    computed:{
        data() {
            let data = null;
            if(this.$route.params.id == 1)
            {
                data = {name:'بيانات الاطفال'}
            }

            if(this.$route.params.id == 5)
            {
                data = {name:'بيانات الاطفال'}
            }

            if(this.$route.params.id == 2)
            {
                data = {name:'المدارس'}
            }

             if(this.$route.params.id == 3)
            {
                data = {name:'المتخصصين'}
            }
            return data;
        }
    }

}
</script>


<style scoped>

.main{
    margin-top: 1rem;
    padding: 0 1rem;
    direction: rtl;
}

@media (min-width: 768px) {
    .main {
        padding: 0 2rem;
    }
}

@media (min-width: 1200px) {
    .main {
        padding: 0 3rem;
    }
}

.main .heading{
    margin-top: 1rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

@media (min-width: 576px) {
    .main .heading {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
}

.heading-title {
    text-align: right;
}

.heading-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.main .secondHeading {
    min-height: auto;
    padding: 1rem;
    background-color:#fbfbfb;
    border-top: 5px solid #10a29b;
}

.main .secondHeading h4{
    margin-top: 0.5rem;
    font-weight: bold;
}

.customButton {
    border-bottom: 5px solid #10a29b;
    color:#10a29b
}

.v-card__subtitle, .v-card__text, .v-card__title{
    margin-top: 0.5rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-weight:bold;
}

.grid-item {
    margin-top: 0.75rem;
}

.data-card {
    width: 100%;
    min-height: 9rem;
}

.card-img {
    margin: 0.5rem auto 0;
}

.div{
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}
</style>