<template>
  <div class="menuTab">
    <h1 class="menuTitle">歌曲菜单</h1>
    <div class="menuButtons">
      <button class="menuButton playAllButton" @click="playAll">
        播放全部
      </button>
      <button class="menuButton addSongButton" @click="addSong">
        添加歌曲
      </button>
      <button class="menuButton refreshPageButton" @click="refreshPage">
        刷新页面
      </button>
    </div>
  </div>
</template>

<script>
import gsap from "gsap";

export default {
  name: "newMenuTab",
  components: {},
  props: {},
  data() {
    return {};
  },
  methods: {
    playAll() {
      alert("播放全部歌曲");
      this.animateButton(".playAllButton");
    },
    addSong() {
      alert("添加歌曲");
      this.animateButton(".addSongButton");
    },
    refreshPage() {
      alert("刷新页面");
      this.animateButton(".refreshPageButton");
      window.location.reload();
    },
    animateButton(selector) {
      gsap.fromTo(
        selector,
        { scale: 1, backgroundColor: "#fff" },
        {
          scale: 1.1,
          backgroundColor: "#f0f0f0",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        }
      );
    },
  },
};
</script>

<style scoped>
.menuTab {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  width: 300px;
  margin: auto;
  margin-top: 50px;
}

.menuTitle {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.menuButtons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menuButton {
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menuButton:hover {
  background-color: #e0e0e0;
}

.playAllButton {
  background-color: #4caf50;
  color: white;
}

.addSongButton {
  background-color: #2196f3;
  color: white;
}

.refreshPageButton {
  background-color: #ff5722;
  color: white;
}
</style>
