import express from "express";
import {getBuses,locations} from '../controllers/buses.js'
import BusData from "../models/buses.js";
const router = express.Router();

router.get('/',getBuses);
router.post('/',locations)
export default router;