<template>
  <div class="musicList">
    <div id="songSearchHead">
      <span style="position: absolute; left: 2%; color: #fff; font-size: 15px"
        >序号</span
      >
      <span
        style="position: absolute; left: 15%; color: #888888; font-size: 15px"
        >音乐标题</span
      >
      <span
        style="position: absolute; left: 45%; color: #888888; font-size: 15px"
        >歌手</span
      >
      <span
        style="position: absolute; left: 65%; color: #888888; font-size: 15px"
      >
        专辑
      </span>
      <span
        style="position: absolute; left: 85%; color: #888888; font-size: 15px"
        >时长</span
      >
    </div>
    <div
      :class="{ songMesSin: index % 2 !== 0, songMesDou: index % 2 === 0 }"
      v-for="(item, index) in songs"
      :key="index"
      background="#f9f9f9"
      @dblclick="startSong(item, index)"
      @mouseenter="currentIndex = index"
      @mouseleave="currentIndex = -1"
    >
      <div class="songRoot">
        <i
          class="iconfont icon-MV"
          style="color: #ec4141; cursor: default;"
          v-show="item.mv != 0"
        ></i>
        <i
          class="iconfont icon-vip-l"
          style="color: #ec4141; margin-left: 10px"
          v-show="item.privilege.chargeInfoList[0].chargeType !== 0"
        ></i>
      </div>
      <div
        style="
          font-size: 10px;
          position: absolute;
          top: 20px;
          left: 28px;
          color: #ec4141;
        "
        v-if="item.id === songId && isPlaying"
      >
        <playAni />
      </div>
      <i
        class="iconfont icon-zanting"
        style="
          font-size: 10px;
          position: absolute;
          top: 2px;
          left: 28px;
          color: #ec4141;
        "
        v-else-if="item.id === songId && !isPlaying"
      ></i>
      <span
        style="
          font-size: 15px !important;
          position: absolute;
          top: 2px;
          left: 25px;
          color: #373737;
        "
        v-else
        >{{ index >= 9 ? index + 1 : "0" + (index + 1) }}</span
      >
      <div
        :class="{
          pauseSongName: item.id !== songId,
          startSongName: item.id === songId,
          noSongName: item.privilege.st == -200,
        }"
        style="cursor: default"
      >
        <span
          :title="item.name + (!item.alia[0] ? '' : '(' + item.alia[0] + ')')"
          >{{ item.name }}</span
        >
        <span
          style="color: #949495"
          :title="item.name + (!item.alia[0] ? '' : '(' + item.alia[0] + ')')"
          >{{ !item.alia[0] ? "" : "(" + item.alia[0] + ")" }}</span
        >
      </div>
      <div class="songFunc" v-show="index === currentIndex">
        <i class="iconfont icon-xin" style="opacity: 0.9; cursor: pointer"></i>
        <i
          class="iconfont icon-tianjia"
          style="opacity: 0.9; cursor: pointer; margin-left: 10px"
          title="添加到播放列表"
          @click="addList(item, index)"
        ></i>
        <i
          class="iconfont icon-fenxiang"
          style="opacity: 0.9; cursor: pointer; margin-left: 10px"
          title="分享"
        ></i>
      </div>
      <div class="startSongAurtor" style="position: absolute; left: 45%">
        <div
          style="
            width: 160px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
            color: #fff;
          "
        >
          <span
            style="cursor: default"
            v-for="(item, index) in item.ar"
            :key="index"
            >{{ index === 0 ? item.name : "/" + item.name }}</span
          >
        </div>
      </div>
      <div
        style="
          width: 15%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          position: absolute;
          left: 65%;
          cursor: pointer;
          font-weight: 300;
        "
        @click="toAlbumPage(item.al.id)"
      >
        {{ item.al.name }}
      </div>
      <span style="position: absolute; left: 85%">{{
        Math.floor(item.dt / 1000) | timeFormat
      }}</span>
    </div>
    <br />
    <br /><br /><br />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import playAni from "@/components/musicHome/playAnimation/playAni";
