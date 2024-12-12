<template>
  <div class="songListPage">
    <!-- 歌单细节 -->
    <listDetail :playList="playList" :songsDetail="songsDetail" />
    <!-- 歌曲列表 -->
    <div style="margin-top: 10px"></div>
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
import musicList from "@/components/musicHome/songListPage/musicList";
export default {
  name: "songListPage",
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
      songsDetail: {},
      temp: {},
    };
  },
  methods: {
    // 获取歌单详情数据
    async getPlayListDetail() {
      this.$store.dispatch("changeIsLoading", true);
      await this.$http
        .get("playlist/detail", {
          params: {
            id: this.currentId,
          },
        })
        .then((res) => {
          console.log(res.data);
          this.playList = res.data.playlist;
          this.playList.trackIds.forEach((item) => {
            this.queryIds += item.id + ",";
          });
        });
      this.getSongDetail();
      this.$store.dispatch("changeIsLoading", false);
    },
    // 获取歌曲数据
    getSongDetail() {
      this.$http
        .get("song/detail", {
          params: {
            ids: this.queryIds.substr(0, this.queryIds.length - 1),
          },
        })
        .then((res) => {
          // this.songsDetail = res.data;
          // 过滤vip歌曲
          let filteredSongs = [];
          let filteredPrivileges = [];

          res.data.songs.forEach((item, index) => {
            if (item.fee != 1) {
              filteredSongs.push(item);
              filteredPrivileges.push(res.data.privileges[index]);
            }
          });

          // 更新状态
          this.songsDetail = {
            songs: filteredSongs,
            code: res.data.code,
            privileges: filteredPrivileges,
          };

          this.temp = {
            songs: filteredSongs[0],
            code: res.data.code,
            privileges: filteredPrivileges[0],
          };
        });
    },
    // 改变导航栏
    changeActive(index) {
      this.activeIndex = index;
    },
  },
  created() {
    this.getPlayListDetail();
  },
};
</script>

<style scoped>
.songListPage {
  height: 100vh;
  width: 100%;
  /* overflow-y: hidden; */
  overflow-x: hidden;
  padding-right: 17px;
  padding-left: 3px;
}
.songListPage:hover {
  overflow-y: overlay;
}
</style>
