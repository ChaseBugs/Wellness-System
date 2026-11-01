import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { LoginInput, RegisterInput } from "../models/auth.js";
import type { AuthService } from "../services/auth-service.js";

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  register = this.handle(async (req, res) => {
    const body = req.body as RegisterInput;
    const result = await this.authService.register(
      {
        email: body.email,
        password: body.password,
        displayName: body.displayName,
        locale: body.locale,
        country: body.country,
        timezone: body.timezone
      },
      req.appCode
    );
    sendSuccess(res, result, 201);
  });

  login = this.handle(async (req, res) => {
    const body = req.body as LoginInput;
    sendSuccess(res, await this.authService.login({ email: body.email, password: body.password }, req.appCode));
  });

  refresh = this.handle(async (req, res) => {
    sendSuccess(res, await this.authService.refresh(String(req.body.refreshToken), req.appCode));
  });

  logout = this.handle(async (req, res) => {
    await this.authService.logout(String(req.body.refreshToken));
    res.status(204).end();
  });
}
