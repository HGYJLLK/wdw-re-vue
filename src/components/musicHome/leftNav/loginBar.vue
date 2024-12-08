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
      <el-avatar
        :src="
          userInfo.avatar && userInfo.avatar.trim() !== ''
            ? userInfo.avatar
            : defaultAvatar
        "
        class="userHead"
        style="vertical-align: middle; cursor: default"
      ></el-avatar>

      <el-dropdown trigger="click">
        <span class="loginSta" style="cursor: pointer"
          >{{ userInfo.nickname || userInfo.username
          }}<i class="el-icon-caret-bottom"></i
        ></span>

        <el-dropdown-menu slot="dropdown" style="margin-top: 15px">
          <el-dropdown-item @click.native="handleEditProfile">
            <i class="el-icon-user"></i> 个人信息
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleLogout">
            <i class="el-icon-switch-button"></i> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog
      v-if="profileDialogVisible"
      title="个人信息"
      :visible.sync="profileDialogVisible"
      width="400px"
      custom-class="profile-dialog"
      :close-on-click-modal="false"
    >
      <div class="profile-edit">
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleAvatarChange"
          >
            <img
              v-if="
                tempAvatar ||
                (userInfo.avatar && userInfo.avatar.trim() !== '') ||
                defaultAvatar
              "
              :src="
                tempAvatar ||
                (userInfo.avatar && userInfo.avatar.trim() !== ''
                  ? userInfo.avatar
                  : defaultAvatar)
              "
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="avatar-hover">
              <i class="el-icon-camera"></i>
              <span>更换头像</span>
            </div>
          </el-upload>
        </div>

        <el-form
          :label-position="labelPosition"
          label-width="80px"
          :model="profileForm"
          class="profile-form"
        >
          <el-form-item label="用户名">
            <el-input v-model="profileForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="profileForm.nickname"></el-input>
          </el-form-item>
          <el-form-item label="简介">
            <el-input type="textarea" v-model="profileForm.intro"></el-input>
          </el-form-item>

          <el-button
            type="primary"
            @click="togglePasswordSection"
            class="password-btn"
            >修改密码</el-button
          >

          <div class="password-section" v-show="showPasswordSection">
            <el-form-item label="旧密码">
              <el-input
                type="password"
                v-model="profileForm.oldPwd"
                placeholder="请输入旧密码"
              ></el-input>
            </el-form-item>
            <el-form-item label="新密码">
              <el-input
                type="password"
                v-model="profileForm.newPwd"
                placeholder="请输入新密码"
              ></el-input>
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input
                type="password"
                v-model="profileForm.conPwd"
                placeholder="请确认新密码"
              ></el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="profileDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveProfile">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import defaultAvatar from "@/assets/image/default.jpg";
