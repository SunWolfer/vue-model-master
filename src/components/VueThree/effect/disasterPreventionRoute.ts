// 避灾路线
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
	AnimationMixer,
	CatmullRomCurve3,
	Clock,
	Euler,
	Matrix4,
	Mesh, MeshBasicMaterial,
	Object3D,
	Quaternion, RepeatWrapping, TextureLoader,
	Vector3,
} from 'three'
import useEditModel, { IMoveTexture } from '@/components/VueThree/hooks/useEditModel'
import {TubeGeometry} from "three/src/geometries/TubeGeometry";

export class DisasterPreventionRoute {
	wrapper: Object3D
	// 避灾路线移动模型
	moveModelList: Object3D[]
	extraObject: Object3D
	// 流动线（避灾路线）
	lineMeshList: Mesh[]
	animateList: any[]
	clock: Clock
	routeReqId: number | undefined
	constructor(zoneObj: Object3D) {
		this.extraObject = new Object3D()
		this.wrapper = zoneObj
		this.moveModelList = []
		this.lineMeshList = []
		// 避灾路线动画
		this.animateList = []

		this.clock = new Clock()
		this.wrapper.add(this.extraObject)

		this.renderRoute()
	}
	initRoute(pointObj: DisPreRoute) {
		let { curve } = useEditModel().createMotionTrack(pointObj.points)
		let loader = new GLTFLoader()
		let _self = this

		loader.load(pointObj.src, (data) => {
			_self.extraObject.remove(data.scene)
			data.scene.scale.x = 100
			data.scene.scale.y = 100
			data.scene.scale.z = 100

			data.scene.traverse(function (object: any) {
				if (object.isMesh) {
					object.castShadow = true //阴影
					object.frustumCulled = false
					object.material.emissive = object.material.color
					object.material.emissiveMap = object.material.map
				}
			})

			let moveModel = data.scene
			_self.moveModelList.push(moveModel)
			_self.extraObject.add(moveModel)
			let mixer1 = new AnimationMixer(moveModel)
			mixer1.clipAction(data.animations[0]).play()
			_self.createdFlowLine(pointObj.points, pointObj.lineRadius ?? 4)

			let moveTexture: IMoveTexture = {
				obj: moveModel,
				curve: curve,
				counter: 0,
				speed: 0.001,
			}
			_self.animateList.push(() => {
				mixer1.update(_self.clock.getDelta())
				useEditModel().texturesUpdate(moveTexture)
			})
		})
	}
	// 创建避灾路线流动线
	createdFlowLine(points: ICoordinates[], radius: number) {
		let { texture, mesh } = createdLine(points, radius)
		this.animateList.push(() => {
			texture.offset.x -= 0.01
		})
		this.extraObject.add(mesh)
		this.lineMeshList.push(mesh)
	}
	// 清除避灾路线相关
	cleanMoveModel(index: number) {
		if (index === -1) {
			this.extraObject.remove(...this.lineMeshList)
			this.extraObject.remove(...this.moveModelList)
			this.animateList = []
			this.lineMeshList = []
			this.moveModelList = []
		} else {
			const mesh = this.lineMeshList[index]
			const move = this.moveModelList[index]
			this.extraObject.remove(mesh)
			this.extraObject.remove(move)
			this.animateList.splice(index * 2, 2)
			this.lineMeshList.splice(index, 1)
			this.moveModelList.splice(index, 1)
		}
	}
	// 	物体沿路径移动
	moveOnCurve(
		moveCurve: CatmullRomCurve3,
		moveModel: Object3D,
		initialPosition: number,
		velocity: number,
	) {
		if (moveCurve === null || moveModel === null) return 0
		if (initialPosition <= 1 - velocity) {
			const point = moveCurve.getPointAt(initialPosition) //获取样条曲线指定点坐标
			const pointBox = moveCurve.getPointAt(initialPosition + velocity) //获取样条曲线指定点坐标

			if (point && pointBox) {
				moveModel.position.set(point.x, point.y, point.z)

				let targetPos = pointBox //目标位置点
				let offsetAngle = 0 //目标移动时的朝向偏移

				// //以下代码在多段路径时可重复执行
				let mtx = new Matrix4() //创建一个4维矩阵
				// .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
				mtx.lookAt(moveModel.position, targetPos, moveModel.up) //设置朝向
				mtx.multiply(new Matrix4().makeRotationFromEuler(new Euler(0, offsetAngle, 0)))
				let toRot = new Quaternion().setFromRotationMatrix(mtx) //计算出需要进行旋转的四元数值
				moveModel.quaternion.slerp(toRot, 0.2)
			}

			initialPosition += velocity
		} else {
			initialPosition = 0
		}
		return initialPosition
	}
	renderRoute() {
		this.routeReqId = requestAnimationFrame(this.renderRoute.bind(this))
		// 避灾路线
		for (let i = 0; i < this.animateList.length; i++) {
			if (typeof this.animateList[i] === 'function') {
				let animate: () => void = this.animateList[i]
				animate()
			}
		}
	}
	unMountClass() {
		cancelAnimationFrame(this.routeReqId!)
	}
}

import __assets_images_three_line_jpg from './image/line.jpg'
//创建避灾路线流动线
function createdLine(points: ICoordinates[], radius: number) {
	// 	创建纹理和材质
	let texture = new TextureLoader().load(__assets_images_three_line_jpg)
	texture.wrapS = texture.wrapT = RepeatWrapping //每个都重复
	texture.repeat.set(1, 1)
	texture.needsUpdate = true
	let material = new MeshBasicMaterial({
		map: texture,
		// side: BackSide,
		transparent: false,
	})

	// 创建一条平滑的三维样条曲线
	let {curve} = useEditModel().createMotionTrack(points)
	// 创建管道
	let tubeGeometry = new TubeGeometry(curve, 400, radius)
	let mesh = new Mesh(tubeGeometry, material)

	return {
		texture,
		mesh,
	}
}

