import {
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	Object3D,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	TextureLoader,
	WebGLRenderer,
} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
import useThreeExport from './hooks/useThreeExport'
import {IFires} from './effect/IFires'
import {
	DisasterPreventionRoute
} from './effect/disasterPreventionRoute'
import useEditModel from './hooks/useEditModel'

import material1 from './image/01.jpg'
import wall1 from './image/0002.jpg'

export class OperateModel {
	// 主体模型
	object: Object3D
	// 总模型
	wrapper: Object3D
	// 	相机
	camera: PerspectiveCamera
	// 	轨道控制器
	controls: OrbitControls
	renderer: WebGLRenderer
	size: ISize
	scene: Scene
	// 自定义动画方法列表
	customizeAnimateList: any[]
	// 自定义球体列表
	ballMeshList: IBallData[]
	// 火焰类
	myFires: IFires
	// 避灾路线类
	myDisPreRoute: DisasterPreventionRoute
	editId: number | undefined
	constructor(
		object: Object3D,
		wrapper: Object3D,
		camera: PerspectiveCamera,
		controls: OrbitControls,
		renderer: WebGLRenderer,
		size: ISize,
		scene: Scene,
	) {
		this.object = object
		this.wrapper = wrapper
		this.camera = camera
		this.controls = controls
		this.renderer = renderer
		this.size = size
		this.scene = scene

		this.ballMeshList = []
		// 初始化自定义动画
		this.customizeAnimateList = []
		// 初始化火焰
		this.myFires = new IFires(this.size)
		// 初始化避灾路线
		this.myDisPreRoute = new DisasterPreventionRoute(this.scene)
		this.resetFrame()
	}
	// 	模型添加/更新标签
	addLabelList(labelList: LabelAttribute[], IObj: Object3D) {
		let removeList: any[] = []
		for (let i = 0; i < IObj.children.length; i++) {
			const child: any = IObj.children[i]
			if (child.isCSS2DObject) {
				removeList.push(child)
			}
		}
		IObj.remove(...removeList)

		for (let i = 0; i < labelList.length; i++) {
			let obj = labelList[i]
			let dom: HTMLElement | null = document.getElementById(obj.id)

			if (!dom) return
			const Css2Dom = new CSS2DObject(dom)
			const { x, y, z } = obj.point
			Css2Dom.position.set(x, y, z)
			IObj?.add(Css2Dom)
		}
	}
	// 	主体模型添加/更新标签
	addObjectLabels(labelList: LabelAttribute[]) {
		this.addLabelList(labelList, this.object)
	}
	// 	总模型添加/更新标签
	addWrapperLabels(labelList: LabelAttribute[]) {
		this.addLabelList(labelList, this.wrapper)
	}
	// 	创建自定义平面
	addGeometry(points: Point[]) {
		createPlaneGeometry(points, this.wrapper)
	}
	// 	添加自定义动画
	addAnimations(animateData: IAnimateData) {
		let animationObj: any = null
		this.wrapper?.traverse((child) => {
			if (child.name === animateData.objName) {
				animationObj = child
			}
		})
		if (!animationObj) return
		switch (animateData.animationType) {
			// 贴图位移
			case 1:
				//材质
				let material = animationObj?.material
				//材质贴图
				let texture = material.map
				texture.repeat.set(2, 2)
				let offset = 0
				this.customizeAnimateList.push(() => {
					if (!animateData.state) {
						offset += animateData.speed // 偏移的方向和速度
					} else {
						offset -= animateData.speed // 偏移的方向和速度
					}
					texture.offset.set(offset, 0)
				})
				break
			// 自身旋转
			case 2:
				this.customizeAnimateList.push(() => {
					if (animateData.rotationAxis === 'x') {
						animationObj.rotateX(animateData.speed)
					} else if (animateData.rotationAxis === 'y') {
						animationObj.rotateY(animateData.speed)
					} else if (animateData.rotationAxis === 'z') {
						animationObj.rotateZ(animateData.speed)
					}
				})
				break
		}
	}

