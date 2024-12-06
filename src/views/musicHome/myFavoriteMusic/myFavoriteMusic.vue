<template>
  <div class="myFavoriteMusic">
    <!-- 歌单细节 -->
    <listDetail :playList="playList" :songsDetail="songsDetail" />
    <!-- 导航栏 -->
    <!-- <menuTab
      ref="menuTab"
      @changeActive="changeActive"
      :commentCount="comment.total"
    /> -->
    <div style="margin-top: 15px"></div>
    <!-- 歌曲列表 -->
    <div v-loading="isLoading" element-loading-text="加载中...">
      <musicList v-show="activeIndex === '1'" :songsDetail="songsDetail" />
      <!-- 评论 -->
      <!-- <comment
        :comment="comment"
        v-show="activeIndex === '2'"
        @getCommentPage="getCommentPage"
        :currentId = "currentId"
      /> -->
      <!-- 收藏者 -->
    </div>
    <br /><br /><br /><br /><br /><br />

    <!-- <div>
      <button @click="playMusic">点击我播放音乐</button>
    </div> -->
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import listDetail from "@/components/musicHome/songListPage/listDetail";
import menuTab from "@/components/musicHome/songListPage/menuTab";
import musicList from "@/components/musicHome/songListPage/musicList";
// import comment from "@/components/musicHome/songListPage/comment";
import img1 from "@/assets/musicList/a1.jpg";
import img2 from "@/assets/musicList/a2.jpg";
import img3 from "@/assets/musicList/a3.jpg";
import music1 from "@/assets/music/a1.mp3";
import music2 from "@/assets/music/a2.mp3";
import music3 from "@/assets/music/a3.mp3";
import defaultAvatar from "@/assets/image/default.jpg";
export default {
  name: "myFavoriteMusic",
  components: {
    listDetail,
    menuTab,
    musicList,
    // comment,
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
      // 登录信息
      "userInfo",
    ]),
  },
  data() {
    return {
      // 传入的id
      currentId: this.$route.params.id,

      // 导航页面
      activeIndex: "1",
      // 请求的歌曲id
      queryIds: "",
      // 歌曲数据
      songsDetail: {
        songs: [
          {
            id: 1,
            name: "Song One",
            ar: [{ id: 101, name: "Artist One" }],
            al: {
              id: 201,
              name: "Album One",
              picUrl: img1,
            },
            dt: 240000, // 时长（毫秒）
            mv: 0, // 没有MV
            alia: [],
            self: true, // 是否为用户自己上传的歌曲
            url: music1, // 歌曲链接
            fee: 8,
          },
          {
            id: 2,
            name: "Song Two",
            ar: [
              { id: 102, name: "Artist Two" },
              { id: 103, name: "Artist Three" },
            ],
            al: {
              id: 202,
              name: "Album Two",
              picUrl: img2,
            },
            dt: 200000,
            mv: 1, // 有MV
            alia: [],
            self: true, // 是否为用户自己上传的歌曲
            url: music2,
            fee: 8,
          },
          {
            id: 3,
            name: "Song Three",
            ar: [{ id: 104, name: "Artist Four" }],
            al: {
              id: 203,
              name: "Album Three",
              picUrl: img3,
            },
            dt: 300000,
            mv: 0,
            alia: [],
            self: true, // 是否为用户自己上传的歌曲
            url: music3,
            fee: 8,
          },
          {
            name: "Re:Re:",
            id: 2612360323,
            ar: [{ id: 54103171, name: "結束バンド", tns: [], alias: [] }],
            alia: [],
            fee: 8,
            al: {
              id: 243454282,
              name: "Re:結束バンド",
              picUrl:
                "https://p2.music.126.net/pYKoTtD_-zd1oC5eJ3jkdA==/109951169826632561.jpg",
              tns: [],
              pic_str: "109951169826632561",
              pic: 109951169826632560,
            },
            dt: 307173,
          },
        ],
        privileges: [
          { chargeInfoList: [{ chargeType: 0 }], st: 0 }, // 免费歌曲
          { chargeInfoList: [{ chargeType: 0 }], st: 0 },
          { chargeInfoList: [{ chargeType: 0 }], st: 0 },
          {
            chargeInfoList: [{ chargeType: 0 }],
            st: 0,
            // pl: 128000,
            // dl: 0,
            // sp: 7,
            // cp: 1,
            // subp: 1,
            // cs: false,
            // maxbr: 320000,
            // fl: 320000,
            // toast: false,
            // flag: 524548,
            // preSell: false,
            // playMaxbr: 320000,
            // downloadMaxbr: 320000,
            // maxBrLevel: "exhigh",
            // playMaxBrLevel: "exhigh",
            // downloadMaxBrLevel: "exhigh",
            // plLevel: "standard",
            // dlLevel: "none",
            // flLevel: "exhigh",
            // rscl: null,
            // freeTrialPrivilege: {
            //   resConsumable: false,
            //   userConsumable: false,
            //   listenType: 0,
            //   cannotListenReason: 1,
            //   playReason: null,
            //   freeLimitTagType: null,
            // },
            // rightSource: 0,
            // chargeInfoList: [
            //   {
            //     rate: 128000,
            //     chargeUrl: null,
            //     chargeMessage: null,
            //     chargeType: 0,
            //   },
            //   {
            //     rate: 192000,
            //     chargeUrl: null,
            //     chargeMessage: null,
            //     chargeType: 0,
            //   },
            //   {
            //     rate: 320000,
            //     chargeUrl: null,
            //     chargeMessage: null,
            //     chargeType: 0,
            //   },
            //   {
            //     rate: 999000,
            //     chargeUrl: null,
            //     chargeMessage: null,
            //     chargeType: 1,
            //   },
            // ],
            // code: 0,
            // message: null,
          },
        ],
      },
      // 歌单数据
      playList: {
        // coverImgUrl: this.songsDetail.songs[0].al.picUrl,
        // name: "我喜欢的音乐",
        // creator: {
        //   nickname: this.userInfo.nickname,
        //   avatarUrl: this.userInfo.avatarUrl,
        // },
      },
      // 评论数据
      comment: {},
      audio: null,
    };
  },
  methods: {
    // 获取歌单详情数据
    async getPlayListDetail() {
      this.$store.dispatch("changeIsLoading", true);
      this.playList.coverImgUrl = this.songsDetail.songs[0].al.picUrl;
      this.playList.name = "我喜欢的音乐";
      this.playList.creator = {
        nickname: this.userInfo.nickname,
        avatarUrl: this.userInfo.avatarUrl || defaultAvatar,
        username: this.userInfo.username,
      };
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
      // this.getSongDetail();
      this.getCommentPage(0);
    },
    // 获取歌曲数据
    getSongDetail() {
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
