<script setup>
	import LeaderLine from 'vue3-leaderline'
	import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
	const nodeList = [
		{ name: '1', position: [1181.538, 2100.0], children: ['59', '5', '7', '175'], label: '1' },
		{ name: '5', position: [1550.769, 2046.154], children: ['11'], label: '1' },
		{ name: '7', position: [812.308, 2050.0], children: ['8'], label: '1' },
		{ name: '8', position: [1288.924, 2000.0], children: ['10', '60'], label: '1' },
		{ name: '10', position: [1206.352, 1920.0], children: ['12'], label: '1' },
		{ name: '11', position: [1075.051, 1992.308], children: ['10', '64'], label: '1' },
		{ name: '12', position: [1151.613, 1860.0], children: ['13', '78'], label: '1' },
		{ name: '13', position: [1102.304, 1800.0], children: ['15', '14'], label: '1' },
		{ name: '14', position: [1018.071, 1680.0], children: ['16'], label: '1' },
		{ name: '15', position: [1057.924, 1740.0], children: ['14'], label: '1' },
		{ name: '16', position: [982.422, 1620.0], children: ['19', '17'], label: '1' },
		{ name: '17', position: [1156.614, 1470.0], children: ['18', '20'], label: '1' },
		{ name: '18', position: [1145.909, 1400.0], children: ['20'], label: '1' },
		{ name: '19', position: [950.713, 1560.0], children: ['22', '21'], label: '1' },
		{ name: '20', position: [1136.744, 1330.0], children: ['21'], label: '1' },
		{ name: '21', position: [1129.109, 1260.0], children: ['190'], label: '1' },
		{ name: '22', position: [922.728, 1500.0], children: ['51', '23'], label: '1' },
		{ name: '23', position: [898.288, 1440.0], children: ['192', '24'], label: '1' },
		{ name: '24', position: [859.488, 1320.0], children: ['25'], label: '1' },
		{ name: '25', position: [844.912, 1260.0], children: ['190', '26'], label: '1' },
		{ name: '26', position: [1483.622, 1200.0], children: ['55', '28', '191'], label: '1' },
		{ name: '28', position: [869.135, 1140.0], children: ['32'], label: '1' },
		{ name: '29', position: [1232.151, 504.0], children: ['193'], label: '1' },
		{ name: '30', position: [880.231, 612.5], children: ['52', '29'], label: '1' },
		{ name: '32', position: [866.147, 1080.0], children: ['34'], label: '1' },
		{ name: '33', position: [1147.874, 1050.0], children: ['37'], label: '1' },
		{ name: '34', position: [866.147, 1020.0], children: ['35'], label: '1' },
		{ name: '35', position: [869.135, 960.0], children: ['36'], label: '1' },
		{ name: '36', position: [875.125, 900.0], children: ['40', '39'], label: '1' },
		{ name: '37', position: [1148.537, 984.375], children: ['38'], label: '1' },
		{ name: '38', position: [1150.528, 918.75], children: ['42'], label: '1' },
		{ name: '39', position: [884.148, 840.0], children: ['40'], label: '1' },
		{ name: '40', position: [896.25, 780.0], children: ['41'], label: '1' },
		{ name: '41', position: [911.492, 720.0], children: ['43'], label: '1' },
		{ name: '42', position: [1153.848, 853.125], children: ['41', '46'], label: '1' },
		{ name: '43', position: [929.956, 660.0], children: ['44', '46', '285'], label: '1' },
		{ name: '44', position: [1038.478, 420.0], children: ['48'], label: '1' },
		{ name: '45', position: [1429.602, 494.118], children: ['44'], label: '1' },
		{ name: '46', position: [1444.608, 555.882], children: ['45'], label: '1' },
		{ name: '48', position: [1075.146, 360.0], children: ['193'], label: '1' },
		{ name: '51', position: [952.768, 437.5], children: ['184'], label: '1' },
		{ name: '52', position: [912.791, 525.0], children: ['53', '51'], label: '1' },
		{ name: '53', position: [1161.745, 240.0], children: ['185'], label: '1' },
		{ name: '54', position: [1224.229, 588.0], children: ['29'], label: '1' },
		{ name: '55', position: [1207.821, 855.556], children: ['195', '56'], label: '1' },
		{ name: '56', position: [1211.209, 777.778], children: ['54', '195'], label: '1' },
		{ name: '59', position: [1169.16, 2043.243], children: ['76', '70'], label: '1' },
		{ name: '60', position: [1336.011, 1950.0], children: ['62', '61'], label: '1' },
		{ name: '61', position: [1379.241, 1900.0], children: ['62', '63'], label: '1' },
		{ name: '62', position: [1418.928, 1850.0], children: ['64'], label: '1' },
		{ name: '63', position: [1333.205, 1850.0], children: ['64', '70'], label: '1' },
		{ name: '64', position: [1455.329, 1800.0], children: ['65'], label: '1' },
		{ name: '65', position: [1488.662, 1750.0], children: ['66'], label: '1' },
		{ name: '66', position: [1519.106, 1700.0], children: ['67', '179'], label: '1' },
		{ name: '67', position: [1546.816, 1650.0], children: ['68', '69'], label: '1' },
		{ name: '68', position: [1571.92, 1600.0], children: ['69'], label: '1' },
		{ name: '69', position: [1594.531, 1550.0], children: ['71'], label: '1' },
		{ name: '70', position: [1285.242, 1792.683], children: ['75'], label: '1' },
		{ name: '71', position: [1614.742, 1500.0], children: ['72', '73'], label: '1' },
		{ name: '72', position: [1648.276, 1400.0], children: ['74'], label: '1' },
		{ name: '73', position: [1632.634, 1450.0], children: ['72'], label: '1' },
		{ name: '74', position: [1661.724, 1350.0], children: ['150'], label: '1' },
		{ name: '75', position: [1246.357, 1741.463], children: ['79', '74', '179'], label: '1' },
		{ name: '76', position: [1157.816, 1986.486], children: ['75', '77'], label: '1' },
		{ name: '77', position: [1247.939, 1866.667], children: ['79'], label: '1' },
		{ name: '78', position: [1090.045, 1737.931], children: ['79', '87'], label: '1' },
		{ name: '79', position: [1134.022, 1558.065], children: ['80'], label: '1' },
		{ name: '80', position: [1102.008, 1490.323], children: ['87', '81'], label: '1' },
		{ name: '81', position: [1419.285, 1225.0], children: ['180'], label: '1' },
		{ name: '84', position: [0.0, 2100.0], children: ['81'], label: '1' },
		{ name: '85', position: [0.0, 2100.0], children: ['90'], label: '1' },
		{ name: '86', position: [1051.668, 1354.839], children: ['90', '180'], label: '1' },
		{ name: '87', position: [1074.63, 1422.581], children: ['86'], label: '1' },
		{ name: '88', position: [0.0, 2100.0], children: ['89'], label: '1' },
		{ name: '89', position: [1252.861, 1680.0], children: ['90'], label: '1' },
		{ name: '90', position: [1032.95, 1287.097], children: ['94'], label: '1' },
		{ name: '92', position: [825.285, 1400.0], children: ['90'], label: '1' },
		{ name: '94', position: [1018.341, 1219.355], children: ['95'], label: '1' },
		{ name: '95', position: [1007.74, 1151.613], children: ['96', '97'], label: '1' },
		{ name: '96', position: [1236.985, 933.333], children: ['98'], label: '1' },
		{ name: '97', position: [1001.077, 1083.871], children: ['100'], label: '1' },
		{ name: '98', position: [1238.246, 855.556], children: ['99'], label: '1' },
		{ name: '99', position: [1241.377, 777.778], children: ['277'], label: '1' },
		{ name: '100', position: [998.307, 1016.129], children: ['99', '107'], label: '1' },
		{ name: '101', position: [1017.671, 1890.0], children: ['181'], label: '1' },
		{ name: '102', position: [938.606, 1750.0], children: ['103'], label: '1' },
		{ name: '103', position: [906.8, 1680.0], children: ['105', '104'], label: '1' },
		{ name: '104', position: [879.758, 1610.0], children: ['106', '105'], label: '1' },
		{ name: '105', position: [857.265, 1540.0], children: ['106'], label: '1' },
		{ name: '106', position: [839.151, 1470.0], children: ['92'], label: '1' },
		{ name: '107', position: [999.413, 948.387], children: ['108', '109'], label: '1' },
		{ name: '108', position: [1253.264, 622.222], children: ['110'], label: '1' },
		{ name: '109', position: [1004.401, 880.645], children: ['145', '124'], label: '1' },
		{ name: '110', position: [1262.033, 544.444], children: ['292', '183'], label: '1' },
		{ name: '111', position: [1285.275, 388.889], children: ['113'], label: '1' },
		{ name: '112', position: [1400.087, 484.615], children: ['111'], label: '1' },
		{ name: '113', position: [1239.709, 270.968], children: ['194'], label: '1' },
		{ name: '114', position: [1194.347, 338.71], children: ['113'], label: '1' },
		{ name: '115', position: [1043.122, 677.419], children: ['117', '116'], label: '1' },
		{ name: '116', position: [1064.244, 609.677], children: ['118'], label: '1' },
		{ name: '117', position: [1447.135, 450.0], children: ['114'], label: '1' },
		{ name: '118', position: [1089.702, 541.935], children: ['119', '120'], label: '1' },
		{ name: '119', position: [1154.473, 406.452], children: ['114'], label: '1' },
		{ name: '120', position: [1119.696, 474.194], children: ['119'], label: '1' },
		{ name: '121', position: [1379.241, 200.0], children: ['146', '194'], label: '1' },
		{ name: '122', position: [1418.928, 250.0], children: ['121'], label: '1' },
		{ name: '123', position: [1026.182, 745.161], children: ['115', '183'], label: '1' },
		{ name: '124', position: [1295.891, 622.222], children: ['125'], label: '1' },
		{ name: '125', position: [1488.662, 350.0], children: ['182'], label: '1' },
		{ name: '126', position: [0.0, 2100.0], children: ['124', '127'], label: '1' },
		{ name: '127', position: [0.0, 2100.0], children: ['129'], label: '1' },
		{ name: '129', position: [0.0, 2100.0], children: ['135'], label: '1' },
		{ name: '132', position: [0.0, 2100.0], children: ['141'], label: '1' },
		{ name: '135', position: [0.0, 2100.0], children: ['138'], label: '1' },
		{ name: '136', position: [0.0, 2100.0], children: ['132'], label: '1' },
		{ name: '138', position: [0.0, 2100.0], children: ['140'], label: '1' },
		{ name: '139', position: [0.0, 2100.0], children: ['136'], label: '1' },
		{ name: '140', position: [0.0, 2100.0], children: ['139'], label: '1' },
		{ name: '141', position: [1546.816, 450.0], children: ['201'], label: '1' },
		{ name: '142', position: [1571.92, 500.0], children: ['141'], label: '1' },
		{ name: '144', position: [1689.345, 1200.0], children: ['152'], label: '1' },
		{ name: '145', position: [1013.304, 812.903], children: ['123'], label: '1' },
		{ name: '146', position: [1682.223, 1250.0], children: ['144'], label: '1' },
		{ name: '147', position: [1687.761, 1150.0], children: ['200'], label: '1' },
		{ name: '148', position: [1680.481, 1200.0], children: ['204', '147'], label: '1' },
		{ name: '149', position: [1675.577, 1250.0], children: ['148', '147'], label: '1' },
		{ name: '150', position: [1673.027, 1300.0], children: ['146', '149'], label: '1' },
		{ name: '151', position: [1698.462, 1050.0], children: ['153'], label: '1' },
		{ name: '152', position: [1694.415, 1150.0], children: ['157', '200'], label: '1' },
		{ name: '153', position: [1697.451, 1000.0], children: ['156', '158'], label: '1' },
		{ name: '156', position: [1694.415, 950.0], children: ['160'], label: '1' },
		{ name: '157', position: [1626.958, 994.737], children: ['159', '163'], label: '1' },
		{ name: '158', position: [1547.235, 540.0], children: ['201'], label: '1' },
		{ name: '159', position: [1682.223, 850.0], children: ['198', '158'], label: '1' },
		{ name: '160', position: [1689.345, 900.0], children: ['161', '159'], label: '1' },
		{ name: '161', position: [0.0, 819.512], children: ['162'], label: '1' },
		{ name: '162', position: [1573.086, 768.293], children: ['166', '165'], label: '1' },
		{ name: '163', position: [1600.407, 908.108], children: ['162', '164'], label: '1' },
		{ name: '164', position: [1663.562, 851.351], children: ['165', '171'], label: '1' },
		{ name: '165', position: [1567.712, 717.073], children: ['172', '173'], label: '1' },
		{ name: '166', position: [1632.634, 650.0], children: ['167'], label: '1' },
		{ name: '167', position: [1614.742, 600.0], children: ['170'], label: '1' },
		{ name: '168', position: [1648.276, 700.0], children: ['166', '167'], label: '1' },
		{ name: '169', position: [1661.724, 750.0], children: ['171', '168'], label: '1' },
		{ name: '170', position: [1594.531, 550.0], children: ['142'], label: '1' },
		{ name: '171', position: [1616.416, 630.0], children: ['170'], label: '1' },
		{ name: '172', position: [1566.18, 563.415], children: ['142'], label: '1' },
		{ name: '173', position: [1564.776, 665.854], children: ['208'], label: '1' },
		{ name: '174', position: [1065.701, 1960.0], children: ['101'], label: '1' },
		{ name: '175', position: [1920.0, 2030.0], children: ['174'], label: '1' },
		{ name: '179', position: [1544.003, 1650.0], children: ['68'], label: '1' },
		{ name: '180', position: [1287.848, 1092.0], children: ['96'], label: '1' },
		{ name: '181', position: [975.45, 1820.0], children: ['89', '102'], label: '1' },
		{ name: '182', position: [1455.329, 300.0], children: ['183', '122'], label: '1' },
		{ name: '183', position: [0.0, 2100.0], children: [], label: '1' },
		{ name: '184', position: [1000.701, 350.0], children: ['185', '186'], label: '1' },
		{ name: '185', position: [1212.451, 180.0], children: ['189'], label: '1' },
		{ name: '186', position: [1117.371, 182.609], children: ['187'], label: '1' },
		{ name: '187', position: [1237.593, 50.0], children: ['188'], label: '1' },
		{ name: '188', position: [1181.538, 0.0], children: [], label: '1' },
		{ name: '189', position: [1288.924, 100.0], children: ['187'], label: '1' },
		{ name: '190', position: [822.461, 1115.625], children: ['33', '191'], label: '1' },
		{ name: '191', position: [854.688, 700.0], children: ['30'], label: '1' },
		{ name: '192', position: [877.248, 1380.0], children: ['24'], label: '1' },
		{ name: '193', position: [1116.12, 300.0], children: ['53'], label: '1' },
		{ name: '194', position: [1336.011, 150.0], children: ['204', '189'], label: '1' },
		{ name: '195', position: [1215.154, 700.0], children: ['124'], label: '1' },
		{ name: '198', position: [1673.027, 800.0], children: ['169'], label: '1' },
		{ name: '200', position: [1697.451, 1100.0], children: ['151'], label: '1' },
		{ name: '201', position: [1519.106, 400.0], children: ['125'], label: '1' },
		{ name: '204', position: [0.0, 2100.0], children: [], label: '1' },
		{ name: '208', position: [1564.266, 614.634], children: ['172'], label: '1' },
		{ name: '277', position: [1246.381, 700.0], children: ['108', '293'], label: '1' },
		{ name: '283', position: [1005.835, 480.0], children: ['44'], label: '1' },
		{ name: '284', position: [976.987, 540.0], children: ['283'], label: '1' },
		{ name: '285', position: [951.746, 600.0], children: ['284'], label: '1' },
		{ name: '292', position: [1272.7, 466.667], children: ['111'], label: '1' },
		{ name: '293', position: [1411.532, 565.385], children: ['112', '292'], label: '1' },
	]
	const getNodeStyle = (item) => {
		return {
			left: item.position[0] + 'px',
			top: item.position[1] + 'px',
		}
	}

	const lines = ref([])
	const initNode = () => {
		for (let i = 0; i < nodeList.length; i++) {
			const data = nodeList[i]
			const startElement = document.getElementById(data.name)
			for (let j = 0; j < data.children.length; j++) {
				const endElement = document.getElementById(data.children[j])
				let ILine = new LeaderLine(startElement, endElement, {
					color: '#00FF00',
					size: 2,
					dash: { animation: true },
					path: 'magnet',
				})
				ILine.position()
				lines.value.push({
					name: data.name,
					line: ILine,
					childrenName: data.children[j],
				})
			}
		}
	}
	const cancel = () => {
		for (let i = 0; i < lines.value.length; i++) {
			lines.value[i]?.line.remove()
		}
	}
	onMounted(() => {
		cancel()
		nextTick(() => {
			initNode()
		})
	})
	onBeforeUnmount(() => {
		cancel()
	})
	const nodeMouseDown = (ev) => {
		const el = ev.target
		// 鼠标按下的位置
		const mouseXStart = ev.clientX
		const mouseYStart = ev.clientY
		// 当前滑块位置
		const rectLeft = el.offsetLeft
		const rectTop = el.offsetTop

		document.onmousemove = (e) => {
			// 鼠标移动的位置
			const mouseXEnd = e.clientX
			const mouseYEnd = e.clientY
			const moveX = mouseXEnd - mouseXStart + rectLeft
			const moveY = mouseYEnd - mouseYStart + rectTop
			el.style['top'] = moveY + 'px'
			el.style['left'] = moveX + 'px'

			const data = lines.value.filter((i) => {
				return i.name === el.id || i.childrenName === el.id
			})
			for (let i = 0; i < data.length; i++) {
				data[i].line.position()
			}
		}
		document.onmouseup = () => {
			// 取消事件
			document.onmousemove = null
		}
	}
</script>

<template>
	<div class="fullDom">
		<template v-for="item in nodeList">
			<div @mousedown="nodeMouseDown" :id="item.name" class="nodeSty" :style="getNodeStyle(item)">
				{{ item.name }}
			</div>
		</template>
	</div>
</template>

<style scoped>
	.nodeSty {
		position: absolute;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: aqua;
		color: black;
		text-align: center;
		line-height: 20px;
		cursor: pointer;
		user-select: none;
	}
</style>
