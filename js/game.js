// ---------------------------------------------------------
// 			TuccMann Ray Engine - The Acient Law
//	 The code will debut on qbparty on September 20, 2024. 
// 					#game-development
// 			Let's connect: tuccmann@gmail.com
// ---------------------------------------------------------

import SoundClass from './sound-class.js'
import GaphicsClass from './graphics-class.js'
import InputsClass from './input-class.js'
import TexturesClass from './textures-class.js'
import MapDataClass from './mapdata-class.js'
import SpritesClass from './sprites-class.js'

const CLOCKSIGNAL = 49
const CELL_SIZE = 64

const player = {
	live: true,
	x: CELL_SIZE * 1.5,
	y: CELL_SIZE * 1.5,
	z: 0,
	inX: null,
	inY: null,
	move: true,
	angle: 0,
	speed: 0,
	speedModes: {
		actSpeedLevel: 0,
		speedLevels: [10, 11, 12, 13, 14],
	},
	goldScore: 0,
	silverScore: 0,
	copperScore: 0,
	weapon: 1,
	adoptedWeapons: {
		weapon1: true,
		weapon2: false,
		weapon3: false,
		weapon4: false,
	},
	weaponsDamage: [0, 1, 2, 3, 4],
	ammoStar: 0,
	ammoFire: 0,
	shoting: false,
	shoting_anim: null,
	shoting_anim_actFrame: 0,
	shoting_anim_time: [0, 80, 50, 20, 105],
	poison: false,
	energy: 10,
	shotTime: 100,
	map: false,
	key1: false,
	key2: false,
}

const menu = {
	actualMenuRow: 0,
	menuactive: true,
	infoactive: false,
	optionsActive: false,
	mapSwitch: false,
	shadowsSwitch: true,
	mouseSwitch: true,
	floorSwitch: true,
	skySwitch: true,
	navigationSwitch: false,
	sensitivity: 3,
	soundVolume: 8,
	musicVolume: 3,
}

var gamePlay = {
	game: null,
	firstFrame: true,
	gameLoaded: false,
	nextLevel: false,
	startStory: false,
	endStory: false,
	timeStart: null,
	musicName: null,
	goldScore: 0,
	silverScore: 0,
	copperScore: 0,
	enemys: 0,
	secrets: 0,
	get_goldScore: 0,
	get_silverScore: 0,
	get_copperScore: 0,
	get_enemys: 0,
	wall_enemys: 0,
	get_secrets: 0,
	all_goldScore: 0,
	all_silverScore: 0,
	all_copperScore: 0,
	all_enemys: 0,
	all_secrets: 0,
}

var startStory = false;

var check = {
	directions: [],
	playerCheckX: 0,
	playerCheckY: 0,

	creatureCheckX: null,
	creatureCheckY: null,
}

var ammoDeleteBuffer = []

var keyPressed = {}
var userInteraction = false

// -------------------------

function checkMoveSprite(spriteObj, type = null, inputStrafeCheck = null) {
	var actX = Math.floor(spriteObj.x / CELL_SIZE)
	var actY = Math.floor(spriteObj.y / CELL_SIZE)
	spriteObj.inX =  Math.floor(spriteObj.x - (actX * CELL_SIZE))
	spriteObj.inY =  Math.floor(spriteObj.y - (actY * CELL_SIZE))

	let WALL_DISTANCE
	if (type == 'player') WALL_DISTANCE = inputClass.PLAYER_WALL_DISTANCE
	if (type == 'creature') WALL_DISTANCE = inputClass.CREATURE_WALL_DISTANCE
		
	var moveX = true
	var moveY = true
	
	let soAngleDirection = []
	let firstAngleDirection = []

	firstAngleDirection = inputClass.checkDirection(graphicsClass.toAngle(spriteObj.angle), spriteObj.speed)
		
	if (inputStrafeCheck) {
		soAngleDirection[0] = {x: actX, y: actY - 1, stopF:2, stopB:6}
		soAngleDirection[1] = {x: actX - 1, y: actY - 1, stopF:1, stopB:5}
		soAngleDirection[2] = {x: actX + 1, y: actY - 1, stopF:3, stopB:7}
		soAngleDirection[3] = {x: actX + 1, y: actY, stopF:4, stopB:4}
		soAngleDirection[4] = {x: actX - 1, y: actY, stopF:8, stopB:8}

		soAngleDirection[5] = {x: actX - 1, y: actY + 1, stopF:7, stopB:3 }
		soAngleDirection[6] = {x: actX, y: actY + 1, stopF:6, stopB:2 }
		soAngleDirection[7] = {x: actX + 1, y: actY + 1, stopF:5, stopB:1 }
	} else
	if (firstAngleDirection.way == 'right') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:4, stopB:8}
		soAngleDirection[1] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y - 1, stopF:3, stopB:1}
		soAngleDirection[2] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y + 1, stopF:5, stopB:7}
		soAngleDirection[3] = {x: actX, y: actY - 1, stopF:2, stopB:2}
		soAngleDirection[4] = {x: actX, y: actY + 1, stopF:6, stopB:6}
	} else
	if (firstAngleDirection.way == 'right-down') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:5, stopB:1}
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y + (- 1 * firstAngleDirection.sign), stopF:4, stopB:8}
		soAngleDirection[2] = {x: soAngleDirection[0].x  + (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:6, stopB:2}
	} else
	if (firstAngleDirection.way == 'down') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:6, stopB:2 }
		soAngleDirection[1] = {x: actX + firstAngleDirection.x + 1, y: actY + firstAngleDirection.y, stopF:5, stopB:3 }
		soAngleDirection[2] = {x: actX + firstAngleDirection.x - 1, y: actY + firstAngleDirection.y, stopF:7, stopB:1 }
		soAngleDirection[3] = {x: actX - 1, y: actY,  stopF:8, stopB:8}
		soAngleDirection[4] = {x: actX + 1, y: actY,  stopF:4, stopB:4}
	} else
	if (firstAngleDirection.way == 'left-down') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y,  stopF:7, stopB:3 }
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y + (- 1 * firstAngleDirection.sign), stopF:8, stopB:4}
		soAngleDirection[2] = {x: soAngleDirection[0].x  - (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:6, stopB:2}
	} else
	if (firstAngleDirection.way == 'left') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:8, stopB:4}
		soAngleDirection[1] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y + 1, stopF:7, stopB:5}
		soAngleDirection[2] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y - 1, stopF:1, stopB:3}
		soAngleDirection[3] = {x: actX, y: actY - 1, stopF:2, stopB:2}
		soAngleDirection[4] = {x: actX, y: actY + 1, stopF:6, stopB:6}
	} else
	if (firstAngleDirection.way == 'left-up') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:1, stopB:5}
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y - (- 1 * firstAngleDirection.sign), stopF:8, stopB:4}
		soAngleDirection[2] = {x: soAngleDirection[0].x  - (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:2, stopB:6}
	} else
	if (firstAngleDirection.way == 'up') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:2, stopB:6}
		soAngleDirection[1] = {x: actX + firstAngleDirection.x - 1, y: actY + firstAngleDirection.y, stopF:1, stopB:7}
		soAngleDirection[2] = {x: actX + firstAngleDirection.x + 1, y: actY + firstAngleDirection.y, stopF:3, stopB:5}
		soAngleDirection[3] = {x: actX + 1, y: actY, stopF:4, stopB:4}
		soAngleDirection[4] = {x: actX - 1, y: actY, stopF:8, stopB:8}
	} else
	if (firstAngleDirection.way == 'right-up') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:3, stopB:7}
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y - (- 1 * firstAngleDirection.sign), stopF:4, stopB:8}
		soAngleDirection[2] = {x: soAngleDirection[0].x  + (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:2, stopB:6}
	}

	// FIRST CHACK WAY
	let checkX = soAngleDirection[0].x
	let checkY = soAngleDirection[0].y

	if (type == 'player') {
		// BECAUSE ENEMY WALL
		check.directions = []
		check.directions = soAngleDirection
		if (typeof soAngleDirection[0] !='undefined' && typeof soAngleDirection[0].y != 'undefined') check.playerCheckY = soAngleDirection[0].y
		if (typeof soAngleDirection[0] !='undefined' && typeof soAngleDirection[0].x != 'undefined') check.playerCheckX = soAngleDirection[0].x
	}
	
	var spriteBarrier = []

	soAngleDirection.forEach(brick => {
		let checkMap = false
		if (typeof mapDataClass.map[brick.y] !='undefined' && typeof mapDataClass.map[brick.y][brick.x] != 'undefined') checkMap = (mapDataClass.map[brick.y][brick.x] != 0) ? true : false;
		
		checkMap = (checkMap && player.poison && mapDataClass.map[brick.y][brick.x].id == 230) ? false : checkMap;

		let checkIsPlayer = false
		if (type == 'creature') checkIsPlayer = (Math.floor(player.y / CELL_SIZE) == brick.y && Math.floor(player.x / CELL_SIZE) == brick.x) ? true : false;

		let checkBlock = spritesClass.checkSpriteData(brick.y, brick.x, 'type', 'block')
		let checkBlockValue = (checkBlock && checkBlock.material == 'fix') ? true : false;
		
		let checkObject = spritesClass.checkSpriteData(brick.y, brick.x, 'type', 'object')
		let checkObjectValue = (checkObject && checkObject.material != 'ghost') ? true : false;

		let checkCreatures = spritesClass.checkSpriteData(brick.y, brick.x, 'type', 'creature')
		let checkCreaturesValue = (checkCreatures && checkCreatures.material != 'ghost') ? true : false;
		
		if (checkMap || checkBlockValue || checkObjectValue || checkCreaturesValue || checkIsPlayer) {
			let actualNumber = (firstAngleDirection.sign > 0) ? brick.stopF : brick.stopB;
			if (!spriteBarrier.includes(actualNumber)) spriteBarrier.push(actualNumber)
		}
	});

	var deleteBarier = function(spriteBarrier, barrierId) {
		let findId = spriteBarrier.findIndex(barrier => barrier == barrierId)
		if (findId != -1) spriteBarrier.splice(findId, 1)
	}

	let deleteBarrierArray = [];

	spriteBarrier.forEach((barrier) => {
		if (barrier == 4) {
			if (spriteBarrier.includes(3)) deleteBarrierArray.push(3);
			if (spriteBarrier.includes(5)) deleteBarrierArray.push(5);
		}
		if (barrier == 8) {
			if (spriteBarrier.includes(1)) deleteBarrierArray.push(1);
			if (spriteBarrier.includes(7)) deleteBarrierArray.push(7);
		}
		if (barrier == 6) {
			if (spriteBarrier.includes(7)) deleteBarrierArray.push(7);
			if (spriteBarrier.includes(5)) deleteBarrierArray.push(5);
		}
		if (barrier == 2) {
			if (spriteBarrier.includes(1)) deleteBarrierArray.push(1);
			if (spriteBarrier.includes(3)) deleteBarrierArray.push(3);
		}
	});

	if (type == 'creature' || type == 'ammo') {
		deleteBarrierArray.push(1, 3, 5, 7)
	}

	deleteBarrierArray.forEach((barrier) => {
		deleteBarier(spriteBarrier, barrier)
	});

	spriteBarrier.forEach((barrier) => {
		if (barrier == 4 && (spriteObj.inX > CELL_SIZE - WALL_DISTANCE))	moveX = false;
		if (barrier == 8 && (spriteObj.inX < WALL_DISTANCE))	moveX = false;
		if (barrier == 6 && (spriteObj.inY > CELL_SIZE - WALL_DISTANCE)) moveY = false;
		if (barrier == 2 && (spriteObj.inY < WALL_DISTANCE)) moveY = false;
		
		if (barrier == 3 && (spriteObj.inY <= WALL_DISTANCE && spriteObj.inX >= CELL_SIZE - WALL_DISTANCE)) { moveX = false; moveY = false; }
		if (barrier == 5 && (spriteObj.inY >= CELL_SIZE - WALL_DISTANCE && spriteObj.inX >= CELL_SIZE - WALL_DISTANCE)) { moveX = false; moveY = false; }
		if (barrier == 7 && (spriteObj.inY >= CELL_SIZE - WALL_DISTANCE && spriteObj.inX <= WALL_DISTANCE)) { moveX = false; moveY = false; }
		if (barrier == 1 && (spriteObj.inY <= WALL_DISTANCE && spriteObj.inX <= WALL_DISTANCE)) { moveX = false; moveY = false; }
	});

	return {
		WALL_DISTANCE: WALL_DISTANCE,
		spriteBarrier: spriteBarrier,
		moveX: moveX,
		moveY: moveY,
		checkX: checkX,
		checkY: checkY,
	}
}

