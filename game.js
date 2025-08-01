// ZARGATES GAME - BASIC VERSION
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameState = {
    currentScreen: 'splash',
    selectedCharacter: null,
    score: 0,
    health: 100,
    hits: 0,
    abilityReady: false,
    abilityActive: false,
    abilityTimer: 0,
    currentLocation: 0,
    gameOver: false,
    transitioning: false
};

// Toxin attack animation variables
let toxinAttackAnimation = {
    active: false,
    timer: 0,
    blinkTimer: 0,
    visible: false
};

// Toxin special ability variables
let toxinSpecialAbility = {
    active: false,
    timer: 0,
    duration: 600 // 10 seconds at 60fps
};

// Sound variables
let machineGunSound = null;
let isMachineGunPlaying = false;

// Player
let player = {
    x: 100,
    y: 400,
    width: 40,
    height: 60,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    onGround: false,
    character: null,
    direction: 1,
    attacking: false,
    attackCooldown: 0,
    health: 100
};

// Characters
const characters = {
    origami: {
        name: 'Origami',
        color: '#ff6b6b',
        attackRange: 80,
        attackDamage: 25,
        specialAbility: 'dash',
        specialDescription: 'Dash forward with triple damage'
    },
    toxin: {
        name: 'Toxin',
        color: '#4ecdc4',
        attackRange: 200,
        attackDamage: 15,
        specialAbility: 'combo',
        specialDescription: '10 seconds of invincibility'
    },
    chameleon: {
        name: 'Chameleon',
        color: '#45b7d1',
        attackRange: 120,
        attackDamage: 20,
        specialAbility: 'instantKill',
        specialDescription: 'Instant kill with full health'
    },
    troub: {
        name: 'Troub',
        color: '#96ceb4',
        attackRange: 300,
        attackDamage: 18,
        specialAbility: 'convert',
        specialDescription: 'Convert 2 enemies to allies'
    }
};

// Background images
const backgroundImages = {
    home: null,
    forest: null,
    street: null,
    castle: null,
    island: null,
    portal: null,
    hyperspace: null
};

// Character sprites
const characterSprites = {
    origami: null
};

// Enemy sprites
const enemySprites = {
    fireEnemy: null
};

// Arrow sprite for Troub
let arrowSprite = null;

// Friendly enemies array
let friendlyEnemies = [];

// Blue sphere projectiles for friendly enemies
let blueSphereProjectiles = [];

// Portal sprite
const portalSprite = new Image();
portalSprite.crossOrigin = 'anonymous';
portalSprite.onload = function() {
    console.log('✅ Portal sprite loaded!');
};
portalSprite.onerror = function() {
    console.error('❌ Failed to load portal sprite!');
};
portalSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreiamlxiktldu5biljkebu2xvrkaolbsvasmspsesvhscg44n5h6rae';

// Load forest background
function loadForestBackground() {
    backgroundImages.forest = new Image();
    backgroundImages.forest.crossOrigin = 'anonymous';
    backgroundImages.forest.onload = function() {
        console.log('✅ Forest background loaded successfully!');
    };
    backgroundImages.forest.onerror = function() {
        console.error('❌ Failed to load forest background!');
    };
    backgroundImages.forest.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeibfjgh5l3pyhddztwrg72ciuk2ibe44tosbmjricjng5eah4zslxi';
}

// Load street background
function loadStreetBackground() {
    backgroundImages.street = new Image();
    backgroundImages.street.crossOrigin = 'anonymous';
    backgroundImages.street.onload = function() {
        console.log('✅ Street background loaded successfully!');
    };
    backgroundImages.street.onerror = function() {
        console.error('❌ Failed to load street background!');
    };
    backgroundImages.street.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeigfchrhk27ujz7u6i2w3rfxilyhaypxex2bngfidg6qfieugkvude';
}

// Load home background
function loadHomeBackground() {
    backgroundImages.home = new Image();
    backgroundImages.home.crossOrigin = 'anonymous';
    backgroundImages.home.onload = function() {
        console.log('✅ Home background loaded successfully!');
    };
    backgroundImages.home.onerror = function() {
        console.error('❌ Failed to load home background!');
    };
    backgroundImages.home.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeiasucpw4kul7n56zlzfzku7qeuwrboih53uythkzherkpp6btepz4';
}

// Load castle background
function loadCastleBackground() {
    backgroundImages.castle = new Image();
    backgroundImages.castle.crossOrigin = 'anonymous';
    backgroundImages.castle.onload = function() {
        console.log('✅ Castle background loaded successfully!');
    };
    backgroundImages.castle.onerror = function() {
        console.error('❌ Failed to load castle background!');
    };
    backgroundImages.castle.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeib2o437ujwxb24bwe3pofhuhrlfl7v55n56lq3xk6gnzq7phyzlqm';
}

// Load island background
function loadIslandBackground() {
    backgroundImages.island = new Image();
    backgroundImages.island.crossOrigin = 'anonymous';
    backgroundImages.island.onload = function() {
        console.log('✅ Island background loaded successfully!');
    };
    backgroundImages.island.onerror = function() {
        console.error('❌ Failed to load island background!');
    };
    backgroundImages.island.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeigtlt6xnfngkjiw2drunzx2svc2hawqrarxfz6f7ckdqcdaneenme';
}

// Load portal background
function loadPortalBackground() {
    backgroundImages.portal = new Image();
    backgroundImages.portal.crossOrigin = 'anonymous';
    backgroundImages.portal.onload = function() {
        console.log('✅ Portal background loaded successfully!');
    };
    backgroundImages.portal.onerror = function() {
        console.error('❌ Failed to load portal background!');
    };
    backgroundImages.portal.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeifxqxu625vivxk4hq7waiucuxbalno6axdxftunboephwyptslksm';
}

// Load hyperspace background
function loadHyperspaceBackground() {
    backgroundImages.hyperspace = new Image();
    backgroundImages.hyperspace.crossOrigin = 'anonymous';
    backgroundImages.hyperspace.onload = function() {
        console.log('✅ Hyperspace background loaded successfully!');
    };
    backgroundImages.hyperspace.onerror = function() {
        console.error('❌ Failed to load hyperspace background!');
    };
    backgroundImages.hyperspace.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeif26yqcux2ep7s4uhfcohcwxxaclwliyelpyu3v5e6koajpjkqiju';
}

