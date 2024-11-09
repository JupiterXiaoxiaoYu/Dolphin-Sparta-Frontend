import Phaser from 'phaser';
import { ISpriteConfig } from '../types/ISpriteConfig';
import { useGameStore } from '../store/gameStore';

interface BottomAnimationProps {
    config: ISpriteConfig;
    initialState?: string;
    scale?: number;
    frameRate?: number;
}

// Add this type definition near the top of the file, after the imports
type SpriteData = {
    sprite: Phaser.GameObjects.Sprite;
    config: ISpriteConfig;
    currentState: string;
    frameSize: number;
    isDragging: boolean;
    dragStartTime: number;
    dragStartX: number;
    dragStartY: number;
    direction: number;
    currentBehavior: 'moving' | 'idle';
    targetX?: number;
    idleTimer: number;
    moveSpeed: number;
    collisionCount?: number;
    level?: number;
    healthBar?: Phaser.GameObjects.Rectangle;
    healthBarBg?: Phaser.GameObjects.Rectangle;
    glowEffect?: Phaser.GameObjects.Graphics;
};

class AnimationScene extends Phaser.Scene {
    private sprites: Map<string, SpriteData> = new Map();
    public onEvilWhaleRemoved?: () => void;

    private spritesToLoad: Array<{
        config: ISpriteConfig;
        initialState: string;
        frameRate: number;
    }> = [];

    private readonly CLICK_THRESHOLD = 200;
    private readonly MOVE_THRESHOLD = 5;

    private lastCollisionTime: Map<string, number> = new Map();
    private readonly COLLISION_COOLDOWN = 2000; // 碰撞冷却时间（毫秒）
    private readonly COLLISION_CHANCE = 0.3; // 碰撞概率 30%
    private readonly BOUNCE_SPEED = 3; // 弹开速度

