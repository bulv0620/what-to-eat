<template>
  <view class="select-container">
    <view class="header">
      <view class="legend">
        <view class="cell">荤菜</view>
        <view class="cell">半荤</view>
        <view class="cell">素菜</view>
      </view>
      <view class="menu">
        <u-icon
          name="list-dot"
          color="#606266"
          size="24"
          @click="toMenuPage"
        ></u-icon>
      </view>
    </view>

    <view class="main">
      <view class="select-box">
        <view
          v-for="item in sortedItems"
          :key="item.id"
          class="select-item"
          :class="item.type"
          @click="handleItemClick(item)"
        >
          {{ item.itemName }}
        </view>

        <view
          class="vote-box"
          v-if="activeVote"
          :class="{ agree: activeVote.isAgree }"
          @click="handleShowVoteInfo"
        >
          <up-avatar
            class="avatar"
            :src="activeVote.user.avatar"
            size="78rpx"
          ></up-avatar>
        </view>
      </view>

      <view class="btn-box">
        <view v-if="!isCook" class="btn agree" @click="handleVote(true)">
          <u-icon name="checkbox-mark" color="#fff" size="28"></u-icon>
        </view>
        <view v-if="!isCook" class="btn disagree" @click="handleVote(false)">
          <u-icon name="close" color="#fff" size="28"></u-icon>
        </view>
        <view v-if="isCook" class="btn random" @click="handleRefresh">
          <u-icon name="reload" color="#fff" size="28"></u-icon>
        </view>
        <view v-if="isCook" class="btn add" @click="getRandomItem">
          <u-icon name="plus" color="#fff" size="28"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed } from "vue";
import request from "../../utils/request";
import { onShow } from "@dcloudio/uni-app";

onShow(async () => {
  await getUserInfo();

  await getItems();
});

// 用户信息
const userState = reactive({
  id: "",
  avatar: "",
  nickname: "",
  activeGroup: null,
});

const isCook = computed(() => {
  return userState.activeGroup?.cook.id === userState.id;
});

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
    if (!userState.activeGroup) {
      uni.hideLoading();

      await confirm("请先选择组", "取消", "确定", false);

      uni.switchTab({
        url: "/pages/user/index",
      });
      return Promise.reject("未选组");
    }
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 菜品
const itemState = reactive({
  todayItemList: [],
  activeItem: null,
  order: null,
});

const votes = computed(() => {
  if (!itemState.order) return [];
  return itemState.order.votes;
});

const activeVote = computed(() => {
  if (votes.value.length === 0) return null;

  return (
    votes.value.find((vote) => vote.user.id === userState.id) || votes.value[0]
  );
});

const sortedItems = computed(() => {
  const arr1 = [];
  const arr2 = [];
  const arr3 = [];
  itemState.todayItemList.forEach((item) => {
    if (item.type === "meatDish") {
      arr1.push(item);
    } else if (item.type === "halfMeatDish") {
      arr2.push(item);
    } else {
      arr3.push(item);
    }
  });
  return [...arr1, ...arr2, ...arr3];
});

async function handleItemClick(item) {
  if (!isCook.value) return;
  try {
    const index = await selectAction();

    if (index === 0) {
      itemState.activeItem = item;

      await getRandomItem();

      itemState.activeItem = null;
    } else {
      await confirm(`确认删除 '${item.itemName}' 吗?`, "取消", "确定");

      await updateOrder(null, [item]);
    }
  } catch (error) {}
}

async function handleRefresh() {
  await confirm("确认清空吗?", "取消", "确定");
  await updateOrder(null, [...itemState.todayItemList]);
}

