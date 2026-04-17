//calling the controller functions created in projectController.ts

import express from 'express'
import { protect } from '../middlewares/auth.js';
import { deleteProject, getProjectID, getPublishedProjects, makeRevision, projectPreview, rollbackToVersion, saveProjectCode } from '../controllers/projectController.js';

const projectRouter=express.Router();

projectRouter.post('/revision/:projectId',protect,makeRevision);
projectRouter.put('/save/:projectId',protect,saveProjectCode);
projectRouter.get('/rollback/:projectId/:versionId',protect,rollbackToVersion);
projectRouter.delete('/:projectId',protect,deleteProject);
projectRouter.get('/preview/:projectId',protect,projectPreview);
projectRouter.get('/published',getPublishedProjects);
projectRouter.get('/published/:versionId',getProjectID);

export default projectRouter