#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// 定义ToolInput类型
const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// 接口定义
interface Student {
  Id: number;
  Name: string;
  School?: string;
  Club?: string;
  StarGrade?: number;
  SquadType?: string;
  TacticRole?: string;
  Position?: string;
  WeaponType?: string;
  ArmorType?: string;
  BulletType?: string;
  
  // 基础信息
  IsReleased?: boolean;
  DefaultOrder?: number;
  PathName?: string;
  DevName?: string;
  Icon?: string;
  SearchTags?: string[];
  
  // 角色信息
  FamilyName?: string;
  PersonalName?: string;
  SchoolYear?: string;
  CharacterAge?: string;
  Birthday?: string;
  CharacterSSRNew?: string;
  ProfileIntroduction?: string;
  Hobby?: string;
  CharacterVoice?: string;
  BirthDay?: string;
  Illustrator?: string;
  Designer?: string;
  CharHeightMetric?: string;
  CharHeightImperial?: string;
  
  // 数值属性
  AttackPower1?: number;
  AttackPower100?: number;
  MaxHP1?: number;
  MaxHP100?: number;
  DefensePower1?: number;
  DefensePower100?: number;
  HealPower1?: number;
  HealPower100?: number;
  DodgePoint?: number;
  AccuracyPoint?: number;
  CriticalPoint?: number;
  CriticalDamageRate?: number;
  StabilityPoint?: number;
  AmmoCount?: number;
  AmmoCost?: number;
  Range?: number;
  RegenCost?: number;
  
  // 战斗适应性
  StreetBattleAdaptation?: string;
  OutdoorBattleAdaptation?: string;
  IndoorBattleAdaptation?: string;
  
  // 装备和武器
  Equipment?: any[];
  WeaponImg?: string;
  Cover?: string;
  Size?: string;
  Weapon?: any;
  Gear?: any;
  
  // 技能相关
  Skills?: any[];
  SkillExMaterial?: any[];
  SkillExMaterialAmount?: any[];
  SkillMaterial?: any[];
  SkillMaterialAmount?: any[];
  
  // 好感度相关
  FavorStatType?: any[];
  FavorStatValue?: any[];
  FavorAlts?: any[];
  FavorItemTags?: any[];
  FavorItemUniqueTags?: any[];
  
  // 其他
  Summons?: any[];
  CollectionBG?: string;
  MemoryLobby?: any[];
  MemoryLobbyBGM?: any[];
  FurnitureInteraction?: any[];
  IsLimited?: boolean;
  PotentialMaterial?: number;
}

interface RaidInfo {
  Id: number;
  Level?: number;
  Name?: string;
  Terrain?: string;
  BaseIntelligence?: number;
}

interface Equipment {
  Id: number;
  Name?: string;
  Tier?: number;
  Category?: string;
  Description?: string;
}

interface Config {
  build?: string;
  region?: string;
}

interface Stage {
  Id?: number;
  Name?: string;
  Category?: string; // 关卡类别，如"Campaign", "Bounty"等
  Type?: string; // 关卡类型，如"ChaserA"等
  Stage?: number; // 关卡编号
  Level?: number; // 关卡等级
  EntryCost?: any[]; // 进入消耗
  StarCondition?: any[]; // 星级条件
  Terrain?: string; // 地形类型
  Rewards?: any[]; // 奖励列表
  Formations?: any[]; // 编队信息
  ArmorTypes?: number[]; // 护甲类型
  ServerData?: any; // 服务器数据
  // 兼容性字段
  Chapter?: string;
  StageNumber?: string;
  APCost?: number;
  RecommendLevel?: number;
  DropList?: any[];
}

interface Item {
  Id?: number;
  Name?: string;
  Category?: string;
  Rarity?: number;
  Tags?: string[];
  Icon?: string;
  Description?: string;
  ShopInfo?: any[];
  Sources?: string[];
}

interface Furniture {
  Id?: number;
  Name?: string;
  Category?: string;
  Rarity?: number;
  Tags?: string[];
  Icon?: string;
  Description?: string;
  ComfortBonus?: number;
  Size?: string;
  Type?: string;
  ShopInfo?: any[];
}

interface Enemy {
  Id?: number;
  Name?: string;
  Type?: string;
  Rank?: string;
  ArmorType?: string;
  BulletType?: string;
  AttackType?: string;
  DefenseType?: string;
  Level?: number;
  HP?: number;
  Attack?: number;
  Defense?: number;
  Accuracy?: number;
  Evasion?: number;
  CriticalRate?: number;
  CriticalDamage?: number;
  StabilityRate?: number;
  StabilityPoint?: number;
  Range?: number;
  MoveSpeed?: number;
  AmmoCount?: number;
  AmmoCost?: number;
  RegenCost?: number;
  Skills?: any[];
  Terrain?: string[];
  WeaponType?: string;
}

// Zod schemas for tool validation
const GetStudentsSchema = z.object({
  language: z.string().default("cn"),
  search: z.string().optional(),
  limit: z.number().default(20),
  detailed: z.boolean().default(false), // 是否返回详细信息
  school: z.string().optional(), // 按学校筛选
  starGrade: z.number().optional(), // 按星级筛选
  role: z.string().optional() // 按职业筛选
});

const GetStudentInfoSchema = z.object({
  studentId: z.number(),
  language: z.string().default("cn")
});

