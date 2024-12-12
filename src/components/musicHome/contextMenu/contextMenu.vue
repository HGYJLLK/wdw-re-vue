<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    @click.stop
    ref="menuDiv"
  >
    <ul>
      <li @click="handleAction('play')">播放</li>
      <li
        @click="handleAction('addStar')"
        v-if="type == 1 || type == 2 || type == -1"
      >
        添加到我喜欢的音乐
      </li>
      <li
        @click="handleAction('addMy')"
        v-if="type == 1 || type == 3 || type == -1"
      >
        添加到我的歌单
      </li>
      <li
        @click="handleAction('delete')"
        v-if="type == 1 || type == 2 || type == 3"
      >
        删除
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    position: Object,
    song: Object,
    type: Number,
    index: Number,
  },
  data() {
    return {
      divHeight: 0,
    };
  },
  watch: {
    visible() {
      if (this.visible) {
        this.$nextTick(() => {
          this.calculateHeight(); // 仅在菜单可见时计算高度
        });
      }
    },
  },
  methods: {
    handleAction(action) {
      console.log("this.song", this.song, this.index);

      this.$emit("action", action, this.song, this.index);
      this.$emit("close");
    },
    calculateHeight() {
      if (this.$refs.menuDiv) {
        const height = this.$refs.menuDiv.offsetHeight;
        console.log("height", height);

        this.$emit("updateHeight", height); // 传递高度到父组件
      }
    },
  },
  mounted() {
    this.calculateHeight();
  },
};
</script>

<style scoped>
.context-menu {
  width: 185px;
  height: auto;
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
