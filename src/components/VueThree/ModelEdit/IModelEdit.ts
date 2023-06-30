import {
	CatmullRomCurve3,
	CylinderGeometry,
	DoubleSide,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	Object3D,
	PlaneGeometry,
	Quaternion,
	RepeatWrapping,
	Scene,
	SphereGeometry,
	Texture,
	TextureLoader,
	Vector3,
} from 'three'
import usePoint from './IPoint'
import { TubeGeometry } from 'three/src/geometries/TubeGeometry'
// 风流图片
import ___image_direction_png from '../image/direction.png'
interface wind {
	obj: Mesh
	texture: Texture
	speed: number
}
export class IModelEdit {
	// 待添加模型
	initModel: null | Mesh
	// 编辑模型
	object: Object3D
	// 父模型
	wrapper: Object3D
	scene: Scene
	// 标准大小
	standSize: number
	// 节点颜色
	nodeColor: string
	// 首个节点颜色
	firstNodeName: string
	// 初始位置
	startPoint: Vector3
	// 起始绘制点
	startDrawPoint: number
	// 起始绘制模型
	startDrawModel: string[]
	// 终止绘制模型
	endDrawModel: string[]
	// 柱体模型
	material: MeshLambertMaterial
	// 标准平面
	planeModel!: Mesh
	// 新建巷道
	cylinder: Mesh | null
	// 巷道子对象所在层级
	hierarchy: number
	// 新增巷道图层
	editModelLayer: Object3D
	// 动画
	animateList: any[]
	editReqId: number | undefined
	// 风流
	windList: wind[]
	// 风流模型
	texture: Texture
	constructor(
		object: Object3D,
		wrapper: Object3D,
		scene: Scene,
		standSize: number,
		firstNodeName: string,
	) {
		this.initModel = null
		this.object = object
		this.wrapper = wrapper
		this.scene = scene
		this.standSize = standSize
		this.nodeColor = ''
		this.firstNodeName = firstNodeName

		this.editModelLayer = new Object3D()
		this.scene.add(this.editModelLayer)

		this.startPoint = new Vector3(0, 0, 0)
		this.startDrawPoint = 0
		// 起始绘制模型
		this.startDrawModel = []
		// 终止绘制模型
		this.endDrawModel = []

		// 柱体模型
		this.material = new MeshLambertMaterial({
			color: '#05a110',
		})
		this.cylinder = null
		this.hierarchy = 0
		this.windList = []

		// 加载风流贴图
		let textureLoader = new TextureLoader()
		this.texture = textureLoader.load(___image_direction_png)

		this.initGLB()
		this.setNewPlane()

		this.animateList = []

		this.renderRoute()
	}
	// 创建平面
	setNewPlane() {
		const planeGeometry = new PlaneGeometry(4000 * this.standSize, 4000 * this.standSize, 20, 20)
		planeGeometry.rotateX(-Math.PI / 2)
		const material = new MeshBasicMaterial({
			color: 0x49a8d7,
			side: DoubleSide,
			transparent: false,
			wireframe: true,
		})
		planeGeometry.name = 'planeModelgeometry'
		material.name = 'planeModelmaterial'
		this.planeModel = new Mesh(planeGeometry, material)

		this.planeModel.position.set(0, 0, 0)
		this.planeModel.name = 'planeModel'
		this.planeModel.receiveShadow = true
		this.wrapper.add(this.planeModel)
	}
	/**
	 * 初始化模型数据
	 */
	initGLB() {
		// 节点颜色
		this.object.traverse((child: any) => {
			if (child.name === this.firstNodeName) {
				this.nodeColor = child.material.color.getHexString()
			}
		})
		// 节点球体
		let ballNode: any[] = []
		this.object.traverse((child: any) => {
			if (child.isMesh) {
				// 获取小球
				if (child.material.color && child.material.color.getHexString() === this.nodeColor) {
					ballNode.push(child.name)
				}
			}
		})
		let initNum = ballNode.filter((i) => {
			if (!isNaN(parseInt(i))) {
				return i
			}
		})
		let maxNum = initNum.map((i) => {
			return parseInt(i)
		})
		this.startDrawPoint = Math.max(...maxNum) + 1
		this.hierarchy = findHierarchyIndex(initNum[0], this.object, 0)
	}
	// 	移动模型
	moveModels(objs: Mesh[]): Mesh[] {
		let addObjs: Mesh[] = []
		objs.forEach((obj) => {
			const { start, end } = findPoint(obj, this.object)
			// 	创建顶点数组
			let Vector3Points = [start.position, end.position]
			const { mesh } = this.createdTubeGeometry(Vector3Points, obj.material)
			mesh.name = obj.name
			addObjs.push(mesh)
			resetModel(this.object, obj, mesh)
		})
		return addObjs
	}
	// 	新增模型
	addNewModel(position: Vector3, chooseObj: Mesh) {
		// 	初始化起始绘制模型
		if (chooseObj.name !== 'planeModel') {
			// 起始绘制选中模型
			this.startDrawModel = chooseObj.name.split('-')
		}
		// 	起始点
		this.startPoint = position
		this.cylinder = createUnitCylinder(position, this.standSize * 3)
		this.editModelLayer.add(this.cylinder)
	}
	// 鼠标移动更新模型
	mouseMoveCylinder(position: Vector3) {
		moveMesh(this.startPoint, position, this.cylinder)
	}
	// 结束模型绘制
	drawEnd(po: Vector3, obj: Mesh) {
		// 判断是否是平面
		if (obj.name !== 'planeModel') {
			// 结束绘制选中模型
			this.endDrawModel = obj.name.split('-')
		}
		// 开始绘制选中模型名数组长度
		let lens = this.startDrawModel.length
		// 结束绘制选中模型名数组长度
		let lene = this.endDrawModel.length
		// 生成模型名称
		let name = ''
		// 生成节点
		let nodeArray: any[] = [null, null]
		// 生成巷道数组
		let genModelList = []
		// 被拆分的巷道
		let splitModelList = []
		// 生成2节点
		// 连接两巷道
		if (lens !== 1 && lene !== 1) {
			name = `${this.startDrawPoint + ''}-${this.startDrawPoint + 1 + ''}`
			nodeArray = [
				{
					name: this.startDrawPoint + '',
					position: this.startPoint,
				},
				{
					name: this.startDrawPoint + 1 + '',
					position: po,
					connectPoint: name,
				},
			]
			this.startDrawPoint = this.startDrawPoint + 2
		}
		// 生成1节点
		if ((lens === 1 && lene === 0) || (lens === 1 && lene === 2)) {
			name = `${this.startDrawModel[0]}-${this.startDrawPoint + ''}`
			nodeArray = [
				null,
				{
					name: this.startDrawPoint + '',
					position: po,
				},
			]
			this.startDrawPoint = this.startDrawPoint + 1
		} else if ((lens === 0 && lene === 1) || (lens === 2 && lene === 1)) {
			name = `${this.startDrawPoint + ''}-${this.endDrawModel[0]}`
			nodeArray = [
				{
					name: this.startDrawPoint + '',
					position: this.startPoint,
				},
				null,
			]
			this.startDrawPoint = this.startDrawPoint + 1
		}
		// 生成0节点
		if (lens === 1 && lene === 1) {
			name = `${this.startDrawModel[0]}-${this.endDrawModel[0]}`
		}

		// 生成球
		for (let i = 0; i < nodeArray.length; i++) {
			let a = nodeArray[i]
			if (a) {
				this.creatBallsByPoint(a.position, a.name)
			}
		}
		genModelList.push(name)
		// 如果起点处拆分
		if (lens === 2) {
			genModelList.push(`${this.startDrawModel[0]}-${nodeArray[0].name}`)
			genModelList.push(`${nodeArray[0].name}-${this.startDrawModel[1]}`)
			splitModelList.push(`${this.startDrawModel[0]}-${this.startDrawModel[1]}`)
		}
		// 如果结尾处拆分
		if (lene === 2) {
			genModelList.push(`${this.endDrawModel[0]}-${nodeArray[1].name}`)
			genModelList.push(`${nodeArray[1].name}-${this.endDrawModel[1]}`)
			splitModelList.push(`${this.endDrawModel[0]}-${this.endDrawModel[1]}`)
		}

		this.removeObjByName(splitModelList)

		// 根据巷道名称数组生成巷道
		this.connectBall(genModelList)
		this.clearCylinder()
		return [genModelList, splitModelList]
	}
	// 根据巷道名称数组生成巷道
	connectBall(names: string[]) {
		let sumPoint: Object3D[][] = []
		for (let i = 0; i < names.length; i++) {
			let contList = names[i].split('-')
			let points: Object3D[] = []
			this.object.traverse((child) => {
				if (child.name === contList[0] || child.name === contList[1]) {
					points.push(child)
				}
			})
			sumPoint.push(points)
		}
		for (let j = 0; j < sumPoint.length; j++) {
			const start = sumPoint[j][0]
			const end = sumPoint[j][1]
			const name = names[j]
			// 	创建顶点数组
			let Vector3Points = [start.position, end.position]
			const { mesh } = this.createdTubeGeometry(Vector3Points, this.material)
			mesh.name = name
			this.addObj(mesh)
		}
	}
	/**
	 * 根据坐标生成球
	 * @param {Object} position
	 * @param {Object} name
	 */
	creatBallsByPoint(position: Vector3, name: string) {
		const geometry = new SphereGeometry(3.5 * this.standSize, 30, 40)
		const material = new MeshPhongMaterial({
			color: `#${this.nodeColor}`,
			shininess: 2,
		})
		let ball = new Mesh(geometry, material)
		ball.position.set(position.x, position.y, position.z)
		ball.name = name
		this.addObj(ball)
	}
	// 	根据点生成管道模型
	createdTubeGeometry(Vector3Points: Vector3[], material?: any) {
		// 创建一条平滑的三维样条曲线
		let curve: any = new CatmullRomCurve3(Vector3Points, false, 'catmullrom', 0)
		let tubeGeometry = new TubeGeometry(curve, 200, this.standSize * 3)
		let mesh = new Mesh(tubeGeometry, material ? material : this.material)
		return {
			curve,
			tubeGeometry,
			mesh,
		}
	}
	// 添加模型
	addObj(object: Mesh) {
		toNextByIndex(this.hierarchy, this.object, (obj: Mesh) => {
			obj.add(object)
		})
	}
	// 	从模型中删除对象
	removeObj(objects: Mesh[]) {
		toNextByIndex(this.hierarchy, this.object, (obj: Mesh) => {
			obj.remove(...objects)
			objects.forEach((i) => {
				i.geometry.dispose()
			})
		})
	}
	// 根据模型对象名称删除
	removeObjByName(names: string[]) {
		let removeModel: any = []
		for (let i = 0; i < names.length; i++) {
			let name = names[i]
			this.object.traverse((child) => {
				if (child.name === name) {
					removeModel.push(child)
				}
			})
		}
		this.removeObj(removeModel)
	}
	// 删除初始新增巷道
	clearCylinder() {
		if (this.cylinder) {
			this.editModelLayer.remove(this.cylinder)
			this.cylinder.geometry.dispose()

			this.cylinder = null
			this.startPoint = new Vector3(0, 0, 0)
			// 起始绘制模型
			this.startDrawModel = []
			// 终止绘制模型
			this.endDrawModel = []
		}
	}
	// 	显示风流
	showAmorousFlow() {
		let roadList: any[] = []
		this.object.traverse((child) => {
			if (
				child.isObject3D &&
				child.name.split('-').length > 1 &&
				child.name.split('-')[0] !== 'door' &&
				child.name.split('-')[0] !== 'window' &&
				child.name.split('-')[0] !== 'sensor'
			) {
				roadList.push(child)
			}
		})
		for (let i = 0; i < roadList.length; i++) {
			let { tube, texture, len } = this.addWindDirByCurve(roadList[i])
			let speed = 0.2 - 10 / len
			this.editModelLayer.add(tube)
			this.windList.push({
				obj: tube,
				texture: texture,
				speed: speed > 0 ? speed : 0.01,
			})
		}
		this.animateList.push(() => {
			for (let i = 0; i < this.windList.length; i++) {
				let windObj = this.windList[i]
				windObj.texture.offset.x -= windObj.speed
			}
		})
	}
	// 隐藏风流
	hideAmorousFlow() {
		for (let i = 0; i < this.windList.length; i++) {
			let wind = this.windList[i]
			let obj: any = wind.obj
			this.editModelLayer.remove(obj)
			obj.geometry.dispose()
			obj.material.dispose()
		}
		this.windList = []
	}
	addWindDirByCurve(obj: Mesh) {
		let curveArr = []
		let objName = obj.name
		let names = objName.split('-')
		// 取直线连接点
		for (let i = 0; i < names.length; i++) {
			let sObj = new Object3D()
			this.object.traverse((child) => {
				if (names[i] === child.name) {
					sObj = child
				}
			})
			curveArr.push(sObj.position)
		}
		let len = 0
		for (let i = 0; i < curveArr.length - 1; i++) {
			len += usePoint().distance(curveArr[i], curveArr[i + 1])
		}

		// 通过类CatmullRomCurve3创建一个3D样条曲线
		let curve = new CatmullRomCurve3(curveArr, false, 'catmullrom', 0)
		let tubeGeometry = new TubeGeometry(curve, 100, this.standSize * 4)

		let texture = this.texture.clone()

		// 设置阵列模式 RepeatWrapping
		texture.wrapS = RepeatWrapping
		texture.wrapT = RepeatWrapping
		// 设置x方向的重复数(沿着管道路径方向)
		texture.repeat.x = parseInt(String(len / 10))
		// 设置y方向的重复数(环绕管道方向)
		texture.repeat.y = 4
		// 设置管道纹理偏移数,便于对中
		texture.offset.y = 0.5
		let tubeMaterial = new MeshPhongMaterial({
			map: texture,
			transparent: true,
		})
		let tube = new Mesh(tubeGeometry, tubeMaterial)

		return { tube, texture, len }
	}
	renderRoute() {
		this.editReqId = requestAnimationFrame(this.renderRoute.bind(this))

		for (let i = 0; i < this.animateList.length; i++) {
			if (typeof this.animateList[i] === 'function') {
				let animate: () => void = this.animateList[i]
				animate()
			}
		}
	}
	unMountClass() {
		cancelAnimationFrame(this.editReqId!)
	}
}
// 查询起止点
function findPoint(obj: Object3D, object: Object3D) {
	let pointNames = obj.name.split('-')
	let start = new Object3D(),
		end = new Object3D()
	object.traverse((child) => {
		if (child.name === pointNames[0]) {
			start = child
		}
		if (child.name === pointNames[1]) {
			end = child
		}
	})
	return {
		start,
		end,
	}
}

