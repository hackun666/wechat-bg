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
          loop="false"
          muted="false"
        />
      </view>
      <view class="ad_item">
        <ad unit-id="adunit-676cce9ac4d3b8bf"></ad>
      </view>
      <view class="download" v-if="info.type == 1" @tap="preview(info.link)">点击图片长按保存</view>
      <view class="download" v-if="info.type == 2" @tap="download">复制文件下载链接</view>

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
  },
  methods: {
    preview(src) {
      Taro.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src], // 需要预览的图片http链接列表
      });
    },
    download() {
      // Taro.downloadFile({
      //   url: this.info.link, //仅为示例，并非真实的资源
      //   success: function (res) {
      //     // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
      //     if (res.statusCode === 200) {

      //     }
      //   }
      // })

      // Taro.saveFile({
      //   tempFilePath: this.info.link,
      //   success: function (res) {
      //     var savedFilePath = res.savedFilePath
      //     console.log(savedFilePath)
      //   }
      // })

      Taro.setClipboardData({
        data: this.info.link,
        success: function (res) {
          Taro.getClipboardData({
            success: function (res) {
              Taro.showModal({
                title: "复制成功",
                content: "请到浏览器中粘贴访问下载",
                success: function (res) {
                  if (res.confirm) {
                    console.log("用户点击确定");
                  } else if (res.cancel) {
                    console.log("用户点击取消");
                  }
                },
              });
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
              title: res.data.info.title
          })
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
