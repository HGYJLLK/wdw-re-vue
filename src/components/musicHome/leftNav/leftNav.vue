<template>
  <div class="leftNav">
    <el-col>
      <el-menu
        :router="true"
        active-text-color="#fff"
        :default-active="
          '/' +
          this.$route.path.split('/')[1] +
          '/' +
          this.$route.path.split('/')[2]
        "
        class="el-menu-vertical-demo"
        text-color="rgv(212, 212, 213)"
        @open="handleOpen"
        @close="handleClose"
      >
        <p class="leftNavFont">推荐</p>
        <div>
          <el-menu-item index="/musicHome/findMusic">
            <i class="iconfont icon-music"></i>
            <span slot="title">发现音乐</span>
          </el-menu-item>
        </div>
        <p class="leftNavFont">我的音乐</p>
        <div v-if="isLoggedIn">
          <el-menu-item index="/musicHome/myCloudMusic">
            <img
              src="@/assets/image/jiashimoshibendiyinle.svg"
              alt=""
              style="width: 22px; border-radius: 40px; margin-right: 4px"
            />
            <span slot="title">本地音乐</span>
          </el-menu-item>
        </div>
        <div v-if="isLoggedIn">
          <el-menu-item index="/musicHome/myFavoriteMusic">
            <img
              src="@/assets/image/xihuan.svg"
              alt=""
              style="width: 22px; border-radius: 40px; margin-right: 4px"
            />
            <span slot="title">我喜欢的音乐</span>
          </el-menu-item>
        </div>
        <div v-if="isLoggedIn">
          <el-menu-item index="/musicHome/mySongListMusic">
            <img
              src="@/assets/image/wodegedan.svg"
              alt=""
              style="width: 22px; border-radius: 40px; margin-right: 4px"
            />
            <span slot="title">我的歌单</span>
          </el-menu-item>
        </div>
      </el-menu>
      <br /><br /><br /><br /><br /><br /><br /><br /><br />
    </el-col>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import tokenUtils from "../../../utils/token";
export default {
  name: "leftNav",
  components: {},
  computed: {
    ...mapGetters([
      //用户歌单
      "personalList",
      //用户信息
      "userInfo",
    ]),
    isLoggedIn() {
      console.log("isLoggedIn", tokenUtils.hasToken());
      console.log("userInfo", this.userInfo);

      return tokenUtils.hasToken() && this.userInfo; // 根据 Token 判断是否登录
    },
  },
  data() {
    return {};
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
  },
  created() {},
};
</script>

<style scoped>
.el-col {
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
}
.el-col:hover {
  overflow-y: overlay;
}
.leftNavFont {
  opacity: 0.5;
  font-weight: 50;
  font-size: 13px;
  margin-left: 10px;
  color: #fff;
}

.iconfont {
  margin-right: 10px;
  color: #fff;
}

.el-menu-item.is-active {
  background-color: rgb(252, 60, 88) !important;
}

.el-menu-item:hover {
  background: rgb(252, 60, 88) !important;
  color: #fff !important;
}
.el-menu-item {
  color: #fff;
}

.el-menu {
  background: rgb(26, 26, 33);
  border: none;
}
</style>
