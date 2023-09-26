<template>
  <view class="container">
    <view class="info">
      <up-avatar :src="userState.avatar" size="68"></up-avatar>
      <view>{{ userState.nickname }}</view>
      <u-tag
        :text="`当前饭团: ${userState.activeGroup?.groupName || '未选择'}`"
        size="mini"
        :type="userState.activeGroup ? 'primary' : 'info'"
      ></u-tag>
    </view>
    <view class="menu">
      <u-cell-group>
        <u-cell
          icon="account-fill"
          title="我的饭团"
          :isLink="true"
          @click="toMyGroups"
        ></u-cell>
        <u-cell
          icon="star-fill"
          title="创建饭团"
          :isLink="true"
          @click="handleCreateGroup"
        ></u-cell>
        <u-cell
          icon="man-add-fill"
          title="加入饭团"
          :isLink="true"
          @click="handleJoinGroup"
        ></u-cell>
      </u-cell-group>
    </view>
    <view class="btn">
      <up-button text="注销" @click="handleLogout"></up-button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import request from "../../utils/request";
import { onShow } from "@dcloudio/uni-app";

// 用户信息
const userState = reactive({
  avatar: "",
  nickname: "",
  activeGroup: null,
});

onShow(() => {
  getUserInfo();
});

async function getUserInfo() {
  uni.showLoading({
    title: "获取用户信息",
    mask: true,
  });
  try {
    const res = await request.get("/user/info");
    userState.avatar = res.avatar;
    userState.nickname = res.nickname;
    userState.activeGroup = res.activeGroup;
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 注销登录
function handleLogout() {
  uni.removeStorageSync("APP_ACCESS_TOEKN");
  uni.redirectTo({
    url: "/pages/login/index",
  });
}

// 创建group
async function handleCreateGroup() {
  try {
    const groupName = await prompt("请输入饭团名称");
    if (!groupName) {
      setTimeout(() => {
        uni.showToast({
          icon: "error",
          title: "饭团名称为空",
        });
      });
      return;
    }
    const payload = {
      groupName,
    };

    uni.showLoading({
      title: "创建中",
      mask: true,
    });
    await request.post("/group/create", payload);

    setTimeout(() => {
      uni.showToast({ icon: "success", title: "创建成功" });
    });
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 加入group
async function handleJoinGroup() {
  try {
    const groupName = await prompt("请输入饭团名称");
    if (!groupName) {
      setTimeout(() => {
        uni.showToast({
          icon: "error",
          title: "饭团名称为空",
        });
      });
      return;
    }
    const payload = {
      groupName,
    };

    uni.showLoading({
      title: "请求中",
      mask: true,
    });
    await request.post("/group/join", payload);

    setTimeout(() => {
      uni.showToast({ icon: "success", title: "加入成功" });
    });
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

function prompt(title) {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title,
      editable: true,
      success: ({ confirm, content }) => {
        if (confirm) {
          resolve(content);
        } else {
          reject();
        }
      },
      fail: () => {
        reject();
      },
    });
  });
}

// 我的饭团跳转
function toMyGroups() {
  uni.navigateTo({
    url: "/pages/group/index",
  });
}
</script>

<style lang="scss" scoped>
.container {
  .info {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 18rpx;
    padding: 48rpx 0;
    background: linear-gradient(
      to bottom right,
      #409EFF,
      #d9ecff
    );
  }

  .menu {
    margin-bottom: 28rpx;
  }

  .btn {
    padding: 0 28rpx;
  }
}
</style>
