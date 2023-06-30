<script setup>
	import LoadModel from './components/LoadModel/index.vue'
	import NodeLine from './components/NodeLine/index.vue'
</script>

<template>
	<load-model />
</template>

<style>
	body {
		height: 100%;
		margin: 0;
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
		font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial,
			sans-serif;
	}

	label {
		font-weight: 700;
	}

	html {
		height: 100%;
		box-sizing: border-box;
	}

	#app {
		height: 100%;
	}

	*,
	*:before,
	*:after {
		box-sizing: inherit;
	}
	.fullDom {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
