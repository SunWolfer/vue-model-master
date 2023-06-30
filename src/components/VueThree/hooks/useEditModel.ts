import {
	BufferAttribute,
	BufferGeometry,
	CatmullRomCurve3, DoubleSide,
	Euler,
	Matrix4,
	Mesh, MeshBasicMaterial,
	Object3D,
	Quaternion, TextureLoader,
	Vector3
} from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import material1 from './image/01.jpg'
import wall1 from './image/0002.jpg'

export interface IMoveTexture {
	// 运动模型
	obj: Object3D
	// 运动路线
	curve: CatmullRomCurve3
	// 物体运动时在运动路径的初始位置，范围0~1
	counter: 0
	// 影响运动速率的一个值，范围0~1，需要和渲染频率结合计算才能得到真正的速率
	speed: number
}

const useEditModel = () => {
	// 	巷道节点移动
	const modelMove = (obj: any, object: Object3D, transformControl: TransformControls) => {
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
	// 自定义动画列表
	function customAnimation(funList: any[]) {
		for (let i = 0; i < funList.length; i++) {
			if (typeof funList[i] === 'function') {
				let animate = funList[i]
				animate()
			}
		}
	}

	// 物体沿路线移动
	function texturesUpdate(data: IMoveTexture) {
		if (data.counter <= 1 - data.speed) {
			const point = data.curve.getPointAt(data.counter) //获取样条曲线指定点坐标
			const pointBox = data.curve.getPointAt(data.counter + data.speed) //获取样条曲线指定点坐标

			if (point && pointBox) {
				data.obj.position.copy(point)

				let targetPos = pointBox //目标位置点
				let offsetAngle = 0 //目标移动时的朝向偏移

				//以下代码在多段路径时可重复执行
				let mtx = new Matrix4() //创建一个4维矩阵
				// .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
				mtx.lookAt(data.obj.position, targetPos, data.obj.up) //设置朝向
				mtx.multiply(new Matrix4().makeRotationFromEuler(new Euler(0, offsetAngle, 0)))
				let toRot = new Quaternion().setFromRotationMatrix(mtx) //计算出需要进行旋转的四元数值
				data.obj.quaternion.slerp(toRot, 0.2)
			}

			data.counter += data.speed
		} else {
			data.counter = 0
		}
	}


// 创建运动轨迹(三维样条曲线)
	function createMotionTrack(
		curvePoints: ICoordinates[],
		parameter = {
			curveType: 'catmullrom', //曲线类型
			closed: false, //设置是否闭环
			tension: 0, //设置线的张力，0为无弧度折线
		} as CatmullRomCurve3,
	) {
		let curveList = []
		for (let i = 0; i < curvePoints.length; i++) {
			const point = curvePoints[i]
			curveList.push(new Vector3(point.x, point.y, point.z))
		}
		let curve: CatmullRomCurve3 = new CatmullRomCurve3(
			curveList,
			parameter.closed,
			parameter.curveType,
			parameter.tension,
		)
		return { curve }
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

		const indexs = new Uint16Array([0, 1, 2])
		geometry.index = new BufferAttribute(indexs, 1)
		const uvs = new Uint16Array([0, 1, 1, 1, 1, 0, 0, 0])
		geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
		const mesh = new Mesh(geometry, material)
		return mesh
	}

	return {
		modelMove,
		customAnimation,
		texturesUpdate,
		createMotionTrack,
		createPlaneGeometry
	}
}

export default useEditModel
