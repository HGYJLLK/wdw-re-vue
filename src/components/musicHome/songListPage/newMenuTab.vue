<template>
  <div class="menuTab">
    <h1 class="menuTitle">本地音乐</h1>
    <div class="playAllSong">
      <div class="left">
        <!-- <div class="playAll" @click="allAddList">
          <i
            class="iconfont icon-bofang"
            style="font-size: 15px; margin-right: 4px"
          ></i>
          播放全部
        </div> -->
        <!-- <div class="playAll" @click="refresh">
          <input
            type="file"
            id="folderInput"
            webkitdirectory
            multiple
            style="display: none"
            @change="handleFolderSelection"
          />
          <img
            src="@/assets/image/refresh-line.svg"
            alt=""
            style="width: 22px; border-radius: 40px"
          /><span style="font-weight: 400">刷新</span>
        </div> -->
      </div>
      <div class="right">
        <div class="playAll" @click="dialogVisible = true">
          <i
            class="iconfont icon-tianjia"
            style="font-size: 15px; margin-right: 4px"
          ></i>
          添加歌曲
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
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
          :class="{ active: currentOption === 'local' }"
          @click="selectOption('local')"
        >
          添加歌曲
        </div>
        <div class="slider" :style="sliderStyle"></div>
      </div>
      <div class="content" ref="content">
        <div v-if="currentOption === 'online'">
          <!-- <h3>选择本地文件夹</h3> -->
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

        <div v-else-if="currentOption === 'local'">
          <h3>上传音乐</h3>
          <input type="file" @change="uploadFile" />
          <input type="text" v-model="newSong.artist" placeholder="歌手" />
          <button @click="addMusic">添加</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { gsap } from "gsap";
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
      tempFolders: [], // 模拟的文件夹数据，每个文件夹包含名称和选中状态
      musicFiles: [], // Store selected music files
      audioUrls: [], // 音乐文件的data url
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
  },
  methods: {
    // 全部播放
    allAddList() {
      // let songList = [];
      // for (let song of this.songs) {
      //   if (song.st != -200) {
      //     songList.push(song);
      //   }
      // }
      // // 全部加入歌单
      // this.$store.dispatch("playAllSong", songList);
      // // 获得音乐url并保存到当前播放url
      // this.getMusicUrl(songList[0].id, songList[0].self, songList[0].url);
      // this.$store.dispatch("deleteHisListSong", songList[0].id);
      // this.$store.dispatch("unshiftHisMusicList", songList[0]);
      this.$emit("playAll");
    },
    //根据id获取音乐url
    // async getMusicUrl(musicId, isSelf, musicUrl) {
    //   console.log("是否是自定义音乐：" + isSelf);
    //   if (isSelf) {
    //     this.$store.dispatch("saveAur", [0, 0]);
    //     this.$store.dispatch("saveMusicUrl", musicUrl);
    //     return;
    //   }
    //   await this.$http
    //     .get("song/url", {
    //       params: {
    //         id: musicId,
    //       },
    //     })
    //     .then((res) => {
    //       console.log("将要播放的歌曲的url：", res);

    //       if (res.data.data[0].freeTrialInfo) {
    //         this.$store.dispatch("saveAur", [
    //           res.data.data[0].freeTrialInfo.start,
    //           res.data.data[0].freeTrialInfo.end,
    //         ]);
    //       } else {
    //         this.$store.dispatch("saveAur", [0, 0]);
    //       }
    //       this.$store.dispatch("saveMusicUrl", res.data.data[0].url);
    //     });
    // },
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

      // Store the selected music files
      this.musicFiles = musicFiles;
      console.log("Found folders:", this.tempFolders);
      console.log("Found music files:", this.musicFiles);

      // Generate data URLs for the music files
      // this.generateMusicUrls(this.musicFiles);
    },

    generateMusicUrls(musicFiles) {
      musicFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          // Create a URL for the file (data URL)
          const fileUrl = e.target.result;
          console.log("Generated file URL:", fileUrl);

          // Now you can store or use this URL in your application
          this.musicUrls.push(fileUrl);
        };

        reader.readAsDataURL(file); // Convert file to data URL
      });
    },

    // Confirm folder selection and process files
    async confirmFolders() {
      // 过滤未选中的文件夹
      console.log("this.tempFolders", this.tempFolders);

      const selectedFolders = this.tempFolders.filter(
        (folder) => folder.selected
      );
      // if (selectedFolders.length === 0) {
      //   this.$message.warning("未选择任何文件夹！");
      //   return;
      // }
      const selectedFolderNames = selectedFolders.map((folder) => folder.name);
      const selectedMusicFiles = this.musicFiles.filter((file) => {
        const folderName = file.webkitRelativePath.split("/")[0];
        return selectedFolderNames.includes(folderName);
      });
      // // 生成音频URL
      this.audioUrls = await this.generateAudioUrls(selectedMusicFiles);
      console.log("将要传递的音频数据：", this.audioUrls);

      // 获取音频时长
      const durations = await Promise.all(
        this.audioUrls.map((audio) => this.getAudioDuration(audio.url))
      );
      this.audioUrls.forEach((audio, index) => {
        audio.duration = durations[index];
      });

      // // 只存储文件的必要信息
      // const audioData = {
      //   musicFiles: selectedMusicFiles.map((file) => ({
      //     name: file.name,
      //     webkitRelativePath: file.webkitRelativePath,
      //     size: file.size,
      //     type: file.type,
      //   })),
      //   audioUrls: this.audioUrls,
      // };
      // localStorage.setItem("audioData", JSON.stringify(audioData));

      // 拼接音频数据，同时根据 name 去重，保留之前的
      const mergedAudioData = [...(this.audioData || []), ...this.audioUrls];

      // 使用 Map 进行去重，保留之前的元素
      this.audioData = Array.from(
        mergedAudioData
          .reduce((map, audio) => {
            if (!map.has(audio.name)) {
              map.set(audio.name, audio); // 保留之前的
            }
            return map;
          }, new Map())
          .values()
      );
      console.log("音频数据：", this.audioData);

      this.musicFiles = selectedMusicFiles; // 更新当前显示的音乐文件
      this.$message.success("文件夹选择已确认！");

      // 传递音频数据给父组件
      this.$emit("audioData", this.audioData);
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

    // async refresh() {
    //   console.log("刷新页面");

    //   const savedFolders =
    //     JSON.parse(localStorage.getItem("selectedFolders")) || [];

    //   if (savedFolders.length === 0) {
    //     this.$message.warning("没有已存储的文件夹，请先选择文件夹！");
    //     return;
    //   }

    //   // 引导用户选择文件夹
    //   const folderInput = document.getElementById("folderInput");
    //   folderInput.click();

    //   // // 获取保存的文件夹和音乐数据
    //   // const savedFolders = JSON.parse(localStorage.getItem("selectedFolders"));
    //   // const savedAudioData = JSON.parse(localStorage.getItem("audioData"));
    //   // if (!savedFolders || savedFolders.length === 0) {
    //   //   this.$message.error("未保存任何文件夹，请先添加文件夹！");
    //   //   return;
    //   // }
    //   // // 提示用户即将操作的文件夹
    //   // const folderNames = savedFolders.map((folder) => folder.name).join(", ");
    //   // if (
    //   //   !confirm(
    //   //     `此操作将刷新并上传文件夹：${folderNames} 中的音乐文件。是否继续？`
    //   //   )
    //   // ) {
    //   //   return;
    //   // }
    //   // // 重新扫描选定的文件夹
    //   // // await this.rescanFolders(savedFolders);
    //   // // // 恢复并处理音乐文件
    //   // // if (savedAudioData && savedAudioData.musicFiles) {
    //   // //   this.musicFiles = savedAudioData.musicFiles.map((file) => ({
    //   // //     ...file,
    //   // //     webkitRelativePath: file.webkitRelativePath || "", // 防止路径为空
    //   // //   }));
    //   // //   console.log("已刷新音乐文件:", this.musicFiles);
    //   // //   this.processMusicFiles(this.musicFiles);
    //   // //   this.$message.success(
    //   // //     `刷新完成，已加载 ${this.musicFiles.length} 个音乐文件！`
    //   // //   );
    //   // // } else {
    //   // //   this.$message.warning("未找到音乐文件，请重新添加！");
    //   // // }
    //   // // 更新本地存储
    //   // const audioData = {
    //   //   musicFiles: this.musicFiles.map((file) => ({
    //   //     name: file.name,
    //   //     webkitRelativePath: file.webkitRelativePath,
    //   //     size: file.size,
    //   //     type: file.type,
    //   //   })),
    //   //   audioUrls: this.audioUrls,
    //   // };
    //   // console.log("刷新后的音乐文件数据：", audioData);
    //   // localStorage.setItem("audioData", JSON.stringify(audioData));
    //   // this.$message.success(
    //   //   `刷新完成，已加载 ${this.musicFiles.length} 个音乐文件！`
    //   // );
    // },

    // 重新扫描文件夹
    // async rescanFolders(folders) {
    //   this.musicFiles = [];
    //   for (const folder of folders) {
    //     try {
    //       const directoryHandle = await window.showDirectoryPicker({
    //         id: folder.name,
    //         startIn: "music",
    //       });
    //       await this.scanDirectory(directoryHandle);
    //     } catch (error) {
    //       console.error(`Error scanning folder ${folder.name}:`, error);
    //     }
    //   }
    // },

    // // 扫描文件夹
    // async scanDirectory(directoryHandle) {
    //   for await (const entry of directoryHandle.values()) {
    //     if (entry.kind === "file") {
    //       const file = await entry.getFile();
    //       if (file.type.startsWith("audio/")) {
    //         this.musicFiles.push(file);
    //       }
    //     } else if (entry.kind === "directory") {
    //       await this.scanDirectory(entry);
    //     }
    //   }
    // },

    // 生成音频URL
    async generateAudioUrls(files) {
      const urls = [];
      for (const file of files) {
        const url = URL.createObjectURL(file);
        urls.push({ name: file.name, url: url });
      }
      return urls;
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
</style>