// Load Origami sprite
function loadOrigamiSprite() {
    characterSprites.origami = new Image();
    characterSprites.origami.crossOrigin = 'anonymous';
    characterSprites.origami.onload = function() {
        console.log('✅ Origami sprite loaded successfully!');
    };
    characterSprites.origami.onerror = function() {
        console.error('❌ Failed to load Origami sprite!');
    };
         characterSprites.origami.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeidig35myg7sui7jwrrwebubh6ukgjh4jilrhurbgslakjjgjakf4m';
    
    // Load Toxin sprite
    characterSprites.toxin = new Image();
    characterSprites.toxin.crossOrigin = 'anonymous';
    characterSprites.toxin.onload = function() {
        console.log('✅ Toxin sprite loaded successfully!');
    };
    characterSprites.toxin.onerror = function() {
        console.error('❌ Failed to load Toxin sprite!');
    };
    characterSprites.toxin.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeifb3pet4ecuz3okn4qodvkppz5ts46frbxaipiyo6cuw26kfh7zwi';
    
    // Load Chameleon sprite
    characterSprites.chameleon = new Image();
    characterSprites.chameleon.crossOrigin = 'anonymous';
    characterSprites.chameleon.onload = function() {
        console.log('✅ Chameleon sprite loaded successfully!');
    };
    characterSprites.chameleon.onerror = function() {
        console.error('❌ Failed to load Chameleon sprite!');
    };
    characterSprites.chameleon.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeieqrseuye7k5lkr7lgmqvsx62hpwkuj6kubvnt6w3tmku2bvqnkqi';
    
    // Load Troub sprite
    characterSprites.troub = new Image();
    characterSprites.troub.crossOrigin = 'anonymous';
    characterSprites.troub.onload = function() {
        console.log('✅ Troub sprite loaded successfully!');
    };
    characterSprites.troub.onerror = function() {
        console.error('❌ Failed to load Troub sprite!');
    };
    characterSprites.troub.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeig6gb566ctnbwxtdhclecnnpdwutqbcg6omnaymv5ateaxbc6aqsm';
     

}

// Load fire enemy sprite
function loadFireEnemySprite() {
    enemySprites.fireEnemy = new Image();
    enemySprites.fireEnemy.crossOrigin = 'anonymous';
    enemySprites.fireEnemy.onload = function() {
        console.log('✅ Fire enemy sprite loaded successfully!');
    };
    enemySprites.fireEnemy.onerror = function() {
        console.error('❌ Failed to load fire enemy sprite!');
    };
    enemySprites.fireEnemy.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeidrxvgd47fxr4x275tgj2q6lxboovbobd6hjejrdedolrr444gzpa';
}

// Load arrow sprite for Troub
function loadArrowSprite() {
    arrowSprite = new Image();
    arrowSprite.crossOrigin = 'anonymous';
    arrowSprite.onload = function() {
        console.log('✅ Arrow sprite loaded successfully!');
    };
    arrowSprite.onerror = function() {
        console.error('❌ Failed to load Arrow sprite!');
    };
    arrowSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreibrxc3vvsn6wnjwx2dzwi7rtlr42p53253ve6ad45i4c54lafc7s4';
}

// Load Toxin attack animation sprite
let toxinAttackSprite = null;
function loadToxinAttackSprite() {
    console.log('🔄 Starting to load Toxin attack sprite...');
    toxinAttackSprite = new Image();
    toxinAttackSprite.crossOrigin = 'anonymous';
    toxinAttackSprite.onload = function() {
        console.log('✅ Toxin attack sprite loaded successfully!');
        console.log('Sprite dimensions:', toxinAttackSprite.width, 'x', toxinAttackSprite.height);
        console.log('Sprite complete status:', toxinAttackSprite.complete);
    };
    toxinAttackSprite.onerror = function() {
        console.error('❌ Failed to load Toxin attack sprite!');
        console.error('Error details:', toxinAttackSprite.src);
    };
    toxinAttackSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreidqafobnux4uyqp3yhi7j5qpa74krpwvqy7jkkz6kvrupevhlx7lu';
    console.log('🔄 Loading Toxin attack sprite from:', toxinAttackSprite.src);
    console.log('🔄 Initial complete status:', toxinAttackSprite.complete);
}

// Load Toxin bullet sprite
let toxinBulletSprite = null;
function loadToxinBulletSprite() {
    toxinBulletSprite = new Image();
    toxinBulletSprite.crossOrigin = 'anonymous';
    toxinBulletSprite.onload = function() {
        console.log('✅ Toxin bullet sprite loaded successfully!');
    };
    toxinBulletSprite.onerror = function() {
        console.error('❌ Failed to load Toxin bullet sprite!');
    };
    toxinBulletSprite.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreiccmzsystm4q3sxxkieul3mvsxq7bgr4e27o6qapxyvh4cocw7aze';
}

function loadMachineGunSound() {
    machineGunSound = new Audio();
    
    // Загружаем твой звук выстрела
    machineGunSound.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafkreig2td5p4mjp5jje6fop6cz7xgxln2zzbfhk77aeylrqadeuoumnl4';
    
    machineGunSound.volume = 0.7;
    machineGunSound.preload = 'auto';
    machineGunSound.loop = true; // Зацикливаем звук
    
    // Добавляем обработчики
    machineGunSound.addEventListener('canplaythrough', function() {
        console.log('✅ Звук автомата загружен успешно!');
    });
    
    machineGunSound.addEventListener('error', function(e) {
        console.log('❌ Ошибка загрузки звука:', e);
        createBeepSound(); // Fallback если не загрузился
    });
    
    // Загружаем звук
    machineGunSound.load();
}

function createBeepSound() {
    console.log('🔄 Creating fallback beep sound...');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    console.log('🔊 Fallback beep sound created!');
}

// Enemy class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.type = type;
        this.health = 30;
        this.attackCooldown = 0;
        this.attackRange = 200;
        this.damage = 5;
        this.speed = 2;
        this.velocityX = 0;
        this.velocityY = 0;
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTimer = 0;
        this.aimAtPlayer = false;
        this.friendly = false;
        this.glowTimer = 0;
    }
    
    update(player) {
        // Change direction randomly
        this.changeDirectionTimer++;
        if (this.changeDirectionTimer > 120) { // Every 2 seconds
            this.changeDirectionTimer = 0;
            this.aimAtPlayer = Math.random() < 0.3; // 30% chance to aim at player
            
            if (this.aimAtPlayer) {
                // Aim at player
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.velocityX = (dx / distance) * this.speed;
                    this.velocityY = (dy / distance) * this.speed;
                }
            } else {
                // Random movement
                this.targetX = 1200 + Math.random() * 800; // Forest area
                this.targetY = 100 + Math.random() * 300;
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.velocityX = (dx / distance) * this.speed;
                    this.velocityY = (dy / distance) * this.speed;
                }
            }
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
            // Keep within current location bounds
    const locationStart = gameState.currentLocation * LOCATION_WIDTH;
    const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
    if (this.x < locationStart + 50) this.x = locationStart + 50;
    if (this.x > locationEnd - 50) this.x = locationEnd - 50;
    if (this.y < 50) this.y = 50;
    if (this.y > 400) this.y = 400;
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    attack(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.attackRange && this.attackCooldown === 0) {
            this.attackCooldown = 90; // 1.5 seconds at 60fps
            
            // Calculate direction to player for projectile
            const direction = dx > 0 ? 1 : -1;
            return { damage: this.damage, direction: direction };
        }
        return { damage: 0, direction: 1 };
    }
}

