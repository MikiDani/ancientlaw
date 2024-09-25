export default class GaphicsClass {
	SCREEN_WIDTH;
	SCREEN_HEIGHT;
	map;
	menuElement;
	floorTexture;
	context;
	rays;
	screenColorize;
	checkDistance;
	poisonModValue;
	poisonModScale;
	blockMask;
	imgBgPapirus;
	cloudAngleTimeAction;
	minDistance;

	constructor ({soundClass: soundClass, mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check, poisonModValue: poisonModValue, movingForward: movingForward, gameMenu: gameMenu, gamePlayValues: gamePlayValues, windowScreenOrientation: windowScreenOrientation})
	{
		this.isMobile = this.mobileCheck()
		this.windowScreenOrientation = windowScreenOrientation
		this.fullscreenSwitch = false
		this.soundClass = soundClass
		this.texturesClass = texturesClass
		this.spritesClass = spritesClass
		this.mapDataClass = mapDataClass
		this.poisonModValue = poisonModValue
		this.movingForward = movingForward
		this.menu = menu
		this.gameMenu = gameMenu
		this.gamePlayValues = gamePlayValues
		this.blockMask = []
		this.orientationLicense = false
		this.cloudAngleTimeCount = 0
		this.cheat = false
		this.mobilLeftButtons = ['exit', 'map', 'up', 'fire', 'down', 'open']
		this.mobilRightButtons = ['slowLeft','slowRight', 'left', 'right', 'strafeLeft', 'strafeRight']
		//----------------------------------------------
		this.GR_DESKTOP = [5, 6, 8]
		this.GR_MOBIL = [6, 8, 10]

		this.CELL_SIZE = CELL_SIZE
		this.WALKINTERVAL = -4
		this.FOV = this.toRadians(60)
		this.MINIMAP_SCALE = 0.6
		this.MINIMAP_X = 100
		this.MINIMAP_Y = 50
		this.PLAYER_SIZE = Math.floor(CELL_SIZE / 4)
		this.SPRITE_SIZE = 10
		//-----------------------------------------------
		this.map = []
		this.rays = []
		this.player = player
		this.menuElement = ""
		this.menu = menu
		this.gamePlay = gamePlay
		this.check = check
		this.poisonModValue = 60
		this.poisonModScale = 2
		this.colorCache = new Map()
		this.floorTexture = ['floor', 'floor1']
		this.context = null
		this.visibleContext = null

		this.screenColorize = {
			switch: false,
			color: null,
			alpha: null,
			time: null,
			action: null,
		}

		if (this.isMobile) {
			// MOBILE
			this.GRAPHICS_RATIO = 8
			this.menu.shadowsSwitch = false
			this.heightRatio = 600
			// turn off mobile zooming
			document.addEventListener('touchmove', event => event.scale != 1 && event.preventDefault(), { passive: false });
		} else {
			// DESKTOP
			this.GRAPHICS_RATIO = 5
			this.heightRatio = 1160
		}

		this.gameResize()
	}

	sizeCalculate(w1, h1, w2) {
		return ((w2 * h1) / w1);
	}

	gameResize() {
		this.SCREEN_WIDTH = window.innerWidth
		this.SCREEN_HEIGHT = window.innerHeight

		if (this.isMobile || window.innerWidth < 1105) {
			// 640 x 319 | 320 x 159
			this.GAME_WIDTH = 640
			this.GAME_HEIGHT = 319
			this.spritesClass.lookDistance = 15
			this.menu.navigationSwitch = true
		} else {
			this.GAME_WIDTH = 1000
			this.GAME_HEIGHT = 500
		}

		this.VISIBLE_GAME_WIDTH = (window.innerWidth < 730) ? 730 : window.innerWidth;
		this.VISIBLE_GAME_HEIGHT = this.sizeCalculate(this.GAME_WIDTH, this.GAME_HEIGHT, this.VISIBLE_GAME_WIDTH)

		this.SLIP_WIDTH = Math.floor(-(this.GAME_WIDTH/100) * 10)
		this.GAME_WIDTH3D = this.GAME_WIDTH + (2 * Math.abs(this.SLIP_WIDTH))
		this.NUMBER_OF_RAYS = Math.floor(this.GAME_WIDTH3D / this.GRAPHICS_RATIO)
		this.GRID_SIZE = Math.floor(this.GAME_WIDTH3D / this.NUMBER_OF_RAYS)

		if (this.isMobile && this.SCREEN_WIDTH < this.SCREEN_HEIGHT) {
			this.orientationLicense = false
			clearInterval(this.gamePlay.game)
			this.gamePlay.game = null
			this.landscapeOrientationMessage()
		} else {
			this.orientationLicense = true
			this.makeScreen()
			if (this.texturesClass.cloudTexture) this.insertClouds()
			this.checkPlayerObjects()
			let gamePlayValues = this.gamePlayValues()
			this.makeMenu(gamePlayValues.gameLoaded)
		}
	}

	clearContainer() {
		$(document).find('#container').remove()
		let container = document.createElement('div')
		container.setAttribute('id', 'container')
		container.setAttribute('class', 'container-bg')
		container.style.width = '100vw'
		container.style.height = '100vh'
		document.body.appendChild(container)
		return container;
	}

	landscapeOrientationMessage() {
		let container = this.clearContainer()
		let portraitMessageContainer = document.createElement("div");
		portraitMessageContainer.setAttribute('id', 'portrait-message-container');
		portraitMessageContainer.style.display = 'block';
		portraitMessageContainer.style.position = 'absolute';
		portraitMessageContainer.style.top = '0px';
		portraitMessageContainer.style.left = '0px';
		portraitMessageContainer.style.width = '100vw';
		portraitMessageContainer.style.height = '100vh';
		portraitMessageContainer.style.margin = '0px';
		portraitMessageContainer.style.padding = '0px';
		portraitMessageContainer.style.zIndex = '100';
		portraitMessageContainer.style.backgroundColor = '#000000';
		container.appendChild(portraitMessageContainer);

		let portraitMessage = document.createElement("div");
		portraitMessage.setAttribute('id', 'portrait-message-container');
		portraitMessage.style.display = 'flex';
		portraitMessage.style.justifyContent = 'center';
		portraitMessage.style.alignItems = 'center';
		portraitMessage.style.width = '100vw';
		portraitMessage.style.height = '100vh';
		portraitMessage.style.margin = '0px';
		portraitMessage.style.padding = '0px';
		portraitMessage.style.fontSize = '13px';
		portraitMessage.style.color = 'white';
		portraitMessage.style.backgroundColor = '#000000';
		portraitMessage.textContent = 'This game is only playable in landscape orientation.';
		portraitMessageContainer.appendChild(portraitMessage);
	}

	checkPlayerObjects() {
		$("#silver-key").removeClass("silver-key-on")
		$("#gold-key").removeClass("gold-key-on")

		$("#healt-percentage").html(this.player.energy + '%')
		if (this.player.adoptedWeapons.weapon2) $("#weapon2").addClass("weapon2-on")
		if (this.player.adoptedWeapons.weapon3) $("#weapon3").addClass("weapon3-on")
		if (this.player.adoptedWeapons.weapon4) $("#weapon4").addClass("weapon4-on")
		if (this.player.speedModes.actSpeedLevel>0) $("#val1").addClass("val1-on")
		if (this.player.speedModes.actSpeedLevel>1) $("#val2").addClass("val2-on")
		if (this.player.speedModes.actSpeedLevel>2) $("#val3").addClass("val3-on")
		if (this.player.speedModes.actSpeedLevel>3) $("#val4").addClass("val4-on")
		if (this.player.speedModes.actSpeedLevel>4) $("#val5").addClass("val5-on")
		if (this.player.key1) $("#silver-key").addClass("silver-key-on")
		if (this.player.key2) $("#gold-key").addClass("gold-key-on")
		$("#ammo-star-text").html(this.player.ammoStar)
		$("#ammo-fire-text").html(this.player.ammoFire)
		$("#coin-gold-text").html(this.player.goldScore)
		$("#coin-silver-text").html(this.player.silverScore)
		$("#coin-copper-text").html(this.player.copperScore)
	}

	clrScr() {
		this.context.fillStyle = 'black'
		this.context.fillRect(this.SLIP_WIDTH, 0, this.VISIBLE_GAME_WIDTH, this.VISIBLE_GAME_HEIGHT)
		this.renderVisibleScreen()
	}

	screenColorizeAction() {
		if (this.screenColorize.switch) {
        	this.context.fillStyle = `rgba(${this.screenColorize.color}, ${this.screenColorize.alpha})`
			this.context.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
		}
	}
	
	screenColorizeOptions(colorizeOption) {
		if (!this.screenColorize.switch) {
			this.screenColorize.switch = true
			this.screenColorize.color = colorizeOption.color
			this.screenColorize.alpha = colorizeOption.alpha
			this.screenColorize.action = setInterval(() => {
				this.screenColorize.switch = false
				this.screenColorize.color = null
				this.screenColorize.alpha = null
				clearInterval(this.screenColorize.action)
			}, colorizeOption.time);
		}
	}

	async makeScreen() {
		let container = this.clearContainer()

		let imgContainer = document.createElement("div")
		imgContainer.setAttribute('id', 'img-container')
		imgContainer.style.display = 'none'
		container.append(imgContainer)
		
		let imgBgPapirus = document.createElement("img")
		imgBgPapirus.setAttribute("id", "bg-papirus")
		imgBgPapirus.setAttribute("src", "./img/menu/bg-papirus.png")
		imgContainer.append(imgBgPapirus)

		let loading = document.createElement("div")
		loading.setAttribute('id', 'loading')
		loading.style.display = 'none'
		loading.style.width = '232px'
		loading.style.height = '62px'
		loading.style.textAlign = 'center'
		loading.style.margin = '0 auto'
		loading.style.paddingTop = '19px'
		loading.textContent = 'Loading'
		loading.classList.add("loading-box")
		container.appendChild(loading)

		let loadingDots = document.createElement("div")
		loadingDots.setAttribute('class', 'loading-dots')
		loading.appendChild(loadingDots)

		this.menuElement = document.createElement("div")
		this.menuElement.style.width = this.GAME_WIDTH + 'px'
		this.menuElement.style.height = this.GAME_HEIGHT + 'px'

		this.menuElement.style.display='block'
		this.menuElement.setAttribute('id', 'menu-bg')
		this.menuElement.setAttribute('margin', '0 auto')
		this.menuElement.style.margin = '0 auto'
		container.appendChild(this.menuElement)

		let canvasContainer = document.createElement("div")
		canvasContainer.setAttribute('id', 'canvas-container')
		canvasContainer.style.display='none'
		canvasContainer.setAttribute('width', this.GAME_WIDTH)
		canvasContainer.setAttribute('height', this.GAME_HEIGHT)
		canvasContainer.style.display='none'
		canvasContainer.style.position='relative'
		container.appendChild(canvasContainer)

		let infoBar = document.createElement("div")
		infoBar.setAttribute('id', 'info-bar')
		infoBar.style.display = 'block'
		infoBar.style.position = 'absolute'
		infoBar.style.width = this.VISIBLE_GAME_WIDTH + 'px'
		infoBar.style.height = '64px'
		infoBar.style.margin = '0px'
		infoBar.style.padding = '0px'
		if (this.menu.navigationSwitch) infoBar.style.top = '5px';
		else infoBar.style.bottom = '5px';
		infoBar.style.marginBottom = '5px'
		// infoBar.style.backgroundColor = 'green'
		canvasContainer.appendChild(infoBar)

		let health = document.createElement("div")
		health.setAttribute('id', 'health-container')
		health.style.position = 'relative'
		health.style.display = 'block'
		health.style.marginLeft = '35px'
		health.style.float = 'left'
		health.style.width = '250px'
		health.style.height = '64px'
		// infoBar.style.backgroundColor = 'yellow'
		infoBar.append(health)
		
		let healtPercentage = document.createElement("div")
		healtPercentage.setAttribute('id', 'healt-percentage')
		healtPercentage.innerHTML='100%'
		health.append(healtPercentage)

		let speedContainer = document.createElement("div")
		speedContainer.setAttribute('id', 'speed-container')
		speedContainer.style.position = 'absolute'
		speedContainer.style.left = '-30px'
		speedContainer.style.width = '30px'
		speedContainer.style.height = '64px'
		speedContainer.style.top = '0'
		health.append(speedContainer)

		let val4 = document.createElement("div")
		val4.setAttribute('id', 'val4')
		speedContainer.append(val4)
		let val3 = document.createElement("div")
		val3.setAttribute('id', 'val3')
		speedContainer.append(val3)
		let val2 = document.createElement("div")
		val2.setAttribute('id', 'val2')
		speedContainer.append(val2)
		let val1 = document.createElement("div")
		val1.setAttribute('id', 'val1')
		speedContainer.append(val1)

		let coinGold = document.createElement("div")
		coinGold.setAttribute('id', 'coin-gold')
		health.append(coinGold)
		let coinSilver = document.createElement("div")
		coinSilver.setAttribute('id', 'coin-silver')
		health.append(coinSilver)
		let coinCopper = document.createElement("div")
		coinCopper.setAttribute('id', 'coin-copper')
		health.append(coinCopper)
		let coinGoldText = document.createElement("div")
		coinGoldText.setAttribute('id', 'coin-gold-text')
		coinGoldText.innerHTML='0'
		health.append(coinGoldText)
		let coinSilverText = document.createElement("div")
		coinSilverText.setAttribute('id', 'coin-silver-text')
		coinSilverText.innerHTML='0'
		health.append(coinSilverText)
		let coinCopperText = document.createElement("div")
		coinCopperText.setAttribute('id', 'coin-copper-text')
		coinCopperText.innerHTML='0'
		health.append(coinCopperText)

		let weapons = document.createElement("div")
		weapons.setAttribute('id', 'weapons-container')
		weapons.style.position = 'relative'
		weapons.style.display = 'block'
		weapons.style.float = 'right'
		weapons.style.width = '378px'
		weapons.style.marginRight = '5px'
		weapons.style.height = '64px'
		// weapons.style.backgroundColor = 'red'
		infoBar.append(weapons)

		let goldKey = document.createElement("div")
		goldKey.setAttribute('id', 'gold-key')
		weapons.append(goldKey)
		let silverKey = document.createElement("div")
		silverKey.setAttribute('id', 'silver-key')
		weapons.append(silverKey)
		let ammoStarText = document.createElement("div")
		ammoStarText.setAttribute('id', 'ammo-star-text')
		ammoStarText.innerText = this.player.ammoStar
		weapons.append(ammoStarText)
		let ammoFireText = document.createElement("div")
		ammoFireText.setAttribute('id', 'ammo-fire-text')
		ammoFireText.innerText = this.player.ammoFire
		weapons.append(ammoFireText)
		let ammoStar = document.createElement("div")
		ammoStar.setAttribute('id', 'ammo-star')
		weapons.append(ammoStar)
		let ammoFire = document.createElement("div")
		ammoFire.setAttribute('id', 'ammo-fire')
		weapons.append(ammoFire)
		let weapon1 = document.createElement("div")
		weapon1.setAttribute('id', 'weapon1')
		weapons.append(weapon1)
		let weapon2 = document.createElement("div")
		weapon2.setAttribute('id', 'weapon2')
		weapons.append(weapon2)
		let weapon3 = document.createElement("div")
		weapon3.setAttribute('id', 'weapon3')
		weapons.append(weapon3)
		let weapon4 = document.createElement("div")
		weapon4.setAttribute('id', 'weapon4')
		weapons.append(weapon4)

		let leftNavigationContainer = document.createElement("div")
		leftNavigationContainer.setAttribute('id', 'left-navigation-container')
		leftNavigationContainer.style.display = 'none'
		leftNavigationContainer.style.gridTemplateColumns = 'auto auto'
		leftNavigationContainer.style.gap = '10px 10px'
		leftNavigationContainer.style.position = 'absolute'
		leftNavigationContainer.style.width = 'auto'
		leftNavigationContainer.style.height = 'auto'
		leftNavigationContainer.style.margin = '0px'
		leftNavigationContainer.style.padding = '0px'
		leftNavigationContainer.style.bottom = '5px'
		leftNavigationContainer.style.left = '5px'
		leftNavigationContainer.style.bottom = '15px'
		// if (!this.isMobile) leftNavigationContainer.style.bottom = '80px'
		leftNavigationContainer.style.display = 'grid';
		// leftNavigationContainer.style.backgroundColor = '#00ff0077'
		canvasContainer.appendChild(leftNavigationContainer)

		let rightNavigationContainer = document.createElement("div")
		rightNavigationContainer.setAttribute('id', 'right-navigation-container')
		rightNavigationContainer.style.display = 'none'
		rightNavigationContainer.style.gridTemplateColumns = 'auto auto'
		rightNavigationContainer.style.gap = '10px 10px'
		rightNavigationContainer.style.position = 'absolute'
		rightNavigationContainer.style.width = 'auto'
		rightNavigationContainer.style.height = 'auto'
		rightNavigationContainer.style.margin = '0px'
		rightNavigationContainer.style.padding = '0px'
		rightNavigationContainer.style.bottom = '5px'
		rightNavigationContainer.style.right = '5px'
		rightNavigationContainer.style.bottom = '15px'
		//if (!this.isMobile) rightNavigationContainer.style.bottom = '80px'
		rightNavigationContainer.style.display = 'grid';
		// rightNavigationContainer.style.backgroundColor = '#00ffff77'
		canvasContainer.appendChild(rightNavigationContainer)

		this.canvas = document.createElement("canvas")
		this.canvas.setAttribute('id', 'canvas')
		this.canvas.setAttribute('width', this.GAME_WIDTH)
		this.canvas.setAttribute('height', this.GAME_HEIGHT)
		this.canvas.style.display='none'
		// canvasContainer.appendChild(this.canvas)
		// nem adom a dom-hoz
		this.context = this.canvas.getContext('2d')
		this.context.imageSmoothingEnabled = false

		this.visibleCanvas = document.createElement("canvas")
		this.visibleCanvas.setAttribute('id', 'canvas')
		this.visibleCanvas.setAttribute('width', this.VISIBLE_GAME_WIDTH)
		this.visibleCanvas.setAttribute('height', this.VISIBLE_GAME_HEIGHT)
		canvasContainer.appendChild(this.visibleCanvas)
		this.visibleContext = this.visibleCanvas.getContext('2d')
		this.visibleContext.imageSmoothingEnabled = false

		let scrollXpos = (this.VISIBLE_GAME_WIDTH / 2) - 375
		let scrollInfoBox = document.createElement("div")
		scrollInfoBox.setAttribute('id', 'scroll-info-box')
		scrollInfoBox.setAttribute('width', '750px')
		scrollInfoBox.style.position='absolute'
		scrollInfoBox.style.left= scrollXpos + 'px'

		let scrollInfoBoxTop = document.createElement("div")
		scrollInfoBoxTop.setAttribute('id', 'scroll-info-box-top')
		scrollInfoBoxTop.classList.add('scroll-info-box-top')
		scrollInfoBox.appendChild(scrollInfoBoxTop)
		
		let scrollInfoBoxContent = document.createElement("div")
		scrollInfoBoxContent.setAttribute('id', 'scroll-info-box-content')
		scrollInfoBoxContent.classList.add('scroll-info-box-content')
		scrollInfoBoxContent.style.position='relative'
		scrollInfoBox.appendChild(scrollInfoBoxContent)
		
		let scrollInfoBoxContentText = document.createElement("div")
		scrollInfoBoxContentText.setAttribute('id', 'scroll-info-box-content-text')
		scrollInfoBoxContent.appendChild(scrollInfoBoxContentText)
		
		let scrollInfoBoxBottom = document.createElement("div")
		scrollInfoBoxBottom.style.position='absolute'
		scrollInfoBoxBottom.style.bottom='-28px'
		scrollInfoBoxBottom.style.left='0px'
		scrollInfoBoxBottom.classList.add('scroll-info-box-bottom')
		scrollInfoBoxBottom.setAttribute('id', 'scroll-info-box-bottom')
		scrollInfoBoxContent.appendChild(scrollInfoBoxBottom)

		canvasContainer.appendChild(scrollInfoBox)
		scrollInfoBox.style.display='none'

		this.mobilLeftButtons.forEach(button => {
			$('#left-navigation-container').append(`<div class="mobil-button mobil-${button}"></div>`)
		});
		this.mobilRightButtons.forEach(button => {
			$('#right-navigation-container').append(`<div class="mobil-button mobil-${button}"></div>`)
		});

		// WEAPONS TEXTURES
		const response = await fetch('./data/weapons/weapon_player.JSON');
		const playerWeaponData = await response.json();
		this.texturesClass.playerWeaponsTextures = {}
		Object.entries(playerWeaponData).forEach(([weapon, value]) => {
			value.forEach(item => {
				Object.entries(item).forEach(([dirName, imgList]) => {
					imgList.forEach(imgName => {
						let weaponImg = `<img id="${imgName}" src="${dirName}${imgName}.png">`;
						$('#img-container').append(weaponImg)
						if (!this.texturesClass.playerWeaponsTextures[weapon]) this.texturesClass.playerWeaponsTextures[weapon] = [];
						this.texturesClass.playerWeaponsTextures[weapon].push(imgName)
					});
				});
			});
		});
	}

	insertClouds() {
		$('#img-container').append('<img id="clouds" src="./img/skys/skys1/clouds.png" alt="clouds">')
	}

	changeWeapon(weapon) {
		if (typeof this.player.adoptedWeapons['weapon' + weapon] !== 'undefined' && this.player.adoptedWeapons['weapon' + weapon] == true) {
			this.player.weapon = weapon
		}
	}

	makeMenu(gameLoaded) {
		$("#menu-bg").html('')
		let menuElementContent = `
			<div id="menu-logo"><img src="./img/menu/menu-logo.png" alt="The Ancient Law" class="logo-position" style="display:block;"/></div>
			<div id="menu-box" class="mx-auto col-4">`;
				if (this.menu.infoActive) {
					// INFORMATION
					menuElementContent += `
					<div id="menu-information-back" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector-back d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">
							<span>Back</span>
						</div>
					</div>
					<div id="menu-information-div" class="row p-0 m-0 text-center">
						<label>Keymap</label>
						<div class="col-7 p-0 m-0">
							<img src="./img/menu/keyboard.png" alt="keyboard" class="info-keyboard">
						</div>
						<div class="col-5 p-0 m-0 ps-2">
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle blue"></span>
								<span class="align-middle key-text">Movement keys</span>
							</div>
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle purple"></span>
								<span class="align-middle key-text">Aiming keys</span>
							</div>
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle orange"></span>
								<span class="align-middle key-text">Open keys</span>
							</div>
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle green key-text"></span>
								<span class="align-middle key-text">Strafe key + (A or D)</span>
							</div>
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle red"></span>
								<span class="align-middle key-text">Attack key</span>
							</div>
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle yellow"></span>
								<span class="align-middle key-text">Open/Close Map key</span>
							</div>
							<div class="text-start-arrow p-0 m-0">
								<span class="color-box align-middle deepblue"></span>
								<span class="align-middle key-text">Weapon keys:</span> 
								<div class="row p-0 m-0 ms-2 mt-2 align-middle key-text">
									<span class="wepon-span-box col-6 p-0 m-0">1. Knife</span>
									<span class="wepon-span-box col-6 p-0 m-0">2. Katana</span>
									<span class="wepon-span-box col-6 p-0 m-0">3. Shuriken</span>
									<span class="wepon-span-box col-6 p-0 m-0">4. Fire spear</span>
								</div> 
							</div>
						</div>
						<div class="text-start-links p-0 m-0">
							<div class="row p-0 m-0 d-flex jusify-content-center align-items-center">
								<div class="p-0 m-0">
									<div class="menu-info-text align-middle"><span class="title-width align-middle">Game Creator:</span>
								</div>
								<a href="mailto:tuccmann@gmail.com" class="p-0 m-0">
									<div class="tuccmann-logo"></div>
								</a>
							</div>
						</div>
						<div class="menu-info-text mb-2"><span class="title-width">Game Code:</span> <a href="https://github.com/MikiDani/ancientlaw" target="_blank">https://github.com</a></div>
					</div>
					`;
					} else if (this.menu.optionsActive) {
					// OPTIONS
					let graphicsratioSelected = function(value, GRAPHICS_RATIO) {
						if (value == GRAPHICS_RATIO) return 'selected';
						return '';
					}
					
					let shadowsSelected = (this.menu.shadowsSwitch) ? 'selected' : null;
					let skySelected = (this.menu.skySwitch) ? 'selected' : null;
					let floorSelected = (this.menu.floorSwitch) ? 'selected' : null;
					let navigationSelected = (this.menu.navigationSwitch) ? 'selected' : null;

					menuElementContent += `
					<div id="menu-options-back" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector-back d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">
							<span>Back</span>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-sensitivity" data-id="sensitivity-range" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>sensitivity:</span>
							<input type="range" id="sensitivity-range" name="sensitivity" data-variablename="sensitivity" value="${this.menu.sensitivity}" min="0" max="10">
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-soundvolume" data-id="soundvolume-range" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>sound:</span>
							<input type="range" id="soundvolume-range" name="soundvolume" data-variablename="soundVolume" value="${this.menu.soundVolume}" min="0" max="10">
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-musicvolume" data-id="musicvolume-range" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>music:</span>
							<input type="range" id="musicvolume-range" name="musicvolume" data-variablename="musicvolume" value="${this.menu.musicVolume}" min="0" max="10">
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-navigation" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>navigations:</span>
							<select id="navigation-select" name="shadows" data-variablename="navigationSwitch" class="select-class ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${navigationSelected}>On</option>
							</select>
						</div>
					</div>`;
					let actRatios = (this.isMobile) ? this.GR_MOBIL : this.GR_DESKTOP;
					menuElementContent += `
					<div id="menu-graphicsratio" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>graphics:</span>
							<select id="graphicsratio-select" name="graphicsratio" class="select-class ms-5 invisible-pointer">
								<option value="${actRatios[2]}" ${graphicsratioSelected(actRatios[2], this.GRAPHICS_RATIO)}>Low</option>
								<option value="${actRatios[1]}" ${graphicsratioSelected(actRatios[1], this.GRAPHICS_RATIO)}>Medium</option>
								<option value="${actRatios[0]}" ${graphicsratioSelected(actRatios[0], this.GRAPHICS_RATIO)}>Best</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-shadows" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>shadows:</span>
							<select id="shadows-select" name="shadows" data-variablename="shadowsSwitch" class="select-class ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${shadowsSelected}>On</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-sky" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>sky:</span>
							<select id="sky-select" name="sky" data-variablename="skySwitch" class="select-class ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${skySelected}>On</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-floor" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>floor:</span>
							<select id="floor-select" name="floor" data-variablename="floorSwitch" class="select-class ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${floorSelected}>On</option>
							</select>
						</div>
					</div>`;
				} else {
					// FRONT MENU
					if(gameLoaded) {
						menuElementContent += `
						<div id="menu-resume" class="menu-element row">
							<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
							<div class="menu-row col d-flex justify-content-start align-items-center text-warning">RESUME GAME</div>
						</div>`;
					} else {
						menuElementContent += `
						<div id="menu-new" class="menu-element row">
							<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:block;"></div>
							<div class="menu-row col d-flex justify-content-start align-items-center text-danger">NEW GAME</div>
						</div>`;
					}

					menuElementContent += `
					<div id="menu-options" class="menu-element row">
					<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
					<div class="menu-row col d-flex justify-content-start align-items-center">OPTIONS</div>
					</div>`;

					menuElementContent += `
					<div id="menu-information" class="menu-element row">
					<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
					<div class="menu-row col d-flex justify-content-start align-items-center">INFORMATION</div>
					</div>`;

					if (this.mapDataClass.ninjaSave) {
						menuElementContent += `
						<div id="menu-load" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">LOAD GAME</div>
						</div>`;
					}

					if (this.player.live && gameLoaded) {
						menuElementContent += `
						<div id="menu-save" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div id="menu-save-button" class="menu-row col d-flex justify-content-start align-items-center">SAVE GAME</div>
						</div>`;
					}

					if(gameLoaded) {
						menuElementContent += `
						<div id="menu-end" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">END GAME</div>
						</div>`;
					}

					if (!this.isMobile) {
						menuElementContent += `
						<div id="menu-editor" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center"><a href="editor.html" target="_blank">MAP EDITOR</a></div>
						</div>`;
					}

					menuElementContent += `
					<div id="menu-fullscreen" class="menu-element row">
					<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
					<div class="menu-row col d-flex justify-content-start align-items-center">Full Screen</div>
					</div>`;
				}
			menuElementContent += `</div>`;
		$("#menu-bg").append(menuElementContent)

		if (this.menu.optionsActive || this.menu.infoActive) $('#menu-logo').hide()
	}

	hideScrollInfoBoxAction() {
		this.menu.infoactive = false
		this.cheat = false
		$("#scroll-info-box-content-text").html(''); $("#scroll-info-box").hide();
	}

	async scrollInfoMaker(htmlElements, time, useButton) {
		this.menu.infoactive = true

		$('#scroll-info-box').hide()

		const createAction = async () => {
			if (useButton) htmlElements += `<div class="text-center m-0 p-0 bg-pink"><button type="button" id="scroll-button" class="btn">Ok</button></div>`
			$("#scroll-info-box-content-text").html(htmlElements);
			if (useButton) {						
				$("#scroll-info-box-content-text").find('#scroll-button').one('click', () => {
					this.hideScrollInfoBoxAction()
					this.mapDataClass.movingForward = true;
				});
				const handleEnterKeyPress = (event) => {
					if (event.key == "Enter" || event.key == "Escape") {
						this.mapDataClass.movingForward = true
						this.hideScrollInfoBoxAction()
						$(document).off('keydown', handleEnterKeyPress)
					}
				};
				$(document).on('keydown', handleEnterKeyPress)
			}			
			// Hide Info
			if (!useButton) setTimeout(() => this.hideScrollInfoBoxAction(), time)
		}

		const infoBoxVericalResize = async () => {
			let infoBoxHeight = $('#scroll-info-box').height()
			let calcTop = (this.VISIBLE_GAME_HEIGHT / 2) - (infoBoxHeight / 2) - 15
			$('#scroll-info-box').css('top', calcTop + 'px')
		}

		await createAction()
		await infoBoxVericalResize()

		$("#scroll-info-box").show()
	}

	async startStory() {
		// PAGE 1
		let content = `
		<div class="text-start px-2">
			<h1 class='text-center text-uppercase story-tittle'>Against the Ancient Law</h1>
			<p class="me-3">
				<img src="img/menu/story/pic1.png" alt="village" class="story-pic1"/>
				<span>
					Once upon a time, in a secluded village in Japan, there lived a brave ninja named Hiroto. Hiroto always served the local lord, the powerful and ruthless Takeda, with unwavering loyalty.<br>Everyone in the village respected Hiroto because he protected them from bandits and marauders...
				</span>
			</p>
		</div>`;
		await this.scrollInfoMaker(content, null, true)
		await this.movingForward()
		// PAGE 2
		this.mapDataClass.movingForward = false
		content = `
		<div class="text-start px-2">
			<p class="ms-3">
				<img src="img/menu/story/pic2.png" alt="village" class="story-pic2 me-3"/>
				<span class="ms-3">
					However, one day a serious conflict arose between Hiroto and Takeda. Takeda insisted on adhering to an ancient custom that required the villagers to give a large amount of crops and livestock to the lord every year, even if it caused severe famine in the village.<br>Hiroto realized that this custom was long outdated and only caused suffering for the villagers...
				</span>
			</p>
		</div>`;
		await this.scrollInfoMaker(content, null, true)
		await this.movingForward()
		// PAGE 3
		this.mapDataClass.movingForward = false
		content = `
		<div class="text-start px-2">
			<p class="me-3">
				<img src="img/menu/story/pic3.png" alt="village" class="story-pic3"/>
				<span>
					Hiroto tried to convince Takeda to change his mind, but the lord remained adamant.<br>In the heat of the argument, Takeda ordered that Hiroto be captured and imprisoned to set an example for those who dared to oppose his will.<br><br>
				</span>
			</p>
		</div>`;
		await this.scrollInfoMaker(content, null, true)
		await this.movingForward()
		// PAGE 4
		this.mapDataClass.movingForward = false
		content = `
		<div class="text-start px-2">
			<p class="ms-3">
				<img src="img/menu/story/pic4.png" alt="village" class="story-pic4"/>
				<span>
					Hiroto had been imprisoned for a week when he finally got an opportunity to escape. He quietly watched the guard during meal distribution, and in an unexpected moment, he strangled the guard with lightning speed.<br>He took the guard's knife and used it to unlock the chain on his wrist. This is where your escape story begins...
				</span>
			</p>
		</div>`;
		await this.scrollInfoMaker(content, null, true)
		await this.movingForward()
		// ---
		this.mapDataClass.movingForward = false
	}

	async endStory() {
		this.gamePlay.endStory = true

		this.soundClass.playSoundEvent('magic1', 1)
		// PAGE 1
		let content = `
		<div class="text-start px-2">
			<h1 class='text-center text-uppercase story-tittle'>Gratulations!</h1>
			<p class="me-3">
				<img src="img/menu/story/pic5.png" alt="village" class="story-pic5 ms-3"/>
				<span>
					After defeating Takeda, the villagers celebrated you with joy. They were grateful that you finally freed them from the tyrannical ruler who could have brought famine and suffering upon them.<br><br>
					You took over the leadership and immediately started implementing fair and wise measures that improved the villagers' lives. Under your new leadership, the village thrived, and the villagers forever etched your name in their memories as the hero who saved them.<br>
				</span>
			</p>
		</div>`;
		await this.scrollInfoMaker(content, null, true)
		await this.movingForward()
		this.mapDataClass.movingForward = false
	}

	amplitudeA(value) {
		const amplitude = (Math.abs(value) - value) / 2
		const offset = (Math.abs(value) + value) / 2
		const frequency = 10
	
		const returnValue = Math.sin(frequency * Date.now() * 0.001) * amplitude + offset
		return Math.floor(returnValue);
	}

	spriteDistanceCalc(sprite) {
		return Math.sqrt(Math.pow(this.player.y - sprite.y, 2) + Math.pow(this.player.x - sprite.x, 2));
	}

	toAngle(rad) {
		let degrees = (rad * 180) / Math.PI;
		degrees %= 360;
		if (degrees < 0) {
			degrees += 360;
		}
		return degrees;
	}
	
	toRadians(deg) {
		let radians = ((deg * Math.PI) / 180);
		radians %= (2 * Math.PI);
		if (radians < 0) {
			radians += (2 * Math.PI);
		}
		return radians;
	}

	calcDirX(angle) {
		let returnValue = Math.abs(Math.floor((angle - Math.PI/2) / Math.PI) % 2);
		returnValue = (returnValue == 0) ? -1 : returnValue;
		return returnValue;
	}

	calcDirY(angle) {
		let returnValue = Math.abs(Math.floor(angle / Math.PI) % 2);
		returnValue = (returnValue == 0) ? -1 : returnValue;
		return returnValue;
	}

	calculatePercentage(value, percentage) {
		return (value * percentage) / 100;
	}

	fixFhishEye(distance, angle, playerAngle) {
		let diff = angle - playerAngle;
		return distance * Math.cos(diff)
	}

	outOfMapBounds(x, y) {
		return x < 0 || x >= this.mapDataClass.map[0].length || y < 0 || y >= this.mapDataClass.map.length;
	}

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	calcShadowDistance(distance) {
	let shadowDistance = (distance / this.mapDataClass.shadow) * 0.15;	// this.mapDataClass.shadow = 160
	shadowDistance = (shadowDistance > 1) ? 1 : shadowDistance;
	shadowDistance = shadowDistance.toFixed(1);
	return shadowDistance
}

	colorDarkening(color, size) {		
		if (color) {
			let cacheKey = color + '_' + size;
			if (this.colorCache.has(cacheKey)) {
				return this.colorCache.get(cacheKey);
			} else {
				var rgbaArr = color.match(/\d+(\.\d+)?/g)
				let r = Math.floor(parseInt(rgbaArr[0]) * (1 - (size)));
				let g = Math.floor(parseInt(rgbaArr[1]) * (1 - (size)));
				let b = Math.floor(parseInt(rgbaArr[2]) * (1 - (size)));
				let a = Math.min(parseFloat(rgbaArr[3]));
				let result = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
				this.colorCache.set(cacheKey, result);
				return result;
			}
		}
		return "rgba(0,0,0,0)";
	}

	getVCrash(angle, type, bY, bX) {
		// VERTICAL CHECK
		let right = Math.abs(Math.floor((angle-Math.PI / 2) / Math.PI) % 2)
		let up = Math.abs(Math.floor(angle / Math.PI) % 2)

		let firstX = (right)
		? Math.floor(this.player.x / this.CELL_SIZE) * this.CELL_SIZE + this.CELL_SIZE
		: Math.floor(this.player.x / this.CELL_SIZE) * this.CELL_SIZE;
		
		let firstY = this.player.y + (firstX - this.player.x) * Math.tan(angle)
		
		let xA = right ? this.CELL_SIZE : -this.CELL_SIZE;
		let yA = xA * Math.tan(angle)

		let wall;
		let nextX = firstX;
		let nextY = firstY;
		let actCellY;
		let lastCellX;
		let lastCellY;

		while(!wall || wall == 'portal') {
			let cellX = (right) ? Math.floor(nextX / this.CELL_SIZE) : Math.floor(nextX / this.CELL_SIZE) - 1;
			let cellY = Math.floor(nextY / this.CELL_SIZE)

			if(this.outOfMapBounds(cellX, cellY)) break;

			if (!type) {
				// Normal check
				wall = (this.mapDataClass.map[cellY][cellX]) ? true : false;
				// Portal
				wall = (this.player.poison && this.mapDataClass.map[cellY][cellX].id == 230) ? false : wall;
			} else {				
				// Block check
				wall = (cellY == bY && cellX == bX) ? true : false;
			}

			actCellY = cellY

			if(!wall) {
				nextX += xA; nextY += yA;
			} else {
				lastCellX = cellX; lastCellY = cellY;
			}
		}

		if (type) {
			let xA = right ? (this.CELL_SIZE/2) : (-this.CELL_SIZE/2);
			let yA = xA * Math.tan(angle)

			nextX = nextX + xA
			nextY = nextY + yA
		}

		let start
		if (type) {
			start = (this.CELL_SIZE - (Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE)) - 1)
		} else {
			start = (!right)
				? (this.CELL_SIZE - (Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE)) - 1)
				: Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE);
		}

		return {
			wallX: lastCellX,
			wallY: lastCellY,
			angle,
			distance: this.distance(this.player.x, this.player.y, nextX, nextY),
			vertical: true,
			start: start,
			dirX: right,
			dirY: up,
			rayDirX: nextX,
			rayDirY: nextY,
		}
	}

	getHCrash(angle, type, bY, bX) {
		// HORIZONTAL CHECK
		let up = Math.abs(Math.floor(angle / Math.PI) % 2)
		let right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
		
		let firstY = (up)
		? Math.floor(this.player.y / this.CELL_SIZE) * this.CELL_SIZE
		: Math.floor(this.player.y / this.CELL_SIZE) * this.CELL_SIZE + this.CELL_SIZE;

		let firstX = this.player.x + (firstY - this.player.y) / Math.tan(angle)
		let yA = up ? -this.CELL_SIZE : this.CELL_SIZE;
		let xA = yA / Math.tan(angle)

		let wall;
		let nextX = firstX;
		let nextY = firstY;
		let actCellX;
		let lastCellX;
		let lastCellY;

		while(!wall || wall == 'portal') {
			let cellX = Math.floor(nextX / this.CELL_SIZE)
			let cellY = (up) ? Math.floor(nextY / this.CELL_SIZE) - 1 : Math.floor(nextY / this.CELL_SIZE);

			if (this.outOfMapBounds(cellX, cellY)) break;

			if (!type) {
				// Normal check
				wall = (this.mapDataClass.map[cellY][cellX]) ? true : false;
				// Portal
				wall = (this.player.poison && this.mapDataClass.map[cellY][cellX].id == 230) ? false : wall;
			} else {				
				// Block check
				wall = (cellY == bY && cellX == bX) ? true : false;
			}

			actCellX = cellX

			if (!wall) {
				nextX += xA; nextY += yA;
			} else {
				lastCellX = cellX; lastCellY = cellY;
			}
		}

		if (type) {
			let yA = up ? (-this.CELL_SIZE/2) : (this.CELL_SIZE/2);
			let xA = yA / Math.tan(angle)

			nextX = nextX + xA
			nextY = nextY + yA
		}

		let start
		if (type) {
			start =  (this.CELL_SIZE - (Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE)) - 1)
		} else {
			start = (!up) 
				? (this.CELL_SIZE - (Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE)) - 1)
				: Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE);
		}

		return {
			wallX: lastCellX,
			wallY: lastCellY,
			angle,
			distance: this.distance(this.player.x, this.player.y, nextX, nextY),
			vertical: false,
			start: start,
			dirY: up,
			dirX: right,
			rayDirX: nextX,
			rayDirY: nextY,
		}
	}

	getRays() {
		let initialAngle = this.player.angle - (this.FOV/2)
		let angleStep = this.FOV / this.NUMBER_OF_RAYS

		return Array.from({length: this.NUMBER_OF_RAYS}, (_, i) => {
			let angle = initialAngle + i * angleStep;

			let vCrash = this.getVCrash(angle, false)
			let hCrash = this.getHCrash(angle, false)

			let ray = (hCrash.distance >= vCrash.distance) ? vCrash : hCrash;

			return ray
		})
	}
	
	loadTexture(textureType, texturePlace) {
		if (this.texturesClass[textureType]) {
			let actualTexture = this.texturesClass[textureType]

			for (const key of texturePlace) {
				if (actualTexture && actualTexture[key]) {
					actualTexture = actualTexture[key];
				} else {
					return this.texturesClass.errorTexture['error']['error']
				}
			}
			return actualTexture
		}
		return this.texturesClass.errorTexture['error']['error']
	}

	renderMinimap() {
		const cellSize = this.MINIMAP_SCALE * this.CELL_SIZE;
		var mapSizeX = 9
		var mapSizeY = 6

		let actX = Math.floor(this.player.x / this.CELL_SIZE)
		let actY = Math.floor(this.player.y / this.CELL_SIZE)
		let mapPlayerInX = Math.floor(this.player.x - (actX * this.CELL_SIZE)) * this.MINIMAP_SCALE
		let mapPlayerInY = Math.floor(this.player.y - (actY * this.CELL_SIZE)) * this.MINIMAP_SCALE

		let playerBrickX = (this.GAME_WIDTH / 2) - mapPlayerInX
		let playerBrickY = (this.GAME_HEIGHT / 2) - mapPlayerInY

		var creaturesArray = []

		var widthY
		var widthX
		for(let y = -mapSizeY; y<mapSizeY; y++) {
			for(let x = -mapSizeX; x<mapSizeX; x++) {
				var modFirstBrickY = 0
				var modFirstBrickX = 0

				if (y == -mapSizeY) {
					widthY = cellSize - mapPlayerInY
					modFirstBrickY = mapPlayerInY
				} else if (y == mapSizeY-1) widthY = mapPlayerInY 
				else widthY = cellSize
				if (x == -mapSizeX) {
					widthX = cellSize - mapPlayerInX
					modFirstBrickX = mapPlayerInX
				} else if (x == mapSizeX-1) widthX = mapPlayerInX
				else widthX = cellSize

				// STROKE
				this.context.strokeStyle = '#80808066'
				this.context.lineWidth = 2;
				this.context.strokeRect(
					playerBrickX + (cellSize * x) + modFirstBrickX,
					playerBrickY + (cellSize * y) + modFirstBrickY,
					widthX,	widthY,
				);
				
				// PAPIRUS
				let imgBgPapirus = document.getElementById('bg-papirus')
				let imgWidth = imgBgPapirus.width;
				let imgHeight = imgBgPapirus.height - 4;
				this.context.drawImage(
					imgBgPapirus,
					0, 4, imgWidth, imgHeight,
					playerBrickX + (cellSize * x) + modFirstBrickX,
					playerBrickY + (cellSize * y) + modFirstBrickY,
					widthX,	widthY,
				);

				if (this.mapDataClass.map[actY + y] != undefined) {
					if (this.mapDataClass.map[actY + y][actX + x] != undefined) {

						var cellValue = this.mapDataClass.map[actY + y][actX + x]

						if (cellValue) {
							if (cellValue.mode == 'door') this.context.fillStyle = '#80a11c'
							else if (cellValue.mode == 'key1') this.context.fillStyle = '#385870'
							else if (cellValue.mode == 'key2') this.context.fillStyle = '#ffa500'
							else this.context.fillStyle = '#b0aaa0'
							this.context.fillRect(
								playerBrickX + (cellSize * x) + modFirstBrickX, playerBrickY + (cellSize * y) + modFirstBrickY,
								widthX,	widthY,
							);
						}

						// BLOCKS
						let checkBlock = this.spritesClass.checkSpriteData(actY + y, actX + x, 'type', 'block')
						let checkBlockValue = (checkBlock && checkBlock.material == 'fix') ? true : false;

						if (checkBlockValue && (x != mapSizeX-1 && x != -mapSizeX) && (y != mapSizeY-1 && y != -mapSizeY)) {
							if (checkBlock.mode == 'door') this.context.fillStyle = '#80a11c'
							else if (checkBlock.mode == 'key1') this.context.fillStyle = '#385870'
							else if (checkBlock.mode == 'key2') this.context.fillStyle = '#ffa500'
							else this.context.fillStyle = '#bd894e'

							if (checkBlock.angle == 0) {
								this.context.fillRect(
									playerBrickX + (cellSize * x) + (cellSize / 3) + modFirstBrickX,
									playerBrickY + (cellSize * y) + modFirstBrickY,
									widthX - ((cellSize / 3) * 2), widthY,
								);
							} else if (checkBlock.angle == 90) {
								this.context.fillRect(
									playerBrickX + (cellSize * x) + modFirstBrickX,
									playerBrickY + (cellSize * y) + (cellSize / 3) + modFirstBrickY,
									widthX, widthY - ((cellSize / 3) * 2),
								);
							}
						}

						// FIX OBJECTS
						let checkObject = this.spritesClass.checkSpriteData(actY + y, actX + x, 'type', 'object')
						let checkObjectValue = (checkObject && checkObject.active && (checkObject.material == 'fix' || checkObject.material == 'ghost')) ? true : false;

						if (checkObjectValue && (x != mapSizeX-1 && x != -mapSizeX) && (y != mapSizeY-1 && y != -mapSizeY)) {
							if (checkObject.material == 'ghost') this.context.fillStyle = '#ca9d60'
							else this.context.fillStyle = '#ff894e'
							this.context.beginPath();
							this.context.arc(
								playerBrickX + (cellSize * x) + (cellSize / 2) + modFirstBrickX, playerBrickY + (cellSize * y) + (cellSize / 2) + modFirstBrickY,
								(cellSize / 4), 0, 2 * Math.PI);
							this.context.fill();
						}

						// CREATURES
						let checkCreature = this.spritesClass.checkSpriteData(actY + y, actX + x, 'type', 'creature')
						let checkCreatureValue = (checkCreature && !checkCreature.anim_die_function) ? true : false;
						
						if (checkCreatureValue && (x != mapSizeX-1 && x != -mapSizeX) && (y != mapSizeY-1 && y != -mapSizeY)) {							
							let creature = {
								x: playerBrickX + (cellSize * x) + (cellSize / 2) + modFirstBrickX,
								y: playerBrickY + (cellSize * y) + (cellSize / 2) + modFirstBrickY,
								angle: checkCreature.angle
							}
							creaturesArray.push(creature)
						}

						// AMMO
						let checkAmmo = this.spritesClass.checkSpriteData(actY + y, actX + x, 'type', 'ammo')
						let checkAmmoValue = (checkAmmo && checkAmmo.active) ? true : false;
						
						if (checkAmmoValue && (x != mapSizeX-1 && x != -mapSizeX) && (y != mapSizeY-1 && y != -mapSizeY)) {							
							let ammo = {
								x: playerBrickX + (cellSize * x) + (cellSize / 2) + modFirstBrickX,
								y: playerBrickY + (cellSize * y) + (cellSize / 2) + modFirstBrickY,
								angle: checkAmmo.angle
							}
							creaturesArray.push(ammo)
						}
					}
				}
			}
		}

		// CREATURES DRAW
		creaturesArray.forEach(creature => {		
			const rayLength = cellSize / 2;
			this.context.strokeStyle = 'red'
			this.context.lineWidth = 3;
			this.context.beginPath()
			this.context.moveTo(creature.x, creature.y)
			this.context.lineTo(
				creature.x + ((Math.cos(creature.angle) * rayLength)),
				creature.y + ((Math.sin(creature.angle) * rayLength)),
			)
			this.context.stroke()
			this.context.fillStyle = 'red'
			this.context.beginPath();
			this.context.arc(
				creature.x, creature.y,
				(cellSize / 8), 0, 2 * Math.PI);
			this.context.fill();
		});

		// PLAYER DRAW
		const rayLength = this.PLAYER_SIZE * 2;
		this.context.strokeStyle = 'blue'
		this.context.lineWidth = 3;
		this.context.beginPath()
		this.context.moveTo((this.GAME_WIDTH / 2), (this.GAME_HEIGHT / 2))
		this.context.lineTo(
			(this.GAME_WIDTH / 2) + ((Math.cos(this.player.angle) * rayLength) * this.MINIMAP_SCALE),
			(this.GAME_HEIGHT / 2) + ((Math.sin(this.player.angle) * rayLength) * this.MINIMAP_SCALE),
		)
		this.context.closePath()
		this.context.stroke()
		this.context.fillStyle = 'blue';
		this.context.beginPath();
		this.context.arc(
			(this.GAME_WIDTH / 2), (this.GAME_HEIGHT / 2),
			cellSize / 8, 0, 2 * Math.PI);
		this.context.fill();
	}

	renderVisibleScreen() {
		this.visibleContext.drawImage(this.canvas, 0, 0, this.VISIBLE_GAME_WIDTH, this.VISIBLE_GAME_HEIGHT)
	}

	renderScreen() {
		if (this.player.die_action) this.clrScr()
		// OWN FIRST DRAW SKY
		if(this.menu.skySwitch) {
			// SKY
			if (this.texturesClass.skyTexture.type == 'sky') {
				let texture = this.texturesClass.skyTexture.element
				let textureWidth = this.texturesClass.skyTexture.textureWidth
				let textureHeight = this.texturesClass.skyTexture.textureHeight

				let largestTextureWidth = textureWidth * 2
				let largestTextureHeight = textureHeight * 2
				
				if (texture) {
					let skyAngle = this.toAngle(this.player.angle)
					let textureSlice = textureWidth / 360
					let flip = skyAngle * textureSlice
					let textureSliceLargest = largestTextureWidth / 360
					let flipLargest = skyAngle * textureSliceLargest
					
					this.context.drawImage(texture,
						flip, 0,
						textureWidth-flip, textureHeight,
						0, 0,
						largestTextureWidth-flipLargest, largestTextureHeight)
					
					if (textureWidth-flip <= this.canvas.width) {
						this.context.drawImage(texture,	
							0, 0,
							textureWidth, textureHeight,
							largestTextureWidth-flipLargest, 0,
							largestTextureWidth, largestTextureHeight)
					}
				}

				if(!this.menuactive && this.texturesClass.cloudTexture) {

					if (!this.cloudAngleTimeAction) {
						this.cloudAngleTimeAction = setTimeout(() => {
							this.cloudAngleTimeCount = this.cloudAngleTimeCount + 0.5
							if (this.cloudAngleTimeCount == 360) this.cloudAngleTimeCount = 0
							this.cloudAngleTimeAction = null
						}, 16);
					}

					let cloudTexture = document.getElementById(this.texturesClass.cloudTexture)
					let cloudAngleTimeCountRad = this.player.angle - this.toRadians(this.cloudAngleTimeCount)
					let cloudAngle = this.toAngle(cloudAngleTimeCountRad)
					let textureSlice = (textureWidth / 360)
					let flip = cloudAngle * textureSlice
					let textureSliceLargest = largestTextureWidth / 360
					let flipLargest = cloudAngle * textureSliceLargest
					if (cloudTexture) {
						this.context.drawImage(cloudTexture,
							flip, 0,
							textureWidth-flip, textureHeight,
							0, 0,
							largestTextureWidth-flipLargest, largestTextureHeight)
						
						if (textureWidth-flip <= this.canvas.width) {
							this.context.drawImage(cloudTexture, 
								0, 0,
								textureWidth, textureHeight,
								largestTextureWidth-flipLargest, 0,
								largestTextureWidth, largestTextureHeight)
						}
					}
				}

			} else {
				// CEILING
				let texture = this.texturesClass.skyTexture.element
				let amp = (this.player.speed != 0) ? this.amplitudeA(this.WALKINTERVAL) : 0;

				this.context.drawImage(texture, 0, amp, this.VISIBLE_GAME_WIDTH, (this.canvas.height / 2) + amp)
			}
		}

		// Floor Shadow
		if (this.menu.floorSwitch) {
			let texture = this.texturesClass.floorTexture.element
			let amp = (this.player.speed != 0) ? this.amplitudeA(this.WALKINTERVAL) : 0;

			this.context.drawImage(texture, 0, (this.canvas.height / 2) + amp, this.VISIBLE_GAME_WIDTH, (this.VISIBLE_GAME_HEIGHT / 2) + 20)
		}

		this.rayLength = this.rays.length

		// START RAYS
		this.minDistance = Infinity;

		this.rays.forEach((ray, i) => {
			// Epsilon error fixit
			if (i > 0 && i < this.rayLength-1) {
				if ((this.rays[i].distance - this.rays[i-1].distance) > (0.5 * this.CELL_SIZE) &&
					(this.rays[i].distance - this.rays[i+1].distance) > (0.5 * this.CELL_SIZE) &&
					this.rays[i-1].wallX == this.rays[i+1].wallX && this.rays[i-1].wallY == this.rays[i+1].wallY) {
					ray.distance = this.rays[i-1].distance
					ray.rayDirX = this.rays[i-1].rayDirX; ray.rayDirY = this.rays[i-1].rayDirY;
					ray.wallX = this.rays[i-1].wallX; ray.wallY = this.rays[i-1].wallY;
				}
			}

			if (ray.distance <= this.minDistance) this.minDistance = ray.distance;

			let distance = (this.player.poison)	? ray.distance : this.fixFhishEye(ray.distance, ray.angle, this.player.angle);

			let wallHeight = (this.player.poison)
			? ((this.CELL_SIZE) / distance) * this.heightRatio + this.poisonModValue 
			: ((this.CELL_SIZE) / distance) * this.heightRatio;

			let BRICK_SIZE = wallHeight / this.CELL_SIZE

			// WALLS DRAWING
			let wall = this.mapDataClass.map[ray.wallY][ray.wallX]

			// WALL CREATURE SOUND
			if (wall.type == 'creature' && wall.anim_switch) {
				if (!wall.playing_sound) {
					this.soundClass.playSoundEvent('plant-eat2', this.soundClass.calculateDistance(ray.distance))
					wall.playing_sound = setTimeout(() => {
						wall.playing_sound = null
					}, 1200);
				}
			}

			// WALL PORTAL SOUND						
			if (wall.id == 230 && !wall.playing_sound) {				
				this.soundClass.playSoundEvent('portal', this.soundClass.calculateDistance(ray.distance))
				wall.playing_sound = setTimeout(() => {
					wall.playing_sound = null
				}, 720);
			}
			
			let wallHeightNum; let wallHeightPos;
			if (wall.height == 'big') {
				wallHeightNum = this.CELL_SIZE * 1.5
				wallHeightPos = (wallHeight/2) + (wallHeight / 2)
			} else {
				wallHeightNum = this.CELL_SIZE
				wallHeightPos = wallHeight / 2
			}
			
			let nowTexture = this.mapDataClass.returnActualWallTexture(wall, ray.wallY, ray.wallX)
			let actualTexture = this.loadTexture('wallTextures', nowTexture)

			for(let n = 0; n < wallHeightNum; n++) {
				if (typeof ray.vertical !== 'undefined') {

					var actPixel = (actualTexture.imgHeight > this.CELL_SIZE)
					? (wall.height == 'big') 
						? (n % (this.CELL_SIZE + (this.CELL_SIZE / 2)))
						: (n % this.CELL_SIZE)
					: (n % this.CELL_SIZE);

					var shadowDisMod = (this.menu.shadowsSwitch)
					? (ray.vertical) ? this.calcShadowDistance(distance + 225) : this.calcShadowDistance(distance)
					: this.context.fillStyle = actualTexture.data[actPixel][ray.start];
					
					this.context.fillStyle = this.colorDarkening(actualTexture.data[actPixel][ray.start], shadowDisMod)

					if (this.SLIP_WIDTH + (i * this.GRID_SIZE) + this.GRID_SIZE > 0) {
						this.context.fillRect(
							parseInt(this.SLIP_WIDTH + (i * this.GRID_SIZE)),
							parseInt(this.player.z + (((this.GAME_HEIGHT / 2) - wallHeightPos) + n * BRICK_SIZE)),
							this.GRID_SIZE,
							Math.ceil(BRICK_SIZE)
						);
					}
				}
			}

			// Simple Floor
			if(!this.menu.floorSwitch) {
				this.context.fillStyle = this.mapDataClass.floorData.color;
				this.context.fillRect(
					this.SLIP_WIDTH + (i * this.GRID_SIZE),
					this.player.z + (this.GAME_HEIGHT / 2) + (wallHeight / 2),
					this.GRID_SIZE,
					this.GAME_HEIGHT
				);
			}

			// Simple Sky
			if(!this.menu.skySwitch) {
				this.context.fillStyle = this.mapDataClass.skyData.color;
				this.context.fillRect(
					this.SLIP_WIDTH + (i * this.GRID_SIZE),
					0,
					this.GRID_SIZE,
					this.player.z + (this.GAME_HEIGHT / 2) - (wallHeight / 2),
				);
			}
		})

		if (!this.player.live) {
			let colorizeOption = { color: "255, 0, 0", alpha: 0.4, time: 1 }
			this.screenColorizeOptions(colorizeOption)
		}
	}

	renderScreenSprites(sprite, actualTexture) {
		// Object Draw
		if (sprite.active) {
			// BLOCK SPRITE draw
			if (sprite.type == 'block') {
				let checkY = Math.floor(sprite.y / this.CELL_SIZE)
				let checkX = Math.floor(sprite.x / this.CELL_SIZE)
				
				this.rays.forEach((ray, i) => {				
					let blockDistance
					if (sprite.angle == 90) blockDistance = this.getHCrash(ray.angle, true, checkY, checkX)
					if (sprite.angle == 0) blockDistance = this.getVCrash(ray.angle, true, checkY, checkX)

					if (blockDistance.wallY != undefined && blockDistance.wallX != undefined) {
						
						let rayDistance = ray.distance
						
						let distance = (this.player.poison)
						? blockDistance.distance 
						: this.fixFhishEye(blockDistance.distance, blockDistance.angle, this.player.angle);

						let wallHeight = (this.player.poison)
						? ((this.CELL_SIZE) / distance) * this.heightRatio + this.poisonModValue 
						: ((this.CELL_SIZE) / distance) * this.heightRatio;

						let BRICK_SIZE = wallHeight / this.CELL_SIZE					

						if (sprite.open_switch) {
							(sprite.open_positionValue == 0)
							? this.doorOpenOrClose(sprite, -3)
							: this.doorOpenOrClose(sprite, 3)
						}

						this.context.fillStyle = "rgba(0, 0, 0, 0)";
						if (rayDistance > blockDistance.distance && blockDistance.start >= 0 && blockDistance.start <= this.CELL_SIZE) {
							for(let n = 0; n < this.CELL_SIZE; n++) {
								
								let actPixel = (n % this.CELL_SIZE)									

								let modPix = (typeof sprite.open_positionValue != 'undefined')
								? blockDistance.start + sprite.open_positionValue
								: blockDistance.start;
								
								let shadowDisMod = this.calcShadowDistance(distance)

								if (this.menu.shadowsSwitch) {
									this.context.fillStyle = (sprite.vertical)
									? this.colorDarkening(actualTexture.data[actPixel][modPix], shadowDisMod)
									: this.colorDarkening(actualTexture.data[actPixel][modPix], shadowDisMod)
								} else {
									this.context.fillStyle = actualTexture.data[actPixel][modPix]
								}

								this.context.fillRect(
									parseInt(this.SLIP_WIDTH + (i * this.GRID_SIZE)),
									parseInt(this.player.z + (((this.GAME_HEIGHT / 2) - (wallHeight / 2)) + n * BRICK_SIZE)),
									this.GRID_SIZE,
									Math.ceil(BRICK_SIZE)
								);
							}
						}
					}
				});	
			// OBJECT, AMMO, CREATURE
			} else if (sprite.type=='object' || sprite.type == 'ammo' || sprite.type == 'creature') {
				let spriteAngle = Math.atan2(sprite.y - this.player.y, sprite.x - this.player.x);

				// FIXIT BLINKING SPRITES #1
				spriteAngle = (sprite.distance < 300) ? this.toAngle(spriteAngle).toFixed(1) : this.toAngle(spriteAngle)

				let isOnTheScreen = this.rays.findIndex((textureRay, i) => {
					if (i != this.rays.length-1) {
						let rayFirst = this.toAngle(textureRay.angle);
						let raySecond = this.toAngle(this.rays[i+1].angle);

						// // FIXIT BLINKING SPRITES #2 EXCEPTION HANDLING
						if (rayFirst >= raySecond && ( spriteAngle == 0 || (spriteAngle >= 357 && spriteAngle <= 360) || (spriteAngle > 0 && spriteAngle < 0.204)) ) // old
							return true;
						
						if (spriteAngle >= rayFirst && spriteAngle <= raySecond) return true;
						return false;
					}
				});

				if (isOnTheScreen !== -1) {
					let spriteHeightValue = ((this.CELL_SIZE) / sprite.distance) * (this.heightRatio + 50)

					let spriteHeight = (this.player.poison)
						? (spriteHeightValue + (this.poisonModValue * 0.7))
						: spriteHeightValue;
					
					let brick_number = spriteHeight / this.GRID_SIZE
					let color_num = spriteHeight / actualTexture.imgHeight
					
					// SPRITE
					let wi = isOnTheScreen - Math.floor(brick_number / 2)
					for (let w = 0; w < brick_number; w++) {

						if (typeof this.rays[wi] != 'undefined' &&
							this.rays[wi].distance > sprite.distance &&
							((sprite.type=='creature' && sprite.distance >= 30) || (sprite.type=='ammo' && sprite.distance >= 30) || sprite.distance >= 30)) { // >= 30 
							
							for (let h=0; h < brick_number; h++) {
								let colorX = Math.floor(((w * this.GRID_SIZE) / color_num))
								let colorY = Math.floor(((h * this.GRID_SIZE) / color_num))
								if (this.SLIP_WIDTH + (wi * this.GRID_SIZE) + this.GRID_SIZE > 0) {
									if (actualTexture.data[colorY][colorX] != 'rgba(0, 0, 0, 0)') {

										let shadowDisMod = this.calcShadowDistance(sprite.distance)

										this.context.fillStyle = (this.menu.shadowsSwitch)
										? this.colorDarkening(actualTexture.data[colorY][colorX], shadowDisMod)
										: this.context.fillStyle = actualTexture.data[colorY][colorX]

										this.context.fillRect(
											parseInt(this.SLIP_WIDTH + (wi * this.GRID_SIZE)),
											parseInt(this.player.z + (this.GAME_HEIGHT / 2) - ((spriteHeight / 2) + (this.calculatePercentage(spriteHeight, sprite.z))) + (h * this.GRID_SIZE)),
											this.GRID_SIZE,
											Math.ceil(this.GRID_SIZE)
										);
									}
								}
							}
						}
						wi++
					}
				}
			}
		}
	}

	checkEnemyHit() {
		// CHECK ENEMY HIT MAP
		let checkEnemyWall = this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX];
		if (checkEnemyWall.type == 'creature' && checkEnemyWall.energy > 0) {
			checkEnemyWall.energy = checkEnemyWall.energy - this.player.weaponsDamage[this.player.weapon]
			if (checkEnemyWall.energy <= 0) {
				checkEnemyWall.anim_startFrame = checkEnemyWall.dirConstruction.length-1
				checkEnemyWall.anim_actFrame = checkEnemyWall.dirConstruction.length-1
				checkEnemyWall.anim_switch = false
			}
		}

		// CHECK ENEMY HIT SPRITE
		let checkCreatures = this.spritesClass.checkSpriteData(this.check.playerCheckY, this.check.playerCheckX, 'type', 'creature')
		let checkCreaturesValue = (checkCreatures && checkCreatures.material != 'ghost') ? true : false;
		if (checkCreaturesValue) this.spritesClass.enemyHit(checkCreatures)
	}

	actualWeaponTexture() {
		let imgId = this.texturesClass.playerWeaponsTextures[`weapon${this.player.weapon}`][0]

		if (this.player.shoting && this.player.shoting_anim == null) {
			
			// BEFORE WEAPONS SOUNDS
			if (this.player.weapon == '1' || this.player.weapon == '2') {
				let random = Math.floor(Math.random() * 2) + 1
				this.soundClass.playSoundEvent(`weapon${this.player.weapon}-${random}`, 1)
				this.enemyHears(this.player.y, this.player.x)
			}

			this.player.shoting_anim = setInterval(() => {
				this.player.shoting_anim_actFrame++
				if (this.player.shoting_anim_actFrame > this.texturesClass.playerWeaponsTextures[`weapon${this.player.weapon}`].length-1) {
					this.player.shoting = false
					clearInterval(this.player.shoting_anim)
					this.player.shoting_anim = null
					this.player.shoting_anim_actFrame = 0;

					// AFTER WEAPONS SOUNDS
					if (this.player.weapon == '3' || this.player.weapon == '4') {
						let random = Math.floor(Math.random() * 2) + 1
						this.soundClass.playSoundEvent(`weapon${this.player.weapon}-${random}`, 1)
						this.spritesClass.startShot(this.minDistance)
						this.enemyHears(this.player.y, this.player.x)
					}

					this.checkEnemyHit()
				}
			}, this.player.shoting_anim_time[this.player.weapon])			
		} else {
			imgId = this.texturesClass.playerWeaponsTextures[`weapon${this.player.weapon}`][this.player.shoting_anim_actFrame]
		}

		// NO HAVE STAR
		if (this.player.weapon == 3 && this.player.ammoStar == 0) imgId = this.texturesClass.playerWeaponsTextures[`weapon${this.player.weapon}`][4]

		return document.getElementById(imgId);
	}

	playerWeapon() {
		let imgElement = this.actualWeaponTexture()

		let weaponImgSize = (this.isMobile)
		? (this.player.weapon == 2) ? this.CELL_SIZE * 4 : this.CELL_SIZE * 3
		: (this.player.weapon == 2) ? this.CELL_SIZE * 6 : this.CELL_SIZE * 5;

		let shortDistance = (this.minDistance < 50) ? (weaponImgSize / 6) : 0;
		
		this.context.drawImage(imgElement, (this.player.z) + ((this.GAME_WIDTH / 2) - (weaponImgSize / 2)), ((-this.player.z * 2) + (this.GAME_HEIGHT - weaponImgSize)) - (this.WALKINTERVAL * 2) + shortDistance, weaponImgSize, weaponImgSize);
	}

	doorOpenOrClose(sprite, open_moveValue) {
		sprite.material = 'fix'
		if (sprite.open_function == null) {
			sprite.anim_switch = true
			sprite.open_function = setInterval(() => {
				sprite.open_positionValue = sprite.open_positionValue + open_moveValue
				if (sprite.open_positionValue >= 0) {
					//CLOSED DOOR
					sprite.open_positionValue = 0
					clearInterval(sprite.open_function)
					sprite.open_function = null
					sprite.open_switch = false
					sprite.material = 'fix'
				}
				if (sprite.open_positionValue <= -58) {
					sprite.open_positionValue = -58
					clearInterval(sprite.open_function)
					sprite.open_function = null
					sprite.open_switch = false
					sprite.material = 'ghost'
				}
			}, 10);
		}
	}

	poison() {
		// fov
		this.poisonModValue = this.poisonModValue + this.poisonModScale
		this.FOV = this.toRadians(this.poisonModValue)
		if (this.poisonModValue >=120) this.poisonModScale = -2
		if (this.poisonModValue <=50) this.poisonModScale = 2
		// color
		let cR = Math.floor(Math.random() * 256)
		let cG = Math.floor(Math.random() * 256)
		let cB = Math.floor(Math.random() * 256)
		let colorizeOption = { color: `${cR}, ${cG}, ${cB}`, alpha: 0.35, time: 150 }
		this.screenColorizeOptions(colorizeOption)
	}

	enemyHears(pY, pX) {
		let mapPy = Math.floor(pY / this.CELL_SIZE)
		let mapPx = Math.floor(pX / this.CELL_SIZE)
		
		this.mapDataClass.wayCordinatesAround.forEach(pos => {
			let searchEnemy = this.spritesClass.sprites.find(sprite => (sprite.type == 'creature' && sprite.moveType != 'attack' && (Math.floor(sprite.y / this.CELL_SIZE) == (mapPy + pos.y) && Math.floor(sprite.x / this.CELL_SIZE) == (mapPx + pos.x))))
			if (searchEnemy) searchEnemy.moveType = 'attack'
		});
	}

	mobileCheck() {
		let check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	};
}
