<!-- Upload -->
<template>
  <div :class="['zp-upload', {'zp-upload-in-scope': inScope}]" @click="$refs.uploader.click()" @drop.prevent="handleDrop" @dragover.prevent="draggable && (inScope = true)" @dragleave.prevent="inScope = false">
    <input type="file" class="zp-uploader" @change="handleChange" :multiple="multiple" :accept="accept" ref="uploader" />
    <slot></slot>
  </div>
</template>

<script>
  import xhr from './xhr'

  export default {
    name: 'zp-upload',
    props: {
      name: {
        type: String,
        default: 'file'
      },
      url: {
        type: String,
        required: true
      },
      headers: Object,
      multiple: {
        type: Boolean,
        default: true
      },
      data: Object,
      accept: String,
      withCredentials: {
        type: Boolean,
        default: false
      },
      maxSize: [Number, String],
      beforeUpload: Function,
      progress: {
        type: Function,
        default: () => {}
      },
      success: {
        type: Function,
        default: () => {}
      },
      error: {
        type: Function,
        default: () => {}
      },
      destroy: {
        type: Function,
        default: () => {}
      },
      exceed: {
        type: Function,
        default: () => {}
      },
      limit: [Number, String],
      sync: {
        type: Boolean,
        default: false
      },
      draggable: {
        type: Boolean,
        default: false
      },
      interval: {
        type: Number,
        default: 100
      }
    },
    data() {
      return {
        inScope: false,
        queue: {},
        tmpIndex: 1,
        curList: []
      }
    },
    methods: {
      handleChange (evt) {
        const files = evt.target.files
        files && this.uploadFiles(files)
        this.$refs.uploader.value = null
      },
      removeList (file) {
        if (file) {
          this.curList.splice(this.curList.indexOf(file), 1)
        } else {
          this.curList.length = 0
        }
      },
      uploadFiles (files) {
        files = [...files]
        if (!isNaN(this.limit) && files.length > Number(this.limit)) {
          files.length = this.limit
        }
        !this.multiple && (files.length = 1)
        files.forEach(file => this.uploadFile(file))
      },
      abort (file) {
        if (file) {
          const { uid } = file
          this.removeList(file)
          this.queue[uid] && this.queue[uid].abort()
        } else {
          this.removeList()
          Object.keys(this.queue).forEach((uid) => {
            this.queue[uid] && this.queue[uid].abort()
            delete this.queue[uid]
          })
        }
      },
      uploadFile (file) {
        file.percentage = 0
        this.curList.push(file)
        if (this.beforeUpload) {
          const before = this.beforeUpload(file)
          if (before && typeof before.then === 'function') { // is promise
            before.then(promiseFile => {
              if (promiseFile instanceof Blob || promiseFile instanceof File) {
                this.send(promiseFile)
              } else {
                this.send(file)
              }
            }, () => {
              this.removeList(file)
              this.destroy(file)
            })
          } else if (before !== false) {
            this.send(file)
          } else {
            this.removeList(file)
            this.destroy(file)
          }
        } else {
          this.send(file)
        }
      },
      handleDrop (evt) {
        if (this.inScope) {
          this.inScope = false
          this.uploadFiles(evt.dataTransfer.files)
        }
      },
      send (file) {
        if (!isNaN(this.maxSize) && file.size > Number(this.maxSize) * 1024) {
          this.removeList(file)
          return this.exceed(file)
        }
        const uid = file.uid = `${Date.now()}${this.tmpIndex++}`
        const opts = {
          headers: this.headers,
          withCredentials: this.withCredentials,
          file,
          data: this.data,
          filename: this.name,
          url: this.url,
          progress: this.progress,
          progressInterval: this.interval,
          success: (res, file) => {
            this.success(res, file)
            this.removeList(file)
            delete this.queue[uid]
          },
          error: (err, file) => {
            this.error(err, file)
            this.removeList(file)
            delete this.queue[uid]
          },
          abort: file => {
            this.abort(file)
          }
        }
        const request = xhr(opts)
        this.queue[uid] = request
        if (request && typeof request.then === 'function') { // is promise
          request.then(opts.success, opts.error)
        }
      }
    }
  }
</script>

<style>
  .zp-uploader {
    display: none;
  }
</style>