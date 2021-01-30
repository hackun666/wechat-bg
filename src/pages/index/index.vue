<template>
  <view class="index">
      <view class="photo_list">
        <view class="photo_item" v-for="(item,index) in photos" :key="item.id" @tap="goDetail(item.id)"> 
          <view class="title">{{item.title}}</view>
          <view class="mask"></view>
          <image class="thumb" mode="aspectFill" :src="item.thumb" />
          
          <view class="ad_item" v-if="index == 0 || index == 6"> 
            <ad unit-id="adunit-676cce9ac4d3b8bf"></ad>
          </view>
          <view class="ad_item" v-if="index == 3 || index == 9">
            <ad unit-id="adunit-3fb6b99d59fc7ec2" ad-type="video" ad-theme="white"></ad>
          </view>
        </view>
      </view>
  </view>
</template>

<script>
import Taro from "@tarojs/taro";
import { serverUrl } from "../../utils/config";
import './index.less'

export default {
  data() {
    return {
      page: 1,
      photos: [],
      loading: false,
    }
  },
  
  onReachBottom() {
    this.getPhotos();
  },
  onShareAppMessage() {},
  onShareTimeline() {
    return {
      title: "微信8.0在线状态个性图片",
      imageUrl: "",
      query: "",
    };
  },
  mounted(){
    this.getPhotos()
  },
  methods: {
    goDetail(id){
      Taro.navigateTo({
        url: "/pages/show/show?id=" + id,
      });
    },
    getPhotos() {
      if (!this.loading) {
        this.loading = true;
        Taro.request({
          url: serverUrl + '?c=photos&page=' + this.page,
        }).then((res) => {
          if (res.data.success) {
            if (this.page == 1) {
              this.photos = res.data.photos;
            } else {
              this.photos = [...this.photos, ...res.data.photos];
            }
            this.page++;
          }
          this.loading = false;
        });
      }
    },
  }
}
</script>
