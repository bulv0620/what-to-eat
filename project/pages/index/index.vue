<template>
  <view class="select-container">
    <view class="header">
      <view class="legend">
        <view class="cell">荤菜</view>
        <view class="cell">半荤</view>
        <view class="cell">素菜</view>
      </view>
      <view class="date">{{ today }}</view>
    </view>

    <view class="main">
      <view class="select-box">
        <view
          v-for="item in sortedItems"
          :key="item.id"
          class="select-item"
          :class="item.type"
        >
          {{ item.itemName }}
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

// 日期
const today = getFormattedTodayDate();

function getFormattedTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 月份从0开始，因此需要加1
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 用户信息
const userState = reactive({
  id: "",
  avatar: "",
  nickname: "",
  activeGroup: null,
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

// 获取菜品列表
async function getItems() {
  try {
    uni.showLoading({
      title: "加载中",
      mask: true,
    });

    const payload = {
      group: userState.activeGroup,
      date: getYesterdayTimeRange(),
    };
    const order = await request.post("/order/getOne", payload);

    console.log(order);
    itemState.todayItemList = order?.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

function getYesterdayTimeRange() {
  const today = new Date(); // 获取当前日期
  const start = new Date(today); // 复制当前日期作为开始日期
  start.setDate(today.getDate() - 1); // 设置开始日期为昨天

  start.setHours(0, 0, 0, 0); // 设置开始时间为昨天的0点0分0秒0毫秒

  const end = new Date(today); // 复制当前日期作为结束日期
  end.setDate(today.getDate() - 1); // 设置结束日期为昨天

  end.setHours(23, 59, 59, 999); // 设置结束时间为昨天的23点59分59秒999毫秒

  return [start, end]; // 返回时间区间数组
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

    .date {
      color: #409eff;
    }
  }

  .main {
    height: calc(100vh - 54px);
    width: 100vw;
    position: relative;

    .select-box {
      width: 90%;
      height: 94%;
      background: linear-gradient(to bottom right, #f0fff3, #e3e3e3);
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
    }
  }
}
</style>
