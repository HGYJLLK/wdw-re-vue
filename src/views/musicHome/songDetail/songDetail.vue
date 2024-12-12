<template>
  <div class="singel" v-if="songId" ref="scroll">
    <div class="singel-main">
      <div class="singel-top">
        <div class="bck-img"></div>
        <div class="singel-play-img">
          <div
            :class="{ playBar: isPlaying, playBarReverse: !isPlaying }"
            ref="playBar"
          >
            <img src="@/assets/image/player_bar.png" />
          </div>
          <div
            class="play-disc"
            ref="playDisc"
            :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }"
          >
            <img
              src="@/assets/image/disc.png"
              style="width: 350px; height: 350px"
            />
            <img
              style="
                position: absolute;
                top: 22%;
                left: 22%;
                width: 195px;
                height: 195px;
                border-radius: 50%;
              "
              :src="musicDetail.al.picUrl"
              alt
            />
          </div>
        </div>
        <div class="singer-text">
          <div class="singel-title">
            <span
              style="
                font-size: 25px;
                font-weight: 500;
                margin-right: 5%;
                color: #fff;
              "
              >{{ musicDetail.name || musicDetail.al.name }}</span
            >
            <span
              style="
                border: 1px solid red;
                font-size: 12px;
                color: red;
                padding: 1px 4px;
              "
              >{{ currentQuality }}</span
            >
            <div style="margin: 19px 0; fontsize: 13px">
              <div
                style="
                  display: inline-block;
                  color: #00bfff;
                  width: 170px;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  word-break: break-all;
                "
              >
                <span style="color: #fff">歌手:</span
                ><span style="cursor: default">{{
                  musicDetail.ar[0].name
                }}</span>
              </div>
            </div>
          </div>
          <div class="lyric">
            <!--歌词-->
            <div class="showLyric" ref="lyricScroll">
              <ul ref="lyric" v-if="lrcObject.length > 1">
                <li
                  v-for="(item, index) in lrcObject"
                  :key="index"
                  :style="{ color: lyricIndex === index ? 'red' : 'white' }"
                  :ref="[lyricIndex === index ? 'lyricRef' : '']"
                >
                  {{ item.c }}
                </li>
              </ul>
              <div v-else-if="musicDetail.self">暂无歌词</div>
              <div v-else>纯音乐，请您欣赏</div>
            </div>
          </div>
        </div>
        <div class="singel-back">
          <el-button
            @click="comBack"
            icon="el-icon-arrow-down"
            size="small"
          ></el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
