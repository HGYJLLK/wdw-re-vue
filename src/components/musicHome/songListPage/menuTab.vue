<template>
  <div class="menuTab">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
    >
      <el-menu-item index="1" @click="changeActive('1')" id="songList"
        >歌曲列表</el-menu-item
      >
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "menuTab",
  components: {},
  props: {},
  data() {
    return {
      // 高亮菜单
      activeIndex: "1",
    };
  },
  methods: {
    changeActive(index) {
      this.activeIndex = index;
      this.$emit("changeActive", index);
    },
  },
};
</script>

<style scoped>
/* 点击出来的下划线进行修改 */

.el-menu-item.is-active {
  border-color: #ec4141;
  font-size: 20px;
  font-weight: 400;
  background: none !important;
}
/* 整体的下划线进行隐藏 */

.el-menu.el-menu--horizontal {
  border-bottom: none;
  background: rgb(19, 19, 26);
}

#songList {
  color: #fff;
}
</style>