const GetStudentByNameSchema = z.object({
  name: z.string(), // 学生名称（支持中文、日文、英文）
  language: z.string().default("cn"),
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetRaidsSchema = z.object({
  language: z.string().default("cn"),
  search: z.string().optional(),
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetEquipmentSchema = z.object({
  language: z.string().default("cn"),
  category: z.string().optional(),
  tier: z.number().optional(),
  limit: z.number().default(20), // 限制返回条目数量
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetGameConfigSchema = z.object({
  includeRegions: z.boolean().default(true)
});

const GetStagesSchema = z.object({
  language: z.string().default("cn"),
  search: z.string().optional(), // 关卡名称搜索
  area: z.string().optional(), // 按区域筛选
  chapter: z.string().optional(), // 按章节筛选
  difficulty: z.string().optional(), // 按难度筛选
  limit: z.number().default(20),
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetItemsSchema = z.object({
  language: z.string().default("cn"),
  search: z.string().optional(), // 物品名称搜索
  category: z.string().optional(), // 按类别筛选
  rarity: z.number().optional(), // 按稀有度筛选
  tags: z.string().optional(), // 按标签筛选
  limit: z.number().default(20),
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetFurnitureSchema = z.object({
  language: z.string().default("cn"),
  search: z.string().optional(), // 家具名称搜索
  category: z.string().optional(), // 按类别筛选
  type: z.string().optional(), // 按类型筛选
  rarity: z.number().optional(), // 按稀有度筛选
  tags: z.string().optional(), // 按标签筛选
  limit: z.number().default(20),
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetEnemiesSchema = z.object({
  language: z.string().default("cn"),
  search: z.string().optional(), // 敌人名称搜索
  type: z.string().optional(), // 按类型筛选
  rank: z.string().optional(), // 按等级筛选
  armorType: z.string().optional(), // 按护甲类型筛选
  bulletType: z.string().optional(), // 按子弹类型筛选
  terrain: z.string().optional(), // 按地形筛选
  limit: z.number().default(20),
  detailed: z.boolean().default(false) // 是否返回详细信息
});

const GetStudentAvatarSchema = z.object({
  studentId: z.number().optional(), // 学生ID
  name: z.string().optional(), // 学生名称
  language: z.string().default("cn"),
  avatarType: z.string().default("portrait").optional(), // 头像类型：portrait, collection, icon, lobby
  format: z.string().default("markdown").optional() // 输出格式：markdown, md
});

const GetStudentVoiceSchema = z.object({
  studentId: z.number().optional(), // 学生ID
  name: z.string().optional(), // 学生名称
  language: z.string().default("cn"),
  voiceType: z.string().default("all").optional(), // 语音类型：normal, battle, lobby, event, all
  format: z.string().default("text").optional() // 输出格式：text, markdown, md
});

// 新增：角色变体发现工具Schema
const FindStudentVariantsSchema = z.object({
  name: z.string(), // 角色名称（支持中文、日文、英文）
  language: z.string().default("cn"),
  includeOriginal: z.boolean().default(true), // 是否包含原版角色
  format: z.string().default("text").optional() // 输出格式：text, markdown, md
});

// 新增：批量头像获取工具Schema
const GetMultipleStudentAvatarsSchema = z.object({
  studentIds: z.array(z.number()), // 学生ID数组
  language: z.string().default("cn"),
  avatarType: z.string().default("portrait").optional(), // 头像类型：portrait, collection, icon, lobby
  format: z.string().default("markdown").optional() // 输出格式：markdown, md
});

// 新增：批量语音获取工具Schema
const GetMultipleStudentVoicesSchema = z.object({
  studentIds: z.array(z.number()), // 学生ID数组
  language: z.string().default("cn"),
  voiceType: z.string().default("all").optional(), // 语音类型：normal, battle, lobby, event, all
  format: z.string().default("text").optional() // 输出格式：text, markdown, md
});

// 配置接口
interface MCPConfig {
  baseUrl: string;
  defaultLanguage: string;
  cacheTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// 默认配置
const DEFAULT_CONFIG: MCPConfig = {
  baseUrl: 'https://schaledb.com/data',
  defaultLanguage: 'cn',
  cacheTimeout: 5 * 60 * 1000, // 5分钟
  logLevel: 'info'
};

// 日志工具
class Logger {
  private level: string;
  
  constructor(level: string = 'info') {
    this.level = level;
  }
  
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      // Debug logs are disabled in production
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      // Info logs are disabled in production
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      // Warning logs are disabled in production
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  log(message: string, ...args: any[]): void {
    this.info(message, ...args);
  }
}

// 参数处理工具类
class ParameterHandler {
  // 统一处理language参数
  static normalizeLanguage(language?: string): string {
    return language || DEFAULT_CONFIG.defaultLanguage;
  }

  // 统一处理detailed参数
  static normalizeDetailed(detailed?: boolean): boolean {
    return detailed ?? false;
  }

  // 统一处理limit参数
  static normalizeLimit(limit?: number, defaultLimit: number = 20): number {
    return limit || defaultLimit;
  }

  // 统一处理format参数
  static normalizeFormat(format?: string, defaultFormat: string = 'text'): string {
    return format || defaultFormat;
  }
}

// 统一错误处理工具类
class ErrorHandler {
  private static logger = new Logger();

  /**
   * 处理并格式化错误信息
   */
  static handleError(error: unknown, context?: string): string {
    let errorMessage: string;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = '未知错误';
    }

    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    this.logger.error(fullMessage);
    
    return errorMessage;
  }

  /**
   * 创建标准化的错误响应
   */
  static createErrorResponse(error: unknown, context?: string): { content: Array<{ type: string; text: string }> } {
    const errorMessage = this.handleError(error, context);
    
    return {
      content: [
        {
          type: "text",
          text: context ? `${context}时出错: ${errorMessage}` : `操作失败: ${errorMessage}`
        }
      ]
    };
  }

  /**
   * 安全执行异步操作
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }
}

// 语音数据接口
interface VoiceData {
  Group?: string;
  GroupIndex?: number;
  Id?: number;
  AudioClip?: string;
  Transcription?: string;
  [key: string]: any;
}

// 学生变体接口
interface StudentVariant extends Student {
  similarity: number;
}

// 头像结果接口
interface AvatarResult {
  studentId: number;
  name: string | null;
  avatarUrl: string | null;
  avatarType: string;
  success: boolean;
  error?: string;
}

// 语音结果接口
interface VoiceResult {
  studentId: number;
  name: string | null;
  voices: VoiceData[];
  voiceType: string;
  success: boolean;
  error?: string;
}

// 缓存类
class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// SchaleDB API 客户端
class SchaleDBClient {
  private config: MCPConfig;
  private logger: Logger;
  private cache: Cache<any>;
  private localizationCache: Cache<any>;

  constructor(config: Partial<MCPConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.logLevel);
    this.cache = new Cache<any>(this.config.cacheTimeout / (60 * 1000));
    this.localizationCache = new Cache<any>(120); // 本地化数据缓存2小时
  }

  private async fetchData(endpoint: string): Promise<any> {
    const cachedData = this.cache.get(endpoint);
    if (cachedData) {
      this.logger.debug(`Cache hit for endpoint: ${endpoint}`);
      return cachedData;
    }

    try {
      this.logger.debug(`Fetching data from: ${this.config.baseUrl}/${endpoint}`);
      const response = await fetch(`${this.config.baseUrl}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(endpoint, data);
      this.logger.info(`Successfully fetched and cached data for: ${endpoint}`);
      return data;
    } catch (error) {
      const errorMessage = ErrorHandler.handleError(error, `Failed to fetch ${endpoint}`);
      throw new Error(`Failed to fetch ${endpoint}: ${errorMessage}`);
    }
  }

  // 智能搜索算法 - 支持模糊匹配和多语言
  private smartSearch(items: any[], searchTerm: string, fields: string[]): any[] {
    if (!searchTerm) return items;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const results: { item: any, score: number }[] = [];
    
    for (const item of items) {
      let score = 0;
      
      for (const field of fields) {
        const value = item[field];
        if (!value) continue;
        
        const normalizedValue = value.toString().toLowerCase();
        
        // 精确匹配 - 最高分
        if (normalizedValue === normalizedSearch) {
          score += 100;
        }
        // 开头匹配 - 高分
        else if (normalizedValue.startsWith(normalizedSearch)) {
          score += 80;
        }
        // 包含匹配 - 中等分
        else if (normalizedValue.includes(normalizedSearch)) {
          score += 60;
        }
        // 部分字符匹配 - 低分，但需要更严格的条件
        else {
          let partialScore = 0;
          let matchedChars = 0;
          
          for (let i = 0; i < normalizedSearch.length; i++) {
            if (normalizedValue.includes(normalizedSearch[i])) {
              matchedChars++;
              partialScore += 1;
            }
          }
          
          // 提高阈值：需要匹配至少80%的字符，且搜索词长度大于1
          const matchRatio = matchedChars / normalizedSearch.length;
          if (matchRatio >= 0.8 && normalizedSearch.length > 1) {
            score += Math.floor(partialScore * matchRatio);
          }
        }
      }
      
      // 只返回分数足够高的结果，避免低相似度的噪音
      if (score >= 10) {
        results.push({ item, score });
      }
    }
    
    // 按分数排序，返回最相关的结果
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);
  }

  // 数据字段精简
  public simplifyStudentData(student: Student, detailed: boolean = false): any {
    if (detailed) {
      // 详细模式 - 返回核心数据，移除冗余信息
      return {
        Id: student.Id,
        Name: student.Name,
        School: student.School,
        Club: student.Club,
        StarGrade: student.StarGrade,
        SquadType: student.SquadType,
        TacticRole: student.TacticRole,
        Position: student.Position,
        WeaponType: student.WeaponType,
        ArmorType: student.ArmorType,
        BulletType: student.BulletType,
        AttackPower1: student.AttackPower1,
        AttackPower100: student.AttackPower100,
        MaxHP1: student.MaxHP1,
        MaxHP100: student.MaxHP100,
        DefensePower1: student.DefensePower1,
        DefensePower100: student.DefensePower100,
        HealPower1: student.HealPower1,
        HealPower100: student.HealPower100,
        BattleAdaptation: {
          Street: student.StreetBattleAdaptation,
          Outdoor: student.OutdoorBattleAdaptation,
          Indoor: student.IndoorBattleAdaptation
        }
      };
    }
    
    // 简要模式 - 只返回核心字段
    return {
      Id: student.Id,
      Name: student.Name,
      School: student.School,
      StarGrade: student.StarGrade,
      TacticRole: student.TacticRole,
      WeaponType: student.WeaponType,
      ArmorType: student.ArmorType
    };
  }

  // 计算成长属性曲线
  private calculateGrowthCurve(student: Student): any {
    const curve: any = {};
    
    // 计算攻击力曲线
    if (student.AttackPower1 && student.AttackPower100) {
      curve.AttackPower = this.calculateStatCurve(student.AttackPower1, student.AttackPower100);
    }
    
    // 计算生命值曲线
    if (student.MaxHP1 && student.MaxHP100) {
      curve.MaxHP = this.calculateStatCurve(student.MaxHP1, student.MaxHP100);
    }
    
    // 计算防御力曲线
    if (student.DefensePower1 && student.DefensePower100) {
      curve.DefensePower = this.calculateStatCurve(student.DefensePower1, student.DefensePower100);
    }
    
    // 计算治疗力曲线
    if (student.HealPower1 && student.HealPower100) {
      curve.HealPower = this.calculateStatCurve(student.HealPower1, student.HealPower100);
    }
    
    return curve;
  }

  // 计算单个属性的成长曲线
  private calculateStatCurve(level1Value: number, level100Value: number): any[] {
    const curve = [];
    const totalGrowth = level100Value - level1Value;
    
    // 每10级计算一次数值
    for (let level = 1; level <= 100; level += 10) {
      const progress = (level - 1) / 99; // 0到1的进度
      const currentValue = Math.round(level1Value + (totalGrowth * progress));
      curve.push({
        Level: level,
        Value: currentValue
      });
    }
    
    // 确保100级的曲线值是准确的
    if (curve[curve.length - 1]?.Level !== 100) {
      curve.push({
        Level: 100,
        Value: level100Value
      });
    }
    
    return curve;
  }

  // 获取技能类型描述
  private getSkillType(index: number): string {
    const skillTypes = [
      'EX技能', // 0
      '普通技能', // 1  
      '被动技能', // 2
      '子技能' // 3+
    ];
    return skillTypes[index] || `技能${index + 1}`;
  }

  private simplifyRaidData(raid: RaidInfo, detailed: boolean = false): any {
    return {
      Id: raid.Id,
      Name: raid.Name,
      Level: raid.Level,
      Terrain: raid.Terrain,
      BaseIntelligence: raid.BaseIntelligence
    };
  }

  private simplifyEquipmentData(equipment: Equipment, detailed: boolean = false): any {
    return {
      Id: equipment.Id,
      Name: equipment.Name,
      Tier: equipment.Tier,
      Category: equipment.Category,
      Description: equipment.Description
    };
  }

  // 创建可搜索的关卡编号字段
  private createSearchableStageNumber(stage: Stage): string {
    const parts: string[] = [];
    
    // 添加原始关卡编号
    if (stage.StageNumber) {
      parts.push(stage.StageNumber);
    }
    
    // 添加数字形式的关卡编号
    if (stage.Stage) {
      parts.push(stage.Stage.toString());
    }
    
    // 添加章节-关卡格式
    if (stage.Chapter && stage.Stage) {
      parts.push(`${stage.Chapter}-${stage.Stage}`);
    }
    
    // 添加ID
    if (stage.Id) {
      parts.push(stage.Id.toString());
    }
    
    return parts.join(' ');
  }

  private simplifyStageData(stage: Stage, detailed: boolean = false, language: string = 'cn', localization?: any): any {
    const generatedName = this.generateStageName(stage, localization || {});
    
    // 地形本地化映射
    const terrainMapping: { [key: string]: string } = {
      'Street': '街道',
      'Outdoor': '室外', 
      'Indoor': '室内'
    };
    
    // 从ID推导章节信息和关卡编号
    let derivedChapter = stage.Chapter;
    let derivedStageNumber = stage.StageNumber;
    
    if (stage.Id) {
      const idStr = stage.Id.toString();
      
      // 如果没有章节信息，尝试从ID推导
      if (!derivedChapter) {
        if (idStr.length >= 4) {
          // 尝试从ID的前2位推导章节
          const chapterNum = parseInt(idStr.substring(0, 2));
          if (!isNaN(chapterNum) && chapterNum > 0) {
            derivedChapter = chapterNum.toString();
          }
        } else if (idStr.length >= 2) {
          // 对于较短的ID，尝试从前1位推导
          const chapterNum = parseInt(idStr.substring(0, 1));
          if (!isNaN(chapterNum) && chapterNum > 0) {
            derivedChapter = chapterNum.toString();
          }
        }
      }
      
      // 如果没有关卡编号，尝试从ID推导
      if (!derivedStageNumber) {
        if (idStr.length >= 4) {
          // 尝试从ID的后2位推导关卡编号
          const stageNum = parseInt(idStr.substring(2, 4));
          if (!isNaN(stageNum)) {
            derivedStageNumber = stageNum.toString();
          }
        } else if (idStr.length >= 2) {
          // 对于较短的ID，尝试从后1位推导
          const stageNum = parseInt(idStr.substring(1));
          if (!isNaN(stageNum)) {
            derivedStageNumber = stageNum.toString();
          }
        }
      }
    }
    
    return {
      Id: stage.Id,
      Name: stage.Name || generatedName || `关卡 ${stage.Id}`, // 优先使用原始名称，然后是生成名称
      GeneratedName: generatedName, // 添加生成名称字段
      Category: stage.Category, // 关卡类别
      Type: stage.Type, // 关卡类型
      Stage: stage.Stage, // 关卡编号
      Level: stage.Level, // 关卡等级
      Terrain: stage.Terrain,
      TerrainCN: stage.Terrain ? terrainMapping[stage.Terrain] || stage.Terrain : undefined, // 中文地形名称
      EntryCost: stage.EntryCost, // 进入消耗
      Rewards: detailed ? stage.Rewards : undefined, // 详细模式下显示奖励
      StarCondition: detailed ? stage.StarCondition : undefined, // 详细模式下显示星级条件
      Formations: detailed ? stage.Formations : undefined, // 详细模式下显示编队信息
      ArmorTypes: detailed ? stage.ArmorTypes : undefined, // 详细模式下显示护甲类型
      ServerData: detailed ? stage.ServerData : undefined, // 详细模式下显示服务器数据
      // 兼容性字段
      Chapter: derivedChapter, // 使用推导的章节信息
      StageNumber: derivedStageNumber, // 使用推导的关卡编号
      SearchableStageNumber: derivedStageNumber, // 添加可搜索的关卡编号字段
      APCost: stage.APCost,
      RecommendLevel: stage.RecommendLevel,
      DropList: stage.DropList
    };
  }

  private simplifyItemData(item: Item, detailed: boolean = false): any {
    return {
      Id: item.Id,
      Name: item.Name,
      Category: item.Category,
      Rarity: item.Rarity,
      Tags: item.Tags,
      Icon: item.Icon,
      Description: item.Description
    };
  }

  private simplifyFurnitureData(furniture: Furniture, detailed: boolean = false): any {
    return {
      Id: furniture.Id,
      Name: furniture.Name,
      Category: furniture.Category,
      Type: furniture.Type,
      Rarity: furniture.Rarity,
      ComfortBonus: furniture.ComfortBonus,
      Size: furniture.Size
    };
  }

  private simplifyEnemyData(enemy: Enemy, detailed: boolean = false): any {
    return {
      Id: enemy.Id,
      Name: enemy.Name,
      Type: enemy.Type,
      Rank: enemy.Rank,
      ArmorType: enemy.ArmorType,
      BulletType: enemy.BulletType,
      Level: enemy.Level,
      HP: enemy.HP,
      Attack: enemy.Attack,
      Defense: enemy.Defense,
      WeaponType: enemy.WeaponType,
      Terrain: enemy.Terrain
    };
  }

  // 中英文映射表
  private readonly schoolMapping: { [key: string]: string } = {
    '三一': 'Trinity',
    '三一综合学园': 'Trinity',
    '千年': 'Millennium',
    '千年科技学院': 'Millennium',
    '格黑娜': 'Gehenna',
    '格黑娜学园': 'Gehenna',
    '阿拜多斯': 'Abydos',
    '阿拜多斯高等学校': 'Abydos',
    '山海经': 'Shanhaijing',
    '山海经高级中学': 'Shanhaijing',
    '百鬼夜行': 'Hyakkiyako',
    '百鬼夜行联合学院': 'Hyakkiyako',
    '红冬': 'RedWinter',
    '红冬联邦学园': 'RedWinter',
    '特殊任务部': 'SRT',
    'srt': 'SRT',
    '阿里乌斯': 'Arius',
    '阿里乌斯小队': 'Arius',
    '常盘台': 'Tokiwadai',
    '瓦尔基里': 'Valkyrie',
    '高地人': 'Highlander',
    '狂猎': 'WildHunt',
    '其他': 'ETC',
    '佐久川': 'Sakugawa'
  };

  private readonly roleMapping: { [key: string]: string } = {
    '治疗': 'Healer',
    '治疗师': 'Healer',
    '奶妈': 'Healer',
    '坦克': 'Tanker',
    '肉盾': 'Tanker',
    '前排': 'Tanker',
    '输出': 'DamageDealer',
    '伤害': 'DamageDealer',
    'dps': 'DamageDealer',
    '辅助': 'Supporter',
    '支援': 'Supporter',
    '载具': 'Vehicle',
    '机甲': 'Vehicle'
  };

  // 统一的学生查询方法 - 支持所有查询选项
  async getStudents(options: {
    language?: string;
    search?: string;
    limit?: number;
    detailed?: boolean;
    school?: string;
    starGrade?: number;
    role?: string;
    compressed?: boolean;
  } = {}): Promise<Student[]> {
    const {
      language = 'cn',
      search,
      limit = 20,
      detailed = false,
      school,
      starGrade,
      role,
      compressed = false
    } = options;

    this.logger.log(`获取学生数据: ${JSON.stringify(options)}`);

    const suffix = compressed ? '.min.json' : '.json';
    const data = await this.fetchData(`${language}/students${suffix}`);
    
    // 处理数据格式：如果是对象，转换为数组
    let students: Student[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      students = Object.values(data) as Student[];
    } else {
      students = Array.isArray(data) ? data : [];
    }

    // 应用筛选条件
    let filteredStudents = students;

    // 按学校过滤 - 支持中英文
    if (school) {
      const normalizedSchool = school.toLowerCase();
      // 检查是否为中文学校名，如果是则转换为英文
      const englishSchool = this.schoolMapping[school] || this.schoolMapping[normalizedSchool];
      
      filteredStudents = filteredStudents.filter((s: Student) => {
        if (!s.School) return false;
        
        const studentSchool = s.School.toLowerCase();
        
        // 直接匹配原始输入
        if (studentSchool.includes(normalizedSchool)) return true;
        
        // 如果有英文映射，也尝试匹配英文名
        if (englishSchool && studentSchool.includes(englishSchool.toLowerCase())) return true;
        
        return false;
      });
    }

    // 按星级过滤
    if (starGrade) {
      filteredStudents = filteredStudents.filter((s: Student) => s.StarGrade === starGrade);
    }

    // 按职业过滤 - 支持中英文
    if (role) {
      const normalizedRole = role.toLowerCase();
      // 检查是否为中文职业名，如果是则转换为英文
      const englishRole = this.roleMapping[role] || this.roleMapping[normalizedRole];
      
      filteredStudents = filteredStudents.filter((s: Student) => {
        if (!s.TacticRole) return false;
        
        const studentRole = s.TacticRole.toLowerCase();
        
        // 直接匹配原始输入
        if (studentRole.includes(normalizedRole)) return true;
        
        // 如果有英文映射，也尝试匹配英文名
        if (englishRole && studentRole.includes(englishRole.toLowerCase())) return true;
        
        return false;
      });
    }

    // 智能搜索
    if (search) {
      filteredStudents = this.smartSearch(
        filteredStudents, 
        search, 
        ['Name', 'School', 'TacticRole', 'WeaponType']
      );
    }

    // 限制结果数量
    const limitedStudents = filteredStudents.slice(0, limit);

    // 应用数据精简
    return limitedStudents.map(student => this.simplifyStudentData(student, detailed));
  }

  // 通过名称查询学生 - 支持多语言字段搜索和跨语言搜索
  async getStudentByName(name: string, language: string = 'cn', detailed: boolean = false): Promise<Student | null> {
    this.logger.log(`按名称查询学生: ${name}`);
    
    const normalizedSearchName = name.toLowerCase().trim();
    
    // 定义搜索函数
    const searchInData = (data: any) => {
      if (!data || typeof data !== 'object') {
        return null;
      }
      
      // 遍历所有学生ID
      for (const studentId of Object.keys(data)) {
        const student = data[studentId];
        if (!student) continue;
        
        // 检查多个名称字段
        const fieldsToCheck = [
          student.Name,           // 名称
          student.DevName,        // 英文名
          student.FamilyName,     // 姓氏
          student.PersonalName,   // 名字
          student.PathName,       // 路径名
          // 组合字段
          student.FamilyName && student.PersonalName ? `${student.FamilyName}${student.PersonalName}` : null,
          student.FamilyName && student.PersonalName ? `${student.FamilyName} ${student.PersonalName}` : null
        ];
        
        // 检查是否有任何字段匹配
        for (const field of fieldsToCheck) {
          if (field && typeof field === 'string') {
            const normalizedField = field.toLowerCase().trim();
            // 支持精确匹配和包含匹配
            if (normalizedField === normalizedSearchName || normalizedField.includes(normalizedSearchName)) {
              return student;
            }
          }
        }
      }
      return null;
    };
    
    // 首先在指定语言中搜索
    const primaryData = await this.fetchData(`${language}/students.json`);
    let foundStudent = searchInData(primaryData);
    
    if (foundStudent) {
      return this.simplifyStudentData(foundStudent, detailed);
    }
    
    // 如果在主要语言中没找到，尝试其他语言
    const languagesToTry = ['cn', 'jp', 'en', 'kr', 'th'].filter(lang => lang !== language);
    
    for (const lang of languagesToTry) {
      this.logger.log(`在 ${lang} 语言数据中搜索: ${name}`);
      const data = await this.fetchData(`${lang}/students.json`);
      foundStudent = searchInData(data);
      
      if (foundStudent) {
        this.logger.log(`在 ${lang} 语言数据中找到匹配: ${foundStudent.Name}`);
        return this.simplifyStudentData(foundStudent, detailed);
      }
    }

    return null;
  }

  // 增强的getRaids方法 - 支持数据精简
  async getRaidsEnhanced(language: string = 'cn', detailed: boolean = false): Promise<any[]> {
    const data = await this.fetchData(`${language}/raids.json`);
    
    let raids: RaidInfo[];
    if (data && data.Raid && Array.isArray(data.Raid)) {
      raids = data.Raid;
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      raids = Object.values(data) as RaidInfo[];
    } else {
      raids = Array.isArray(data) ? data : [];
    }

    return raids.map(raid => this.simplifyRaidData(raid, detailed));
  }

  async getRaids(language: string = 'cn'): Promise<RaidInfo[]> {
    const data = await this.fetchData(`${language}/raids.json`);
    
    // 处理数据格式：如果是对象，提取Raid数组
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // 根据API测试结果，raids数据包含Raid字段
      if (data.Raid && Array.isArray(data.Raid)) {
        return data.Raid;
      }
      // 如果是其他对象格式，转换为数组
      return Object.values(data).flat().filter(item => item && typeof item === 'object') as RaidInfo[];
    }
    
    return Array.isArray(data) ? data : [];
  }

  async getEquipment(language: string = 'cn'): Promise<Equipment[]> {
    const data = await this.fetchData(`${language}/equipment.json`);
    
    // 处理数据格式：如果是对象，转换为数组
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // 将对象的值转换为数组
      return Object.values(data) as Equipment[];
    }
    
    return Array.isArray(data) ? data : [];
  }

  async getConfig(): Promise<Config> {
    return await this.fetchData('config.json');
  }

  async getStages(language: string = 'cn'): Promise<any[]> {
    return await this.fetchData(`${language}/stages.json`);
  }

  async getItems(language: string = 'cn'): Promise<any[]> {
    return await this.fetchData(`${language}/items.json`);
  }

  async getFurniture(language: string = 'cn'): Promise<any[]> {
    return await this.fetchData(`${language}/furniture.json`);
  }

  async getEnemies(language: string = 'cn'): Promise<any[]> {
    return await this.fetchData(`${language}/enemies.json`);
  }

  async getVoiceData(language: string = 'cn'): Promise<any> {
    return await this.fetchData(`${language}/voice.json`);
  }

  // 获取本地化数据
  async getLocalizationData(language: string = 'cn'): Promise<any> {
    const cacheKey = `localization_${language}`;
    const cached = this.localizationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.fetchData(`${language}/localization.json`);
    this.localizationCache.set(cacheKey, data);
    return data;
  }

  // 生成关卡名称
  private generateStageName(stage: Stage, localizationData: any): string | undefined {
    try {
      // 根据关卡ID和Stage字段构建名称
      let name = '';
      
      // 根据Category构建基础名称
      if (stage.Category) {
        const categoryName = this.getCategoryDisplayName(stage.Category);
        
        // 使用Stage字段作为关卡编号
        if (stage.Stage) {
          name = `${categoryName} ${stage.Stage}`;
        } else {
          name = `${categoryName}`;
        }
        
        // 添加等级信息
        if (stage.Level) {
          name += `-${stage.Level}`;
        }
        
        // 添加地形信息
        if (stage.Terrain) {
          name += ` (${stage.Terrain})`;
        }
      } else {
        // 没有Category时，使用ID构建名称
        if (stage.Stage) {
          name = `关卡 ${stage.Stage}`;
        } else {
          name = `关卡 ${stage.Id || 'Unknown'}`;
        }
      }

      // 确保返回有效的名称，如果为空则返回undefined
      return name.trim() || undefined;
    } catch (error) {
      console.error('generateStageName error:', error);
      return `关卡 ${stage.Id || 'Unknown'}`;
    }
  }

  private getCategoryDisplayName(category: string): string {
    switch (category.toLowerCase()) {
      case 'campaign':
        return '主线';
      case 'bounty':
        return '悬赏';
      case 'commission':
        return '委托';
      case 'schooldungeon':
        return '学园';
      case 'weekdungeon':
        return '周常';
      default:
        return category;
    }
  }

  // 增强的关卡查询方法 - 支持智能搜索和字段精简
  async getStagesEnhanced(options: {
    language?: string;
    search?: string;
    area?: string;
    chapter?: string;
    difficulty?: string;
    limit?: number;
    detailed?: boolean;
  } = {}): Promise<any[]> {
    const {
      language = 'cn',
      search,
      area,
      chapter,
      difficulty,
      limit = 20,
      detailed = false
    } = options;

    const data = await this.fetchData(`${language}/stages.json`);
    // 加载本地化数据用于关卡名称生成
    const localizationData = await this.fetchData(`${language}/localization.json`);
    
    // 处理数据格式：如果是对象，转换为数组
    let stages: Stage[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      stages = Object.values(data) as Stage[];
    } else {
      stages = Array.isArray(data) ? data : [];
    }

    // 应用筛选条件
    let filteredStages = stages;

    // 按类别筛选 - 改进映射和匹配机制
    if (area) {
      filteredStages = filteredStages.filter(s => {
        if (!s.Category) return false;
        
        const category = s.Category.toLowerCase();
        const searchArea = area.toLowerCase();
        
        // 直接匹配
        if (category.includes(searchArea)) {
          return true;
        }
        
        // 扩展的映射匹配
        const categoryMapping: { [key: string]: string[] } = {
          '主线': ['campaign', 'main', 'story'],
          '活动': ['event', 'special'],
          '悬赏': ['bounty', 'commission'],
          '总力战': ['totalassault', 'raid', 'ta'],
          '困难': ['hard', 'difficult'],
          '任务': ['mission', 'quest'],
          '挑战': ['challenge'],
          '演习': ['exercise', 'practice']
        };
        
        // 检查中文到英文的映射
        const mappedCategories = categoryMapping[area];
        if (mappedCategories) {
          return mappedCategories.some(cat => category.includes(cat));
        }
        
        // 检查英文到中文的反向映射
        for (const [chineseArea, englishCategories] of Object.entries(categoryMapping)) {
          if (englishCategories.some(cat => cat === searchArea)) {
            return category.includes(chineseArea.toLowerCase()) || 
                   englishCategories.some(cat => category.includes(cat));
          }
        }
        
        return false;
      });
    }

    // 按章节筛选 - 从ID推导章节信息
    if (chapter) {
      filteredStages = filteredStages.filter(s => {
        const chapterStr = chapter.toLowerCase();
        const chapterNum = parseInt(chapter);
        
        // 1. 通过Stage字段匹配（关卡编号）
        if (s.Stage !== undefined && !isNaN(chapterNum)) {
          if (s.Stage === chapterNum) {
            return true;
          }
        }
        
        // 2. 从ID推导章节信息（主要逻辑）
        if (s.Id !== undefined) {
          const idStr = s.Id.toString();
          let derivedChapter: number | null = null;
          
          // 5位数ID：前2位是章节（如30101 -> 30章）
          if (idStr.length === 5) {
            derivedChapter = parseInt(idStr.substring(0, 2));
          }
          // 4位数ID：前1位是章节（如1001 -> 1章）
          else if (idStr.length === 4) {
            derivedChapter = parseInt(idStr.substring(0, 1));
          }
          // 6位数ID：前2位是章节（如301001 -> 30章）
          else if (idStr.length === 6) {
            derivedChapter = parseInt(idStr.substring(0, 2));
          }
          
          if (derivedChapter !== null && !isNaN(chapterNum)) {
            if (derivedChapter === chapterNum) {
              return true;
            }
          }
        }
        
        // 3. 通过Chapter字段匹配（如果存在）
        if (s.Chapter) {
          const stageChapter = s.Chapter.toLowerCase();
          if (stageChapter.includes(chapterStr) || chapterStr.includes(stageChapter)) {
            return true;
          }
        }
        
        // 4. 通过Name字段匹配章节信息（如果存在）
        if (s.Name) {
          const stageName = s.Name.toLowerCase();
          // 匹配章节数字（如"第1章"、"chapter 1"、"1-1"等）
          const chapterPatterns = [
            `第${chapter}章`,
            `chapter ${chapter}`,
            `ch${chapter}`,
            `${chapter}-`,
            `-${chapter}-`,
            `第${chapter}话`,
            `episode ${chapter}`
          ];
          
          if (chapterPatterns.some(pattern => stageName.includes(pattern.toLowerCase()))) {
            return true;
          }
          
          // 直接包含匹配
          if (stageName.includes(chapterStr)) {
            return true;
          }
        }
        
        return false;
      });
    }

    // 按难度筛选 - 增强映射和匹配逻辑
    if (difficulty) {
      filteredStages = filteredStages.filter(s => {
        const difficultyStr = difficulty.toLowerCase();
        
        // 1. 通过Level字段筛选（数字难度）
        if (s.Level !== undefined) {
          const difficultyNum = parseInt(difficulty);
          if (!isNaN(difficultyNum)) {
            return s.Level === difficultyNum;
          }
          
          // 数字范围匹配
          const levelRangeMapping: { [key: string]: number[] } = {
            '简单': [1, 2, 3, 4, 5],
            '普通': [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            '困难': [16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
            '极难': [26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
            'easy': [1, 2, 3, 4, 5],
            'normal': [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            'hard': [16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
            'extreme': [26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
          };
          
          const levelRange = levelRangeMapping[difficultyStr];
          if (levelRange && levelRange.includes(s.Level)) {
            return true;
          }
        }
        
        // 2. 通过Category字段筛选难度
        if (s.Category) {
          const category = s.Category.toLowerCase();
          
          // 扩展的难度映射
          const difficultyMapping: { [key: string]: string[] } = {
            '普通': ['normal', 'campaign', 'story', 'main'],
            '困难': ['hard', 'difficult', 'challenge'],
            '简单': ['easy', 'normal', 'tutorial', 'beginner'],
            '极难': ['extreme', 'hell', 'nightmare', 'insane', 'expert'],
            'normal': ['normal', 'campaign', 'story', 'main'],
            'hard': ['hard', 'difficult', 'challenge'],
            'easy': ['easy', 'normal', 'tutorial', 'beginner'],
            'extreme': ['extreme', 'hell', 'nightmare', 'insane', 'expert'],
            'hell': ['extreme', 'hell', 'nightmare', 'insane'],
            'nightmare': ['extreme', 'hell', 'nightmare', 'insane'],
            'expert': ['extreme', 'hell', 'nightmare', 'insane', 'expert'],
            'challenge': ['hard', 'difficult', 'challenge'],
            'story': ['normal', 'campaign', 'story', 'main'],
            'main': ['normal', 'campaign', 'story', 'main'],
            'tutorial': ['easy', 'normal', 'tutorial', 'beginner'],
            'beginner': ['easy', 'normal', 'tutorial', 'beginner']
          };
          
          const mappedDifficulties = difficultyMapping[difficultyStr];
          if (mappedDifficulties) {
            if (mappedDifficulties.some(diff => category.includes(diff))) {
              return true;
            }
          }
          
          // 直接匹配
          if (category.includes(difficultyStr)) {
            return true;
          }
        }
        
        // 3. 通过Type字段匹配
        if (s.Type) {
          const type = s.Type.toLowerCase();
          if (type.includes(difficultyStr)) {
            return true;
          }
        }
        
        // 4. 通过Name字段匹配（如果关卡名称包含难度信息）
        if (s.Name) {
          const name = s.Name.toLowerCase();
          if (name.includes(difficultyStr)) {
            return true;
          }
        }
        
        return false;
      });
    }

      // 智能搜索 - 增强关卡搜索逻辑
      if (search) {
        // 首先尝试生成关卡名称并添加到搜索字段中
        const stagesWithGeneratedNames = filteredStages.map((stage) => {
          try {
            const generatedName = this.generateStageName(stage, localizationData);
            
            // 地形本地化映射
            const terrainMapping: { [key: string]: string } = {
              'Street': '街道',
              'Outdoor': '室外', 
              'Indoor': '室内'
            };
            
            return {
              ...stage,
              GeneratedName: generatedName,
              TerrainCN: stage.Terrain ? terrainMapping[stage.Terrain] || stage.Terrain : undefined,
              // 创建组合搜索字段，包含关卡编号的多种格式
              SearchableStageNumber: this.createSearchableStageNumber(stage)
            };
          } catch (error) {
            return {
              ...stage,
              GeneratedName: stage.Name || '',
              TerrainCN: undefined,
              SearchableStageNumber: this.createSearchableStageNumber(stage)
            };
          }
        });

        // 使用智能搜索，包含地形中文搜索
        filteredStages = this.smartSearch(stagesWithGeneratedNames, search, [
          'Name', 'GeneratedName', 'Chapter', 'StageNumber', 'SearchableStageNumber', 'TerrainCN'
        ]);
      } else {
        // 如果没有搜索条件，也需要生成关卡名称
        filteredStages = filteredStages.map((stage) => {
          try {
            const generatedName = this.generateStageName(stage, localizationData);
            return {
              ...stage,
              GeneratedName: generatedName,
              SearchableStageNumber: this.createSearchableStageNumber(stage)
            };
          } catch (error) {
            return {
              ...stage,
              GeneratedName: stage.Name || '',
              SearchableStageNumber: this.createSearchableStageNumber(stage)
            };
          }
        });
    }

    // 限制结果数量
    const limitedStages = filteredStages.slice(0, limit);

    // 返回精简或详细数据
    return limitedStages.map(stage => this.simplifyStageData(stage, detailed, language, localizationData));
  }

  // 增强的物品查询方法 - 支持智能搜索和字段精简
  async getItemsEnhanced(options: {
    language?: string;
    search?: string;
    category?: string;
    rarity?: number;
    tags?: string;
    limit?: number;
    detailed?: boolean;
  } = {}): Promise<any[]> {
    const {
      language = 'cn',
      search,
      category,
      rarity,
      tags,
      limit = 20,
      detailed = false
    } = options;

    const data = await this.fetchData(`${language}/items.json`);
    
    // 处理数据格式：如果是对象，转换为数组
    let items: Item[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      items = Object.values(data) as Item[];
    } else {
      items = Array.isArray(data) ? data : [];
    }

    // 应用筛选条件
    let filteredItems = items;

    // 按类别筛选
    if (category) {
      filteredItems = filteredItems.filter(i => 
        i.Category && i.Category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // 按稀有度筛选
    if (rarity !== undefined) {
      filteredItems = filteredItems.filter(i => i.Rarity === rarity);
    }

    // 按标签筛选
    if (tags) {
      filteredItems = filteredItems.filter(i => 
        i.Tags && i.Tags.some(tag => 
          tag.toLowerCase().includes(tags.toLowerCase())
        )
      );
    }

    // 智能搜索
    if (search) {
      filteredItems = this.smartSearch(
        filteredItems, 
        search, 
        ['Name', 'Category', 'Tags', 'Description']
      );
    }

    // 限制结果数量
    const limitedItems = filteredItems.slice(0, limit);

    // 返回处理后的数据
    return limitedItems.map(item => this.simplifyItemData(item, detailed));
  }

  // 增强的家具查询方法 - 支持智能搜索和字段精简
  async getFurnitureEnhanced(options: {
    language?: string;
    search?: string;
    category?: string;
    type?: string;
    rarity?: number;
    tags?: string;
    limit?: number;
    detailed?: boolean;
  } = {}): Promise<any[]> {
    const {
      language = 'cn',
      search,
      category,
      type,
      rarity,
      tags,
      limit = 20,
      detailed = false
    } = options;

    const data = await this.fetchData(`${language}/furniture.json`);
    
    // 处理数据格式
    let furniture: Furniture[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      furniture = Object.values(data) as Furniture[];
    } else {
      furniture = Array.isArray(data) ? data : [];
    }

    // 应用筛选条件
    let filteredFurniture = furniture;

    // 按类别筛选
    if (category) {
      filteredFurniture = filteredFurniture.filter(f => 
        f.Category && f.Category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // 按类型筛选
    if (type) {
      filteredFurniture = filteredFurniture.filter(f => 
        f.Type && f.Type.toLowerCase().includes(type.toLowerCase())
      );
    }

    // 按稀有度筛选
    if (rarity !== undefined) {
      filteredFurniture = filteredFurniture.filter(f => f.Rarity === rarity);
    }

    // 按标签筛选
    if (tags) {
      filteredFurniture = filteredFurniture.filter(f => 
        f.Tags && f.Tags.some(tag => 
          tag.toLowerCase().includes(tags.toLowerCase())
        )
      );
    }

    // 智能搜索
    if (search) {
      filteredFurniture = this.smartSearch(
        filteredFurniture, 
        search, 
        ['Name', 'Category', 'Type', 'Tags', 'Description']
      );
    }

    // 限制结果数量
    const limitedFurniture = filteredFurniture.slice(0, limit);

    // 返回处理后的数据
    return limitedFurniture.map(furniture => this.simplifyFurnitureData(furniture, detailed));
  }

  // 增强的敌人查询方法 - 支持智能搜索和字段精简
  async getEnemiesEnhanced(options: {
    language?: string;
    search?: string;
    type?: string;
    rank?: string;
    armorType?: string;
    bulletType?: string;
    terrain?: string;
    limit?: number;
    detailed?: boolean;
  } = {}): Promise<any[]> {
    const {
      language = 'cn',
      search,
      type,
      rank,
      armorType,
      bulletType,
      terrain,
      limit = 20,
      detailed = false
    } = options;

    const data = await this.fetchData(`${language}/enemies.json`);
    
    // 处理数据格式
    let enemies: Enemy[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      enemies = Object.values(data) as Enemy[];
    } else {
      enemies = Array.isArray(data) ? data : [];
    }

    // 应用筛选条件
    let filteredEnemies = enemies;

    // 按类型筛选
    if (type) {
      filteredEnemies = filteredEnemies.filter(e => 
        e.Type && e.Type.toLowerCase().includes(type.toLowerCase())
      );
    }

    // 按等级筛选
    if (rank) {
      filteredEnemies = filteredEnemies.filter(e => 
        e.Rank && e.Rank.toLowerCase().includes(rank.toLowerCase())
      );
    }

    // 按护甲类型筛选
    if (armorType) {
      filteredEnemies = filteredEnemies.filter(e => 
        e.ArmorType && e.ArmorType.toLowerCase().includes(armorType.toLowerCase())
      );
    }

    // 按子弹类型筛选
    if (bulletType) {
      filteredEnemies = filteredEnemies.filter(e => 
        e.BulletType && e.BulletType.toLowerCase().includes(bulletType.toLowerCase())
      );
    }

    // 按地形筛选
    if (terrain) {
      filteredEnemies = filteredEnemies.filter(e => 
        e.Terrain && e.Terrain.some(t => 
          t.toLowerCase().includes(terrain.toLowerCase())
        )
      );
    }

    // 智能搜索
    if (search) {
      filteredEnemies = this.smartSearch(
        filteredEnemies, 
        search, 
        ['Name', 'Type', 'Rank', 'ArmorType', 'BulletType', 'WeaponType']
      );
    }

    // 限制结果数量
    const limitedEnemies = filteredEnemies.slice(0, limit);

    // 返回处理后的数据
    return limitedEnemies.map(e => this.simplifyEnemyData(e, detailed));
  }

  // 计算字符串相似度（Levenshtein距离）
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
    
    // 初始化第一行和第一列
    for (let i = 0; i <= str2.length; i++) {
      matrix[i]![0] = i;
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0]![j] = j;
    }
    
    // 填充矩阵
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!;
        } else {
          matrix[i]![j] = Math.min(
            matrix[i - 1]![j - 1]! + 1, // 替换
            matrix[i]![j - 1]! + 1,     // 插入
            matrix[i - 1]![j]! + 1      // 删除
          );
        }
      }
    }
    
    return matrix[str2.length]![str1.length]!;
  }

  // 查找角色变体 - 重构版本：基于原版角色名称的变体查找
  async findStudentVariants(name: string, language: string = 'cn', includeOriginal: boolean = true): Promise<any[]> {
    const students = await this.getStudents({ language, limit: 1000 });
    
    if (students.length === 0) {
      return [];
    }
    
    const variants: any[] = [];
    const searchName = name.toLowerCase().trim();
    
    // 第一步：检查搜索的是否为变体名称（包含括号）
    let baseCharacterName: string | null = null;
    let exactMatch: any = null;
    
    const variantPattern = /^(.+?)[（(](.+?)[）)]$/;
    const variantMatch = searchName.match(variantPattern);
    
    if (variantMatch) {
      // 搜索的是变体名称
      const extractedBaseName = variantMatch[1];
      baseCharacterName = extractedBaseName || null;
      
      // 首先添加搜索的变体本身（如果存在）
      for (const student of students) {
        const studentName = (student.Name || '').toLowerCase().trim();
        if (studentName === searchName) {
          variants.push({
            ...student,
            similarity: 1.0,
            variantType: 'searched_variant'
          });
          break;
        }
      }
      
      // 查找原版角色（如果存在）
      for (const student of students) {
        const studentName = (student.Name || '').toLowerCase().trim();
        if (studentName === extractedBaseName?.toLowerCase()) {
          if (includeOriginal) {
            variants.push({
              ...student,
              similarity: 0.98,
              variantType: 'base_character'
            });
          }
          break;
        }
      }
    } else {
      // 第二步：搜索的不是变体名称，尝试完全匹配查找基准角色
      for (const student of students) {
        const studentName = (student.Name || '').toLowerCase().trim();
        
        // 完全匹配 - 这是我们的基准角色
        if (studentName === searchName) {
          exactMatch = student;
          baseCharacterName = searchName;
          if (includeOriginal) {
            variants.push({
              ...student,
              similarity: 1.0,
              variantType: 'exact_match'
            });
          }
          break;
        }
      }
    }
    
    // 第三步：基于确定的原版角色名称，查找所有变体
    if (baseCharacterName) {
      const variantPattern = new RegExp(`^${this.escapeRegExp(baseCharacterName)}[（(](.+?)[）)]$`);
      
      for (const student of students) {
        const studentName = (student.Name || '').toLowerCase().trim();
        
        // 跳过已经添加的角色
        if (variants.some(v => v.Name === student.Name)) {
          continue;
        }
        
        // 查找变体：原版角色名称 + (变体后缀)
        const match = studentName.match(variantPattern);
        if (match) {
          variants.push({
            ...student,
            similarity: 0.95,
            variantType: 'variant',
            baseName: baseCharacterName,
            variantSuffix: match[1]
          });
        }
      }
    }
    
    // 第四步：如果没有找到任何匹配，进行严格的完全匹配搜索
    if (variants.length === 0) {
      for (const student of students) {
        const studentName = (student.Name || '').toLowerCase().trim();
        
        // 只进行完全匹配，不进行任何模糊匹配
        if (studentName === searchName) {
          variants.push({
            ...student,
            similarity: 1.0,
            variantType: 'exact_match'
          });
        }
      }
    }
    
    // 按相似度排序并过滤掉低相似度结果
    variants.sort((a, b) => b.similarity - a.similarity);
    
    // 只返回高相似度的结果（相似度 >= 0.9），避免低相似度的噪音
    return variants.filter(variant => variant.similarity >= 0.9);
  }

  // 辅助方法：转义正则表达式特殊字符
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 批量获取学生头像
  async getMultipleStudentAvatars(studentIds: number[], language: string = 'cn', avatarType: string = 'portrait'): Promise<any[]> {
    const results: any[] = [];
    
    for (const studentId of studentIds) {
      try {
        const students = await this.getStudents({ language, limit: 1000 });
        const targetStudent = students.find(s => s.Id === studentId);
        
        if (targetStudent) {
          // 构建头像URL，根据avatarType参数选择正确的路径
          const baseUrl = "https://schaledb.com/images/student";
          let avatarUrl: string;
          let typeName: string;
          
          switch (avatarType?.toLowerCase()) {
            case 'portrait':
              avatarUrl = `${baseUrl}/portrait/${studentId}.webp`;
              typeName = '全身立绘';
              break;
            case 'collection':
              avatarUrl = `${baseUrl}/collection/${studentId}.webp`;
              typeName = '收藏立绘';
              break;
            case 'icon':
              avatarUrl = `${baseUrl}/icon/${studentId}.webp`;
              typeName = '头像图标';
              break;
            case 'lobby':
              avatarUrl = `${baseUrl}/lobby/${studentId}.webp`;
              typeName = '大厅立绘';
              break;
            default:
              avatarUrl = `${baseUrl}/portrait/${studentId}.webp`;
              typeName = '全身立绘';
          }
          
          results.push({
            studentId,
            name: targetStudent.Name,
            url: avatarUrl,
            avatarType,
            typeName,
            success: true
          });
        } else {
          results.push({
            studentId,
            name: null,
            url: null,
            avatarType,
            typeName: null,
            success: false,
            error: '学生不存在'
          });
        }
      } catch (error) {
        results.push({
          studentId,
          name: null,
          url: null,
          avatarType,
          typeName: null,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    return results;
  }

  // 批量获取学生语音
  async getMultipleStudentVoices(studentIds: number[], language: string = 'cn', voiceType: string = 'all'): Promise<any[]> {
    const results: any[] = [];
    
    try {
      const voiceData = await this.getVoiceData(language);
      
      for (const studentId of studentIds) {
        try {
          const students = await this.getStudents({ language, limit: 1000 });
          const targetStudent = students.find(s => s.Id === studentId);
          
          if (targetStudent && voiceData && voiceData[studentId]) {
            const studentVoices = voiceData[studentId];
            let filteredVoices = studentVoices;
            
            // 根据语音类型筛选
            if (voiceType !== 'all') {
              // 语音数据是对象结构，需要按类型筛选
              filteredVoices = {};
              const voiceTypes = voiceType === 'all' ? 
                Object.keys(studentVoices) : 
                [voiceType].filter(type => studentVoices[type]);
              
              voiceTypes.forEach(type => {
                if (studentVoices[type]) {
                  filteredVoices[type] = studentVoices[type];
                }
              });
            }
            
            results.push({
              studentId,
              name: targetStudent.Name,
              voices: filteredVoices,
              voiceType,
              success: true
            });
          } else {
            results.push({
              studentId,
              name: targetStudent?.Name || null,
              voices: {},
              voiceType,
              success: false,
              error: targetStudent ? '语音数据不存在' : '学生不存在'
            });
          }
        } catch (error) {
          results.push({
            studentId,
            name: null,
            voices: {},
            voiceType,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }
    } catch (error) {
      // 如果获取语音数据失败，为所有学生返回错误
      for (const studentId of studentIds) {
        results.push({
          studentId,
          name: null,
          voices: [],
          voiceType,
          success: false,
          error: '无法获取语音数据'
        });
      }
    }
    
    return results;
  }
}

// MCP 服务器类
class BlueArchiveMCPServer {
  private server: Server;
  private client: SchaleDBClient;

  constructor() {
    this.client = new SchaleDBClient();
    this.server = new Server(
      {
        name: "blue-archive-mcp",
        title: "Blue Archive MCP Server",
        version: "1.7.3",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 获取学生列表
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
          {
            name: "get_students",
            description: "获取蔚蓝档案学生列表。支持多种筛选条件：按学校（如三一、格黑娜等）、星级（1-3星）、职业（坦克、治疗、输出等）筛选。支持名称搜索（中文、日文、英文均可）。可选择返回详细信息（包含属性、技能等）或简要信息（仅基本信息）。默认返回20个结果，可调整限制数量。",
            inputSchema: zodToJsonSchema(GetStudentsSchema) as ToolInput,
          },
          {
            name: "get_student_by_name",
            description: "通过学生名称精确查找特定学生信息。支持中文、日文、英文名称搜索，如'アル'、'阿露'、'Aru'等。可选择返回详细信息（包含完整属性、技能、装备数据）或简要信息（仅基本信息）。适用于已知学生名称的精确查询。",
            inputSchema: zodToJsonSchema(GetStudentByNameSchema) as ToolInput,
          },
          {
            name: "get_student_info",
            description: "通过学生ID获取完整的学生详细信息。返回包括基础属性、成长数值、技能详情、装备信息、好感度奖励、语音数据等全面信息。适用于需要获取学生完整数据的场景，如攻略制作、数据分析等。",
            inputSchema: zodToJsonSchema(GetStudentInfoSchema) as ToolInput,
          },
          {
            name: "get_raids",
            description: "获取总力战（Raid）信息。包含各个总力战Boss的基本信息、地形类型、推荐等级等。支持名称搜索功能，可选择返回详细信息（包含具体机制、弱点等）或简要信息。适用于总力战攻略查询和Boss信息查看。",
            inputSchema: zodToJsonSchema(GetRaidsSchema) as ToolInput,
          },
          {
            name: "get_equipment",
            description: "获取装备信息数据。支持按装备类别（如T1-T7装备）、等级筛选。可选择返回详细信息（包含装备效果、获取途径等）或简要信息。适用于装备查询、升级规划等场景。默认返回20个结果。",
            inputSchema: zodToJsonSchema(GetEquipmentSchema) as ToolInput,
          },
          {
            name: "get_game_config",
            description: "获取游戏配置和版本信息。包含当前游戏版本、服务器区域设置（国服、日服、国际服等）、数据更新时间等基础配置信息。适用于了解当前数据版本和服务器状态。",
            inputSchema: zodToJsonSchema(GetGameConfigSchema) as ToolInput,
          },
          {
            name: "get_stages",
            description: "获取关卡信息数据。支持按区域（如主线、活动等）、章节、难度筛选。支持关卡名称搜索。可选择返回详细信息（包含敌人配置、掉落物品、推荐等级等）或简要信息。适用于关卡攻略查询和掉落物查看。",
            inputSchema: zodToJsonSchema(GetStagesSchema) as ToolInput,
          },
          {
            name: "get_items",
            description: "获取游戏物品信息。支持按物品类别（如材料、消耗品等）、稀有度、标签筛选。支持物品名称搜索。可选择返回详细信息（包含获取途径、用途说明等）或简要信息。适用于物品查询和获取途径查看。",
            inputSchema: zodToJsonSchema(GetItemsSchema) as ToolInput,
          },
          {
            name: "get_furniture",
            description: "获取咖啡厅家具信息。支持按家具类别、类型、稀有度、标签筛选。支持家具名称搜索。可选择返回详细信息（包含舒适度加成、获取方式等）或简要信息。适用于咖啡厅装修规划和家具收集。",
            inputSchema: zodToJsonSchema(GetFurnitureSchema) as ToolInput,
          },
          {
            name: "get_enemies",
            description: "获取敌人信息数据。支持按敌人类型、等级、护甲类型（轻装甲、重装甲、特殊装甲）、子弹类型（爆发、贯通、神秘）、适应地形筛选。支持敌人名称搜索。可选择返回详细信息（包含技能、属性等）或简要信息。适用于战斗策略制定。",
            inputSchema: zodToJsonSchema(GetEnemiesSchema) as ToolInput,
          },
          {
            name: "get_student_avatar",
            description: "获取学生头像图片，支持多种头像类型。通过学生ID或名称查询，返回Markdown格式的图片链接。支持的头像类型：portrait（全身立绘，默认）、collection（收藏立绘）、icon（头像图标）、lobby（大厅立绘）。注意：不同服装的角色（如泳装、新春等）拥有独立的角色ID，需要先通过find_student_variants查找变体。",
            inputSchema: zodToJsonSchema(GetStudentAvatarSchema) as ToolInput,
          },
          // {
          //   name: "get_student_voice",
          //   description: "获取学生语音信息和音频链接。支持通过学生ID或名称查询不同类型的语音：normal（日常语音）、battle（战斗语音）、lobby（大厅语音）、event（活动语音）、all（全部语音，默认）。支持text（纯文本）和markdown（包含音频播放链接）两种输出格式。Markdown格式可在支持的环境中直接播放音频。",
          //   inputSchema: zodToJsonSchema(GetStudentVoiceSchema) as ToolInput,
          // },
          {
            name: "find_student_variants",
            description: "查找角色的所有变体版本（如泳装、新春、兔女郎等不同服装）。基于名称相似度智能匹配，帮助快速发现一个角色的所有变体形态。支持中文、日文、英文名称搜索，如输入'アル'可找到'アル'、'アル（正月）'等所有变体。返回变体列表及相似度评分。",
            inputSchema: zodToJsonSchema(FindStudentVariantsSchema) as ToolInput,
          },
          {
            name: "get_multiple_student_avatars",
            description: "批量获取多个学生的头像图片，提高查询效率。通过学生ID数组一次性获取多个角色的头像，避免多次单独调用。支持所有头像类型（portrait、collection、icon、lobby），返回Markdown格式的图片展示。适用于制作角色对比、团队展示等场景。",
            inputSchema: zodToJsonSchema(GetMultipleStudentAvatarsSchema) as ToolInput,
          },
          // {
          //   name: "get_multiple_student_voices",
          //   description: "批量获取多个学生的语音信息，提高查询效率。通过学生ID数组一次性获取多个角色的语音数据，避免多次单独调用。支持所有语音类型和text、markdown两种输出格式。适用于制作语音合集、角色对比等场景。",
          //   inputSchema: zodToJsonSchema(GetMultipleStudentVoicesSchema) as ToolInput,
          // }
        ];

      return { tools };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_students": {
            const validatedArgs = GetStudentsSchema.parse(args);
            return await this.handleGetStudents(validatedArgs);
          }
          case "get_student_by_name": {
            const validatedArgs = GetStudentByNameSchema.parse(args);
            return await this.handleGetStudentByName(validatedArgs);
          }
          case "get_student_info": {
            const validatedArgs = GetStudentInfoSchema.parse(args);
            return await this.handleGetStudentInfo(validatedArgs);
          }
          case "get_raids": {
            const validatedArgs = GetRaidsSchema.parse(args);
            return await this.handleGetRaids(validatedArgs);
          }
          case "get_equipment": {
            const validatedArgs = GetEquipmentSchema.parse(args);
            return await this.handleGetEquipment(validatedArgs);
          }
          case "get_game_config": {
            const validatedArgs = GetGameConfigSchema.parse(args);
            return await this.handleGetGameConfig(validatedArgs);
          }
          case 'get_stages': {
            const validatedArgs = GetStagesSchema.parse(args);
            return await this.handleGetStages(validatedArgs);
          }
          case 'get_items': {
            const validatedArgs = GetItemsSchema.parse(args);
            return await this.handleGetItems(validatedArgs);
          }
          case 'get_furniture': {
            const validatedArgs = GetFurnitureSchema.parse(args);
            return await this.handleGetFurniture(validatedArgs);
          }
          case 'get_enemies': {
            const validatedArgs = GetEnemiesSchema.parse(args);
            return await this.handleGetEnemies(validatedArgs);
          }
          case 'get_student_avatar': {
            const validatedArgs = GetStudentAvatarSchema.parse(args);
            return await this.handleGetStudentAvatar(validatedArgs);
          }
          // case 'get_student_voice': {
          //   const validatedArgs = GetStudentVoiceSchema.parse(args);
          //   return await this.handleGetStudentVoice(validatedArgs);
          // }
          case 'find_student_variants': {
            const validatedArgs = FindStudentVariantsSchema.parse(args);
            return await this.handleFindStudentVariants(validatedArgs);
          }
          case 'get_multiple_student_avatars': {
            const validatedArgs = GetMultipleStudentAvatarsSchema.parse(args);
            return await this.handleGetMultipleStudentAvatars(validatedArgs);
          }
          // case 'get_multiple_student_voices': {
          //   const validatedArgs = GetMultipleStudentVoicesSchema.parse(args);
          //   return await this.handleGetMultipleStudentVoices(validatedArgs);
          // }
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${error.message}`
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error}`
        );
      }
    });
  }

  private async handleGetStudents(args: any) {
    const {
      language,
      search,
      limit,
      detailed,
      school,
      starGrade,
      role
    } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedLimit = ParameterHandler.normalizeLimit(limit, 20);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);

    // 使用增强的方法
    const students = await this.client.getStudents({
      language: normalizedLanguage,
      search,
      limit: normalizedLimit,
      detailed: normalizedDetailed,
      school,
      starGrade,
      role
    });

    if (students.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "未找到符合条件的学生"
          }
        ]
      };
    }

    let result: string;
    if (detailed) {
      // 详细模式 - 显示完整信息
      result = students.map(student => {
        return `ID: ${student.Id}
名称: ${student.Name}
学校: ${student.School || '未知'}
星级: ${student.StarGrade || '未知'}
职业: ${student.TacticRole || '未知'}
武器: ${student.WeaponType || '未知'}
护甲: ${student.ArmorType || '未知'}
---`;
      }).join('\n');
    } else {
      // 简要模式 - 只显示核心信息
      result = students.map(student => 
        `${student.Name} (${student.School}) - ${student.TacticRole} - ⭐${student.StarGrade}`
      ).join('\n');
    }

    return {
      content: [
        {
          type: "text",
          text: `找到 ${students.length} 个学生：\n\n${result}`
        }
      ]
    };
  }

  private async handleGetStudentByName(args: any) {
    const { name, language, detailed } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);

    const student = await this.client.getStudentByName(name, normalizedLanguage, normalizedDetailed);

    if (!student) {
      return {
        content: [
          {
            type: "text",
            text: `未找到名称包含 "${name}" 的学生`
          }
        ]
      };
    }

    let info: string;
    if (normalizedDetailed) {
      info = `
学生ID: ${student.Id}
名称: ${student.Name}
学校: ${student.School || '未知'}
社团: ${student.Club || '未知'}
星级: ${student.StarGrade || '未知'}
队伍类型: ${student.SquadType || '未知'}
战术位置: ${student.TacticRole || '未知'}
职业: ${student.Position || '未知'}
主武器: ${student.WeaponType || '未知'}
护甲类型: ${student.ArmorType || '未知'}
弹药类型: ${student.BulletType || '未知'}
      `.trim();
    } else {
      info = `${student.Name} (${student.School}) - ${student.TacticRole} - ⭐${student.StarGrade}`;
    }

    return {
      content: [
        {
          type: "text",
          text: info
        }
      ]
    };
  }

  private async handleGetStudentInfo(args: any) {
    const { studentId, language } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);

    const students = await this.client.getStudents({ language: normalizedLanguage });
    const student = students.find(s => s.Id === studentId);

    if (!student) {
      return {
        content: [
          {
            type: "text",
            text: `未找到ID为 ${studentId} 的学生`
          }
        ]
      };
    }

    // 使用 simplifyStudentData 方法获取详细信息
    const detailedInfo = this.client.simplifyStudentData(student, true);
    
    return {
      content: [
        {
          type: "text",
          text: `学生详细信息：
ID: ${detailedInfo.Id}
名称: ${detailedInfo.Name}
学校: ${detailedInfo.School || '未知'}
社团: ${detailedInfo.Club || '未知'}
星级: ${detailedInfo.StarGrade || '未知'}
职业: ${detailedInfo.TacticRole || '未知'}
武器: ${detailedInfo.WeaponType || '未知'}
护甲: ${detailedInfo.ArmorType || '未知'}`
        }
      ]
    };
  }

  private async handleGetRaids(args: any) {
    const { language, search, detailed } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);

    let raids: any[];
    if (normalizedDetailed) {
      raids = await this.client.getRaids(normalizedLanguage);
    } else {
      raids = await this.client.getRaidsEnhanced(normalizedLanguage, false);
    }

    let filteredRaids = raids;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRaids = raids.filter(raid =>
        raid.Name?.toLowerCase().includes(searchLower)
      );
    }

    if (filteredRaids.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "未找到符合条件的团队战"
          }
        ]
      };
    }

    let result: string;
    if (detailed) {
      result = filteredRaids.map(raid => {
        return `ID: ${raid.Id}
名称: ${raid.Name || '未知'}
等级: ${raid.Level || '未知'}
地形: ${raid.Terrain || '未知'}
基础智力: ${raid.BaseIntelligence || '未知'}
---`;
      }).join('\n');
    } else {
      result = filteredRaids.map(raid =>
        `${raid.Name || '未知'} (ID: ${raid.Id}) - 等级 ${raid.Level || '未知'} - ${raid.Terrain || '未知地形'}`
      ).join('\n');
    }

    return {
      content: [
        {
          type: "text",
          text: `找到 ${filteredRaids.length} 个团队战：\n\n${result}`
        }
      ]
    };
  }

  private async handleGetEquipment(args: any) {
    const { language, category, tier, limit, detailed } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedLimit = ParameterHandler.normalizeLimit(limit, 20);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);

    const allEquipment = await this.client.getEquipment(normalizedLanguage);
    let filteredEquipment = allEquipment;

    // 按类别过滤
    if (category) {
      const categoryLower = category.toLowerCase();
      filteredEquipment = filteredEquipment.filter(eq =>
        eq.Category?.toLowerCase().includes(categoryLower)
      );
    }

    // 按等级过滤
    if (tier) {
      filteredEquipment = filteredEquipment.filter(eq => eq.Tier === tier);
    }

    if (filteredEquipment.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "未找到符合条件的装备"
          }
        ]
      };
    }

    // 限制返回数量
    const limitedEquipment = filteredEquipment.slice(0, normalizedLimit);

    // 应用数据精简
    const processedEquipment = limitedEquipment.map(eq => 
      this.client['simplifyEquipmentData'](eq, normalizedDetailed)
    );

    let result: string;
    if (normalizedDetailed) {
      result = processedEquipment.map(eq => {
        return `ID: ${eq.Id}
名称: ${eq.Name || '未知'}
等级: T${eq.Tier || '未知'}
类别: ${eq.Category || '未知'}
描述: ${eq.Description || '无描述'}
---`;
      }).join('\n');
    } else {
      result = processedEquipment.map(eq =>
        `${eq.Name || '未知'} (T${eq.Tier || '?'}) - ${eq.Category || '未知类别'}`
      ).join('\n');
    }

    const totalCount = filteredEquipment.length;
    const displayCount = processedEquipment.length;
    const countInfo = totalCount > displayCount ? 
      `显示 ${displayCount}/${totalCount} 个装备：` : 
      `找到 ${displayCount} 个装备：`;

    return {
      content: [
        {
          type: "text",
          text: `${countInfo}\n\n${result}`
        }
      ]
    };
  }

  private async handleGetGameConfig(args: any) {
    const config = await this.client.getConfig();

    const info = `
游戏构建版本: ${config.build || '未知'}
地区: ${config.region || '未知'}
    `.trim();

    return {
      content: [
        {
          type: "text",
          text: info
        }
      ]
    };
  }

  private async handleGetStages(args: any) {
    const {
      language,
      search,
      area,
      chapter,
      difficulty,
      limit,
      detailed
    } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedLimit = ParameterHandler.normalizeLimit(limit, 20);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);

    const processedStages = await this.client.getStagesEnhanced({
      language: normalizedLanguage,
      search,
      area,
      chapter,
      difficulty,
      limit: normalizedLimit,
      detailed: normalizedDetailed
    });

    if (processedStages.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "未找到符合条件的关卡。"
          }
        ]
      };
    }

    let result = '';
    processedStages.forEach((stage, index) => {
      result += `${index + 1}. ${stage.Name || '未知关卡'}\n`;
      if (stage.Area) result += `   区域: ${stage.Area}\n`;
      if (stage.Chapter) result += `   章节: ${stage.Chapter}\n`;
      if (stage.Difficulty) result += `   难度: ${stage.Difficulty}\n`;
      if (stage.StageNumber) result += `   关卡编号: ${stage.StageNumber}\n`;
      if (stage.APCost) result += `   AP消耗: ${stage.APCost}\n`;
      if (stage.Terrain) result += `   地形: ${stage.Terrain}\n`;
      if (stage.RecommendLevel) result += `   推荐等级: ${stage.RecommendLevel}\n`;
      
      if (normalizedDetailed && stage.DropList && stage.DropList.length > 0) {
        result += `   掉落物品: ${stage.DropList.map((drop: any) => drop.Name || drop.Id).join(', ')}\n`;
      }
      
      if (normalizedDetailed && stage.EnemyList && stage.EnemyList.length > 0) {
        result += `   敌人列表: ${stage.EnemyList.map((enemy: any) => enemy.Name || enemy.Id).join(', ')}\n`;
      }
      
      result += '\n';
    });

    return {
      content: [
        {
          type: "text",
          text: `找到 ${processedStages.length} 个关卡：\n\n${result}`
        }
      ]
    };
  }

  private async handleGetItems(args: any) {
    const { language, search, category, rarity, tags, limit, detailed } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedLimit = ParameterHandler.normalizeLimit(limit, 20);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);
    
    const processedItems = await this.client.getItemsEnhanced({
      language: normalizedLanguage,
      search,
      category,
      rarity,
      tags,
      limit: normalizedLimit,
      detailed: normalizedDetailed
    });

    let result = '';
    processedItems.forEach((item, index) => {
      result += `${index + 1}. ${item.Name || '未知物品'}\n`;
      result += `   ID: ${item.Id || 'N/A'}\n`;
      result += `   类别: ${item.Category || 'N/A'}\n`;
      result += `   稀有度: ${item.Rarity !== undefined ? item.Rarity : 'N/A'}\n`;
      
      if (normalizedDetailed) {
        if (item.Tags && item.Tags.length > 0) {
          result += `   标签: ${item.Tags.join(', ')}\n`;
        }
        if (item.Description) {
          result += `   描述: ${item.Description}\n`;
        }
        if (item.Sources && item.Sources.length > 0) {
          result += `   获取方式: ${item.Sources.join(', ')}\n`;
        }
        if (item.ShopInfo && item.ShopInfo.length > 0) {
          result += `   商店信息: ${item.ShopInfo.length} 个商店有售\n`;
        }
      }
      
      result += '\n';
    });

    return {
      content: [
        {
          type: "text",
          text: `找到 ${processedItems.length} 个物品：\n\n${result}`
        }
      ]
    };
  }

  private async handleGetFurniture(args: any) {
    const { language, search, category, type, rarity, tags, limit, detailed } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedLimit = ParameterHandler.normalizeLimit(limit);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);
    
    const processedFurniture = await this.client.getFurnitureEnhanced({
      language: normalizedLanguage,
      search,
      category,
      type,
      rarity,
      tags,
      limit: normalizedLimit,
      detailed: normalizedDetailed
    });
    
    let result = '';
    processedFurniture.forEach((furniture, index) => {
      result += `${index + 1}. ${furniture.Name || '未知家具'}\n`;
      result += `   ID: ${furniture.Id || 'N/A'}\n`;
      result += `   类别: ${furniture.Category || 'N/A'}\n`;
      result += `   类型: ${furniture.Type || 'N/A'}\n`;
      result += `   稀有度: ${furniture.Rarity || 'N/A'}\n`;
      result += `   舒适度加成: ${furniture.ComfortBonus || 0}\n`;
      
      if (normalizedDetailed) {
        if (furniture.Tags && furniture.Tags.length > 0) {
          result += `   标签: ${furniture.Tags.join(', ')}\n`;
        }
        if (furniture.Description) {
          result += `   描述: ${furniture.Description}\n`;
        }
        if (furniture.Size) {
          result += `   尺寸: ${furniture.Size}\n`;
        }
        if (furniture.ShopInfo && furniture.ShopInfo.length > 0) {
          result += `   商店信息: ${furniture.ShopInfo.length} 个商店有售\n`;
        }
      }
      
      result += '\n';
    });

    return {
      content: [
        {
          type: "text",
          text: `找到 ${processedFurniture.length} 个家具：\n\n${result}`
        }
      ]
    };
  }

  private async handleGetEnemies(args: any) {
    const {
      language,
      search,
      type,
      rank,
      armorType,
      bulletType,
      terrain,
      limit,
      detailed
    } = args;

    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedLimit = ParameterHandler.normalizeLimit(limit, 20);
    const normalizedDetailed = ParameterHandler.normalizeDetailed(detailed);

    const enemies = await this.client.getEnemiesEnhanced({
      language: normalizedLanguage,
      search,
      type,
      rank,
      armorType,
      bulletType,
      terrain,
      limit: normalizedLimit,
      detailed: normalizedDetailed
    });

    let content = `找到 ${enemies.length} 个敌人：\n\n`;
    
    enemies.forEach((enemy, index) => {
      content += `${index + 1}. ${enemy.Name || '未知敌人'}\n`;
      content += `   ID: ${enemy.Id || 'N/A'}\n`;
      content += `   类型: ${enemy.Type || 'N/A'}\n`;
      content += `   等级: ${enemy.Rank || 'N/A'}\n`;
      content += `   护甲类型: ${enemy.ArmorType || 'N/A'}\n`;
      content += `   子弹类型: ${enemy.BulletType || 'N/A'}\n`;
      content += `   等级: ${enemy.Level || 'N/A'}\n`;
      
      if (detailed) {
        content += `   攻击类型: ${enemy.AttackType || 'N/A'}\n`;
        content += `   防御类型: ${enemy.DefenseType || 'N/A'}\n`;
        content += `   生命值: ${enemy.HP || 'N/A'}\n`;
        content += `   攻击力: ${enemy.Attack || 'N/A'}\n`;
        content += `   防御力: ${enemy.Defense || 'N/A'}\n`;
        content += `   命中率: ${enemy.Accuracy || 'N/A'}\n`;
        content += `   闪避率: ${enemy.Evasion || 'N/A'}\n`;
        content += `   暴击率: ${enemy.CriticalRate || 'N/A'}\n`;
        content += `   暴击伤害: ${enemy.CriticalDamage || 'N/A'}\n`;
        content += `   稳定率: ${enemy.StabilityRate || 'N/A'}\n`;
        content += `   稳定点: ${enemy.StabilityPoint || 'N/A'}\n`;
        content += `   射程: ${enemy.Range || 'N/A'}\n`;
        content += `   移动速度: ${enemy.MoveSpeed || 'N/A'}\n`;
        content += `   弹药数量: ${enemy.AmmoCount || 'N/A'}\n`;
        content += `   弹药消耗: ${enemy.AmmoCost || 'N/A'}\n`;
        content += `   再生消耗: ${enemy.RegenCost || 'N/A'}\n`;
        content += `   武器类型: ${enemy.WeaponType || 'N/A'}\n`;
        if (enemy.Terrain && Array.isArray(enemy.Terrain)) {
          content += `   适应地形: ${enemy.Terrain.join(', ')}\n`;
        }
        if (enemy.Skills && Array.isArray(enemy.Skills) && enemy.Skills.length > 0) {
          content += `   技能数量: ${enemy.Skills.length}\n`;
        }
      }
      
      content += '\n';
    });

    return {
      content: [
        {
          type: "text",
          text: content
        }
      ]
    };
  }

  private async handleGetStudentAvatar(args: any) {
    const { studentId, name, language, avatarType, format } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedFormat = ParameterHandler.normalizeFormat(format, 'markdown');
    
    // 如果提供了学生ID，直接使用
    let targetStudentId = studentId;
    
    // 如果没有提供学生ID但提供了名称，先查找学生
    if (!targetStudentId && name) {
      const student = await this.client.getStudentByName(name, normalizedLanguage);
      if (!student) {
        return {
          content: [
            {
              type: "text",
              text: `未找到名为 "${name}" 的学生`
            }
          ]
        };
      }
      targetStudentId = student.Id;
    }
    
    if (!targetStudentId) {
      return {
        content: [
          {
            type: "text",
            text: "请提供学生ID或学生名称"
          }
        ]
      };
    }
    
    try {
      // 构建头像URL（基于第三方API的URL模式）
      const baseUrl = "https://schaledb.com/images/student";
      let avatarUrl: string;
      
      switch (avatarType?.toLowerCase()) {
        case 'portrait':
          avatarUrl = `${baseUrl}/portrait/${targetStudentId}.webp`;
          break;
        case 'collection':
          avatarUrl = `${baseUrl}/collection/${targetStudentId}.webp`;
          break;
        case 'icon':
          avatarUrl = `${baseUrl}/icon/${targetStudentId}.webp`;
          break;
        case 'lobby':
          avatarUrl = `${baseUrl}/lobby/${targetStudentId}.webp`;
          break;
        default:
          avatarUrl = `${baseUrl}/portrait/${targetStudentId}.webp`;
      }
      
      // 获取学生信息以显示名称
      const student = await this.client.getStudentByName(name || targetStudentId.toString(), normalizedLanguage);
      const studentName = student?.Name || `学生 ${targetStudentId}`;
      
      // 头像类型中文名称映射
      const avatarTypeNames = {
        portrait: "肖像",
        collection: "收藏",
        icon: "图标", 
        lobby: "大厅立绘"
      };
      
      const typeName = avatarTypeNames[(avatarType?.toLowerCase() || 'portrait') as keyof typeof avatarTypeNames] || avatarType || 'portrait';
      
      // 只支持markdown格式输出
      return {
        content: [
          {
            type: "text",
            text: `![${studentName}的${typeName}](${avatarUrl})`
          }
        ]
      };
    } catch (error) {
      return ErrorHandler.createErrorResponse(error, "获取头像时出错");
    }
  }

  private async handleGetStudentVoice(args: any) {
    const { studentId, name, language, voiceType, format } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedFormat = ParameterHandler.normalizeFormat(format, 'text');
    
    // 如果提供了学生ID，直接使用
    let targetStudentId = studentId;
    
    // 如果没有提供学生ID但提供了名称，先查找学生
    if (!targetStudentId && name) {
      const student = await this.client.getStudentByName(name, normalizedLanguage);
      if (!student) {
        return {
          content: [
            {
              type: "text",
              text: `未找到名为 "${name}" 的学生`
            }
          ]
        };
      }
      targetStudentId = student.Id;
    }
    
    if (!targetStudentId) {
      return {
        content: [
          {
            type: "text",
            text: "请提供学生ID或学生名称"
          }
        ]
      };
    }
    
    try {
      // 获取语音数据
      const voiceData = await this.client.getVoiceData(normalizedLanguage);
      const studentVoices = voiceData[targetStudentId];
      
      if (!studentVoices) {
        return {
          content: [
            {
              type: "text",
              text: `未找到学生 ${targetStudentId} 的语音数据`
            }
          ]
        };
      }
      
      // 获取学生信息以显示名称
      const student = await this.client.getStudentByName(name || targetStudentId.toString(), normalizedLanguage);
      const studentName = student?.Name || `学生 ${targetStudentId}`;
      
      // 根据voiceType筛选语音类型，注意API返回的键名是首字母大写的
      let voiceTypes: string[];
      if (voiceType === 'all') {
        voiceTypes = Object.keys(studentVoices);
      } else {
        // 尝试匹配语音类型，考虑大小写不敏感
        const normalizedVoiceType = voiceType.toLowerCase();
        const availableTypes = Object.keys(studentVoices);
        
        // 首先尝试精确匹配（忽略大小写）
        const exactMatch = availableTypes.find(type => 
          type.toLowerCase() === normalizedVoiceType
        );
        
        if (exactMatch) {
          voiceTypes = [exactMatch];
        } else {
          // 然后尝试部分匹配
          const partialMatch = availableTypes.find(type => 
            type.toLowerCase().includes(normalizedVoiceType) ||
            normalizedVoiceType.includes(type.toLowerCase())
          );
          
          if (partialMatch) {
            voiceTypes = [partialMatch];
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `未找到类型为 "${voiceType}" 的语音数据。可用类型: ${availableTypes.join(', ')}`
                }
              ]
            };
          }
        }
      }
      
      if (voiceTypes.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `未找到任何语音数据`
            }
          ]
        };
      }
      
      // 根据格式返回结果
      if (normalizedFormat === 'markdown' || normalizedFormat === 'md') {
        let result = `# ${studentName} 的语音信息\n\n`;
        
        voiceTypes.forEach(type => {
          const voices = studentVoices[type];
          if (Array.isArray(voices) && voices.length > 0) {
            result += `## ${type.toUpperCase()} 语音 (${voices.length}条)\n\n`;
            
            voices.forEach((voice, index) => {
              if (voice && typeof voice === 'object') {
                const group = voice.Group || `${type}_${index + 1}`;
                const audioClip = voice.AudioClip;
                const transcription = voice.Transcription || '';
                
                if (audioClip) {
                  // 构建完整的音频URL
                  const audioUrl = `https://schaledb.com/audio/${audioClip}`;
                  
                  result += `### ${group}\n\n`;
                  
                  // 添加多种音频链接格式以提高兼容性
                  result += `**🎵 音频播放选项:**\n`;
                  result += `- [直接播放链接](${audioUrl})\n`;
                  result += `- <audio controls preload="none"><source src="${audioUrl}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>\n`;
                  
                  // 如果有转录文本，显示出来
                  if (transcription) {
                    result += `\n**📝 转录文本:** ${transcription}\n`;
                  }
                  
                  result += '\n---\n\n';
                } else {
                  // 如果没有AudioClip，显示可用信息和调试信息
                  result += `### ${group}\n`;
                  if (transcription) {
                    result += `**📝 文本:** ${transcription}\n`;
                  } else {
                    // 显示调试信息以了解数据结构
                    result += `**🔍 调试信息:**\n`;
                    result += `- 数据类型: ${typeof voice}\n`;
                    result += `- 可用字段: ${Object.keys(voice).join(', ')}\n`;
                    if (voice.AudioClip !== undefined) {
                      result += `- AudioClip: ${voice.AudioClip}\n`;
                    }
                    if (voice.Transcription !== undefined) {
                      result += `- Transcription: ${voice.Transcription}\n`;
                    }
                    result += `- 完整数据: ${JSON.stringify(voice, null, 2)}\n`;
                  }
                  result += '\n';
                }
              } else {
                // 处理非对象类型的语音数据
                result += `### ${type}_${index + 1}\n`;
                result += `**🔍 调试信息:** 数据类型为 ${typeof voice}, 值: ${JSON.stringify(voice, null, 2)}\n\n`;
              }
            });
          } else if (voices && typeof voices === 'object') {
            // 处理非数组格式的语音数据（向后兼容）
            result += `## ${type.toUpperCase()} 语音\n\n`;
            Object.keys(voices).forEach(voiceKey => {
              const voiceValue = voices[voiceKey];
              if (typeof voiceValue === 'object' && voiceValue !== null) {
                if (voiceValue.AudioClip) {
                  const audioUrl = `https://schaledb.com/audio/${voiceValue.AudioClip}`;
                  result += `### ${voiceKey}\n`;
                  result += `- [🎵 播放音频](${audioUrl})\n`;
                  result += `- <audio controls preload="none"><source src="${audioUrl}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>\n`;
                  if (voiceValue.Transcription) {
                    result += `- **转录:** ${voiceValue.Transcription}\n`;
                  }
                  result += '\n';
                } else {
                  // 显示调试信息而不是"[复杂数据对象]"
                  result += `- **${voiceKey}**: [调试] 类型:${typeof voiceValue}, 字段:${Object.keys(voiceValue).join(',')}\n`;
                }
              } else {
                result += `- **${voiceKey}**: ${voiceValue}\n`;
              }
            });
            result += '\n';
          } else {
            // 如果该类型没有语音数据
            result += `## ${type.toUpperCase()} 语音 (0条)\n\n*该类型暂无语音数据*\n\n`;
          }
        });
        
        result += '\n**💡 使用提示:**\n';
        result += '- 点击"直接播放链接"在新窗口中播放音频\n';
        result += '- 使用HTML5音频控件进行内嵌播放\n';
        result += '- 如果无法播放，请检查网络连接或尝试其他播放方式\n';
        result += '- 音频文件来源：SchaleDB官方数据库';
        
        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      }
      
      // 默认返回文本格式（保持向后兼容）
      let result = `${studentName} 的语音信息：\n\n`;
      
      voiceTypes.forEach(type => {
        const voices = studentVoices[type];
        if (Array.isArray(voices) && voices.length > 0) {
          result += `${type.toUpperCase()} 语音 (${voices.length}条)：\n`;
          voices.forEach((voice, index) => {
            if (voice && typeof voice === 'object') {
              const group = voice.Group || `${type}_${index + 1}`;
              const audioClip = voice.AudioClip;
              const transcription = voice.Transcription || '';
              
              if (audioClip) {
                const audioUrl = `https://schaledb.com/audio/${audioClip}`;
                result += `  - ${group}: 🎵 ${audioUrl}`;
                if (transcription) {
                  result += ` | 📝 ${transcription}`;
                }
                result += '\n';
              } else if (transcription) {
                result += `  - ${group}: 📝 ${transcription}\n`;
              } else {
                // 显示调试信息而不是"[复杂数据对象]"
                result += `  - ${group}: [调试] 类型:${typeof voice}, 字段:${Object.keys(voice).join(',')}\n`;
              }
            } else {
              result += `  - ${type}_${index + 1}: ${JSON.stringify(voice, null, 2)}\n`;
            }
          });
          result += '\n';
        } else if (voices && typeof voices === 'object') {
          result += `${type.toUpperCase()} 语音：\n`;
          Object.keys(voices).forEach(voiceKey => {
            const voiceValue = voices[voiceKey];
            // 格式化语音数据显示
            if (typeof voiceValue === 'object' && voiceValue !== null) {
              // 如果是对象，尝试提取有用信息
              if (voiceValue.AudioClip) {
                const audioUrl = `https://schaledb.com/audio/${voiceValue.AudioClip}`;
                result += `  - ${voiceKey}: 🎵 ${audioUrl}`;
                if (voiceValue.Transcription) {
                  result += ` | 📝 ${voiceValue.Transcription}`;
                }
                result += '\n';
              } else if (voiceValue.Transcription) {
                result += `  - ${voiceKey}: 📝 ${voiceValue.Transcription}\n`;
              } else if (voiceValue.text || voiceValue.content) {
                result += `  - ${voiceKey}: ${voiceValue.text || voiceValue.content}\n`;
              } else if (voiceValue.url || voiceValue.file) {
                result += `  - ${voiceKey}: ${voiceValue.url || voiceValue.file}\n`;
              } else {
                // 显示调试信息而不是"[复杂数据对象]"
                result += `  - ${voiceKey}: [调试] 类型:${typeof voiceValue}, 字段:${Object.keys(voiceValue).join(',')}\n`;
              }
            } else {
              // 如果是简单值，直接显示
              result += `  - ${voiceKey}: ${typeof voiceValue === 'object' ? JSON.stringify(voiceValue, null, 2) : voiceValue}\n`;
            }
          });
          result += '\n';
        } else {
          result += `${type.toUpperCase()} 语音 (0条)：\n  暂无语音数据\n\n`;
        }
      });
      
      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return ErrorHandler.createErrorResponse(error, "获取语音数据时出错");
    }
  }

  // 新增的处理函数
  private async handleFindStudentVariants(args: any) {
    const { name, language, includeOriginal, format } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedFormat = ParameterHandler.normalizeFormat(format, 'text');

    try {
      const variants = await this.client.findStudentVariants(name, normalizedLanguage, includeOriginal);
      
      if (variants.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `未找到名为 "${name}" 的角色变体`
            }
          ]
        };
      }

      let result: string;
      // 根据格式返回结果
      if (normalizedFormat === 'markdown' || normalizedFormat === 'md') {
        result = `# ${name} 的角色变体\n\n`;
        result += variants.map(variant => 
          `- **${variant.名称 || variant.Name}** (ID: ${variant.Id})`
        ).join('\n');
      } else {
        result = `${name} 的角色变体：\n\n`;
        result += variants.map(variant => 
          `${variant.名称 || variant.Name} (ID: ${variant.Id})`
        ).join('\n');
      }

      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return ErrorHandler.createErrorResponse(error, "查找角色变体时出错");
    }
  }

  private async handleGetMultipleStudentAvatars(args: any) {
    const { studentIds, language, avatarType, format } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedFormat = ParameterHandler.normalizeFormat(format, 'markdown');
    
    try {
      const avatars = await this.client.getMultipleStudentAvatars(studentIds, normalizedLanguage, avatarType);
      
      if (avatars.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "未找到任何头像"
            }
          ]
        };
      }

      let result: string;
      if (normalizedFormat === 'markdown' || normalizedFormat === 'md') {
        result = `# 学生头像合集\n\n`;
        result += avatars.map(avatar => 
          `## ${avatar.name}\n![${avatar.name}的${avatar.typeName}](${avatar.url})\n`
        ).join('\n');
      } else {
        result = `学生头像合集：\n\n`;
        result += avatars.map(avatar => 
          `${avatar.name}: ${avatar.url}`
        ).join('\n');
      }

      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return ErrorHandler.createErrorResponse(error, "获取头像时出错");
    }
  }

  private async handleGetMultipleStudentVoices(args: any) {
    const { studentIds, language, voiceType, format } = args;
    
    const normalizedLanguage = ParameterHandler.normalizeLanguage(language);
    const normalizedFormat = ParameterHandler.normalizeFormat(format, 'text');
    
    try {
      const voices = await this.client.getMultipleStudentVoices(studentIds, normalizedLanguage, voiceType);
      
      if (voices.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "未找到任何语音数据"
            }
          ]
        };
      }

      let result: string;
      if (normalizedFormat === 'markdown' || normalizedFormat === 'md') {
        result = `# 学生语音合集\n\n`;
        voices.forEach(voice => {
          result += `## ${voice.name}\n\n`;
          Object.entries(voice.voices).forEach(([type, voiceList]) => {
            result += `### ${type}\n`;
            (voiceList as any[]).forEach((v, index) => {
              result += `- **${v.Group || '默认'}**: [${v.TranscriptionCn || v.Transcription || '播放'}](${v.AudioClip})\n`;
            });
            result += '\n';
          });
        });
      } else {
        result = `学生语音合集：\n\n`;
        voices.forEach(voice => {
          result += `${voice.name}:\n`;
          Object.entries(voice.voices).forEach(([type, voiceList]) => {
            result += `  ${type}:\n`;
            (voiceList as any[]).forEach((v, index) => {
              result += `    ${v.Group || '默认'}: ${v.AudioClip}\n`;
            });
          });
          result += '\n';
        });
      }

      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return ErrorHandler.createErrorResponse(error, "获取语音数据时出错");
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Cleanup on exit
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
      await this.server.close();
      process.exit(0);
    });
    
    console.error("Blue Archive MCP Server running on stdio");
  }
}

// 导出BlueArchiveMCPServer类供外部使用
export { BlueArchiveMCPServer };

// 主函数
async function main() {
    const server = new BlueArchiveMCPServer();
    await server.run();
}

// 运行服务器 - 直接启动，不检查执行条件
main().catch((error) => {
    ErrorHandler.handleError(error, "服务器运行错误");
    process.exit(1);
});
