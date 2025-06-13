<template>
    <div class="photo-booth-container">
        <div class="photo-booth">
            <div class="controls">
                <div class="dropdown">
                    <button class="btn">{{ photoCount }} Photos</button>
                </div>
                <div class="dropdown">
                    <button class="btn">{{ delayTime }}s Delay</button>
                </div>
                <button class="upload-btn">
                    <span class="icon">📷</span>
                    Upload Photo
                </button>
            </div>

            <div class="main-content">
                <div class="preview-container">
                    <video v-if="isCameraOn"
                    ref="videoRef"
                    autoplay
                    playsinline
                    class="camera-preview"
                    ></video>
                    <img v-else
                    style="width: 680px; height:480px" 
                        :src="CameraOffImage" 
                        alt="CameraOff"
                        class="camera-off-image" 
                    />
                </div>
                <div style="
                    display: flex;
                    width: 70px;
                    height: 70px;
                    border: 1px solid;
                    border-radius: 30px;
                    text-align: center;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    "
                    @click="onOffCamera()" 
                    class="item-in-camera turn-off-on-camera">
                    <span v-if="isCameraOn">OFF</span>
                    <span v-else>ON</span>
                </div>
            </div>

            <div class="filter-section">
                <h3>Choose a filter</h3>
                <div class="filter-list">
                    <button 
                    v-for="filter in filters" 
                    :key="filter"
                    :class="['filter-btn', { active: selectedFilter === filter }]"
                    @click="selectedFilter = filter"
                    >
                    {{ filter }}
                    </button>
                </div>
            </div>

            <button class="capture-btn">
            <span class="icon">📸</span>
            Start Capture
            </button>
        </div>
    
        <div class="qr-section">
            <div class="qr-text">
                Get the app for endless frames,<br>
                stickers, filters,<br>
                and retouching tools!
            </div>
            <div class="qr-code">
                <img :src="CameraOffImage" alt="QR Code" />
            </div>
            <div class="qr-caption">Scan to Download</div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import CameraOffImage from '../assets/image/CameraOff.png'

const videoRef = ref(null)
const stream = ref(null)
const photoCount = ref(4)
const delayTime = ref(3)
const selectedFilter = ref('Normal')
const isCameraOn = ref(true)

const filters = [
  'Normal',
  'BW',
  'Vintage',
  'Old Photo',
  'Amber',
  'Nocturne'
]

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' },
      audio: false 
    })
    
    // Đợi một chút để đảm bảo DOM đã được cập nhật
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (videoRef.value && stream.value) {
      console.log('Video element:', videoRef.value)
      videoRef.value.srcObject = stream.value
    } else {
      console.error('Video element or stream not found')
      if (!videoRef.value) console.log('videoRef is null')
      if (!stream.value) console.log('stream is null')
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
    isCameraOn.value = false
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => {
      track.stop()
    })
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    stream.value = null
  }
}

const onOffCamera = async () => {
  isCameraOn.value = !isCameraOn.value
  if (isCameraOn.value) {
    await startCamera()
  } else {
    await stopCamera()
  }
}

onMounted(() => {
  if (isCameraOn.value) {
    startCamera()
  }
})

onUnmounted(() => {
  stopCamera()
})
</script>
<style scoped>
.photo-booth-container {
    width: 85vw;
    display: flex;
    align-items: center;
}

.photo-booth {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
}

.upload-btn {
  margin-left: auto;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #ff69b4;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: flex-start;
  position: relative;
}

.preview-container {
  flex: 1;
  aspect-ratio: 4/3;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-off-image {
  width: 50%;
  height: auto;
  object-fit: contain;
}

.qr-section {
  width: fit-content;
  height: fit-content;
  flex-shrink: 0;
  background: rgba(255, 192, 203, 0.1);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.qr-text {
  color: #ff69b4;
  margin-bottom: 15px;
  font-size: 14px;
}

.qr-code {
  width: 120px;
  height: 120px;
  background: #000;
  margin: 0 auto 10px;
}

.qr-caption {
  color: #666;
  font-size: 12px;
}

.filter-section {
  margin: 20px 0;
}

.filter-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  white-space: nowrap;
  outline: none;
}

.filter-btn.active, .filter-btn:hover, .btn:hover{
  background: #ff69b4;
  color: white;
  border-color: #ff69b4;
}

.btn {
    outline: none;
}

.capture-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 25px;
  background: #ff69b4;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icon {
  font-size: 20px;
}

.item-in-camera:hover{
    background-color: #ff69b4;
    color: white;
    cursor: pointer;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .qr-section {
    width: 100%;
  }
}

.qr-code img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