function movePlayer(bringPlayer, inputStrafeCheck) {

	let playerActX = Math.floor(bringPlayer.x / CELL_SIZE)
	let playerActY = Math.floor(bringPlayer.y / CELL_SIZE)

	// WALL CREATURE ATTACK
	for(const [key, value] of Object.entries(mapDataClass.wayCordinates)) {
		let checkEnemyWall = mapDataClass.map[playerActY + value.y][playerActX + value.x]
		
		if (checkEnemyWall.type == 'creature' && checkEnemyWall.energy > 0 && player.live) {
			spritesClass.damage(bringPlayer, checkEnemyWall, true)

			if (checkEnemyWall.anim_switch && !checkEnemyWall.playing_sound_attack) {
				soundClass.playSoundEvent('plant-eat1', 0.8)
				checkEnemyWall.playing_sound_attack = setTimeout(() => {
					checkEnemyWall.playing_sound_attack = null
				}, 1000);
			}

			let colorizeOption = { color: "255, 0, 0", alpha: 0.2, time: 5 }
			graphicsClass.screenColorizeOptions(colorizeOption);
		}
	}

	if (bringPlayer.move || inputStrafeCheck) {
		
		bringPlayer.move = false
		var pCheck = checkMoveSprite(bringPlayer, 'player', inputStrafeCheck)
		
		// Controlling the sprite relative to the player's movement.
		spritesClass.sprites.forEach((sprite) => {
			let spriteActX = Math.floor(sprite.x / CELL_SIZE)
			let spriteActY = Math.floor(sprite.y / CELL_SIZE)

			// WAY PLAYER BRICK
			if ((pCheck.checkX == spriteActX) && (pCheck.checkY == spriteActY)) {					
				if (sprite.type == 'block') return;
				if (sprite.material == 'ghost') return;
				if (sprite.type == 'creature') {
					sprite.moveType = 'attack'
					return;
				}
			}

			// ACTUAL PLAYER BRICK
			if ((spriteActX == playerActX) && (spriteActY == playerActY)) {

				// PICKUP COINS
				if (sprite.active == true && sprite.mode.includes("coin")) {
					sprite.active = false
					bringPlayer.score = parseInt(bringPlayer.score) + parseInt(sprite.value)
					// COLORIZE SCREEN
					let colorizeOption = {}
					if (sprite.mode=='coin1') {
						bringPlayer.goldScore = parseInt(bringPlayer.goldScore) + parseInt(sprite.value)
						$('#coin-gold-text').text(bringPlayer.goldScore)
						colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
					}
					if (sprite.mode=='coin2') {							
						bringPlayer.silverScore = parseInt(bringPlayer.silverScore) + parseInt(sprite.value)
						$('#coin-silver-text').text(bringPlayer.silverScore)
						colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
					}
					if (sprite.mode=='coin3') {
						bringPlayer.copperScore = parseInt(bringPlayer.copperScore) + parseInt(sprite.value)
						$('#coin-copper-text').text(bringPlayer.copperScore)
						colorizeOption = { color: "200, 100, 0", alpha: 0.5, time: 200 }
					}
					graphicsClass.screenColorizeOptions(colorizeOption);
					if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 0.5)
					return;
				}

				// PICKUP MASHROOM
				if (sprite.active == true && sprite.mode == 'mushroom') {
					sprite.active = false

					soundClass.playSoundEvent('magic1', 1)
					soundClass.playSoundEvent('plant-eat1', 1)

					bringPlayer.poison = !bringPlayer.poison

					if (userInteraction && soundClass.gameMusic) soundClass.gameMusic.pause();

					if (bringPlayer.poison) {						
						bringPlayer.musicNameSave = gamePlay.musicName
						gamePlay.musicName = 'mushroom'
					} else {
						graphicsClass.FOV = graphicsClass.toRadians(60)
						gamePlay.musicName = bringPlayer.musicNameSave
					}

					soundClass.playMusic(gamePlay.musicName, 'gameMusic')
					return;
				}

				// PICKUP MAP
				if (sprite.active == true && sprite.mode == 'map') {
					sprite.active = false
					bringPlayer.map = true

					if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)

					let colorizeOption = { color: "255, 240, 180", alpha: 0.5, time: 200 }
					graphicsClass.screenColorizeOptions(colorizeOption)

					let content = `<div class="text-center"><h3 class='text-center'>You picked up the map</h3><div class="mx-auto">If you want to use the map, press the "m" key.</div></div>`
					graphicsClass.scrollInfoMaker(content, inputClass.messageTime)

					return;
				}

				// PICKUP HEALTS
				if (sprite.active == true && sprite.mode == 'energy') {
					if (bringPlayer.energy < 100) {
						sprite.active = false
						bringPlayer.energy += sprite.value
						if (bringPlayer.energy>100) bringPlayer.energy = 100

						if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)

						if ((Math.floor(Math.random()*16) == 0)) {
							soundClass.playSoundEvent('healthfun', 1)
						} else {
							if (Math.floor(Math.random()*2)) soundClass.playSoundEvent('health1', 1)
							else soundClass.playSoundEvent('health2', 1)
						}
						
						$("#healt-percentage").text(bringPlayer.energy + '%');
						$("#healt-percentage").css('color', 'green');
						spritesClass.playerHealtTimeOut(bringPlayer.energy)

						let colorizeOption = { color: "60, 175, 215", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption)
					}
					return;
				}

				// PICKUP SPEED
				if (sprite.active == true && sprite.mode == 'speed') {
					sprite.active = false

					if (player.speedModes.speedLevels.length - 1 > player.speedModes.actSpeedLevel) {
						player.speedModes.actSpeedLevel++;
						$(`#val${player.speedModes.actSpeedLevel}`).addClass(`val${player.speedModes.actSpeedLevel}-on`)
					}

					if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)

					let colorizeOption = { color: "222, 125, 210", alpha: 0.5, time: 200 }
					graphicsClass.screenColorizeOptions(colorizeOption)
					return;
				}

				// PICKUP KEYS
				if (sprite.active == true && sprite.mode.includes("key")) {
					
					let colorizeOption = {}
					if (sprite.type == 'object' && sprite.mode=='key1') {
						bringPlayer.key1 = true
						sprite.active = false
						if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)
						$('#silver-key').addClass('silver-key-on')
						colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption);
					}
					if (sprite.type == 'object' && sprite.mode=='key2') {
						bringPlayer.key2 = true
						sprite.active = false
						if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)
						$('#gold-key').addClass('gold-key-on')
						colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption);
					}
					return;
				}

				// PICKUP WEAPONS
				if (sprite.active == true && sprite.mode.includes("weapon")) {
											
					if (sprite.type == 'object' && sprite.mode=='weapon2') {
						bringPlayer.adoptedWeapons.weapon2 = true
						bringPlayer.weapon = 2
						sprite.active = false
						$('#weapon2').addClass('weapon2-on')
						if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)
						let colorizeOption = {}; colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption)
						return;
					}

					if (sprite.type == 'object' && sprite.mode=='weapon3') {
						
						var soundName = (sprite.sound) ? sprite.sound : null;

						$('#weapon3').addClass('weapon3-on')

						if (!bringPlayer.adoptedWeapons.weapon3) {
							bringPlayer.weapon = 3
							bringPlayer.adoptedWeapons.weapon3 = true
							sprite.active = false
						} else {
							soundName="weapon3-ammo"
						}

						if (player.ammoStar < 100) {
							sprite.active = false
							player.ammoStar = player.ammoStar + 6
							player.ammoStar = (player.ammoStar > 100) ? 100 : player.ammoStar;
							$('#ammo-star-text').html(player.ammoStar)
						} else {
							return;
						}

						if (soundName) soundClass.playSoundEvent(soundName, 1)
						let colorizeOption = {}; colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption)
						return;
					}

					if (sprite.type == 'object' && sprite.mode=='weapon4') {
						bringPlayer.weapon = 4
						bringPlayer.adoptedWeapons.weapon4 = true
						sprite.active = false
						$('#weapon4').addClass('weapon4-on')

						if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)
						let colorizeOption = {}; colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption)
						return;
					}
				}

				// PICKUP WEAPON4 AMMO
				if (sprite.active == true && sprite.mode == 'weapon4ammo') {

					if (player.ammoFire < 100) {
						sprite.active = false
						
						player.ammoFire = player.ammoFire + 5
						player.ammoFire = (player.ammoFire > 100) ? 100 : player.ammoFire;
						$('#ammo-fire-text').html(player.ammoFire)

						if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)
						
						let colorizeOption = { color: "255, 200, 0", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption)
						return;
					}
				}
				
				// PICKUP SCROLLS
				if (sprite.active == true && sprite.mode == 'message') {
					sprite.active = false
					if (sprite.sound) soundClass.playSoundEvent(sprite.sound, 1)
					let content = `<div class="text-center"><h3 class='text-center'>${sprite.message}</h3></div>`
					let useButton = (sprite.time == 0) ? true : false;
					graphicsClass.scrollInfoMaker(content, sprite.time, useButton)
					return;
				}
			}

			// EXIT
			let checkExit = spritesClass.checkSpriteData(player.y, player.x, 'mode', 'exit', 'position')				
			if (checkExit) {
				gamePlay.nextLevel = true
				return;
			}
		})

		let barrier = moveAction(bringPlayer, pCheck, inputStrafeCheck, true)

		// Hits the wall sound
		if (typeof barrier == 'number') soundClass.playSoundEvent('wall-hit1', 0.3)
		
		if (bringPlayer.live) bringPlayer.z = graphicsClass.amplitudeA(graphicsClass.WALKINTERVAL);
				
		if (bringPlayer.speed < 0) {
			bringPlayer.speed = 1
			bringPlayer.move = true
		}
	}

	return pCheck;
}