// Fire projectile class
class FireProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 5;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class ArrowProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 40; // Increased from 20
        this.height = 16; // Increased from 8
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 18;
        this.speed = 8; // Moderate speed for interesting gameplay
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class BlueSphereProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 8;
        this.speed = 6;
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

class ToxinProjectile {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 8;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = 9; // Half of Troub's arrow damage (18/2)
        this.speed = 10; // Faster than Troub's arrows (8)
    }
    
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    
    isOffScreen() {
        return this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > canvas.height;
    }
}

// Global arrays for enemies and projectiles
let enemies = [];
let fireProjectiles = [];
let arrowProjectiles = [];
let toxinProjectiles = [];

// Locations with smooth transitions
const locations = [
    { name: 'Дом', background: '#8B4513', enemies: [], width: 1200, hasImage: true },
    { name: 'Лес', background: '#228B22', enemies: [], width: 1200, hasImage: true },
    { name: 'Каменная долина', background: '#696969', enemies: [], width: 1200 },
    { name: 'Замок', background: '#4A4A4A', enemies: [], width: 1200, hasImage: true },
    { name: 'Остров', background: '#2E8B57', enemies: [], width: 1200 },
    { name: 'Портал', background: '#800080', enemies: [], width: 1200 },
    { name: 'Гиперсити', background: '#FFD700', enemies: [], width: 1200 }
];

// World dimensions
const WORLD_WIDTH = 8400; // 7 locations × 1200px each
const LOCATION_WIDTH = 1200;

// Fade transition state
let fadeAlpha = 0;
let fading = false;
let fadeCallback = null;

function startFade(callback) {
    fading = true;
    fadeAlpha = 0;
    fadeCallback = callback;
}

function updateFade() {
    if (fading) {
        fadeAlpha += 0.04;
        if (fadeAlpha >= 1) {
            fadeAlpha = 1;
            fading = false;
            if (fadeCallback) fadeCallback();
            setTimeout(() => { fadeAlpha = 0; }, 200);
        }
    }
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') attack();
    if (e.code === 'KeyE') useSpecialAbility();
    if (e.code === 'KeyR') restartGame();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    // Stop machine gun sound when spacebar is released
    if (e.code === 'Space' && player.character && player.character.name === 'Toxin' && isMachineGunPlaying) {
        if (machineGunSound) {
            machineGunSound.pause();
            machineGunSound.currentTime = 0;
        }
        isMachineGunPlaying = false;
        console.log('🔇 Machine gun sound stopped!');
    }
});

// Mouse click handling
canvas.addEventListener('click', (e) => {
    if (gameState.currentScreen === 'splash') {
        gameState.currentScreen = 'characterSelect';
        document.getElementById('characterSelect').style.display = 'block';
    }
});

// Character selection click handling
document.addEventListener('click', (e) => {
    if (gameState.currentScreen === 'characterSelect') {
        const charOptions = document.querySelectorAll('.character-option');
        charOptions.forEach((option) => {
            const rect = option.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && 
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const characterKey = option.dataset.character;
                selectCharacter(characterKey);
            }
        });
    }
});

// Character selection
function selectCharacter(characterKey) {
    if (characters[characterKey]) {
        // Stop machine gun sound if switching from Toxin
        if (player.character && player.character.name === 'Toxin' && isMachineGunPlaying) {
            if (machineGunSound) {
                machineGunSound.pause();
                machineGunSound.currentTime = 0;
            }
            isMachineGunPlaying = false;
            console.log('🔇 Machine gun sound stopped on character switch!');
        }
        
        player.character = characters[characterKey];
        gameState.currentScreen = 'game';
        document.getElementById('characterSelect').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
    }
}

