<script setup>
	import ModelGltf from '../VueThree/model-gltf.vue'
	import useThree from '../../hooks/useThree'
	import { nextTick, onMounted, ref } from 'vue'
	import useThreeExport from '@/components/VueThree/hooks/useThreeExport'
	import ModelFbx from '@/components/VueThree/model-fbx.vue'
	import ModelEdit from '@/components/VueThree/ModelEdit/index.vue'

	const {
		indoorFileUrl,
		otherThreeMod,
		cameraPosition,
		controlsOptions,
		lights,
		homeModelVisible,
		onLoad,
		onModel,
		onClick,
		dblclick,
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
		firePositions,
		addFires,
	} = useThree()
	//   标签对象
	const nameList = ref([
		{
			id: '1',
			point: {
				x: -386.5555594339803,
				y: 843.4908880210869,
				z: -171.41907139374862,
			},
			label: '测试',
		},
	])
	const isReady = ref(false)
	function readyCamera() {
		isReady.value = true
		nextTick(() => {
			// createdLabelList(nameList.value)
			// createdMoveModelPoints('118', {
			// 	x: -474.60878617819026,
			// 	y: 842.415745830447,
			// 	z: -288.7609153335314,
			// })
		})
	}
	function labelClick() {}
</script>

<template>
	<div class="fullDom iModel">
		<!--		<model-gltf-->
		<!--			ref="homeModelVisible"-->
		<!--			:src="indoorFileUrl"-->
		<!--			:other-three-mod="otherThreeMod"-->
		<!--			:cameraPosition="cameraPosition"-->
		<!--			:lights="lights"-->
		<!--			:camera-size="10"-->
		<!--			:backgroundAlpha="0"-->
		<!--			:controlsOptions="controlsOptions"-->
		<!--			:choose-group="true"-->
		<!--			@load="onLoad"-->
		<!--			@onModel="onModel"-->
		<!--			@click="onClick"-->
		<!--			@dblclick="dblclick"-->
		<!--			@ready-camera="readyCamera"-->
		<!--		></model-gltf>-->
		<model-edit
			ref="homeModelVisible"
			:src="indoorFileUrl"
			:other-three-mod="otherThreeMod"
			:cameraPosition="cameraPosition"
			:lights="lights"
			:camera-size="10"
			:backgroundAlpha="0"
			:controlsOptions="controlsOptions"
			node-color="6dca7a"
			@load="onLoad"
			@onModel="onModel"
			@click="onClick"
			@dblclick="dblclick"
			@ready-camera="readyCamera"
		>
			<template #label>
				<!--				<div :id="i.id" class="nameLabel" v-for="i in nameList">-->
				<!--					<span @click="labelClick">{{ i.label }}</span>-->
				<!--				</div>-->
			</template>
		</model-edit>
	</div>
</template>

<style lang="scss" scoped>
	.iModel {
		background-image: url('../../assets/image/overall.png');
		background-size: 100% 100%;
	}

	.nameLabel {
		position: absolute;
		width: max-content;
		height: vh(120);
		padding: 0 vw(20);
		background-image: url('../../assets/image/titile_xd.png');
		background-size: 100% 100%;
		top: vh(-60);

		span {
			width: 100%;
			margin-left: vw(50);
			color: #ffffff;
			font-size: vh(22);
			line-height: vh(45);
			cursor: pointer;
			pointer-events: auto;
		}
	}
</style>
