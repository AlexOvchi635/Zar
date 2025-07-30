// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = {
    currentScreen: 'characterSelect', // characterSelect, levelSelect, game, gameOver, victory
    selectedCharacter: null,
    currentLevel: 1,
    score: 0,
    health: 100,
    hits: 0,
    abilityReady: false,
    abilityActive: false,
    abilityTimer: 0
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
    direction: 1, // 1 for right, -1 for left
    attacking: false,
    attackCooldown: 0,
    dashCooldown: 0,
    invincible: false,
    invincibleTimer: 0
};

// Game objects
let platforms = [];
let enemies = [];
let projectiles = [];
let particles = [];
let allies = [];

// Input handling
const keys = {};
const mouse = { x: 0, y: 0, clicked: false };

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameState.currentScreen === 'game') {
        mouse.clicked = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'Space') {
        mouse.clicked = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    mouse.clicked = true;
});

// Character definitions
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

// Level definitions
const levels = {
    1: {
        name: 'City Streets',
        background: '#2c3e50',
        platforms: [
            { x: 0, y: 550, width: 1200, height: 50, color: '#34495e' },
            { x: 200, y: 450, width: 100, height: 20, color: '#34495e' },
            { x: 400, y: 350, width: 100, height: 20, color: '#34495e' },
            { x: 600, y: 250, width: 100, height: 20, color: '#34495e' },
            { x: 800, y: 350, width: 100, height: 20, color: '#34495e' },
            { x: 1000, y: 450, width: 100, height: 20, color: '#34495e' }
        ],
        enemies: [
            { x: 300, y: 500, width: 30, height: 40, health: 50, type: 'melee', color: '#e74c3c' },
            { x: 500, y: 400, width: 30, height: 40, health: 50, type: 'ranged', color: '#e67e22' },
            { x: 700, y: 300, width: 30, height: 40, health: 50, type: 'melee', color: '#e74c3c' },
            { x: 900, y: 400, width: 30, height: 40, health: 50, type: 'ranged', color: '#e67e22' }
        ]
    },
    2: {
        name: 'Forest Ambush',
        background: '#27ae60',
        platforms: [
            { x: 0, y: 550, width: 1200, height: 50, color: '#2d5a3d' },
            { x: 150, y: 450, width: 80, height: 20, color: '#2d5a3d' },
            { x: 350, y: 350, width: 80, height: 20, color: '#2d5a3d' },
            { x: 550, y: 250, width: 80, height: 20, color: '#2d5a3d' },
            { x: 750, y: 350, width: 80, height: 20, color: '#2d5a3d' },
            { x: 950, y: 450, width: 80, height: 20, color: '#2d5a3d' }
        ],
        enemies: [
            { x: 250, y: 500, width: 30, height: 40, health: 60, type: 'melee', color: '#e74c3c' },
            { x: 450, y: 400, width: 30, height: 40, health: 60, type: 'ranged', color: '#e67e22' },
            { x: 650, y: 300, width: 30, height: 40, health: 60, type: 'melee', color: '#e74c3c' },
            { x: 850, y: 400, width: 30, height: 40, health: 60, type: 'ranged', color: '#e67e22' },
            { x: 1050, y: 500, width: 30, height: 40, health: 60, type: 'melee', color: '#e74c3c' }
        ]
    },
    3: {
        name: 'Factory Complex',
        background: '#8e44ad',
        platforms: [
            { x: 0, y: 550, width: 1200, height: 50, color: '#6c5ce7' },
            { x: 100, y: 450, width: 120, height: 20, color: '#6c5ce7' },
            { x: 300, y: 350, width: 120, height: 20, color: '#6c5ce7' },
            { x: 500, y: 250, width: 120, height: 20, color: '#6c5ce7' },
            { x: 700, y: 350, width: 120, height: 20, color: '#6c5ce7' },
            { x: 900, y: 450, width: 120, height: 20, color: '#6c5ce7' }
        ],
        enemies: [
            { x: 200, y: 500, width: 30, height: 40, health: 70, type: 'melee', color: '#e74c3c' },
            { x: 400, y: 400, width: 30, height: 40, health: 70, type: 'ranged', color: '#e67e22' },
            { x: 600, y: 300, width: 30, height: 40, health: 70, type: 'melee', color: '#e74c3c' },
            { x: 800, y: 400, width: 30, height: 40, health: 70, type: 'ranged', color: '#e67e22' },
            { x: 1000, y: 500, width: 30, height: 40, health: 70, type: 'melee', color: '#e74c3c' },
            { x: 1100, y: 300, width: 30, height: 40, health: 70, type: 'ranged', color: '#e67e22' }
        ]
    }
};

