import {Router} from 'express'; import {list,acknowledge,escalate} from '../controllers/alertController.js'; import {auth} from '../middleware/auth.js';
const r=Router(); r.use(auth); r.get('/',list); r.patch('/:id/acknowledge',acknowledge); r.patch('/:id/escalate',escalate); export default r;
