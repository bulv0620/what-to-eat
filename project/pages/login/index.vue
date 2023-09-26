<template>
  <view class="login-container">
    <button
      class="avatar-wrapper"
      open-type="chooseAvatar"
      @chooseavatar="onChooseAvatar"
    >
      <image class="avatar" :src="state.avatar"></image>
    </button>
    <input
      type="nickname"
      class="weui-input"
      placeholder="请输入昵称"
      v-model="state.nickname"
    />
    <up-button
      text="点击登录"
      type="primary"
      open-type="getUserInfo"
      @click="handleLogin"
    ></up-button>
  </view>
</template>

<script setup>
import { reactive } from "vue";
import request from "../../utils/request";

const state = reactive({
  avatar: "",
  nickname: "",
});

function onChooseAvatar(e) {
  const { avatarUrl } = e.detail 
	state.avatar = avatarUrl
}

async function handleLogin() {
	if(!state.avatar) {
		uni.showToast({
			icon: 'error',
			title: '请授权头像内容'
		})
		return 
	}
	if(!state.nickname) {
		uni.showToast({
			icon: 'error',
			title: '请授权用户名'
		})
		return 
	}
  uni.showLoading({
    title: "登录请求中",
    mask: true,
  });

  try {
    const userProfile = await getUserProfile();

    const { code } = await uni.login();

    const payload = {
      iv: userProfile.iv,
      encryptedData: userProfile.encryptedData,
      code,
			avatar: state.avatar,
			nickname: state.nickname
    };

    const { token } = await request.post("/user/login", payload);

    uni.setStorageSync("APP_ACCESS_TOEKN", token);
    uni.switchTab({
      url: "/pages/user/index",
    });
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

async function getUserProfile() {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: "Wexin", // 这个参数是必须的
      success: async (userProfile) => {
        resolve(userProfile);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  padding: 0 12px;

	.avatar-wrapper {
		width: 150rpx;
		height: 150rpx;
		margin: 24px auto;
		padding: 0;

		.avatar {
			width: 100%;
			height: 100%;
		}
	}

	.weui-input {
		margin: 24px auto;
		text-align: center;
	}
}
</style>
