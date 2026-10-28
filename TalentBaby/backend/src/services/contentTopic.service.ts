import { ContentTopicRepository } from '../repositories/contentTopic.repository';

export class ContentTopicService {
  private contentTopicRepository: ContentTopicRepository;

  constructor() {
    this.contentTopicRepository = new ContentTopicRepository();
  }

  async getAllTopics() {
    return await this.contentTopicRepository.getAllTopics();
  }

  async getTopicById(id: number) {
    return await this.contentTopicRepository.getTopicById(id);
  }

  async getContentByTopic(topicId: number, contentType?: string) {
    return await this.contentTopicRepository.getContentByTopic(topicId, contentType);
  }

  async searchContent(searchTerm: string, contentType?: string) {
    return await this.contentTopicRepository.searchContent(searchTerm, contentType);
  }
}