// 替换模型
function resetModel(object: Object3D, obj: Mesh, resetObj: Mesh | null) {
	let hasFind = false
	let floorModel = new Object3D()
	for (let i = 0; i < object.children.length; i++) {
		floorModel = object.children[i]
		if (floorModel.name === obj.name) {
			object.children[i].parent?.remove(obj)
			obj.geometry.dispose()
			if (resetObj) object.children[i].parent?.add(resetObj)
			hasFind = true
			return
		}
	}
	if (!hasFind) resetModel(floorModel, obj, resetObj)
}
// 生成初始模型
function createUnitCylinder(position: Vector3, size: number) {
	let geometry = new CylinderGeometry(size, size, 1, 4)
	geometry.rotateX(Math.PI * 0.5)
	let material = new MeshBasicMaterial({ color: '#05a110' })
	let cylinder = new Mesh(geometry, material)
	cylinder.position.set(position.x, position.y, position.z)
	cylinder.name = 'textCylinder'
	return cylinder
}
// 新增巷道移动
function moveMesh(p1: Vector3, p2: Vector3, obj: Mesh | null) {
	if (!obj) return
	let len = usePoint().distance(p1, p2)
	obj.scale.set(1, 1, len)
	obj.position.set(p1.x + (p2.x - p1.x) / 2, p1.y + (p2.y - p1.y) / 2, p1.z + (p2.z - p1.z) / 2)
	oriPoint(p2, obj)
}

