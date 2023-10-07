<template>
  <view class="group-container">
    <h1 class="title">
      {{
        groupState.groupList.length === 0
          ? "还未加入任何饭团"
          : "点击选择当前的饭团"
      }}
    </h1>
    <ul class="list">
      <li
        class="list-item"
        v-for="group in groupState.groupList"
        :key="group.id"
        :class="{ active: userState.activeGroup?.id === group.id }"
        @click="setActiveGroup(group)"
      >
        <p class="list-item__name">{{ group.groupName }}</p>
        <p class="list-item__tags">
          <u-tag
            v-if="userState.activeGroup?.id === group.id"
            text="当前饭团"
            size="mini"
            type="primary"
          ></u-tag>
          <u-tag
            v-if="group.cook.id === userState.id"
            text="团长"
            size="mini"
            type="error"
          ></u-tag>
        </p>
      </li>
    </ul>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import request from "../../utils/request";
import { onLoad } from "@dcloudio/uni-app";

onLoad(async () => {
  await getUserInfo();
  await getGroups();
});

const groupState = reactive({
  groupList: [],
});

// 用户信息
const userState = reactive({
  id: "",
  avatar: "",
  nickname: "",
  activeGroup: null,
});

async function getGroups() {
  uni.showLoading({
    title: "获取饭团列表",
    mask: true,
  });
  try {
    const res = await request.get("/group/list");

    groupState.groupList = res;
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

async function getUserInfo() {
  uni.showLoading({
    title: "获取用户信息",
    mask: true,
  });
  try {
    const res = await request.get("/user/info");
    userState.id = res.id;
    userState.avatar = res.avatar;
    userState.nickname = res.nickname;
    userState.activeGroup = res.activeGroup;
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

function confirm(name) {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: "提示",
      content: `是否将 '${name}' 设为当前饭团?`,
      success: ({ confirm }) => {
        if (confirm) {
          resolve();
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

async function setActiveGroup(group) {
  if (userState.activeGroup?.id === group.id) {
    return;
  }

  try {
    await confirm(group.groupName);

    uni.showLoading({
      title: "设置中",
      mask: true,
    });

    const payload = {
      ...group,
    };
    await request.post("/user/setActiveGroup", payload);

    await getUserInfo();

    uni.showToast({
      icon: "success",
      title: "设置成功",
    });
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}
</script>

<style lang="scss" scoped>
.group-container {
  .title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    color: #606266;
    padding-top: 28rpx;
  }
  .list {
    padding: 24rpx;
    .list-item {
      margin-bottom: 12rpx;
      padding: 28rpx;
      background: #e3e3e3;
      display: flex;
      justify-content: space-between;
      border-radius: 6px;

      &.active {
        background: linear-gradient(to bottom right, #409eff, #d9ecff);
        color: #fff;
      }

      .list-item__tags {
        display: flex;
        gap: 12rpx;
      }
    }
  }
}
</style>
