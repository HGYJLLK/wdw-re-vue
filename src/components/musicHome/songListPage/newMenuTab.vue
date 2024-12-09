<template>
  <div class="menuTab">
    <h1 class="menuTitle">本地音乐</h1>
    <div class="playAllSong">
      <div class="left">
        <div class="playAll" @click="allAddList">
          <i
            class="iconfont icon-bofang"
            style="font-size: 15px; margin-right: 4px"
          ></i>
          播放全部
        </div>
      </div>
      <div class="right">
        <div class="playAll" @click="addMusicDialog">
          <i
            class="iconfont icon-tianjia"
            style="font-size: 15px; margin-right: 4px"
          ></i>
          添加歌曲
        </div>
      </div>
    </div>

    <el-dialog
      title="添加歌曲"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <div class="tab-container">
        <div
          class="tab-option"
          :class="{ active: currentOption === 'online' }"
          @click="selectOption('online')"
        >
          本地歌单
        </div>
        <div
          class="tab-option"
          :class="{
            active: currentOption === 'local',
            disabled: !isTokenAvailable,
          }"
          @click="isTokenAvailable ? selectOption('local') : null"
        >
          添加歌曲
        </div>
        <div class="slider" :style="sliderStyle"></div>
      </div>
      <div class="content" ref="content">
        <div v-if="currentOption === 'online'">
          <div class="online-main">
            <div
              v-for="(folder, index) in tempFolders"
              :key="index"
              class="folder-item"
              :class="{ selected: folder.selected }"
            >
              <span class="folder-icon">✔</span>
              <span class="folder-name">{{ folder.name }}</span>
            </div>
          </div>
          <div class="online-bottom">
            <input
              type="file"
              webkitdirectory
              multiple
              style="display: none"
              ref="folderInput"
              @change="handleFolderSelection"
            />
            <button
              @click="triggerFolderSelection"
              style="margin-right: 10px; background-color: red; opacity: 0.8"
            >
              添加文件夹
            </button>
            <button @click="confirmFolders">确定</button>
          </div>
        </div>
        <div v-else-if="currentOption === 'local'" class="upload-container">
          <div class="upload-form">
            <label class="upload-label">
              选择文件：
              <input type="file" @change="uploadFile" class="upload-input" />
            </label>
            <label for="">
              歌手：
              <input
                type="text"
                v-model="newSong.artist"
                placeholder="歌手"
                class="artist-input"
              />
            </label>

            <button @click="addMusic" class="upload-button">添加</button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { gsap, selector } from "gsap";
import tokenUtils from "../../../utils/token";
export default {
  name: "newMenuTab",
  components: {},
  props: {
    // 歌曲数据
    songs: Array,
  },
  data() {
    return {
      dialogVisible: false,
      currentOption: "online", // 当前选中的选项
      tempFolders: [],
      musicFiles: [],
      audioUrls: [],
      audioData: [],
      newSong: {
        file: null,
        name: "",
        artist: "",
        duration: "",
      },
    };
  },
  computed: {
    sliderStyle() {
      return {
        transform:
          this.currentOption === "online"
            ? "translateX(0)"
            : "translateX(100%)",
      };
    },
    isTokenAvailable() {
      return tokenUtils.hasToken();
    },
    ...mapGetters([
      // 加载状态
      "isLoading",
      // 用户信息
      "userInfo",
    ]),
  },
  methods: {
    // 全部播放
    allAddList() {
      this.$emit("playAll");
    },
    selectOption(option) {
      this.currentOption = option;
    },
    handleFolderSelection(event) {
      const files = event.target.files;
      const folderPaths = new Set();
      const musicFiles = [];
      const supportedMusicExtensions = [
        ".mp3",
        ".wav",
        ".flac",
        ".aac",
        ".ogg",
      ];

      // 添加文件夹名 和 添加音频文件
      for (let file of files) {
        const folderName = file.webkitRelativePath.split("/")[0];
        folderPaths.add(folderName);

        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (supportedMusicExtensions.includes(`.${fileExtension}`)) {
          musicFiles.push(file);
        }
      }

      folderPaths.forEach((folderName) => {
        if (!this.tempFolders.some((folder) => folder.name === folderName)) {
          this.tempFolders.push({
            name: folderName,
            selected: true,
          });
        }
      });

      // 拼接音乐数据
      this.musicFiles = [...this.musicFiles, ...musicFiles];
    },

    generateMusicUrls(musicFiles) {
      musicFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const fileUrl = e.target.result;
          console.log("Generated file URL:", fileUrl);

          this.musicUrls.push(fileUrl);
        };

        reader.readAsDataURL(file);
      });
    },

    async confirmFolders() {
      console.log("音频数据", this.musicFiles);

      const formData = new FormData();
      formData.append("username", this.userInfo.username);
      formData.append("playlist_type", 1);

      // 添加音频文件到FormData
      this.musicFiles.forEach((file) => {
        formData.append("audio_files", file);
      });

      try {
        const response = await this.$authHttp.post("/upload/audio", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("upload/audio response:", response);

        this.$message.success("检索成功");

        // 告诉父组件有新的音频数据
        this.$emit("audioData");

        // localStorage.setItem("selectedFolders", "检索成功");
        // window.location.reload();
      } catch (error) {
        console.error("检索失败:", error);
        this.$message.error(error.message || "检索失败");
      }

      // 传递音频数据给父组件
      // this.$emit("audioData", this.audioData);
      this.dialogVisible = false;
    },

    getAudioDuration(audioUrl) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          resolve(Math.floor(audio.duration * 1000));
          // 释放资源
          // URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = (error) => {
          reject(error);
        };
      });
    },

    processMusicFiles(musicFiles) {
      console.log("Processing music files:", musicFiles);
    },

    uploadFile(event) {
      this.newSong.file = event.target.files[0];
    },
    addMusic() {
      // 保存音乐数据
      console.log("添加音乐：", this.newSong);
    },
    animateDialog() {
      // 动画逻辑
      gsap.fromTo(
        this.$refs.localButton,
        { x: -200, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5 }
      );
      gsap.fromTo(
        this.$refs.addButton,
        { x: 200, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5 }
      );
      gsap.fromTo(
        this.$refs.content,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 0.2 }
      );
      gsap.fromTo(
        this.$refs.footer,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.4 }
      );
    },
    handleClose(done) {
      done();
    },

    // 触发隐藏的 input[type="file"]
    triggerFolderSelection() {
      this.$refs.folderInput.click();
    },

    // 生成音频URL
    async generateAudioUrls(files) {
      const urls = [];
      for (const file of files) {
        const url = URL.createObjectURL(file);
        urls.push({ name: file.name, url: url });
      }
      return urls;
    },
    addMusicDialog() {
      this.dialogVisible = true;
      this.selectOption("online");
    },
  },
  mounted() {
    // const selectedFolders = localStorage.getItem("selectedFolders");
    // if (selectedFolders) {
    //   this.$message.success(selectedFolders);
    //   localStorage.removeItem("selectedFolders");
    // }
  },
};
</script>

