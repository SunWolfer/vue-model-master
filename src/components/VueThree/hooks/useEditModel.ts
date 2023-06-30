import { CatmullRomCurve3, Euler, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

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

	return {
		modelMove,
		customAnimation,
		texturesUpdate,
	}
}

export default useEditModel
