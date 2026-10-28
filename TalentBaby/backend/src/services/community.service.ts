import { CommunityRepository, CommunityPost, PostComment } from '../repositories/community.repository';
import { AppError } from '../middleware/errorHandler';

export class CommunityService {
  private communityRepository: CommunityRepository;

  constructor() {
    this.communityRepository = new CommunityRepository();
  }

  async joinBirthClub(userId: number, birthMonth: number, birthYear: number): Promise<any> {
    const birthClub = await this.communityRepository.findOrCreateBirthClub(birthMonth, birthYear);
    await this.communityRepository.joinBirthClub(userId, birthClub.id);
    return birthClub;
  }

  async getUserBirthClubs(userId: number): Promise<any[]> {
    return await this.communityRepository.getUserBirthClubs(userId);
  }

  async createPost(userId: number, postData: Partial<CommunityPost>): Promise<CommunityPost> {
    return await this.communityRepository.createPost({
      ...postData,
      user_id: userId,
    });
  }

  async getPosts(birthClubId?: number, postType?: string, limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    return await this.communityRepository.getPosts(birthClubId, postType, limit, offset);
  }

  async getPostById(postId: number): Promise<CommunityPost> {
    const post = await this.communityRepository.getPostById(postId);
    if (!post) {
      const error: AppError = new Error('Post not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return post;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    await this.communityRepository.likePost(userId, postId);
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await this.communityRepository.unlikePost(userId, postId);
  }

  async createComment(userId: number, commentData: Partial<PostComment>): Promise<PostComment> {
    return await this.communityRepository.createComment({
      ...commentData,
      user_id: userId,
    });
  }

  async getComments(postId: number): Promise<PostComment[]> {
    return await this.communityRepository.getComments(postId);
  }
}