<style scoped>
.menuTitle {
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
}

.playAllButton {
  background-color: #4caf50;
  color: white;
}

.addSongButton {
  background-color: #2196f3;
  color: white;
}

.refreshPageButton {
  background-color: #ff5722;
  color: white;
}

.playAllSong {
  display: flex;
  margin-bottom: 15px;
  justify-content: space-between;
}

.playAllSong .left {
  display: flex;
  align-items: center;
}

/* 播放键 */
.playAll {
  display: flex;
  margin-right: 10px;
  border-radius: 20px;
  background: #d03535;
  padding: 5px 15px;
  color: #fff;
  cursor: pointer;
  height: 18px;
}
.playAll:hover {
  background: #bb2929;
}

.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.tab-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  background-color: #424246;
  border-radius: 10px;
  overflow: hidden;
  /* width: 300px; */
  height: 50px;
}

.tab-option {
  flex: 1;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
  color: #fff;
  z-index: 1;
}

.tab-option.active {
  color: #fff;
  font-weight: bold;
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: #555559;
  border-radius: 10px;
  z-index: 0;
  transition: transform 0.3s ease;
}
/* .content {
  margin: 20px 0;
} */

.online-main {
  margin: 20px 0;
}

.online-main div {
  display: flex;
  margin-bottom: 5px;
  align-items: center;
}

.online-bottom {
  display: flex;
}

.online-bottom button {
  /* margin-left: 10px; */
  padding: 10px;
  flex: 1;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.online-bottom button:first-child {
  background: red;
  opacity: 0.8;
}

.online-bottom button:last-child {
  background: green;
  opacity: 0.8;
}

.footer {
  text-align: center;
}

::v-deep(.el-dialog__header) {
  background-color: rgb(45, 45, 56);
  color: #fff;
}

::v-deep(.el-dialog__title) {
  color: #fff;
  font-weight: bold;
}

::v-deep(.el-dialog__body) {
  background-color: rgb(45, 45, 56);
  padding: 20px;
  color: #fff;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4caf50; /* 复选框的颜色 */
}

label {
  margin-left: 8px;
  font-size: 16px;
  color: #fff;
}

.folder-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  /* background-color: #2c2c2e; */
  color: #fff;
  transition: background-color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}

.folder-item.selected {
  /* background-color: #4caf50; */
  color: #fff;
  transform: scale(1.05);
}

.folder-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #4caf50;
}

.folder-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.upload-container {
  background: #343a40;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #ffffff;
  margin-top: 15px;
}

.upload-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  color: #ffc107;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  display: flex;
  align-items: center;
  gap: 10px; /* 控制文字和输入框之间的间距 */
  font-size: 14px;
  color: #e0e0e0;
}

.upload-label {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e0e0e0;
}

.upload-input {
  background: #1e1e1e;
  border: 1px solid #444;
  color: #ffffff;
  padding: 5px;
  border-radius: 5px;
  flex: 1;
}

.upload-label input[type="file"] {
  flex: 1; /* 自适应宽度 */
  width: 80%;
}

.artist-input {
  background: #1e1e1e;
  border: 1px solid #444;
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  flex: 1; /* 和文件选择框对齐宽度 */
}

.upload-button {
  background: #4caf50;
  border: none;
  color: #ffffff;
  padding: 10px 15px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.upload-button:hover {
  background: #45a049;
}

.tab-option.disabled {
  cursor: not-allowed;
}
</style>