function moveAmmoAction(ammo) {
	var haveCrash = false

	var moveX = true
	var moveY = true
	let testX = ammo.x + Math.cos(ammo.angle) * ammo.speed;
	let testY = ammo.y + Math.sin(ammo.angle) * ammo.speed;
	let testActY = Math.floor(testY / CELL_SIZE)
	let testActX = Math.floor(testX / CELL_SIZE)

	if(mapDataClass.map[testActY][testActX]) {
		haveCrash = true
	} else {
		// MOVE
		ammo.x = testX
		ammo.y = testY
	}

	return {
		WALL_DISTANCE: inputClass.AMMO_WALL_DISTANCE,
		moveX: moveX,
		moveY: moveY,
		checkX: testActX,
		checkY: testActY,
		haveCrash: haveCrash,
	}
}

function moveAction(sprite, check, inputStrafeCheck, isPlayer) {

	var speed = sprite.speed
	let testX = (check.moveX) ? sprite.x + Math.cos(sprite.angle) * speed : sprite.x;
	let testY = (check.moveY) ? sprite.y + Math.sin(sprite.angle) * speed : sprite.y;
	let testActX = Math.floor(testX / CELL_SIZE)
	let testActY = Math.floor(testY / CELL_SIZE)
	let playerActX = Math.floor(sprite.x / CELL_SIZE)
	let playerActY = Math.floor(sprite.y / CELL_SIZE)
	let realCheck = {}

	if (isPlayer) {
		if (playerActX == testActX && playerActY == testActY) {
			realCheck = check
		} else {
			check.spriteBarrier = []
			
			let playerEdge = {... sprite}
			playerEdge.x = testX
			playerEdge.y = testY
	
			realCheck = checkMoveSprite(playerEdge, 'player', inputStrafeCheck, true)
		}
	} else {
		realCheck = check
	}

	// TEST START
	let testInX = Math.floor(testX - (testActX * CELL_SIZE))
	let testInY = Math.floor(testY - (testActY * CELL_SIZE))

	var crash = false

	realCheck.spriteBarrier.forEach((barrier) => {
		const FAR = CELL_SIZE - realCheck.WALL_DISTANCE
		const NEAR = realCheck.WALL_DISTANCE
		const maxX = (testActX * CELL_SIZE) + (FAR)
		const minX = (testActX * CELL_SIZE) + (NEAR)
		const maxY = (testActY * CELL_SIZE) + (FAR)
		const minY = (testActY * CELL_SIZE) + (NEAR)

		if (barrier == 4 && (testInX > FAR)) {
			sprite.wallCrash = 4
			testX = maxX
			crash = 4
		}
		if (barrier == 8 && (testInX < NEAR)) {
			sprite.wallCrash = 8
			testX = minX
			crash = 8
		}
		if (barrier == 6 && (testInY > FAR)) {
			sprite.wallCrash = 6
			testY = maxY
			crash = 6
		}
		if (barrier == 2 && (testInY < NEAR)) {
			sprite.wallCrash = 2
			testY = minY
			crash = 2
		}
		if (barrier == 3 && (testInY <= NEAR && testInX >= FAR)) {
			testX = maxX
			testY = minY
			crash = 3
		}
		if (barrier == 5 && (testInY >= FAR && testInX >= FAR)) {
			testX = maxX
			testY = maxY
			crash = 5
		}
		if (barrier == 7 && (testInY >= FAR && testInX <= NEAR)) {
			testX = minX
			testY = maxY
			crash = 7
		}
		if (barrier == 1 && (testInY <= NEAR && testInX <= NEAR)) {
			testX = minX
			testY = minY
			crash = 1
		}
	});
	
	// MOVE
	sprite.x = testX
	sprite.y = testY

	return crash;
}

