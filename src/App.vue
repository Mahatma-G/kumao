<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
	const Store = require('electron-store');
	const store_ = new Store();
	export default {
		created() {
			if (store_.get('store')) {
				//this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(store_.get('store'))))
			}
			window.addEventListener('beforeunload', () => {
				//store_.set('store', JSON.stringify(this.$store.state))
			})
		}
	}

	// 禁用Ctrl+r刷新
	window.onkeydown = function(e) {
		var ev = window.event || e;
		var code = ev.keyCode || ev.which;
		if (code == 82 && (ev.metaKey || ev.ctrlKey)) {
			return true;
		}
	}
</script>

<style>
	body,
	html {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		background: #fffefa;
		-webkit-user-select: none;
	}

	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}

	#nav {
		padding: 30px;
	}

	#nav a {
		font-weight: bold;
		color: #2c3e50;
	}

	#nav a.router-link-exact-active {
		color: #42b983;
	}
</style>