    // private collisionSound!: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: 'AnimationScene' });
    }

    preload() {
        if (this.spritesToLoad.length === 0) return;

        // Load the hurt sound
        this.load.audio('hurt', '/sounds/hurt.mp3');
        this.load.audio('victory', '/sounds/victory.mp3');

        // 只添加一次加载事件监听
        if (!this.load.listenerCount('complete')) {
            this.load.on('complete', () => {

                console.log('Assets loaded successfully');
                this.createSpritesAndAnimations();
            });

            this.load.on('loaderror', (file: any) => {
                console.error('Error loading file:', file.key, file.src);
            });
        }

        // 只加载尚未加载的精灵
        this.spritesToLoad.forEach(({ config }) => {
            if (!this.textures.exists(config.name)) {
                const assetPath = `/media/${config.imageSrc}`;
                console.log('Loading sprite:', config.name, 'from:', assetPath);
                
                this.load.spritesheet(config.name, assetPath, {
                    frameWidth: config.frameSize!,
                    frameHeight: config.frameSize!
                });
            }
        });

        // 只有在有新资源需要加载时才启动加载器
        if (this.load.list.size > 0) {
            this.load.start();
        } else {
            // 如果没有新资源需要加载，直接创建精灵
            this.createSpritesAndAnimations();
        }

        // this.load.audio('collision', '/sounds/collision.mp3');
    }

    // create() {
    //     this.collisionSound = this.sound.add('collision');
    // }

    private createSpritesAndAnimations() {
        this.spritesToLoad.forEach(({ config, initialState }) => {
            if (!this.sprites.has(config.name) && this.textures.exists(config.name)) {
                console.log('Creating sprite:', config.name);
                this.createAnimations(config);
                this.createSprite(config, initialState);
            }
        });
        this.spritesToLoad = [];
    }

    addSprite(config: ISpriteConfig, initialState: string = 'walk', frameRate: number = 9) {
        if (!this.sprites.has(config.name)) {
            this.spritesToLoad.push({ config, initialState, frameRate });
            this.preload();
        }
    }

    private createSprite(config: ISpriteConfig, initialState: string) {
        if (!this.textures.exists(config.name)) {
            console.error(`Texture ${config.name} not found!`);
            return;
        }

        const scale = config.name.includes('Evil-Whale') ? 4 : 1;
        const effectiveSize = config.frameSize! * scale;
        
        const startX = Math.random() * (window.innerWidth - effectiveSize);
        const sprite = this.add.sprite(
            startX,
            window.innerHeight - (effectiveSize * 0.5),
            config.name
        );
        
        let spriteData: SpriteData;
        
        // 如果是Evil Whale，设置较低的深度值和血条
        if (config.name.includes('Evil-Whale')) {
            sprite.setScale(scale);
            sprite.setDepth(2000);
            
            // 创建血条背景
            const healthBarBg = this.add.rectangle(
                sprite.x,
                sprite.y - effectiveSize * 0.6,
                effectiveSize * 0.8,
                10,
                0x000000,
                0.5
            );
            healthBarBg.setDepth(2000);
            
            // 创建血条
            const healthBar = this.add.rectangle(
                sprite.x,
                sprite.y - effectiveSize * 0.6,
                effectiveSize * 0.8,
                10,
                0xff0000,
                1
            );
            healthBar.setDepth(2000);
            
            spriteData = {
                sprite,
                config,
                currentState: "drop",
                frameSize: config.frameSize!,
                isDragging: false,
                dragStartTime: 0,
                dragStartX: 0,
                dragStartY: 0,
                direction: 1,
                currentBehavior: 'moving' as const,
                targetX: undefined,
                idleTimer: 2000 + Math.random() * 4000,
                moveSpeed: 1 + Math.random() * 2,
                healthBar,
                healthBarBg
            };
            setTimeout(() => {
                if (this.sprites.has(config.name)) {
                    const states = ['attack', 'emerge', 'walk'];
                    spriteData.currentState = states[Math.floor(Math.random() * states.length)];
                    this.playCurrentState(spriteData);
                    this.pickNewBehavior(spriteData);
                }
            }, 2000);


        } else {
            // 海豚设置更高的深度值
            sprite.setDepth(1000);
            const dolphinLevel = useGameStore.getState().dolphins.find(d => d.id === config.id)?.level 
           // Adjust the scale for dolphins
            const scale = 1.3; // Increase the scale factor slightly
            sprite.setScale(scale);
            spriteData = {
                sprite,
                config,
                level: dolphinLevel,
                currentState: initialState,
                frameSize: config.frameSize!,
                isDragging: false,
                dragStartTime: 0,
                dragStartX: 0,
                dragStartY: 0,
                direction: 1,
                currentBehavior: 'moving' as const,
                targetX: undefined,
                idleTimer: 2000 + Math.random() * 4000,
                moveSpeed: 1 + Math.random() * 2
            };
            if (dolphinLevel) {
                spriteData.glowEffect = this.createGlowEffect(spriteData, dolphinLevel);
            }
        }

        sprite.setInteractive({ 
            draggable: true,
            useHandCursor: true,
            pixelPerfect: true
        });

        const canvas = this.game.canvas;
        
        // 添加精灵事件监听器
        sprite.on('pointerover', () => {
            if (canvas) canvas.style.pointerEvents = 'auto';
        });

        sprite.on('pointerout', () => {
            if (canvas) canvas.style.pointerEvents = 'none';
        });

        sprite.on('dragstart', () => {
            if (canvas) canvas.style.pointerEvents = 'auto';
        });

        sprite.on('dragend', () => {
            if (canvas) canvas.style.pointerEvents = 'none';
        });

        // 确保精灵在最上层
        sprite.setDepth(1000);

        this.setupSpriteEvents(spriteData);
        this.sprites.set(config.name, spriteData);
        this.pickNewBehavior(spriteData);
    }

    private createAnimations(config: ISpriteConfig) {
        const texture = this.textures.get(config.name);
        const framesPerRow = Math.floor(texture.source[0].width / config.frameSize!);

        Object.entries(config.states).forEach(([stateName, state]) => {
            const animationKey = `${stateName}-${config.name}`;
            
            // 如果动画已存在，跳过创建
            if (this.anims.exists(animationKey)) return;

            const spriteLine = state.spriteLine ?? 1;
            const frameMax = state.frameMax ?? 1;
            const startFrame = (spriteLine - 1) * framesPerRow;
            const endFrame = startFrame + (frameMax - 1);

            const frames: Phaser.Types.Animations.AnimationFrame[] = [];
            
            // 如果是Evil Whale，反转帧序列
            if (config.name.includes('Evil-Whale')) {
                for (let i = endFrame; i >= startFrame; i--) {
                    frames.push({ key: config.name, frame: i });
                }
            } else {
                for (let i = startFrame; i <= endFrame; i++) {
                    frames.push({ key: config.name, frame: i });
                }
            }

            this.anims.create({
                key: animationKey,
                frames: frames,
                frameRate: stateName === 'fall' ? 3 : 9,
                repeat: stateName === 'fall'? 1: -1
            });
        });
    }

    private setupSpriteEvents(spriteData: SpriteData) {
        const { sprite } = spriteData;

        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            spriteData.dragStartTime = pointer.time;
            spriteData.dragStartX = pointer.x;
            spriteData.dragStartY = pointer.y;
            spriteData.isDragging = false;
        });

        sprite.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (spriteData.dragStartTime === 0) return;

            const dragDistance = Phaser.Math.Distance.Between(
                spriteData.dragStartX,
                spriteData.dragStartY,
                pointer.x,
                pointer.y
            );

            if (dragDistance > this.MOVE_THRESHOLD) {
                spriteData.isDragging = true;
                spriteData.currentState = 'drag';
                this.playCurrentState(spriteData);
                
                sprite.x = pointer.x;
                sprite.y = pointer.y;
            }
        });

        sprite.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const clickDuration = pointer.time - spriteData.dragStartTime;
            
            if (spriteData.isDragging) {
                spriteData.currentState = 'fall';
                this.playCurrentState(spriteData);

                this.tweens.add({
                    targets: sprite,
                    y: this.cameras.main.height - spriteData.frameSize / 2,
                    duration: 2000,
                    ease: 'Bounce.Out',
                    onComplete: () => {
                        this.pickNewBehavior(spriteData);
                    }
                });
            } else if (clickDuration < this.CLICK_THRESHOLD) {
                this.nextState(spriteData);
            }

            spriteData.isDragging = false;
            spriteData.dragStartTime = 0;
        });
    }

    private pickNewBehavior(spriteData: SpriteData) {
        spriteData.idleTimer = 2000 + Math.random() * 4000;
        
        if (spriteData.config.name.includes('Evil-Whale')) {
            // Evil Whale的随机状
            const states = ['emerge', 'walk', 'attack'];
            spriteData.currentState = states[Math.floor(Math.random() * states.length)];
            
            if (spriteData.currentState === 'walk') {
                spriteData.currentBehavior = 'moving';
                const margin = spriteData.frameSize;
                const worldWidth = this.cameras.main.width;
                spriteData.targetX = margin + Math.random() * (worldWidth - 2 * margin);
                spriteData.direction = spriteData.targetX > spriteData.sprite.x ? 1 : -1;
                spriteData.sprite.setFlipX(spriteData.direction < 0);
            } else {
                spriteData.currentBehavior = 'idle';
            }
        } else {
            // 普通海豚的行为
            if (Math.random() > 0.5) {
                spriteData.currentBehavior = 'moving';
                spriteData.currentState = 'walk';
                
                const margin = spriteData.frameSize;
                const worldWidth = this.cameras.main.width;
                spriteData.targetX = margin + Math.random() * (worldWidth - 2 * margin);
                spriteData.direction = spriteData.targetX > spriteData.sprite.x ? 1 : -1;
                spriteData.sprite.setFlipX(spriteData.direction < 0);
                spriteData.moveSpeed = 1 + Math.random() * 2;
            } else {
                spriteData.currentBehavior = 'idle';
                spriteData.currentState = this.getRandomIdleState();
            }
        }
        
        this.playCurrentState(spriteData);
    }

    private playCurrentState(spriteData: SpriteData) {
        // Add safety check
        if (!spriteData.sprite || !spriteData.sprite.scene) {
            return;
        }

        if(spriteData.currentState === 'fall'){
            //延迟播放
            setTimeout(() => {
                this.sound.play('hurt');
            }, 1000);
        }

        const animationKey = `${spriteData.currentState}-${spriteData.config.name}`;
        if (this.anims.exists(animationKey)) {
            spriteData.sprite.play(animationKey);
        }
    }

    private nextState(spriteData: SpriteData) {
        const states = Object.keys(spriteData.config.states).filter(state => state !== 'walk' && state !== 'drag' && state !== 'fall' && state!=="jump");
        const currentIndex = states.indexOf(spriteData.currentState);
        const nextIndex = (currentIndex + 1) % states.length;
        spriteData.currentState = states[nextIndex];
        this.playCurrentState(spriteData);
    }

    private getRandomIdleState() {
        const idleStates = ['stand', 'happy', 'greet', 'eat',"music","victory"];
        return idleStates[Math.floor(Math.random() * idleStates.length)];
    }

    private checkCollisions() {
        const sprites = Array.from(this.sprites.values());
        const evilWhale = sprites.find(sprite => sprite.config.name.includes('Evil-Whale'));
        
        for (let i = 0; i < sprites.length; i++) {
            for (let j = i + 1; j < sprites.length; j++) {
                const spriteA = sprites[i];
                const spriteB = sprites[j];
                
                // 如果场景中有Evil Whale，只检测与Evil Whale的碰撞
                if (evilWhale) {
                    if (!spriteA.config.name.includes('Evil-Whale') && 
                        !spriteB.config.name.includes('Evil-Whale')) {
                        continue;
                    }
                }
                
                // 检查是否在冷却中
                const collisionKey = `${spriteA.config.name}-${spriteB.config.name}`;
                const lastCollision = this.lastCollisionTime.get(collisionKey) || 0;
                const now = Date.now();
                
                if (now - lastCollision < this.COLLISION_COOLDOWN) {
                    continue;
                }

                // 检查是否发生碰撞
                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    spriteA.sprite.getBounds(),
                    spriteB.sprite.getBounds()
                )) {
                    // 根据是否有Evil Whale决定碰撞率
                    const collisionChance = evilWhale ? 0.8 : this.COLLISION_CHANCE;
                    if (Math.random() < collisionChance) {
                        this.handleCollision(spriteA, spriteB);
                        this.lastCollisionTime.set(collisionKey, now);
                    }
                }
            }
        }
    }

    private handleCollision(spriteDataA: SpriteData, spriteDataB: SpriteData) {
        // 获Evil Whale的spriteData
        const evilWhaleData = spriteDataA.config.name.includes('Evil-Whale') ? spriteDataA : 
                             spriteDataB.config.name.includes('Evil-Whale') ? spriteDataB : null;
        
        // 如果是海豚之间的碰撞
        if (!evilWhaleData) {
            // 简单的水平后退
            const dx = spriteDataB.sprite.x - spriteDataA.sprite.x;
            const direction = dx > 0 ? -1 : 1;
            
            // 应用简单的水平移动
            this.tweens.add({
                targets: spriteDataA.sprite,
                x: spriteDataA.sprite.x + direction * 50,
                duration: 300,
                ease: 'Cubic.Out'
            });
            
            this.tweens.add({
                targets: spriteDataB.sprite,
                x: spriteDataB.sprite.x - direction * 50,
                duration: 300,
                ease: 'Cubic.Out'
            });
            
            return;
        }

        // Evil Whale相关的碰撞处理
        evilWhaleData.collisionCount = (evilWhaleData.collisionCount || 0) + 1;
        
        if (evilWhaleData.collisionCount % 5 === 0) {
            evilWhaleData.currentState = 'cry';
            this.playCurrentState(evilWhaleData);
            evilWhaleData.currentState = 'attack';
            this.playCurrentState(evilWhaleData);
            
            setTimeout(() => {
                if (this.sprites.has(evilWhaleData.config.name)) {
                    const states = ['attack', 'emerge', 'walk'];
                    evilWhaleData.currentState = states[Math.floor(Math.random() * states.length)];
                    this.playCurrentState(evilWhaleData);
                }
            }, 2000);
        }
        
        if (evilWhaleData.collisionCount >= 50) {
            evilWhaleData.currentState = 'cry';
            this.playCurrentState(evilWhaleData);
            setTimeout(() => {
                this.removeSprite(evilWhaleData.config.name);
            }, 2000); 
            return;
        }

        // Evil Whale碰撞的弹飞效果
        const dx = spriteDataB.sprite.x - spriteDataA.sprite.x;
        const dy = spriteDataB.sprite.y - spriteDataA.sprite.y;
        const angle = Math.atan2(dy, dx);

        const isEvilWhaleA = spriteDataA.config.name.includes('Evil-Whale');
        const isEvilWhaleB = spriteDataB.config.name.includes('Evil-Whale');

        const bounceSpeedA = isEvilWhaleA ? this.BOUNCE_SPEED * 0.5 : this.BOUNCE_SPEED * 5;
        const bounceSpeedB = isEvilWhaleB ? this.BOUNCE_SPEED * 0.5 : this.BOUNCE_SPEED * 5;

        const randomDirection = Math.random() > 0.5 ? 1 : -1;

        const velocityA = {
            x: isEvilWhaleA 
                ? -Math.cos(angle) * bounceSpeedA 
                : randomDirection * bounceSpeedA * 2,
            y: isEvilWhaleA ? -Math.sin(angle) * bounceSpeedA * 0.3 : -8
        };

        const velocityB = {
            x: isEvilWhaleB 
                ? Math.cos(angle) * bounceSpeedB 
                : -randomDirection * bounceSpeedB * 2,
            y: isEvilWhaleB ? Math.sin(angle) * bounceSpeedB * 0.3 : -8
        };

        this.applyBounce(spriteDataA, velocityA);
        this.applyBounce(spriteDataB, velocityB);
    }

    private applyBounce(spriteData: SpriteData, velocity: { x: number, y: number }) {
        // If it's a dolphin, set to drop state
        if (!spriteData.config.name.includes('Evil-Whale')) {
            spriteData.currentState = 'drop';
        }
        this.playCurrentState(spriteData);


        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const scale = spriteData.config.name.includes('Evil-Whale') ? 4 : 1;
        const effectiveSize = spriteData.frameSize * scale;
        
        // 减小移动距离倍数
        const distanceMultiplier = spriteData.config.name.includes('Evil-Whale') ? 20 : 30; // 从60改为30
        
        const targetX = spriteData.sprite.x + velocity.x * distanceMultiplier;
        const targetY = spriteData.config.name.includes('Evil-Whale')
            ? spriteData.sprite.y + velocity.y * distanceMultiplier
            : spriteData.sprite.y + velocity.y * 100; // 从200改为100，减小垂直距离

        const groundY = spriteData.config.name.includes('Evil-Whale')
            ? windowHeight - (effectiveSize * 0.5)
            : windowHeight - spriteData.frameSize / 2;

        const clampedX = Phaser.Math.Clamp(
            targetX,
            effectiveSize / 2,
            windowWidth - effectiveSize / 2
        );
        const clampedY = Phaser.Math.Clamp(
            targetY,
            spriteData.config.name.includes('Evil-Whale') 
                ? windowHeight - effectiveSize 
                : windowHeight * 0.3, // 从0.1改为0.3，减小最大高度
            groundY
        );

        // 增加弹开动画时间
        this.tweens.add({
            targets: spriteData.sprite,
            x: clampedX,
            y: clampedY,
            duration: spriteData.config.name.includes('Evil-Whale') ? 800 : 1000, // 从600改为1000
            ease: 'Cubic.Out',
            onComplete: () => {
                if (!spriteData.config.name.includes('Evil-Whale')) {
                    // 海豚落地前先设置为fall状态
                    spriteData.currentState = 'fall';
                    this.playCurrentState(spriteData);
                }
                
                this.tweens.add({
                    targets: spriteData.sprite,
                    y: groundY,
                    duration: spriteData.config.name.includes('Evil-Whale') ? 0 : 800, // 从400改为800
                    ease: 'Bounce.Out',
                    onComplete: () => {
                        if (!spriteData.config.name.includes('Evil-Whale')) {
                            // 落地后设置为walk状态继续追逐巨鲸
                            spriteData.currentState = 'walk';
                            spriteData.currentBehavior = 'moving';
                            this.playCurrentState(spriteData);
                        }
                        this.pickNewBehavior(spriteData);
                    }
                });
            }
        });
    }

    update(time: number, delta: number) {
        const sprites = Array.from(this.sprites.values());
        const evilWhale = sprites.find(sprite => sprite.config.name.includes('Evil-Whale'));

        this.sprites.forEach(spriteData => {
            if (spriteData.isDragging) return;

            // Evil Whale的移动逻辑
            if (spriteData.config.name.includes('Evil-Whale')) {
                if (spriteData.currentState === 'walk' && spriteData.currentBehavior === 'moving' && spriteData.targetX !== undefined) {
                    const distanceToTarget = Math.abs(spriteData.targetX - spriteData.sprite.x);
                    if (distanceToTarget > spriteData.moveSpeed) {
                        spriteData.sprite.x += spriteData.moveSpeed * spriteData.direction;
                    } else {
                        this.pickNewBehavior(spriteData);
                    }
                }
                return;
            }

            // 如果有Evil Whale，其他海追逐Evil Whale
            if (evilWhale) {
                spriteData.currentBehavior = 'moving';
                spriteData.currentState = 'walk';
                spriteData.targetX = evilWhale.sprite.x;
                spriteData.direction = evilWhale.sprite.x > spriteData.sprite.x ? 1 : -1;
                spriteData.sprite.setFlipX(spriteData.direction < 0);
                
                spriteData.moveSpeed = 3 + Math.random() * 2;
                
                if (spriteData.targetX !== undefined) {
                    const distanceToTarget = Math.abs(spriteData.targetX - spriteData.sprite.x);
                    if (distanceToTarget > spriteData.moveSpeed) {
                        spriteData.sprite.x += spriteData.moveSpeed * spriteData.direction;
                    }
                }
            } else {
                // Evil Whale消失后的正常行为
                if (spriteData.currentBehavior === 'moving' && spriteData.targetX !== undefined) {
                    const distanceToTarget = Math.abs(spriteData.targetX - spriteData.sprite.x);
                    if (distanceToTarget > spriteData.moveSpeed) {
                        spriteData.sprite.x += spriteData.moveSpeed * spriteData.direction;
                    } else {
                        this.pickNewBehavior(spriteData);
                    }
                }

                spriteData.idleTimer -= delta;
                if (spriteData.idleTimer <= 0) {
                    this.pickNewBehavior(spriteData);
                }
            }
        });

        this.checkCollisions();

        this.sprites.forEach(spriteData => {
            if (spriteData.config.name.includes('Evil-Whale')) {
                // 更新血条位置
                if (spriteData.healthBar && spriteData.healthBarBg) {
                    const healthPercent = 1 - ((spriteData.collisionCount || 0) / 50);
                    spriteData.healthBar.setPosition(
                        spriteData.sprite.x,
                        spriteData.sprite.y - spriteData.frameSize * 2.4
                    );
                    spriteData.healthBar.setScale(healthPercent, 1);
                    
                    spriteData.healthBarBg.setPosition(
                        spriteData.sprite.x,
                        spriteData.sprite.y - spriteData.frameSize * 2.4
                    );
                }
            }
        });

        this.sprites.forEach(spriteData => {
            // Update glow effect position if it exists
            if (spriteData.glowEffect) {
                spriteData.glowEffect.clear();
                const radius = spriteData.frameSize * 0.6;
                
                // 重新绘制多层光晕
                spriteData.glowEffect.lineStyle(3, spriteData.glowEffect.defaultStrokeColor, 0.2);
                spriteData.glowEffect.strokeCircle(spriteData.sprite.x, spriteData.sprite.y, radius);
                
                spriteData.glowEffect.lineStyle(4, spriteData.glowEffect.defaultStrokeColor, 0.3);
                spriteData.glowEffect.strokeCircle(spriteData.sprite.x, spriteData.sprite.y, radius * 0.85);
                
                spriteData.glowEffect.lineStyle(5, spriteData.glowEffect.defaultStrokeColor, 0.4);
                spriteData.glowEffect.strokeCircle(spriteData.sprite.x, spriteData.sprite.y, radius * 0.7);
            }
        });
    }

    public removeSprite(name: string) {
        const spriteData = this.sprites.get(name);
        if (spriteData) {
            if (spriteData.glowEffect) {
                spriteData.glowEffect.destroy();
            }
            // 移除血条
            if (spriteData.healthBar) {
                spriteData.healthBar.destroy();
            }
            if (spriteData.healthBarBg) {
                spriteData.healthBarBg.destroy();
            }
            
            spriteData.sprite.destroy();
            this.sprites.delete(name);

            // 如果移除的是Evil Whale，重置所有海豚的行为
            if (name.includes('Evil-Whale')) {
                if (this.onEvilWhaleRemoved) {
                    this.onEvilWhaleRemoved();
                    // 添加海豚币奖励
                    useGameStore.getState().addDolphinCoins(50);
                }
                this.sprites.forEach(otherSprite => {
                    if (!otherSprite.config.name.includes('Evil-Whale')) {
                        // 确保豚回到地面位置
                        const groundY = window.innerHeight - otherSprite.frameSize / 2;
                        
                        // 先停止所有正在进行的动画
                        this.tweens.killTweensOf(otherSprite.sprite);

                        // 播放落地音效
                        this.sound.play('victory');

                        // 添加落地动画
                        this.tweens.add({
                            targets: otherSprite.sprite,
                            y: groundY,
                            duration: 400,
                            ease: 'Bounce.Out',
                            onComplete: () => {
                                // 重置为随机位置和状态
                                const margin = otherSprite.frameSize;
                                const worldWidth = this.cameras.main.width;
                                otherSprite.targetX = margin + Math.random() * (worldWidth - 2 * margin);
                                otherSprite.direction = otherSprite.targetX > otherSprite.sprite.x ? 1 : -1;
                                otherSprite.sprite.setFlipX(otherSprite.direction < 0);
                                otherSprite.moveSpeed = 1 + Math.random() * 2;
                                otherSprite.currentState = 'jump'; // Switch to jump state
                                otherSprite.currentBehavior = 'idle'; // Stop current behavior
                                otherSprite.idleTimer = 2000 + Math.random() * 4000;
                                this.playCurrentState(otherSprite);
                            }
                        });
                    }
                });
            }
        }
    }

    private createGlowEffect(spriteData: SpriteData, level: number) {
        const glow = this.add.graphics();
        
        // Set glow color based on level with higher intensity
        let color;
        switch (level) {
            case 1:
                color = 0xFFFFFF; // Bright White
                break;
            case 2:
                color = 0x00FF44; // Bright Green
                break;
            case 3:
                color = 0x4488FF; // Bright Blue
                break;
            case 4:
                color = 0xFF4444; // Bright Red
                break;
            case 5:
                color = 0xFFAA00; // Bright Orange
                break;
            default:
                color = 0xFFFFFF;
        }
        
        // Store the color for later use
        (glow as any).defaultStrokeColor = color;
        
        // Draw multiple circles with higher alpha values
        const radius = spriteData.frameSize * 0.6; // 增大基础半径
        
        // 从外到内画多层渐变光晕，使用更高的透明度
        glow.lineStyle(3, color, 0.2);  // 更粗的线条
        glow.strokeCircle(spriteData.sprite.x, spriteData.sprite.y, radius);
        
        glow.lineStyle(4, color, 0.3);
        glow.strokeCircle(spriteData.sprite.x, spriteData.sprite.y, radius * 0.85);
        
        glow.lineStyle(5, color, 0.4);  // 最内层更明显
        glow.strokeCircle(spriteData.sprite.x, spriteData.sprite.y, radius * 0.7);
        
        // Set the glow properties
        glow.setDepth(spriteData.sprite.depth - 1);
        
        // Add a more pronounced pulsing animation
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.9, to: 0.5 },  // 更大的透明度范围
            duration: 1200,  // 稍快的脉冲速度
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return glow;
    }
}

