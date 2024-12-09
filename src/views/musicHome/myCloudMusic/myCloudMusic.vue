<template>
  <div class="myFavoriteMusic">
    <newMenuTab
      :songs="songsDetail.songs"
      @audioData="handleAudioData"
      @playAll="playAll"
    />
    <!-- 歌曲列表 -->
    <div v-loading="isLoading" element-loading-text="加载中...">
      <musicList v-show="activeIndex === '1'" :songsDetail="songsDetail" />
    </div>
    <br /><br /><br /><br /><br /><br />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import listDetail from "@/components/musicHome/songListPage/listDetail";
import menuTab from "@/components/musicHome/songListPage/menuTab";
import newMenuTab from "@/components/musicHome/songListPage/newMenuTab";
import musicList from "@/components/musicHome/songListPage/musicList";
// import comment from "@/components/musicHome/songListPage/comment";
import img1 from "@/assets/musicList/a1.jpg";
import img2 from "@/assets/musicList/a2.jpg";
import img3 from "@/assets/musicList/a3.jpg";
import music1 from "@/assets/music/a1.mp3";
import music2 from "@/assets/music/a2.mp3";
import music3 from "@/assets/music/a3.mp3";
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
    };
  },
  methods: {
    // 获取歌单详情数据
    async getPlayListDetail() {
      this.$store.dispatch("changeIsLoading", true);
      // await this.$http
      //   .get("playlist/detail", {
      //     params: {
      //       id: this.currentId,
      //     },
      //   })
      //   .then((res) => {
      //     console.log(res.data);
      //     this.playList = res.data.playlist;
      //     this.playList.trackIds.forEach((item) => {
      //       this.queryIds += item.id + ",";
      //     });
      //   });
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
      } catch (error) {
        console.error("获取歌曲数据失败:", error);
        this.$message.error(error.message || "获取歌曲数据失败");
      }
      // this.$http
      //   .get("song/detail", {
      //     params: {
      //       ids: this.queryIds.substr(0, this.queryIds.length - 1),
      //     },
      //   })
      //   .then((res) => {
      //     console.log("获取歌曲数据成功：", res.data);
      //     // this.songsDetail = res.data;
      //     // 过滤vip歌曲
      //     let filteredSongs = [];
      //     let filteredPrivileges = [];
      //     res.data.songs.forEach((item, index) => {
      //       if (item.fee != 1) {
      //         filteredSongs.push(item);
      //         filteredPrivileges.push(res.data.privileges[index]);
      //       }
      //     });
      //     // 更新状态
      //     this.songsDetail = {
      //       songs: filteredSongs,
      //       code: res.data.code,
      //       privileges: filteredPrivileges,
      //     };
      //     console.log("歌曲数据：", this.songsDetail);
      //   });
      try {
        const response = await this.$authHttp.get("/api/user/songs", {
          params: {
            username: this.userInfo.username,
            playlist_type: 1,
          },
        });

        console.log("/api/user/songs:", response);
        // response.data.songsDetail.code = 200;
        this.songsDetail = response.data.songsDetail;

        // localStorage.setItem("selectedFolders", "检索成功");
        // window.location.reload();
      } catch (error) {
        console.error("获取歌曲数据失败:", error);
        // this.$message.error(error.message || "检索失败");
      }
    },
    // 获取评论数据
    getCommentPage(page) {
      this.$store.dispatch("changeIsLoading", true);
      // this.$http
      //   .get("comment/playlist", {
      //     params: {
      //       id: this.currentId,
      //       limit: 20,
      //       offset: page * 20,
      //     },
      //   })
      //   .then((res) => {
      //     if (page == 0) {
      //       this.comment = res.data;
      //     } else {
      //       this.comment.comments = res.data.comments;
      //     }
      //     console.log(res.data);
      this.$store.dispatch("changeIsLoading", false);
      //   });
    },
    // 改变导航栏
    changeActive(index) {
      this.activeIndex = index;
    },
    playMusic() {
      console.log("播放音乐");
      // 如果audio对象不存在，创建一个新的
      if (!this.audio) {
        this.audio = new Audio(music1);
      }
      // 如果音乐正在播放，暂停它；否则开始播放
      if (this.audio.paused) {
        this.audio
          .play()
          .then(() => {
            console.log("音乐开始播放");
          })
          .catch((error) => {
            console.error("播放出错:", error);
          });
      } else {
        this.audio.pause();
        console.log("音乐已暂停");
      }
    },
    handleAudioData() {
      // this.receivedAudioData = data; // 更新父组件的状态
      // console.log("从子组件接收到的音频数据：", this.receivedAudioData);

      // this.songsDetail.songs[0].url = this.receivedAudioData[0].url;
      // this.songsDetail.songs[1].url = this.receivedAudioData[1].url;
      // this.songsDetail.songs[2].url = this.receivedAudioData[2].url;

      // this.songsDetail.songs[0].dt = this.receivedAudioData[0].duration;
      // this.songsDetail.songs[1].dt = this.receivedAudioData[1].duration;
      // this.songsDetail.songs[2].dt = this.receivedAudioData[2].duration;
      this.getPlayListDetail();
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
    async getMusicUrl(musicId, isSelf, musicUrl) {
      console.log("是否是自定义音乐：" + isSelf);
      if (isSelf) {
        this.$store.dispatch("saveAur", [0, 0]);
        this.$store.dispatch("saveMusicUrl", musicUrl);
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