// Attack function
function attack() {
    if (!player.character || player.attackCooldown > 0 || gameState.gameOver) return;

                    player.attacking = true;
                    
                    // Different cooldown for ranged vs melee characters
                    if (player.character.name === 'Toxin') {
                        player.attackCooldown = 15; // 0.25 seconds (15 frames at 60 FPS) - twice as fast as Troub
                    } else if (player.character.name === 'Troub') {
                        player.attackCooldown = 30; // 0.5 seconds (30 frames at 60 FPS) for Troub
                    } else {
                        player.attackCooldown = 15; // Normal cooldown for melee characters
                    }
    
    // Check if special ability is active
    if (gameState.abilityActive) {
        if (player.character.name === 'Troub') {
            // Troub's special ability: convert closest enemy to friendly
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            enemies.forEach(enemy => {
                if (!enemy.friendly) {
                    const dx = player.x - enemy.x;
                    const dy = player.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            });
            
            if (closestEnemy) {
                closestEnemy.friendly = true;
                friendlyEnemies.push(closestEnemy);
                
                // Remove from enemies array
                const index = enemies.indexOf(closestEnemy);
                if (index > -1) {
                    enemies.splice(index, 1);
                }
            }
            
            gameState.abilityActive = false;
            gameState.abilityTimer = 0;
        } else {
            // Default dash ability for other characters
            const dashDistance = 100;
            const dashDirection = player.direction;
            player.x += dashDistance * dashDirection;
            
            // Keep player within world bounds
            if (player.x < 0) player.x = 0;
            if (player.x > WORLD_WIDTH - player.width) player.x = WORLD_WIDTH - player.width;
            
            gameState.score += 30; // Triple damage
            gameState.abilityActive = false; // Deactivate after use
            gameState.abilityTimer = 0;
        }
    } else {
        gameState.score += 10;
    }
    
    // Create arrow projectile for Troub
    if (player.character.name === 'Troub') {
        const arrowX = player.x + (player.direction > 0 ? player.width : 0);
        const arrowY = player.y + player.height / 2;
        const arrowVelocityX = player.direction;
        const arrowVelocityY = 0;
        
        arrowProjectiles.push(new ArrowProjectile(arrowX, arrowY, arrowVelocityX, arrowVelocityY));
    }
    
                    // Create toxin projectile for Toxin
                if (player.character.name === 'Toxin') {
                    console.log('🎯 Toxin attack triggered - Direction:', player.direction);
                    // Position bullet to come from the center of the fire animation - higher position
                    const toxinX = player.x + (player.direction > 0 ? player.width : 0);
                    const toxinY = player.y + player.height / 2 + 6.5; // Raised by 3.5 pixels higher
                    const toxinVelocityX = player.direction;
                    const toxinVelocityY = 0;
                    
                    toxinProjectiles.push(new ToxinProjectile(toxinX, toxinY, toxinVelocityX, toxinVelocityY));
                    console.log('💥 Toxin projectile created at:', toxinX, toxinY, 'Velocity:', toxinVelocityX);
                    
                    // Start machine gun sound (if not already playing)
                    if (machineGunSound && machineGunSound.readyState >= 2 && !isMachineGunPlaying) {
                        machineGunSound.currentTime = 0;
                        machineGunSound.play().catch(e => {
                            console.log('Sound play failed:', e);
                            createBeepSound(); // Use fallback if main sound fails
                        });
                        isMachineGunPlaying = true;
                        console.log('🔫 Machine gun sound started!');
                    } else if (!machineGunSound || machineGunSound.readyState < 2) {
                        console.log('⚠️ Machine gun sound not ready, using fallback');
                        createBeepSound(); // Use fallback beep sound
                    }
                    
                    // Activate attack animation
                    toxinAttackAnimation.active = true;
                    toxinAttackAnimation.timer = 15; // 0.25 seconds at 60fps
                    toxinAttackAnimation.blinkTimer = 0;
                    toxinAttackAnimation.visible = true;
                    console.log('🎯 Toxin attack animation activated - Direction:', player.direction, 'Active:', toxinAttackAnimation.active, 'Visible:', toxinAttackAnimation.visible);
                }
    
    // Check for enemy hits based on character type
    if (gameState.currentLocation === 1) { // Only on Forest location (second location)
        enemies.forEach(enemy => {
            const dx = Math.abs(player.x - enemy.x);
            const dy = Math.abs(player.y - enemy.y);
            
            if (player.character.name === 'Origami' || player.character.name === 'Chameleon') {
                // Melee attack - close range
                if (dx < 100 && dy < 80) {
                    enemy.health -= player.character.attackDamage;
                    if (enemy.health <= 0) {
                        const index = enemies.indexOf(enemy);
                        if (index > -1) {
                            enemies.splice(index, 1);
                        }
                    }
                }
            }
            // Troub and Toxin damage is handled by projectiles in updatePlayer()
        });
    }
    
    gameState.hits++;
    if (gameState.hits >= 10 && !gameState.abilityReady) {
        gameState.abilityReady = true;
    }
}

// Special ability
function useSpecialAbility() {
    if (!gameState.abilityReady || !player.character) return;
    
    if (player.character.name === 'Troub') {
        // Troub's special ability: convert enemy to friendly
        gameState.abilityReady = false;
        gameState.abilityActive = true;
        gameState.hits = 0;
        gameState.abilityTimer = 120; // 2 seconds at 60fps
    } else if (player.character.name === 'Toxin') {
        // Toxin's special ability: 10 seconds of invincibility
        gameState.abilityReady = false;
        gameState.hits = 0;
        toxinSpecialAbility.active = true;
        toxinSpecialAbility.timer = toxinSpecialAbility.duration;
    } else {
        // Default dash ability for other characters
        gameState.abilityReady = false;
        gameState.abilityActive = true;
        gameState.hits = 0;
        gameState.abilityTimer = 120; // 2 seconds at 60fps
    }
}

// Initialize enemies for Forest location
function initializeForestEnemies() {
    enemies = [
        new Enemy(1250, 150, 'fire'),
        new Enemy(1450, 200, 'fire'),
        new Enemy(1650, 180, 'fire'),
        new Enemy(1850, 120, 'fire')
    ];
}

// Restart game
function restartGame() {
    player.x = 100;
    player.y = 400;
    gameState.health = 100;
    gameState.score = 0;
    gameState.hits = 0;
    gameState.abilityReady = false;
    gameState.abilityActive = false;
    gameState.abilityTimer = 0;
    gameState.gameOver = false;
    gameState.currentLocation = 0;
    gameState.transitioning = false;
    fireProjectiles = [];
    arrowProjectiles = [];
    toxinProjectiles = [];
    blueSphereProjectiles = [];
    enemies = [];
    friendlyEnemies = [];
    
    // Reset toxin attack animation
    toxinAttackAnimation.active = false;
    toxinAttackAnimation.timer = 0;
    toxinAttackAnimation.blinkTimer = 0;
    toxinAttackAnimation.visible = false;
    
    // Reset toxin special ability
    toxinSpecialAbility.active = false;
    toxinSpecialAbility.timer = 0;
    
    // Stop machine gun sound
    if (machineGunSound && isMachineGunPlaying) {
        machineGunSound.pause();
        machineGunSound.currentTime = 0;
        isMachineGunPlaying = false;
        console.log('🔇 Machine gun sound stopped on restart!');
    }
}

// Camera system
let cameraX = 0;

// Update player
function updatePlayer() {
    if (gameState.currentScreen !== 'game') return;
    
    // Don't update if game is over or transitioning
    if (gameState.gameOver || gameState.transitioning) return;
    
    // Get current location bounds
    const locationStart = gameState.currentLocation * LOCATION_WIDTH;
    const locationEnd = (gameState.currentLocation + 1) * LOCATION_WIDTH;
    
    // Keep player within current location bounds
    if (player.x < locationStart) player.x = locationStart;
    if (player.x + player.width > locationEnd) player.x = locationEnd - player.width;
    
         // Check portal collision (portal is at the end of each location)
     if (gameState.currentLocation < locations.length - 1) {
         const portalX = locationEnd - 60;
         const playerCenterY = canvas.height - 40 - player.height/2;
         const portalHeight = 120;
         const portalY = playerCenterY - portalHeight/2;
         
         if (
             player.x + player.width > portalX &&
             player.x < portalX + 80 &&
             player.y + player.height > portalY &&
             player.y < portalY + portalHeight
         ) {
            // Start transition to next location
            gameState.transitioning = true;
            startFade(() => {
                gameState.currentLocation++;
                player.x = (gameState.currentLocation * LOCATION_WIDTH) + 50;
                gameState.transitioning = false;
                                 // Initialize enemies for new location if needed
                 if (gameState.currentLocation === 1) { // Лес location
                     initializeForestEnemies();
                 } else {
                     // Clear enemies for other locations
                     enemies = [];
                 }
            });
        }
    }
    
    // Movement
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.direction = -1;
    } else if (keys['KeyD'] || keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.direction = 1;
    } else {
        player.velocityX *= 0.8;
    }
    
    // Jumping
    if ((keys['KeyW'] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = -15;
        player.onGround = false;
    }
    
    // Draw ground line for reference
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 2);
    
    // Gravity
    player.velocityY += 0.8;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // World bounds - full world width
    if (player.x < 0) player.x = 0;
    if (player.x > WORLD_WIDTH - player.width) player.x = WORLD_WIDTH - player.width;
    
    // Ground level (raised to match red line in screenshot)
    const groundLevel = canvas.height - 40;
    if (player.y > groundLevel - player.height) {
        player.y = groundLevel - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Update cooldowns
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (gameState.abilityTimer > 0) gameState.abilityTimer--;
    
                    // Update toxin attack animation
                if (toxinAttackAnimation.active) {
                    toxinAttackAnimation.timer--;
                    toxinAttackAnimation.blinkTimer++;
                    
                    // Blink every 5 frames (0.083 seconds)
                    if (toxinAttackAnimation.blinkTimer >= 5) {
                        toxinAttackAnimation.visible = !toxinAttackAnimation.visible;
                        toxinAttackAnimation.blinkTimer = 0;
                        console.log('💫 Toxin animation blink - Visible:', toxinAttackAnimation.visible, 'Timer:', toxinAttackAnimation.timer);
                    }
                    
                    // Deactivate animation when timer expires
                    if (toxinAttackAnimation.timer <= 0) {
                        toxinAttackAnimation.active = false;
                        toxinAttackAnimation.visible = false;
                        console.log('⏰ Toxin animation expired');
                    }
                    
                    console.log('🔄 Toxin animation update - Timer:', toxinAttackAnimation.timer, 'BlinkTimer:', toxinAttackAnimation.blinkTimer, 'Visible:', toxinAttackAnimation.visible);
                }
                
                // Update toxin special ability
                if (toxinSpecialAbility.active) {
                    toxinSpecialAbility.timer--;
                    if (toxinSpecialAbility.timer <= 0) {
                        toxinSpecialAbility.active = false;
                    }
                }
    
    // Update current location
    gameState.currentLocation = Math.floor(player.x / LOCATION_WIDTH);
    
    // Check for enemy attacks and fire projectiles
    enemies.forEach(enemy => {
        const attackResult = enemy.attack(player);
        if (attackResult.damage > 0) {
            // Check if Toxin is in special ability mode (invincible)
            if (!(player.character.name === 'Toxin' && toxinSpecialAbility.active)) {
                gameState.health -= attackResult.damage;
                
                // Check if player is dead
                if (gameState.health <= 0) {
                    gameState.health = 0;
                    gameState.gameOver = true;
                }
            }
            
            // Create fire projectile aimed at player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                const projectileSpeed = 4;
                const velocityX = (dx / distance) * projectileSpeed;
                const velocityY = (dy / distance) * projectileSpeed;
                fireProjectiles.push(new FireProjectile(enemy.x, enemy.y, velocityX, velocityY));
            }
        }
    });
    
    // Update fire projectiles
    fireProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with player
        if (projectile.x < player.x + player.width &&
            projectile.x + projectile.width > player.x &&
            projectile.y < player.y + player.height &&
            projectile.y + projectile.height > player.y) {
            // Check if Toxin is in special ability mode (invincible)
            if (!(player.character.name === 'Toxin' && toxinSpecialAbility.active)) {
                gameState.health -= projectile.damage;
                
                // Check if player is dead
                if (gameState.health <= 0) {
                    gameState.health = 0;
                    gameState.gameOver = true;
                }
            }
            
            fireProjectiles.splice(index, 1);
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            fireProjectiles.splice(index, 1);
        }
    });
    
    // Update arrow projectiles
    arrowProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies (only on Forest location)
        if (gameState.currentLocation === 1) {
            enemies.forEach(enemy => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    enemy.health -= projectile.damage;
                    if (enemy.health <= 0) {
                        const enemyIndex = enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                    arrowProjectiles.splice(index, 1);
                }
            });
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            arrowProjectiles.splice(index, 1);
        }
    });
    
    // Update toxin projectiles
    toxinProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies (only on Forest location)
        if (gameState.currentLocation === 1) {
            enemies.forEach(enemy => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    enemy.health -= projectile.damage;
                    if (enemy.health <= 0) {
                        const enemyIndex = enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                    toxinProjectiles.splice(index, 1);
                }
            });
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            toxinProjectiles.splice(index, 1);
        }
    });
    
    // Update enemies
    enemies.forEach(enemy => {
        enemy.update(player);
    });
    
    // Update friendly enemies
    friendlyEnemies.forEach(friendlyEnemy => {
        friendlyEnemy.update(player);
        friendlyEnemy.glowTimer++;
        
        // Friendly enemies attack other enemies
        enemies.forEach(enemy => {
            const dx = enemy.x - friendlyEnemy.x;
            const dy = enemy.y - friendlyEnemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < friendlyEnemy.attackRange && friendlyEnemy.attackCooldown === 0) {
                friendlyEnemy.attackCooldown = 60; // 1 second at 60fps
                
                // Create blue sphere projectile
                const projectileSpeed = 5;
                const velocityX = (dx / distance) * projectileSpeed;
                const velocityY = (dy / distance) * projectileSpeed;
                blueSphereProjectiles.push(new BlueSphereProjectile(friendlyEnemy.x, friendlyEnemy.y, velocityX, velocityY));
            }
        });
    });
    
    // Update blue sphere projectiles
    blueSphereProjectiles.forEach((projectile, index) => {
        projectile.update();
        
        // Check collision with enemies
        enemies.forEach(enemy => {
            if (projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y) {
                enemy.health -= projectile.damage;
                if (enemy.health <= 0) {
                    const enemyIndex = enemies.indexOf(enemy);
                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1);
                    }
                }
                blueSphereProjectiles.splice(index, 1);
            }
        });
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            blueSphereProjectiles.splice(index, 1);
        }
    });


}