function moveCreature(creature) {
	let playerActX = Math.floor(player.x / CELL_SIZE)
	let playerActY = Math.floor(player.y / CELL_SIZE)
	
	function attackTexture(creature) {
		if (!creature.anim_attack_function) {
			creature.anim_attack_actFrame = `${creature.dirConstruction[0]}_E1`
			creature.anim_attack_function = setInterval(() => {
				creature.anim_attack_actFrame = (creature.anim_attack_actFrame == `${creature.dirConstruction[0]}_E1`) ? `${creature.dirConstruction[0]}_E2` : `${creature.dirConstruction[0]}_E1`;			
			}, parseInt(creature.anim_speed))
		}
	}

	if (typeof creature.speed != 'undefined' && creature.speed != 0) {
		creature.cCheck = checkMoveSprite(creature, 'creature')
		let cCheck = creature.cCheck

		check.creatureCheckX = cCheck.checkX
		check.creatureCheckY = cCheck.checkY

		// HIT PLAYER
		if (player.live && (playerActX == cCheck.checkX) && (playerActY == cCheck.checkY) && !creature.anim_die_actFrame) {		
			if (creature.dirConstruction.some(name => name.includes('ninja1'))) {
				creature.moveType = 'attack'
				if (creature.speed > 0) creature.speed = -creature.speed
			}

			creature.move = false

			if (creature.sound) {
				if (!creature.sound_function) {

					let randSoundNum = Math.floor(Math.random() * creature.sound[0].length)
					soundClass.playSoundEvent(creature.sound[0][randSoundNum], soundClass.calculateDistance(creature.distance))

					creature.sound_function = setTimeout(() => {
						clearTimeout(creature.sound_function)
						creature.sound_function = null
					}, creature.anim_speed);
				}
			}

			spritesClass.damage(player, creature, true)

			// ATTACK TEXTURE
			attackTexture(creature)

			let colorizeOption = { color: "255, 0, 0", alpha: 0.2, time: 5 }
			graphicsClass.screenColorizeOptions(colorizeOption);
		} else {
			// NORMAL CREATURE WALK

			// MOVE CREATURE
			creature.move = true

			// DELETE ATTACK CREATURE
			if (creature.anim_attack_function) {
				clearInterval(creature.anim_attack_function)
				creature.anim_attack_function = null
			}

			// IF FIX SPRITE	angel:180
			let checkMapSprite = spritesClass.checkSpriteData(creature.y, creature.x, 'type', 'object', 'position')
			if (checkMapSprite && checkMapSprite.material == 'fix') creature.angle += (Math.PI / 2)

			// IF DOOR
			let checkDoor = spritesClass.checkSpriteData(creature.y, creature.x, 'mode', 'door', 'position')
			if (checkDoor && checkDoor.material == 'fix') creature.angle += (Math.PI / 2)

			// IF BLOCK
			let checkBlock = spritesClass.checkSpriteData(creature.y, creature.x, 'type', 'block', 'position')
			if (checkBlock && checkBlock.mode != 'door' && checkBlock.material != 'ghost') creature.angle += (Math.PI / 2)

			// DIE CREATURE
			if (creature.anim_die_function) return;
			
			// MOVE MODES
			if (creature.moveType == 'stay') return;

			if (creature.moveType == 'levitation') {
				creature.z = graphicsClass.amplitudeA(graphicsClass.WALKINTERVAL)
				return;
			}

			// MOVE CREATURE
			if (creature.moveType == 'patrol') {
				if (typeof creature.wallCrash != 'undefined' && creature.wallCrash != null) {
					let wall = creature.wallCrash
					creature.wallCrash = null
					creature.x = Math.floor((creature.x / CELL_SIZE)) * CELL_SIZE + (CELL_SIZE / 2)
					creature.y = Math.floor((creature.y / CELL_SIZE)) * CELL_SIZE + (CELL_SIZE / 2)
					
					let creatureMapX = Math.floor(creature.x / CELL_SIZE)
					let creatureMapY = Math.floor(creature.y / CELL_SIZE)
					let alterWays = {... mapDataClass.wayBarriers}
					
					delete alterWays[wall];
					mapDataClass.wayCordinates.forEach(way => {
						if (typeof mapDataClass.map[creatureMapY + way.y] != 'undefined' && typeof mapDataClass.map[creatureMapY + way.y][creatureMapX + way.x] != 'undefined') {
							if (mapDataClass.map[creatureMapY + way.y][creatureMapX + way.x] != 0) delete alterWays[way.barrier]
						}

						let wayCheckBlock = spritesClass.checkSpriteData(creatureMapY + way.y, creatureMapX + way.x, 'type', 'block')
						if (wayCheckBlock && wayCheckBlock.active && wayCheckBlock.material == 'fix') {
							delete alterWays[way.barrier]
						}
						
						let wayCheckObject = spritesClass.checkSpriteData(creatureMapY + way.y, creatureMapX + way.x, 'type', 'object')						
						if (wayCheckObject && wayCheckObject.active && wayCheckObject.material == 'fix') {
							delete alterWays[way.barrier]
						}

						let wayCheckCreature = spritesClass.checkSpriteData(creatureMapY + way.y, creatureMapX + way.x, 'type', 'creature')
						if (wayCheckCreature && wayCheckCreature.active) {
							delete alterWays[way.barrier]
						}
					});

					let wayBarriers = Object.keys(alterWays)
					let barriersLength = wayBarriers.length

					if (barriersLength > 0) {
						// RANDOM WAY
						let randomBarrier =  Math.floor(Math.random() * (barriersLength))
						creature.angle = graphicsClass.toRadians(alterWays[wayBarriers[randomBarrier]])
					}
				}
			}

			// IF EFFECT
			let checkEffect = spritesClass.checkSpriteData(creature.y, creature.x, 'type', 'effect', 'position')
			if (checkEffect) if (checkEffect.mode == 'direction') {
				if ((creature.inY >=inputClass.CREATURE_WALL_DISTANCE && creature.inY <= CELL_SIZE - inputClass.CREATURE_WALL_DISTANCE) &&
					(creature.inX >=inputClass.CREATURE_WALL_DISTANCE && creature.inX <= CELL_SIZE - inputClass.CREATURE_WALL_DISTANCE)) creature.angle = checkEffect.angle;
			}

			// IF ATTACK CREATURE
			if (creature.moveType == 'attack') {
				let distanceX = player.x - creature.x;
				let distanceY = player.y - creature.y;
				
				creature.angle = Math.atan2(distanceY, distanceX);

				if (!cCheck.moveX && !((creature.inY >=32 && creature.inY <=32) && cCheck.moveY)) {
					cCheck.moveY = false
				}
				if (!cCheck.moveY && !((creature.inX >=32 && creature.inX <=32) && cCheck.moveX)) {
					cCheck.moveX = false
				}

				// Ninja1
				if (creature.dirConstruction.some(name => (name.includes('ninja1') || name.includes('boss')))) {

					// Ninja1 Star Drop
					if (player.live && !creature.starDropTime) {
						attackTexture(creature)
						spritesClass.startEnemyShot(creature)
						creature.starDropTime = setTimeout(() => {
							creature.starDropTime = null
							creature.anim_attack_function = null
						}, parseInt(creature.droptime));
					}

					// CHECK BACK WALL
					let distance = -(CELL_SIZE / 2)
					let testX = Math.floor((creature.x + (Math.cos(creature.angle) * distance)) / CELL_SIZE)
					let testY = Math.floor((creature.y + (Math.sin(creature.angle) * distance)) / CELL_SIZE)
					
					if (mapDataClass.map[testY][testX]) {
						creature.moveType = 'patrol'
						creature.speed = Math.abs(creature.speed)
					}
				}

				// BACK PATROL
				if (!cCheck.moveY && !cCheck.moveX) {
					creature.moveType = 'patrol'
					if (creature.speed >= 4) creature.speed = creature.speed - 2
					creature.speed = Math.abs(creature.speed)
				}
			}
			// MOVE
			if (creature.move) moveAction(creature, cCheck, false)
		}
	}
}

function turnOffAmmo(ammoSprite) {
	ammoSprite.move = false
	ammoSprite.anim_switch = false
	ammoSprite.anim_actFrame = ammoSprite.dirConstruction.length - 1
	
	ammoSprite.endFunction = setTimeout(() => {
		ammoSprite.active = false
		clearTimeout(ammoSprite.endFunction);
		ammoSprite.endFunction = null;
	}, 10)
}

