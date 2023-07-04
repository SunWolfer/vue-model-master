import ModelGltf from '../components/VueThree/model-gltf.vue'
import {Object3D, Vector3} from 'three'
import { ref, reactive, nextTick } from 'vue'
import { OperateModel } from '@/components/VueThree/IModelOperate'

// 3D文件路径

const useThree = () => {
	const homeModelVisible = ref<InstanceType<typeof ModelGltf>>()
	// 3D文件路径
	const indoorFileUrl = ref(import.meta.env.BASE_URL + 'file/3DModel.glb')
	// 引用其他3D文件
	const otherThreeMod = ref<IOtherThreeMod[]>([
		// {
		// 	type: 'GLTF',
		// 	src: import.meta.env.BASE_URL + 'file/mark.glb',
		// },
		// {
		// 	type: 'GLTF',
		// 	src: import.meta.env.BASE_URL + 'file/other.gltf',
		// },
	])

	// 初始化相机位置
	const cameraPosition = reactive({
		x: -698.2669249863205,
		y: 4580.382833854236,
		z: 88.0522500278551,
	})
	//初始化后相机位置
	const removePosition = reactive({
		x: -1318.7236710862278,
		y: 1931.5522901212985,
		z: -597.5078456592696,
	})
	// 初始化后相机朝向点
	const removeLookAt = reactive({
		x: 184.8622295502642,
		y: 782.764089410923,
		z: 416.8556950012434,
	})
	// 控制器默认参数
	const controlsOptions = reactive({
		autoRotate: false,
		autoRotateSpeed: 1,
	})
	// 默认灯光
	const lights = [
		{
			type: 'HemisphereLight',
			position: { x: 0, y: 1, z: 0 },
			skyColor: 0xaaaaff,
			groundColor: 0x806060,
			intensity: 0.2,
		},
		{
			type: 'DirectionalLight',
			position: { x: -1, y: 2, z: 1 },
			color: 0xffffff,
			intensity: 0.6,
		},
		{
			type: 'AmbientLight',
			color: 0xaaaaaa,
		},
	]
	// 相机坐标
	const cameraWorldPosition = ref<Vector3>()
	// 相机朝向点
	const cameraLookAtPoint = ref<Vector3>()
	// 点击对象
	const intersected = ref<any>(undefined)
	// 点击位置
	const intersectedPosition = ref({})

	// 自定义球体
	const chooseBall = ref<IBallData | undefined>()
	// 单击
	function onClick(event: MouseEvent, CIntersected: any) {
		if (!CIntersected) {
			intersected.value = null
			return
		}
		intersected.value = CIntersected?.object
		intersectedPosition.value = CIntersected?.point
		cameraWorldPosition.value = homeModelVisible.value?.camera.position
		cameraLookAtPoint.value = homeModelVisible.value?.controls?.target
		console.log('---------点击对象---------')
		console.log(intersected.value)
		console.log('---------点击位置---------')
		console.log(intersectedPosition.value)
		console.log('---------相机位置---------')
		console.log(cameraWorldPosition.value)
		console.log('---------相机朝向点---------')
		console.log(cameraLookAtPoint.value)
		chooseBall.value = operateModel.value?.ballMeshList.find((i) => {
			return i.uuid === intersected.value.uuid
		})
	}

	// 双击
	function dblclick(event: MouseEvent, CIntersected: any) {}

	// 全部模型加载完毕后执行
	function onLoad() {
		homeModelVisible.value?.cameraReset(removePosition, removeLookAt, 3)
	}
	// 模型编辑类
	const operateModel = ref<OperateModel>()
	// 模型编辑类加载
	function onModel(modelCLass: OperateModel) {
		operateModel.value = modelCLass
	}

	// 相机移动完成
	function readyCamera() {}

	//重置控制器
	function resetControls() {
		if (!homeModelVisible.value) return
		homeModelVisible.value.controls?.saveState()
		nextTick(() => {
			homeModelVisible.value!.controls?.reset()
		})
	}
	// 	创建自定义平面
	const createdGeometry = (planeGeometryList: Point[]) => {
		operateModel.value?.addGeometry(planeGeometryList)
	}
	// 创建避灾路线
	const createdMoveModel = (disasterRoutes: DisPreRoute) => {
		operateModel.value?.addDisPreRoute(disasterRoutes)
	}
	// 改变相机位置、
	const changeCameraPosition = (toPosition: ICoordinates, toLookAt: ICoordinates, time = 3) => {
		homeModelVisible.value?.cameraReset(toPosition, toLookAt, time)
	}
	// 创建2D标签
	const createdLabelList = (list: LabelAttribute[]) => {
		operateModel.value?.addWrapperLabels(list)
	}
	// 清除避灾路线
	const cleanMove = (index = -1) => {
		operateModel.value?.cleanMoveModel(index)
	}
	// 总避灾路线数组
	const disasterRoutes = ref<string[][]>([['118', '119', '129', '130', '131']])
	// 避灾路线人员模型
	const personnel = import.meta.env.BASE_URL + 'file/pao-02.glb'
	// 生成避灾路线点位
	const createdMoveModelPoints = (startNode: string, points: ICoordinates, radius = 4) => {
		// cleanMove()
		// 	点击位置起止点
		let positions = [points]
		let object = homeModelVisible.value?.object
		for (let i = 0; i < disasterRoutes.value.length; i++) {
			const datas: string[] = disasterRoutes.value[i]
			const index = datas.indexOf(startNode)
			if (index !== -1) {
				for (let j = index; j < datas.length; j++) {
					if (object) {
						object.traverse((item:Object3D) => {
							if (item.name === datas[j]) {
								positions.push(item.position)
							}
						})
					}
				}
			}
		}
		if (positions.length > 1) {
			const disasterRoutes = {
				src: personnel,
				points: positions,
				lineRadius: radius,
			}
			nextTick(() => {
				createdMoveModel(disasterRoutes)
			})
		}
	}

	// 添加自定义球
	const createdBallModel = (ballList: IBall[]) => {
		operateModel.value?.addBall(ballList)
	}
	// 保存主模型
	const saveModel = () => {
		operateModel.value?.exportObjects()
	}

	// 火焰位置
	const firePositions = ref<IFiresPosition[]>([])
	// 添加火焰
	const addFires = () => {
		operateModel.value?.addFire(firePositions.value)
	}
	return {
		ModelGltf,
		indoorFileUrl,
		otherThreeMod,
		cameraPosition,
		removePosition,
		removeLookAt,
		controlsOptions,
		lights,
		homeModelVisible,
		onLoad,
		onModel,
		onClick,
		dblclick,
		readyCamera,
		intersectedPosition,
		intersected,
		resetControls,
		createdGeometry,
		createdMoveModel,
		changeCameraPosition,
		cameraLookAtPoint,
		createdLabelList,
		createdMoveModelPoints,
		cleanMove,
		createdBallModel,
		chooseBall,
		operateModel,
		saveModel,
		firePositions,
		addFires,
	}
}

export default useThree
