<template>
  <div class="menuTab">
    <h1 class="menuTitle">本地音乐</h1>
    <div class="menuSize">
      <span class="capacityLabel">网盘容量</span>
      <div class="progressBar">
        <div class="progressFill"></div>
      </div>
      <span class="capacityValue">{{ totalFileSizeInGB }}GB / 1GB</span>
    </div>
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
        <div
          class="playAll"
          id="addMusicBtn"
          @click="isOpend ? addMusicDialog() : null"
          :class="{
            disabled: !isOpend,
          }"
        >
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
      v-loading="isUploading"
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
              style="
                margin-right: 10px;
                background: rgba(255, 0, 0, 0.8);
                font-weight: bold;
              "
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
import { mapGetters } from "vuex";
import tokenUtils from "../../../utils/token";
export default {
  name: "newMenuTab",
  components: {},
  props: {
    // 歌曲数据
    songs: Array,
    // 歌单大小
    totalFileSizeGB: {
      type: Number,
      default: -1,
    },
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
      displaySize: this.totalFileSizeGB,
      isUploading: false,
      isOpend: false,
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
    totalFileSizeInGB() {
      return (this.totalFileSizeGB / 1024 / 1024 / 1024).toFixed(1); // 保留一位小数
    },
  },
  watch: {
    totalFileSizeGB(newValue, oldValue) {
      console.log("newValue", newValue);

      this.updateProgress();
    },
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
          this.musicUrls.push(fileUrl);
        };

        reader.readAsDataURL(file);
      });
    },

    async confirmFolders() {
      const formData = new FormData();
      formData.append("username", this.userInfo.username);
      formData.append("playlist_type", 1);
      formData.append("is_self", true);

      // 最大容量限制
      const maxCapacity = this.getMaxSize();

      // 获取已添加音乐的总大小
      console.log("已经添加的音乐大小", this.totalFileSizeGB);

      const usedCapacity = this.totalFileSizeGB;

      // 剩余可用容量
      const availableCapacity = maxCapacity - usedCapacity;

      if (availableCapacity <= 0) {
        this.$message.error("已添加音乐容量已达到 1GB，无法再添加音乐！");
        return;
      }

      let totalSize = 0;
      const validFiles = [];

      // 筛选出不超过剩余容量的文件
      for (const file of this.musicFiles) {
        if (totalSize + file.size <= availableCapacity) {
          validFiles.push(file);
          totalSize += file.size;
        } else {
          console.warn("部分文件超出剩余容量限制,已过滤。");
        }
      }

      validFiles.forEach((file) => {
        formData.append("audio_files", file);
      });

      // // 添加音频文件到FormData
      // this.musicFiles.forEach((file) => {
      //   formData.append("audio_files", file);
      // });

      this.$store.dispatch("changeIsLoading", true);
      this.isUploading = true; // 开始加载动画
      try {
        const response = await this.$authHttp.post("/upload/audio", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        this.$message.success("检索成功");

        // 告诉父组件有新的音频数据
        this.$emit("audioData");

        // localStorage.setItem("selectedFolders", "检索成功");
        // window.location.reload();
      } catch (error) {
        console.error("检索失败:", error);
        this.$message.error(error.message || "检索失败");
      } finally {
        this.$store.dispatch("changeIsLoading", false);
        this.isUploading = false; // 结束加载动画
      }

      // 传递音频数据给父组件
      this.$emit("audioData", this.audioData);
      this.dialogVisible = false;
    },

    getMaxSize() {
      return 1024 * 1024 * 1024; // 1GB
    },

    calculateUsedCapacity() {
      // 假设 this.existingMusicFiles 是一个数组，包含已添加的音乐文件信息
      return this.existingMusicFiles.reduce(
        (total, file) => total + file.size,
        0
      );
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

    processMusicFiles(musicFiles) {},

    uploadFile(event) {
      this.newSong.file = event.target.files[0];
    },
    async addMusic() {
      // 保存音乐数据
      const formData = new FormData();
      formData.append("username", this.userInfo.username);
      formData.append("playlist_type", 1);
      formData.append("audio_files", this.newSong.file);
      formData.append("artist", this.newSong.artist);
      formData.append("is_self", true);
      try {
        const response = await this.$authHttp.post("/upload/audio", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        this.$message.success("添加成功");
        this.dialogVisible = false;
        // 告诉父组件有新的音频数据
        this.$emit("audioData");
      } catch (error) {
        console.error("添加音乐失败:", error);
        this.$message.error(error.message || "添加音乐失败");
        return;
      }
    },
    handleClose(done) {
      done();
    },

    // 触发隐藏的 input[type="file"]
    triggerFolderSelection() {
      this.$refs.folderInput.click();
    },
    addMusicDialog() {
      this.dialogVisible = true;
      this.selectOption("online");
    },
    updateProgress() {
      const progressBar = document.querySelector(".progressFill");
      const capacityValue = document.querySelector(".capacityValue");
      const addMusicButton = document.querySelector("#addMusicBtn");

      const totalSizeGB = this.totalFileSizeGB / (1024 * 1024 * 1024);
      const percentage = Math.min((totalSizeGB / 1) * 100, 100);

      capacityValue.textContent = `${totalSizeGB.toFixed(2)}GB / 1GB`;

      console.log("计算的大小(GB):", totalSizeGB);
      console.log("计算的百分比:", percentage);

      // capacityValue.textContent = `${this.totalFileSizeInGB}GB / 1GB`;

      // console.log("percentage", percentage);

      if (percentage >= 100) {
        this.isOpend = false;
        addMusicButton.style.background = "rgba(255, 0, 0, 0.8)";
      } else {
        this.isOpend = true;
        addMusicButton.style.background = "rgba(255, 0, 0, 1)";
      }

      setTimeout(() => {
        progressBar.style.width = `${percentage}%`;
      }, 100);
    },
  },
  mounted() {},
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
  background: rgba(0, 128, 0, 0.8);
  font-weight: bold;
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
  gap: 10px;
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
  flex: 1;
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

#addMusicBtn.disabled {
  cursor: not-allowed;
}

.menuSize {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #fff;
  margin-top: 10px;
  margin-bottom: 10px;
}

.capacityLabel {
  font-weight: bold;
}

.progressBar {
  flex: 1;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progressFill {
  height: 100%;
  background-color: #4caf50;
  width: 0%;
  transition: width 1s ease;
}

.capacityValue {
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
}
</style>
