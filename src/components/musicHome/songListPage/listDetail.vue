<template>
  <!-- 歌单细节 -->
  <div class="listDetail">
    <el-image
      :src="playList.coverImgUrl"
      fit="fill"
      @error="onImageError"
      style="border-radius: 10px; height: 100%; width: 30vh; position: absolute"
    ></el-image>
    <div class="listName">
      <div
        style="
          color: #d03535;
          border: 1px solid #d03535;
          display: inline-block;
          font-size: 20px;
          margin-right: 10px;
          border-radius: 5px;
          padding: 0 7px;
          cursor: default;
        "
      >
        歌单
      </div>
      {{ playList.name }}
    </div>
    <div class="creator">
      <el-image
        :src="playList.creator.avatarUrl"
        fit="fill"
        style="
          border-radius: 40px;
          height: 40px;
          width: 40px;
          vertical-align: middle;
        "
      ></el-image>
      <span style="color: #507daf; cursor: pointer">
        {{ playList.creator.nickname || playList.creator.username }}
      </span>
    </div>
    <div class="playAllSong">
      <div class="playAll" @click="allAddList">
        <i class="iconfont icon-bofang" style="font-size: 15px"></i> 播放全部
      </div>
    </div>
  </div>
</template>

<script>
import defaultAvatar from "@/assets/image/default.jpg";
export default {
  name: "listDetail",
  components: {},
  props: {
    // 歌单详情
    playList: Object,
    // 是否展开介绍
    isIntro: Boolean,
    // 歌曲详情
    songsDetail: Object,
  },
  data() {
    return {
      isImageLoading: true, // 图片是否加载中
    };
  },
  methods: {
    // 全部播放
    allAddList() {
      let songList = [];
      for (let song of this.songsDetail.privileges) {
        if (song.st != -200) {
          let index = this.songsDetail.privileges.indexOf(song);
          songList.push(this.songsDetail.songs[index]);
        }
      }
      // 全部加入歌单
      this.$store.dispatch("playAllSong", songList);
      // 获得音乐url并保存到当前播放url
      this.getMusicUrl(songList[0].id);
      this.$store.dispatch("deleteHisListSong", songList[0].id);
      this.$store.dispatch("unshiftHisMusicList", songList[0]);
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
    onImageError() {
      console.log("图片加载失败，切换到默认图片");
      this.playList.coverImgUrl = defaultAvatar; // 替换为默认图片
    },
  },
  mounted() {},
};
</script>

<style scoped>
/* 歌单细节 */
.listDetail {
  position: relative;
  margin-left: 50px;
  margin-top: 20px;
  width: 97%;
  height: 30vh;
}
/* 歌单名 */
.listName {
  position: absolute;
  font-size: 25px;
  font-weight: 600;
  left: 35vh;
  top: 1%;
}
/* 作者名 */
.creator {
  position: absolute;
  height: 40px;
  left: 35vh;
  top: 20%;
}
.playAllSong {
  position: absolute;
  left: 35vh;
  top: 43%;
}
/* 播放键 */
.playAll {
  display: inline-block;
  margin-right: 10px;
  border-radius: 20px;
  background: #d03535;
  padding: 5px 15px;
  color: #fff;
  cursor: pointer;
}
.playAll:hover {
  background: #bb2929;
}
.orbtn {
  display: inline-block;
  margin-right: 10px;
  border-radius: 20px;
  border: 1px solid #d8d8d8;
  padding: 5px 15px;
  cursor: pointer;
  background: rgb(50, 57, 81);
}
.orbtn:hover {
  background: rgb(59, 66, 89);
}
/* 介绍 */
.listIntro {
  position: absolute;
  height: 30%;
  left: 35vh;
  top: 65%;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  row-gap: 10px;
}
</style>
