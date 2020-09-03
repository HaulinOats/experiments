import Ship from './Ship.js';
import ShipLaser from './ShipLaser.js';
import Enemy from './Enemy.js';
import EnemyBullet from './EnemyBullet.js';
import Explosion from './Explosion.js';
import Text from './Text.js';

class GameScene extends Phaser.Scene {
  constructor(){
    super({scene:'GameScene'});
    this.isMobile = window.innerHeight > window.innerWidth ? true : false;
    this.enemyWidth = 0;
    this.enemyHeight = 0;
    this.enemyPadding = 10;
    this.enemyShiftDistance = 15;
    this.enemyLastFired = 2000;
    this.enemyBulletDelay = 1000;
    this.enemySpeed = 1;
    this.shipLaserBorn = 0;
    this.enemiesMovingRight = true;
    this.enemiesMovingDown = true;
    this.score = 0;
    this.gameOver = false;
  }

  preload(){
    this.load.image('background', 'assets/background.png');
    this.load.image('ship', 'assets/ship.png');
    this.load.spritesheet('enemy', 'assets/enemySprite.png', {
      frameWidth:15,
      frameHeight:16
    });
    this.load.image('shipLaser', 'assets/shipLaser.png');
    this.load.image('enemyBullet', 'assets/enemyBullet.png');
    this.load.spritesheet('explosion', 'assets/explosion.png', {
      frameWidth:100,
      frameHeight:100
    })
    this.load.image('shipExhaust', 'assets/shipExhaust.png');
  }

  create(){
    //set background
    this.background = this.add.tileSprite(0,0, this.game.config.width, this.game.config.height, 'background').setOrigin(0,0);

    // The player and its settings. Send in game config variables for use by Ship
    this.playerShip = new Ship(this, 200, 550, 'ship');
    
    //create ship's exhaust particle animation
    this.shipExhaust = this.add.particles('shipExhaust');
    this.emitter = this.shipExhaust.createEmitter({
      x:15,
      y:40,
      speed:100,
      scale:{
        start:0.025,
        end:0
      },
      blendMode:'ADD',
      gravityY:700
    })
    this.emitter.startFollow(this.playerShip);

    this.shipLasers = this.physics.add.group({ 
      classType: ShipLaser, 
      runChildUpdate: true,
      maxSize:15
    });

    this.enemies = this.physics.add.group({
      classType:Enemy,
      runChildUpdate:true,
    });
    this.populateEnemies();

    this.enemyBullets = this.physics.add.group({
      classType:EnemyBullet,
      runChildUpdate:true,
      maxSize:10
    })

    this.explosions = this.add.group({
      classType:Explosion
    })

    //create text objects
    this.scoreText = new Text(this, 10, 10, `Score: 0`, {});
    this.gameOverBtn = new Text(this, this.game.config.width/2, this.game.config.height/2, 'Game Over\nPress Enter', {fontSize:'40px', backgroundColor:'#FFF', color:'#000', align:'center'}).setVisible(false).setOrigin(0.5).setInteractive();
    this.nextLevelBtn = new Text(this, this.game.config.width/2, this.game.config.height/2, 'Next Level\nPress Enter', {fontSize:'40px',backgroundColor:'#FFF', color:'#000', align:'center'}).setVisible(false).setOrigin(0.5).setInteractive();

    //handle player input
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.altUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.altDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.altLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.altRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    //handle collisions
    this.physics.add.collider(this.enemies, this.shipLasers, this.enemyHit, null, this);
    this.physics.add.collider(this.playerShip, this.enemies, this.shipCrash, null, this);
    this.physics.add.collider(this.playerShip, this.enemyBullets, this.playerHit, null, this);

    //event listeners
    if(this.isMobile){
      this.pointer = this.input.on('pointermove', (pointer)=>{
        if(pointer.x < this.game.config.width && pointer.x > 0 && pointer.y > 0 && pointer.y < this.game.config.height && !this.gameOver){
            this.playerFire();
            this.playerShip.setPosition(pointer.x - 10, pointer.y - 80)
        }
      })
    }
    this.nextLevelBtn.on('pointerdown', ()=>{
      this.goToNextLevel();
    });
    this.gameOverBtn.on('pointerdown', ()=>{
      this.resetGame();
    })
  }

  update(time, delta){
    //scroll background texture
    this.background.tilePositionY -= 1;

    if(!this.gameOver){
      this.moveEnemies();
      this.checkEnemyOutOfBounds();
      this.enemyFire();
    }
    
    if (this.upKey.isDown || this.altUpKey.isDown) {
      this.playerShip.moveUp();
    }

    if(this.downKey.isDown || this.altDownKey.isDown){
      this.playerShip.moveDown();
    }

    if(this.leftKey.isDown || this.altLeftKey.isDown){
      this.playerShip.moveLeft();
    }

    if(this.rightKey.isDown || this.altRightKey.isDown){
      this.playerShip.moveRight();
    }

    //player shoot
    if(this.spaceKey.isDown){
      if(!this.gameOver){
        this.playerFire();
      }
    }

    if(this.enterKey.isDown){
      if(!this.enemies.getFirstAlive()){
        this.goToNextLevel();
      }
      if(this.gameOver){
        this.resetGame();
      }
    }
  }

