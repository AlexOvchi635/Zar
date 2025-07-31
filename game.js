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
    characterSprites.toxin.src = 'https://white-worthwhile-nightingale-687.mypinata.cloud/ipfs/bafybeifc6wdh2trjrttockgt6p3u7ge7kxvyhahrykrcsp7ygysqxhstry';
    
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

// Global arrays for enemies and projectiles
let enemies = [];
let fireProjectiles = [];

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
    player.attackCooldown = 15;
    
    // Check if special ability is active for dash attack
    if (gameState.abilityActive) {
        // Dash forward with triple damage
        const dashDistance = 100;
        const dashDirection = player.direction;
        player.x += dashDistance * dashDirection;
        
        // Keep player within world bounds
        if (player.x < 0) player.x = 0;
        if (player.x > WORLD_WIDTH - player.width) player.x = WORLD_WIDTH - player.width;
        
        gameState.score += 30; // Triple damage
        gameState.abilityActive = false; // Deactivate after use
        gameState.abilityTimer = 0;
    } else {
        gameState.score += 10;
    }
    
    gameState.hits++;
    if (gameState.hits >= 10 && !gameState.abilityReady) {
        gameState.abilityReady = true;
    }
}

// Special ability
function useSpecialAbility() {
    if (!gameState.abilityReady || !player.character) return;
    gameState.abilityReady = false;
    gameState.abilityActive = true;
    gameState.hits = 0;
    gameState.abilityTimer = 120; // 2 seconds at 60fps
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
    enemies = [];
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
    
    // Update current location
    gameState.currentLocation = Math.floor(player.x / LOCATION_WIDTH);
    
    // Check for enemy attacks and fire projectiles
    enemies.forEach(enemy => {
        const attackResult = enemy.attack(player);
        if (attackResult.damage > 0) {
            gameState.health -= attackResult.damage;
            
            // Check if player is dead
            if (gameState.health <= 0) {
                gameState.health = 0;
                gameState.gameOver = true;
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
            gameState.health -= projectile.damage;
            
            // Check if player is dead
            if (gameState.health <= 0) {
                gameState.health = 0;
                gameState.gameOver = true;
            }
            
            fireProjectiles.splice(index, 1);
        }
        
        // Remove off-screen projectiles
        if (projectile.isOffScreen()) {
            fireProjectiles.splice(index, 1);
        }
    });
    
    // Update enemies
    enemies.forEach(enemy => {
        enemy.update(player);
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
            abilityInfo.textContent = 'SPECIAL READY!';
            abilityInfo.style.color = '#ffff00';
        } else if (gameState.abilityActive) {
            abilityInfo.textContent = 'DASH READY!';
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
                 ctx.fillStyle = player.character.color;
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
                // Draw normal attack
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                const attackX = screenX + (player.direction > 0 ? player.width : -player.character.attackRange);
                ctx.beginPath();
                ctx.moveTo(screenX + player.width/2, player.y + player.height/2);
                ctx.lineTo(attackX, player.y + player.height/2);
                ctx.stroke();
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
            
                         // Health bar hidden
        }
    });
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
    } else if (gameState.currentScreen === 'game') {
        updatePlayer();
        updateCamera();
        updateUI();
        drawBackground();
        drawEnemies();
        drawFireProjectiles();
        drawPlayer();
        
        // Draw game over screen if player is dead
        if (gameState.gameOver) {
            drawGameOverScreen();
        }
        updateFade();
    }
    
    requestAnimationFrame(gameLoop);
}

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
// Don't initialize enemies at start - they will be added when entering Forest location
gameLoop(); 
