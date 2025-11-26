<template>
  <div v-if="visible" class="success-message" :class="{ fade: !visible }">
    <div class="success-message__icon">✓</div>
    <div class="success-message__content">{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: 'SuccessMessage',
  props: {
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      visible: true
    }
  },
  mounted() {
    // 设置定时器自动关闭
    setTimeout(() => {
      this.visible = false;
      setTimeout(() => {
        this.$emit('close');
      }, 300); // 等待动画完成
    }, this.duration);
  }
}
</script>

<style scoped>
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  z-index: 9999;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s, transform 0.3s;
}

.success-message.fade {
  opacity: 0;
  transform: translateX(100%);
}

.success-message__icon {
  font-size: 18px;
  color: #67c23a;
  margin-right: 8px;
  font-weight: bold;
}

.success-message__content {
  color: #606266;
  font-size: 14px;
}
</style>