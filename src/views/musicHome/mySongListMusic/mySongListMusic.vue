<template>
  <div class="myFavoriteMusic">
    <!-- 歌单细节 -->
    <listDetail :playList="playList" :songsDetail="songsDetail" />
    <div style="margin-top: 15px"></div>
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
import musicList from "@/components/musicHome/songListPage/musicList";
import defaultAvatar from "@/assets/image/default.png";
import defaultAvatar2 from "@/assets/image/default.jpg";
export default {
  name: "myFavoriteMusic",
  components: {
    listDetail,
    menuTab,
    musicList,
  },
  watch: {
    $route: function (newVal, oldVal) {
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
        avatarUrl: this.userInfo.avatarUrl || defaultAvatar2,
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
        // 判断是否有歌曲，设置封面图片
        if (this.songsDetail?.songs?.length > 0) {
          const coverImgUrl =
            this.songsDetail.songs[0]?.al?.picUrl || defaultAvatar;
          this.playList.coverImgUrl = coverImgUrl;
        } else {
          this.playList.coverImgUrl = defaultAvatar;
        }
        this.$store.dispatch("changeIsLoading", false);
      } catch (error) {
        console.error("获取歌曲数据失败:", error);
        this.$message.error(error.message || "获取歌曲数据失败");
        // 设置默认封面图
        this.playList.coverImgUrl = defaultAvatar;
      } finally {
        this.$store.dispatch("changeIsLoading", false);
      }
    },
    // 改变导航栏
    changeActive(index) {
      this.activeIndex = index;
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
