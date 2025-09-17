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
  Area?: string;
  Chapter?: string;
  Difficulty?: string;
  StageNumber?: string;
  APCost?: number;
  Terrain?: string;
  RecommendLevel?: number;
  DropList?: any[];
  EnemyList?: any[];
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
  private baseUrl = 'https://schaledb.com/data';
  private cache = new Cache<any>();

  private async fetchData(endpoint: string): Promise<any> {
    const cachedData = this.cache.get(endpoint);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(endpoint, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch ${endpoint}: ${error}`);
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
        // 部分字符匹配 - 低分
        else {
          let partialScore = 0;
          for (let i = 0; i < normalizedSearch.length; i++) {
            if (normalizedValue.includes(normalizedSearch[i])) {
              partialScore += 1;
            }
          }
          if (partialScore > normalizedSearch.length * 0.5) {
            score += partialScore;
          }
        }
      }
      
      if (score > 0) {
        results.push({ item, score });
      }
    }
    
    // 按分数排序，返回最相关的结果
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);
  }

  // 数据字段精简
  private simplifyStudentData(student: Student, detailed: boolean = false): any {
    if (detailed) {
      return student; // 返回完整数据
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

  private simplifyRaidData(raid: RaidInfo, detailed: boolean = false): any {
    if (detailed) {
      return raid;
    }
    
    return {
      Id: raid.Id,
      Name: raid.Name,
      Level: raid.Level,
      Terrain: raid.Terrain
    };
  }

  private simplifyEquipmentData(equipment: Equipment, detailed: boolean = false): any {
    if (detailed) {
      return equipment;
    }
    
    return {
      Id: equipment.Id,
      Name: equipment.Name,
      Tier: equipment.Tier,
      Category: equipment.Category
    };
  }

  private simplifyStageData(stage: Stage, detailed: boolean = false): any {
    if (detailed) {
      return stage;
    }
    
    return {
      Id: stage.Id,
      Name: stage.Name,
      Area: stage.Area,
      Chapter: stage.Chapter,
      Difficulty: stage.Difficulty,
      APCost: stage.APCost,
      RecommendLevel: stage.RecommendLevel
    };
  }

  private simplifyItemData(item: Item, detailed: boolean = false): any {
    if (detailed) {
      return item;
    }
    
    return {
      Id: item.Id,
      Name: item.Name,
      Category: item.Category,
      Rarity: item.Rarity,
      Tags: item.Tags,
      Icon: item.Icon
    };
  }

  private simplifyFurnitureData(furniture: Furniture, detailed: boolean = false): any {
    if (detailed) {
      return furniture;
    }
    
    return {
      Id: furniture.Id,
      Name: furniture.Name,
      Category: furniture.Category,
      Type: furniture.Type,
      Rarity: furniture.Rarity,
      ComfortBonus: furniture.ComfortBonus
    };
  }

  private simplifyEnemyData(enemy: Enemy, detailed: boolean = false): any {
    if (!detailed) {
      return {
        Id: enemy.Id,
        Name: enemy.Name,
        Type: enemy.Type,
        Rank: enemy.Rank,
        ArmorType: enemy.ArmorType,
        BulletType: enemy.BulletType,
        Level: enemy.Level
      };
    }
    return enemy;
  }

  // 增强的getStudents方法 - 支持智能搜索和字段精简
  async getStudentsEnhanced(options: {
    language?: string;
    search?: string;
    limit?: number;
    detailed?: boolean;
    school?: string;
    starGrade?: number;
    role?: string;
  } = {}): Promise<any[]> {
    const {
      language = 'cn',
      search,
      limit = 20,
      detailed = false,
      school,
      starGrade,
      role
    } = options;

    const suffix = '.json';
    const data = await this.fetchData(`${language}/students${suffix}`);
    
    // 处理数据格式：如果是对象，转换为数组
    let students: Student[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      students = Object.values(data) as Student[];
    } else {
      students = Array.isArray(data) ? data : [];
    }

    // 应用过滤条件
    let filteredStudents = students;

    // 按学校过滤
    if (school) {
      filteredStudents = filteredStudents.filter(s => 
        s.School && s.School.toLowerCase().includes(school.toLowerCase())
      );
    }

    // 按星级过滤
    if (starGrade) {
      filteredStudents = filteredStudents.filter(s => s.StarGrade === starGrade);
    }

    // 按职业过滤
    if (role) {
      filteredStudents = filteredStudents.filter(s => 
        s.TacticRole && s.TacticRole.toLowerCase().includes(role.toLowerCase())
      );
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

  // 新增：通过名称查询学生
  async getStudentByName(name: string, language: string = 'cn', detailed: boolean = false): Promise<any | null> {
    const students = await this.getStudentsEnhanced({ 
      language, 
      search: name, 
      limit: 1, 
      detailed 
    });
    
    return students.length > 0 ? students[0] : null;
  }

  async getStudents(language: string = 'cn', compressed: boolean = false): Promise<Student[]> {
    const suffix = compressed ? '.min.json' : '.json';
    const data = await this.fetchData(`${language}/students${suffix}`);
    
    // 处理数据格式：如果是对象，转换为数组
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // 如果数据是对象格式，将值转换为数组
      return Object.values(data) as Student[];
    }
    
    // 如果已经是数组，直接返回
    return Array.isArray(data) ? data : [];
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
    
    // 处理数据格式：如果是对象，转换为数组
    let stages: Stage[];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      stages = Object.values(data) as Stage[];
    } else {
      stages = Array.isArray(data) ? data : [];
    }

    // 应用筛选条件
    let filteredStages = stages;

    // 按区域筛选
    if (area) {
      filteredStages = filteredStages.filter(s => 
        s.Area && s.Area.toLowerCase().includes(area.toLowerCase())
      );
    }

    // 按章节筛选
    if (chapter) {
      filteredStages = filteredStages.filter(s => 
        s.Chapter && s.Chapter.toLowerCase().includes(chapter.toLowerCase())
      );
    }

    // 按难度筛选
    if (difficulty) {
      filteredStages = filteredStages.filter(s => 
        s.Difficulty && s.Difficulty.toLowerCase().includes(difficulty.toLowerCase())
      );
    }

    // 智能搜索
    if (search) {
      filteredStages = this.smartSearch(
        filteredStages, 
        search, 
        ['Name', 'Area', 'Chapter', 'Difficulty']
      );
    }

    // 限制结果数量
    const limitedStages = filteredStages.slice(0, limit);

    // 返回精简或详细数据
    return limitedStages.map(stage => this.simplifyStageData(stage, detailed));
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
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // 查找角色变体
  async findStudentVariants(name: string, language: string = 'cn', includeOriginal: boolean = true): Promise<any[]> {
    const students = await this.getStudentsEnhanced({ language, limit: 1000 });
    
    if (students.length === 0) {
      return [];
    }
    
    const variants: any[] = [];
    const searchName = name.toLowerCase().trim();
    
    for (const student of students) {
      const studentName = (student.Name || '').toLowerCase().trim();
      
      // 完全匹配
      if (studentName === searchName) {
        if (includeOriginal) {
          variants.push(student);
        }
        continue;
      }
      
      // 检查是否包含搜索名称（变体检测）
      if (studentName.includes(searchName) || searchName.includes(studentName)) {
        variants.push(student);
        continue;
      }
      
      // 使用编辑距离进行模糊匹配
      const distance = this.levenshteinDistance(studentName, searchName);
      const maxLength = Math.max(studentName.length, searchName.length);
      const similarity = 1 - (distance / maxLength);
      
      // 相似度阈值为0.6
      if (similarity >= 0.6) {
        variants.push(student);
      }
    }
    
    // 按相似度排序
    variants.sort((a, b) => {
      const aName = (a.Name || '').toLowerCase().trim();
      const bName = (b.Name || '').toLowerCase().trim();
      
      const aSimilarity = 1 - (this.levenshteinDistance(aName, searchName) / Math.max(aName.length, searchName.length));
      const bSimilarity = 1 - (this.levenshteinDistance(bName, searchName) / Math.max(bName.length, searchName.length));
      
      return bSimilarity - aSimilarity;
    });
    
    return variants;
  }

  // 批量获取学生头像
  async getMultipleStudentAvatars(studentIds: number[], language: string = 'cn', avatarType: string = 'portrait'): Promise<any[]> {
    const results: any[] = [];
    
    for (const studentId of studentIds) {
      try {
        const student = await this.getStudentsEnhanced({ language, limit: 1000 });
        const targetStudent = student.find(s => s.Id === studentId);
        
        if (targetStudent) {
          const avatarUrl = `https://schaledb.com/images/student/portrait/${studentId}.webp`;
          results.push({
            studentId,
            name: targetStudent.Name,
            avatarUrl,
            avatarType,
            success: true
          });
        } else {
          results.push({
            studentId,
            name: null,
            avatarUrl: null,
            avatarType,
            success: false,
            error: '学生不存在'
          });
        }
      } catch (error) {
        results.push({
          studentId,
          name: null,
          avatarUrl: null,
          avatarType,
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
          const student = await this.getStudentsEnhanced({ language, limit: 1000 });
          const targetStudent = student.find(s => s.Id === studentId);
          
          if (targetStudent && voiceData && voiceData[studentId]) {
            const studentVoices = voiceData[studentId];
            let filteredVoices = studentVoices;
            
            // 根据语音类型筛选
            if (voiceType !== 'all') {
              filteredVoices = studentVoices.filter((voice: any) => {
                const group = voice.Group?.toLowerCase() || '';
                return group.includes(voiceType.toLowerCase());
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
              voices: [],
              voiceType,
              success: false,
              error: targetStudent ? '语音数据不存在' : '学生不存在'
            });
          }
        } catch (error) {
          results.push({
            studentId,
            name: null,
            voices: [],
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
        version: "1.0.0",
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
            description: "获取学生列表，支持按语言和学生查找，现在支持智能搜索、过滤和数据精简",
            inputSchema: zodToJsonSchema(GetStudentsSchema) as ToolInput,
          },
          {
            name: "get_student_by_name",
            description: "通过名称直接查询学生信息，支持模糊匹配和多语言",
            inputSchema: zodToJsonSchema(GetStudentByNameSchema) as ToolInput,
          },
          {
            name: "get_student_info",
            description: "获取特定学生详细信息",
            inputSchema: zodToJsonSchema(GetStudentInfoSchema) as ToolInput,
          },
          {
            name: "get_raids",
            description: "获取团队战（RAID）信息，支持数据精简",
            inputSchema: zodToJsonSchema(GetRaidsSchema) as ToolInput,
          },
          {
            name: "get_equipment",
            description: "获取装备列表，支持数据精简",
            inputSchema: zodToJsonSchema(GetEquipmentSchema) as ToolInput,
          },
          {
            name: "get_game_config",
            description: "获取游戏配置信息",
            inputSchema: zodToJsonSchema(GetGameConfigSchema) as ToolInput,
          },
          {
            name: "get_stages",
            description: "获取关卡信息，支持按区域、章节、难度筛选和智能搜索",
            inputSchema: zodToJsonSchema(GetStagesSchema) as ToolInput,
          },
          {
            name: "get_items",
            description: "获取物品信息，支持按类别、稀有度、标签筛选和智能搜索",
            inputSchema: zodToJsonSchema(GetItemsSchema) as ToolInput,
          },
          {
            name: "get_furniture",
            description: "获取家具信息，支持按类别、类型、稀有度、标签筛选和智能搜索",
            inputSchema: zodToJsonSchema(GetFurnitureSchema) as ToolInput,
          },
          {
            name: "get_enemies",
            description: "获取敌人信息，支持按类型、等级、护甲类型、子弹类型、地形筛选和智能搜索",
            inputSchema: zodToJsonSchema(GetEnemiesSchema) as ToolInput,
          },
          {
            name: "get_student_avatar",
            description: "获取学生头像图片，支持通过学生ID或名称查询。现在仅支持Markdown格式输出，返回可直接在Markdown中显示的图片链接。支持多种头像类型：portrait（全身立绘）、collection（收藏）、icon（头像）、lobby（大厅立绘）。注意：不同服装的角色（如泳装、新春等）是不同的角色ID，而非不同的头像类型。LLM可以根据需要选择合适的头像类型。",
            inputSchema: zodToJsonSchema(GetStudentAvatarSchema) as ToolInput,
          },
          {
            name: "get_student_voice",
            description: "获取学生语音信息，支持通过学生ID或名称查询不同类型的语音。支持两种输出格式：text（默认）返回纯文本格式的语音信息，markdown/md格式返回包含音频链接的Markdown格式文本，可直接在支持Markdown的环境中播放音频。建议在需要在Markdown中展示音频时使用format=markdown参数。",
            inputSchema: zodToJsonSchema(GetStudentVoiceSchema) as ToolInput,
          },
          {
            name: "find_student_variants",
            description: "查找角色的所有变体（如泳装、新春等不同服装版本）。基于名字相似度匹配，帮助LLM快速发现一个角色的所有变体，避免重复查询。支持中文、日文、英文名称搜索。",
            inputSchema: zodToJsonSchema(FindStudentVariantsSchema) as ToolInput,
          },
          {
            name: "get_multiple_student_avatars",
            description: "批量获取多个学生的头像图片，提高查询效率。支持通过学生ID数组一次性获取多个角色的头像，避免多次单独调用。返回Markdown格式的图片链接。",
            inputSchema: zodToJsonSchema(GetMultipleStudentAvatarsSchema) as ToolInput,
          },
          {
            name: "get_multiple_student_voices",
            description: "批量获取多个学生的语音信息，提高查询效率。支持通过学生ID数组一次性获取多个角色的语音，避免多次单独调用。支持text和markdown两种输出格式。",
            inputSchema: zodToJsonSchema(GetMultipleStudentVoicesSchema) as ToolInput,
          }
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
          case 'get_student_voice': {
            const validatedArgs = GetStudentVoiceSchema.parse(args);
            return await this.handleGetStudentVoice(validatedArgs);
          }
          case 'find_student_variants': {
            const validatedArgs = FindStudentVariantsSchema.parse(args);
            return await this.handleFindStudentVariants(validatedArgs);
          }
          case 'get_multiple_student_avatars': {
            const validatedArgs = GetMultipleStudentAvatarsSchema.parse(args);
            return await this.handleGetMultipleStudentAvatars(validatedArgs);
          }
          case 'get_multiple_student_voices': {
            const validatedArgs = GetMultipleStudentVoicesSchema.parse(args);
            return await this.handleGetMultipleStudentVoices(validatedArgs);
          }
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
      language = 'cn',
      search,
      limit = 20,
      detailed = false,
      school,
      starGrade,
      role
    } = args;

    // 使用增强的方法
    const students = await this.client.getStudentsEnhanced({
      language,
      search,
      limit,
      detailed,
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
    const { name, language = 'cn', detailed = false } = args;

    const student = await this.client.getStudentByName(name, language, detailed);

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
    if (detailed) {
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
    const { studentId, language = 'cn' } = args;

    const students = await this.client.getStudents(language);
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

    const info = `
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

    return {
      content: [
        {
          type: "text",
          text: info
        }
      ]
    };
  }

  private async handleGetRaids(args: any) {
    const { language = 'cn', search, detailed = false } = args;

    let raids: any[];
    if (detailed) {
      raids = await this.client.getRaids(language);
    } else {
      raids = await this.client.getRaidsEnhanced(language, false);
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
    const { language = 'cn', category, tier, limit = 20, detailed = false } = args;

    const allEquipment = await this.client.getEquipment(language);
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
    const limitedEquipment = filteredEquipment.slice(0, limit);

    // 应用数据精简
    const processedEquipment = limitedEquipment.map(eq => 
      this.client['simplifyEquipmentData'](eq, detailed)
    );

    let result: string;
    if (detailed) {
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
    const processedStages = await this.client.getStagesEnhanced({
      language: args.language,
      search: args.search,
      area: args.area,
      chapter: args.chapter,
      difficulty: args.difficulty,
      limit: args.limit,
      detailed: args.detailed
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
      
      if (args.detailed && stage.DropList && stage.DropList.length > 0) {
        result += `   掉落物品: ${stage.DropList.map((drop: any) => drop.Name || drop.Id).join(', ')}\n`;
      }
      
      if (args.detailed && stage.EnemyList && stage.EnemyList.length > 0) {
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
    
    const processedItems = await this.client.getItemsEnhanced({
      language,
      search,
      category,
      rarity,
      tags,
      limit,
      detailed
    });

    let result = '';
    processedItems.forEach((item, index) => {
      result += `${index + 1}. ${item.Name || '未知物品'}\n`;
      result += `   ID: ${item.Id || 'N/A'}\n`;
      result += `   类别: ${item.Category || 'N/A'}\n`;
      result += `   稀有度: ${item.Rarity !== undefined ? item.Rarity : 'N/A'}\n`;
      
      if (detailed) {
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
    const parsed = GetFurnitureSchema.parse(args);
    const processedFurniture = await this.client.getFurnitureEnhanced(parsed);
    
    let result = '';
    processedFurniture.forEach((furniture, index) => {
      result += `${index + 1}. ${furniture.Name || '未知家具'}\n`;
      result += `   ID: ${furniture.Id || 'N/A'}\n`;
      result += `   类别: ${furniture.Category || 'N/A'}\n`;
      result += `   类型: ${furniture.Type || 'N/A'}\n`;
      result += `   稀有度: ${furniture.Rarity || 'N/A'}\n`;
      result += `   舒适度加成: ${furniture.ComfortBonus || 0}\n`;
      
      if (parsed.detailed) {
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
      language = 'cn',
      search,
      type,
      rank,
      armorType,
      bulletType,
      terrain,
      limit = 20,
      detailed = false
    } = args;

    const enemies = await this.client.getEnemiesEnhanced({
      language,
      search,
      type,
      rank,
      armorType,
      bulletType,
      terrain,
      limit,
      detailed
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
    const { studentId, name, language, avatarType, format = 'markdown' } = args;
    
    // 如果提供了学生ID，直接使用
    let targetStudentId = studentId;
    
    // 如果没有提供学生ID但提供了名称，先查找学生
    if (!targetStudentId && name) {
      const student = await this.client.getStudentByName(name, language);
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
      
      // 获取学生信息用于显示名称
      const student = await this.client.getStudentByName(name || targetStudentId.toString(), language);
      const studentName = student?.Name || `学生 ${targetStudentId}`;
      
      // 头像类型中文名称映射
      const avatarTypeNames = {
        portrait: "肖像",
        collection: "收藏",
        icon: "图标", 
        lobby: "大厅立绘"
      };
      
      const typeName = avatarTypeNames[avatarType?.toLowerCase() as keyof typeof avatarTypeNames] || avatarType || 'portrait';
      
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
      return {
        content: [
          {
            type: "text",
            text: `获取头像时出错: ${error instanceof Error ? error.message : '未知错误'}\n请检查学生ID是否正确或网络连接是否正常。`
          }
        ]
      };
    }
  }

  private async handleGetStudentVoice(args: any) {
    const { studentId, name, language, voiceType, format = 'text' } = args;
    
    // 如果提供了学生ID，直接使用
    let targetStudentId = studentId;
    
    // 如果没有提供学生ID但提供了名称，先查找学生
    if (!targetStudentId && name) {
      const student = await this.client.getStudentByName(name, language);
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
      const voiceData = await this.client.getVoiceData(language);
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
      
      // 获取学生信息用于显示名称
      const student = await this.client.getStudentByName(name || targetStudentId.toString(), language);
      const studentName = student?.Name || `学生 ${targetStudentId}`;
      
      // 根据voiceType筛选语音类型
      const voiceTypes = voiceType === 'all' ? 
        Object.keys(studentVoices) : 
        [voiceType].filter(type => studentVoices[type]);
      
      if (voiceTypes.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `未找到类型为 "${voiceType}" 的语音数据`
            }
          ]
        };
      }
      
      // 如果请求Markdown格式，返回Markdown格式
      if (format === 'markdown' || format === 'md') {
        let result = `# ${studentName} 的语音信息\n\n`;
        
        voiceTypes.forEach(type => {
          const voices = studentVoices[type];
          if (voices && typeof voices === 'object') {
            result += `## ${type.toUpperCase()} 语音\n\n`;
            Object.keys(voices).forEach(voiceKey => {
              const voiceValue = voices[voiceKey];
              // 格式化语音数据显示
              if (typeof voiceValue === 'object' && voiceValue !== null) {
                // 如果是对象，尝试提取有用信息
                if (voiceValue.text || voiceValue.content) {
                  result += `- **${voiceKey}**: ${voiceValue.text || voiceValue.content}\n`;
                } else if (voiceValue.url || voiceValue.file) {
                  const audioUrl = voiceValue.url || voiceValue.file;
                  result += `- **${voiceKey}**: [🎵 播放音频](${audioUrl})\n`;
                  // 如果支持HTML5音频标签，也可以添加
                  result += `  <audio controls><source src="${audioUrl}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>\n`;
                } else {
                  // 如果是复杂对象，显示JSON格式
                  result += `- **${voiceKey}**: \`\`\`json\n${JSON.stringify(voiceValue, null, 2)}\n\`\`\`\n`;
                }
              } else {
                // 如果是简单值，直接显示
                result += `- **${voiceKey}**: ${voiceValue}\n`;
              }
            });
            result += '\n';
          }
        });
        
        result += '\n**提示**: 在支持Markdown的环境中，音频链接应该能够点击播放。如果无法播放，请检查网络连接或音频链接。';
        
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
        if (voices && typeof voices === 'object') {
          result += `${type.toUpperCase()} 语音：\n`;
          Object.keys(voices).forEach(voiceKey => {
            const voiceValue = voices[voiceKey];
            // 格式化语音数据显示
            if (typeof voiceValue === 'object' && voiceValue !== null) {
              // 如果是对象，尝试提取有用信息
              if (voiceValue.text || voiceValue.content) {
                result += `  - ${voiceKey}: ${voiceValue.text || voiceValue.content}\n`;
              } else if (voiceValue.url || voiceValue.file) {
                result += `  - ${voiceKey}: ${voiceValue.url || voiceValue.file}\n`;
              } else {
                // 如果是复杂对象，显示JSON格式
                result += `  - ${voiceKey}: ${JSON.stringify(voiceValue, null, 2)}\n`;
              }
            } else {
              // 如果是简单值，直接显示
              result += `  - ${voiceKey}: ${voiceValue}\n`;
            }
          });
          result += '\n';
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
      return {
        content: [
          {
            type: "text",
            text: `获取语音数据时出错: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }

  // 新增的处理函数
  private async handleFindStudentVariants(args: any) {
    const { name, language, includeOriginal, format } = args;
    
    try {
      const variants = await this.client.findStudentVariants(name, language, includeOriginal);
      
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
      if (format === 'markdown' || format === 'md') {
        result = `# ${name} 的角色变体\n\n`;
        result += variants.map(variant => 
          `- **${variant.name}** (ID: ${variant.id}) - 相似度: ${(variant.similarity * 100).toFixed(1)}%`
        ).join('\n');
      } else {
        result = `${name} 的角色变体：\n\n`;
        result += variants.map(variant => 
          `${variant.name} (ID: ${variant.id}) - 相似度: ${(variant.similarity * 100).toFixed(1)}%`
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
      return {
        content: [
          {
            type: "text",
            text: `查找角色变体时出错: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }

  private async handleGetMultipleStudentAvatars(args: any) {
    const { studentIds, language, avatarType, format } = args;
    
    try {
      const avatars = await this.client.getMultipleStudentAvatars(studentIds, language, avatarType);
      
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
      if (format === 'markdown' || format === 'md') {
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
      return {
        content: [
          {
            type: "text",
            text: `获取头像时出错: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }

  private async handleGetMultipleStudentVoices(args: any) {
    const { studentIds, language, voiceType, format } = args;
    
    try {
      const voices = await this.client.getMultipleStudentVoices(studentIds, language, voiceType);
      
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
      if (format === 'markdown' || format === 'md') {
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
      return {
        content: [
          {
            type: "text",
            text: `获取语音数据时出错: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
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

// 主函数
async function main() {
    const server = new BlueArchiveMCPServer();
    await server.run();
}

// 运行服务器 - 直接启动，不检查执行条件
main().catch((error) => {
    console.error("服务器运行错误:", error);
    process.exit(1);
});
