<template>
  <v-app>
    <div class="main">
      <div class="body">
      <div class="left">
        <v-img src="../assets/img/welcome illustration.png" />
      </div>

      <div class="right">
        <h1 style="color:#10a29b">منصه مركز هيلب للشرق الاوسط وشمال افريقيا</h1>
        <div class="description-text">
          <h4>لوريم لوريم لوريم لوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم</h4>
        </div>
        <div class="action-buttons">
         <v-btn
         
          rounded
          color="#10a29b"
          @click="login"
          x-large
          outlined
          dark
          >
          تسجيل الدخول
          </v-btn>
          &nbsp;
          &nbsp;
           <v-btn
          rounded
          color="#10a29b"
          x-large
          dark
          >
          عن منصة هيلب
          </v-btn>
        </div>  
      </div>
      </div>

      <div class="footer">
       
          <h1 style="color:#10a29b">منصه مركز هيلب للشرق الاوسط وشمال افريقيا</h1>
         
            <h4>لوريم لوريم لوريم لوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم لوريم لوريم الوريم لوريم لوريم</h4>
         
        </div>
     

      
    </div>

  
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
    
  },
  methods:{
    login(){
        this.$router.push('/login');
    }
    
  },


  data: () => ({
    //
  }),
};
</script>

<style scoped>

.main .header {
  min-height: auto;
  background-color:#fbfbfb;
  padding: 1rem;
}

.main .header .left {
  margin-top: 1rem;
}

.main .header .left button {
  font-weight: bold;
  border-color: #10a29b;
}

.main .body{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .main .body {
    flex-direction: row;
    justify-content: center;
    padding: 3rem 2rem;
  }
}

.main .body .left {
  width: 100%;
  max-width: 25rem;
}

.main .body .right {
  width: 100%;
  max-width: 31.25rem;
  text-align: center;
}

@media (min-width: 768px) {
  .main .body .right {
    text-align: right;
    padding-top: 2rem;
  }
}

.description-text {
  width: 100%;
}

.action-buttons {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

@media (min-width: 768px) {
  .action-buttons {
    justify-content: flex-start;
  }
}

.main .body .right button {
  border-color:#10a29b
}

.main .footer {
  text-align: center;
  padding: 2rem 1rem;
}

button{
  font-weight: bold;
}

</style>
