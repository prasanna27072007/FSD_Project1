import {Router} from 'express'; import {overview} from '../controllers/analyticsController.js'; import {auth,roles} from '../middleware/auth.js';
const r=Router(); r.use(auth,roles('Doctor','Admin')); r.get('/overview',overview); export default r;
