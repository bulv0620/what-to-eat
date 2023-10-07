const baseUrl = "https://www.imbulv.cloud/what_to_eat/api";

function request(url, method, data) {
  return new Promise((resolve, reject) => {
    let token = uni.getStorageSync("APP_ACCESS_TOEKN");
    if (token) {
      token = "Bearer " + token;
    }
    uni.request({
      url: baseUrl + url,
      method,
      data,
      header: {
        Authorization: token,
      },
      success: (res) => {
        if (res.statusCode < 300 && res.statusCode >= 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          uni.showToast({ icon: "error", title: "请登录" });
          uni.redirectTo({
            url: "/pages/login/index",
          });
        } else {
          uni.showToast({
            icon: "error",
            title:
              res.data.message || res.data.error || res.errMsg || "请求失败",
          });
          reject(
            res.data.message || res.data.error || res.errMsg || "请求失败"
          );
        }
      },
      fail: (err) => {
        uni.showToast({
          icon: "error",
          title: "请求失败",
        });
        reject(err);
      },
    });
  });
}

request.post = (url, data) => request(url, "POST", data);
request.get = (url, data) => request(url, "GET", data);

export default request;