// Update camera
function updateCamera() {
    // Camera is fixed to current location
    const locationStart = gameState.currentLocation * LOCATION_WIDTH;
    cameraX = locationStart;
}

// Update UI
function updateUI() {
    const healthText = document.getElementById('healthText');
    const healthFill = document.getElementById('healthFill');
    const abilityInfo = document.getElementById('abilityInfo');
    const abilityFill = document.getElementById('abilityFill');
    
    if (healthText) healthText.textContent = `Health: ${gameState.health}`;
    if (healthFill) healthFill.style.width = `${(gameState.health / 100) * 100}%`;
    
    // Update ability bar
    if (abilityFill) {
        if (gameState.abilityReady) {
            abilityFill.style.width = '100%';
        } else {
            const abilityProgress = (gameState.hits / 10) * 100;
            abilityFill.style.width = `${abilityProgress}%`;
        }
    }
    
    if (abilityInfo) {
        if (gameState.gameOver) {
            abilityInfo.textContent = 'GAME OVER';
            abilityInfo.style.color = '#ff0000';
        } else if (gameState.abilityReady) {
            if (player.character && player.character.name === 'Troub') {
                abilityInfo.textContent = 'CONVERT READY!';
            } else {
                abilityInfo.textContent = 'SPECIAL READY!';
            }
            abilityInfo.style.color = '#ffff00';
        } else if (gameState.abilityActive) {
            if (player.character && player.character.name === 'Troub') {
                abilityInfo.textContent = 'CONVERT ACTIVE!';
            } else {
                abilityInfo.textContent = 'DASH READY!';
            }
            abilityInfo.style.color = '#00ffff';
        } else {
            abilityInfo.textContent = 'Ability: Ready';
            abilityInfo.style.color = '#ffffff';
        }
    }
}

