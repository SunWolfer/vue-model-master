<script lang="ts">
	import { defineComponent } from 'vue'
  import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
	import mixin from './model-mixin.vue'

	export default defineComponent({
		name: 'model-gltf',
		mixins: [mixin],
		props: {
			lights: {
				type: Array,
				default: () => {
					return [
						{
							type: 'AmbientLight',
							color: 0xaaaaaa,
						},
						{
							type: 'DirectionalLight',
							position: { x: 1, y: 1, z: 1 },
							color: 0xffffff,
							intensity: 0.8,
						},
					]
				},
			},
			gammaOutput: {
				type: Boolean,
				default: true,
			},
		},
		data() {
			const loader = new GLTFLoader()
			loader.setCrossOrigin(this.crossOrigin)
			loader.setRequestHeader(this.requestHeader)

			return {
				loader,
				loadLen: 0,
			}
		},
		watch: {
			loadLen(val) {
				if (val === this.modelList.length) {
					this.reportProgress('end')
					this.$emit('load')
				} else {
					let event = {
						lengthComputable: false,
						loaded: val,
						total: this.modelList.length,
					}
					this.reportProgress('progress', event)
					this.$emit('progress', event)
				}
			},
		},
		methods: {
			load() {
				if (!this.src) return

				if (this.object) {
					this.wrapper.remove(this.object)
				}

				this.reportProgress('start')
				this.loader.load(
					this.src,
					(data:GLTF) => {
						this.reportProgress('end')
						data.scene.traverse(function (object: any) {
							if (object.isMesh) {
								object.castShadow = true //阴影
								object.frustumCulled = false
								object.material.emissive = object.material.color
								object.material.emissiveMap = object.material.map
							}
						})
						this.addObject(data.scene)
						this.loadOtherLen++
					},
					(event:ProgressEvent) => {
						this.reportProgress('progress', event)
						this.$emit('progress', event)
					},
					(event:ErrorEvent) => {
						this.reportProgress('end')
						this.$emit('error', event)
					},
				)
			},
			lineLoad() {
				if (this.modelList.length === 0) return
				this.reportProgress('start')
				for (let i = 0; i < this.modelList.length; i++) {
					const oneObj: any = this.modelList[i]
					this.loader.load(oneObj.src, (data:GLTF) => {
						this.loadLen++
						this.addObject(data.scene)
					})
				}
			},
		},
	})
</script>
