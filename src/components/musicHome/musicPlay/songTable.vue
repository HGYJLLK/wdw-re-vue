<template>
  <div class="songTable">
    <div
      :class="{ selTableTitle: isPlayList, noTableTitle: !isPlayList }"
      @click="changeNowPlay"
    >
      播放列表
    </div>
    <div
      :class="{ selTableTitled: isHisPlayList, noTableTitled: !isHisPlayList }"
      @click="changeHisPlay"
    >
      历史记录
    </div>
    <div style="width: 100%; height: 5%; position: relative">
      <span style="font-size: 15px; opacity: 0.7; margin-left: 9%"
        >总{{ playList.length }}首</span
      >
      <div id="tableOpe" @click="cleanPlayList">
        <i class="iconfont icon-act_qingkong"></i>
        清空
      </div>
    </div>
    <div v-show="isPlayList">
      <div
        v-show="!playList[0]"
        style="
          margin-top: 50%;
          margin-left: 50%;
          transform: translate(-30%, -50%);
        "
      >
        你还没有添加任何歌曲！
      </div>
      <!-- 播放列表 -->
      <div
        :class="{ songMesSin: index % 2 === 0, songMesDou: index % 2 !== 0 }"
        v-for="(item, index) in playList"
        :key="index"
        background="#f9f9f9"
        @dblclick="startSong(item)"
      >
        <div
          style="
            font-size: 10px;
            position: absolute;
            top: 20px;
            left: 8px;
            color: #ec4141;
          "
          v-show="item.id === songId && isPlaying"
        >
          <playAni :small="true" />
        </div>
        <i
          class="iconfont icon-zanting"
          style="
            font-size: 10px;
            position: absolute;
            top: 2px;
            left: 8px;
            color: #ec4141;
          "
          v-show="item.id === songId && !isPlaying"
        ></i>
        <div
          :class="{
            pauseSongName: item.id !== songId,
            startSongName: item.id === songId,
          }"
        >
          <el-tooltip
            class="item"
            effect="light"
            placement="top"
            open-delay="1000"
            :content="`${item.name}${item.alia[0] ? `(${item.alia[0]})` : ''}`"
          >
            <span>{{ item.name }}</span>
            <span style="color: #949495">{{
              !item.alia[0] ? "" : "(" + item.alia[0] + ")"
            }}</span>
          </el-tooltip>
        </div>
        <div
          :class="{ startSongAurtor: item.id === songId }"
          style="
            position: absolute;
            width: 120px;
            left: 45%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
          "
        >
          <span
            style="cursor: default"
            v-for="(item, index) in item.ar"
            :key="index"
          >
            <el-tooltip
              class="item"
              effect="light"
              :content="index === 0 ? item.name : '/' + item.name"
              placement="top"
              open-delay="1000"
            >
              <span>
                {{ index === 0 ? item.name : "/" + item.name }}
              </span>
            </el-tooltip>
          </span>
        </div>
        <span style="position: absolute; left: 80%">{{
          Math.floor(item.dt / 1000) | timeFormat
        }}</span>
        <el-popconfirm
          title="确定要将该歌曲从列表中删除吗？"
          @confirm="delPlayListSong(item.id)"
        >
          <i
            class="el-icon-close"
            slot="reference"
            style="
              position: absolute;
              top: 35%;
              right: 3%;
              font-size: 15px;
              cursor: pointer;
            "
          ></i>
        </el-popconfirm>
      </div>
    </div>
    <div v-show="isHisPlayList">
      <div
        v-show="!hisMusicList[0]"
        style="
          margin-top: 50%;
          margin-left: 50%;
          transform: translate(-30%, -50%);
        "
      >
        你还没有播放任何歌曲！
      </div>
      <!-- 历史列表 -->
      <div
        :class="{ songMesSin: index % 2 === 0, songMesDou: index % 2 !== 0 }"
        v-for="(item, index) in hisMusicList"
        :key="index"
        background="#f9f9f9"
        @dblclick="startSong(item)"
      >
        <div
          style="
            font-size: 10px;
            position: absolute;
            top: 20px;
            left: 8px;
            color: #ec4141;
          "
          v-show="item.id === songId && isPlaying"
        >
          <playAni :small="true" />
        </div>
        <i
          class="iconfont icon-zanting"
          style="
            font-size: 10px;
            position: absolute;
            top: 2px;
            left: 8px;
            color: #ec4141;
          "
          v-show="item.id === songId && !isPlaying"
        ></i>
        <div
          :class="{
            pauseSongName: item.id !== songId,
            startSongName: item.id === songId,
          }"
        >
          <el-tooltip
            class="item"
            effect="light"
            placement="top"
            open-delay="1000"
            :content="`${item.name}${item.alia[0] ? `(${item.alia[0]})` : ''}`"
          >
            <span>{{ item.name }}</span>
            <span style="color: #949495">{{
              !item.alia[0] ? "" : "(" + item.alia[0] + ")"
            }}</span>
          </el-tooltip>
        </div>
        <div
          :class="{ startSongAurtor: item.id === songId }"
          style="
            position: absolute;
            width: 120px;
            left: 45%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
          "
        >
          <span
            style="cursor: default"
            v-for="(item, index) in item.ar"
            :key="index"
          >
            <el-tooltip
              class="item"
              effect="light"
              :content="index === 0 ? item.name : '/' + item.name"
              placement="top"
              open-delay="1000"
            >
              <span>
                {{ index === 0 ? item.name : "/" + item.name }}
              </span>
            </el-tooltip>
          </span>
        </div>
        <span style="position: absolute; left: 80%">{{
          Math.floor(item.dt / 1000) | timeFormat
        }}</span>
        <el-popconfirm
          title="确定要将该歌曲从列表中删除吗？"
          @confirm="delHisListSong(item.id)"
        >
          <i
            class="el-icon-close"
            slot="reference"
            style="
              position: absolute;
              top: 35%;
              right: 3%;
              font-size: 15px;
              cursor: pointer;
            "
          ></i>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import playAni from "@/components/musicHome/playAnimation/playAni";
