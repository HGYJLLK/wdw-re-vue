<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    @click.stop
  >
    <ul>
      <li @click="handleAction('play')">播放</li>
      <li @click="handleAction('add')">添加到我喜欢的音乐</li>
      <li @click="handleAction('add')">添加到我的歌单</li>
      <li @click="handleAction('delete')">删除</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    position: Object,
    song: Object,
  },
  methods: {
    handleAction(action) {
      this.$emit("action", action, this.song);
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.context-menu {
  width: 185px;
  height: 140px;
  position: absolute;
  background: #222;
  border: 1px solid #444;
  border-radius: 5px;
  z-index: 1000;
  padding: 10px 0;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 8px 20px;
  cursor: pointer;
}

.context-menu li:hover {
  background-color: #444;
}
</style>