function moveAmmo(ammoSprite) {
	if (ammoSprite.speed != 0) {

		let playerActX = Math.floor(player.x / CELL_SIZE)
		let playerActY = Math.floor(player.y / CELL_SIZE)
		let ammoActX = Math.floor(ammoSprite.x / CELL_SIZE)
		let ammoActY = Math.floor(ammoSprite.y / CELL_SIZE)

		// HIT AMMO STAR
		if (!ammoSprite.playerAmmo && playerActX == ammoActX && playerActY == ammoActY) {
			turnOffAmmo(ammoSprite)
			ammoDeleteBuffer.push(ammoSprite)
			spritesClass.damage(player, ammoSprite, true)
		}

		let ammoCheck = moveAmmoAction(ammoSprite)
		
		// CHECK HIT SPRITES
		let checkSprites = spritesClass.sprites.filter(obj => Math.floor(obj.y / CELL_SIZE) == ammoCheck.checkY && Math.floor(obj.x / CELL_SIZE) == ammoCheck.checkX)
		checkSprites.forEach((findSprite) => {
			if ((findSprite.type == 'creature' && findSprite.material == 'enemy' && findSprite.active)) {
				spritesClass.enemyHit(findSprite)
				// DELETE AMMO
				turnOffAmmo(ammoSprite)
				ammoDeleteBuffer.push(ammoSprite)
			}

			if ((findSprite.type == 'block' && findSprite.material == 'fix') || (findSprite.type == 'object' && findSprite.material == 'fix')) {
				if ((findSprite.mode == 'door' || findSprite.mode == 'key1' || findSprite.mode == 'key2') && findSprite.open_positionValue < -50) {
					// DOOR OPENED
					return;
				}
				// DELETE AMMO
				turnOffAmmo(ammoSprite)
				ammoDeleteBuffer.push(ammoSprite)
			}
		});

		// CHECK HIT WALL ENEMY
		if (ammoCheck.haveCrash) {
			var ammoMapX = ammoCheck.checkX
			var ammoMapY = ammoCheck.checkY

			var wallData = mapDataClass.map[ammoMapY][ammoMapX]

			if (typeof wallData != 'undefined' && wallData?.type == 'creature') {
				if (wallData.energy > 0) wallData.energy -= player.weaponsDamage[player.weapon]
				
				if (wallData.energy <= 0) {
					wallData.anim_startFrame = wallData.dirConstruction.length-1
					wallData.anim_actFrame = wallData.dirConstruction.length-1				

					wallData.anim_switch = false
				}
			}

			// TURN OFF AMMO
			turnOffAmmo(ammoSprite)
			ammoDeleteBuffer.push(ammoSprite)
		}
	}
	return true
}

function spritesCheck() {
	// ARRANGE SPRITES	
	spritesClass.nearSprites.forEach((nearData) => {

		var sprite = spritesClass.sprites[nearData]		
		if (typeof sprite == 'undefined') return;

		// CHECK CREATURE DIE
		if (sprite.energy < 1) {
			sprite.move = null
			sprite.material = 'ghost'
			if (!sprite.anim_die_function) {
				// BOSS KEY2
				if (sprite.dirConstruction.some(name => name.includes('boss'))) {
					player.key2 = true
					$('#gold-key').addClass('gold-key-on')
					let colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 1200 }
					graphicsClass.screenColorizeOptions(colorizeOption)
					soundClass.playSoundEvent('player-die1', soundClass.calculateDistance(sprite.distance))
					soundClass.gameMusic.pause()
					gamePlay.musicName = 'music1'
					soundClass.playMusic(gamePlay.musicName, 'gameMusic')
				}
				// DIE SOUND
				if (!gamePlay.firstFrame && sprite.sound) {
					let randSoundNum = Math.floor(Math.random() * sprite.sound[2].length)
					soundClass.playSoundEvent(sprite.sound[2][randSoundNum], soundClass.calculateDistance(sprite.distance))
				}
				clearInterval(sprite.anim_function); sprite.anim_function = null
				clearInterval(sprite.anim_attack_function); sprite.anim_attack_function = null
				clearInterval(sprite.anim_damage_function); sprite.anim_damage_function = null
				// MAJD TÖRÖLNI AZ INTERVALOKAT A KÖVETKEZŐ MAP TÖLTÉSÉNÉL!!!!	 (clearInterval( összes ?)
				if (!sprite.anim_die_function) {
					sprite.anim_die_actFrame = `${sprite.dirConstruction[0]}_F1`
					sprite.anim_die_actFrame_count = 1
				}
				if (gamePlay.firstFrame) {
					// IF CREATURE DIE SWITCH DIE TEXTURE
					sprite.anim_die_actFrame_count = 5
					sprite.anim_die_actFrame = `${sprite.dirConstruction[0]}_F4`
				}
				sprite.anim_die_function = setInterval(() => {					
					if (sprite.anim_die_actFrame_count < 4) sprite.anim_die_actFrame_count++
					if (sprite.anim_die_actFrame_count == 5) return;
					sprite.anim_die_actFrame = `${sprite.dirConstruction[0]}_F${sprite.anim_die_actFrame_count}`
				}, sprite.anim_speed)
			}
		}

		sprite.distance = graphicsClass.spriteDistanceCalc(sprite)
				
		if (sprite.active && !gamePlay.firstFrame) {
			let getActualTexture = sprite.dirConstruction[1]	// Standard texture

			// IF CREATURES
			if (sprite.type == 'creature') {
				// CREATURE DIE
				if (sprite.anim_die_function) getActualTexture = sprite.anim_die_actFrame
				// CREATURE damage
				else if (sprite.anim_damage_function) getActualTexture = sprite.anim_damage_actFrame
				// CREATURE ATTACK
				else if (sprite.anim_attack_function) getActualTexture = sprite.anim_attack_actFrame
				// BASIC ANIM START
				else if (!sprite.anim_function) {
					sprite.anim_actFrame = sprite.anim_frames[0]
					sprite.anim_function = setInterval(() => {
						sprite.anim_actFrame++
						if (sprite.anim_actFrame > sprite.anim_frames.length) sprite.anim_actFrame = sprite.anim_frames[sprite.anim_startFrame]
					}, sprite.anim_speed)
				// BASIC ANIM
				} else {
					getActualTexture = creatureSpriteSelect(sprite)
				}
				moveCreature(sprite)
			}

			// ANIM TEXTURES
			if (sprite.type == 'block' || sprite.type == 'object') {
				if (sprite.active) {
					let checkActAnim = mapDataClass.loadAnimationTexture(sprite)
					if (checkActAnim) getActualTexture = checkActAnim[1]
				}
			}

			// IF AMMO
			if (sprite.type == 'ammo') {
				if (sprite.active) {
					moveAmmo(sprite)
					let checkActAnim = mapDataClass.loadAnimationTexture(sprite)
					if (checkActAnim) getActualTexture = checkActAnim[1]

					let interval = 0
					if (player.weapon == 3) interval = -6;
					if (player.weapon == 4) interval = -4;

					if (interval) sprite.z = graphicsClass.amplitudeA(interval);
				}
			}
			
			let actualTexture = (sprite.type == 'ammo') 
			? texturesClass.weaponsTextures[sprite.dirConstruction[0]][getActualTexture]
			: texturesClass.spriteTextures[sprite.dirConstruction[0]][getActualTexture];

			graphicsClass.renderScreenSprites(sprite, actualTexture)
		}
	});
	
	// DELETE AMMOS
	let delAmmos = spritesClass.sprites.filter(obj => obj.type == "ammo" && obj.active == false)
	delAmmos.forEach((ammoSprite) => {
		let ammoIndex = spritesClass.sprites.indexOf(ammoSprite);
		if (ammoIndex !== -1) spritesClass.sprites.splice(ammoIndex, 1)
	});	
}

function creatureSpriteSelect(creature) {
	creature.anim_actFrame = (creature.anim_actFrame) ? creature.anim_actFrame : 2;

	let angDif = graphicsClass.toAngle(creature.angle - player.angle);

	// ROTATION
	if (creature.rotate_switch) {
		var rot_b = creature.rotate_frames[0]; var rot_d = creature.rotate_frames[1]; var rot_a = creature.rotate_frames[2]; var rot_c = creature.rotate_frames[3];
	} else {
		var rot_b = 'a'; var rot_d = 'a'; var rot_a = 'a'; var rot_c = 'a';
	}

	let texturename;

	// ANIMATIONFRAME
	if (angDif >= 135 && angDif < 225) {
		texturename = `${creature.dirConstruction[0]}_${rot_a}${creature.anim_actFrame}`
	} else if (angDif >= 315 && angDif <= 360 || angDif >= 0 && angDif < 45) {
		texturename = `${creature.dirConstruction[0]}_${rot_b}${creature.anim_actFrame}`
	} else if (angDif >= 225 && angDif < 315) {
		texturename = `${creature.dirConstruction[0]}_${rot_c}${creature.anim_actFrame}`
	} else if (angDif >= 45 && angDif < 135) {
		texturename = `${creature.dirConstruction[0]}_${rot_d}${creature.anim_actFrame}`
	}
	
	return texturename;
}

