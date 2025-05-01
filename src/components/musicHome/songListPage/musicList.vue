<template>
  <div class="musicList">
    <contextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :song="currentSong"
      @action="handleContextMenuAction"
      @close="hideContextMenu"
      :type="type"
      :index="currentIndex"
      @updateHeight="updateContextMenuHeight"
    />
    <div
      class="row"
      v-for="(item, index) in songsDetail.songs"
      :key="index"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      @mouseenter="hoverIn(index)"
      @mouseleave="hoverOut(index)"
      @dblclick="startSong(item, index)"
      :class="{ 'disabled-music': isMusicDisabled(item.id) }"
    >
      <div
        style="font-size: 50px; color: #ec4141; width: 15%"
        v-if="item.id === songId && isPlaying && !item.is_disabled"
      >
        <playAni />
      </div>
      <i
        class="iconfont icon-zanting"
        style="font-size: 50px; color: #ec4141; width: 15%"
        v-else-if="item.id === songId && !isPlaying && !item.is_disabled"
      ></i>
      <div class="number" v-else-if="!item.is_disabled">
        #{{ (index + 1).toString().padStart(3, "0") }}
      </div>
      <!-- <div class="disabled-icon" v-else>
        <i class="iconfont icon-jinzhi"></i>
      </div> -->
      <!-- <div class="number">#{{ item.number }}</div> -->
      <div class="row-main">
        <div class="row-container">
          <div class="small-image">
            <img :src="item.al.picUrl" alt="Small Image" />
          </div>
          <div class="large-image">
            <img :src="item.al.picUrl" alt="Large Image" />
          </div>
          <div class="text">{{ item.name }}</div>
        </div>
      </div>

      <div class="artist">
        <b
          style="cursor: default"
          v-for="(item, index) in item.ar"
          :key="index"
          >{{ index === 0 ? item.name : "/" + item.name }}</b
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import playAni from "@/components/musicHome/playAnimation/playAni";
import contextMenu from "@/components/musicHome/contextMenu/contextMenu";
import { gsap } from "gsap";
export default {
  name: "musicList",
  props: {
    // 歌曲搜索信息
    songsDetail: {
      type: Object,
      default: () => ({ songs: [] }),
    },
    // 歌曲类型
    type: {
      type: Number,
      default: -1,
    },
  },
  watch: {
    songsDetail(newVal) {},
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
      //用户信息
      "userInfo",
    ]),
    // disabledMusicIdsComputed() {
    //   return this.disabledMusicIds;
    // },
  },
  components: {
    //播放动画
    playAni,
    contextMenu,
  },
  data() {
    return {
      // 鼠标移入的index
      currentIndex: -1,
      temp: {},
      contextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      currentSong: null,
      menuHeight: 0,
      disabledMusicIds: [], // 存储被禁用的音乐ID
      isAddingToPlaylist: false,
    };
  },
  methods: {
    // 双击切换到当前播放
    async startSong(musicDetail, index) {
      // console.log(
      //   "this.songsDetail.privileges[index].st",
      //   this.songsDetail.privileges[index].st
      // );
      // console.log("musicDetail.id", musicDetail.id);
      // console.log("this.songId", this.songId);
      if (musicDetail.is_disabled) {
        this.$message.error("此音乐已被管理员禁用");
        return;
      }
      if (musicDetail.id === this.songId) return;
      if (this.songsDetail.privileges[index].st == -200) {
        return;
      }

      if (!musicDetail.self) {
        try {
          const statusResponse = await this.$authHttp.get("/api/music/status", {
            params: {
              id: musicDetail.id,
            },
          });

          if (statusResponse.data.is_disabled) {
            this.$message.error("该音乐已被管理员禁用");
            return; // 如果被禁用，直接返回不播放
          }
        } catch (error) {
          console.error("检查音乐状态失败:", error);
        }
      }
      // 获得音乐url并保存到当前播放url
      /**
       * 如果musicDetail存在self属性，说明是自定义音乐，直接获取musicDetail.url
       * 否则，需要请求接口获取音乐url
       */
      this.getMusicUrl(musicDetail.id, musicDetail.self, musicDetail.url);
      // 保存到当前播放歌曲详情
      this.$store.dispatch("saveMusicDetail", musicDetail);
      // 保存到当前播放歌曲id
      this.$store.dispatch("saveSongId", musicDetail.id);
      // 放入历史歌单
      this.$store.dispatch("deleteHisListSong", musicDetail.id);
      this.$store.dispatch("unshiftHisMusicList", musicDetail);
      this.addList(musicDetail, index);
    },

    async fetchDisabledMusic() {
      try {
        const response = await this.$authHttp.get("/api/disabled-music");
        this.disabledMusicIds = response.data.disabled_music_ids || [];
        console.log("已禁用音乐ID列表:", this.disabledMusicIds);
        this.$forceUpdate(); // 强制更新视图
      } catch (error) {
        console.error("获取禁用音乐列表失败:", error);
        this.disabledMusicIds = [];
      }
    },
    //加入歌单
    addList(musicDetail, index) {
      console.log(
        "this.songsDetail.privileges[index].st",
        this.songsDetail.privileges[index].st
      );
      if (this.songsDetail.privileges[index].st == -200) {
        return;
      }
      // 放入已经播放过的歌单
      this.$store.dispatch("deleteHasListSong", musicDetail.id);
      this.$store.dispatch("pushHasPlayList", musicDetail);
      // 放入当前播放歌单
      for (let song of this.playList) {
        if (song.id === musicDetail.id) {
          console.log("是否运行");
          return;
        }
      }
      this.$store.dispatch("pushPlayList", musicDetail);
      // 获得push后的歌单
      console.log(this.$store.state.playList);
      console.log(this.$store.state.hasPlayList);
    },
    //根据id获取音乐url
    async getMusicUrl(musicId, isSelf, url) {
      if (isSelf) {
        console.log("是否是自定义音乐：" + isSelf);

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
    //获取指定页数歌曲
    getSongPage(offset, type) {
      this.$emit("getSongPage", offset, type);
    },
    //返回第一页
    backNumOne() {
      this.$refs.pagination.backNumOne();
    },

    hoverIn(index) {
      const rows = this.$el.querySelectorAll(".row");

      // 遍历所有行，重置非当前行的状态
      rows.forEach((row, i) => {
        const smallImage = row.querySelector(".small-image img");
        const largeImage = row.querySelector(".large-image img");

        if (i !== index) {
          // 停止正在进行的动画
          gsap.killTweensOf(smallImage);
          gsap.killTweensOf(largeImage);
          // 重置小图片状态
          gsap.to(smallImage, { clipPath: "inset(0 0 0 0%)", duration: 0 });
          // 重置大图片状态
          gsap.to(largeImage, { clipPath: "inset(0 0 0 100%)", duration: 0 });
        }
      });

      // 对当前行应用动画
      const row = rows[index];
      const smallImage = row.querySelector(".small-image img");
      const largeImage = row.querySelector(".large-image img");

      // 停止正在进行的动画
      gsap.killTweensOf(smallImage);
      gsap.killTweensOf(largeImage);

      // 小图片淡出，大图片淡入
      gsap.to(smallImage, { clipPath: "inset(0 0 0 100%)", duration: 0.3 });

      // 底部边界处理
      const checkAndAdjustPosition = () => {
        const rect = largeImage.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const bottomDistance = viewportHeight - rect.bottom;
        const playerHeight = 80; // 播放器高度

        if (bottomDistance < playerHeight) {
          const offset = playerHeight - bottomDistance;
          gsap.set(largeImage, {
            y: -offset,
          });
        } else {
          gsap.set(largeImage, {
            y: 0,
          });
        }
      };
      checkAndAdjustPosition();

      // 大图片淡入并缩放
      gsap.to(largeImage, {
        clipPath: "inset(0 0 0 0%)",
        duration: 0.3,
        scale: 1,
        opacity: 1, // 显示大图
      });
    },

    hoverOut(index) {
      const row = this.$el.querySelectorAll(".row")[index];
      const smallImage = row.querySelector(".small-image img");
      const largeImage = row.querySelector(".large-image img");

      // 停止正在进行的动画
      gsap.killTweensOf(smallImage);
      gsap.killTweensOf(largeImage);

      // 直接设置小图片和大图片的状态，无过渡时间
      gsap.set(smallImage, { clipPath: "inset(0 0 0 0%)" });
      gsap.set(largeImage, {
        clipPath: "inset(0 0 0 100%)",
        scale: 0.95,
        opacity: 0, // 隐藏大图
        y: 0,
      });
    },
    showContextMenu(event, song, index) {
      const menuWidth = 185;
      const menuHeight = this.menuHeight - 10;
      const viewportWidth = window.innerWidth; // 获取视口宽度
      const viewportHeight = window.innerHeight; // 获取视口高度
      const offset = 10; // 菜单和边界之间的最小间距

      let x = event.clientX;
      let y = event.clientY;

      // 判断右侧边界，如果超出则显示在鼠标左侧
      if (viewportWidth - x < menuWidth + offset) {
        x = x - menuWidth - offset;
      } else {
        x += offset;
      }

      // 判断底部边界，如果超出则显示在鼠标上方
      if (viewportHeight - y < menuHeight + 80) {
        y = y - menuHeight - offset;
      } else {
        y += offset;
      }

      this.contextMenuPosition = { x: x, y: y };
      this.currentSong = song;
      this.currentIndex = index;
      this.contextMenuVisible = true;
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
    },
    async handleContextMenuAction(action, song, index) {
      console.log("song", song);
      if (song.is_disabled && action !== "delete") {
        this.$message.error("此音乐已被管理员禁用");
        return;
      }
      if (action === "play") {
        this.startSong(song, index);
      } else if (action === "addStar") {
        this.isAddingToPlaylist = true;
        try {
          const response = await this.$authHttp.post("/api/playlist/add", {
            username: this.userInfo.username,
            playlist_type: 3,
            song_name: song.name,
            artist: song.ar[0].name,
            duration: song.dt,
            pic_url: song.al.picUrl,
            is_self: song.self,
            music_id: song.id,
            song_size: song.sq ? song.sq.size : song.file_size,
          });

          this.$message.success("已添加到我喜欢的音乐");
          this.dialogVisible = false;
          // 告诉父组件有新的音频数据
          this.$emit("audioData");
        } catch (error) {
          console.error("添加音乐失败:", error);

          // 解析后端返回的错误信息
          const errorMessage =
            error.response?.data?.message || error.message || "添加失败";
          this.$message.error(errorMessage);
        } finally {
          this.isAddingToPlaylist = false; // 结束加载
        }
      } else if (action === "delete") {
        try {
          const response = await this.$authHttp.post("/api/user/songs/delete", {
            username: this.userInfo.username,
            music_id: song.id,
            playlist_type: this.type,
          });

          // this.$message.success("添加成功");
          this.dialogVisible = false;
          // 告诉父组件有新的音频数据
          this.$emit("audioData");
        } catch (error) {
          console.error("删除音乐失败:", error);
          this.$message.error(error.message || "删除音乐失败");
          return;
        }
      } else {
        this.isAddingToPlaylist = true; // 开始加载
        try {
          const response = await this.$authHttp.post("/api/playlist/add", {
            username: this.userInfo.username,
            playlist_type: 2,
            song_name: song.name,
            artist: song.ar[0].name,
            duration: song.dt,
            pic_url: song.al.picUrl,
            is_self: song.self,
            music_id: song.id,
            song_size: song.sq.size,
          });

          this.$message.success("已添加到我的歌单");
          this.dialogVisible = false;
          // 告诉父组件有新的音频数据
          // this.$emit("audioData");
        } catch (error) {
          console.error("添加音乐失败:", error);

          // 解析后端返回的错误信息
          const errorMessage =
            error.response?.data?.message || error.message || "添加失败";
          this.$message.error(errorMessage);
        } finally {
          this.isAddingToPlaylist = false; // 结束加载
        }
      }
    },
    updateContextMenuHeight(height) {
      this.menuHeight = height;
    },
    // 检查音乐是否被禁用
    isMusicDisabled(musicId) {
      // console.log("zuizhognceshi:", musicId);
      // console.log("this.disabledMusicIds:", this.disabledMusicIds);

      return this.disabledMusicIds.includes(String(musicId));
    },
    // 检查禁用状态
    async checkDisabledStatus() {
      if (!this.songsDetail.songs) return;

      // 筛选出API音乐
      const apiMusicIds = this.songsDetail.songs
        .filter((song) => !song.self)
        .map((song) => song.id);

      for (const id of apiMusicIds) {
        try {
          const response = await this.$authHttp.get("/api/music/status", {
            params: { id },
          });

          if (response.data.is_disabled) {
            this.disabledMusicIds.add(id);
          }
        } catch (error) {
          console.error(`检查音乐状态失败 (ID: ${id}):`, error);
        }
      }

      this.$forceUpdate(); // 更新视图
    },
  },
  created() {
    this.getSongPage(0, "Song");
  },
  async mounted() {
    document.addEventListener("click", this.hideContextMenu);
    await this.fetchDisabledMusic();
    await this.checkDisabledStatus();
  },
  beforeDestroy() {
    document.removeEventListener("click", this.hideContextMenu);
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
  color: #fff;
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
  color: #fff !important;
}
.startSongAurtor {
  color: red !important;
}

.pauseSongAurtor {
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

.row {
  display: flex;
  align-items: center;
  position: relative;
  /* margin-bottom: 20px; */
  border-top: 1px solid #393944;
  border-bottom: 1px solid #393944;
  justify-content: space-between;
}
.number {
  width: 15%;
  font-size: 50px;
  color: white;
}

.row-main {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  /* text-align: center; */
  /* margin-left: 25%; */
}

.row-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
}

.small-image img {
  width: 100px;
  height: auto;
  /** 图片垂直居中 */
  display: block;
  object-fit: cover;
  clip-path: inset(0 0 0 0);
  margin: 5px 0;
}
.large-image {
  position: absolute;
  left: 65%;
  top: 0;
  z-index: 2;
  transition: opacity 0.3s, transform 0.3s;
}

.large-image img {
  width: 300px;
  height: auto;
  object-fit: cover;
  opacity: 0;
}
.artist {
  /* margin-left: 20px; */
  color: white;
  font-size: 15px;
  width: 25%;
  text-align: right;
  display: inline-block;
}

.text {
  margin-left: 20px;
  color: white;
  font-size: 25px;
}

.disabled-song {
  background-color: rgba(220, 53, 69, 0.1);
  opacity: 0.7;
  cursor: not-allowed;
}

.disabled-song:hover {
  background-color: rgba(220, 53, 69, 0.15) !important;
}

.disabled-song .text {
  color: #dc3545;
}

.disabled-icon {
  width: 15%;
  font-size: 24px;
  color: #dc3545;
  text-align: center;
}

.disabled-icon i {
  margin-right: 5px;
}

.disabled-music {
  background-color: rgba(220, 53, 69, 0.1) !important;
  opacity: 0.7;
}

.disabled-music:hover {
  background-color: rgba(220, 53, 69, 0.2) !important;
}
</style>