// 获取菜品列表
async function getItems() {
  try {
    uni.showLoading({
      title: "加载中",
      mask: true,
    });

    const payload = {
      group: userState.activeGroup,
      date: getTodayTimeRange(),
    };
    const order = await request.post("/order/getOne", payload);

    itemState.order = order;
    itemState.todayItemList = order?.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 获取随机菜品添加
async function getRandomItem() {
  try {
    const type = await select();

    uni.showLoading({
      title: "创建中",
      mask: true,
    });

    const payload = {
      group: userState.activeGroup,
      type,
      date: getTodayTimeRange(),
    };

    const item = await request.post("/order/randomItem", payload);

    uni.hideLoading();

    await confirm(`'${item.itemName}' 怎么样?`, "不要", "就这个");

    // 菜单更新
    await updateOrder(
      [item],
      itemState.activeItem ? [itemState.activeItem] : null
    );
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 菜单更新
async function updateOrder(items, removeItems) {
  try {
    uni.showLoading({
      title: "更新中",
      mask: true,
    });

    const payload = {
      group: userState.activeGroup,
      date: getTodayTimeRange(),
    };
    if (items) {
      payload.items = items;
    }
    if (removeItems) {
      payload.removeItems = removeItems;
    }

    await request.post("/order/update", payload);

    await getItems();

    uni.showToast({ icon: "success", title: "更新成功" });
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

function getTodayTimeRange() {
  const today = new Date(); // 获取当前日期
  const start = new Date(today); // 复制当前日期作为开始日期
  start.setHours(0, 0, 0, 0); // 设置开始时间为当天的0点0分0秒0毫秒

  const end = new Date(today); // 复制当前日期作为结束日期
  end.setHours(23, 59, 59, 999); // 设置结束时间为当天的23点59分59秒999毫秒

  return [start, end]; // 返回时间区间数组
}

function confirm(
  content,
  cancelText = "取消",
  confirmText = "确定",
  showCancel = true
) {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: "提示",
      content,
      cancelText,
      confirmText,
      showCancel,
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

function select() {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      title: "选择类型",
      itemList: ["荤菜", "半荤", "素菜"],
      success: ({ tapIndex }) => {
        if (tapIndex < 3 && tapIndex >= 0) {
          resolve(["meatDish", "halfMeatDish", "vegetableDish"][tapIndex]);
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

function selectAction() {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      title: "选择类型",
      itemList: ["更换当前", "删除"],
      success: ({ tapIndex }) => {
        if (tapIndex < 2 && tapIndex >= 0) {
          resolve(tapIndex);
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

// 投票相关
async function handleVote(flag) {
  try {
    if (!itemState.order || itemState.todayItemList.length === 0) {
      uni.showToast({ icon: "error", title: "菜单还未生成" });
    }
    uni.showLoading({
      title: "更新中",
      mask: true,
    });

    const payload = {
      order: itemState.order,
      isAgree: flag,
    };

    await request.post("/vote", payload);

    uni.showToast({ icon: "success", title: "投票成功" });

    await getItems();
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 展示投票详情
function handleShowVoteInfo() {
  let agreeNum = 0;
  let disAgreeNum = 0;
  votes.value.forEach((vote) => {
    if (vote.isAgree) {
      agreeNum++;
    } else {
      disAgreeNum++;
    }
  });
  confirm(
    `已有 ${votes.value.length} 人投票，${agreeNum} 人赞成，${disAgreeNum} 人反对`
  );
}

function toMenuPage() {
  uni.navigateTo({
    url: "/pages/menu/index",
  });
}
</script>

<style lang="scss" scoped>
.select-container {
  .header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 8px;

    .legend {
      display: flex;
      gap: 8px;

      .cell {
        position: relative;
        padding-left: 18px;

        &:first-child {
          color: #409eff;

          &::before {
            background: #409eff;
          }
        }

        &:nth-child(2) {
          color: #e6a23c;

          &::before {
            background: #e6a23c;
          }
        }

        &:nth-child(3) {
          color: #67c23a;

          &::before {
            background: #67c23a;
          }
        }

        &::before {
          content: "";
          width: 12px;
          height: 12px;
          position: absolute;
          left: 2px;
          top: 4px;
          border-radius: 4px;
        }
      }
    }
  }

  .main {
    height: calc(100vh - 54px);
    width: 100vw;
    position: relative;

    .select-box {
      width: 90%;
      height: 83%;
      background: linear-gradient(to bottom right, #d9ecff, #e3e3e3);
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 12px;
      overflow: auto;
      padding: 18rpx;

      .select-item {
        margin-bottom: 12rpx;
        padding: 28rpx;
        border-radius: 6px;
        text-align: center;

        &.meatDish {
          background: linear-gradient(to bottom right, #409eff, #e3e3e3);
        }
        &.halfMeatDish {
          background: linear-gradient(to bottom right, #e6a23c, #e3e3e3);
        }
        &.vegetableDish {
          background: linear-gradient(to bottom right, #67c23a, #e3e3e3);
        }
      }

      .vote-box {
        // background: #000;
        border: 10rpx solid #f56c6c80;
        width: 78rpx;
        height: 78rpx;
        border-radius: 100%;
        position: absolute;
        right: 18rpx;
        bottom: 18rpx;
        overflow: hidden;

        &.agree {
          border: 10rpx solid #67c23a80;
        }

        // .avatar {
        //   width: 100% !important;
        //   height: 100% !important;
        // }
      }
    }

    .btn-box {
      height: 13%;
      width: 100%;
      position: absolute;
      bottom: 1%;
      display: flex;
      gap: 36rpx;
      justify-content: center;
      align-items: center;

      .btn {
        height: 70%;
        width: 25%;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;

        &.agree {
          background: linear-gradient(to bottom right, #67c23a, #e3e3e3);
        }

        &.disagree {
          background: linear-gradient(to bottom right, #f56c6c, #e3e3e3);
        }

        &.random {
          background: linear-gradient(to bottom right, #e6a23c, #e3e3e3);
        }

        &.add {
          background: linear-gradient(to bottom right, #409eff, #e3e3e3);
        }
      }
    }
  }
}
</style>