export default {
  name: "Singel",
  components: {},
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
      //当前进度条
      "nowDuration",
      //是否加载
      "isLoading",
      // 当前音质,
      "currentQuality",
    ]),
  },
  watch: {
    //切换了歌曲时
    songId() {
      this.resetLyricScroll();
      this.offsets = 0;
      this.timerId = 0;
      this.lyricIndex = 0;
      this.getSongLyric(this.songId);
      // this.$refs.comment.backNumOne();
    },
    //歌曲播放状态
    isPlaying() {},
    //歌曲进度条变化
    nowDuration() {
      let index = this.findCurLyricIndex(this.nowDuration);
      if (index !== this.lyricIndex) {
        this.lyricIndex = index;
        this.$nextTick(() => {
          this.scrollToActiveLyric();
        });
      }
    },
  },
  data() {
    return {
      // 歌词
      lyrics: "",
      // 存放歌词数组
      lrcObject: [],
      lyricIndex: 0,
      timerId: 0,
      //歌曲评论
      comment: {},
    };
  },
  methods: {
    //收缩页面
    comBack() {
      this.$router.back();
    },
    //获取歌词
    getSongLyric(id) {
      this.$http
        .get("/lyric", {
          params: {
            id: id,
          },
        })
        .then((res) => {
          this.lyrics = res.data.lrc.lyric;
          this.createLrcObj(this.lyrics);
        });
    },
    //解析歌词
    createLrcObj(lrc) {
      var oLRC = {
        ms: [], //歌词数组{t:时间,c:歌词}
      };
      if (lrc.length == 0) return;
      var lrcs = lrc.split("\n"); //用回车拆分成数组 (每一句歌词都用换行隔开了)
      for (let i in lrcs) {
        //遍历歌词数组
        lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
        var arr = lrcs[i].match(/\[(\d+:.+?)\]/g); //提取时间字段，可能有多个
        var start = 0;
        for (let k in arr) {
          start += arr[k].length; //计算歌词位置 长度叠加
        }
        var content = lrcs[i].substring(start); //获取歌词内容 相当于减去时间字符串的长度剩下的就是内容
        for (let k in arr) {
          var t = arr[k].substring(1, arr[k].length - 1); //取[]间的内容
          // var t = arr[k]
          var s = t.split(":"); //分离:前后文字 便于计算成毫秒数
          oLRC.ms.push({
            //对象{t:时间,c:歌词}加入ms数组
            // t: t,
            t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
            c: content === "" ? "\n" : content,
          });
        }
      }
      oLRC.ms.sort(function (a, b) {
        //按时间顺序排序
        return a.t - b.t;
      });
      this.lrcObject = oLRC.ms;
    },
    findCurLyricIndex(nowDuration) {
      for (let i = 0; i < this.lrcObject.length; i++) {
        if (nowDuration < parseFloat(this.lrcObject[i].t)) {
          return i - 1;
        }
      }
      // 找遍了都没找到（说明播放到最后一句）
      return this.lrcObject.length - 1;
    },
    resetLyricScroll() {
      const container = this.$refs.lyricScroll;
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }
    },
    scrollToActiveLyric() {
      const container = this.$refs.lyricScroll;
      if (!container) return;

      const lyricElements = container.querySelectorAll("li");
      const activeLyric = lyricElements[this.lyricIndex];

      if (container && activeLyric) {
        const containerRect = container.getBoundingClientRect();
        const lyricRect = activeLyric.getBoundingClientRect();

        const scrollTop =
          container.scrollTop +
          lyricRect.top -
          containerRect.top -
          containerRect.height / 2 +
          lyricRect.height / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }
    },
  },
  created() {
    this.getSongLyric(this.songId);
  },
  mounted() {},
};
</script>

<style scoped>
.singer-left {
  width: 65%;
}
.singer-right {
  width: 30%;
  margin-left: 20px;
}
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #cecdd3;
  border-radius: 3px;
}
li {
  margin-top: 15px;
  list-style: none;
}
.singel-back {
  position: absolute;
  top: 0;
  right: 0;
}
.bck-img {
  position: absolute;
  width: 50%;
  top: 0;
  left: 40%;
  transform: translateX(-50%);
  z-index: 0;
}
.lyric {
  position: relative;
  z-index: 199;
  /* overflow: auto;
  max-height: 320px;
  width: 400px;
  border: 1px solid red; */
}
.singer-text {
  width: 50%;
  margin-left: 15%;
}
.singel {
  position: fixed;
  width: 100%;
  height: 100vh;
  padding-top: 20px;
  margin-top: -20px;
  overflow-y: hidden;
  overflow-x: hidden;
}
.singel:hover {
  overflow-y: overlay;
}
.singel-main {
  margin-left: 8%;
  margin-top: 2%;
  width: 70%;
}
.singel-top {
  display: flex;
  position: relative;
  margin-bottom: 5%;
}
.singel-play-img {
  margin-left: 35px;
  position: relative;
}
/* 拨动片 */
.playBar {
  position: absolute;
  top: 0px;
  left: 55%;
  z-index: 10;
  transform: rotate(-45deg);
  animation-name: bar;
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
  transform-origin: 0 0;
}
@keyframes bar {
  to {
    transform: rotate(0deg);
  }
}
.playBarReverse {
  position: absolute;
  top: 0px;
  left: 55%;
  z-index: 10;
  transform: rotate(0deg);
  animation-name: rebar;
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
  transform-origin: 0 0;
}
@keyframes rebar {
  to {
    transform: rotate(-45deg);
  }
}
/* 唱片 */
.play-disc {
  margin-top: 50px;
  animation-name: record;
  animation-duration: 20s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
@keyframes record {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes record {
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
.showLyric {
  width: 350px;
  height: 385px;
  overflow-y: scroll;
  /* scroll-behavior: smooth; */
  margin-top: 25px;
  transition: scrollTop 0.3s;
}

/* .showLyric::-webkit-scrollbar {
  display: none;
} */

.showLyric:hover {
  overflow-y: scroll;
}
::v-deep .el-button {
  background: rgb(19, 19, 26);
  border: 1px solid rgb(43, 43, 49);
}
</style>
