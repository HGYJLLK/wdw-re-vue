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
      <musicList
        v-show="activeIndex === '1'"
        :songsDetail="songsDetail"
        :type="type"
        @audioData="handleAudioData"
      />
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
import { mapGetters } from "vuex";
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
      songsDetail: {},
      // 歌单数据
      playList: {
        coverImgUrl: defaultAvatar, // 默认图片
      },
      // 评论数据
      comment: {},
      audio: null,
      // 歌单类型
      type: 3,
    };
  },
  methods: {
    // 获取歌单详情数据
    async getPlayListDetail() {
      this.$store.dispatch("changeIsLoading", true);

      this.playList.name = "我喜欢的音乐";
      this.playList.creator = {
        nickname: this.userInfo.nickname,
        avatarUrl: this.userInfo.avatarUrl || defaultAvatar,
        username: this.userInfo.username,
      };

      try {
        // 请求歌曲详情
        const response = await this.$authHttp.get("/api/user/songs", {
          params: {
            username: this.userInfo.username,
            playlist_type: 2,
          },
        });

        this.songsDetail = response.data.songsDetail;
        console.log("歌单数据：", this.songsDetail);

        // 判断是否有歌曲，设置封面图片
        if (this.songsDetail?.songs?.length > 0) {
          const coverImgUrl =
            this.songsDetail.songs[0]?.al?.picUrl || defaultAvatar;
          this.playList.coverImgUrl = coverImgUrl;
        } else {
          this.playList.coverImgUrl = defaultAvatar;
        }

        console.log("封面图设置为：", this.playList.coverImgUrl);

        this.getCommentPage(0);
      } catch (error) {
        console.error("获取歌曲数据失败:", error);
        this.$message.error(error.message || "获取歌曲数据失败");
        // 设置默认封面图
        this.playList.coverImgUrl = defaultAvatar;
      } finally {
        this.$store.dispatch("changeIsLoading", false);
      }
    },
    // 获取歌曲数据
    // async getSongDetail() {
    //   try {
    //     const response = await this.$authHttp.get("/api/user/songs", {
    //       params: {
    //         username: this.userInfo.username,
    //         playlist_type: 2,
    //       },
    //     });

    //     // this.$message.success("获取歌曲数据成功");
    //     this.songsDetail = response.data.songsDetail;
    //     console.log("歌单数据：", this.songsDetail);
    //   } catch (error) {
    //     console.error("获取歌曲数据失败:", error);
    //     this.$message.error(error.message || "获取歌曲数据失败");
    //   }
    // },
    getCommentPage(page) {
      this.$store.dispatch("changeIsLoading", true);
      this.$store.dispatch("changeIsLoading", false);
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
      this.getPlayListDetail();
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
