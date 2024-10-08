export default class MapDataClass {
	map;
	shadow;
	walls;
	sky;
	floor;
	wayCordinates;
	
	floorData;
	skyData;
	errorData;
	secretsNumber;
	constructor({soundClass: soundClass, texturesClass: texturesClass, gamePlay: gamePlay}) {
		this.soundClass = soundClass
		this.texturesClass = texturesClass
		this.gamePlay = gamePlay
		this.maps = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8']
		this.mapLevel = 5
		//--------------------------------
		this.map = []
		this.walls = []; this.walls[0] = null;

		this.wayBarriers = {'2': 270, '4': 0, '6': 90, '8': 180 }
		this.wayCordinates = [{x: -1, y: 0, barrier: 8}, {x: 1, y: 0, barrier: 4}, {x: 0, y: -1, barrier: 2}, {x: 0, y: 1, barrier: 6}];
		this.wayCordinatesAround = [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1}, 
									{x: -1, y: 0}, {x: 1, y: 0},
									{x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}];

		this.ninjaSave = this.getLocalStorage('ninjasave')
	}

	async setLocalStorage(name, data) {
		localStorage.setItem(name, JSON.stringify(data))
		this.ninjaSave = this.getLocalStorage('ninjasave')
	}

	getLocalStorage(name) {
		function isValidJson(jsonString) {
			try { JSON.parse(jsonString); return true; } catch (e) { return false; }
		}
		return (isValidJson(localStorage.getItem(name))) ? JSON.parse(localStorage.getItem(name)) : false;
	}

	returnActualWallTexture(wall, wallY, wallX) {
		if (wall.mode == 'animated' || wall.mode == 'door' || wall.mode == 'secret' || wall.mode == 'key1' || wall.mode == 'key2' || wall.mode == 'ammo') {
			if (wall.anim_switch) {
				let checkActAnim = this.loadAnimationTexture(wall, wallY, wallX)                
				if (checkActAnim) return checkActAnim;
			}
		}
		if (wall.type == 'creature') return [wall.dirConstruction[0], wall.dirConstruction[wall.anim_actFrame]];
		else return [wall.dirConstruction[0], wall.dirConstruction[1]];
	}

	async createWall(wallData, dirConstruction) {
		let wallArray = [];
		wallArray.dirConstruction = dirConstruction
		if (typeof wallData.type !== 'undefined') {
			wallArray.id = wallData.id
			wallArray.type = wallData.type
			wallArray.mode = wallData.mode
			wallArray.height = wallData.height
			wallArray.damage = wallData.damage
			wallArray.energy = wallData.energy
			wallArray.sound = wallData.sound
			if (wallData.mode == 'animated'
			|| wallData.mode == 'door' || wallData.mode == 'secret'
			|| wallData.mode == 'key1' || wallData.mode == 'key2'
			|| wallData.mode == 'ammo'
			|| wallData.mode == 'creature') {
				wallArray.anim_switch = wallData.anim_switch
				wallArray.anim_actFrame = wallData.anim_actFrame
				wallArray.anim_speed = wallData.anim_speed
				wallArray.anim_repeat = wallData.anim_repeat
				wallArray.anim_repeatCount = wallData.anim_repeatCount
				wallArray.anim_repeatEnd = wallData.anim_repeatEnd
				wallArray.anim_startFrame = wallData.anim_startFrame
				wallArray.anim_maxFrame = dirConstruction.length-1
			}
		}
		this.walls.push(wallArray)
	}

	async defineTextures(map) {
		// CREATE this.map
		for (let n = 0; n < map.length; n++) {
			this.map[n] = [];
			for (let m = 0; m < map[n].length; m++) {
				this.map[n][m] = 0;
			}
		}      
		// FILL this.map
		for (let mY=0; mY<map.length; mY++) {
			for (let mX=0; mX<map[0].length; mX++) {
				if (map[mY][mX] != 0) {
					let cellData = map[mY][mX]
					// Texture search based on texture identifier
					let loadingTexture = this.walls.find(wall => wall !== null && wall.id == cellData.id);
					const wallValue = {...loadingTexture, ...cellData}
					this.map[mY][mX] = wallValue
				}
			}
		}
	}

	loadAnimationTexture(obj, wallY, wallX) {
		if (obj.anim_switch) {
			if (!obj.anim_function) {
				// Create animation interval
				obj.anim_function = setInterval(() => {
					obj.anim_actFrame++
					// obj.dirConstruction.length = anim_max frames | if creature or ammo the last frame is end frame
					let animMaxFrame = (obj.type == 'creature' || obj.type == 'ammo') ? obj.dirConstruction.length - 1 : obj.dirConstruction.length;

					obj.anim_actFrame = (obj.anim_actFrame >= animMaxFrame) ? obj.anim_startFrame : obj.anim_actFrame
					if (!obj.anim_repeat) {
						obj.anim_repeatCount++
						if (obj.anim_repeatCount >= obj.anim_repeatEnd) {
							clearInterval(obj.anim_function)
							obj.anim_switch = false
							obj.anim_function = null
							obj.anim_repeatCount = 0
							// if DOOR expiration deleting in map.
							if (obj.type == 'wall') {
								if (obj.mode == 'door' || obj.mode == 'secret' || obj.mode == 'key1' ||obj.mode == 'key2') this.map[wallY][wallX] = 0
							}
						}
					}
				}, obj.anim_speed)
			}
			return [obj.dirConstruction[0], obj.dirConstruction[obj.anim_actFrame]]
		}
		if (obj.type == 'ammo') return [obj.dirConstruction[0], obj.dirConstruction[obj.anim_actFrame]]
	}
}