async function loadindData(loadGame) {
	mapDataClass.map = []
	spritesClass.sprites = []
	spritesClass.nearSprites = []
	spritesClass.weponsSprites = []

	const weaponAmmoDataResponse = await fetch('./data/weapons/weapon_ammos.JSON')
	const weaponsAmmoData = await weaponAmmoDataResponse.json()

	// LOAD WEAPON AMMOS TEXTURES
	for (let n = 0; n < weaponsAmmoData.ammos.length; n++) {
		let ammo = weaponsAmmoData.ammos[n]
		let dirConstruction = await texturesClass.loadTextureToArray(ammo.textures, 'weapons', texturesClass.weaponsTextures)
		spritesClass.createSprite(ammo, dirConstruction, spritesClass.weponsSprites)
	}
	
	const wallsDataResponse = await fetch('./data/walls/walls.JSON')
	const wallsData = await wallsDataResponse.json()
	// console.log(wallsData)

	const blocksDataResponse = await fetch('./data/blocks/blocks.JSON');
	const blocksData = await blocksDataResponse.json()
	// console.log(blocksData)

	const objectsDataResponse = await fetch('./data/objects/objects.JSON')
	const objectsData = await objectsDataResponse.json()
	// console.log(objectsData)

	const creaturesDataResponse = await fetch('./data/creatures/creatures.JSON')
	const creaturesData = await creaturesDataResponse.json()
	// console.log(creaturesData)

	const effectsDataResponse = await fetch('./data/effects/effects.JSON')
	const effectsData = await effectsDataResponse.json()
	// console.log(effectsData)

	var mapData, actualLevel = null

	// LOAD GAME
	if (loadGame) {
		gamePlay.loadGame = false
		startStory = true

		mapData = mapDataClass.getLocalStorage('ninjasave')
		
		actualLevel = mapData.maplevel
		mapDataClass.mapLevel = mapData.maplevel
		
		mapData.player.x = parseFloat(mapData.player.x)
		mapData.player.y = parseFloat(mapData.player.y)
		mapData.player.z = 0
		mapData.player.angle = parseFloat(mapData.player.angle)

		player.energy = mapData.player.energy
		player.speedModes.actSpeedLevel = mapData.player.speedModes.actSpeedLevel
		player.shoting = mapData.player.shoting
		player.shotTime = mapData.player.shotTime
		player.weapon = mapData.player.weapon
		player.adoptedWeapons.weapon2 = mapData.player.adoptedWeapons.weapon2
		player.adoptedWeapons.weapon3 = mapData.player.adoptedWeapons.weapon3
		player.adoptedWeapons.weapon4 = mapData.player.adoptedWeapons.weapon4
		player.ammoFire = mapData.player.ammoFire
		player.ammoStar = mapData.player.ammoStar
		player.goldScore = mapData.player.goldScore
		player.silverScore = mapData.player.silverScore
		player.copperScore = mapData.player.copperScore
		player.key1 = mapData.player.key1
		player.key2 = mapData.player.key2
		player.map = mapData.player.map
		player.poison = mapData.player.poison
	
		gamePlay.musicName = mapData.gameplay.musicname
		gamePlay.enemys = mapData.gameplay.enemys
		gamePlay.wall_enemys = mapData.gameplay.wall_enemys

		gamePlay.goldScore = mapData.gameplay.goldScore
		gamePlay.silverScore = mapData.gameplay.silverScore
		gamePlay.copperScore = mapData.gameplay.copperScore

		gamePlay.get_secrets = mapData.gameplay.get_secrets
		gamePlay.get_goldScore = mapData.gameplay.get_goldScore
		gamePlay.get_silverScore = mapData.gameplay.get_silverScore
		gamePlay.get_copperScore = mapData.gameplay.get_copperScore
		gamePlay.get_enemys = mapData.gameplay.get_enemys

		gamePlay.all_goldScore = mapData.gameplay.all_goldScore
		gamePlay.all_silverScore = mapData.gameplay.all_silverScore
		gamePlay.all_copperScore = mapData.gameplay.all_copperScore
		gamePlay.all_enemys = mapData.gameplay.all_enemys
		gamePlay.all_secrets = mapData.gameplay.all_secrets
	} else {
		actualLevel = mapDataClass.maps[mapDataClass.mapLevel]
		const mapDataResponse = await fetch(`./data/maps/${actualLevel}.JSON`)
		mapData = await mapDataResponse.json()
		gamePlay.musicName = mapData.musicname
	}

	// COMMON DATAS
	gamePlay.firstFrame = true
	// Map secrets
	gamePlay.secrets = mapData.secrets
	mapDataClass.secretsNumber = mapData.secrets
	mapDataClass.shadow = parseInt(mapData.shadow)

	player.live = true
	player.z = 0
	player.x = parseInt(mapData.player.x * CELL_SIZE)
	player.y = parseInt(mapData.player.y * CELL_SIZE)
	player.angle = graphicsClass.toRadians(parseInt(mapData.player.angle))
	
	// Load Error Texture
	mapDataClass.errorData = (loadGame) ? mapData.error : mapData.error[0];
	await texturesClass.loadTexturesPicture(mapDataClass.errorData, 'error', texturesClass.errorTexture)

	// Load SKY Texture
	mapDataClass.skyData = (loadGame) ? mapData.sky : mapData.skys[0];
	await texturesClass.loadTexturesPicture(mapDataClass.skyData, 'skys', texturesClass.skyTexture)

	if (mapDataClass.skyData.clouds) {
		graphicsClass.insertClouds()
		texturesClass.cloudTexture = 'clouds'
	}

	// Load Floor Texture
	mapDataClass.floorData = (loadGame) ? mapData.floor : mapData.floors[0];
	await texturesClass.loadTexturesPicture(mapDataClass.floorData, 'floors', texturesClass.floorTexture)

	// Load Wall Textures
	for (let i = 0; i < wallsData.length; i++) {
		let wall = wallsData[i]		
		let dirConstruction = await texturesClass.loadTextureToArray(wall.textures, 'walls', texturesClass.wallTextures)
		await mapDataClass.createWall(wall, dirConstruction)
	}
	
	// Map Array upload Wall textures
	await mapDataClass.defineTextures(mapData.map)
	
	// Load Sprites
	for (let i = 0; i < mapData.sprites.length; i++) {
		let sprite = mapData.sprites[i]
		let dirName
		let insertSprite = objectsData.find(obj => parseInt(obj.id) == parseInt(sprite.id))
		if (insertSprite) { dirName = 'objects' }
		else if (!insertSprite) {
			insertSprite = blocksData.find(block => parseInt(block.id) == parseInt(sprite.id))
			if (insertSprite) { dirName = 'blocks' }
			else if (!insertSprite) {
				insertSprite = creaturesData.find(creature => parseInt(creature.id) == parseInt(sprite.id))
				if (insertSprite) { dirName = 'creatures'; } else if (!insertSprite) {
					insertSprite = effectsData.find(effect => parseInt(effect.id) == parseInt(sprite.id))
					if (insertSprite) { 
						dirName = 'effects';
					}
				}
			}
		}

		if (typeof insertSprite != 'undefined') {
			let data = {}
			data.id = sprite.id
			for (const [key, value] of Object.entries(insertSprite)) data[key] = value;
			sprite = {...data, ...sprite}
			if (sprite.type == 'creature' || sprite.type == 'effect') {				
				sprite.angle = graphicsClass.toRadians(sprite.angle)
			}
		}
		
		var dirConstruction = await texturesClass.loadTextureToArray(sprite.textures, dirName, texturesClass.spriteTextures)
		spritesClass.createSprite(sprite, dirConstruction, spritesClass.sprites)
	}
	gamePlay.gameLoaded = true
}

var gamePlayClearing = function () {
	gamePlay = {
		game: null,
		firstFrame: true,
		gameLoaded: false,
		nextLevel: false,
		endStory: false,
		goldScore: 0,
		silverScore: 0,
		copperScore: 0,
		enemys: 0,
		secrets: 0,
		get_goldScore: 0,
		get_silverScore: 0,
		get_copperScore: 0,
		get_enemys: 0,
		get_secrets: 0,
		all_goldScore: 0,
		all_silverScore: 0,
		all_copperScore: 0,
		all_enemys: 0,
		all_secrets: 0,
	}

	player.speedModes.actSpeedLevel = 0
	player.energy = 100
	player.weapon = 1
	player.adoptedWeapons.weapon2 = false
	player.adoptedWeapons.weapon3 = false
	player.adoptedWeapons.weapon4 = false
	player.ammoStar = 3
	player.ammoFire = 3
	player.key1 = false
	player.key2 = false
	player.map = false
	player.poison = false

	$('#healt-percentage').text('100%').css('color', 'white')
	$('#silver-key').removeClass('silver-key-on'); $('#gold-key').removeClass('gold-key-on'); $('#gold-key').removeClass('gold-key-on')
	$('#val0').removeClass('val0-on'); $('#val1').removeClass('val1-on'); $('#val2').removeClass('val2-on'); $('#val3').removeClass('val3-on'); $('#val4').removeClass('val4-on')
	$('#weapon2').removeClass('weapon2-on'); $('#weapon3').removeClass('weapon3-on'); $('#weapon4').removeClass('weapon4-on')
	$('#coin-gold-text').text('0');	$('#coin-silver-text').text('0'); $('#coin-copper-text').text('0')	
	$('#ammo-star-text').text(player.ammoStar);	$('#ammo-fire-text').text(player.ammoFire)

	menu.menuactive = true
	menu.infoactive = false
	menu.actualMenuRow = 0

	graphicsClass.makeMenu(gamePlay.gameLoaded)
	inputClass.moveMenuStar(0)
}

