var initialized = false; 
var canvas;
var ctx;
var GLOBAL_timestamp = 0;
var currentFrameTime = 0;
var lastFrameTimestamp = 0;

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const SPEED = 400; //Pixels per Second (px/s)
const imagePath = 'images/';

var movement = {};
movement.move_posY = false;
movement.move_negY = false;
movement.move_posX = false;
movement.move_negX = false;

var player = {};
player.x_size = 30;
player.y_size = 30;
player.x = GAME_WIDTH / 4;
player.y = GAME_HEIGHT / 2;

var opponent = {};
opponent.x_size = 30;
opponent.y_size = 30;
opponent.x = (GAME_WIDTH * 3/4) + (opponent.x_size / 2);
opponent.y = (GAME_HEIGHT / 2) + (opponent.y_size / 2);

var crosshair = {};
var marker = {};

var resources = {};
resources.crosshair = imagePath + 'crosshair.png';
resources.marker = imagePath + 'marker.png';
resources.container = {};
resources.ability0 = {};
resources.ability1 = {};
resources.hud = {};

var abilities = {};
abilities[0] = {};
abilities[0].name = 'fireball';
abilities[0].active = false;

var cursorPos = {};
var pendingClick = false;
var lastClickAt = 0;
cursorPos.x = 0;
cursorPos.y = 0;
cursorPos.last = {};
cursorPos.last.x = 0;
cursorPos.last.y = 0;

var abilityAnimationQueues = {};
abilityAnimationQueues.fireball = {};
abilityAnimationQueues.fireball.queued = false;
abilityAnimationQueues.fireball.x = 0;
abilityAnimationQueues.fireball.y = 0;

window.addEventListener('DOMContentLoaded', (event) => {
    astro();
});

function logger(message)
{
    console.log('%c[Astro-Log] %c' + message, 'color:red;', '');
}

function welcomeToAstro()
{
    console.log('%cProject-Astro', 'color:purple;font-family:\'Courier New\';font-size:24px;font-weight:700;');
    logger('Initialization Complete');
}

function isValidBoundary(direction)
{
    if( (direction == 'moveUp') && (player.y > (player.y_size / 2)) )
    {
        return true;
    }

    if( (direction == 'moveDown') && (player.y < GAME_HEIGHT - (player.y_size / 2)) )
    {
        return true;
    }

    if( (direction == 'moveRight') && (player.x < GAME_WIDTH - (player.x_size / 2) ) )
    {
        return true;
    }

    if( (direction == 'moveLeft') && (player.x > (player.x_size / 2)) )
    {
        return true;
    }
    return false;
}

function keyDownHandler(e)
{
    const key = e.code;
    switch(key)
    {
        case 'KeyW':
            movement.move_posY = true;
            break;
        case 'KeyS':
            movement.move_negY = true;
            break;
        case 'KeyA':
            movement.move_negX = true;
            break;
        case 'KeyD':
            movement.move_posX = true;
            break;
    }
    return;
}

function keyUpHandler(e)
{
    const key = e.code;
    switch(key)
    {
        case 'KeyW':
            movement.move_posY = false;
            break;
        case 'KeyS':
            movement.move_negY = false;
            break;
        case 'KeyA':
            movement.move_negX = false;
            break;
        case 'KeyD':
            movement.move_posX = false;
            break;
    }
    return;
}

function mouseMoveHandler(e)
{
    cursorPos.x = e.offsetX;
    cursorPos.y = e.offsetY;
}

function mouseClickHandler(e)
{
    for(a in abilities)
    {
        if(abilities[a].active)
        {
            pendingClick = true;
            lastClickAt = GLOBAL_timestamp;
            cursorPos.last.x = e.offsetX;
            cursorPos.last.y = e.offsetY;
            fireAbility(a, e.offsetX, e.offsetY);
            return;
        }
    }
}

function fireAbility(a, x, y)
{
    if(a == 0)
    {
        abilityAnimationQueues.fireball.queued = true;
        abilityAnimationQueues.fireball.x = x;
        abilityAnimationQueues.fireball.y = y;
        handleCollisionDetection(a, x, y);
    }
}

function handleCollisionDetection(a, x, y)
{
    console.log(a, x, y);

/*     console.log('OpponentX=>', opponent.x)
    console.log('OpponentY=>', opponent.y)
    console.log('OpponentX_Width=>', opponent.x_size)
    console.log('OpponentY_Width=>', opponent.y_size) */
}

