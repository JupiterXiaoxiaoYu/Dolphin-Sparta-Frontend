import Phaser from 'phaser';
import { ISpriteConfig } from '../types/ISpriteConfig';

interface BottomAnimationProps {
    config: ISpriteConfig;
    initialState?: string;
    scale?: number;
    frameRate?: number;
}

class AnimationScene extends Phaser.Scene {
    private sprites: Map<string, {
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
    }> = new Map();

    private spritesToLoad: Array<{
        config: ISpriteConfig;
        initialState: string;
        frameRate: number;
    }> = [];

    private readonly CLICK_THRESHOLD = 200;
    private readonly MOVE_THRESHOLD = 5;

    constructor() {
        super({ key: 'AnimationScene' });
    }

    preload() {
        if (this.spritesToLoad.length === 0) return;

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
    }

    create() {
        // create 方法保持为空
    }

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

        const startX = Math.random() * (window.innerWidth - config.frameSize!);
        const sprite = this.add.sprite(
            startX,
            this.cameras.main.height - config.frameSize! / 2,
            config.name
        );
        
        sprite.setDisplaySize(config.frameSize!, config.frameSize!);
        sprite.setInteractive({ draggable: true, useHandCursor: true });

        const spriteData = {
            sprite,
            config,
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
            for (let i = startFrame; i <= endFrame; i++) {
                frames.push({ key: config.name, frame: i });
            }

            this.anims.create({
                key: animationKey,
                frames: frames,
                frameRate: 9,
                repeat: -1
            });
        });
    }

    private setupSpriteEvents(spriteData: typeof this.sprites extends Map<any, infer T> ? T : never) {
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
                    duration: 500,
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

    private pickNewBehavior(spriteData: typeof this.sprites extends Map<any, infer T> ? T : never) {
        spriteData.idleTimer = 2000 + Math.random() * 4000;
        
        if (Math.random() > 0.5) {
            spriteData.currentBehavior = 'moving';
            spriteData.currentState = 'walk';
            
            const margin = spriteData.frameSize;
            const worldWidth = this.cameras.main.width;
            spriteData.targetX = margin + Math.random() * (worldWidth - 2 * margin);
            spriteData.direction = spriteData.targetX > spriteData.sprite.x ? 1 : -1;
            spriteData.sprite.setFlipX(spriteData.direction < 0);
        } else {
            spriteData.currentBehavior = 'idle';
            spriteData.currentState = this.getRandomIdleState();
        }
        
        this.playCurrentState(spriteData);
    }

    private playCurrentState(spriteData: typeof this.sprites extends Map<any, infer T> ? T : never) {
        const animationKey = `${spriteData.currentState}-${spriteData.config.name}`;
        if (this.anims.exists(animationKey)) {
            spriteData.sprite.play(animationKey);
        }
    }

    private nextState(spriteData: typeof this.sprites extends Map<any, infer T> ? T : never) {
        const states = Object.keys(spriteData.config.states).filter(state => state !== 'walk');
        const currentIndex = states.indexOf(spriteData.currentState);
        const nextIndex = (currentIndex + 1) % states.length;
        spriteData.currentState = states[nextIndex];
        this.playCurrentState(spriteData);
    }

    private getRandomIdleState() {
        const idleStates = ['stand', 'sit', 'greet'];
        return idleStates[Math.floor(Math.random() * idleStates.length)];
    }

    update(time: number, delta: number) {
        this.sprites.forEach(spriteData => {
            if (spriteData.isDragging) return;

            spriteData.idleTimer -= delta;

            if (spriteData.idleTimer <= 0) {
                this.pickNewBehavior(spriteData);
                return;
            }

            if (spriteData.currentBehavior === 'moving' && spriteData.targetX !== undefined) {
                const distanceToTarget = Math.abs(spriteData.targetX - spriteData.sprite.x);
                
                if (distanceToTarget > spriteData.moveSpeed) {
                    spriteData.sprite.x += spriteData.moveSpeed * spriteData.direction;
                } else {
                    spriteData.currentBehavior = 'idle';
                    spriteData.currentState = this.getRandomIdleState();
                    this.playCurrentState(spriteData);
                    spriteData.idleTimer = 2000 + Math.random() * 4000;
                }
            }
        });
    }

    removeSprite(name: string) {
        const spriteData = this.sprites.get(name);
        if (spriteData) {
            spriteData.sprite.destroy();
            this.sprites.delete(name);
        }
    }
}

class BottomAnimation {
    private game: Phaser.Game;
    private scene: AnimationScene | null = null;
    private containerId: string;
    private resizeHandler: () => void;
    private pendingSprites: Array<{
        config: ISpriteConfig;
        initialState: string;
        frameRate: number;
    }> = [];

    constructor({ container }: { container: HTMLElement }) {
        this.containerId = container.id;
        container.style.pointerEvents = 'auto';
        
        const scene = new AnimationScene();
        
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: 200,
            transparent: true,
            parent: container,
            scene: scene,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
            },
            input: {
                activePointers: 4
            },
            render: {
                pixelArt: true
            }
        });

        // 等待场景创建完成
        this.game.events.once('ready', () => {
            console.log('Game ready, initializing scene');
            this.scene = scene;
            this.handleResize();
            
            // 处理待处理的精灵
            if (this.pendingSprites.length > 0) {
                console.log('Processing pending sprites:', this.pendingSprites.length);
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
            const height = 200;
            
            // Update game size
            this.game.scale.resize(width, height);
            
            // Update scene camera
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

    removeSprite(name: string) {
        if (this.scene) {
            this.scene.removeSprite(name);
        }
    }
}

export default BottomAnimation; 