<template>
  <component :is="layout">
     <router-view/>
  </component>
</template>

<script>

export default {
  name: 'App',
  computed:{
    layout(){
      return this.$route.meta.layout || 'default-layout'
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
