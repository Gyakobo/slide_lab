<template>
  <div class="main_wrapper params_group">
    <div
        v-for="(item, key1) in active_component_params"
        :key="key1"
        class="params_group"
    >
      <h3>{{key1}}</h3>
      <div
          v-for="(item2, key2) in item"
          :key="key2"
          class="item"
      >
        <span>{{key2}}:</span>

        <textarea
            v-if="key1 === 'text' && key2 === 'value'"
            :value="item2"
            @change="update_active_component_params(key1, key2, $event)"
        ></textarea>
        <input
            v-else
            :value="item2"
            @change="update_active_component_params(key1, key2, $event)"
        >
      </div>
    </div>

    <div class="flex-spacer">
    </div>

    <div
        v-if="is_can_delete"
        class="ui big basic red button"
        @click="delete_component()"
    >
      Удалить компонент
    </div>
  </div>
</template>

<script>
export default {
  data (){
    return {
    }
  },
  computed:{
    active_component(){
      return this.$store.state.active_component
    },
    is_can_delete(){
      return this.active_component !== null && this.active_component.parent != null
    },
    active_component_params(){
      if (this.active_component === null){
        return {}
      }
      return this.$store.state.active_component.params
    }
  },
  methods:{
    update_active_component_params(key1, key2, event) {
      this.active_component_params[key1][key2] = event.target.value
    },
    delete_component(){
      let active_component = this.active_component
      active_component.parent.remove_child(active_component.id)
    }
  }
}
</script>

<style scoped>
.main_wrapper{
  background: #eee;
  color: var(--black);

  font-size: 20px;
  height: 100%;
  padding-bottom: 20px !important;
}

.params_group{
  display: flex;
  flex-direction: column;

  width: 100%;

  padding: 5px 10px;
}

.item{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin: 5px;
}

.item input{
  width: 150px;
}

.flex-spacer{
  flex-grow: 1;
}

</style>
