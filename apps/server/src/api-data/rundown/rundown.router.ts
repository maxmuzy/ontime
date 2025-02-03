import express from 'express';

import {
  deletesEventById,
  rundownApplyDelay,
  rundownBatchPut,
  rundownDelete,
  rundownGetAll,
  rundownGetById,
  rundownGetNormalised,
  rundownGetPaginated,
  rundownPost,
  rundownPut,
  rundownReorder,
  rundownSwap,
  rundownGetPlaying,
  rundownGetPrevious,
  rundownGetNext,
  getPlayingCustomField,
  getNextCustomField,
  getPreviousCustomField,
  getPrompter,
} from './rundown.controller.js';
import {
  paramsMustHaveEventId,
  rundownArrayOfIds,
  rundownBatchPutValidator,
  rundownGetPaginatedQueryParams,
  rundownPostValidator,
  rundownPutValidator,
  rundownReorderValidator,
  rundownSwapValidator,
} from './rundown.validation.js';

export const router = express.Router();

router.get('/', rundownGetAll); // not used in Ontime frontend
router.get('/paginated', rundownGetPaginatedQueryParams, rundownGetPaginated); // not used in Ontime frontend
router.get('/normalised', rundownGetNormalised);
router.get('/playing', rundownGetPlaying);
router.get('/playing/custom-data/:customField', getPlayingCustomField);
router.get('/next', rundownGetNext);
router.get('/next/custom-data/:customField', getNextCustomField);
router.get('/before', rundownGetPrevious);
router.get('/before/custom-data/:customField', getPreviousCustomField);
router.get('/:eventId', paramsMustHaveEventId, rundownGetById); // not used in Ontime frontend
router.get('/playing/prompter', getPrompter);

router.post('/', rundownPostValidator, rundownPost);

router.put('/', rundownPutValidator, rundownPut);
router.put('/batch', rundownBatchPutValidator, rundownBatchPut);

router.patch('/reorder/', rundownReorderValidator, rundownReorder);
router.patch('/swap', rundownSwapValidator, rundownSwap);
router.patch('/applydelay/:eventId', paramsMustHaveEventId, rundownApplyDelay);

router.delete('/', rundownArrayOfIds, deletesEventById);
router.delete('/all', rundownDelete);
