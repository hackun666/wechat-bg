<template>
  <view class="index">
    <view class="photo_detail">
      <view class="title">{{ info.title }}</view>
      <view class="content">
        <rich-text :nodes="content"></rich-text>
      </view>
      <view class="source">
        <image
          mode="widthFix"
          @tap="preview(info.link)"
          :src="info.link"
          v-if="info.type == 1"
        />
        <video
          :src="info.link"
          v-if="info.type == 2"
          controls="true"
          :poster="info.thumb"
        />
      </view>
      <!-- <view class="ad_item">
        <ad unit-id="adunit-676cce9ac4d3b8bf"></ad>
      </view> -->
      <view class="download" v-if="info.type == 1" @tap="preview(info.link)"
        >点击图片长按保存</view
      >
      <view class="download" v-if="info.type == 2" @tap="download"
        >点击保存到相册</view
      >

      <view class="ad_item">
        <ad
          unit-id="adunit-3fb6b99d59fc7ec2"
          ad-type="video"
          ad-theme="white"
        ></ad>
      </view>
    </view>
  </view>
</template>

<script>
import Taro from "@tarojs/taro";
import { serverUrl } from "../../utils/config";
import "./show.less";
let videoAd = null;
export default {
  data() {
    return {
      id: 0,
      info: [],
      content: "",
    };
  },

  onShareAppMessage() {
    return {
      title: this.info.title,
      imageUrl: this.info.thumb,
    };
  },
  onShareTimeline() {
    return {
      title: this.info.title,
      imageUrl: this.info.thumb,
      query: "id=" + this.id,
    };
  },
  onLoad(options) {
    let id = options.id;
    this.id = id;
    this.getDetail(id);

    // 在页面中定义插屏广告
    let interstitialAd = null;

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: "adunit-99a1a16556dcdfcc",
      });
      interstitialAd.onLoad(() => {});
      interstitialAd.onError((err) => {});
      interstitialAd.onClose(() => {});
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err);
      });
    }

    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: "adunit-fba5c4dd65498d8c",
      });
      videoAd.onLoad(() => {});
      videoAd.onError((err) => {});
      videoAd.onClose((res) => {
        if (res && res.isEnded) {
          this.downloadFile();
        } else {
          // 播放中途退出，不下发游戏奖励
        }
      });
    }
  },
  methods: {
    preview(src) {
      Taro.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src], // 需要预览的图片http链接列表
      });
    },
    download() {
      Taro.showModal({
        title: "提示",
        content: "花几秒钟看完广告就能下载了哦",
        success: function (res) {
          if (res.confirm) {
            console.log("用户点击确定");

            // 用户触发广告后，显示激励视频广告
            if (videoAd) {
              videoAd.show().catch(() => {
                // 失败重试
                videoAd
                  .load()
                  .then(() => videoAd.show())
                  .catch((err) => {
                    console.log("激励视频 广告显示失败");
                  });
              });
            }
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        },
      });
    },
    downloadFile() {
      wx.downloadFile({
        url: this.info.link, //图片地址
        success: function (res) {
          //图片保存到本地
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (data) {
              wx.hideLoading();
              wx.showModal({
                title: "提示",
                content: "视频文件已保存到相册",
                showCancel: false,
              });
            },
            fail: function (err) {
              if (
                err.errMsg === "saveVideoToPhotosAlbum:fail:auth denied" ||
                err.errMsg === "saveVideoToPhotosAlbum:fail auth deny" ||
                err.errMsg ===
                  "saveVideoToPhotosAlbum:fail authorize no response"
              ) {
                // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
                wx.showModal({
                  title: "提示",
                  content: "需要您授权保存相册",
                  showCancel: false,
                  success: (modalSuccess) => {
                    wx.openSetting({
                      success(settingdata) {
                        console.log("settingdata", settingdata);
                        if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                          wx.showModal({
                            title: "提示",
                            content: "获取权限成功,再次点击即可保存",
                            showCancel: false,
                          });
                        } else {
                          wx.showModal({
                            title: "提示",
                            content: "获取权限失败，将无法保存到相册哦~",
                            showCancel: false,
                          });
                        }
                      },
                      fail(failData) {
                        console.log("failData", failData);
                      },
                      complete(finishData) {
                        console.log("finishData", finishData);
                      },
                    });
                  },
                });
              }
            },
            complete(res) {
              wx.hideLoading();
            },
          });
        },
      });
    },
    getDetail(id) {
      Taro.request({
        url: serverUrl + "?c=detail&id=" + id,
      }).then((res) => {
        if (res.data.success) {
          Taro.setNavigationBarTitle({
            title: res.data.info.title,
          });
          this.info = res.data.info;
          this.content = res.data.info.content.replace(
            /\<img/gi,
            '<img style="max-width:100%;height:auto" '
          );
        }
      });
    },
  },
};
</script>
