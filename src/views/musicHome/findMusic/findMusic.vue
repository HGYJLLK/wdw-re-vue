<template>
  <div class="findMusic">
    <div>
      <!-- 二级路由 -->
      <router-view id="secondRoute" />
    </div>
  </div>
</template>

<script>
export default {
  name: "findMusic",
  components: {},
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped>
#secondRoute:hover {
  overflow-y: overlay;
}

#secondRoute {
  padding-right: 17px;
  padding-left: 3px;
  height: 100vh;
  width: 100%;
  /* overflow-y: hidden; */
  overflow-x: hidden;
}
</style>
