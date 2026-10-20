import {Router} from 'express'; import {runDiagnosis,runChat} from '../controllers/aiController.js'; import {auth,roles} from '../middleware/auth.js';
const r=Router(); r.use(auth); r.post('/diagnose',roles('Doctor','Admin'),runDiagnosis); r.post('/chat',runChat); export default r;