// Draw functions
function drawBackground() {
    // Draw only current location
    const currentLocation = locations[gameState.currentLocation];
    const locationX = gameState.currentLocation * LOCATION_WIDTH;
    const screenX = locationX - cameraX;
    
    // Draw current location background
    if (currentLocation) {
        // Draw background images for specific locations
        if (currentLocation.name === 'Дом' && currentLocation.hasImage && backgroundImages.home && backgroundImages.home.complete) {
            try {
                ctx.drawImage(backgroundImages.home, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing home background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else if (currentLocation.name === 'Лес' && currentLocation.hasImage && backgroundImages.forest && backgroundImages.forest.complete) {
            try {
                ctx.drawImage(backgroundImages.forest, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing forest background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else if (currentLocation.name === 'Каменная долина' && backgroundImages.street && backgroundImages.street.complete) {
            try {
                ctx.drawImage(backgroundImages.street, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing street background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else if (currentLocation.name === 'Замок' && currentLocation.hasImage && backgroundImages.castle && backgroundImages.castle.complete) {
            try {
                ctx.drawImage(backgroundImages.castle, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing castle background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else if (currentLocation.name === 'Остров' && backgroundImages.island && backgroundImages.island.complete) {
            try {
                ctx.drawImage(backgroundImages.island, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing island background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else if (currentLocation.name === 'Портал' && backgroundImages.portal && backgroundImages.portal.complete) {
            try {
                ctx.drawImage(backgroundImages.portal, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing portal background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else if (currentLocation.name === 'Гиперсити' && backgroundImages.hyperspace && backgroundImages.hyperspace.complete) {
            try {
                ctx.drawImage(backgroundImages.hyperspace, screenX, 0, LOCATION_WIDTH, canvas.height);
            } catch (error) {
                console.error('Error drawing hyperspace background:', error);
                // Fallback to solid color
                ctx.fillStyle = currentLocation.background;
                ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
            }
        } else {
            // Draw solid color background
            ctx.fillStyle = currentLocation.background;
            ctx.fillRect(screenX, 0, LOCATION_WIDTH, canvas.height);
        }
        
        // Ground hidden
        
        // Draw portal at the end of current location (except last)
        if (gameState.currentLocation < locations.length - 1) {
            const portalX = locationX + LOCATION_WIDTH - 60;
            const portalScreenX = portalX - cameraX;
                 
                 // Portal animation
                 const portalPulse = Math.sin(Date.now() * 0.005) * 0.2 + 1;
                 const portalGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                 
                 // Portal center should be at player center level
                 const playerCenterY = canvas.height - 40 - player.height/2;
                 const portalHeight = 120;
                 const portalY = playerCenterY - portalHeight/2;
                 
                 if (portalSprite.complete) {
                     // Draw main portal
                     ctx.drawImage(portalSprite, portalScreenX, portalY, 80, 120);
                     
                     // Draw soft portal glow effect only on front side
                     ctx.save();
                     ctx.globalAlpha = portalGlow * 0.3; // Much softer glow
                     ctx.drawImage(portalSprite, portalScreenX - 3, portalY - 3, 86, 126);
                     ctx.restore();
                     
                     // Draw soft portal particles only on front side
                     for (let i = 0; i < 6; i++) {
                         const angle = (Date.now() * 0.001 + i * 60) * Math.PI / 180; // Slower rotation
                         const particleX = portalScreenX + 40 + Math.cos(angle) * (25 + Math.sin(Date.now() * 0.005) * 5); // Smaller radius
                         const particleY = portalY + 60 + Math.sin(angle) * (25 + Math.sin(Date.now() * 0.005) * 5);
                         
                         ctx.fillStyle = `rgba(255, 100, 255, ${0.4 - i * 0.05})`; // Much softer particles
                         ctx.beginPath();
                         ctx.arc(particleX, particleY, 1.5 + Math.sin(Date.now() * 0.01 + i) * 0.5, 0, Math.PI * 2); // Smaller particles
                         ctx.fill();
                     }
                 } else {
                     // Fallback portal with animation
                     ctx.fillStyle = `rgba(0, 0, 255, ${portalGlow})`;
                     ctx.fillRect(portalScreenX, portalY, 80, 120);
                     
                     // Animated border
                     ctx.strokeStyle = `rgba(255, 100, 255, ${portalGlow})`;
                     ctx.lineWidth = 3;
                     ctx.strokeRect(portalScreenX, portalY, 80, 120);
                 }
             }
         }
     }
     
                       // Draw fade overlay
      if (fadeAlpha > 0) {
          ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
          ctx.fillRect(0,0,canvas.width,canvas.height);
      }


function drawPlayer() {
    if (player.character) {
        // Draw player relative to camera
        const screenX = player.x - cameraX;
        
                 // Draw character sprites if available
         if (player.character.name === 'Origami' && characterSprites.origami && characterSprites.origami.complete) {
            try {
                ctx.save();
                                if (player.direction === -1) {
                    ctx.scale(-1, 1);
                    ctx.drawImage(characterSprites.origami, -(screenX + 80), player.y, 80, player.height);
                } else {
                    ctx.drawImage(characterSprites.origami, screenX, player.y, 80, player.height);
                }
                ctx.restore();
            } catch (error) {
                console.error('Error drawing Origami sprite:', error);
                // Fallback to colored rectangle
                ctx.fillStyle = player.character.color;
                ctx.fillRect(screenX, player.y, player.width, player.height);
            }
         } else if (player.character.name === 'Toxin' && characterSprites.toxin && characterSprites.toxin.complete) {
             try {
                 ctx.save();
                 
                 // Apply black and white effect if special ability is active
                 if (toxinSpecialAbility.active) {
                     ctx.filter = 'grayscale(100%)';
                 }
                 
                 if (player.direction === -1) {
                     ctx.scale(-1, 1);
                     ctx.drawImage(characterSprites.toxin, -(screenX + 80), player.y, 80, player.height);
                 } else {
                     ctx.drawImage(characterSprites.toxin, screenX, player.y, 80, player.height);
                 }
                 ctx.restore();
             } catch (error) {
                 console.error('Error drawing Toxin sprite:', error);
                 // Fallback to colored rectangle
                 ctx.fillStyle = toxinSpecialAbility.active ? '#808080' : player.character.color;
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else if (player.character.name === 'Chameleon' && characterSprites.chameleon && characterSprites.chameleon.complete) {
             try {
                 ctx.save();
                 if (player.direction === -1) {
                     ctx.scale(-1, 1);
                     ctx.drawImage(characterSprites.chameleon, -(screenX + 80), player.y, 80, player.height);
                 } else {
                     ctx.drawImage(characterSprites.chameleon, screenX, player.y, 80, player.height);
                 }
                 ctx.restore();
             } catch (error) {
                 console.error('Error drawing Chameleon sprite:', error);
                 // Fallback to colored rectangle
                 ctx.fillStyle = player.character.color;
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else if (player.character.name === 'Troub' && characterSprites.troub && characterSprites.troub.complete) {
             try {
                 ctx.save();
                 if (player.direction === -1) {
                     ctx.scale(-1, 1);
                     ctx.drawImage(characterSprites.troub, -(screenX + 80), player.y, 80, player.height);
                 } else {
                     ctx.drawImage(characterSprites.troub, screenX, player.y, 80, player.height);
                 }
                 ctx.restore();
             } catch (error) {
                 console.error('Error drawing Troub sprite:', error);
                 // Fallback to colored rectangle
                 ctx.fillStyle = player.character.color;
                 ctx.fillRect(screenX, player.y, player.width, player.height);
             }
         } else {
             // Draw colored rectangle for other characters
             ctx.fillStyle = player.character.color;
             ctx.fillRect(screenX, player.y, player.width, player.height);
         }
        
                 // Character name hidden
        
        // Draw attack animation
        if (player.attacking) {
            if (gameState.abilityActive) {
                // Draw dash attack effect
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 5;
                const dashX = screenX + (player.direction > 0 ? player.width + 100 : -100);
                ctx.beginPath();
                ctx.moveTo(screenX + player.width/2, player.y + player.height/2);
                ctx.lineTo(dashX, player.y + player.height/2);
                ctx.stroke();
                
                // Draw dash trail effect
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.lineWidth = 3;
                for (let i = 1; i <= 3; i++) {
                    const trailX = screenX - (player.direction * i * 20);
                    ctx.beginPath();
                    ctx.moveTo(trailX + player.width/2, player.y + player.height/2);
                    ctx.lineTo(trailX + player.width/2 + (player.direction * 50), player.y + player.height/2);
                    ctx.stroke();
                }
            } else {
                // Draw different attack effects based on character
                if (player.character.name === 'Origami' || player.character.name === 'Chameleon') {
                    // Melee attack - solid line
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 4;
                    const attackX = screenX + (player.direction > 0 ? player.width + 80 : -80);
                    ctx.beginPath();
                    ctx.moveTo(screenX + player.width/2, player.y + player.height/2);
                    ctx.lineTo(attackX, player.y + player.height/2);
                    ctx.stroke();
                } else if (player.character.name === 'Toxin' || player.character.name === 'Troub') {
                    // Ranged attack - no visual effect (removed dashed line)
                    // Attack logic is handled in the attack() function for arrow creation
                } else {
                    // Default attack
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    const attackX = screenX + (player.direction > 0 ? player.width : -player.character.attackRange);
                    ctx.beginPath();
                    ctx.moveTo(screenX + player.width/2, player.y + player.height/2);
                    ctx.lineTo(attackX, player.y + player.height/2);
                    ctx.stroke();
                }
            }
            player.attacking = false;
        }
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const screenX = enemy.x - cameraX;
        
        // Only draw if enemy is visible on screen
        if (screenX > -enemy.width && screenX < canvas.width) {
            // Determine enemy direction based on player position
            const enemyDirection = player.x > enemy.x ? 1 : -1;
            
            // Draw fire enemy sprite if available
            if (enemy.type === 'fire' && enemySprites.fireEnemy && enemySprites.fireEnemy.complete) {
                try {
                    ctx.save();
                                         if (enemyDirection === -1) {
                         // Flip enemy horizontally when facing left
                         ctx.scale(-1, 1);
                         ctx.drawImage(enemySprites.fireEnemy, -(screenX + 80), enemy.y, 80, 60);
                     } else {
                         // Draw normally when facing right
                         ctx.drawImage(enemySprites.fireEnemy, screenX, enemy.y, 80, 60);
                     }
                    ctx.restore();
                } catch (error) {
                    console.error('Error drawing fire enemy sprite:', error);
                    // Fallback to animated fire ball
                    drawAnimatedFireBall(screenX, enemy.y, enemy.width, enemy.height);
                }
            } else {
                // Fallback to animated fire ball
                drawAnimatedFireBall(screenX, enemy.y, enemy.width, enemy.height);
            }
            
            // Draw enemy health bar (only on Forest location)
            if (gameState.currentLocation === 1) {
                const healthBarWidth = 60;
                const healthBarHeight = 4;
                const healthBarX = screenX + 10;
                const healthBarY = enemy.y - 10;
                
                // Health bar background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
                
                // Health bar fill
                const healthPercentage = enemy.health / 30; // 30 is max health
                ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
                ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
            }
        }
    });
}

        function drawFriendlyEnemies() {
            friendlyEnemies.forEach(friendlyEnemy => {
                const screenX = friendlyEnemy.x - cameraX;
                
                // Only draw if friendly enemy is visible on screen
                if (screenX > -friendlyEnemy.width && screenX < canvas.width) {
                    // Determine enemy direction based on player position
                    const enemyDirection = player.x > friendlyEnemy.x ? 1 : -1;
                    
                    // Draw friendly enemy sprite (same as regular enemy but with blue tint)
                    if (friendlyEnemy.type === 'fire' && enemySprites.fireEnemy && enemySprites.fireEnemy.complete) {
                        try {
                            ctx.save();
                            ctx.globalAlpha = 0.8;
                            ctx.filter = 'hue-rotate(180deg)'; // Blue tint
                            
                            if (enemyDirection === -1) {
                                // Flip enemy horizontally when facing left
                                ctx.scale(-1, 1);
                                ctx.drawImage(enemySprites.fireEnemy, -(screenX + 80), friendlyEnemy.y, 80, 60);
                            } else {
                                // Draw normally when facing right
                                ctx.drawImage(enemySprites.fireEnemy, screenX, friendlyEnemy.y, 80, 60);
                            }
                            ctx.restore();
                        } catch (error) {
                            console.error('Error drawing friendly enemy sprite:', error);
                            // Fallback to blue fire ball
                            drawBlueFireBall(screenX, friendlyEnemy.y, friendlyEnemy.width, friendlyEnemy.height);
                        }
                    } else {
                        // Fallback to blue fire ball
                        drawBlueFireBall(screenX, friendlyEnemy.y, friendlyEnemy.width, friendlyEnemy.height);
                    }
                }
            });
        }

function drawBlueFireBall(screenX, y, width, height) {
    // Outer glow
    ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main blue fire ball
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner blue core
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Blue particles effect
    for (let i = 0; i < 3; i++) {
        const angle = (Date.now() / 100 + i * 120) * Math.PI / 180;
        const particleX = screenX + width/2 + Math.cos(angle) * (width/2 + 3);
        const particleY = y + height/2 + Math.sin(angle) * (width/2 + 3);
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAnimatedFireBall(screenX, y, width, height) {
    // Outer glow
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main fire ball
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner fire core
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(screenX + width/2, y + height/2, width/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Fire particles effect
    for (let i = 0; i < 3; i++) {
        const angle = (Date.now() / 100 + i * 120) * Math.PI / 180;
        const particleX = screenX + width/2 + Math.cos(angle) * (width/2 + 3);
        const particleY = y + height/2 + Math.sin(angle) * (width/2 + 3);
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFireProjectiles() {
    fireProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw fire projectile with trail effect
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2 + 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Main projectile
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Fire trail particles
            for (let i = 0; i < 2; i++) {
                const trailX = screenX - projectile.velocityX * (i + 1) * 0.5;
                const trailY = projectile.y - projectile.velocityY * (i + 1) * 0.5;
                ctx.fillStyle = `rgba(255, 170, 0, ${0.6 - i * 0.3})`;
                ctx.beginPath();
                ctx.arc(trailX + projectile.width/2, trailY + projectile.height/2, 3 - i, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

function drawArrowProjectiles() {
    arrowProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw arrow sprite if available
            if (arrowSprite && arrowSprite.complete) {
                try {
                    ctx.save();
                    // Flip arrow based on direction
                    if (projectile.velocityX < 0) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(arrowSprite, -(screenX + projectile.width), projectile.y, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(arrowSprite, screenX, projectile.y, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    console.error('Error drawing arrow sprite:', error);
                    // Fallback to colored rectangle
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
                }
            } else {
                // Fallback to colored rectangle
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
            }
        }
    });
}

function drawToxinProjectiles() {
    toxinProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw toxin bullet sprite if available
            if (toxinBulletSprite && toxinBulletSprite.complete) {
                try {
                    ctx.save();
                    // Flip bullet based on direction
                    if (projectile.velocityX < 0) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(toxinBulletSprite, -(screenX + projectile.width), projectile.y, projectile.width, projectile.height);
                    } else {
                        ctx.drawImage(toxinBulletSprite, screenX, projectile.y, projectile.width, projectile.height);
                    }
                    ctx.restore();
                } catch (error) {
                    console.error('Error drawing toxin bullet sprite:', error);
                    // Fallback to colored rectangle
                    ctx.fillStyle = '#4ecdc4';
                    ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
                }
            } else {
                // Fallback to colored rectangle
                ctx.fillStyle = '#4ecdc4';
                ctx.fillRect(screenX, projectile.y, projectile.width, projectile.height);
            }
        }
    });
}

function drawToxinAttackAnimation() {
    // RADICAL DEBUG: Always draw fire animation for Toxin character
    if (player.character && player.character.name === 'Toxin') {
        const screenX = player.x - cameraX;
        const testY = player.y + player.height / 2 + 5;
        const testX = player.direction > 0 ? screenX + player.width + 25 : screenX - 15;
        
        // Draw fire animation instead of lime rectangle with blinking
        if (toxinAttackSprite && toxinAttackSprite.complete && toxinAttackAnimation.visible) {
            const fireWidth = player.direction > 0 ? 30 : 30; // 30 pixels for both sides
            if (player.direction > 0) {
                // Facing right - flip the sprite horizontally
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(toxinAttackSprite, -testX - fireWidth, testY, fireWidth, 15);
                ctx.restore();
            } else {
                // Facing left - normal sprite
                ctx.drawImage(toxinAttackSprite, testX, testY, fireWidth, 15);
            }
        } else if (!toxinAttackSprite || !toxinAttackSprite.complete) {
            const fireWidth = player.direction > 0 ? 30 : 30; // 30 pixels for both sides
            ctx.fillStyle = 'lime';
            ctx.fillRect(testX, testY, fireWidth, 15);
        }
    }
}

function drawBlueSphereProjectiles() {
    blueSphereProjectiles.forEach(projectile => {
        const screenX = projectile.x - cameraX;
        
        // Only draw if projectile is visible on screen
        if (screenX > -projectile.width && screenX < canvas.width) {
            // Draw blue sphere projectile with glow effect
            ctx.fillStyle = 'rgba(0, 100, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2 + 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Main blue sphere
            ctx.fillStyle = '#0066ff';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner blue core
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(screenX + projectile.width/2, projectile.y + projectile.height/2, projectile.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Blue trail particles
            for (let i = 0; i < 2; i++) {
                const trailX = screenX - projectile.velocityX * (i + 1) * 0.5;
                const trailY = projectile.y - projectile.velocityY * (i + 1) * 0.5;
                ctx.fillStyle = `rgba(0, 170, 255, ${0.6 - i * 0.3})`;
                ctx.beginPath();
                ctx.arc(trailX + projectile.width/2, trailY + projectile.height/2, 3 - i, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

function drawSplashScreen() {
    ctx.fillStyle = '#2d5a3d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ZARGATES', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 50);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState.currentScreen === 'splash') {
        drawSplashScreen();
    } else if (gameState.currentScreen === 'characterSelect') {
        drawCharacterSelection();
    } else if (gameState.currentScreen === 'game') {
        updatePlayer();
        updateCamera();
        updateUI();
        drawBackground();
        drawEnemies();
        drawFriendlyEnemies();
        drawFireProjectiles();
        drawArrowProjectiles();
        drawToxinProjectiles();
        console.log('🎮 About to call drawToxinAttackAnimation');
        drawToxinAttackAnimation();
        console.log('🎮 drawToxinAttackAnimation called');
        drawBlueSphereProjectiles();
        drawPlayer();
        
        // Draw game over screen if player is dead
        if (gameState.gameOver) {
            drawGameOverScreen();
        }
        updateFade();
    }
    
    requestAnimationFrame(gameLoop);
}

// Add canvas click event listener
canvas.addEventListener('click', function(e) {
    if (gameState.currentScreen === 'splash') {
        // Show character selection
        gameState.currentScreen = 'characterSelect';
        drawCharacterSelection();
    } else if (gameState.currentScreen === 'characterSelect') {
        // Handle character selection
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Character selection areas
        if (y > 200 && y < 300) {
            if (x > 100 && x < 200) {
                selectCharacter('origami');
            } else if (x > 250 && x < 350) {
                selectCharacter('toxin');
            } else if (x > 400 && x < 500) {
                selectCharacter('chameleon');
            } else if (x > 550 && x < 650) {
                selectCharacter('troub');
            }
        }
    }
});

// Start the game
loadHomeBackground(); // Load home background image
loadForestBackground(); // Load forest background image
loadStreetBackground(); // Load street background image
loadCastleBackground(); // Load castle background image
loadIslandBackground(); // Load island background image
loadPortalBackground(); // Load portal background image
loadHyperspaceBackground(); // Load hyperspace background image
loadOrigamiSprite(); // Load Origami sprite
loadFireEnemySprite(); // Load fire enemy sprite
loadArrowSprite(); // Load arrow sprite for Troub
loadToxinAttackSprite(); // Load Toxin attack animation sprite
loadToxinBulletSprite(); // Load Toxin bullet sprite
loadMachineGunSound(); // Load machine gun sound
// Don't initialize enemies at start - they will be added when entering Forest location
gameLoop();

// Character selection screen
function drawCharacterSelection() {
    ctx.fillStyle = '#2d5a3d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Select Your Character', canvas.width / 2, 100);
    
    // Draw character options
    const characters = [
        { key: 'origami', name: 'Origami', color: '#ff6b6b' },
        { key: 'toxin', name: 'Toxin', color: '#4ecdc4' },
        { key: 'chameleon', name: 'Chameleon', color: '#45b7d1' },
        { key: 'troub', name: 'Troub', color: '#96ceb4' }
    ];
    
    characters.forEach((char, index) => {
        const x = 150 + index * 150;
        const y = 250;
        
        // Draw character box
        ctx.fillStyle = char.color;
        ctx.fillRect(x, y, 80, 80);
        
        // Draw character name
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(char.name, x + 40, y + 110);
    });
} 