export default {
  name: "songTable",
  props: {},
  components: { playAni },
  data() {
    return {
      //当前播放是否显示
      isPlayList: true,
      //历史播放是否显示
      isHisPlayList: false,
    };
  },
  computed: {
    ...mapGetters([
      //当前播放列表
      "playList",
      //当前歌曲id
      "songId",
      //历史播放列表
      "hisMusicList",
      //判断当前是否在播放
      "isPlaying",
      //当前播放歌曲url
      "musicUrl",
    ]),
    tooltipContent() {
      return `${this.item.name} ${
        this.item.alia[0] ? "(" + this.item.alia[0] + ")" : ""
      }`;
    },
  },
  methods: {
    // 双击切换到当前播放
    async startSong(musicDetail) {
      if (musicDetail.id === this.songId) return;

      // 检查API音乐是否被禁用
      if (!musicDetail.self) {
        const musicId = musicDetail.id;
        console.log(`[CLIENT] 检查音乐ID: ${musicId} 是否被禁用`);

        try {
          // 确保URL正确且绝对化
          // const statusUrl = `${this.$http.defaults.baseURL}/api/music/status`;
          // console.log(`[CLIENT] 发送请求到: ${statusUrl}?id=${musicId}`);

          const statusResponse = await this.$authHttp.get("/api/music/status", {
            params: { id: musicId },
          });

          console.log(`[CLIENT] 收到状态响应:`, statusResponse.data);

          if (statusResponse.data.is_disabled) {
            console.log(`[CLIENT] 音乐ID ${musicId} 已被禁用，阻止播放`);
            this.$message.error("该音乐已被管理员禁用");
            return;
          }
        } catch (error) {
          console.error(`[CLIENT] 检查音乐ID ${musicId} 状态失败:`, error);
          // 尝试打印更多错误详情
          if (error.response) {
            console.error("错误状态:", error.response.status);
            console.error("错误数据:", error.response.data);
          }
        }
      }
      // 获得音乐url并保存到当前播放url
      this.getMusicUrl(musicDetail.id, musicDetail.self, musicDetail.url);
      // 保存到当前播放歌曲详情
      this.$store.dispatch("saveMusicDetail", musicDetail);
      // 保存到当前播放歌曲id
      this.$store.dispatch("saveSongId", musicDetail.id);
      // 放入历史歌单
      this.$store.dispatch("deleteHisListSong", musicDetail.id);
      this.$store.dispatch("unshiftHisMusicList", musicDetail);
      // 放入已经播放过的歌单
      this.$store.dispatch("deleteHasListSong", musicDetail.id);
      this.$store.dispatch("pushHasPlayList", musicDetail);
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
    // 清空当前歌单
    cleanPlayList() {
      this.$emit("cleanDur");
    },
    //切换到当前播放
    changeNowPlay() {
      this.isPlayList = true;
      this.isHisPlayList = false;
    },
    //切换到历史播放
    changeHisPlay() {
      this.isPlayList = false;
      this.isHisPlayList = true;
    },
    //删除当前歌单歌曲
    delPlayListSong(musicId) {
      console.log("删除的歌曲id", musicId);
      if (musicId === this.songId) this.$emit("getNextSong");
      this.$store.dispatch("deletePlayListSong", musicId);
      this.$store.dispatch("deleteHasListSong", musicId);
    },
    //删除历史歌单歌曲
    delHisListSong(musicId) {
      this.$store.dispatch("deleteHisListSong", musicId);
    },
  },
  created() {},
};
</script>

<style scoped>
/* 表格样式 */

.songTable {
  position: fixed;
  right: 0;
  bottom: 81px;
  height: 80vh;
  width: 30%;
  z-index: 100;
  background: rgb(45, 45, 56);
  overflow-y: scroll;
  /* border-left: 1px solid #ebebed; */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.noTableTitle {
  width: 120px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #bbbbbb;
  border-radius: 35px;
  /* color: #000000; */
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left: 27%;
  text-align: center;
  font-size: 13px;
}

.selTableTitle {
  width: 120px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #bbbbbb;
  border-radius: 35px;
  background: #bbbbbb;
  color: #ffffff;
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left: 27%;
  text-align: center;
  font-size: 13px;
}

.noTableTitled {
  position: absolute;
  top: 15px;
  left: 47%;
  width: 120px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #bbbbbb;
  border-radius: 35px;
  color: #fff;
  text-align: center;
  font-size: 13px;
}

.selTableTitled {
  position: absolute;
  top: 15px;
  left: 47%;
  width: 120px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #bbbbbb;
  border-radius: 35px;
  background: #bbbbbb;
  color: #ffffff;
  text-align: center;
  font-size: 13px;
}
/* 操作样式 */

#tableOpe {
  position: absolute;
  right: 10%;
  top: 0;
  font-size: 15px;
  cursor: pointer;
  opacity: 0.7;
  margin-bottom: 5px;
}

#tableOpe:hover {
  opacity: 1;
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
  width: 140px;
  margin-left: 30px;
  /* opacity: 0.9; */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #fff;
  font-weight: bolder;
}

.startSongName {
  position: absolute;
  width: 140px;
  margin-left: 30px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: red !important;
}

.startSongAurtor {
  color: red !important;
}

.el-tooltip {
  z-index: 2000;
}
</style>