  populateEnemies(){
    //create first enemy to get actual width and height due to scaling then destroy it
    let enemyRef = this.enemies.create(0 , 0, 'enemy');
    this.enemyWidth = enemyRef.body.width;
    this.enemyHeight = enemyRef.body.height;
    enemyRef.destroy();

    //3 rows
    for(var i = 1; i < 4; i++){
      //8 columns
      for(var j = 1; j < 9; j++){
        this.enemies.create(j * (this.enemyWidth + this.enemyPadding) , i * (this.enemyHeight + this.enemyPadding));
      }
    }
  }

  checkEnemyOutOfBounds(){
    for(var i = 0; i < this.enemies.getChildren().length; i++){
      var enemy = this.enemies.getChildren()[i];
      //if any enemies overlap right side of screen
      if(this.game.config.width < enemy.x + enemy.width){
        this.enemiesMovingRight = false;
        this.shiftEnemies();
        return;
      }
      //if any enemies overlap left side of screen
      if(enemy.x < 0 + enemy.width){
        this.enemiesMovingRight = true;
        this.shiftEnemies();
        return;
      }
      //if enemies touch bottom of screen
      if(enemy.y + enemy.height > this.game.config.height){
        this.enemiesMovingDown = false;
        this.shiftEnemies();
        return;
      }
      //if enemies touch top of screen
      if(enemy.y < 0){
        this.enemiesMovingDown = true;
        this.shiftEnemies();
        return;
      }
    }
  }

  shiftEnemies(){
    for(var i = 0; i < this.enemies.getChildren().length; i++){
      var enemy = this.enemies.getChildren()[i];
      if(this.enemiesMovingDown){
        enemy.y += this.enemyShiftDistance;
      } else {
        enemy.y -= this.enemyShiftDistance;
      }
    }
  }

  moveEnemies(){
    for(var i = 0; i < this.enemies.getChildren().length; i++){
      let enemy = this.enemies.getChildren()[i];
      if(this.enemiesMovingRight){
        enemy.x += this.enemySpeed;
      } else {
        enemy.x -= this.enemySpeed;
      }
    }
  }

  enemyHit(bullet, enemy){
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
    this.explosions.create(enemy.x, enemy.y);
    bullet.destroy();
    enemy.destroy();
    if(!this.enemies.getFirstAlive()){
      this.destroyAllBullets();
      this.nextLevelBtn.setVisible(true).setActive(true);
    }
  }

  destroyAllBullets(){
    this.enemyBullets.clear(true, true);
    this.shipLasers.clear(true, true);
  }

  playerHit(player, enemyBullet){
    this.explosions.create(player.x, player.y);
    this.destroyAllBullets();
    player.setVisible(false);
    this.emitter.stop();
    this.gameOver = true;
    this.gameOverBtn.setVisible(true);
  }

  shipCrash(){
    this.explosions.create(player.x, player.y);
    this.playerShip.setVisible(false);
    this.emitter.stop();
    this.gameOverBtn.setVisible(true);
    this.gameOver = true;
  }

  playerFire(){
    if(this.game.getTime() > this.shipLaserBorn){
      var bullet = this.shipLasers.get();
      if(bullet){
        this.shipLaserBorn = this.game.getTime() + 250;
        bullet.setActive(true).fire(this.playerShip);
      }
    }
  }

  enemyFire(){
    if(this.game.getTime() > this.enemyLastFired){
      if(this.enemies.getFirstAlive()){
        var randomEnemyIdx = Math.floor(Math.random() * this.enemies.getChildren().length) + 1;
        var randomEnemy = this.enemies.getChildren()[randomEnemyIdx - 1];
        var enemyBullet = this.enemyBullets.get();
        if(enemyBullet){
          this.enemyLastFired = this.game.getTime() + this.enemyBulletDelay;
          enemyBullet.fire(randomEnemy, this.playerShip);
        }
      }
    }
  }

  resetGame(){
    this.score = 0;
    this.scoreText.setText('Score: 0');
    this.enemySpeed = 1;
    this.gameOver = false;
    this.enemyLastFired = this.game.getTime() + this.enemyBulletDelay;
    this.enemies.clear(true, true);
    this.gameOverBtn.setVisible(false);
    this.playerShip.setVisible(true).setPosition(200, 550);
    this.emitter.start();
    this.populateEnemies();
  }

  goToNextLevel(){
    this.enemySpeed += 0.5;
    this.enemyLastFired = this.game.getTime() + this.enemyBulletDelay;
    this.nextLevelBtn.setVisible(false);
    this.enemyLastFired += 2000;
    this.populateEnemies();
    this.playerShip.setPosition(200, 550);
    this.destroyAllBullets();
    this.scene.resume();
  }
}

export default GameScene;