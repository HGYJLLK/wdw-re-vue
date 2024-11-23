<template>
  <div class="auth-overlay">
    <div class="auth-container">
      <!-- 登录表单 -->
      <LoginForm
        v-if="currentMode === 'login'"
        @switch-mode="switchMode"
        @goToHome="closeLogin"
      />

      <!-- 注册表单 -->
      <RegisterForm
        v-else-if="currentMode === 'register'"
        @switch-mode="switchMode"
      />

      <!-- 找回密码表单 -->
      <ForgotPassword
        v-else-if="currentMode === 'forgot'"
        @switch-mode="switchMode"
      />

      <!-- 关闭按钮 -->
      <div class="close-btn" @click="closeLogin">
        <i class="el-icon-close"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { mapGetters } from "vuex";
import LoginForm from "../../auth/LoginForm.vue";
import RegisterForm from "../../auth/RegisterForm.vue";
import ForgotPassword from "../../auth/ForgotPassword.vue";

export default {
  name: "Login",

  components: {
    LoginForm,
    RegisterForm,
    ForgotPassword,
  },

  data() {
    return {
      currentMode: "login",
    };
  },

  computed: {
    ...mapGetters(["showLogin"]),
  },

  methods: {
    switchMode(mode) {
      this.currentMode = mode;
    },

    closeLogin() {
      this.$store.dispatch("changeShowLogin", false);
    },
  },

  // 当组件显示时，重置为登录模式
  watch: {
    showLogin(val) {
      if (val) {
        this.currentMode = "login";
      }
    },
  },
};
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.auth-container {
  position: relative;
  background-color: rgb(45, 45, 56);
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #fff;
}

/* 为了确保内容不会溢出 */
.auth-container {
  max-height: 90vh;
  overflow-y: auto;
}

/* 动画效果 */
.auth-container {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>