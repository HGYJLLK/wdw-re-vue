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
        <div class="playAll">
          <img
            src="@/assets/image/refresh-line.svg"
            alt=""
            style="width: 22px; border-radius: 40px"
          /><span style="font-weight: 400">刷新</span>
        </div>
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
            <div v-for="(folder, index) in tempFolders" :key="index">
              <input
                type="checkbox"
                :id="'folder-' + index"
                v-model="folder.selected"
              />
              <label :for="'folder-' + index">{{ folder.name }}</label>
            </div>
          </div>
          <div class="online-bottom">
            <!-- 隐藏的文件夹选择 input -->
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
          <input type="text" v-model="newSong.name" placeholder="歌名" />
          <input type="text" v-model="newSong.artist" placeholder="歌手" />
          <input type="text" v-model="newSong.duration" placeholder="时长" />
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
      tempFolders: [
        // { name: "音乐文件夹1", selected: false },
        // { name: "我的歌单", selected: false },
        // { name: "收藏歌曲", selected: false },
        // { name: "流行音乐", selected: false },
      ], // 模拟的文件夹数据，每个文件夹包含名称和选中状态
      musicFiles: [], // Store selected music files
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
      let songList = [];
      for (let song of this.songs) {
        if (song.st != -200) {
          songList.push(song);
        }
      }
      // 全部加入歌单
      this.$store.dispatch("playAllSong", songList);
      // 获得音乐url并保存到当前播放url
      this.getMusicUrl(songList[0].id, songList[0].self, songList[0].url);
      this.$store.dispatch("deleteHisListSong", songList[0].id);
      this.$store.dispatch("unshiftHisMusicList", songList[0]);
    },
    //根据id获取音乐url
    async getMusicUrl(musicId, isSelf, musicUrl) {
      console.log("是否是自定义音乐：" + isSelf);
      if (isSelf) {
        this.$store.dispatch("saveAur", [0, 0]);
        this.$store.dispatch("saveMusicUrl", musicUrl);
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
    selectOption(option) {
      this.currentOption = option;
    },
    // addFolder() {
    //   const folderName = `新文件夹${this.tempFolders.length + 1}`;
    //   this.tempFolders.push({ name: folderName, selected: false }); // 动态添加文件夹
    // },

    handleFolderSelection(event) {
      const files = event.target.files;
      const folderPaths = new Set(); // To store unique folder names
      const musicFiles = [];
      const supportedMusicExtensions = [
        ".mp3",
        ".wav",
        ".flac",
        ".aac",
        ".ogg",
      ];

      // Loop through the selected files and check for their folder names and music file types
      for (let file of files) {
        const folderName = file.webkitRelativePath.split("/")[0];
        folderPaths.add(folderName); // Add folder name to the set

        // Check if the file is a music file
        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (supportedMusicExtensions.includes(`.${fileExtension}`)) {
          musicFiles.push(file); // Add the file to musicFiles array
        }
      }

      // Add new folders that aren't already in tempFolders
      folderPaths.forEach((folderName) => {
        if (!this.tempFolders.some((folder) => folder.name === folderName)) {
          this.tempFolders.push({
            name: folderName,
            selected: false,
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
    confirmFolders() {
      // const selectedFolders = this.tempFolders
      //   .filter((folder) => folder.selected)
      //   .map((folder) => folder.name);
      // console.log("Selected folders:", selectedFolders);
      // console.log("Music files to process:", this.musicFiles);

      // if (this.musicFiles.length > 0) {
      //   // Call a function to process the selected music files
      //   this.processMusicFiles(this.musicFiles);
      // } else {
      //   console.log("No music files selected.");
      // }

      // 获取已勾选的文件夹
      const selectedFolders = this.tempFolders.filter(
        (folder) => folder.selected
      );
      localStorage.setItem("selectedFolders", JSON.stringify(selectedFolders));
      console.log("已勾选的文件夹:", selectedFolders);

      if (selectedFolders.length === 0) {
        console.log("没有勾选任何文件夹");
        this.dialogVisible = false;
        return;
      }

      // 提取勾选文件夹的名称
      const selectedFolderNames = selectedFolders.map((folder) => folder.name);

      // 筛选属于勾选文件夹的音频文件
      const selectedMusicFiles = this.musicFiles.filter((file) => {
        const folderName = file.webkitRelativePath.split("/")[0];
        return selectedFolderNames.includes(folderName);
      });

      console.log("勾选文件夹中的音频文件:", selectedMusicFiles);

      // 将音频文件转换为 URL
      const musicUrls = selectedMusicFiles.map((file) =>
        URL.createObjectURL(file)
      );

      console.log("生成的音频文件 URL:", musicUrls);

      // 保存音频文件信息到 localStorage
      const audioData = {
        musicFiles: selectedMusicFiles,
        musicUrls: musicUrls,
      };
      localStorage.setItem("audioData", JSON.stringify(audioData));

      // 通过 $emit 将音频 URL 传递给父组件
      // this.$emit("update-audio-urls", musicUrls);

      // 关闭对话框
      this.dialogVisible = false;
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
  },
  mounted() {
    const savedFolders =
      JSON.parse(localStorage.getItem("selectedFolders")) || [];
    this.tempFolders = savedFolders;
    console.log("Restored tempFolders:", this.tempFolders);

    // 加载保存的音频数据
    const savedAudioData = JSON.parse(localStorage.getItem("audioData")) || {};
    if (savedAudioData.musicFiles) {
      this.musicFiles = savedAudioData.musicFiles;
      console.log("Restored music files:", this.musicFiles);
    }
    if (savedAudioData.musicUrls) {
      this.musicUrls = savedAudioData.musicUrls;
      console.log("Restored music URLs:", this.musicUrls);
    }
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
</style>
