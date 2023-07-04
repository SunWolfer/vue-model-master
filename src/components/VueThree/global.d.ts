interface ICoordinates {
	x: number
	y: number
	z: number
}
// 标签对象
interface LabelAttribute {
	id: string
	point: ICoordinates
	[key: string]: any
}

// 自定义动画（贴图位移/旋转）
interface IAnimateData {
	modelName: string //父模型名称
	materialName: string //贴图名称
	objName: string //父对象名称
	animationType: number //动画类型（1 贴图位移 2轴旋转）
	rotationAxis: string //旋转轴
	state: number //方向
	speed: number //速度
}

// 避灾路线入参
interface DisPreRoute {
	src: string //模型链接
	points: ICoordinates[] //路线生成点位
	lineRadius?: number //路线粗细
}
// 自定义球体入参
interface IBall {
	color: string
	point: ICoordinates
	[key: string]: any
}
// 自定义球体列表
interface IBallData {
	mesh: any
	uuid: string
	value: IBall
}

type ISize = {
	width: number
	height: number
}

// 火焰位置列表
interface IFiresPosition extends ICoordinates {
	size: number // 大小
}

//平面点
interface Point {
	points: number[][]
	color?: string
	type: number
}
// 其他模型接口
interface IOtherThreeMod {
	type: string // 类型
	src: string // 文件路径
	initAnimation?: boolean // 初始化动画
}
