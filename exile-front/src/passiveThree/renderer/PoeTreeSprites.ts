import type { TreeNode } from "../types";
import type { Camera } from "./Camera";

interface SpriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SpriteFrame {
  frame: SpriteRect;
}

interface SpriteManifest {
  frames: Record<string, SpriteFrame>;
}

interface LoadedAtlas {
  image: HTMLImageElement;
  frames: Record<string, SpriteFrame>;
}

const ASSET_BASE_URL = `${import.meta.env.BASE_URL}poe2-tree/assets/`;

export class PoeTreeSprites {
  private static loadPromise: Promise<PoeTreeSprites> | null = null;

  private readonly activeSkills: LoadedAtlas;
  private readonly inactiveSkills: LoadedAtlas;
  private readonly frames: LoadedAtlas;
  private readonly bgImage: HTMLImageElement;
  private bgPattern: CanvasPattern | null = null;
  constructor(
    active: LoadedAtlas,
    inactive: LoadedAtlas,
    frames: LoadedAtlas,
    bgImage: HTMLImageElement,
  ) {
    this.activeSkills = active;
    this.inactiveSkills = inactive;
    this.frames = frames;
    this.bgImage = bgImage;
  }

  static load(): Promise<PoeTreeSprites> {
    if (PoeTreeSprites.loadPromise) {
      return PoeTreeSprites.loadPromise;
    }

    PoeTreeSprites.loadPromise = createSprites().catch((error) => {
      PoeTreeSprites.loadPromise = null;
      throw error;
    });

    return PoeTreeSprites.loadPromise;
  }

  drawNodeFrame(
    ctx: CanvasRenderingContext2D,
    node: TreeNode,
    x: number,
    y: number,
    radius: number,
    allocated: boolean,
  ): boolean {
    const frameName = getFrameName(node, allocated);

    if (!frameName) {
      return false;
    }

    const sprite = this.frames.frames[`frame:${frameName}`]?.frame;

    if (!sprite) {
      return false;
    }

    const targetSize = radius * 2;

    drawSprite(ctx, this.frames.image, sprite, x, y, targetSize);

    return true;
  }

  drawBackground(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    width: number,
    height: number,
  ): void {
    if (!this.bgImage || this.bgImage.width === 0) return;

    if (!this.bgPattern) {
      this.bgPattern = ctx.createPattern(this.bgImage, "repeat");
    }
    if (!this.bgPattern) return;

    const parallaxFactor = 0.4;
    const bgX = (camera.x * parallaxFactor) % this.bgImage.width;
    const bgY = (camera.y * parallaxFactor) % this.bgImage.height;

    ctx.save();
    ctx.translate(bgX, bgY);
    ctx.fillStyle = this.bgPattern;

    ctx.fillRect(
      -bgX - this.bgImage.width,
      -bgY - this.bgImage.height,
      width + this.bgImage.width * 2,
      height + this.bgImage.height * 2,
    );
    ctx.restore();
  }

  drawNodeIcon(
    ctx: CanvasRenderingContext2D,
    node: TreeNode,
    x: number,
    y: number,
    radius: number,
    allocated: boolean,
  ): boolean {
    if (!node.icon || radius <= 0) {
      return false;
    }

    const atlas = allocated ? this.activeSkills : this.inactiveSkills;

    let prefix = "normal";
    if (node.isKeystone) {
      prefix = "keystone";
    } else if (node.isNotable) {
      prefix = "notable";
    } else if (node.isMastery) {
      prefix = "masteryEffect";
    }

    const state = allocated ? "Active" : "Inactive";
    const key = `${prefix}${state}:${node.icon}`;

    const sprite = atlas.frames[key]?.frame;

    if (!sprite) {
      if (node.isGenericAttribute) {
        drawAttributeFallback(ctx, x, y, radius, allocated);
        return true;
      }
      return false;
    }

    
    const targetSize = radius * 1.35;
    drawSprite(ctx, atlas.image, sprite, x, y, targetSize);

    return true;
  }
}

async function createSprites(): Promise<PoeTreeSprites> {
  const [activeSkills, inactiveSkills, frames, bgImage] = await Promise.all([
    loadAtlas("skills.json", "skills.webp"),
    loadAtlas("skills-disabled.json", "skills-disabled.webp"),
    loadAtlas("frame.json", "frame.webp"),
    loadImage(`${ASSET_BASE_URL}background.webp`),
  ]);

  return new PoeTreeSprites(activeSkills, inactiveSkills, frames, bgImage);
}

async function loadAtlas(
  manifestFile: string,
  imageFile: string,
): Promise<LoadedAtlas> {
  const [manifest, image] = await Promise.all([
    loadManifest(manifestFile),
    loadImage(`${ASSET_BASE_URL}${imageFile}`),
  ]);

  return {
    image,
    frames: manifest.frames,
  };
}

async function loadManifest(fileName: string): Promise<SpriteManifest> {
  const response = await fetch(`${ASSET_BASE_URL}${fileName}`);

  if (!response.ok) {
    throw new Error(
      `Cannot load PoE atlas manifest: ${fileName} (${response.status})`,
    );
  }

  return (await response.json()) as SpriteManifest;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Cannot load PoE atlas image: ${source}`));

    image.src = source;
  });
}

function getFrameName(node: TreeNode, allocated: boolean): string | null {
  const state = allocated ? "Allocated" : "Unallocated";

  if (node.isAscendancyStart) {
    return "AscendancyStartNode";
  }

  if (node.isAscendancy) {
    if (node.ascendancyId === "Druid1") {
      return node.isNotable
        ? `OracleFrameNotable${state}`
        : `OracleFrame${state}`;
    }

    return node.isNotable
      ? `AscendancyFrameNotable${state}`
      : `AscendancyFrameNormal${state}`;
  }

  if (node.isKeystone) {
    return `KeystoneFrame${state}`;
  }

  if (node.isJewelSocket) {
    return `JewelFrame${state}`;
  }

  if (node.isNotable) {
    return `NotableFrame${state}`;
  }

  return allocated ? "PSSkillFrameActive" : "PSSkillFrame";
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sprite: SpriteRect,
  x: number,
  y: number,
  targetSize: number,
): void {
  const scale = targetSize / Math.max(sprite.w, sprite.h);

  const width = sprite.w * scale;
  const height = sprite.h * scale;

  if (width <= 0.1 || height <= 0.1 || !isFinite(width)) {
    return;
  }

  ctx.drawImage(
    image,
    sprite.x,
    sprite.y,
    sprite.w,
    sprite.h,
    x - width / 2,
    y - height / 2,
    width,
    height,
  );
}

function drawAttributeFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  allocated: boolean,
): void {
  ctx.fillStyle = allocated ? "#fff2c0" : "#a98d5a";
  ctx.font = `700 ${Math.max(6, radius * 1.35)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", x, y);
}
