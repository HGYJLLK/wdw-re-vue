<template>
  <div id="app">
    <router-view></router-view>
    <Auth v-if="showLogin" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Auth from "@/components/musicHome/login/login.vue";
export default {
  name: "App",
  components: {
    Auth,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      //当前播放歌曲url
      "musicUrl",
      //当前播放歌曲详情
      "musicDetail",
      //当前歌曲id
      "songId",
      //当前歌单
      "playList",
      //历史歌曲播放列表
      "hisMusicList",
      //播放过的歌曲歌单(避免上一首或者随机播放播放到重复的歌曲)
      "hasPlayList",
      //顺序模式
      "playOrd",
      //当前可播放范围
      "slider",
      "playDur",
      //用户信息
      "userInfo",
      //用户歌单
      "personalList",
    ]),
  },
  methods: {
    // 存入数据防止刷新清空
    saveState() {
      sessionStorage.setItem("musicUrl", JSON.stringify(this.musicUrl));
      sessionStorage.setItem("musicDetail", JSON.stringify(this.musicDetail));
      sessionStorage.setItem("songId", JSON.stringify(this.songId));
      sessionStorage.setItem("playList", JSON.stringify(this.playList));
      sessionStorage.setItem("hisMusicList", JSON.stringify(this.hisMusicList));
      sessionStorage.setItem("hasPlayList", JSON.stringify(this.hasPlayList));
      sessionStorage.setItem("playOrd", JSON.stringify(this.playOrd));
      sessionStorage.setItem("slider", JSON.stringify(this.slider));
      sessionStorage.setItem("playDur", JSON.stringify(this.playDur));
      sessionStorage.setItem("userInfo", JSON.stringify(this.userInfo));
      sessionStorage.setItem("personalList", JSON.stringify(this.personalList));
    },
  },
  mounted() {
    // 判断是否兼容箭头函数
    try {
      eval("()=>{}");
      // alert("浏览器支持箭头函数");
    } catch (eo) {
      alert("本网站不兼容ie8，请下载最新的现代浏览器进行使用");
      window.location.href = "http://browsehappy.osfipin.com/";
    }
    // 将数据保存到vuex
    window.addEventListener("unload", this.saveState);
  },
};
</script>

<style>
body {
  overflow-y: hidden;
  overflow-x: hidden;
}
/*修改滚动条样式*/

div::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  /**/
}

div::-webkit-scrollbar-track {
  /* background: rgb(239, 239, 239); */
  border-radius: 2px;
}

div::-webkit-scrollbar-thumb {
  background: rgb(66, 66, 76);

  border-radius: 10px;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgb(98, 98, 106);
}
</style>
