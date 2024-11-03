import Phaser from 'phaser';
import { ISpriteConfig } from '../types/ISpriteConfig';

interface BottomAnimationProps {
    config: ISpriteConfig;
    initialState?: string;
    scale?: number;
    frameRate?: number;
}

class AnimationScene extends Phaser.Scene {
    private spriteConfig: ISpriteConfig;
    private currentState: string;
    private frameRate: number;
    private sprite?: Phaser.GameObjects.Sprite;
    private frameSize: number;
    private states: string[] = [];
    private direction: number = 1;
    private moveSpeed: number;
    private idleTimer: number = 0;
    private currentBehavior: 'moving' | 'idle' = 'moving';
    private targetX?: number;
    private isDragging: boolean = false;
    private dragStartTime: number = 0;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private readonly CLICK_THRESHOLD = 200; // 毫秒
    private readonly MOVE_THRESHOLD = 5; // 像素

    constructor(config: ISpriteConfig, initialState: string, frameRate: number) {
        super({ key: 'AnimationScene' });
        
        if (typeof config.frameSize !== 'number') {
            throw new Error('frameSize must be a number in sprite config');
        }
        
        this.frameSize = config.frameSize;
        this.spriteConfig = config;
        this.currentState = initialState;
        this.frameRate = frameRate;
        this.states = Object.keys(this.spriteConfig.states).filter(state => state !== 'walk');
        // 随机移动速度
        this.moveSpeed = 1 + Math.random() * 2;
    }

    private getRandomIdleState(): string {
        // 随机选择一个非walk且非drag的状态
        const availableStates = this.states.filter(state => state !== 'walk' && state !== 'drag' && state !== 'fall');
        return availableStates[Math.floor(Math.random() * availableStates.length)];
    }

    private pickNewBehavior() {
        // 随机选择行为
        this.currentBehavior = Math.random() < 0.3 ? 'idle' : 'moving';
        
        if (this.currentBehavior === 'moving') {
            // 设置随机目标位置
            const margin = this.frameSize;
            this.targetX = margin + Math.random() * (window.innerWidth - 2 * margin);
            
            // 根据目标位置设置方向
            if (this.sprite) {
                this.direction = this.targetX > this.sprite.x ? 1 : -1;
                this.updateSpriteDirection();
            }
            // 移动时使用walk状态
            this.currentState = 'walk';
        } else {
            // 待机时随机选择一个非walk的状态
            this.currentState = this.getRandomIdleState();
        }

        // 设置随机持续时间 (2-6秒)
        this.idleTimer = 2000 + Math.random() * 4000;
        
        // 播放对应动画
        this.playCurrentState();

        console.log(`New behavior: ${this.currentBehavior}, State: ${this.currentState}`);
    }

    update(time: number, delta: number) {
        if (!this.sprite || this.isDragging) return;

        // 更新计时器
        this.idleTimer -= delta;

        if (this.idleTimer <= 0) {
            this.pickNewBehavior();
            return;
        }

        if (this.currentBehavior === 'moving' && this.targetX !== undefined) {
            // 移动向目标位置
            const distanceToTarget = Math.abs(this.targetX - this.sprite.x);
            
            if (distanceToTarget > this.moveSpeed) {
                this.sprite.x += this.moveSpeed * this.direction;
            } else {
                // 到达目标位置，切换到待机状态
                this.currentBehavior = 'idle';
                this.currentState = this.getRandomIdleState();
                this.playCurrentState();
                this.idleTimer = 2000 + Math.random() * 4000;
            }
        }

        // 确保动画在播放
        if (!this.sprite.anims.isPlaying) {
            this.playCurrentState();
        }
    }

    private playCurrentState() {
        if (this.sprite) {
            const animationKey = `${this.currentState}-${this.spriteConfig.name}`;
            if (this.anims.exists(animationKey)) {
                console.log(`Playing animation: ${animationKey}`);
                this.sprite.play(animationKey);
            } else {
                console.warn(`Animation ${animationKey} not found, falling back to walk`);
                this.sprite.play(`walk-${this.spriteConfig.name}`);
            }
        }
    }

    preload() {
        const assetPath = `/media/${this.spriteConfig.imageSrc}`;
        console.log('Loading sprite from:', assetPath);

        // 加载事件监听
        this.load.on('complete', () => {
            console.log('Asset loaded successfully');
        });

        this.load.on('loaderror', (file: any) => {
            console.error('Load error:', file);
        });

        // 加载精灵表
        this.load.spritesheet(this.spriteConfig.name, assetPath, {
            frameWidth: this.frameSize,
            frameHeight: this.frameSize
        });
    }

