<template>
  <div class="musicHome">
    <el-container>
      <!-- 头部 -->
      <el-header>
        <img src="../assets/image/demo.svg" alt="" id="musicDemo" />
        <span>Liu的音乐播放器</span>
        <loginBar style="position: absolute; right: 5%; top: 20%" />
      </el-header>
      <el-container>
        <!-- 左部导航栏 -->
        <el-aside width="20%"><leftNav /></el-aside>
        <!-- 展示路由 -->
        <el-main
          ><router-view ref="child" :searchData="searchData" v-show="!isEgg"
        /></el-main>
      </el-container>
    </el-container>
    <!-- 播放器 -->
    <musicPlay ref="musicPlay" @isShowSongList="isShowSongList" />
    <!-- 播放列表弹出层 -->
    <songTable
      ref="songTable"
      v-show="showSongList"
      @getNextSong="getNextSong"
      @cleanDur="cleanDur"
    />
    <!-- 登录页 -->
    <login v-show="!userInfo && showLogin" />
  </div>
</template>

<script>
import leftNav from "@/components/musicHome/leftNav/leftNav";
import loginBar from "@/components/musicHome/leftNav/loginBar";
import login from "@/components/musicHome/login/login";
import musicPlay from "@/components/musicHome/musicPlay/musicPlay";
import songTable from "@/components/musicHome/musicPlay/songTable";
import { mapGetters, mapMutations, mapActions } from "vuex";
export default {
  name: "musicHome",
  components: {
    leftNav,
    loginBar,
    musicPlay,
    songTable,
    login,
  },
  data() {
    return {
      //是否显示歌单
      showSongList: false,
      //是否能关闭
      isClose: false,
    };
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
      //个人信息
      "userInfo",
      //是否展示登录
      "showLogin",
    ]),
  },
  methods: {
    //是否展示歌单
    isShowSongList() {
      this.showSongList = !this.showSongList;
    },
    //播放下一首歌曲
    getNextSong() {
      this.$refs.musicPlay.getNextSong();
    },
    //清空播放栏的歌曲时长
    cleanDur() {
      this.$refs.musicPlay.cleanDur();
    },
    //打开登录窗口
    changeShowLogin(isShow) {
      this.$store.dispatch("changeShowLogin", isShow);
    },
  },
  created() {},
  mounted() {},
};
</script>

<style>
.el-header {
  display: flex;
  position: relative;
  background: rgb(26, 26, 33);
  padding-top: 5px;
}
#musicDemo {
  width: 40px;
  height: 40px;
  margin-top: 5px;
  margin-left: 20px;
}

.el-header span {
  width: auto;
  margin-left: 10px;
  margin-top: 15px;
  font-weight: 500;
  font-size: 20px;
  color: #ffffff;
}
.other {
  color: #fff;
}
.el-header .el-input__inner {
  opacity: 0.5;
  margin-top: 25px;
  margin-left: 50px;
  width: 225px;
  height: 23px;
  border-radius: 12px;
}

.elsearch {
  position: absolute;
  right: 13%;
  top: 45%;
  cursor: pointer;
  opacity: 0.5;
  color: #fff;
}
/* 回退键 */

#back {
  width: 25px;
  height: 25px;
  text-align: center;
  line-height: 25px;
  margin-top: 13px;
  margin-left: 30px;
  color: #ffffff;
  background: rgba(77, 71, 71, 0.1);
  border-radius: 50%;
}
/* 滑块 */

.el-slider__button {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid #000 !important;
}

.el-slider__runway {
  background: rgb(237, 237, 237);
}

.el-slider__bar {
  background-color: red;
}

.volume .el-slider__button {
  width: 5px !important;
  height: 5px !important;
  border: 1px solid #000 !important;
  background: #fff;
}

.volume .el-slider__runway {
  background: #000;
}
/* 菜单 */
.egg {
  position: absolute;
  /* width: 580px; */
  /* height: 580px; */
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5201314;
}

.el-menu {
  background: #000;
  color: #fff;
}
</style>
