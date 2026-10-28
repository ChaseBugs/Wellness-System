import { StoryRepository } from '../repositories/story.repository';

export class StoryService {
  private storyRepository: StoryRepository;

  constructor() {
    this.storyRepository = new StoryRepository();
  }

  async getStories(filters?: { category?: string; ageMonths?: number; search?: string }) {
    return await this.storyRepository.getStories(filters);
  }

  async getStoryById(id: number) {
    return await this.storyRepository.getStoryById(id);
  }

  async getStoryCategories() {
    return await this.storyRepository.getStoryCategories();
  }

  async addToFavorites(userId: number, storyId: number) {
    return await this.storyRepository.addStoryToFavorites(userId, storyId);
  }

  async removeFromFavorites(userId: number, storyId: number) {
    await this.storyRepository.removeStoryFromFavorites(userId, storyId);
  }

  async getFavoriteStories(userId: number) {
    return await this.storyRepository.getFavoriteStories(userId);
  }

  async isFavorite(userId: number, storyId: number): Promise<boolean> {
    return await this.storyRepository.isStoryFavorite(userId, storyId);
  }
}
