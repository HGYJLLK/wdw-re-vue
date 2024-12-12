<template>
  <div class="auth-form">
    <h2>登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>账号</label>
        <input v-model="form.username" type="text" required />
      </div>

      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" required />
      </div>

      <button type="submit" class="form-group">登录</button>

      <div class="form-links">
        <a @click="$emit('switch-mode', 'forgot')">忘记密码?</a>
        <a @click="$emit('switch-mode', 'register')">注册账号</a>
      </div>
    </form>
  </div>
</template>

<script>
import tokenUtils from "../../utils/token";

export default {
  emits: ["switch-mode"],

  data() {
    return {
      form: {
        username: "",
        password: "",
      },
    };
  },

  methods: {
    async handleSubmit() {
      if (!this.form.username || !this.form.password) {
        this.$message.error("账号或密码不能为空");
        return;
      }

      try {
        const response = await this.$authHttp.post("/login", this.form);
        const { data } = response;

        if (!data) {
          throw new Error("登录响应数据为空");
        }

        // 保存token
        if (data.data && data.data.token) {
          tokenUtils.setToken(data.data.token);
        }

        // 保存用户信息
        if (data.data && data.data.userInfo) {
          await this.$store.dispatch("saveUserInfo", data.data.userInfo);
        }

        // 关闭登录框
        await this.$store.dispatch("changeShowLogin", false);

        // 清空表单
        this.form.username = "";
        this.form.password = "";

        // 重新获取用户列表
        await this.$store.dispatch("savePersonalList", []);

        // 保存成功消息到 localStorage
        localStorage.setItem("loginSuccessMessage", "登录成功!");

        // 刷新页面
        window.location.reload();
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.error || "登录失败";
          this.$message.error(errorMessage);
        } else {
          this.$message.error(error.message || "登录失败");
        }
      }
    },

    goToHome() {
      this.$emit("goToHome");
    },
  },
  mounted() {
    // 读取保存的成功消息
    const successMessage = localStorage.getItem("loginSuccessMessage");

    if (successMessage) {
      // 显示成功消息
      this.$message.success(successMessage);

      // 清除已显示的消息，防止再次显示
      localStorage.removeItem("loginSuccessMessage");
    }
  },
};
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
}

.form-links {
  margin-top: 15px;
  text-align: center;
}

.form-links a {
  color: #4caf50;
  cursor: pointer;
  margin: 0 10px;
}
</style>