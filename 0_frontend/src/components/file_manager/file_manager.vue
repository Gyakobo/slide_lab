<template>
  <div id="work-area">
    <sidebar_left></sidebar_left>
    <work_sheet></work_sheet>
    <sidebar_right></sidebar_right>
  </div>
</template>

<script>
import sidebar_left from "./ui_tiles/sidebar_left/sidebar_left";
import work_sheet from "./ui_tiles/work_sheet";
import sidebar_right from "./ui_tiles/sidebar_right/sidebar_right";

export default {
  components: {
    sidebar_left, work_sheet, sidebar_right,
  },
  data(){
    return {
    }
  },
  beforeCreate() {
    this.$store.state.file_manager.active_project = null
  }
}
</script>

<style scoped>
#work-area{
  display: flex;
  flex-direction: row;

  width: 100%;
  height: calc(100vh - 40px);
}

</style>