	// 	创建避灾路线
	addDisPreRoute(pointObj: DisPreRoute) {
		this.myDisPreRoute.initRoute(pointObj)
	}
	// 清除避灾路线相关
	cleanMoveModel(index: number) {
		this.myDisPreRoute.cleanMoveModel(index)
	}

	// 	添加自定义球体
	addBall(ballList: IBall[]) {
		if (!this.object) return
		//设置球体的值
		const radius = 4,
			segemnt = 32,
			rings = 32
		const meshes = this.ballMeshList.map((i) => {
			return i.mesh
		})
		this.wrapper.remove(...meshes)
		for (let i = 0; i < ballList.length; i++) {
			const data = ballList[i]
			let sphereMaterial = new MeshPhongMaterial({
				color: data.color,
				specular: data.color,
				shininess: 1,
			})

			let sphere = new Mesh(new SphereGeometry(radius, segemnt, rings), sphereMaterial)

			this.wrapper.add(sphere)
			sphere.position.x = data.point.x
			sphere.position.y = data.point.y
			sphere.position.z = data.point.z
			this.ballMeshList.push({
				mesh: sphere,
				uuid: sphere.uuid,
				value: data,
			})
		}
	}
	// 	导出主体Object
	exportObjects() {
		useThreeExport().exportGLTF([this.object])
	}
	// 	创建火焰
	addFire(pointsPosition: IFiresPosition[]) {
		this.myFires.config(this.scene, this.renderer, this.camera, this.controls)
		this.myFires.setPosition(pointsPosition)
		this.myFires.showFire()
	}
	// 清除火焰
	resetFires() {
		this.myFires.unMountClass()
	}
	resetFrame() {
		this.editId = requestAnimationFrame(this.resetFrame.bind(this))
		useEditModel().customAnimation(this.customizeAnimateList)
	}
	// 页面注销后操作
	unmountEditModel() {
		this.myDisPreRoute.unMountClass()
		this.myFires.unMountClass()
		cancelAnimationFrame(this.editId!)
	}
}


//生成平面
function createPlaneGeometry(points: Point[], scene: Object3D) {
	let IMeshes = []
	for (let i = 0; i < points.length; i++) {
		const c1 = points[i].points
		const color = points[i].color
		const material = points[i].type === 1 ? '' : 1
		// 生成两个三角形的顶点集合
		const p1 = [c1[0], c1[1], c1[2]]
		const p2 = [c1[0], c1[2], c1[3]]
		IMeshes.push(createdMesh(p1, color, material))
		IMeshes.push(createdMesh(p2, color, material))
	}
	scene.add(...IMeshes)
}

function createdMesh(points: number[][], color?: string, IMaterial?: any) {
	// 每一个三角形，需要三个顶点，每个顶点需要3个值
	const geometry = new BufferGeometry()
	const vertices = new Float32Array(9)
	for (let j = 0; j < 9; j++) {
		if (j < 3) {
			vertices[j] = points[0][j]
		} else if (j < 6) {
			vertices[j] = points[1][j - 3]
		} else if (j < 9) {
			vertices[j] = points[2][j - 6]
		}
	}

	geometry.setAttribute('position', new BufferAttribute(vertices, 3))

	let material, texture
	if (IMaterial) {
		texture = new TextureLoader().load(material1)
	} else {
		// material = new MeshBasicMaterial({ color: color, side: DoubleSide })
		texture = new TextureLoader().load(wall1)
	}
	if (texture) {
		material = new MeshBasicMaterial({ map: texture, side: DoubleSide })
	}

	//初始化存放颜色信息的序列化数组
	const colors = new Float32Array([0.5, 0.3, 0.6, 0.5, 0.3, 0.6, 0.5, 0.3, 0.6])
	geometry.setAttribute('color', new BufferAttribute(colors, 3))

	const indexS = new Uint16Array([0, 1, 2])
	geometry.index = new BufferAttribute(indexS, 1)
	const uvs = new Uint16Array([0, 1, 1, 1, 1, 0, 0, 0])
	geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
	return new Mesh(geometry, material)
}