var fireball = {};
var t = false;
var fireballAnimationComplete = false;
function showFireballAnimation()
{
    const AnimationSpeed = 10;
    let newAnim = (abilityAnimationQueues.fireball.x != fireball.x_end) ? true : false;
    fireball.x_0 = player.x;
    fireball.y_0 = player.y;
    fireball.x_end = abilityAnimationQueues.fireball.x;
    fireball.y_end = abilityAnimationQueues.fireball.y;
    fireball.x_center = fireball.x_0 + (fireball.x_end - fireball.x_0) / 2;
    fireball.y_center = fireball.y_0 + (fireball.y_end - fireball.y_0) / 2;
    fireball.distance = Math.sqrt( (fireball.x_end - fireball.x_0)**2 + (fireball.y_end - fireball.y_0)**2 );
    fireball.radius = fireball.distance / 2;
    fireball.theta = Math.atan((fireball.y_end - fireball.y_0) / (fireball.x_end - fireball.x_0));
    fireball.t_min = fireball.theta + Math.PI;
    fireball.t_max = fireball.theta + Math.PI*2;
    let reverse = (fireball.x_end < fireball.x_0) ? true : false;
    if(newAnim)
        t = (!reverse) ? fireball.t_min : fireball.t_max;
    t = (!reverse) ? (t + (AnimationSpeed * currentFrameTime / 1000)) : (t - (AnimationSpeed * currentFrameTime / 1000));
    if((!reverse && t >= fireball.t_max) || (reverse && t <= fireball.t_min))
    {
        abilityAnimationQueues.fireball.queued = false; 
        fireball.x_end = 0;
    }
    fireball.x_equation = fireball.x_center + fireball.radius * Math.cos(t);
    fireball.y_equation = fireball.y_center + fireball.radius * Math.sin(t);
    ctx.fillStyle = 'yellow'; 
    ctx.fillRect(fireball.x_equation, fireball.y_equation, 10, 10); 
}

function handleMovement()
{
    if(movement.move_posY && Boolean(isValidBoundary('moveUp')))
    {
        player.y -= SPEED * currentFrameTime / 1000;
    } else {
        movement.move_posY = false;
    }
    
    if(movement.move_negY && Boolean(isValidBoundary('moveDown')))
    {
        player.y += SPEED * currentFrameTime / 1000;
    } else {
        movement.move_negY = false;
    }
    
    if(movement.move_posX && Boolean(isValidBoundary('moveRight')))
    {
        player.x += SPEED * currentFrameTime / 1000;
    } else {
        movement.move_posX = false;
    }
    
    if(movement.move_negX && Boolean(isValidBoundary('moveLeft')))
    //if(movement.move_negX)
    {
        player.x -= SPEED * currentFrameTime / 1000;
    } else {
        movement.move_negX = false;
    }
    return;
}

function renderPlayer()
{
    ctx.fillStyle = 'white'; 
    ctx.fillRect(player.x - player.x_size / 2, player.y - player.y_size / 2, player.x_size, player.y_size); 
    return;
}

function renderOpponent()
{
    ctx.fillStyle = 'red'; 
    ctx.fillRect(opponent.x - opponent.x_size, opponent.y - opponent.y_size, opponent.x_size, opponent.y_size); 
    return;
}

function renderCrosshair()
{
    if(crosshair.constructor.name == 'HTMLImageElement')
        ctx.drawImage(crosshair, cursorPos.x, cursorPos.y);
}

function renderMarker()
{
    if(marker.constructor.name == 'HTMLImageElement')
        ctx.drawImage(marker, cursorPos.last.x, cursorPos.last.y);
}

function boot()
{
    crosshair = new Image();
    marker = new Image();
    crosshair.src = resources.crosshair;
    marker.src = resources.marker;
    
    resources.container = document.getElementsByClassName('astroContainer')[0];
    resources.hud = document.createElement('div');
    resources.ability0 = document.createElement('div');
    resources.ability1 = document.createElement('div');
    
    resources.hud.className = 'astroHud';
    resources.ability0.className = 'astroAbility';
    resources.ability1.className = 'astroAbility';
    
    resources.hud.append(resources.ability0);
    resources.hud.append(resources.ability1);
    resources.container.prepend(resources.hud);

    abilities[0].element = resources.ability0;

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('click', mouseClickHandler, false);

    resources.ability0.addEventListener('click', (event) => {
        abilities[0].active = (abilities[0].active) ? false : true;
        if(abilities[0].active)
        {
            resources.container.style.cursor = 'none';
            abilities[0].element.style.border = '2px solid #27ff00';
            abilities[0].element.style.boxShadow = '0px 0px 3px 3px #27ff00';
        } else {
            resources.container.style.cursor = 'default';
            abilities[0].element.style.border = '2px solid rgba(255,255,255)';
            abilities[0].element.style.removeProperty('box-shadow');
        }
    });
    
    initialized = true;
    welcomeToAstro();
}

function astro(timestamp)
{ 
    timestamp = timestamp || 0;
    GLOBAL_timestamp = timestamp;
    currentFrameTime = (timestamp - lastFrameTimestamp); 
    lastFrameTimestamp = timestamp;

    canvas = document.getElementById('gameContainer');
    ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    if(!initialized)
        boot();
    
    window.requestAnimationFrame(astro);
    
    handleMovement();

    renderPlayer();
    renderOpponent();

    if(pendingClick && ((timestamp - lastClickAt) < 500))
        renderMarker();

    for(a in abilities)
    {
        if(abilities[a].active)
            renderCrosshair();
    }

    if(abilityAnimationQueues.fireball.queued)
        showFireballAnimation();
}