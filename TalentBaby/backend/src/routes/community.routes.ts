import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const communityController = new CommunityController();

// Birth Clubs
router.post('/birth-club/join', authenticate, communityController.joinBirthClub.bind(communityController));
router.get('/birth-clubs', authenticate, communityController.getUserBirthClubs.bind(communityController));

// Posts
router.get('/posts', authenticate, communityController.getPosts.bind(communityController));
router.post('/posts', authenticate, communityController.createPost.bind(communityController));
router.get('/posts/:id', authenticate, communityController.getPost.bind(communityController));
router.post('/posts/:id/like', authenticate, communityController.likePost.bind(communityController));
router.delete('/posts/:id/like', authenticate, communityController.unlikePost.bind(communityController));

// Comments
router.get('/posts/:postId/comments', authenticate, communityController.getComments.bind(communityController));
router.post('/posts/:id/comments', authenticate, communityController.createComment.bind(communityController));
router.post('/comments', authenticate, communityController.createComment.bind(communityController));

export default router;
