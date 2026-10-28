import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { UserArticleService } from '../services/userArticle.service';

const service = new UserArticleService();

export class UserArticleController extends BaseController {
  // ─── Articles ─────────────────────────────────────────────────────────────

  getArticles = this.handle(async (req, res) => {
    const { category, search } = req.query;
    const data = await service.getArticles({
      category:    category as string | undefined,
      search:      search   as string | undefined,
      doctor_only: req.query.doctor_only === 'true',
      userId:      req.user?.id,
      limit:       this.intQuery(req, 'limit', 20),
      offset:      this.intQuery(req, 'offset', 0),
    });
    this.ok(res, data);
  });

  getArticle = this.handle(async (req, res) => {
    const data = await service.getArticle(this.intParam(req, 'id'), req.user?.id);
    this.ok(res, data);
  });

  submitArticle = this.handle(async (req, res) => {
    const data = await service.submitArticle(this.userId(req), req.body);
    this.created(res, data);
  });

  updateArticle = this.handle(async (req, res) => {
    const data = await service.updateArticle(this.intParam(req, 'id'), this.userId(req), req.body);
    this.ok(res, data);
  });

  deleteArticle = this.handle(async (req, res) => {
    await service.deleteArticle(this.intParam(req, 'id'), this.userId(req));
    this.ok(res, { message: 'Article deleted.' });
  });

  toggleLike = this.handle(async (req, res) => {
    const action = await service.toggleLike(this.intParam(req, 'id'), this.userId(req));
    this.ok(res, { action });
  });

  // ─── Comments ─────────────────────────────────────────────────────────────

  getComments = this.handle(async (req, res) => {
    const data = await service.getComments(this.intParam(req, 'id'), req.user?.id);
    this.ok(res, data);
  });

  postComment = this.handle(async (req, res) => {
    const data = await service.postComment(this.userId(req), this.intParam(req, 'id'), req.body);
    this.created(res, data);
  });

  deleteComment = this.handle(async (req, res) => {
    await service.deleteComment(this.intParam(req, 'commentId'), this.userId(req));
    this.ok(res, { message: 'Comment deleted.' });
  });

  toggleCommentLike = this.handle(async (req, res) => {
    const action = await service.toggleCommentLike(this.intParam(req, 'commentId'), this.userId(req));
    this.ok(res, { action });
  });

  // ─── Points ───────────────────────────────────────────────────────────────

  getMyPoints = this.handle(async (req, res) => {
    const data = await service.getMyPoints(this.userId(req));
    this.ok(res, data);
  });

  getLeaderboard = this.handle(async (_req, res) => {
    const data = await service.getLeaderboard();
    this.ok(res, data);
  });

  // ─── Doctor Profiles ──────────────────────────────────────────────────────

  getAllDoctors = this.handle(async (req, res) => {
    const data = await service.getAllDoctors({
      specialty:   req.query.specialty as string | undefined,
      grade_level: this.intQuery(req, 'grade_level'),
    });
    this.ok(res, data);
  });

  getDoctorProfile = this.handle(async (req, res) => {
    const data = await service.getDoctorProfile(this.intParam(req, 'userId'));
    this.ok(res, data);
  });

  registerDoctorProfile = this.handle(async (req, res) => {
    const data = await service.registerOrUpdateDoctorProfile(this.userId(req), req.body);
    this.created(res, data);
  });

  verifyDoctor = this.handle(async (req, res) => {
    const data = await service.verifyDoctor(this.intParam(req, 'userId'));
    this.ok(res, data);
  });
}