// Character selection
document.querySelectorAll('.character-option').forEach(option => {
    option.addEventListener('click', () => {
        gameState.selectedCharacter = option.dataset.character;
        document.getElementById('characterSelect').style.display = 'none';
        document.getElementById('levelSelect').style.display = 'block';
    });
});

// Level selection
document.querySelectorAll('.level-option').forEach(option => {
    option.addEventListener('click', () => {
        gameState.currentLevel = parseInt(option.dataset.level);
        startGame();
    });
});

function startGame() {
    document.getElementById('levelSelect').style.display = 'none';
    gameState.currentScreen = 'game';
    gameState.score = 0;
    gameState.health = 100;
    gameState.hits = 0;
    gameState.abilityReady = false;
    gameState.abilityActive = false;
    gameState.abilityTimer = 0;
    
    // Initialize player
    player.character = characters[gameState.selectedCharacter];
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.attacking = false;
    player.attackCooldown = 0;
    player.dashCooldown = 0;
    player.invincible = false;
    player.invincibleTimer = 0;
    
    // Load level
    loadLevel(gameState.currentLevel);
    
    updateUI();
}

function loadLevel(levelNum) {
    const level = levels[levelNum];
    platforms = level.platforms;
    enemies = level.enemies.map(enemy => ({
        ...enemy,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        attacking: false,
        attackCooldown: 0,
        direction: Math.random() > 0.5 ? 1 : -1
    }));
    projectiles = [];
    particles = [];
    allies = [];
}

function updateUI() {
    document.getElementById('health').textContent = `Health: ${gameState.health}`;
    document.getElementById('score').textContent = `Score: ${gameState.score}`;
    document.getElementById('hits').textContent = `Hits: ${gameState.hits}/10`;
    
    if (gameState.abilityReady) {
        document.getElementById('ability').textContent = `Ability: ${player.character.specialDescription}`;
    } else if (gameState.abilityActive) {
        document.getElementById('ability').textContent = `Ability: Active (${Math.ceil(gameState.abilityTimer/60)})`;
    } else {
        document.getElementById('ability').textContent = 'Ability: Charging...';
    }
}

// Physics functions
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updatePlayer() {
    // Movement
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.direction = -1;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.direction = 1;
    } else {
        player.velocityX *= 0.8;
    }
    
    // Jumping
    if (keys['ArrowUp'] && player.onGround) {
        player.velocityY = -15;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += 0.8;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Platform collision
    player.onGround = false;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
        }
    }
    
    // Attack cooldown
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.dashCooldown > 0) player.dashCooldown--;
    
    // Invincibility
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    // Attack
    if (mouse.clicked && player.attackCooldown === 0) {
        attack();
    }
    
    // Special ability
    if (keys['KeyE'] && gameState.abilityReady && !gameState.abilityActive) {
        useSpecialAbility();
    }
    
    // Ability timer
    if (gameState.abilityActive) {
        gameState.abilityTimer--;
        if (gameState.abilityTimer <= 0) {
            gameState.abilityActive = false;
            if (player.character.specialAbility === 'combo') {
                player.invincible = false;
            }
        }
    }
}

