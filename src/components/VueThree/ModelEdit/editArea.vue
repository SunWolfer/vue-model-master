<script setup lang="ts">
	import { ref, reactive, defineEmits } from 'vue'

	const btnList = reactive([
		{
			name: '新增',
			operate: 'isRedact',
			className: 'addBtn',
		},
		{
			name: '删除',
			operate: 'isRemove',
			className: 'deleteBtn',
		},
		{
			name: '风流',
			operate: 'isWind',
			className: 'windBtn',
		},
		{
			name: '风量',
			operate: 'isFlow',
			className: 'flowBtn',
		},
		{
			name: '风门',
			operate: 'addDoor',
			className: 'doorBtn',
		},
		{
			name: '风窗',
			operate: 'addWindow',
			className: 'windowBtn',
		},
		{
			name: '传感器',
			operate: 'addSensor',
			className: 'sensorBtn',
		},
		{
			name: '移动',
			operate: 'isTSControl',
			className: 'pointMove',
		},
	])
	const pitchName = ref('')

	const emit = defineEmits(['optBtn', 'save-model'])

	function pitchBtn(pitch: string) {
		pitchName.value = pitchName.value == pitch ? '' : pitch
		emit('optBtn', pitchName.value)
	}
	function saveModel() {
		emit('save-model')
	}
</script>

<template>
	<div class="externalArea">
		<div
			v-for="(i, index) in btnList"
			:key="index"
			@click="pitchBtn(i.operate)"
			:class="pitchName === i.operate ? i.className + 'Pitch' : i.className"
		></div>
		<div @click="saveModel" class="saveBtn"></div>
	</div>
</template>

<style lang="scss" scoped>
	@import '../scss/edit.scss';
</style>
