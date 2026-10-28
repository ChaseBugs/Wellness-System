import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CommunityService } from '../services/community.service';
import { logger } from '../utils/logger';

export class CommunityController {
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
  }

  async joinBirthClub(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { birth_month, birth_year } = req.body;

      const birthClub = await this.communityService.joinBirthClub(userId, birth_month, birth_year);

      logger.info('User joined birth club', { userId, birthClubId: birthClub.id });

      res.status(200).json({
        message: 'Joined birth club successfully',
        data: birthClub,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBirthClubs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const clubs = await this.communityService.getUserBirthClubs(userId);

      res.status(200).json({
        message: 'Birth clubs retrieved successfully',
        data: clubs,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const post = await this.communityService.createPost(userId, req.body);

      logger.info('Community post created', { userId, postId: post.id });

      res.status(201).json({
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const birthClubId = req.query.birth_club_id ? parseInt(req.query.birth_club_id as string, 10) : undefined;
      const postType = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const posts = await this.communityService.getPosts(birthClubId, postType, limit, offset);

      res.status(200).json({
        message: 'Posts retrieved successfully',
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = parseInt(req.params.id, 10);
      const post = await this.communityService.getPostById(postId);

      res.status(200).json({
        message: 'Post retrieved successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const postId = parseInt(req.params.id, 10);

      await this.communityService.likePost(userId, postId);

      res.status(200).json({
        message: 'Post liked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async unlikePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const postId = parseInt(req.params.id, 10);

      await this.communityService.unlikePost(userId, postId);

      res.status(200).json({
        message: 'Post unliked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      // Support post_id from URL params (POST /posts/:id/comments) or request body
      const postId = req.params.id ? parseInt(req.params.id, 10) : parseInt(req.body.post_id, 10);
      const comment = await this.communityService.createComment(userId, {
        post_id: postId,
        content: req.body.content,
      });

      res.status(201).json({
        message: 'Comment created successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = parseInt(req.params.postId, 10);
      const comments = await this.communityService.getComments(postId);

      res.status(200).json({
        message: 'Comments retrieved successfully',
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }
}
