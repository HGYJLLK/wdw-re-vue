# music-player-vue

一个基于Vue全家桶 + elementUI + python + html + css + js + mysql 的音乐播放器

# 当前版本

- node.js v20.12.1
- npm v10.5.0
- python v3.9.1
- mysql v8.0.37
- ffmpeg v4.4.4

- 需要禁用一切有关捕获下载的插件，防止播放失败

# 编译&安装

## 目录结构

```bash
music-player-system/
├── music-player-vue/       # 前端
├── music-player-server/    # 后端
├── NeteaseCloudMusicApi/   # 网易云音乐数据
└── music-player-admin/     # 管理端
```

## 数据库配置

### 登录MySQL

- mysql -u root -p

###  输入密码后执行以下SQL命令

- 直接将所有代码复制进去运行即可

```bash
CREATE DATABASE IF NOT EXISTS user_auth
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE user_auth;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `security_question` varchar(255) NOT NULL,
  `security_answer` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `avatar_url` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `intro` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `audio_files` (
  `id` INT NOT NULL AUTO_INCREMENT, -- 音频的唯一标识
  `user_id` INT NOT NULL,           -- 关联的用户 ID
  `music_id` INT DEFAULT NULL,          -- 关联的歌曲 ID
  `filename` VARCHAR(255) NOT NULL,     -- 音频文件名
  `file_path` VARCHAR(255) DEFAULT NULL, -- 音频文件的存储路径
  `pic_url` VARCHAR(255) DEFAULT '', -- 默认封面图路径
  `duration` INT NOT NULL,          -- 音频时长（毫秒）
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 上传时间
  `artist` varchar(255) DEFAULT NULL,
  `playlist_type` int,
  `is_self` varchar(255) DEFAULT NULL,
  `file_size` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) -- 与 users 表建立关联
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `artist` (
  `artist_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL, -- 歌手名
  `bio` TEXT DEFAULT NULL, -- 歌手简介
  `avatar_url` VARCHAR(255) DEFAULT NULL, -- 头像路径
  `bir_place` VARCHAR(100) DEFAULT NULL, -- 歌手出生地
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`artist_id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `albums` (
  `albums_id` INT NOT NULL AUTO_INCREMENT,
  `albums_title` VARCHAR(255) NOT NULL, -- 专辑标题
  `artist_id` INT NOT NULL, -- 歌手id
  `release_year` YEAR DEFAULT NULL, -- 发布年份
  `img_url` VARCHAR(255) DEFAULT NULL, -- 专辑封面路径
  `description` TEXT DEFAULT NULL, -- 专辑描述
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`albums_id`),
  FULLTEXT KEY `ft_title` (`albums_title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `songs_messages` (
  `songs_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL, -- 歌曲标题
  `artist_id` INT NOT NULL, -- 歌手id
  `album_id` INT DEFAULT NULL, -- 专辑id
  `genre_type` INT DEFAULT NULL, -- 风格类型
  `duration` INT NOT NULL COMMENT '毫秒', -- 歌曲时长
  `release_year` YEAR DEFAULT NULL, -- 发布年份
  `lyrics` TEXT DEFAULT NULL, -- 歌词
  `img_url` VARCHAR(255) DEFAULT NULL, -- 封面图路径
  `count` INT DEFAULT 0, -- 播放次数
  `file_size` BIGINT DEFAULT NULL COMMENT '字节', -- 文件大小
  `file_format` VARCHAR(20) DEFAULT NULL, -- 文件格式
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`songs_id`),
  FULLTEXT KEY `ft_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE audio_files ADD COLUMN is_disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE audio_files ADD COLUMN reference_id VARCHAR(50) DEFAULT NULL;
ALTER TABLE audio_files ADD COLUMN is_api_music BOOLEAN DEFAULT FALSE;

CREATE TABLE `central_music_library` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `music_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255),
  `duration` INT,
  `pic_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_disabled` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `music_id` (`music_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `global_music` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `music_id` VARCHAR(50) NOT NULL,
  `user_id` INT,
  `username` VARCHAR(50),
  `name` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255),
  `duration` INT,
  `file_size` BIGINT,
  `pic_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_disabled` BOOLEAN DEFAULT FALSE,
  `is_api_music` BOOLEAN DEFAULT FALSE, -- 区分是自定义音频还是API音频
  PRIMARY KEY (`id`),
  UNIQUE KEY `music_id` (`music_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## 后端

```bash
# 打开终端cmd，进入项目根目录，安装依赖
cd music-player-server
pip install -r requirements.txt

# 打开main.py文件，修改mysql数据库配置
DB_CONFIG = {
    'host': '127.0.0.1',  # 服务器地址
    'user': 'root', # 数据库用户名
    'password': '',  # 数据库密码
    'database': 'user_auth', # 数据库名称
    'port': 3306 # 数据库端口
}

# 启动后端服务
python main.py

# 打开终端cmd，进入项目根目录，安装依赖
cd NeteaseCloudMusicApi
npm install

# 启动音乐服务
node app.js
```

## 前端

```bash
# 打开终端cmd，进入项目根目录，安装依赖
cd music-player-vue
npm install

# 启动项目
npm run serve
```

## 管理端

- 用 vscode 编译器打开你的管理端目录（保守做法）
- 找到 index.html文件，然后右键使用插件 open in browser 打开网页
- 登录管理员账号（账号密码一样，都是 admin）

## 测试

- 网易云音乐 API 数据测试：npm test
- 后端接口测试：python main_test.py

# 技术难点与攻坚过程

## 网页检索电脑音乐文件

- 难点1
- 参考网易云音乐客户端检索电脑音频文件，用户能够添加多个文件夹，并且根据需求去选择检索哪些文件夹里的音频数据
- 引发问题：用户上传音频到网页具有时效性，根据浏览器安全策略，无法保存用户上传的文件夹路径，导致用户每次检索都需要重新选择文件夹，增加了用户操作复杂度。

---

- 攻坚1
- 更改结构，用户不能够选择检索哪些文件夹里的音频数据，添加的文件夹全部检索

```html
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
```

原有结构，采用input + checkbox属性，实现多个文件夹的选择

调整为默认选择所有文件夹结构

```html
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
```

- 引发问题：检索完毕后，用户更改本地文件夹以及文件，用户再次重新添加文件夹上传最新的音频数据，以前保留的音频数据可能存在重复性

---

- 攻坚2
- 添加过滤限制，拼接现有音频数据，使用map数据结构进行去重处理，重复部分保留旧的，去除新的

- 存在问题：前端处理音频的时候，只会保留当前会话的音频数据，如果前端进行了一些页面切换或者选项卡切换，会导致音频数据丢失

---

- 攻坚3
- 舍弃前端保存音频数据，采用后端保存音频数据，前端只负责展示音频数据，前端传递音频数据给后端，后端返回前端要显示的内容，当前端需要播放音乐的时候，将当前音乐的id传递给后端，由后端返回音频数据，前端播放音乐

- 优势：解决前端无法保存音频数据的情况，每一次播放都由后端重新生成一个新的临时音频链接供前端播放，解决了前端页面切换导致音频数据丢失的问题

---

## 图片与渲染时机

- 难点
- 图片加载时机与页面渲染问题，存在三个页面，父组件将数据传递给两个子组件，父组件的数据通过后端返回，父组件在渲染的时候会获取后端的数据，并且将这些数据传递给子组件，但是存在一个问题，生命周期钩子函数的执行顺序

- 问题说明
- 父组件在初始化的时候有两个空对象，分别是songsDetail和playList对象，在渲染的时候，父组件会从后端获取songsDetail数据，但是playList对象的数据来源有两个，一个是songsDetail数据，另一个是全局的用户信息数据，父组件在渲染的时候，会先渲染songsDetail数据，然后再渲染playList数据，但是父组件的生命周期钩子函数的执行顺序是先执行父组件的created钩子函数，此时playList数据会初始化了全局的用户信息数据，然后执行父组件的mounted钩子函数，但是父组件的created钩子函数中，会将playList数据传递给子组件，但是此时子组件还没有渲染songsDetail数据，所以会导致playList数据不全，最终导致页面部分数据渲染失败

- 攻坚
- 在数据初始化的时候，为playList对象初始化需要获取的songsDetail的数据，等到父组件执行mouted钩子函数的时候，playList对象相应的数据就会更新，这时就不会作为数据初始化而导致页面渲染失败，当对象数据触发更新的时候会告知子组件，子组件就会重新渲染，解决了生命周期钩子函数的执行顺序问题

- 部分代码
- ```vue
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
            playlist_type: 3,
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
    ```