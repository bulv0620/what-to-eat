<template>
  <view class="menu-container">
    <u-index-list
      v-if="menuState.menuList.length > 0"
      :index-list="menuState.indexList"
    >
      <template v-for="(item, index) in indexedMenu" :key="item.id">
        <!-- #ifdef APP-NVUE -->
        <u-index-anchor :text="menuState.indexList[index]"></u-index-anchor>
        <!-- #endif -->
        <u-index-item>
          <!-- #ifndef APP-NVUE -->
          <u-index-anchor :text="menuState.indexList[index]"></u-index-anchor>
          <!-- #endif -->
          <view
            class="list-cell"
            v-for="(cell, index) in item"
            :key="cell.id"
            @click="handleUpdateItem(cell)"
          >
            {{ cell.itemName }}
          </view>
        </u-index-item>
      </template>
    </u-index-list>

    <view v-else class="empty">
      <u-empty mode="list"> </u-empty>
    </view>

    <view class="add-btn">
      <u-icon
        name="plus-circle-fill"
        color="#409EFF"
        :size="48"
        @click="handleCreateItem"
      ></u-icon>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed } from "vue";
import request from "../../utils/request";
import { onLoad } from "@dcloudio/uni-app";

onLoad(async () => {
  await getUserInfo();
  await getMenuItems();
});

// 用户信息
const userState = reactive({
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
    userState.avatar = res.avatar;
    userState.nickname = res.nickname;
    userState.activeGroup = res.activeGroup;
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 菜品信息
const menuState = reactive({
  indexList: ["荤", "半", "素"],
  menuList: [],
});

const indexedMenu = computed(() => {
  const arr1 = [];
  const arr2 = [];
  const arr3 = [];
  menuState.menuList.forEach((item) => {
    if (item.type === "meatDish") {
      arr1.push(item);
    } else if (item.type === "halfMeatDish") {
      arr2.push(item);
    } else {
      arr3.push(item);
    }
  });
  return [arr1, arr2, arr3];
});

async function getMenuItems() {
  uni.showLoading({
    title: "获取菜单信息",
    mask: true,
  });
  try {
    const paylod = {
      ...userState.activeGroup,
    };
    const res = await request.post("/item/list", paylod);

    menuState.menuList = res;
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 新增菜品
async function handleCreateItem() {
  try {
    const type = await select();
    const itemName = await prompt("请输入菜品名称");
    if (!itemName) {
      uni.showToast({
        icon: "error",
        title: "名称不能为空",
      });
      return;
    }

    const payload = {
      group: userState.activeGroup,
      type,
      itemName,
    };

    uni.showLoading({
      title: "创建中",
      mask: true,
    });

    await request.post("/item/create", payload);

    uni.showToast({ icon: "success", title: "创建成功" });

    getMenuItems();
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

// 更新菜品
async function handleUpdateItem(item) {
  try {
    const itemName = await prompt("请输入菜品名称", item.itemName);

    if (!itemName) {
      uni.showToast({ icon: "error", title: "菜品名称为空" });
      return;
    }

    uni.showLoading({
      title: "更新中",
      mask: true,
    });

    const payload = {
      id: item.id,
      itemName,
      group: userState.activeGroup,
    };

    await request.post("/item/update", payload);

    await getMenuItems();

    uni.showToast({ icon: "success", title: "更新成功" });
  } catch (error) {
    console.log(error);
  } finally {
    uni.hideLoading();
  }
}

function prompt(title, placeholderText = "") {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title,
      editable: true,
      placeholderText,
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
</script>

<style lang="scss" scoped>
.menu-container {
  .add-btn {
    position: absolute;
    right: 32rpx;
    bottom: 68rpx;
    z-index: 999;
  }

  .empty {
    position: absolute;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);
  }

  .list-cell {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    padding: 10px 24rpx;
    overflow: hidden;
    color: #323233;
    font-size: 16px;
    line-height: 24px;
    background-color: #fff;

    &:active {
      background: #e3e3e3;
    }
  }
}
</style>
