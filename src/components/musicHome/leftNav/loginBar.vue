<template>
  <div class="loginBar">
    <div
      v-if="!userInfo"
      style="cursor: pointer"
      @click="changeShowLogin(true)"
    >
      <el-avatar
        icon="el-icon-user-solid"
        class="userHead"
        style="vertical-align: middle"
      ></el-avatar>
      <span class="loginSta">未登录</span>
    </div>
    <div v-else>
      <el-dropdown>
        <el-avatar
          :src="userInfo.avatarUrl"
          class="userHead"
          style="vertical-align: middle; cursor: pointer"
        ></el-avatar>
        <span class="loginSta" style="cursor: default">{{
          userInfo.nickname
        }}</span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleEditProfile">
            <i class="el-icon-user"></i> 个人信息
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleLogout">
            <i class="el-icon-switch-button"></i> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 个人信息编辑弹窗 -->
    <el-dialog
      title="个人信息"
      :visible.sync="profileDialogVisible"
      width="400px"
      custom-class="profile-dialog"
      :modal-append-to-body="false"
    >
      <div class="profile-edit">
        <!-- 头像上传 -->
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
            :on-error="handleUploadError"
          >
            <img
              v-if="(userInfo && userInfo.avatarUrl) || tempAvatar"
              :src="userInfo.avatarUrl || tempAvatar"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="avatar-hover">
              <i class="el-icon-camera"></i>
              <span>更换头像</span>
            </div>
          </el-upload>
        </div>

        <!-- 用户信息表单 -->
        <el-form :model="profileForm" label-width="80px" class="profile-form">
          <el-form-item label="用户名">
            <el-input
              type="text"
              v-model="profileForm.username"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input
              type="text"
              v-model="profileForm.nickname"
              placeholder="请输入昵称"
            ></el-input>
          </el-form-item>
          <el-form-item label="简介">
            <el-input
              type="textarea"
              v-model="profileForm.intro"
              placeholder="请输入简介"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="profileDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveProfile">确 定</el-button>
      </div>
    </el-dialog>

    <img :src="defaultAvatar" alt="img" />
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import defaultAvatar from "@/assets/image/default.jpg";
export default {
  name: "loginBar",
  components: {},
  computed: {
    ...mapGetters([
      //用户信息
      "userInfo",
    ]),
  },
  data() {
    return {
      profileDialogVisible: false,
      uploadUrl: "http://127.0.0.1:5001/upload/avatar",
      tempAvatar: "",
      uploadHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      profileForm: {
        username: "",
        nickname: "",
        avatarUrl: "",
        intro: "",
      },
      defaultAvatar
    };
  },

  watch: {
    userInfo: {
      handler(newVal) {
        if (newVal) {
          this.profileForm = {
            username: newVal.username,
            nickname: newVal.nickname || newVal.username,
            avatarUrl: newVal.avatarUrl,
          };
        }
      },
      immediate: true,
    },
  },

  methods: {
    //打开登录窗口
    changeShowLogin(isShow) {
      this.$store.dispatch("changeShowLogin", isShow);
    },

    handleEditProfile() {
      this.profileDialogVisible = true;
      this.tempAvatar = "";
    },

    handleAvatarError() {
      console.log("头像加载失败，使用默认头像");
    },

    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error("请上传图片格式的文件!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("图片大小不能超过 2MB!");
        return false;
      }
      return true;
    },

    handleAvatarSuccess(res) {
      if (res.code === 200) {
        const avatarUrl = `http://127.0.0.1:5001${res.data.url}`;
        this.tempAvatar = avatarUrl;
        this.profileForm.avatarUrl = avatarUrl;
        this.$message.success("头像上传成功");
      } else {
        this.$message.error(res.message || "头像上传失败");
      }
    },

    handleUploadError(err) {
      console.error("上传失败:", err);
      this.$message.error("上传失败，请重试");
    },

    handleSaveProfile() {
      const updatedInfo = {
        ...this.userInfo,
        nickname: this.profileForm.nickname,
        avatarUrl: this.profileForm.avatarUrl || this.userInfo.avatarUrl,
      };

      this.$store.dispatch("saveUserInfo", updatedInfo);
      this.$message.success("个人信息已更新");
      this.profileDialogVisible = false;
    },

    //登出
    handleLogout() {
      this.$http
        .get("/logout")
        .then((res) => {
          this.$message.success("成功退出");
          this.$store.dispatch("saveUserInfo", null);
          this.$store.dispatch("savePersonalList", []);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },

  mounted() {
    console.log("user info:", this.userInfo);
  },
};
</script>

<style scoped>
.loginSta {
  font-size: 15px;
  margin-right: 5px;
}

.loginBar {
  display: flex;
  height: 50px;
}

.loginBar .userHead {
  width: 40px;
  height: 40px;
  margin-top: 0px;
}

.profile-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-dialog :deep(.el-dialog__wrapper) {
  background-color: rgba(0, 0, 0, 0.7);
}

.profile-dialog :deep(.el-dialog) {
  background-color: #2d2d38;
  border-radius: 8px;
  margin-top: 0 !important;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.profile-dialog :deep(.el-dialog__header) {
  background-color: #1a1a21;
  padding: 20px;
  border-bottom: 1px solid #3a3a3a;
}

.profile-dialog :deep(.el-dialog__title) {
  color: #ffffff;
  font-size: 18px;
  line-height: 24px;
}

.profile-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
}

.profile-dialog :deep(.el-dialog__body) {
  background-color: #2d2d38;
  color: #ffffff;
  padding: 0 20px;
}

.avatar-section {
  text-align: center;
}

.avatar-uploader {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  border: 3px solid #574a4a;
}

.avatar-hover {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-uploader:hover .avatar-hover {
  opacity: 1;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.profile-form :deep(.el-form-item) {
  display: flex;
  align-items: flex-end;
}

.profile-form :deep(.el-form-item__label) {
  color: #ffffff;
  line-height: 40px;
  padding: 0 12px 0 0;
  text-align: right;
  width: 80px !important;
  float: none;
}

.profile-form :deep(.el-form-item__content) {
  margin-left: 0 !important;
  flex: 1;
  display: inline-block;
  align-items: center;
}

.profile-form :deep(.el-input) {
  width: 100%;
}

.profile-form :deep(.el-input__inner) {
  background-color: #3a3a47;
  border-color: #4a4a57;
  color: #ffffff;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
  margin-left: 15px;
}

.profile-form :deep(.el-input__inner:focus) {
  border-color: #6a6a77;
  box-shadow: 0 0 0 2px rgba(106, 106, 119, 0.2);
}

.profile-form :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #3a3a47;
  border-color: #4a4a57;
  color: #8c8c9a;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px 20px;
}

.dialog-footer .el-button {
  padding: 12px 20px;
}

.dialog-footer .el-button + .el-button {
  margin-left: 15px;
}

.dialog-footer :deep(.el-button) {
  background-color: #4a4a57;
  border-color: #4a4a57;
  color: #ffffff;
}

.dialog-footer :deep(.el-button:hover) {
  background-color: #5a5a67;
  border-color: #5a5a67;
}

.dialog-footer :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

.dialog-footer :deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-dialog) {
  background: rgb(19, 19, 26);
}
</style>