export default {
  name: "musicList",
  props: {
    // 歌曲搜索信息
    songs: Array,
  },
  computed: {
    ...mapGetters([
      //当前播放列表
      "playList",
      //当前播放歌曲id
      "songId",
      //是否在播放
      "isPlaying",
      //加载状态
      "isLoading",
      //可播放区域
      "slider",
    ]),
  },
  components: {
    //播放动画
    playAni,
  },
  data() {
    return {
      // 鼠标移入的index
      currentIndex: -1,
    };
  },
  methods: {
    // 双击切换到当前播放
    startSong(musicDetail, index) {
      if (musicDetail.id === this.songId) return;
      if (musicDetail.privilege.st == -200) {
        const h = this.$createElement;
        this.$message.error({
          message: h("p", null, [
            h("span", null, "因版权问题，该歌曲已下架"),
            h(
              "i",
              {
                style: "color: red",
              },
              ""
            ),
          ]),
          offset: 280,
          center: true,
          showClose: true,
        });
        return;
      }
      // 获得音乐url并保存到当前播放url
      this.getMusicUrl(musicDetail.id);
      // 保存到当前播放歌曲详情
      this.$store.dispatch("saveMusicDetail", musicDetail);
      // 保存到当前播放歌曲id
      this.$store.dispatch("saveSongId", musicDetail.id);
      // 放入历史歌单
      this.$store.dispatch("deleteHisListSong", musicDetail.id);
      this.$store.dispatch("unshiftHisMusicList", musicDetail);
      this.addList(musicDetail, index);
    },
    //加入歌单
    addList(musicDetail, index) {
      if (musicDetail.privilege.st == -200) {
        const h = this.$createElement;
        this.$message.error({
          message: h("p", null, [
            h("span", null, "因版权问题，该歌曲已下架"),
            h(
              "i",
              {
                style: "color: red",
              },
              ""
            ),
          ]),
          offset: 280,
          center: true,
          showClose: true,
        });
        return;
      }
      // 放入已经播放过的歌单
      this.$store.dispatch("deleteHasListSong", musicDetail.id);
      this.$store.dispatch("pushHasPlayList", musicDetail);
      // 放入当前播放歌单
      for (let song of this.playList) {
        if (song.id === musicDetail.id) {
          const h = this.$createElement;
          this.$message.error({
            message: h("p", null, [
              h("span", null, "列表中已存在该歌曲"),
              h(
                "i",
                {
                  style: "color: red",
                },
                ""
              ),
            ]),
            offset: 280,
            center: true,
            showClose: true,
          });
          return;
        }
      }
      this.$store.dispatch("pushPlayList", musicDetail);
    },
    //根据id获取音乐url
    async getMusicUrl(musicId) {
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
    //获取指定页数歌曲
    getSongPage(offset, type) {
      this.$emit("getSongPage", offset, type);
    },
    //点击专辑跳转界面
    toAlbumPage(id) {
      this.$router.push("/musicHome/albumPage/" + id);
    },
    //返回第一页
    backNumOne() {
      this.$refs.pagination.backNumOne();
    },
    //点击歌手跳转界面
    toArtistPage(id) {
      this.$router.push("/musicHome/artistPage/" + id);
    },
    //点击视频跳转界面
    toVideoPage(id) {
      this.$router.push("/musicHome/videoPage/" + id);
    },
  },
  created() {
    this.getSongPage(0, "Song");
  },
};
</script>

<style scoped>
/* 标题 */

#songSearchHead {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #fff;
}

/* 每行歌曲样式 */

.songMesSin {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #fff;
}

.songMesDou {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #fff;
  /* background: #f9f9f9; */
}

.songMesSin:hover,
.songMesDou:hover {
  background: rgb(57, 57, 68);
}
/* 判断是否正在播放 */

.pauseSongName {
  position: absolute;
  width: 20%;
  left: 15%;
  opacity: 0.9;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #000000;
}

.startSongName {
  position: absolute;
  width: 20%;
  left: 15%;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: red !important;
}
.noSongName {
  position: absolute;
  width: 20%;
  left: 15%;
  opacity: 0.9;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #bababa !important;
}
.startSongAurtor {
  color: #fff;
}
/* 歌曲操作 */

.songFunc {
  position: absolute;
  left: 37%;
}
/* 歌曲权限 */
.songRoot {
  position: absolute;
  right: 86%;
}
</style>
