<script lang="ts">
	import { defineComponent } from 'vue'
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
	import mixin from '../model-mixin.vue'
	import EditArea from './editArea.vue'
	import { IModelEdit } from '../ModelEdit/IModelEdit'
	import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
	import { Mesh, Object3D, Vector3 } from 'three'
	import DeleteDialog from '../ModelEdit/deleteDialog.vue'

	export default defineComponent({
		name: 'model-edit',
		components: { DeleteDialog, EditArea },
		mixins: [mixin],
		props: {
			firstNodeName: {
				type: String,
				default: '001',
			},
			// 待添加模型标准大小
			standSize: {
				type: Number,
				default() {
					return 1
				},
			},
		},
		data() {
			const loader = new GLTFLoader()
			loader.setCrossOrigin(this.crossOrigin)
			loader.setRequestHeader(this.requestHeader)
			//新增时初始化相机位置
			const initialCamera = new Vector3(0, 0, 0)

			return {
				editModel: null as null | IModelEdit,
				startRedact: false, // 是否开启编辑
				editName: '', // 编辑选中按钮
				loader,
				loadLen: 0,
				dealRoadWay: [] as Mesh[] | Object3D[], //待移动模型
				initPoint: 0, //起点高度
				planeHei: 0, //平台高度
				initialCamera,
				showDeleteDia: false, //确认删除弹窗
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
			// 	监听移动事件
			isTSControl(val) {
				if (!this.transformControl) return
				this.transformControl.detach()
				this.transformControl.enabled = val
			},
			// 	监听平面高度变化
			planeHei(val) {
				this.editModel!.planeModel.position.y = val ? val : 0
			},
			isWind(val) {
				if (val) {
					this.editModel?.showAmorousFlow()
				} else {
					this.editModel?.hideAmorousFlow()
				}
			},
		},
		computed: {
			// 	是否新增
			isRedact() {
				return this.editName === 'isRedact'
			},
			// 	是否删除
			isRemove() {
				return this.editName === 'isRemove'
			},
			// 	是否添加风门
			addDoor() {
				return this.editName === 'addDoor'
			},
			// 	是否添加风窗
			addWindow() {
				return this.editName === 'addWindow'
			},
			// 	是否添加传感器
			addSensor() {
				return this.editName === 'addSensor'
			},
			// 	是否显示风量
			isWind() {
				return this.editName === 'isWind'
			},
			// 	是否显示风流
			isFlow() {
				return this.editName === 'isFlow'
			},
			// 	是否移动
			isTSControl() {
				return this.editName === 'isTSControl'
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
					(data) => {
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
						this.editModel = new IModelEdit(
							this.object!,
							this.wrapper,
							this.scene,
							this.standSize,
							this.firstNodeName,
						)
					},
					(event) => {
						this.reportProgress('progress', event)
						this.$emit('progress', event)
					},
					(event) => {
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
					this.loader.load(oneObj.src, (data) => {
						this.loadLen++
						this.addObject(data.scene)
					})
				}
			},
			saveModel() {
				this.$emit('save-model')
			},
			// 初始化编辑
			initEdit() {
				this.transformControl = new TransformControls(
					this.camera,
					this.$refs.canvas as HTMLDivElement,
				)
				// 移动控制器监听
				this.transformControl.addEventListener('change', this.render)
				this.transformControl.addEventListener('dragging-changed', this.onDraggingChanged)
				this.scene.add(this.transformControl)

				this.transformControl.addEventListener('objectChange', this.onObjectChange)
			},
			// 	设置编辑
			optBtn(name: string) {
				this.editName = name
				this.startRedact = false
				this.editModel?.clearCylinder()
			},
			onDraggingChanged(event: any) {
				this.controls!.enabled = !event.value
			},
			onObjectChange() {
				this.dealRoadWay = this.editModel?.moveModels(this.dealRoadWay as Mesh[])!
			},
			onClick(event: MouseEvent) {
				if (!this.$attrs.onClick) return

				this.selectedObjects = []

				const intersected: any = this.pick(event.clientX, event.clientY)
				if (intersected !== null) this.selectedObjects.push(intersected.object)

				// 判断删除
				if (this.isRemove && intersected && intersected.object.name !== 'planeModel') {
					this.showDeleteDia = true
				}

				// 判断移动
				if (intersected && this.isTSControl) {
					this.dealRoadWay = this.modelMove(
						intersected.object,
						this.object!,
						this.transformControl!,
					)
				}
				this.$emit('click', event, intersected)
			},
			onDblclick(event: MouseEvent) {
				// 是否新增
				if (this.isRedact) {
					const intersected: any = this.pick(event.clientX, event.clientY)
					// 点击对象
					let chooseObj = intersected.object

					if (!chooseObj || chooseObj.name === 'textCylinder') return
					// 点击位置
					let position = intersected.point

					this.startRedact = !this.startRedact

					// 	起点
					if (this.startRedact) {
						this.editModel?.addNewModel(position, chooseObj)
						this.initPoint = position.y
						// this.planeHei = position.y
					} else {
						// 	终点
						let changeModel = this.editModel?.drawEnd(position, chooseObj)
						this.$emit('end-draw', changeModel)
					}
				}
			},
			onMouseDown(event: MouseEvent) {
				if (event.button === 2) {
					this.initialCamera = this.camera.position.clone()
				}
			},
			onMouseMove(event: MouseEvent) {
				if (this.startRedact) this.selectedObjects = []
				const intersected: any = this.pick(event.clientX, event.clientY)
				// 左键
				if (event.buttons === 0) {
					// 编辑
					if (intersected && this.startRedact && intersected.object.name !== 'textCylinder') {
						this.selectedObjects.push(intersected.object)
						this.editModel?.mouseMoveCylinder(intersected.point)
					}
				} else if (event.buttons === 1) {
				} else if (event.buttons === 2) {
					let planeModel = this.editModel!.planeModel
					// 右键
					let xChange = planeModel.position.x + this.camera.position.x - this.initialCamera.x
					let yChange = planeModel.position.y + this.camera.position.y - this.initialCamera.y
					let zChange = planeModel.position.z + this.camera.position.z - this.initialCamera.z
					planeModel.position.set(xChange, yChange, zChange)
					this.planeHei = yChange
					this.initialCamera = this.camera.position.clone()
				}
			},
			// 确认删除
			confirmDelete() {
				this.editModel?.removeObj(this.selectedObjects)
				let obj = this.selectedObjects[this.selectedObjects.length - 1]
				this.$emit('delete-model', obj.name)
				this.selectedObjects = []
				this.showDeleteDia = false
			},
    //   巷道节点移动
      modelMove(obj: any, object: Object3D, transformControl: TransformControls){
        let dealRoadWay: Mesh[] | Object3D[] = []
        transformControl.detach()
        if (obj.isMesh && obj.name !== 'planeModel' && obj.name.split('-').length === 1) {
          if (obj !== transformControl.object) {
            transformControl.attach(obj)
          }
          let tName = obj.name + ''
          // 添加待移动模型
          object.traverse((child: any) => {
            if (child.name.indexOf(tName) !== -1) {
              if (child.name.split('-').length > 1) {
                dealRoadWay.push(child)
              }
            }
          })
        }
        return dealRoadWay
      }
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
			this.editModel?.unMountClass()

			window.removeEventListener('resize', this.onResize, false)
			if (this.transformControl) {
				this.transformControl.dispose()
			}
			this.transformControl?.removeEventListener('change', this.render)
			this.transformControl?.removeEventListener('dragging-changed', this.onDraggingChanged)
			this.transformControl?.removeEventListener('objectChange', this.onObjectChange)
		},
	})
</script>

<template>
	<div style="position: relative; width: 100%; height: 100%">
		<div class="i-model-mixin" ref="container">
			<canvas
				@click="onClick"
				@dblclick="onDblclick"
				@mouseup="onMouseUp"
				@mousedown="onMouseDown"
				@mousemove="onMouseMove"
				ref="canvas"
				style="width: 100%; height: 100%; position: relative"
			></canvas>
			<slot name="label"></slot>
		</div>
		<edit-area @opt-btn="optBtn" />
		<div class="pmBtn">
			<label style="float: left">平面高度</label> <input v-model="planeHei" />
			<label style="float: left">起点高度</label>
			<input disabled v-model="initPoint" style="background: #ffffff" />
		</div>
		<delete-dialog v-if="showDeleteDia" @close="showDeleteDia = false" @confirm="confirmDelete" />
	</div>
</template>

<style lang="scss" scoped>
	@import '../scss/modelmixin.scss';
</style>