export class BottomAnimation {
    private game: Phaser.Game;
    private scene?: AnimationScene;
    private containerId: string;
    private pendingSprites: Array<{
        config: ISpriteConfig;
        initialState: string;
        frameRate: number;
    }> = [];
    private onEvilWhaleRemoved?: () => void;
    private resizeHandler: () => void;

    constructor({ container, onEvilWhaleRemoved }: { 
        container: HTMLElement; 
        onEvilWhaleRemoved?: () => void 
    }) {
        this.containerId = container.id;
        this.onEvilWhaleRemoved = onEvilWhaleRemoved;
        
        const scene = new AnimationScene();
        scene.onEvilWhaleRemoved = onEvilWhaleRemoved;
        
        const gameContainer = container.querySelector('#game-container') as HTMLElement;
        if (!gameContainer) {
            throw new Error('Game container not found');
        }
        
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: true,
            parent: gameContainer,
            scene: scene,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
            },
            input: {
                activePointers: 4,
                mouse: {
                    preventDefaultDown: false,
                    preventDefaultUp: false,
                    preventDefaultMove: false,
                    preventDefaultWheel: false
                }
            },
            dom: {
                createContainer: true
            },
            render: {
                pixelArt: true
            }
        });

        this.game.events.once('ready', () => {
            console.log('Game ready, initializing scene');
            this.scene = scene;
            
            if (this.scene) {
                // 配置场景级别输入
                this.scene.input.setTopOnly(true);
                this.scene.input.setGlobalTopOnly(true);
            }
            
            this.handleResize();
            
            if (this.pendingSprites.length > 0) {
                this.pendingSprites.forEach(({ config, initialState, frameRate }) => {
                    this.scene!.addSprite(config, initialState, frameRate);
                });
                this.pendingSprites = [];
            }
        });

        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
    }

    addSprite(config: ISpriteConfig, initialState: string = 'walk', frameRate: number = 9) {
        console.log('BottomAnimation addSprite called:', config.name);
        if (this.scene) {
            console.log('Scene ready, adding sprite directly');
            this.scene.addSprite(config, initialState, frameRate);
        } else {
            console.log('Scene not ready, queueing sprite');
            this.pendingSprites.push({ config, initialState, frameRate });
        }
    }

    private handleResize() {
        const container = document.getElementById(this.containerId);
        if (container && this.game && this.game.scale) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.game.scale.resize(width, height);
            
            if (this.scene && this.scene.cameras) {
                this.scene.cameras.main.setViewport(0, 0, width, height);
            }
        }
    }

    destroy() {
        // Remove the event listener using the stored handler
        window.removeEventListener('resize', this.resizeHandler);
        if (this.game) {
            this.game.destroy(true);
        }
    }

    public removeSprite(name: string) {
        if (name.includes('Evil-Whale') && this.onEvilWhaleRemoved) {
            this.onEvilWhaleRemoved();
        }
        if (this.scene) {
            this.scene.removeSprite(name);
        }
    }
} 