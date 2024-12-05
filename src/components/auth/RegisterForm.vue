<template>
  <div class="register-form">
    <h2>注册</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>账号</label>
        <input v-model="form.username" type="text" required />
      </div>

      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" required />
      </div>

      <div class="form-group">
        <label>确认密码</label>
        <input v-model="form.confirmPassword" type="password" required />
      </div>

      <div class="form-group">
        <label>密保问题</label>
        <input v-model="form.security_question" type="text" required />
      </div>

      <div class="form-group">
        <label>密保答案</label>
        <input v-model="form.security_answer" type="text" required />
      </div>

      <button type="submit">注册</button>

      <!-- 新增返回按钮 -->
      <div class="form-links" style="margin-top: 10px">
        <a
          @click="$emit('switch-mode', 'login')"
          style="width: 100%; text-align: center"
          >返回登录</a
        >
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  data() {
    return {
      form: {
        username: "",
        password: "",
        confirmPassword: "",
        security_question: "",
        security_answer: "",
      },
    };
  },
  // const handleSubmit = async () => {
  //   if (
  //     form.value.username === "" ||
  //     form.value.password === "" ||
  //     form.value.confirmPassword === "" ||
  //     form.value.security_question === "" ||
  //     form.value.security_answer === ""
  //   ) {
  //     alert("请填写所有必填项!");
  //     return;
  //   }

  //   if (form.value.password !== form.value.confirmPassword) {
  //     alert("两次密码输入不一致!");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post("http://127.0.0.1:5001/register", {
  //       username: form.value.username,
  //       password: form.value.password,
  //       security_question: form.value.security_question,
  //       security_answer: form.value.security_answer,
  //     });

  //     alert("注册成功!");
  //     // this.$emit("switch-mode", "login");
  //   } catch (error) {
  //     alert(error.response?.data?.message || "注册失败");
  //   }
  // };

  // return {
  //   form,
  //   // handleSubmit: async function () {
  //   //   if (
  //   //     this.form.username === "" ||
  //   //     this.form.password === "" ||
  //   //     this.form.confirmPassword === "" ||
  //   //     this.form.security_question === "" ||
  //   //     this.form.security_answer === ""
  //   //   ) {
  //   //     alert("请填写所有必填项!");
  //   //     return;
  //   //   }

  //   //   if (this.form.password !== this.form.confirmPassword) {
  //   //     alert("两次密码输入不一致!");
  //   //     return;
  //   //   }

  //   //   try {
  //   //     await axios.post("http://127.0.0.1:5001/register", {
  //   //       username: this.form.username,
  //   //       password: this.form.password,
  //   //       security_question: this.form.security_question,
  //   //       security_answer: this.form.security_answer,
  //   //     });

  //   //     alert("注册成功!");
  //   //     // 切换到登录模式
  //   //     this.$emit("switch-mode", "login");
  //   //   } catch (error) {
  //   //     alert(error.response?.data?.message || "注册失败");
  //   //   }
  //   // },
  // };

  methods: {
    async handleSubmit() {
      // 使用普通函数
      if (
        this.form.username === "" ||
        this.form.password === "" ||
        this.form.confirmPassword === "" ||
        this.form.security_question === "" ||
        this.form.security_answer === ""
      ) {
        alert("请填写所有必填项!");
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        alert("两次密码输入不一致!");
        return;
      }

      try {
        await axios.post("http://127.0.0.1:5001/register", {
          username: this.form.username,
          password: this.form.password,
          security_question: this.form.security_question,
          security_answer: this.form.security_answer,
        });

        alert("注册成功!");
        // 切换到登录模式
        this.$emit("switch-mode", "login");
      } catch (error) {
        alert(error.response?.data?.message || "注册失败");
      }
    },
  },
};
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
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
}

button:hover {
  background-color: #45a049;
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