import tokenUtils from "../../../utils/token";
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
      selectedAvatarFile: null, // 临时存储选中的文件
      uploadHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      profileForm: {
        username: "",
        nickname: "",
        avatarUrl: "",
        intro: "",
        oldPwd: "",
        newPwd: "",
        conPwd: "",
      },
      defaultAvatar,
      showPasswordSection: false,
      inputKey: 0, // 用于强制更新
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
            intro: newVal.intro,
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

    handleAvatarChange(file) {
      // 创建图片预览
      const reader = new FileReader();
      reader.onload = (e) => {
        this.tempAvatar = e.target.result; // 显示预览图
      };
      reader.readAsDataURL(file.raw); // 读取文件
      this.selectedAvatarFile = file.raw; // 保存选中的文件
    },

    handleEditProfile() {
      this.profileDialogVisible = true;
      this.tempAvatar = "";
      this.showPasswordSection = false;
      this.profileForm = {
        username: this.userInfo.username,
        nickname: this.userInfo.nickname,
        avatarUrl: this.userInfo.avatarUrl,
        intro: this.userInfo.intro,
        oldPassword: "", // 确保重置密码字段
        newPassword: "",
        confirmPassword: "",
      };
      console.log("个人信息", this.userInfo);
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
      console.log("头像上传成功", res);

      if (res.code === 200) {
        const avatarUrl = `http://127.0.0.1:5001${res.data.url}`;
        console.log("头像上传成功", avatarUrl);

        this.tempAvatar = avatarUrl;
        this.profileForm.avatarUrl = avatarUrl;
        console.log("头像上传成功", this.profileForm.avatarUrl);
        console.log("头像上传成功", this.tempAvatar);

        this.$message.success("头像上传成功");
      } else {
        this.$message.error(res.message || "头像上传失败");
      }
    },

    handleUploadError(err) {
      console.error("上传失败:", err);
      this.$message.error("上传失败，请重试");
    },

    async handleSaveProfile() {
      try {
        const formData = new FormData();
        const { nickname, intro, oldPwd, newPwd, conPwd } = this.profileForm;

        // 填充表单数据
        formData.append("username", this.userInfo.username); // 从用户信息中获取用户名
        if (nickname) formData.append("nickname", nickname);
        if (intro) formData.append("intro", intro);

        // 验证并处理密码相关信息
        if (oldPwd) {
          if (!newPwd) {
            this.$message.error("请输入新密码");
            return;
          }
          if (!conPwd) {
            this.$message.error("请确认新密码");
            return;
          }
          if (newPwd !== conPwd) {
            this.$message.error("两次密码输入不一致");
            return;
          }
          formData.append("oldPassword", oldPwd);
          formData.append("newPassword", newPwd);
          formData.append("confirmPassword", conPwd);
        }

        // 如果选择了头像文件，添加到表单
        if (this.selectedAvatarFile) {
          formData.append("avatar", this.selectedAvatarFile);
        }

        // 发送请求到后端
        const response = await this.$authHttp.post(
          "/api/user/update",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // 处理后端响应
        const { data } = response;
        if (data.code === 200) {
          this.$message.success("个人信息已更新");

          // 更新前端存储的用户信息
          const updatedUserInfo = {
            ...this.userInfo,
            ...data.data.updated_fields,
          };
          await this.$store.dispatch("saveUserInfo", updatedUserInfo);

          // 关闭编辑窗口
          this.profileDialogVisible = false;

          // 清空密码字段
          this.profileForm.oldPwd = "";
          this.profileForm.newPwd = "";
          this.profileForm.conPwd = "";
        } else {
          this.$message.error(data.message || "更新失败");
        }
      } catch (error) {
        console.error("更新个人信息失败:", error);

        // 检查错误信息
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          this.$message.error(error.response.data.error);
        } else {
          this.$message.error("更新个人信息失败，请稍后重试");
        }
      }
    },

    //登出
    async handleLogout() {
      // this.$http
      //   .get("/logout")
      //   .then((res) => {
      //     this.$message.success("成功退出");
      //     this.$store.dispatch("saveUserInfo", null);
      //     this.$store.dispatch("savePersonalList", []);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });

      try {
        const response = await this.$authHttp.get("/logout");
        console.log("登出响应:", response);

        this.profileDialogVisible = false; // 关闭个人信息弹窗
        this.$store.dispatch("saveUserInfo", null);
        this.$store.dispatch("savePersonalList", []);
        // 清理本地存储
        tokenUtils.removeToken();
        // 刷新页面
        localStorage.setItem("logout", "登出成功");
        window.location.reload();
      } catch (error) {
        console.error("登出失败:", error);
        this.$message.error(error.message || "登出失败");
      }
    },

    togglePasswordSection() {
      this.showPasswordSection = !this.showPasswordSection;
      this.inputKey += 1;
    },
  },

  mounted() {
    console.log("user info:", this.userInfo);
    const logoutMessage = localStorage.getItem("logout");
    if (logoutMessage) {
      this.$message.success(logoutMessage);
      localStorage.removeItem("logout");
    }
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
  transform: translate(-50%, 3%);
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

:deep(.el-input__inner:nth-child(1)) {
  margin-top: 25px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  height: 65px;
}

:deep(.el-textarea__inner) {
  min-height: 60px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #3a3a47;
  border-color: #4a4a57;
  color: #fff;
  width: 225px;
  margin-left: 15px;
  opacity: 0.5;
  resize: none;
}

.password-btn {
  width: 100%;
  margin-top: 15px;
}
</style>
