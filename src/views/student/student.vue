<template>
    <div>
        <b-card>
            <h3 style="text-align: center;">Welcome {{ userData.name }}</h3>
        </b-card>
    </div>
</template>

<script>

export default{
    data(){
        return {
            userData: JSON.parse(localStorage.getItem('user')),
        }
    }
}
</script>