async function gameMenu() {

	// LOAD SOUND
	if (!soundClass.soundsLoaded && graphicsClass.orientationLicense) {

		document.getElementById('canvas-container').style.display='none'
		document.getElementById('menu-bg').style.display='none'
		document.getElementById('loading').style.display='block'
		
		await soundClass.loadSounds()

		let element = `<button id="sound-button" data-sound="door1" data-volume="0.5" style="display:none;"></button>`;
		$("body").append(element);

		$('#sound-button').on('click', () => {
			let fileName = $("#sound-button").attr('data-sound')
			let volume = $("#sound-button").attr('data-volume')
						
			soundClass.playSound(fileName, volume)
		});
	}

	if (gamePlay.nextLevel) {
		graphicsClass.clrScr()
		clearInterval(gamePlay.game)
		gamePlay = { ...gamePlay, nextLevel: false, game: null, gameLoaded: false, secrets: 0, enemys: 0, goldScore: 0, silverScore: 0, copperCoin: 0 }
		player.key1 = false
		player.key2 = false
		player.map = false
		player.poison = false
		menu.mapSwitch = false
		menu.infoSwitch = false
		menu.menuactive = false
		$('#silver-key').removeClass('silver-key-on')
		$('#gold-key').removeClass('gold-key-on')

		mapDataClass.mapLevel++
	}

	if (menu.menuactive) {
		//// MENU		
		clearInterval(gamePlay.game)
		gamePlay.game = null

		if (userInteraction && soundClass.gameMusic) soundClass.gameMusic.pause();
		if (userInteraction && soundClass.menuMusic) soundClass.menuMusic.play();
		if (userInteraction && !soundClass.menuMusic) await soundClass.playMusic('menu1', 'menuMusic');

		if (graphicsClass.orientationLicense) {
			inputClass.moveMenuStar()
			document.getElementById('canvas-container').style.display='none'
			document.getElementById('loading').style.display='none'
			document.getElementById('menu-bg').style.display='block'
			graphicsClass.clrScr()
		}
		return;
	} else {
		//// GAME

		// LOADING
		if (!gamePlay.gameLoaded) {
			inputClass.disableEsc()

			if (soundClass.menuMusic) soundClass.menuMusic.pause()

			document.getElementById('menu-bg').style.display='none'
			document.getElementById('canvas-container').style.display='none'

			document.getElementById('loading').style.display='block'
			await loadindData(gamePlay.loadGame)
			gamePlay.gameLoaded = true

			graphicsClass.checkPlayerObjects()
			document.getElementById('loading').style.display='none'
			
			soundClass.playMusic(gamePlay.musicName, 'gameMusic')
		}

		graphicsClass.makeMenu(gamePlay.gameLoaded)

		inputClass.delEsc()

		// BACK TO GAME
		document.getElementById('menu-bg').style.display='none'
		document.getElementById('loading').style.display='none'
		document.getElementById('canvas-container').style.display='block'
		
		if (soundClass.menuMusic) soundClass.menuMusic.pause()
		if (soundClass.gameMusic) soundClass.gameMusic.play(); else soundClass.playMusic(gamePlay.musicName, 'gameMusic');

		if (menu.navigationSwitch) {
			$('#info-bar').css('top', '5px')
			$('#left-navigation-container').css('display', 'grid')
			$('#right-navigation-container').css('display', 'grid')
		} else {
			$('#info-bar').css('top', '')
			$('#info-bar').css('bottom', '5px')
			$('#left-navigation-container').css('display', 'none')
			$('#right-navigation-container').css('display', 'none')
		}

		if (!gamePlay.game) {
			gamePlay.game = setInterval(gameLoop, CLOCKSIGNAL);
		}
	}
	return;
}

async function nextLevel() {
	inputClass.disableEsc()
	
	clearInterval(gamePlay.game)
	gamePlay.game = null
	
	if (soundClass.gameMusic) {
		soundClass.gameMusic.pause()
		soundClass.gameMusic = null

		soundClass.playSoundEvent('magic2', 1)
	}

	let actualLevel = mapDataClass.maps[mapDataClass.mapLevel]

	function addValue(arrayObject, sign, type, value, mode) {
		var have = 0
		var get = 0
		let check = arrayObject.filter(obj => obj[type] == value)
		check.forEach((object) => {
			have ++
			if ((sign && object[mode]) || (!sign && !object[mode])) get++;
		});
		return {'have': have, 'get': get}
	}

	function addValueMap(type, value, animSwitchCount) {
		var count = 0;
		if (animSwitchCount)  var asc = 0
		for (let n = 0; n < mapDataClass.map.length; n++) {
			for (let m = 0; m < mapDataClass.map[n].length; m++) {
				if (mapDataClass.map[n][m][type] == value) {
					count++
					if (animSwitchCount) {
						if (!mapDataClass.map[n][m].anim_switch) asc++;
					}
				}
			}
		}
		return (animSwitchCount) ? { "have": count, "get": asc } : count;
	}

	// CHECK SPRITE ENEMYS
	let checkEnemy = addValue(spritesClass.sprites, true, 'type', 'creature', 'anim_die_function')
	gamePlay.enemys += checkEnemy.get
	gamePlay.get_enemys += checkEnemy.get
	gamePlay.all_enemys += checkEnemy.have

	// CHECK WALL ENEMYS
	let wallEnemys = addValueMap('type', 'creature', true)
	checkEnemy.get += wallEnemys.get
	checkEnemy.have += wallEnemys.have
	gamePlay.enemys += wallEnemys.have
	gamePlay.get_enemys += wallEnemys.get
	gamePlay.all_enemys += wallEnemys.have

	// CHECK SECRETS
	let leftSecrets = addValueMap('mode', 'secret')
	let findSecrets = gamePlay.secrets - leftSecrets

	gamePlay.get_secrets += findSecrets
	gamePlay.all_secrets += gamePlay.secrets

	// CHECK GOLD COIN
	let goldCoin = addValue(spritesClass.sprites, false, 'mode', 'coin1', 'active')
	gamePlay.goldScore += goldCoin.get
	gamePlay.get_goldScore += goldCoin.get
	gamePlay.all_goldScore += goldCoin.have

	// CHECK SILVER COIN
	let silverCoin = addValue(spritesClass.sprites, false, 'mode', 'coin2', 'active')
	gamePlay.silverScore += silverCoin.get
	gamePlay.get_silverScore += silverCoin.get
	gamePlay.all_silverScore += silverCoin.have

	// CHECK COPPER COIN
	let copperCoin = addValue(spritesClass.sprites, false, 'mode', 'coin3', 'active')
	gamePlay.copperScore += copperCoin.get
	gamePlay.get_copperScore += copperCoin.get
	gamePlay.all_copperScore += copperCoin.have

	//STATISTIC ?
	var returnPrecentage = function (get, all) {
		if (!all) return 0;
		return parseInt((get/all) * 100);
	}

	let content = `<div class="text-center px-5">
		<h2 class='text-center text-uppercase mb-3'>${actualLevel}</h2>`;
		content += `
		<div class="d-flex justify-content-between"><h4><img src="img/menu/diagram/enemy.png" alt="enemy" class="diagram-icon">Enemys:</h4>
		<h4>${checkEnemy.get} / ${checkEnemy.have} <div class="precentage-color">${returnPrecentage(gamePlay.get_enemys, gamePlay.all_enemys)}%</div></h4></div>`;
		content += `<div class="d-flex justify-content-between"><h4><img src="img/menu/diagram/secret.png" alt="secret" class="diagram-icon">Secrets:</h4>
		<h4>${findSecrets} / ${gamePlay.secrets} <div class="precentage-color">${returnPrecentage(gamePlay.get_secrets, gamePlay.all_secrets)}%</div></h4></div>`;
		content += `<div class="d-flex justify-content-between"><h4><img src="img/menu/diagram/coin-gold.png" alt="coin1" class="diagram-icon">Gold Coin:
		</h4> <h4>${goldCoin.get} / ${goldCoin.have} <div class="precentage-color">${returnPrecentage(gamePlay.get_goldScore, gamePlay.all_goldScore)}%</div></h4></div>`;
		content += `<div class="d-flex justify-content-between"><h4><img src="img/menu/diagram/coin-silver.png" alt="coin2" class="diagram-icon">Silver Coin:
		</h4> <h4>${silverCoin.get} / ${silverCoin.have} <div class="precentage-color">${returnPrecentage(gamePlay.get_silverScore, gamePlay.all_silverScore)}%</div></h4></div>`;
		content += `<div class="d-flex justify-content-between"><h4><img src="img/menu/diagram/coin-copper.png" alt="coin3" class="diagram-icon">Copper Coin:
		</h4> <h4>${copperCoin.get} / ${copperCoin.have} <div class="precentage-color">${returnPrecentage(gamePlay.get_copperScore, gamePlay.all_copperScore)}%</div></h4></div>`;
		content += `</div>`;
	
	graphicsClass.scrollInfoMaker(content, null, true)

	mapDataClass.movingForward = false

	let scrollButton = document.getElementById('scroll-button');
	let goNextClick = () => {
		mapDataClass.movingForward = true;
		scrollButton.removeEventListener('click', goNextClick);
	};
	scrollButton.addEventListener('click', goNextClick);
	
	await movingForward()
	mapDataClass.movingForward = false

	if (mapDataClass.maps.length-1 <= mapDataClass.mapLevel) {
		// GRATULATIONS
		await graphicsClass.endStory();

		mapDataClass.mapLevel = -1
		clearInterval(gamePlay.game)
		gamePlay.game = null
		gamePlay.gameLoaded = false
		graphicsClass.clrScr()
	}

	graphicsClass.makeMenu(gamePlay.gameLoaded)
	gameMenu()
}