    create() {
        if (!this.textures.exists(this.spriteConfig.name)) {
            console.error(`Texture ${this.spriteConfig.name} not found!`);
            return;
        }

        // 获取纹理并计算每行的帧数
        const texture = this.textures.get(this.spriteConfig.name);
        const framesPerRow = Math.floor(texture.source[0].width / this.frameSize);

        console.log('Creating animations with:', {
            textureWidth: texture.source[0].width,
            frameSize: this.frameSize,
            framesPerRow
        });

        // 创建动画
        Object.entries(this.spriteConfig.states).forEach(([stateName, state]) => {
            const spriteLine = state.spriteLine ?? 1;
            const frameMax = state.frameMax ?? 1;
            
            // 计算起始帧和结束帧
            const startFrame = (spriteLine - 1) * framesPerRow;
            const endFrame = startFrame + (frameMax - 1);

            const animationKey = `${stateName}-${this.spriteConfig.name}`;
            
            console.log(`Creating animation: ${animationKey}`, {
                spriteLine,
                frameMax,
                startFrame,
                endFrame,
                framesPerRow
            });

            // 创建帧数组
            const frames: Phaser.Types.Animations.AnimationFrame[] = [];
            for (let i = startFrame; i <= endFrame; i++) {
                frames.push({ key: this.spriteConfig.name, frame: i });
            }

            // 创建动画配置
            this.anims.create({
                key: animationKey,
                frames: frames,
                frameRate: this.frameRate,
                repeat: -1
            });
        });

        // 随机初始位置
        const startX = Math.random() * (window.innerWidth - this.frameSize);
        
        // 创建精灵在底部随机位置
        this.sprite = this.add.sprite(
            startX,
            this.cameras.main.height - this.frameSize / 2,
            this.spriteConfig.name
        );
        
        this.sprite.setDisplaySize(this.frameSize, this.frameSize);
        
        // 修改精灵的交互设置
        this.sprite.setInteractive({ draggable: true, useHandCursor: true });

        // 使用精灵的事件而不是场景的事件
        this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.dragStartTime = pointer.time;
            this.dragStartX = pointer.x;
            this.dragStartY = pointer.y;
            this.isDragging = false;
        });

        this.sprite.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.dragStartTime === 0) return;

            const dragDistance = Phaser.Math.Distance.Between(
                this.dragStartX,
                this.dragStartY,
                pointer.x,
                pointer.y
            );

            if (dragDistance > this.MOVE_THRESHOLD) {
                this.isDragging = true;
                this.currentState = 'drag';
                this.playCurrentState();
                
                this.sprite!.x = pointer.x;
                this.sprite!.y = pointer.y;
            }
        });

        this.sprite.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const clickDuration = pointer.time - this.dragStartTime;
            
            if (this.isDragging) {
                this.currentState = 'fall';
                this.playCurrentState();

                this.tweens.add({
                    targets: this.sprite,
                    y: this.cameras.main.height - this.frameSize / 2,
                    duration: 500,
                    ease: 'Bounce.Out',
                    onComplete: () => {
                        this.pickNewBehavior();
                    }
                });
            } else if (clickDuration < this.CLICK_THRESHOLD) {
                this.nextState();
            }

            this.isDragging = false;
            this.dragStartTime = 0;
        });

        // 设置初始状态
        this.pickNewBehavior();
    }

    private updateSpriteDirection() {
        if (this.sprite) {
            this.sprite.setFlipX(this.direction < 0);
        }
    }

    private nextState() {
        // 获取可用状态（排除 drag）
        const availableStates = this.states.filter(state => (state !== 'drag' && state !== 'fall'));
        
        // 获取当前状态的索引
        const currentIndex = availableStates.indexOf(this.currentState);
        
        // 如果当前状态不在可用状态列表中，从第一个开始
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % availableStates.length;
        
        // 更新当前状态
        this.currentState = availableStates[nextIndex];
        
        // 播放新状态的动画
        this.playCurrentState();
    }
}

class BottomAnimation {
    private game: Phaser.Game;
    private containerId: string;
    private resizeHandler: () => void;
    private sceneInstance: AnimationScene;

    constructor({ 
        config, 
        initialState = 'walk',
        scale = 1, 
        frameRate = 9, 
        container 
    }: BottomAnimationProps & { container: HTMLElement }) {
        this.containerId = container.id;
        container.style.pointerEvents = 'auto';
        
        this.sceneInstance = new AnimationScene(config, initialState, frameRate);
        this.resizeHandler = this.handleResize.bind(this);
        
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: 200,
            transparent: true,
            parent: container,
            scene: this.sceneInstance,
            scale: {
                mode: Phaser.Scale.NONE,  // Changed from RESIZE to NONE
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
            },
            input: {
                activePointers: 4
            }
        });

        // Initial resize
        this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
    }

    private handleResize() {
        const container = document.getElementById(this.containerId);
        if (container && this.game && this.game.scale) {
            const width = window.innerWidth;
            const height = 200;
            
            // Update game size
            this.game.scale.resize(width, height);
            
            // Update scene camera
            if (this.sceneInstance && this.sceneInstance.cameras) {
                this.sceneInstance.cameras.main.setViewport(0, 0, width, height);
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
}

export default BottomAnimation; 