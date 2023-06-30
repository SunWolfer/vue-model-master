<script lang="ts">
	import {
		AmbientLight,
		Color,
		DirectionalLight,
		HemisphereLight,
		Light,
		Loader,
		Object3D,
		PerspectiveCamera,
		PointLight,
		Raycaster,
		Scene,
		Vector2,
		Vector3,
		WebGLRenderer,
		WebGLRendererParameters,
		SRGBColorSpace,
		Mesh,
	} from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
	import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
	import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
	import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
	import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

	import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

	import { getSize, modelLine } from './utils'
	import { defineComponent, PropType } from 'vue'

	import gsap from 'gsap'
	import { CSSRulePlugin } from 'gsap/CSSRulePlugin'

	gsap.registerPlugin(CSSRulePlugin)

	import { OperateModel } from './IModelOperate'
	import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
	import useEditModel from '@/components/VueThree/hooks/useEditModel'

	const DEFAULT_GL_OPTIONS = {
		antialias: true,
		alpha: true,
	}
	export interface IOtherThreeMod {
		type: string // 类型
		src: string // 文件路径
		initAnimation?: boolean // 初始化动画
	}

	export default defineComponent({
		props: {
			src: {
				type: String,
			},
			width: {
				type: Number,
				default: 0,
			},
			height: {
				type: Number,
				default: 0,
			},
			position: {
				type: Object,
				default: () => {
					return { x: 0, y: 0, z: 0 }
				},
			},
			rotation: {
				type: Object,
				default: () => {
					return { x: 0, y: 0, z: 0 }
				},
			},
			scale: {
				type: Object,
				default: () => {
					return { x: 1, y: 1, z: 1 }
				},
			},
			lights: {
				type: Array as PropType<
					{
						type: string
						[key: string]: any
					}[]
				>,
				default: () => {
					return []
				},
			},
			cameraPosition: {
				type: Object,
				default: () => {
					return { x: 0, y: 0, z: 0 }
				},
			},
			cameraRotation: {
				type: Object,
				default: () => {
					return { x: 0, y: 0, z: 0 }
				},
			},
			cameraUp: {
				type: Object,
			},
			cameraLookAt: {
				type: Object,
			},
			cameraSize: {
				type: Number,
				default: 1,
			},
			backgroundColor: {
				default: 0xffffff,
			},
			backgroundAlpha: {
				type: Number,
				default: 1,
			},
			controlsOptions: {
				type: Object,
			},
			crossOrigin: {
				type: String,
				default: 'anonymous',
			},
			requestHeader: {
				type: Object,
				default: () => {},
			},
			glOptions: {
				type: Object,
			},
			chooseGroup: {
				type: Boolean,
				default: false,
			},
			modelList: {
				type: Array,
				default: [] as Array<modelLine>,
			},
			otherThreeMod: {
				type: Array,
				default: [] as IOtherThreeMod[],
			},
		},
		data() {
			const result = {
				object: null as null | Object3D,
				rayCaster: new Raycaster(),
				mouse: new Vector2(),
				camera: new PerspectiveCamera(50, 1, this.cameraSize, 500000000),
				scene: new Scene(),
				wrapper: new Object3D(),
				renderer: null as null | WebGLRenderer,
				controls: null as null | OrbitControls,
				allLights: [] as Light[],
				clock: typeof performance === 'undefined' ? Date : performance,
				reqId: null as null | number, // requestAnimationFrame id,
				loader: null as any as Loader, // 会被具体实现的组件覆盖
				composer: null as null | EffectComposer,
				outlinePass: null as null | OutlinePass,
				effectFXAA: null as null | ShaderPass,
				labelRenderer: new CSS2DRenderer(),
				CartoonInterval: [] as Array<number>,
				mixer: '',
				domCenter: { x: 0, y: 0, z: 0 },
				operateModel: null as null | OperateModel,
				defaultAnimateList: [] as any[],
				transformControl: null as null | TransformControls,
			}
			// 确保这些对象不被转为 vue reactive 对象，避免 three 渲染出错
			Object.assign(this, result)

			const reactiveState = {
				defaultAnimation: null,
				size: {
					width: this.width,
					height: this.height,
				},
				// 主体模型加载进度
				progress: {
					isComplete: false,
					lengthComputable: false,
					loaded: 0,
				} as {
					startedAt?: number
					endedAt?: number
					isComplete: boolean
					lengthComputable: boolean
					loaded: number
					total: number
				},
				// 	总模型加载进度
				loadOtherLen: 0,
				selectedObjects: [] as any[], // 选中模型
			}

			// 为了保留类型信息，仍然返回 result 的 type
			return reactiveState as typeof result & typeof reactiveState
		},
		computed: {
			loadProgressPercentage() {
				if (this.progress.isComplete) return 100
				if (this.progress.lengthComputable) {
					// lengthComputable 为 false 时，total 无直接参考意义，但是这里仍然使用它 * 3来作为估计值
					// 因为 gzip 压缩后的长度大约为三分之一
					return Math.min(0.92, this.progress.loaded / (this.progress.total * 3)) * 100
				}
				return Math.min(1, this.progress.loaded / this.progress.total) * 100
			},
		},
		mounted() {
			if (this.width === 0 || this.height === 0) {
				this.size = {
					width: (this.$refs.canvas as HTMLDivElement).offsetWidth,
					height: (this.$refs.canvas as HTMLDivElement).offsetHeight,
				}
			}
			const options: WebGLRendererParameters = Object.assign(
				{},
				DEFAULT_GL_OPTIONS,
				this.glOptions,
				{
					canvas: this.$refs.canvas as HTMLCanvasElement,
				},
			)
			this.renderer = new WebGLRenderer(options)
			this.renderer.shadowMap.enabled = true
			this.renderer.outputColorSpace = SRGBColorSpace
			this.labelRenderer.domElement.style.position = 'absolute'
			this.labelRenderer.domElement.style.zIndex = '0'
			this.labelRenderer.domElement.style.top = '0'
			this.labelRenderer.setSize(this.size.width, this.size.height)
			this.labelRenderer.domElement.style.pointerEvents = 'none'

			this.controls = new OrbitControls(this.camera, this.$refs.canvas as HTMLDivElement)

			this.scene.add(this.wrapper)

			this.initEdit()

			this.load()
			this.lineLoad()
			this.loadOtherMods()
			this.update()

			const element = this.$refs.container as HTMLElement

			element.appendChild(this.labelRenderer.domElement)

			window.addEventListener('resize', this.onResize, false)

			this.animate()
		},
		beforeUnmount() {
			for (let i = 0; i < this.CartoonInterval.length; i++) {
				clearInterval(this.CartoonInterval[i])
			}
			cancelAnimationFrame(this.reqId!)
			this.operateModel?.unmountEditModel()

			this.renderer!.dispose()

			if (this.controls) {
				this.controls.dispose()
			}

			const element = this.$refs.container as HTMLDivElement
			element.removeEventListener('click', this.onClick, false)
			element.removeEventListener('dblclick', this.onDblclick, false)
			element.removeEventListener('mouseup', this.onMouseUp, false)
			element.removeEventListener('mousedown', this.onMouseDown, false)
			element.removeEventListener('mousemove', this.onMouseMove, false)
			window.removeEventListener('resize', this.onResize, false)
		},
		watch: {
			src() {
				this.load()
			},
			rotation: {
				deep: true,
				handler(val) {
					if (!this.object) return
					this.object.rotation.set(val.x, val.y, val.z)
				},
			},
			position: {
				deep: true,
				handler(val) {
					if (!this.object) return
					this.object.position.set(val.x, val.y, val.z)
				},
			},
			scale: {
				deep: true,
				handler(val) {
					if (!this.object) return
					this.object.scale.set(val.x, val.y, val.z)
				},
			},
			lights: {
				deep: true,
				handler() {
					this.updateLights()
				},
			},
			size: {
				deep: true,
				handler() {
					this.updateCamera()
					this.updateRenderer()
				},
			},
			controlsOptions: {
				deep: true,
				handler() {
					this.updateControls()
				},
			},
			backgroundAlpha() {
				this.updateRenderer()
			},
			backgroundColor() {
				this.updateRenderer()
			},
			otherThreeMod: {
				deep: true,
				handler() {
					this.loadOtherMods()
				},
			},
			loadOtherLen(val) {
				if (val === this.otherThreeMod?.length + 1) {
					this.$emit('load')
				} else {
					let event = {
						lengthComputable: false,
						loaded: val,
						total: this.otherThreeMod.length,
					}
					this.reportProgress('progress', event)
					this.$emit('progress', event)
				}
			},
			selectedObjects(val) {
				if (this.outlinePass) this.outlinePass.selectedObjects = val
			},
		},
		methods: {
			initEdit() {},
			onResize() {
				if (this.width === 0 || this.height === 0) {
					this.$nextTick(() => {
						this.size = {
							width: (this.$refs.canvas as HTMLDivElement).offsetWidth,
							height: (this.$refs.canvas as HTMLDivElement).offsetHeight,
						}
					})
				}
			},
			onMouseDown(event: MouseEvent) {
				if (!this.$attrs.onMousedown) return

				const intersected = this.pick(event.clientX, event.clientY)
				this.$emit('mousedown', event, intersected)
			},
			onMouseMove(event: MouseEvent) {
				// console.log(this.$attrs)
				if (!this.$attrs.onMousemove) return

				const intersected = this.pick(event.clientX, event.clientY)
				this.$emit('mousemove', event, intersected)
			},
			onMouseUp(event: MouseEvent) {
				if (!this.$attrs.onMouseup) return

				const intersected = this.pick(event.clientX, event.clientY)
				this.$emit('mouseup', event, intersected)
			},
			onClick(event: MouseEvent) {
				if (!this.$attrs.onClick) return

				this.selectedObjects = []

				const intersected: any = this.pick(event.clientX, event.clientY)
				if (intersected !== null) this.selectedObjects.push(intersected.object)

				this.$emit('click', event, intersected)
			},
			onDblclick(event: MouseEvent) {
				if (!this.$attrs.onDblclick) return

				const intersected = this.pick(event.clientX, event.clientY)
				this.$emit('dblclick', event, intersected)
			},
			pick(x: number, y: number) {
				if (!this.object) return null
				if (!this.$refs.canvas) return

				const rect = (this.$refs.canvas as HTMLDivElement).getBoundingClientRect()

				x -= rect.left
				y -= rect.top

				this.mouse.x = (x / this.size.width!) * 2 - 1
				this.mouse.y = -(y / this.size.height!) * 2 + 1

				this.rayCaster.setFromCamera(this.mouse, this.camera)

				const intersects: any = this.rayCaster.intersectObject(this.wrapper, true)
				let rData: any = (intersects && intersects.length) > 0 ? intersects[0] : null
				this.chooseGroup
					? rData
						? (rData.object = intersects[0].object.parent.isGroup
								? intersects[0].object.parent
								: intersects[0].object)
						: null
					: rData
				return rData
			},
			update() {
				this.updateRenderer()
				this.updateCamera()
				this.updateLights()
				this.updateControls()
				this.updateClickDomColor()
			},
			updateModel() {
				const { object } = this

				if (!object) return

				const { position } = this
				const { rotation } = this
				const { scale } = this

				object.position.set(position.x, position.y, position.z)
				object.rotation.set(rotation.x, rotation.y, rotation.z)
				object.scale.set(scale.x, scale.y, scale.z)
			},
			updateRenderer() {
				const { renderer } = this

				renderer!.setSize(this.size.width!, this.size.height!)
				renderer!.setPixelRatio(window.devicePixelRatio || 1)
				renderer!.setClearColor(new Color(this.backgroundColor).getHex())
				renderer!.setClearAlpha(this.backgroundAlpha)
			},
			updateCamera() {
				const { camera } = this
				const { object } = this

				camera.aspect = this.size.width! / this.size.height!
				camera.updateProjectionMatrix()

				if (!this.cameraLookAt || !this.cameraUp) {
					if (!object) return

					const distance = getSize(object).length()

					camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z)
					camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z)

					if (
						this.cameraPosition.x === 0 &&
						this.cameraPosition.y === 0 &&
						this.cameraPosition.z === 0
					) {
						camera.position.z = distance
					}

					camera.lookAt(new Vector3())
				} else {
					camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z)
					camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z)
					camera.up.set(this.cameraUp.x, this.cameraUp.y, this.cameraUp.z)

					camera.lookAt(new Vector3(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z))
				}
			},
			updateLights() {
				this.scene.remove(...this.allLights)

				this.allLights = []

				this.lights.forEach((item) => {
					if (!item.type) return

					const type = item.type.toLowerCase()

					let light: null | Light = null

					if (type === 'ambient' || type === 'ambientlight') {
						const color = item.color === 0x000000 ? item.color : item.color || 0x404040
						const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1

						light = new AmbientLight(color, intensity)
					} else if (type === 'point' || type === 'pointlight') {
						const color = item.color === 0x000000 ? item.color : item.color || 0xffffff
						const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1
						const distance = item.distance || 0
						const decay = item.decay === 0 ? item.decay : item.decay || 1

						light = new PointLight(color, intensity, distance, decay)

						if (item.position) {
							light.position.copy(item.position)
						}
					} else if (type === 'directional' || type === 'directionallight') {
						const color = item.color === 0x000000 ? item.color : item.color || 0xffffff
						const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1

						light = new DirectionalLight(color, intensity)

						if (item.position) {
							light.position.copy(item.position)
						}
						if (item.target) {
							;(light as DirectionalLight).target.copy(item.target)
						}
						// 光源辅助线
						// const helper = new DirectionalLightHelper(light)
						// this.scene.add(helper)
					} else if (type === 'hemisphere' || type === 'hemispherelight') {
						const skyColor = item.skyColor === 0x000000 ? item.skyColor : item.skyColor || 0xffffff
						const groundColor =
							item.groundColor === 0x000000 ? item.groundColor : item.groundColor || 0xffffff
						const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1

						light = new HemisphereLight(skyColor, groundColor, intensity)

						if (item.position) {
							light.position.copy(item.position)
						}
					}

					if (light) {
						this.allLights.push(light)
						this.scene.add(light)
					}
				})
			},
			updateControls() {
				if (this.controlsOptions) {
					Object.assign(this.controls!, this.controlsOptions)
				}
			},
			updateClickDomColor() {
				const { renderer, scene, camera }: any = this
				this.composer = new EffectComposer(renderer)
				let renderPass = new RenderPass(scene, camera)
				this.composer.addPass(renderPass)
				this.outlinePass = new OutlinePass(
					new Vector2(window.innerWidth, window.innerHeight),
					scene,
					camera,
				)

				this.composer.addPass(this.outlinePass)

				let outlineParams = {
					renderToScreen: true,
					edgeStrength: 4, // 度 默认3
					edgeGlow: 1, // 度 默认1
					edgeThickness: 1.0, // 边缘浓度
					pulsePeriod: 0, // 闪烁频率 默认0 值越大频率越低
					usePatternTexture: false, // 使用纹理
					visibleEdgeColor: 0x00ffff, // 边缘可见部分发光颜色
					hiddenEdgeColor: 0x00ffff, // 边缘遮挡部分发光颜色
				}
				this.outlinePass.renderToScreen = outlineParams.renderToScreen
				this.outlinePass.edgeStrength = outlineParams.edgeStrength
				this.outlinePass.edgeGlow = outlineParams.edgeGlow
				this.outlinePass.edgeThickness = outlineParams.edgeThickness
				this.outlinePass.visibleEdgeColor.set(outlineParams.visibleEdgeColor)
				this.outlinePass.hiddenEdgeColor.set(outlineParams.hiddenEdgeColor)
				this.outlinePass.usePatternTexture = outlineParams.usePatternTexture

				this.effectFXAA = new ShaderPass(FXAAShader)
				this.effectFXAA.uniforms['resolution'].value.set(
					1 / window.innerWidth,
					1 / window.innerHeight,
				)
				this.composer.addPass(this.effectFXAA)
			},
			reportProgress(
				type: 'start' | 'end' | 'progress',
				data?: {
					lengthComputable: boolean
					loaded: number
					total: number
				},
			) {
				if (type === 'start') {
					this.progress.isComplete = false
					this.progress.startedAt = Date.now()
					this.progress.loaded = 0
					this.progress.total = 0
				} else if (type === 'end') {
					this.progress.isComplete = true
					this.progress.endedAt = Date.now()
				} else {
					this.progress.lengthComputable = data?.lengthComputable ?? false
					this.progress.loaded = data?.loaded ?? 0
					this.progress.total = data?.total ?? 0
				}
			},
			load() {
				if (!this.src) return

				if (this.object) {
					this.wrapper.remove(this.object)
				}

				this.loader.setRequestHeader(this.requestHeader)

				this.reportProgress('start')
				;(this.loader as any).load(
					this.src,
					(...args: any) => {
						this.reportProgress('end')

						const object = (this.getObject as any)(...args)

						this.process(object)

						this.addObject(object)
						this.loadOtherLen++
					},
					(event: ProgressEvent) => {
						this.reportProgress('progress', event)
						this.$emit('progress', event)
					},
					(event: ErrorEvent) => {
						this.reportProgress('end')
						this.$emit('error', event)
					},
				)
			},
			lineLoad() {
				if (this.modelList.length === 0) return
			},
			process(object: Object3D) {
				return object
			},
			getObject(object: Object3D) {
				return object
			},
			addObject(object: Object3D) {
				this.object = object
				this.wrapper.add(this.object)
				// this.object = this.wrapper
				this.updateCamera()
				this.updateModel()
				this.operateModel = new OperateModel(
					this.object,
					this.wrapper,
					this.camera,
					this.controls as OrbitControls,
					this.renderer as WebGLRenderer,
					this.size,
					this.scene,
				)
				this.$emit('on-model', this.operateModel)
			},
			animate() {
				this.reqId = requestAnimationFrame(this.animate)
				this.controls?.update()

				this.render()
			},
			render() {
				useEditModel().customAnimation(this.defaultAnimateList)
				this.renderer!.render(this.scene, this.camera)

				if (this.composer) {
					this.composer.render()
				}
				this.labelRenderer.render(this.scene, this.camera)
			},
			//轨迹运动
			cameraReset(position: any, lookAt: any, time = 1) {
				let _self = this
				const { camera, controls }: any = this
				gsap.to(camera.position, {
					x: position.x,
					y: position.y,
					z: position.z,
					duration: time,
					ease: 'circ.out',
					//相机运动完成的回调
					onComplete: function () {
						_self.$emit('readyCamera')
					},
				})
				gsap.to(controls.target, {
					x: lookAt.x,
					y: lookAt.y,
					z: lookAt.z,
					duration: time,
					ease: 'circ.out',
				})
			},
			// 	加载其他模型
			loadOtherMods() {
				if (this.otherThreeMod.length === 0) return
				let _self = this
				this.reportProgress('start')
				for (let i = 0; i < this.otherThreeMod.length; i++) {
					let mod: any = this.otherThreeMod[i]
					if (mod.type === 'GLTF') {
						let loader = new GLTFLoader()
						loader.setCrossOrigin(this.crossOrigin)
						loader.setRequestHeader(this.requestHeader)
						loader.load(mod.src, (data) => {
							_self.wrapper.remove(data.scene)
							data.scene.traverse(function (object: any) {
								if (object.isMesh) {
									object.castShadow = true //阴影
									object.frustumCulled = false
									object.material.emissive = object.material.color
									object.material.emissiveMap = object.material.map
								}
							})
							_self.wrapper.add(data.scene)
							this.loadOtherLen++
						})
					} else if (mod.type === 'FBX') {
						let loader = new FBXLoader()
						loader.load(mod.src, (...args) => {
							const object = _self.getObject(...args)
							_self.wrapper.remove(object)
							_self.wrapper.add(object)
							this.loadOtherLen++
						})
					}
				}
			},
		},
	})
</script>

<template>
	<div class="i-model-mixin" ref="container">
		<slot name="progress-bar" :progress="progress" v-if="progress.isComplete === false">
			<div
				style="
					position: absolute;
					z-index: 2;
					height: 3px;
					width: 100%;
					background-color: rgba(0, 0, 0, 0.04);
				"
			>
				<div
					:style="{
						width: `${loadProgressPercentage}%`,
						height: '100%',
						backgroundColor: '#1890ff',
						transition: 'width .2s',
					}"
				/>
			</div>
		</slot>
		<div
			v-if="progress.isComplete === false"
			style="position: absolute; z-index: 1; width: 100%; height: 100%"
		>
			<slot name="poster" />
		</div>
		<canvas
			@click="onClick"
			@dblclick="onDblclick"
			@mouseup="onMouseUp"
			@mousedown="onMouseDown"
			@mousemove="onMouseMove"
			ref="canvas"
			style="width: 100%; height: 100%"
		></canvas>
		<slot name="label"></slot>
		<slot name="edit"></slot>
	</div>
</template>
<style>
	.i-model-mixin {
		position: relative;
		width: 100%;
		height: 100%;
		margin: 0;
		border: 0;
		padding: 0;
		overflow-y: hidden;
	}
</style>