async function saveGame() {
	let findArray = Object.values(spritesClass.objectDataTypes).map(item => item.name)
	findArray.push('anim_function')
	findArray.push('anim_die_function')
	findArray.push('color')

	let spritesObject = this.gameDataConvertSpriteObject(spritesClass.sprites, findArray, CELL_SIZE, graphicsClass)
	let mapObject = this.gameDataConvertMapObject(this.mapDataClass.map, findArray)
	
	let copyPlayer = {... player}
	copyPlayer.x = (parseFloat(copyPlayer.x) / CELL_SIZE)
	copyPlayer.y = (parseFloat(copyPlayer.y) / CELL_SIZE)
	copyPlayer.angle = parseInt(graphicsClass.toAngle(parseFloat(copyPlayer.angle)))
	copyPlayer.mapSwitch = false

	let copyGamePlay = {... this.gamePlay}
	copyGamePlay.gameLoaded = null
	copyGamePlay.game = null
	copyGamePlay.goldScore = gamePlay.goldScore
	copyGamePlay.silverScore = gamePlay.silverScore
	copyGamePlay.copperScore = gamePlay.copperScore
	copyGamePlay.enemys = gamePlay.enemys
	copyGamePlay.secrets = gamePlay.secrets
	copyGamePlay.all_secrets = gamePlay.all_secrets
	copyGamePlay.all_goldScore = gamePlay.all_goldScore
	copyGamePlay.all_silverScore = gamePlay.all_silverScore
	copyGamePlay.all_copperScore = gamePlay.all_copperScore
	copyGamePlay.all_enemys = gamePlay.all_enemys
	copyGamePlay.get_goldScore = gamePlay.get_goldScore
	copyGamePlay.get_silverScore = gamePlay.get_silverScore
	copyGamePlay.get_copperScore = gamePlay.get_copperScore
	copyGamePlay.get_enemys = gamePlay.get_enemys
	copyGamePlay.get_secrets = gamePlay.get_secrets
	copyGamePlay.wall_enemys = gamePlay.wall_enemys
	copyGamePlay.musicname = gamePlay.musicName
	
	let levelNumber = mapDataClass.mapLevel
	let secretsNumber = mapDataClass.secretsNumber
	
	let data = {
		player: copyPlayer,
		gameplay: copyGamePlay,
		floor: mapDataClass.floorData,
		sky: mapDataClass.skyData,
		error: mapDataClass.errorData,
		shadow: mapDataClass.shadow,
		maplevel: levelNumber,
		secrets: secretsNumber,
		sprites: spritesObject,
		map: mapObject,
	}
	
	// SAVE
	await mapDataClass.setLocalStorage('ninjasave', data)
	
	graphicsClass.makeMenu(gamePlay.gameLoaded)
	gameMenu()
}

async function loadGame() {
	if (!this.mapDataClass.ninjaSave) return;

	await mapDataClass.getLocalStorage('ninjasave')

	graphicsClass.clrScr()
	clearInterval(this.gamePlay.game)
	gamePlay.game = null
	gamePlay.gameLoaded = false
	player.live = true
	gamePlay.loadGame = true
	menuGameJump()
}

function endGame() {
	clearInterval(gamePlay.game)
	gamePlay.game = null
	gamePlayClearing()
	$("#graphics-container").html('')
	gamePlay.gameLoaded = false
	player.live = true
	this.mapDataClass.mapLevel = 0
	graphicsClass.makeMenu(gamePlay.gameLoaded)
}

function movingForward() {
	return new Promise(resolve => {
		var interval = setInterval(() => {
			if (mapDataClass.movingForward) {
				clearInterval(interval)
				resolve()
			}
		}, 100);
	});
}

function resetFov() {
	graphicsClass.FOV = graphicsClass.toRadians(60)
}

function gamePlayValues() {
	return gamePlay;
}

function userInteractionOn() {	
	userInteraction = true;
}

function getUserInteraction() {
	return userInteraction;
}

function deletingBufferAmmos() {
	ammoDeleteBuffer.forEach(ammo => {
		let ammoIndex = spritesClass.sprites.indexOf(ammo)
		if (ammoIndex !== -1) spritesClass.sprites.splice(ammoIndex, 1)
	});
	ammoDeleteBuffer = []
}

async function gameLoop() {
	if (gamePlay.firstFrame) graphicsClass.clrScr()

	if (!startStory) { startStory = true; graphicsClass.startStory(); }

	if (gamePlay.nextLevel) { graphicsClass.clrScr(); await nextLevel(); return; }

	movePlayer(player)
	graphicsClass.rays = graphicsClass.getRays()
	spritesClass.sprites = spritesClass.sprites.sort((a, b) => b.distance - a.distance)

	if (!gamePlay.firstFrame) graphicsClass.renderScreen()

	spritesClass.selectNearSprites()
	if (spritesClass.nearSprites.length > 1) {
		spritesCheck()
		spritesClass.sprites.forEach(sprite => {
			sprite.distance = graphicsClass.spriteDistanceCalc(sprite)
		});
	}

	if (!gamePlay.firstFrame) {
		if (!menu.menuactive && player.weapon) graphicsClass.playerWeapon()
	
		graphicsClass.screenColorizeAction()
		if (menu.mapSwitch) graphicsClass.renderMinimap()
		if (player.poison) graphicsClass.poison()
		if (ammoDeleteBuffer) deletingBufferAmmos()

	} else gamePlay.firstFrame = false;

	graphicsClass.renderVisibleScreen()
}

function menuGameJump() {
	if (!menu.infoactive) menu.menuactive = !menu.menuactive;

	if (inputClass) inputClass.keyPressed = {'shift': false}

	if (menu.menuactive) {
		// MENU
		if (inputClass.keybordListener) {
			cancelAnimationFrame(inputClass.keybordListener)
			inputClass.keybordListener = null;
		}
		$('#container').addClass('container-bg')
	} else {
		// GAME
		$('#container').removeClass('container-bg')
		if (!inputClass.keybordListener) inputClass.handleKeyPress()
	}

	// REFRESH MENU
	graphicsClass.makeMenu(gamePlay.gameLoaded)
	gameMenu()
}

//-------------------
//	  START GAME	|
//-------------------
const texturesClass = new TexturesClass ()
const soundClass 	= new SoundClass 	({menu: menu, getUserInteraction: getUserInteraction})
const mapDataClass 	= new MapDataClass  ({soundClass: soundClass, texturesClass: texturesClass, gamePlay: gamePlay})
const spritesClass 	= new SpritesClass  ({CELL_SIZE: CELL_SIZE, player: player, menu: menu, soundClass: soundClass, texturesClass: texturesClass, mapDataClass: mapDataClass, resetFov: resetFov})
const graphicsClass = new GaphicsClass  ({soundClass: soundClass, mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check, movingForward: movingForward, gameMenu: gameMenu, gamePlayValues: gamePlayValues, windowScreenOrientation:window.screen.orientation})
const inputClass 	= new InputsClass   ({soundClass: soundClass, mapDataClass: mapDataClass, spritesClass: spritesClass, graphicsClass: graphicsClass, movePlayer: movePlayer, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check, getUserInteraction: getUserInteraction, userInteractionOn: userInteractionOn, gamePlayClearing: gamePlayClearing, menuGameJump: menuGameJump, saveGame: saveGame, loadGame: loadGame, endGame: endGame,  gamePlayValues: gamePlayValues})

window.onload = () => { gameMenu() };