/**
 * 旋转模型
 * @param {Object} v 目标点
 * @param {Object} model 模型
 */
function oriPoint(v: Vector3, model: Mesh) {
	let apos = v.clone()
	let toRod = setModelSpin(model, apos)
	model.quaternion.set(toRod.x, toRod.y, toRod.z, toRod.w)
}

/**
 * 计算四元值
 * @param {Object} model 模型对象
 * @param {Object} lookPoint 目标点
 */
function setModelSpin(model: Mesh, lookPoint: Vector3) {
	//以下代码在多段路径时可重复执行
	let mtx = new Matrix4() //创建一个4维矩阵
	mtx.lookAt(lookPoint, model.position, model.up) //设置朝向
	let toRot = new Quaternion()
	toRot.setFromRotationMatrix(mtx) //计算出需要进行旋转的四元数值
	return toRot
}

//查找模型添加父级所在层级
function findHierarchyIndex(name: string, object: Object3D, initHierarchy: number): number {
	let hasFind = false
	let obj = new Object3D()
	for (let i = 0; i < object.children.length; i++) {
		obj = object.children[i]
		if (obj.name === name) {
			hasFind = true
			return initHierarchy
		}
	}
	if (!hasFind) {
		initHierarchy++
		initHierarchy = findHierarchyIndex(name, obj, initHierarchy)
	}
	return initHierarchy
}
// 根据层次进行操作
function toNextByIndex(index: number, object: Object3D, next: Function) {
	for (let i = 0; i < object.children.length; i++) {
		if (i === index - 1) {
			next(object.children[i])
		} else {
			toNextByIndex(index, object.children[i], next)
		}
	}
}