function attack() {
    player.attacking = true;
    player.attackCooldown = 20;
    
    // Create attack hitbox
    const attackBox = {
        x: player.direction > 0 ? player.x + player.width : player.x - player.character.attackRange,
        y: player.y + player.height/2 - 20,
        width: player.character.attackRange,
        height: 40
    };
    
    // Check for hits
    let hitEnemy = false;
    for (let enemy of enemies) {
        if (checkCollision(attackBox, enemy)) {
            enemy.health -= player.character.attackDamage;
            gameState.hits++;
            gameState.score += 10;
            hitEnemy = true;
            
            // Create damage particles
            for (let i = 0; i < 5; i++) {
                particles.push({
                    x: enemy.x + enemy.width/2,
                    y: enemy.y + enemy.height/2,
                    velocityX: (Math.random() - 0.5) * 10,
                    velocityY: (Math.random() - 0.5) * 10,
                    life: 30,
                    color: '#ff0000'
                });
            }
            
            if (enemy.health <= 0) {
                enemies.splice(enemies.indexOf(enemy), 1);
                gameState.score += 50;
            }
        }
    }
    
    // Check ability readiness
    if (gameState.hits >= 10 && !gameState.abilityReady) {
        gameState.abilityReady = true;
        gameState.hits = 0;
    }
    
    // Create attack effect
    if (player.character.specialAbility === 'dash' && gameState.abilityActive) {
        // Dash attack
        player.x += player.direction * 100;
        for (let enemy of enemies) {
            if (Math.abs(enemy.x - player.x) < 100 && Math.abs(enemy.y - player.y) < 50) {
                enemy.health -= player.character.attackDamage * 3;
                gameState.score += 30;
                if (enemy.health <= 0) {
                    enemies.splice(enemies.indexOf(enemy), 1);
                    gameState.score += 50;
                }
            }
        }
    }
    
    setTimeout(() => {
        player.attacking = false;
    }, 200);
}

function useSpecialAbility() {
    gameState.abilityReady = false;
    gameState.abilityActive = true;
    
    switch (player.character.specialAbility) {
        case 'dash':
            gameState.abilityTimer = 60; // 1 second
            player.dashCooldown = 120;
            break;
        case 'combo':
            gameState.abilityTimer = 600; // 10 seconds
            player.invincible = true;
            player.invincibleTimer = 600;
            break;
        case 'instantKill':
            gameState.abilityTimer = 60;
            // Instant kill random enemy
            if (enemies.length > 0) {
                const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                enemies.splice(enemies.indexOf(randomEnemy), 1);
                gameState.score += 100;
            }
            break;
        case 'convert':
            gameState.abilityTimer = 60;
            // Convert 2 random enemies to allies
            for (let i = 0; i < 2 && enemies.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * enemies.length);
                const enemy = enemies.splice(randomIndex, 1)[0];
                allies.push({
                    ...enemy,
                    color: '#00ff00',
                    isAlly: true
                });
            }
            break;
    }
}

function updateEnemies() {
    for (let enemy of enemies) {
        // Simple AI
        if (Math.random() < 0.02) {
            enemy.direction *= -1;
        }
        
        enemy.velocityX = enemy.direction * 2;
        enemy.x += enemy.velocityX;
        
        // Keep enemies in bounds
        if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
            enemy.direction *= -1;
        }
        
        // Attack player if close
        if (Math.abs(enemy.x - player.x) < 50 && Math.abs(enemy.y - player.y) < 50) {
            if (!player.invincible && !gameState.abilityActive) {
                gameState.health -= 1;
            }
        }
    }
}

