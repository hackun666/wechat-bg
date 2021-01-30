import Taro from '@tarojs/taro'

export default function request(url, method, data) {
    Taro.showLoading({
        title: '加载中...'
    })
    return Taro.request({
        url,
        method,
        data,
        header: {
            'content-type': 'application/json',
        }
    }).then(res => {
        Taro.hideLoading()
        return res.data
    }).catch (err => {
        Taro.hideLoading()
        return err
    })
}