//Creating route to call the backend

import express from 'express'
import { createUserProject, getUSerCredits, getUSerProject, purchaseCredits, togglepublish } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const userRouter=express.Router();

userRouter.get('credits',protect, getUSerCredits)
userRouter.post('/project',protect,createUserProject)
userRouter.get('/project/:projectId',protect,getUSerProject)
userRouter.get('/projects',protect,getUSerProject)
userRouter.get('/publish-toggle/:projectId',protect,togglepublish)
userRouter.post('/purchase-credits',protect,purchaseCredits)

export default  userRouter;