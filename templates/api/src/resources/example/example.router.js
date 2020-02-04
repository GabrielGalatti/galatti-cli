import { Router } from 'express'
import controllers from './example.controller'

const router = Router();

router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.createOne)

export default router
