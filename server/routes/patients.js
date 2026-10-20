import {Router} from 'express'; import {list,get,create} from '../controllers/patientController.js'; import {auth,roles} from '../middleware/auth.js';
const r=Router(); r.use(auth); r.get('/',list); r.get('/:id',get); r.post('/',roles('Doctor','Admin'),create); export default r;
