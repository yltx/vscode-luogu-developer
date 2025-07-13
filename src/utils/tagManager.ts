import { fetchLuoguTags } from './api';

interface Tag {
  id: number;
  name: string;
  type: number;
  parent: number | null;
  color?: string;
}

interface TagType {
  id: number;
  type: string;
  name: string;
  color: string;
  order: number | null;
}

class TagManager {
  private tags: Map<number, Tag> = new Map();
  private tagTypes: Map<number, TagType> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存
  private fetchPromise: Promise<void> | null = null;

  private getTagColorFromType(typeId: number): string {
    const tagType = this.tagTypes.get(typeId);
    if (!tagType) return '#666666';
    
    // 将洛谷的颜色格式转换为标准的颜色格式
    const colorMap: { [key: string]: string } = {
      'green-3': '#52C41A',
      'lapis-3': '#1890FF', 
      'cyan-3': '#13C2C2',
      'blue-3': '#1890FF',
      'orange-3': '#FA8C16',
      'grey-5': '#666666'
    };
    
    return colorMap[tagType.color] || '#666666';
  }

  private async fetchTags(): Promise<void> {
    try {
      const response = await fetchLuoguTags();
      this.tags.clear();
      this.tagTypes.clear();
      
      // 首先处理标签类型信息
      response.types.forEach(tagType => {
        this.tagTypes.set(tagType.id, tagType);
      });
      
      // 然后处理标签信息，为每个标签设置正确的颜色
      response.tags.forEach(tag => {
        this.tags.set(tag.id, {
          ...tag,
          color: this.getTagColorFromType(tag.type)
        });
      });
      
      this.lastFetch = Date.now();
      console.log(`成功获取 ${this.tags.size} 个标签数据`);
    } catch (error) {
      console.error('获取标签数据失败:', error);
      // 如果获取失败，使用默认的硬编码数据作为后备
      this.loadFallbackTags();
    }
  }

  private loadFallbackTags(): void {
    // 加载一些基本的标签作为后备
    const fallbackTags = [
      { id: 1, name: '模拟', type: 2, parent: 110 },
      { id: 2, name: '字符串', type: 2, parent: null },
      { id: 3, name: '动态规划 DP', type: 2, parent: null },
      { id: 4, name: '搜索', type: 2, parent: null },
      { id: 5, name: '数学', type: 2, parent: null },
      { id: 6, name: '图论', type: 2, parent: null },
      { id: 7, name: '贪心', type: 2, parent: 110 },
      { id: 8, name: '计算几何', type: 2, parent: null },
      // 可以添加更多基础标签
    ];

    // 设置基本的标签类型
    this.tagTypes.set(1, { id: 1, type: 'Region', name: '区域', color: 'green-3', order: 4 });
    this.tagTypes.set(2, { id: 2, type: 'Algorithm', name: '算法', color: 'lapis-3', order: 1 });
    this.tagTypes.set(3, { id: 3, type: 'Origin', name: '来源', color: 'cyan-3', order: 2 });
    this.tagTypes.set(4, { id: 4, type: 'Time', name: '时间', color: 'blue-3', order: 3 });
    this.tagTypes.set(5, { id: 5, type: 'SpecialProblem', name: '特殊题目', color: 'orange-3', order: 5 });
    this.tagTypes.set(6, { id: 6, type: 'Others', name: '其他', color: 'grey-5', order: null });

    fallbackTags.forEach(tag => {
      this.tags.set(tag.id, {
        ...tag,
        color: this.getTagColorFromType(tag.type)
      });
    });
  }

  public async getTag(tagId: number): Promise<Tag | null> {
    // 检查是否需要刷新缓存
    const now = Date.now();
    if (now - this.lastFetch > this.CACHE_DURATION || this.tags.size === 0) {
      if (!this.fetchPromise) {
        this.fetchPromise = this.fetchTags().finally(() => {
          this.fetchPromise = null;
        });
      }
      await this.fetchPromise;
    }

    return this.tags.get(tagId) || null;
  }

  public async getTags(tagIds: number[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const id of tagIds) {
      const tag = await this.getTag(id);
      if (tag) {
        tags.push(tag);
      }
    }
    return tags;
  }

  public async getAllTags(): Promise<Map<number, Tag>> {
    // 确保数据是最新的
    const now = Date.now();
    if (now - this.lastFetch > this.CACHE_DURATION || this.tags.size === 0) {
      if (!this.fetchPromise) {
        this.fetchPromise = this.fetchTags().finally(() => {
          this.fetchPromise = null;
        });
      }
      await this.fetchPromise;
    }
    return new Map(this.tags);
  }

  public clearCache(): void {
    this.tags.clear();
    this.lastFetch = 0;
  }
}

// 导出单例实例
export const tagManager = new TagManager();
export { Tag };
