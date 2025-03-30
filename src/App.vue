<script setup>

// 页面不存在时触发
onPageNotFound(() => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
})

</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style>
/*每个页面公共样式 */
/* #ifndef APP-PLUS-NVUE */
@import url('./app.css');
/* #endif */
</style>
