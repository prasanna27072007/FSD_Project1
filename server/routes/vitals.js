import {Router} from 'express'; import {list,create} from '../controllers/vitalsController.js'; import {auth} from '../middleware/auth.js';
const r=Router(); r.use(auth); r.get('/:patientId',list); r.post('/',create); export default r;
