import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transcribeRouter from "./transcribe";
import authRouter from "./auth";
import transcriptionAuthRouter from "./transcriptionAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(transcriptionAuthRouter);
router.use(transcribeRouter);

export default router;
