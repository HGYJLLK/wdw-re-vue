<template>
  <div class="musicPlay">
    <audio
      :src="musicUrl"
      autoplay
      class="playMusicAudio"
      ref="audio"
      @timeupdate="durationUpdate"
      @ended="getNextSong"
    ></audio>
    <div id="songDetail" v-show="musicDetail.al.picUrl !== ''">
      <!-- 歌曲封面 -->
      <el-image
        :src="musicDetail.al.picUrl"
        fit="fill"
        style="border-radius: 10%; height: 57px; width: 57px; cursor: pointer"
        @click="toSongDetail()"
      ></el-image>
      <!-- 歌曲名 -->
      <div id="songName">
        <el-tooltip
          class="item"
          effect="light"
          :content="`${musicDetail.name}${
            musicDetail.alia[0] ? `(${musicDetail.alia[0]})` : ''
          }`"
          placement="top"
          open-delay="1000"
        >
          <span
            style="
              color: #fff;
              cursor: default;
              margin-left: 10px;
              margin-right: 4px;
            "
            >{{ musicDetail.name }}</span
          >
          <span style="cursor: default">{{
            !musicDetail.alia[0] ? "" : "(" + musicDetail.alia[0] + ")"
          }}</span>
        </el-tooltip>
      </div>
      <!-- 作者名 -->
      <div id="authorName">
        <span
          v-for="(item, index) in musicDetail.ar"
          :key="index"
          style="cursor: default; font-size: 15px"
          >{{ index === 0 ? item.name : "/" + item.name }}</span
        >
      </div>
    </div>
    <div id="audioFunc">
      <!-- 播放顺序 -->
      <div @click="changeOrd">
        <el-tooltip
          class="item tooltip-custom"
          effect="light"
          content="顺序播放"
          placement="top"
          :open-delay="500"
        >
          <div id="playOrd" v-show="playOrd === 0">
            <i class="iconfont icon-liebiaoshunxu" style="font-size: 18px"></i>
          </div>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="light"
          content="列表循环"
          placement="top"
          :open-delay="500"
        >
          <div id="playOrd" v-show="playOrd === 1">
            <i class="iconfont icon-liebiaoxunhuan" style="font-size: 18px"></i>
          </div>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="light"
          content="单曲循环"
          placement="top"
          :open-delay="500"
        >
          <div id="playOrd" v-show="playOrd === 2">
            <i class="iconfont icon-danquxunhuan" style="font-size: 18px"></i>
          </div>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="light"
          content="随机播放"
          placement="top"
          :open-delay="500"
        >
          <div id="playOrd" v-show="playOrd === 3">
            <i class="iconfont icon-suijibofang" style="font-size: 18px"></i>
          </div>
        </el-tooltip>
      </div>
      <!-- 上一首歌曲 -->
      <div id="backSong" @click="getBackSong">
        <i class="iconfont icon-shangyishou" style="font-size: 18px"></i>
      </div>
      <!-- 播放与暂停 -->
      <div>
        <div id="pause" v-if="isPlaying && songId !== ''" @click="pauseSong">
          <i class="iconfont icon-zanting" style="font-size: 18px"></i>
        </div>
        <div id="play" v-else @click="playSong">
          <i class="iconfont icon-bofang" style="font-size: 30px"></i>
        </div>
      </div>
      <!-- 下一首歌曲 -->
      <div id="nextSong" @click="getNextSong">
        <i class="iconfont icon-xiayishou" style="font-size: 18px"></i>
      </div>
    </div>
    <!-- 播放进度条 -->
    <span style="position: absolute; right: 72%; bottom: 12%; opacity: 0.7">{{
      this.musicDetail.name === "" ? 0 : this.musicDuration | timeFormat
    }}</span>
    <div id="playSlider">
      <el-slider
        v-model="musicDuration"
        :max="Math.floor(this.musicDetail.dt / 1000)"
        :show-tooltip="false"
        :marks="slider"
        @change="changeMusicDuration"
        @mousedown.native="isChange = true"
        @mouseleave.native="isChange = false"
        @mouseup.native="isChange = false"
      ></el-slider>
    </div>
    <span style="position: absolute; left: 72%; bottom: 12%; opacity: 0.7">{{
      this.musicDetail.name === ""
        ? 0
        : Math.floor(this.musicDetail.dt / 1000) | timeFormat
    }}</span>

    <!-- 音质选择 -->
    <div class="quality">
      <div class="quality-expand">
        <el-dropdown trigger="click">
          <span class="quality-text">{{ currentQuality }}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              @click.native="selectQuality('高品质')"
              :class="{ selected: currentQuality === '高品质' }"
              :disabled="musicDetail.self"
              >高品质</el-dropdown-item
            >
            <el-dropdown-item
              @click.native="selectQuality('标准')"
              :class="{ selected: currentQuality === '标准' }"
              >标准</el-dropdown-item
            >
            <el-dropdown-item
              @click.native="selectQuality('流畅')"
              :class="{ selected: currentQuality === '流畅' }"
              :disabled="musicDetail.self"
              >流畅</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="volume">
      <i
        class="iconfont icon-icon-test"
        v-show="volumeVal !== 0"
        @click="muteVolume"
        style="font-size: 25px; cursor: pointer; left: 66px; position: absolute"
      ></i>
      <i
        class="iconfont icon-jingyin"
        v-show="volumeVal === 0"
        @click="cancelMute"
        style="
          font-size: 29px;
          cursor: pointer;
          left: 65px;
          margin-top: -2px;
          position: absolute;
        "
      ></i>
      <el-slider
        v-model="volumeVal"
        :max="100"
        :step="1"
        @input="changeVolume"
        style="position: absolute; top: -5px; right: 0px; width: 100px"
      ></el-slider>
    </div>
    <!-- 打开播放列表 -->
    <el-tooltip
      class="item"
      effect="light"
      content="打开播放列表"
      placement="top"
      :open-delay="500"
    >
      <i
        class="iconfont icon-bofangliebiao"
        @click="isShowSongList"
        style="
          position: absolute;
          right: 45px;
          top: 30px;
          font-size: 24px;
          cursor: pointer;
        "
      ></i>
    </el-tooltip>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "musicPlay",
  props: {},
  components: {},
  data() {
    return {
      // 歌曲当前时长
      musicDuration: 0,
      //判断是否被拖动
      isChange: false,
      //音量值
      volumeVal: localStorage.getItem("volumeVal")
        ? Number(localStorage.getItem("volumeVal"))
        : 12,
      //当前音量
      nowVolume: 50,
      // 静音前的音量
      previouseVolume: 50,
      currentQuality: "标准", // 默认音质
    };
  },
  computed: {
    ...mapGetters([
      //当前播放歌曲url
      "musicUrl",
      //当前播放歌曲详情
      "musicDetail",
      //当前播放歌曲id
      "songId",
      //判断当前是否在播放
      "isPlaying",
      //判断播放顺序模式
      "playOrd",
      //当前播放列表
      "playList",
      //已经播放过的列表
      "hasPlayList",
      //可播放范围
      "slider",
      //播放范围
      "playDur",
      // 当前音质
      "currentQuality",
    ]),
  },
  watch: {
    // 监听歌曲变化
    musicUrl(newUrl, oldUrl) {
      if (newUrl === oldUrl) return;

      this.$store.dispatch("saveIsPlaying", true);
    },
    currentQuality(newValue) {},
  },
  methods: {
    // 播放音乐
    playSong() {
      if (!this.musicUrl) {
        return;
      }
      this.$store.dispatch("saveIsPlaying", true);
      this.$refs.audio.play();
    },
    // 暂停音乐
    pauseSong() {
      this.$store.dispatch("saveIsPlaying", false);
      this.$refs.audio.pause();
    },
    //重复播放音乐
    rePlaySong() {
      this.$store.dispatch("saveIsPlaying", true);
      this.$refs.audio.load();
    },
    //变化播放模式
    changeOrd() {
      if (this.playOrd === 3) return this.$store.dispatch("savePlayOrd", 0);
      this.$store.dispatch("savePlayOrd", this.playOrd + 1);
    },
    //更新当前时长
    durationUpdate() {
      if (this.isChange === true) return;
      this.musicDuration = this.$refs.audio.currentTime + this.playDur[0];
      this.$store.dispatch("saveNowDuration", this.musicDuration);
      // this.musicDuration++;
    },
    //清除时长
    cleanDur() {
      this.musicDuration = 0;
      setTimeout(() => {
        this.$store.dispatch("deleteAllList");
      }, 20);
    },
    //鼠标拖拽松开时
    changeMusicDuration() {
      if (this.musicAllDuration === 0) {
        return;
      }
      this.$refs.audio.currentTime = this.musicDuration - this.playDur[0];
      // this.$store.dispatch("saveIsPlaying", true);
      this.isChange = false;
    },
    //音量改变时
    changeVolume() {
      this.nowVolume = this.volumeVal;
      this.$refs.audio.volume = this.volumeVal / 100;
      localStorage.setItem("volumeVal", this.volumeVal);
    },
    //静音
    muteVolume() {
      this.previouseVolume = this.volumeVal;
      this.volumeVal = 0;
      this.$refs.audio.volume = this.volumeVal / 100;
    },
    // 恢复静音
    cancelMute() {
      this.volumeVal = this.previouseVolume;
      this.$refs.audio.volume = this.volumeVal / 100;
    },
    //展示当前播放歌单
    isShowSongList() {
      this.$emit("isShowSongList");
    },
    //获取下一首歌曲
    getNextSong() {
      switch (this.playOrd) {
        case 0:
          this.ordPlay();
          break;
        case 1:
          this.cirPlay();
          break;
        case 2:
          this.rePlaySong();
          break;
        case 3:
          this.randomPlay();
          break;
      }
    },
    //获取上一首歌曲
    getBackSong() {
      switch (this.playOrd) {
        case 0:
          this.reOrdPlay();
          break;
        case 1:
          this.reCirPlay();
          break;
        case 2:
          this.reCirPlay();
          break;
        case 3:
          this.randomPlay();
          break;
      }
    },
    //顺序播放
    ordPlay() {
      let index = 0;
      for (let i = 0; i < this.playList.length; i++) {
        if (this.songId === this.playList[i].id) {
          index = i;
          break;
        }
      }
      if (index === this.playList.length - 1) {
        return;
      }
      this.startSong(this.playList[index + 1]);
    },
    //顺序播放的上一首歌曲
    reOrdPlay() {
      let index = 0;
      for (let i = 0; i < this.playList.length; i++) {
        if (this.songId === this.playList[i].id) {
          index = i;
          break;
        }
      }
      if (index === 0) {
        return;
      }
      this.startSong(this.playList[index - 1]);
    },
    // 列表循环
    cirPlay() {
      let index = 0;
      for (let i = 0; i < this.playList.length; i++) {
        if (this.songId === this.playList[i].id) {
          index = i;
          break;
        }
      }
      if (index === this.playList.length - 1) {
        this.startSong(this.playList[0]);
        return;
      }
      this.startSong(this.playList[index + 1]);
    },
    //列表循环的上一首歌曲
    reCirPlay() {
      let index = 0;
      for (let i = 0; i < this.playList.length; i++) {
        if (this.songId === this.playList[i].id) {
          index = i;
          break;
        }
      }
      if (index === 0) {
        this.startSong(this.playList[this.playList.length - 1]);
        return;
      }
      this.startSong(this.playList[index - 1]);
    },
    //随机播放
    randomPlay() {
      // console.log("this.hasPlayList.length", this.hasPlayList.length);
      console.log("this.songId", this.songId);

      // //接受子组件传来的数据
      // if (this.hasPlayList.length === 1) {
      //   this.$store.dispatch("sameHasAndPlay");
      // }
      // // 在已经播放过的列表中删除歌曲防止重复播放
      // this.$store.dispatch("deleteHasListSong", this.songId);
      // 获取随机
      const len = this.playList.length;
      while (true) {
        const index = this.getRandom(0, len - 1);
        if (this.playList[index].id !== this.songId) {
          this.startSong(this.playList[index]);
          break;
        }
      }
    },
    //   const index = this.getRandom(0, this.hasPlayList.length - 1);
    //   //放入历史播放
    //   this.$store.dispatch("deleteHisListSong", this.hasPlayList[index].id);
    //   this.$store.dispatch("unshiftHisMusicList", this.hasPlayList[index]);
    //   //获取随机歌曲url并保存
    //   this.getMusicUrl(this.hasPlayList[index].id);
    //   //保存到当前播放歌曲详情
    //   this.$store.dispatch("saveMusicDetail", this.hasPlayList[index]);
    //   //保存当前歌曲id
    //   this.$store.dispatch("saveSongId", this.hasPlayList[index].id);
    // },
    //随机数
    getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    // 开始播放
    startSong(musicDetail) {
      if (musicDetail.id === this.songId) return;
      // 获得音乐url
      this.getMusicUrl(musicDetail.id, musicDetail.self, musicDetail.url);
      // 保存到当前播放歌曲详情
      this.$store.dispatch("saveMusicDetail", musicDetail);
      // 保存到当前播放歌曲id
      console.log("musicDetail.id", musicDetail.id);

      this.$store.dispatch("saveSongId", musicDetail.id);
      // 放入历史歌单
      this.$store.dispatch("deleteHisListSong", musicDetail.id);
      this.$store.dispatch("unshiftHisMusicList", musicDetail);
      // 放入已经播放过的歌单
      this.$store.dispatch("deleteHasListSong", musicDetail.id);
      this.$store.dispatch("pushHasPlayList", musicDetail);
    },
    //根据id获取音乐url
    async getMusicUrl(musicId, isSelf, url) {
      console.log("是否是自定义音乐：" + isSelf);
      if (isSelf) {
        await this.$authHttp
          .get("/audio", {
            params: {
              id: musicId,
            },
          })
          .then((res) => {
            this.$store.dispatch("saveAur", [0, 0]);
            this.$store.dispatch("saveMusicUrl", res.data.musicUrl);
          });

        return;
      }
      await this.$http
        .get("song/url", {
          params: {
            id: musicId,
          },
        })
        .then((res) => {
          if (res.data.data[0].freeTrialInfo) {
            this.$store.dispatch("saveAur", [
              res.data.data[0].freeTrialInfo.start,
              res.data.data[0].freeTrialInfo.end,
            ]);
          } else {
            this.$store.dispatch("saveAur", [0, 0]);
          }
          this.$store.dispatch("saveMusicUrl", res.data.data[0].url);
        });
    },
    //点击跳转歌曲详情
    toSongDetail() {
      this.$router.push("/musicHome/songDetail");
    },
    selectQuality(quality) {
      this.currentQuality = quality;
      // 保存当前音质，触发store的更新
      this.$store.dispatch("updateQuality", quality);
    },
    handleKeypress(e) {
      // 检查事件的目标是否是输入框或其他可编辑元素
      const target = e.target.tagName.toLowerCase();
      if (target === "input" || target === "textarea") {
        return;
      }
      if (e.code === "Space") {
        if (this.isPlaying) {
          this.pauseSong();
        } else {
          this.playSong();
        }
        // 阻止默认事件
        e.preventDefault();
      }
    },
  },
  mounted() {
    // 若有歌曲变为已播放
    if (this.musicUrl == "") return;
    this.$store.dispatch("saveIsPlaying", true);

    window.addEventListener("keydown", this.handleKeypress);

    // 暂停播放
    this.pauseSong();
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleKeypress);
  },
};
</script>

<style scoped>
/* 音乐播放栏 */

.musicPlay {
  position: fixed;
  box-shadow: 0 0 1px 1px #b9b5b5;
  bottom: 0;
  width: 100%;
  height: 80px;
  background: rgb(45, 45, 56);
  z-index: 3000;
}
/* 音乐操作 */

#play,
#pause {
  cursor: pointer;
  border-radius: 100%;
  /* width: 40px; */
  height: 40px;
  line-height: 40px;
  text-align: center;
}

#playOrd,
#backSong,
#nextSong {
  cursor: pointer;
  border-radius: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

#playOrd:hover,
#backSong:hover,
#nextSong:hover,
#album:hover {
  color: #ed6566;
}

#album {
  cursor: pointer;
  border-radius: 100%;
  height: 40px;
  line-height: 36px;
  text-align: center;
}

#audioFunc {
  display: grid;
  width: 280px;
  grid-template-columns: repeat(5, 1fr);
  column-gap: 20px;
  margin-top: 1%;
  margin-left: 50%;
  transform: translateX(-50%);
}
/* 播放条样式 */

#playSlider {
  position: absolute;
  width: 43%;
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
}
/* 歌曲详情样式 */

#songDetail {
  position: absolute;
  top: 13px;
  left: 30px;
}

#songName {
  position: absolute;
  width: 160px;
  top: 4px;
  left: 60px;
  opacity: 0.9;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #949495;
}

#authorName {
  position: absolute;
  width: 250px;
  bottom: 7px;
  left: 68px;
  opacity: 0.8;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}

#songName:hover,
#authorName:hover {
  opacity: 1;
}

/** 音质 */
.quality {
  position: absolute;
  width: auto;
  height: 20px;
  right: 270px;
  top: 30px;
  border: 1px solid #949495;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  color: #fff;
  display: inline-block;
  z-index: 1000;
}

.quality-expand {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.quality-text {
  color: #fff;
  cursor: pointer;
}

/* 音量 */

.volume {
  position: absolute;
  width: 200px;
  height: 20px;
  right: 105px;
  top: 30px;
}

::v-deep .volume .el-slider__runway {
  background: #fff;
}

::v-deep .el-tooltip__popper.is-light {
  color: black !important;
}

.selected {
  background-color: #ecf5ff;
  color: #66b1ff;
}

::v-deep .el-dropdown-menu__item.is-disabled {
  color: #ccc; /* 灰色 */
  cursor: not-allowed; /* 禁用状态的鼠标指针 */
  pointer-events: auto; /* 鼠标事件 */
}
</style>