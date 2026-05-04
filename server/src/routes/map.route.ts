import { Router } from "express";
import addressToCoordinates from "../controllers/map.controller.js";

const router = Router();

router.get('/atc', addressToCoordinates);
export default router;