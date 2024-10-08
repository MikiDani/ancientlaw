export default class InputClass {
	constructor ({soundClass: soundClass, mapDataClass: mapDataClass, spritesClass: spritesClass, graphicsClass: graphicsClass, movePlayer: movePlayer, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check, getUserInteraction: getUserInteraction, userInteractionOn: userInteractionOn, menuGameJump: menuGameJump, saveGame: saveGame, loadGame: loadGame, endGame: endGame, gamePlayValues: gamePlayValues }) {
		this.CELL_SIZE = graphicsClass.CELL_SIZE
		this.soundClass = soundClass
		this.mapDataClass = mapDataClass
		this.spritesClass = spritesClass
		this.graphicsClass = graphicsClass
		this.movePlayer = movePlayer
		this.menuGameJump = menuGameJump
		this.saveGame = saveGame
		this.loadGame = loadGame
		this.endGame = endGame
		this.gamePlayValues = gamePlayValues
		this.menu = menu
		this.getUserInteraction = getUserInteraction
		this.userInteractionOn = userInteractionOn
		//-----------------------------------------------------------------------------
		this.MOVE_ANGLE = this.menu.sensitivity
		this.MOVE_ANGLE_SLOW = 1
		this.PLAYER_WALL_DISTANCE = Math.floor((graphicsClass.CELL_SIZE / 100) * 24)	// 25
		this.CREATURE_WALL_DISTANCE = Math.floor((graphicsClass.CELL_SIZE / 100) * 45)
		this.AMMO_WALL_DISTANCE = Math.floor((graphicsClass.CELL_SIZE / 100) * 15)
		//-----------------------------------------------------------------------------
		this.gameMenu = gameMenu
		this.player = player
		this.keyPressed = keyPressed
		this.keybordListener = null
		this.shotingAction = null
		this.gamePlay = gamePlay
		this.check = check
		this.mouseMoveSwitsh = false
		this.firstSecret = true
		this.cursorSound = null
		this.messageTime = 2200

		document.addEventListener('keydown', function(event) {
			if (event.shiftKey && event.key == 'F5') return;
			if (event.key == 'F12') return;
			if (menu.menuactive && event.key == 'F11') return;
			event.preventDefault();
		});

		this.loadInputs()
		this.moveMenuStar()
		this.gameResizeListener()
		this.mobileInputsListener()
	}

	gameResizeListener() {
		window.addEventListener("resize", () => {
			document.body.style.backgroundColor = "black";
			this.graphicsClass.gameResize()

			this.menu.menuactive = true
			this.moveMenuStar(0)
		});
	}

	checkDirection(angle, speed) {
		angle = this.graphicsClass.toRadians(angle);
		let sign = (speed < 0) ? -1 : 1;	
		//let sign = 1;
		if (angle >= 0 && angle < Math.PI / 8) {
			return { y: 0, x: 1 * sign, way: 'right', sign: sign };      				// Right
		} else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
			return { y: 1 * sign, x: 1 * sign, way: 'right-down', sign: sign };      	// Right-Down
		} else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
			return { y: 1 * sign, x: 0, way: 'down', sign: sign };      				// Down
		} else if (angle >= 5 * Math.PI / 8 && angle < 7 * Math.PI / 8) {
			return { y: 1 * sign, x: -1 * sign, way: 'left-down', sign: sign };      	// Left-Down
		} else if (angle >= 7 * Math.PI / 8 && angle < 9 * Math.PI / 8) {
			return { y: 0, x: -1 * sign, way: 'left', sign: sign };      				// Left
		} else if (angle >= 9 * Math.PI / 8 && angle < 11 * Math.PI / 8) {
			return { y: -1 * sign, x: -1 * sign, way: 'left-up', sign: sign };      	// Left-Up
		} else if (angle >= 11 * Math.PI / 8 && angle < 13 * Math.PI / 8) {
			return { y: -1 * sign, x: 0, way: 'up', sign: sign };      					// Up
		} else if (angle >= 13 * Math.PI / 8 && angle < 15 * Math.PI / 8) {
			return { y: -1 * sign, x: 1 * sign, way: 'right-up', sign: sign };   		// Up-Right
		} else {
			return { y: 0, x: 1 * sign, way: 'right', sign: sign };						// Up-Right-Default
		}
	}

	moveMenuStar(way = 0) {
		// SOUND		
		if (this.getUserInteraction() && !this.cursorSound) {
			let rand = Math.floor(Math.random() * 2) + 1			
			this.soundClass.playSoundEvent(`weapon3-${rand}`, 1)
			this.cursorSound = setTimeout(() =>{
				this.cursorSound = null;
			}, 150);
		}
		// GRAPH
		let menuRowsAll = $('#menu-box').find('.menu-element')
		let menuRowsAllLength = $('#menu-box').find('.menu-element').length
		menuRowsAll.find('img').hide()
		this.menu.actualMenuRow = this.menu.actualMenuRow + way
		if (this.menu.actualMenuRow < 0) this.menu.actualMenuRow = menuRowsAllLength-1;
		else if (this.menu.actualMenuRow > menuRowsAllLength-1) this.menu.actualMenuRow = 0;
		menuRowsAll.eq(this.menu.actualMenuRow).find('img').show()
	}

	changeMenuStar(elementId, modifyActualMenuRow) {
		let menuRowsAll = $('#menu-box').find('.menu-element')
		menuRowsAll.find('img').hide()
		var menuIndex = $('#menu-box').find(`.menu-element[id=${elementId}]`).index();
		if (modifyActualMenuRow) {
			this.menu.actualMenuRow = menuIndex;
		}
		menuRowsAll.eq(menuIndex).find('img').show()
	}

	// ENTER
	getActualMenuStar() {
		let elementId = $('#menu-box .menu-element').filter(function() {
			return $(this).find('img').is(':visible');
		}).first().attr('id');
		return elementId;
	}

	changeOptionRow(elementId) {
		var selectedOption = $(`#${elementId}`).val()
		if (selectedOption == 0) {
			$(`#${elementId}`).val(1)
		} else if (selectedOption == 1) {
			 $(`#${elementId}`).val(0)
		}
		 $(`#${elementId}`).trigger('change')
	}

	gameDataConvertSpriteObject(data, findArray, CELL_SIZE, graphicsClass) {
		var returnData = []
		data.forEach(obj => {
			if (obj.type == 'ammo') return;
			var returnRow = {}
			var isBlock = false
			if (obj.type == 'block') isBlock = true;
			
			let entries = Object.entries(obj)
			entries.forEach(row => {
				findArray.forEach(function(find) {
					if (find == row[0]) {
						switch (true) {
							case (find == 'anim_function'):
								returnRow[find] = null
								break;
							case (find == 'anim_die_function'):
								returnRow[find] = true
								break;
							case (find == 'x' || find == 'y'):
								returnRow[find] = (parseFloat(row[1]) / CELL_SIZE)
								break;
							case (find == 'angle' && !isBlock):
								returnRow[find] = parseInt(graphicsClass.toAngle(parseFloat(row[1])))
								break;
							//case 
							default:
								returnRow[find] = row[1]
						}
					}
				});
			});
			returnData.push(returnRow)
		});
		return returnData;
	}

	gameDataConvertMapObject(data, findArray) {
		var returnData = []
		for(let y = 0; y < data.length; y++) {
			returnData[y] = []
			for(let x = 0; x < data[y].length; x++) {
				var returnRow = {}
				if (data[y][x] == 0 || data[y][x] == null || data[y][x] == undefined) {
					returnData[y][x] = 0
				} else {
					let entries = Object.entries(data[y][x])
					entries.forEach(row => {
						findArray.forEach(function(find) {
							if (find == row[0]) {
								switch (true) {
									case (find == 'anim_function'):
										returnRow[find] = null
										break;
									//case 
									default:
										returnRow[find] = row[1]
								}
							}
						});
					});
					returnData[y][x] = returnRow
				}
			}
		}
		return returnData;
	}

	async menuAction(menuId) {
		var menuId = menuId

		if (menuId == 'menu-new' || menuId == 'menu-resume') this.menuGameJump();

		if (menuId == 'menu-fullscreen') {
			let nowSwitch = this.graphicsClass.fullscreenSwitch
			if (nowSwitch) {
				this.graphicsClass.fullscreenSwitch = false	
				this.exitFullScreen()
			} else {
				this.graphicsClass.fullscreenSwitch = true	
				this.fullScreen()
			}
			this.graphicsClass.checkPlayerObjects()
		}

		if (menuId == 'menu-editor') { 
			this.changeMenuStar('menu-editor', true)
			window.open('editor.html', '_blank')
		};

		if (menuId == 'menu-options') {
			this.menu.optionsActive = true;
			this.menu.actualMenuRow = 0
			this.gamePlay = this.gamePlayValues()
			this.graphicsClass.makeMenu(this.gamePlay.gameLoaded)
			this.add_optionsEventListeners()
			this.moveMenuStar(0)
		}

		if (menuId == 'menu-options-back') {
			this.menu.optionsActive = false;
			this.menu.actualMenuRow = 0
			this.remove_optionsEventListeners()
			this.gamePlay = this.gamePlayValues()
			this.graphicsClass.makeMenu(this.gamePlay.gameLoaded)
			
			this.moveMenuStar(0)
		}

		if (menuId == 'menu-information') {
			this.menu.infoActive = true;
			this.menu.actualMenuRow = 0
			this.gamePlay = this.gamePlayValues()
			this.graphicsClass.makeMenu(this.gamePlay.gameLoaded)
			this.add_optionsEventListeners()
			this.moveMenuStar(0)
		}

		if (menuId == 'menu-information-back') {
			this.menu.infoActive = false;
			this.menu.actualMenuRow = 0
			this.gamePlay = this.gamePlayValues()
			this.graphicsClass.makeMenu(this.gamePlay.gameLoaded)
			this.moveMenuStar(0)
		}

		if (menuId == 'menu-save') {
			await new Promise((resolve) => {
				$(document).find('#menu-save-button').addClass('text-success')
				setTimeout(() => {
					$(document).find('#menu-save-button').removeClass('text-success');
					resolve();
				}, 250);
			});
			this.saveGame()
		}

		if (menuId == 'menu-load') {
			this.loadGame()
		}

		if (menuId == 'menu-end') { this.endGame() }

		if (menuId == 'menu-sensitivity') { 
			this.changeMenuStar('menu-sensitivity', true)
			this.changeOptionRow('sensitivity-select')
		}

		if (menuId == 'menu-soundvolume') { 
			this.changeMenuStar('menu-soundvolume', true)
			this.changeOptionRow('soundvolume-select')
		}

		if (menuId == 'menu-musicvolume') { 
			this.changeMenuStar('menu-musicvolume', true)
			this.changeOptionRow('musicvolume-select')
		}
		
		if (menuId == 'menu-shadows') { 
			this.changeMenuStar('menu-shadows', true)
			this.changeOptionRow('shadows-select')
		}

		if (menuId == 'menu-navigation') { 
			this.changeMenuStar('menu-navigation', true)
			this.changeOptionRow('navigation-select')
		}

		if (menuId == 'menu-sky') { 
			this.changeMenuStar('menu-sky', true)
			this.changeOptionRow('sky-select')
		}

		if (menuId == 'menu-floor') { 
			this.changeMenuStar('menu-floor', true)
			this.changeOptionRow('floor-select')
		}

		if (menuId == 'menu-graphicsratio') { 
			this.changeMenuStar('menu-graphicsratio', true)
			this.changeOptionRow('graphicsratio-select')
		}
		return;
	}

	gamePushEsc() {
		this.keyPressed = []
		this.menu.menuactive = false
		this.mouseMoveSwitsh = false
		$("body").css({cursor: "default"});
		this.menuGameJump();
	}

	playerFire() {
		if (this.shotingAction == null) {
			if (this.player.weapon == 1 ||
				this.player.weapon == 2 || 
				(this.player.weapon == 3 && this.player.ammoStar > 0) ||
				(this.player.weapon == 4 && this.player.ammoFire > 0)) {

				if (this.graphicsClass.minDistance <= 50 && (this.player.weapon == 3 || this.player.weapon == 4)) {
					// SHORT SHOTING
					this.soundClass.playSoundEvent(`player-push2`, 0.3)
				} else {
					// DEFAULT SHOTING
					this.player.shoting = true
					this.shotingAction = setTimeout(()=> {
						clearTimeout(this.shotingAction)
						this.shotingAction = null
					}, this.player.shotTime);
				}

			}
		}
	}

	playerOpen() {
		if(!this.player.open_time && this.player.live) {
			this.player.open_time = true

			setTimeout(() => {
				this.player.open_time = false
			},600);
			// Check MAP
			if (!this.menu.menuactive) {

				
				var firstSound = true
				var mapData = this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX]

				if (mapData) {
					// type
					// OPEN DOOR
					var waitTime = 2000

					if (mapData.mode == 'door') {
						if (mapData.sound) this.soundClass.playSoundEvent(mapData.sound, 1)
						firstSound = false
						mapData.anim_switch = true
					}

					if (mapData.mode == 'secret') {
						mapData.anim_switch = true
						if (mapData.sound && !mapData.playingSound) {
							mapData.playingSound = true
							this.soundClass.playSoundEvent(mapData.sound, 1)
							firstSound = false
						}
						if (this.firstSecret) {
							this.firstSecret = false
							let content = `<h3 class='text-center'>Your found a secret wall!</h3>`
							this.graphicsClass.scrollInfoMaker(content, this.messageTime)
						}
					}

					if (mapData.mode == 'key1') {
						if (this.player.key1) {
							if (mapData.sound && !mapData.playSound_function) {
								this.soundClass.playSoundEvent(mapData.sound, 1)
								firstSound = false
								mapData.playSound_function = setInterval(() =>{
									mapData.playSound_function = null
								}, waitTime);
							}
							mapData.anim_switch = true
						} else {
							if (!mapData.playSound_function) {
								this.soundClass.playSoundEvent('wrong1', 1)
								firstSound = false
								mapData.playSound_function = setInterval(() =>{
									mapData.playSound_function = null
								}, waitTime);
							}
							let content = `<div class="text-center"><h3 class='text-center'>You need the silver key to open this wall!</h3><div class="info-key1-container mx-auto"></div></div>`
							this.graphicsClass.scrollInfoMaker(content, this.messageTime)
						}
					}

					if (mapData.mode == 'key2') {
						if (this.player.key2) {
							if (mapData.sound && !mapData.playSound_function) {
								this.soundClass.playSoundEvent(mapData.sound, 1)
								firstSound = false
								mapData.playSound_function = setInterval(() =>{
									mapData.playSound_function = null
								}, waitTime);
							}
							mapData.anim_switch = true
						} else {
							if (!mapData.playSound_function) {
								this.soundClass.playSoundEvent('wrong1', 1)
								firstSound = false
								mapData.playSound_function = setInterval(() =>{
									mapData.playSound_function = null
								}, waitTime);
							}
							let content = `<div class="text-center"><h3 class='text-center'>You need the gold key to open this wall!</h3><div class="info-key2-container mx-auto"></div></div>`
							this.graphicsClass.scrollInfoMaker(content, this.messageTime)
						}
					}
				}
			}

			// CHECK BLOCKS		

			// OPEN DOOR
			let checkingBlock = this.spritesClass.sprites.find(block => block.type == 'block' && (block.mode == 'door' || block.mode == 'key1' || block.mode == 'key2')			// Type check
				&& Math.floor(block.x/this.graphicsClass.CELL_SIZE) == this.check.playerCheckX && Math.floor(block.y/this.graphicsClass.CELL_SIZE) == this.check.playerCheckY	// Position check
				&& block.open_function == null)		// not active
			
			if (checkingBlock) {
				if (checkingBlock.mode == 'key1' && (!this.player.key1)) {
					if (!checkingBlock.playSound_function) {
						this.soundClass.playSoundEvent('wrong1', 1)
						firstSound = false
						checkingBlock.playSound_function = setInterval(() =>{
							checkingBlock.playSound_function = null
						}, 1000);
					}
					let content = `<div class="text-center"><h3 class='text-center'>You need the silver key to open this door!</h3><div class="info-key1-container mx-auto"></div></div>`
					this.graphicsClass.scrollInfoMaker(content, this.messageTime)
					return;
				}

				if (checkingBlock.mode == 'key2' && (!this.player.key2)) { 
					if (!checkingBlock.playSound_function) {
						this.soundClass.playSoundEvent('wrong1', 1)
						firstSound = false
						checkingBlock.playSound_function = null
						checkingBlock.playSound_function = setInterval(() =>{
							checkingBlock.playSound_function = null
						}, 1000);
					}
					let content = `<div class="text-center"><h3 class='text-center'>You need the gold key to open this door!</h3><div class="info-key2-container mx-auto"></div></div>`
					this.graphicsClass.scrollInfoMaker(content, this.messageTime)
					return;
				}

				if (checkingBlock.sound) {
					this.soundClass.playSoundEvent(checkingBlock.sound, 1)
					firstSound = false
				}

				checkingBlock.open_switch = true
			}

			if (firstSound) {
				let rand = Math.floor(Math.random() * 2) + 1
				this.soundClass.playSoundEvent(`player-push${rand}`, 1)
			}
		}
	}

	escHandler = function(e) {
		if (e.key == "Escape" || e.keyCode == 27) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	};

	disableEsc() {
		window.addEventListener('keydown', this.escHandler, true)
	}

	delEsc() {
		window.removeEventListener('keydown', this.escHandler, true)
	}

	loadInputs() {
		//////////
		// KEYDOWN
		//////////
		var clone = this
		// SENSITIVITY RANGE
		$(document).on('change', '#sensitivity-range', () => {
			let inputElement = $("#sensitivity-range")
			let elementId = 'menu-sensitivity'
			let variableName = 'sensitivity'
			let newValue = inputElement.val()
			this.changeRange(inputElement, elementId, variableName, newValue, clone)
		});

		// SOUND RANGE
		$(document).on('change', '#soundvolume-range', () => {
			let inputElement = $("#soundvolume-range")
			let elementId = 'menu-soundvolume'
			let variableName = 'soundVolume'
			let newValue = inputElement.val()
			this.changeRange(inputElement, elementId, variableName, newValue, clone)
		});

		// MUSIC RANGE
		$(document).on('change', '#musicvolume-range', () => {
			let inputElement = $("#musicvolume-range")
			let elementId = 'menu-musicvolume'
			let variableName = 'musicVolume'
			let newValue = inputElement.val()
			this.changeRange(inputElement, elementId, variableName, newValue, clone)
		});

		document.addEventListener('keydown', (event) => {
			this.userInteractionOn()

			if (!this.soundClass.menuMusic) {
				this.soundClass.playMusic('menu1', 'menuMusic')
				this.userInteraction = true
			}

			if (event.ctrlKey || event.key == 'f') this.playerOpen()

			// TOGETHER		
			if(event.key == 'Escape' && this.graphicsClass.orientationLicense) {
				// MENU PUSH ESC
				if (this.menu.optionsActive && this.graphicsClass.orientationLicense) {
					this.menu.optionsActive = false
					this.gamePlay = this.gamePlayValues()
					this.graphicsClass.makeMenu(this.gamePlay.gameLoaded)
					return;
				}

				// GAME PUSH ESC
				if (!this.menu.menuactive && this.graphicsClass.orientationLicense) {
					this.gamePushEsc()
					return;
				}

				this.gamePlay = this.gamePlayValues()
				this.graphicsClass.makeMenu(this.gamePlay.gameLoaded)
				this.moveMenuStar(0)
				return;
			}
			// MENU
			if (this.menu.menuactive && this.graphicsClass.orientationLicense) {
				// Enter
				if (event.key == 'Enter') {
					let elementId = this.getActualMenuStar()
					this.menuAction(elementId)
				}

				if (event.key == 'ArrowLeft' || event.key == 'ArrowRight') {
					var elementId = this.getActualMenuStar()
					if (elementId == 'menu-soundvolume' || elementId == 'menu-musicvolume' || elementId == 'menu-sensitivity') {

						var variableName
						switch(elementId) {
							case 'menu-soundvolume': variableName = 'soundVolume'; break;
							case 'menu-musicvolume': variableName = 'musicVolume'; break;
							case 'menu-sensitivity': variableName = 'sensitivity'; break;
						}

						let inputElement = $('#' + $(`#${elementId}`).attr('data-id'))
						let addValue = (event.key == 'ArrowLeft') ? -1 : 1;
						let newValue = parseInt(inputElement.val()) + parseInt(addValue)

						var clone = this

						clone.changeRange(inputElement, elementId, variableName, newValue, clone)
					}
				}

				if (event.key == 'w' || event.key == 'ArrowUp' || event.key == 'Up') this.moveMenuStar(-1);
				if (event.key == 's' || event.key == 'ArrowDown' || event.key == 'Down') this.moveMenuStar(1);
				
			} else {
				// GAME
				if (this.player.live) {
					let lowerCaseKey = event.key.toLowerCase();

					this.keyPressed[lowerCaseKey] = true
					if (lowerCaseKey == '0') this.player.weapon = 0;
					if (lowerCaseKey == '1') this.graphicsClass.changeWeapon(1);
					if (lowerCaseKey == '2') this.graphicsClass.changeWeapon(2);
					if (lowerCaseKey == '3') this.graphicsClass.changeWeapon(3);
					if (lowerCaseKey == '4') this.graphicsClass.changeWeapon(4);
					if (lowerCaseKey == 'm') {					
						if (!this.graphicsClass.cheat) {
							if(this.player.map) {
								this.menu.mapSwitch = !this.menu.mapSwitch;
							} else {
								let content = `<div class="text-center"><h3 class='text-center'>You don't have the map.</h3></div>`
								this.graphicsClass.scrollInfoMaker(content, this.messageTime)
							}
						}
					}
					// ATTACK / SHOT
					if (event.code == 'Space') this.playerFire();
				}
			}
		});

		////////////////////////////////
		// SPEED KEYS - Animation frames
		////////////////////////////////
		if (!this.menu.menuactive && this.graphicsClass.orientationLicense) {
			// GAME			
			this.keyPressed[lowerCaseKey] = true

			if (lowerCaseKey == 'm') this.menu.mapSwitch = !this.menu.mapSwitch;
			if (lowerCaseKey == 'i') this.menu.infoSwitch = !this.menu.infoSwitch;
			if (lowerCaseKey == 'g') this.menu.shadowsSwitch = !this.menu.shadowsSwitch;
			if (lowerCaseKey == 'h') this.menu.spriteShadowsSwitch = !this.menu.spriteShadowsSwitch;
		}

		////////
		// KEYUP
		////////
		document.addEventListener('keyup', (event) => {
			// MENU
			if (this.menu.menuactive && this.graphicsClass.orientationLicense) {
				// ADDEventListeners
				if(event.key == 'r') { location.reload(true); }
				// GAME
			} else {
				let lowerCaseKey = event.key.toLowerCase();

				this.keyPressed[lowerCaseKey] = false
				this.player.speed = 0;
			}
		});
		
		////////
		// MOUSE
		////////

		// MENU MOUSE
		document.addEventListener('click', (event) => {
			this.userInteractionOn()

			if (!this.soundClass.menuMusic) {
				this.soundClass.playMusic('menu1', 'menuMusic')
			}

			if (this.menu.menuactive && this.graphicsClass.orientationLicense) {
				let element = event.target;
				while (element) {
					if (element.id) {
						this.menuAction(element.id, clone)
						this.moveMenuStar(0)
					}
					element = element.parentElement;
				}
			}
		});

		document.addEventListener('mouseover', (overEvent) => {
			if (this.menu.menuactive && this.graphicsClass.orientationLicense) {
				let element = overEvent.target;
				while (element) {
					if (element.id) {
						this.changeMenuStar(element.id, false)
						if (element.id == 'menu-bg' || element.id == 'menu-box') this.moveMenuStar(0);
						return;
					}
					element = element.parentElement;
				}
			}
		});

		// GAME MOUSE
		$(document).on('contextmenu', (event) => {
			event.preventDefault()
			this.mouseMoveSwitsh = false
			$("body").css({cursor: "default"});
		});

		$("#canvas").on('click', (event) => {
			if (this.player.live) {
				$("body").css({cursor: "crosshair"});
				if(this.mouseMoveSwitsh) {
					if (event.pageX > (this.graphicsClass.SCREEN_WIDTH / 2)) {
						this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE * 2)
					} else {
						this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE * 2)
					}
				}
				if (this.mouseMoveSwitsh) this.spritesClass.startShot()
				this.mouseMoveSwitsh = true
			}
		});

		var lastMouseX = null;
		$(document).on('mousemove', (event) => {
			if (this.player.live) {
				if (!(this.menu.menuactive) && this.mouseMoveSwitsh && this.graphicsClass.orientationLicense) {
					var movementX = event.clientX;
					if(movementX != null) {
						if (movementX > lastMouseX) {
							this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE)
						} else {
							this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE)
						}
					}
					lastMouseX = movementX                
				}
			}
		});
	}

	changeRange(inputElement, elementId, variableName, newValue, clone) {
		if (inputElement && elementId) {
			if (newValue >= 0 && newValue <= 10) {
				inputElement.val(newValue)
				clone.menu[variableName] = newValue

				if (elementId == 'menu-musicvolume') {
					if (clone.soundClass.menuMusic) clone.soundClass.menuMusic.pause()
					if (clone.soundClass.gameMusic) clone.soundClass.gameMusic.pause()
					if (clone.soundClass.menuMusic) clone.soundClass.menuMusic = null
					if (clone.soundClass.gameMusic) clone.soundClass.gameMusic = null
					clone.soundClass.playMusic('menu1', 'menuMusic')
				}

				if (elementId == 'menu-sensitivity') {
					clone.soundClass.playSoundEvent('menu-ding', 1)
					if (newValue == 0) newValue = 0.5;
					this.MOVE_ANGLE = newValue
				}

				if (elementId == 'menu-soundvolume') {
					clone.soundClass.playSoundEvent('menu-ding', newValue / 10)
				}
			}
		}
	}

	strafeLeft() {
		let playerClone = {...this.player}
		playerClone.x = playerClone.x + (Math.cos(playerClone.angle - this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
		playerClone.y = playerClone.y + (Math.sin(playerClone.angle - this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
		let checkMove = this.movePlayer(playerClone, true)
		this.player.z = this.graphicsClass.amplitudeA(this.graphicsClass.WALKINTERVAL)
		if (checkMove.moveX) this.player.x = this.player.x + (Math.cos(this.player.angle - this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
		if (checkMove.moveY) this.player.y = this.player.y + (Math.sin(this.player.angle - this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
	}

	strafeRight() {
		let playerClone = {...this.player}
		playerClone.x = playerClone.x + (Math.cos(playerClone.angle + this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
		playerClone.y = playerClone.y + (Math.sin(playerClone.angle + this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
		let checkMove = this.movePlayer(playerClone, true)
		this.player.z = this.graphicsClass.amplitudeA(this.graphicsClass.WALKINTERVAL)
		if (checkMove.moveX) this.player.x = this.player.x + (Math.cos(this.player.angle + this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
		if (checkMove.moveY) this.player.y = this.player.y + (Math.sin(this.player.angle + this.graphicsClass.toRadians(90)) * this.moveSpeedHalf)
	}

	handleKeyPress = () => {
		if (this.player.live) {
			this.moveSpeedHalf = (this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel] / 3)		
			// DOUBLE KEYS
			if (this.keyPressed['shift'] && this.keyPressed['a']) {
				this.strafeLeft()
			} else if (this.keyPressed['shift'] && this.keyPressed['d']) {
				this.strafeRight()
			// MLI cheat
			} else if (this.keyPressed['m'] && this.keyPressed['l'] && this.keyPressed['i']) {
				this.menu.mapSwitch = false
				this.graphicsClass.cheat = true
				
				let content = `<div class="text-center"><h3 class='text-center'>If you know this code, you're an old-school cheater :P<br>Now you get life, ammo, keys, and the map.</h3></div>`
				this.graphicsClass.scrollInfoMaker(content, null, true)
				this.keyPressed['m'] = false; this.keyPressed['l'] = false; this.keyPressed['i'] = false;

				this.soundClass.playSoundEvent(`magic1`, 1); this.soundClass.playSoundEvent(`magic2`, 1);

				if (this.player.speedModes.actSpeedLevel < 4) this.player.speedModes.actSpeedLevel++;
				this.player.key1 = true; this.player.key2 = true; this.player.energy = 100;	this.player.ammoStar = 50; this.player.ammoFire = 50;
				this.player.adoptedWeapons.weapon2 = true;	this.player.adoptedWeapons.weapon3 = true;	this.player.adoptedWeapons.weapon4 = true;
				// this.player.goldScore = 0; this.player.silverScore = 0; this.player.copperScore = 0;
				$("#healt-percentage").css('color', 'white');
				this.player.map = true;

				this.graphicsClass.checkPlayerObjects()

			} else {
				// MONO KEYS
				if (this.keyPressed['a']) { this.player.move = true; this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE) }
				if (this.keyPressed['d']) { this.player.move = true; this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE)	}
				if (this.keyPressed['q'] || this.keyPressed['Insert']) { this.player.move = true; this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE_SLOW); }
				if (this.keyPressed['e'] || this.keyPressed['PageUp']) { this.player.move = true; this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE_SLOW); }
				if (this.keyPressed['w']) { this.player.move = true; this.player.speed = this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel] }
				if (this.keyPressed['s']) { this.player.move = true; this.player.speed = -this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel] }

				if (this.keyPressed['ArrowUp']) { this.player.move = true; this.player.speed = this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel] }
				if (this.keyPressed['ArrowDown']) { this.player.move = true; this.player.speed = -this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel] }
				if (this.keyPressed['ArrowLeft']) { this.player.move = true; this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE); }
				if (this.keyPressed['ArrowRight']) { this.player.move = true; this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE); }
			}
			this.keybordListener = requestAnimationFrame(this.handleKeyPress)
		}
	}

	add_optionsEventListeners() {
		// ADD OPTIONS
		var clone = this
		$('#graphicsratio-select').on('change', function(event) {
			event.preventDefault()
			let cloneThis = $(this)
			clone.graphicsratioSelectAction(clone, cloneThis)
		});

		$('#navigation-select, #shadows-select, #sky-select, #floor-select').on('change', function(event) {
			let variableName = $(this).attr('data-variablename')
			event.preventDefault()
			var selectedValue = $(this).val()
			if (selectedValue == '0') clone.menu[variableName] = false; else if (selectedValue == '1') clone.menu[variableName] = true;
			$(this).blur()
		});
	}

	graphicsratioSelectAction(clone, cloneThis) {
		let actRatios = (clone.graphicsClass.isMobile) ? clone.graphicsClass.GR_MOBIL : clone.graphicsClass.GR_DESKTOP;

		var selectedValue = cloneThis.val();
		if (selectedValue == actRatios[2]) {
			clone.graphicsClass.GRAPHICS_RATIO = actRatios[1]; cloneThis.val(actRatios[1])
		} else if (selectedValue == actRatios[1]) {
			clone.graphicsClass.GRAPHICS_RATIO = actRatios[0]; cloneThis.val(actRatios[0])
		} else if (selectedValue == actRatios[0]) {
			clone.graphicsClass.GRAPHICS_RATIO = actRatios[2]; cloneThis.val(actRatios[2])
		}

		cloneThis.blur()
		// GRAPHICS QUALITY CHANGE
		clone.graphicsClass.gameResize()
		clone.moveMenuStar(0)
				
		$('#graphicsratio-select').on('change', function(event) {
			event.preventDefault()
			let cloneThis = $(this)
			clone.graphicsratioSelectAction(clone, cloneThis)
		});
	}

	remove_optionsEventListeners() {
		// REMOVE OPTIONS
		$('#shadows-select').off('change')
		$('#navigation-select').off('change')
		$('#sky-select').off('change')
		$('#floor-select').off('change')
		$('#graphicsratio-seletc').off('change')
	}

	playerSpeedUp() {
		this.player.speedModes.actSpeedLevel
		this.player.speedModes.speedLevels[this.player.speedModes.actSpeedLevel]
	}

	mobileInputsListener() {
		$(document).on('mousedown touchstart', '.mobil-up', () => { if (!this.menu.menuactive) this.keyPressed['w'] = true });
		$(document).on('mouseup touchend', '.mobil-up', () => { if (!this.menu.menuactive) this.keyPressed['w'] = false; this.player.speed = 0; });
		$(document).on('mousedown touchstart', '.mobil-down', () => { if (!this.menu.menuactive) this.keyPressed['s'] = true });
		$(document).on('mouseup touchend', '.mobil-down', () => { if (!this.menu.menuactive) this.keyPressed['s'] = false; this.player.speed = 0; });
		$(document).on('mousedown touchstart', '.mobil-left', () => { if (!this.menu.menuactive) this.keyPressed['a'] = true });
		$(document).on('mouseup touchend', '.mobil-left', () => { if (!this.menu.menuactive) this.keyPressed['a'] = false; });
		$(document).on('mousedown touchstart', '.mobil-right', () => { if (!this.menu.menuactive) this.keyPressed['d'] = true });
		$(document).on('mouseup touchend', '.mobil-right', () => { if (!this.menu.menuactive) this.keyPressed['d'] = false; });
		$(document).on('mousedown touchstart', '.mobil-slowLeft', () => { if (!this.menu.menuactive) this.keyPressed['q'] = true });
		$(document).on('mouseup touchend', '.mobil-slowLeft', () => { if (!this.menu.menuactive) this.keyPressed['q'] = false });
		$(document).on('mousedown touchstart', '.mobil-slowRight', () => { if (!this.menu.menuactive) this.keyPressed['e'] = true });
		$(document).on('mouseup touchend', '.mobil-slowRight', () => { if (!this.menu.menuactive) this.keyPressed['e'] = false });
		$(document).on('mousedown touchstart', '.mobil-strafeLeft', () => { if (!this.menu.menuactive) { this.keyPressed['shift'] = true; this.keyPressed['a'] = true; }});
		$(document).on('mouseup touchend', '.mobil-strafeLeft', () => { if (!this.menu.menuactive) { this.keyPressed['shift'] = false; this.keyPressed['a'] = false }});
		$(document).on('mousedown touchstart', '.mobil-strafeRight', () => { if (!this.menu.menuactive) { this.keyPressed['shift'] = true; this.keyPressed['d'] = true; }});
		$(document).on('mouseup touchend', '.mobil-strafeRight', () => { if (!this.menu.menuactive) { this.keyPressed['shift'] = false; this.keyPressed['d'] = false }});

		$(document).on('mousedown touchstart', '.mobil-exit', () => this.gamePushEsc());
		$(document).on('mousedown touchstart', '.mobil-fire', () => { if (this.player.live) { this.playerFire() }});
		$(document).on('mousedown touchstart', '.mobil-open', () => { if (this.player.live) { this.playerOpen() }});
		$(document).on('mousedown touchstart', '.mobil-map', () => {
			if (!this.menu.menuactive && this.player.live) {
				if (!this.menu.mobileMapButtonAction) {
					this.menu.mapSwitch = !this.menu.mapSwitch;
					this.menu.mobileMapButtonAction = setTimeout(()=>{
						this.menu.mobileMapButtonAction = null
					},200);
				}
			}
		});

		$(document).on('mousedown touchstart', '#ammo-star', () => { this.player.weapon = 0 });
		$(document).on('mousedown touchstart', '#ammo-fire', () => { this.player.weapon = 0 });
		$(document).on('mousedown touchstart', '#weapon1', () => this.graphicsClass.changeWeapon(1));
		$(document).on('mousedown touchstart', '#weapon2', () => this.graphicsClass.changeWeapon(2));
		$(document).on('mousedown touchstart', '#weapon3', () => this.graphicsClass.changeWeapon(3));
		$(document).on('mousedown touchstart', '#weapon4', () => this.graphicsClass.changeWeapon(4));
	}

	fullScreen() {
		var elem = document.documentElement; 

		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			// Firefox
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			// Chrome, Safari, Opera
			elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) { 
			// Internet Explorer/Edge
			elem.msRequestFullscreen();
		}
	}

	exitFullScreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}
}