function updateAllies() {
    for (let ally of allies) {
        // Ally AI - attack nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (let enemy of enemies) {
            const distance = Math.abs(enemy.x - ally.x) + Math.abs(enemy.y - ally.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        if (nearestEnemy) {
            // Move towards enemy
            if (nearestEnemy.x > ally.x) {
                ally.velocityX = 2;
            } else {
                ally.velocityX = -2;
            }
            
            ally.x += ally.velocityX;
            
            // Attack if close
            if (Math.abs(nearestEnemy.x - ally.x) < 40) {
                nearestEnemy.health -= 5;
                if (nearestEnemy.health <= 0) {
                    enemies.splice(enemies.indexOf(nearestEnemy), 1);
                    gameState.score += 25;
                }
            }
        }
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.x += projectile.velocityX;
        projectile.y += projectile.velocityY;
        
        // Check wall collision for ricochet
        if (projectile.x <= 0 || projectile.x >= canvas.width) {
            projectile.velocityX *= -1;
            projectile.damage *= 1.5; // Increase damage on ricochet
        }
        
        // Check enemy hits
        for (let enemy of enemies) {
            if (checkCollision(projectile, enemy)) {
                enemy.health -= projectile.damage;
                gameState.score += 10;
                projectiles.splice(i, 1);
                
                if (enemy.health <= 0) {
                    enemies.splice(enemies.indexOf(enemy), 1);
                    gameState.score += 50;
                }
                break;
            }
        }
        
        // Remove projectiles that are off screen
        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityX *= 0.95;
        particle.velocityY *= 0.95;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Drawing functions
function drawBackground() {
    const level = levels[gameState.currentLevel];
    ctx.fillStyle = level.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlatforms() {
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
}

function drawPlayer() {
    if (player.invincible) {
        ctx.globalAlpha = 0.5;
    }
    
    // Player body
    ctx.fillStyle = player.character.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player details
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 10, player.y + 10, 20, 10); // Eyes
    ctx.fillRect(player.x + 15, player.y + 25, 10, 5); // Mouth
    
    // Attack effect
    if (player.attacking) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (player.direction > 0) {
            ctx.moveTo(player.x + player.width, player.y + player.height/2);
            ctx.lineTo(player.x + player.width + player.character.attackRange, player.y + player.height/2);
        } else {
            ctx.moveTo(player.x, player.y + player.height/2);
            ctx.lineTo(player.x - player.character.attackRange, player.y + player.height/2);
        }
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
}

function drawEnemies() {
    for (let enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy details
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
        
        // Health bar
        const healthPercent = enemy.health / 70;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercent, 5);
    }
}

function drawAllies() {
    for (let ally of allies) {
        ctx.fillStyle = ally.color;
        ctx.fillRect(ally.x, ally.y, ally.width, ally.height);
        
        // Ally details
        ctx.fillStyle = '#000';
        ctx.fillRect(ally.x + 5, ally.y + 5, 5, 5);
        ctx.fillRect(ally.x + 20, ally.y + 5, 5, 5);
    }
}

function drawProjectiles() {
    for (let projectile of projectiles) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawParticles() {
    for (let particle of particles) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawAbilityEffect() {
    if (gameState.abilityActive) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x - 10, player.y - 10, player.width + 20, player.height + 20);
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState.currentScreen === 'game') {
        // Update game objects
        updatePlayer();
        updateEnemies();
        updateAllies();
        updateProjectiles();
        updateParticles();
        
        // Draw everything
        drawBackground();
        drawPlatforms();
        drawEnemies();
        drawAllies();
        drawProjectiles();
        drawParticles();
        drawPlayer();
        drawAbilityEffect();
        
        // Update UI
        updateUI();
        
        // Check win/lose conditions
        if (gameState.health <= 0) {
            gameOver();
        } else if (enemies.length === 0) {
            victory();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.currentScreen = 'gameOver';
    document.getElementById('finalScore').textContent = `Final Score: ${gameState.score}`;
    document.getElementById('gameOver').style.display = 'block';
}

function victory() {
    gameState.currentScreen = 'victory';
    document.getElementById('victoryScore').textContent = `Score: ${gameState.score}`;
    document.getElementById('victory').style.display = 'block';
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

function nextLevel() {
    document.getElementById('victory').style.display = 'none';
    gameState.currentLevel++;
    if (gameState.currentLevel > 3) {
        gameState.currentLevel = 1;
    }
    startGame();
}

function showCharacterSelect() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    gameState.currentScreen = 'characterSelect';
    document.getElementById('characterSelect').style.display = 'block';
}

// Start the game
gameLoop(); 
