import { ISpriteConfig } from '../types/ISpriteConfig';
import Phaser from 'phaser';

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
        // 随机选择一个非walk的状态
        return this.states[Math.floor(Math.random() * this.states.length)];
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
        if (!this.sprite) return;

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
        this.sprite.setInteractive();

        // 添加点击事件
        this.sprite.on('pointerdown', () => {
            this.nextState();
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
        // 获取当前状态的索引
        const currentIndex = this.states.indexOf(this.currentState);
        // 计算下一个状态的索引（循环）
        const nextIndex = (currentIndex + 1) % this.states.length;
        // 更新当前状态
        this.currentState = this.states[nextIndex];
        // 播放新状态的动画
        this.playCurrentState();
    }
}

class BottomAnimation {
    private game: Phaser.Game;

    constructor({ 
        config, 
        initialState = 'walk',
        scale = 1, 
        frameRate = 9, 
        container 
    }: BottomAnimationProps & { container: HTMLElement }) {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: 200,
            transparent: true,
            parent: container,
            scene: new AnimationScene(config, initialState, frameRate),
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
            }
        });

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private handleResize() {
        this.game.scale.resize(window.innerWidth, 200);
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize.bind(this));
        if (this.game) {
            this.game.destroy(true);
        }
    }
}

export default BottomAnimation; 