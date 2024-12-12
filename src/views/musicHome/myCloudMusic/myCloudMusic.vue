<template>
  <div class="myFavoriteMusic">
    <newMenuTab
      :songs="songsDetail.songs"
      @audioData="handleAudioData"
      @playAll="playAll"
      :totalFileSizeGB="totalSizeGB"
    />
    <!-- 歌曲列表 -->
    <div v-loading="isLoading" element-loading-text="加载中...">
      <musicList
        v-show="activeIndex === '1'"
        :songsDetail="songsDetail"
        :type="type"
        @audioData="handleAudioData"
      />
    </div>
    <br /><br /><br /><br /><br /><br />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import listDetail from "@/components/musicHome/songListPage/listDetail";
import menuTab from "@/components/musicHome/songListPage/menuTab";
import newMenuTab from "@/components/musicHome/songListPage/newMenuTab";
import musicList from "@/components/musicHome/songListPage/musicList";
export default {
  name: "myFavoriteMusic",
  components: {
    listDetail,
    menuTab,
    musicList,
    // comment,
    newMenuTab,
  },
  props: {
    audioData: Array,
  },
  watch: {
    $route: function (newVal, oldVal) {
      console.log("路由发生变化", newVal, oldVal);

      this.currentId = newVal.params.id;
      if (newVal.params.id != oldVal.params.id) {
        this.queryIds = "";
        this.getPlayListDetail();
      }
    },
  },
  computed: {
    ...mapGetters([
      // 加载状态
      "isLoading",
      // 用户信息
      "userInfo",
    ]),
  },
  data() {
    return {
      // 传入的id
      currentId: this.$route.params.id,
      // 歌单数据
      playList: {},
      // 导航页面
      activeIndex: "1",
      // 请求的歌曲id
      queryIds: "",
      // 歌曲数据
      songsDetail: {
        // songs: [
        //   {
        //     id: 1,
        //     name: "Song One",
        //     ar: [{ name: "Artist One" }],
        //     al: {
        //       picUrl: img1,
        //     },
        //     dt: 307173, // 时长（毫秒）
        //     mv: 0, // 没有MV
        //     alia: [],
        //     self: true, // 是否为用户自己上传的歌曲
        //     fee: 8,
        //     st: 0,
        //   },
        //   {
        //     id: 2,
        //     name: "Song Two",
        //     ar: [{ name: "Artist Two" }, { name: "Artist Three" }],
        //     al: {
        //       picUrl: img2,
        //     },
        //     dt: 307173,
        //     mv: 1, // 有MV
        //     alia: [],
        //     self: true, // 是否为用户自己上传的歌曲
        //     fee: 8,
        //     st: 0,
        //   },
        //   {
        //     id: 3,
        //     name: "Song Three",
        //     ar: [{ name: "Artist Four" }],
        //     al: {
        //       picUrl: img3,
        //     },
        //     dt: 307173,
        //     mv: 0,
        //     alia: [],
        //     self: true, // 是否为用户自己上传的歌曲
        //     fee: 8,
        //     st: 0,
        //   },
        // ],
        // privileges: [
        //   { chargeInfoList: [{ chargeType: 0 }], st: 0 }, // 免费歌曲
        //   { chargeInfoList: [{ chargeType: 0 }], st: 0 },
        //   { chargeInfoList: [{ chargeType: 0 }], st: 0 },
        // ],
      },
      receivedAudioData: [],
      // 评论数据
      comment: {},
      audio: null,
      // 歌单类型
      type: 1,
      // 歌单大小
      totalSizeGB: 0,
    };
  },
  methods: {
    // 获取歌单详情数据
    async getPlayListDetail() {
      this.$store.dispatch("changeIsLoading", true);
      this.getSongDetail();
      this.getCommentPage(0);
    },
    // 获取歌曲数据
    async getSongDetail() {
      try {
        const response = await this.$authHttp.get("/api/user/songs", {
          params: {
            username: this.userInfo.username,
            playlist_type: 1,
          },
        });

        // this.$message.success("获取歌曲数据成功");
        this.songsDetail = response.data.songsDetail;
        console.log("歌单数据：", this.songsDetail);
        let totalSizeBytes = 0;
        // 遍历 songsDetail 中的 songs
        if (this.songsDetail.songs && Array.isArray(this.songsDetail.songs)) {
          for (let song of this.songsDetail.songs) {
            // 检查 file_size 是否存在
            console.log("file_size:", song.file_size);

            if (song.file_size) {
              totalSizeBytes += song.file_size; // 累加 file_size（单位：字节）
            }
          }
        }

        console.log("歌单总大小（字节）：", totalSizeBytes);

        this.totalSizeGB = (totalSizeBytes / 1024 / 1024 / 1024).toFixed(1);
        console.log("歌单总大小：", this.totalSizeGB);
      } catch (error) {
        console.error("获取歌曲数据失败:", error);
        this.$message.error(error.message || "获取歌曲数据失败");
      }
    },
    getCommentPage(page) {
      this.$store.dispatch("changeIsLoading", true);
      this.$store.dispatch("changeIsLoading", false);
    },
    // 改变导航栏
    changeActive(index) {
      this.activeIndex = index;
    },
    async handleAudioData() {
      await this.getPlayListDetail();
    },
    // 全部播放
    playAll() {
      let songList = [];
      for (let song of this.songsDetail.songs) {
        if (song.st != -200) {
          songList.push(song);
        }
      }
      // 全部加入歌单
      this.$store.dispatch("playAllSong", songList);
      // 获得音乐url并保存到当前播放url
      this.getMusicUrl(songList[0].id, songList[0].self, songList[0].url);
      this.$store.dispatch("deleteHisListSong", songList[0].id);
      this.$store.dispatch("unshiftHisMusicList", songList[0]);
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
          console.log("将要播放的歌曲的url：", res);

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
  },
  created() {
    this.getPlayListDetail();
    console.log("歌单总大小：", this.totalSizeGB);
  },
};
</script>

<style scoped>
.myFavoriteMusic {
  height: 100vh;
  width: 100%;
  /* overflow-y: hidden; */
  overflow-x: hidden;
  padding-right: 17px;
  padding-left: 3px;
}
.myFavoriteMusic:hover {
  overflow-y: overlay;
}
</style>
