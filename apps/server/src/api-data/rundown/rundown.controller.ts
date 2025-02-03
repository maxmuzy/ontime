import {
  ErrorResponse,
  MessageResponse,
  OntimeEvent,
  OntimeRundown,
  OntimeRundownEntry,
  RundownCached,
  RundownPaginated,
} from 'ontime-types';
import { getErrorMessage, getNextEvent, isPlaybackActive } from 'ontime-utils';
import { PlayableEvent, Playback } from 'ontime-types';
import { getState, type RuntimeState } from '../../stores/runtimeState.js';

import type { Request, Response } from 'express';

import { failEmptyObjects } from '../../utils/routerUtils.js';
import {
  addEvent,
  applyDelay,
  batchEditEvents,
  deleteAllEvents,
  deleteEvent,
  editEvent,
  reorderEvent,
  swapEvents,
} from '../../services/rundown-service/RundownService.js';
import {
  getEventWithId,
  getNormalisedRundown,
  getPaginated,
  getRundown,
  findNext,
  findPrevious,
} from '../../services/rundown-service/rundownUtils.js';
import { makeRuntimeStateData } from '../../stores/__mocks__/runtimeState.mocks.js';


/**
 * Retorna o evento que está atualmente tocando (ou em pausa ou rolando)
 * Se não houver nenhum evento ativo, retorna null.
 */
export function getPlayingEvent(): PlayableEvent | null {
  const state = getState();

  // Se houver um evento carregado e o estado de playback estiver ativo...
  if (state.eventNow && isPlaybackActive(state.timer.playback)) {
    return state.eventNow;
  }

  return null;
}
export async function rundownGetPlaying(_req: Request, res: Response<OntimeRundownEntry | ErrorResponse>) {
  try {
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).json({ message: 'No playing event found' });
      return;
    }
    playingEvent.custom
    res.status(200).json(playingEvent);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

export async function rundownGetNext(_req: Request, res: Response<PlayableEvent | ErrorResponse>) {
  try {
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).json({ message: 'No playing event found' });
      return;
    }
    const nextEvent = findNext(playingEvent.id);
    if (!nextEvent) {
      res.status(404).json({ message: 'No next event found' });
      return;
    }
    res.status(200).json(nextEvent);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

export async function rundownGetPrevious(_req: Request, res: Response<OntimeEvent | ErrorResponse>) {
  try {
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).json({ message: 'No playing event found' });
      return;
    }
    const previousEvent = findPrevious(playingEvent.id);
    if (!previousEvent) {
      res.status(404).json({ message: 'No previous event found' });
      return;
    }
    res.status(200).json(previousEvent);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

/**
 * Endpoint para retornar o conteúdo de um campo customizado para o evento em execução.
 * Rota: GET /playing/custom-data/:customField
 */
export async function getPlayingCustomField(req: Request, res: Response): Promise<void> {
  try {
    const { customField } = req.params;

    // Obtém o evento atualmente em execução (eventNow)
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).json({ message: 'No playing event found' });
      return;
    }

    // Verifica se o evento possui dados customizados
    const customData = playingEvent.custom;
    if (!customData || !(customField in customData)) {
      res.status(404).json({
        message: `Custom field "${customField}" not found`,
      });
      return;
    }

    // Retorna somente o conteúdo do campo customizado
    res.json({ value: customData[customField] });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

/**
 * Endpoint para retornar o conteúdo de um campo customizado para o evento em execução.
 * Rota: GET /next/custom-data/:customField
 */
export async function getNextCustomField(req: Request, res: Response): Promise<void> {
  try {
    const { customField } = req.params;

    // Obtém o evento atualmente em execução (eventNow)
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).json({ message: 'No playing event found' });
      return;
    }
    const nextEvent = findNext(playingEvent.id);
    if (!nextEvent) {
      res.status(404).json({ message: 'No next event found' });
      return;
    }

    // Verifica se o evento possui dados customizados
    const customData = nextEvent.custom;
    if (!customData || !(customField in customData)) {
      res.status(404).json({
        message: `Custom field "${customField}" not found`,
      });
      return;
    }

    // Retorna somente o conteúdo do campo customizado
    res.json({ value: customData[customField] });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

/**
 * Endpoint para retornar o conteúdo de um campo customizado para o evento em execução.
 * Rota: GET /before/custom-data/:customField
 */
export async function getPreviousCustomField(req: Request, res: Response): Promise<void> {
  try {
    const { customField } = req.params;

    // Obtém o evento atualmente em execução (eventNow)
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).json({ message: 'No playing event found' });
      return;
    }
    const previousEvent = findPrevious(playingEvent.id);
    if (!previousEvent) {
      res.status(404).json({ message: 'No previous event found' });
      return;
    }

    // Verifica se o evento possui dados customizados
    const customData = previousEvent.custom;
    if (!customData || !(customField in customData)) {
      res.status(404).json({
        message: `Custom field "${customField}" not found`,
      });
      return;
    }

    // Retorna somente o conteúdo do campo customizado
    res.json({ value: customData[customField] });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

/**
 * Endpoint para retornar o conteúdo de um campo customizado para o evento em execução.
 * Rota: GET /prompter
 */
export async function getPrompter(req: Request, res: Response): Promise<void> {
  try {
    const customField = "header";

    // Obtém o evento atualmente em execução (eventNow)
    const playingEvent = getPlayingEvent();
    if (!playingEvent) {
      res.status(404).send('No playing event found');
      return;
    }

    // Verifica se o evento possui dados customizados
    const customData = playingEvent.custom;
    if (!customData || !(customField in customData)) {
      res.status(404).send(`Create custom field "header" to show the content.`);
      return;
    }

    let prompter = customData[customField];

    const nextEvent = findNext(playingEvent.id);
    if (nextEvent) {
      // Verifica se o evento possui dados customizados
      const customData = nextEvent.custom;
      if (customData || (customField in customData)) {
        prompter += customData[customField];
      }

    }

    // Retorna o conteúdo dos campos header do evento em execução e o proximo evento
    res.send(prompter);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).send(message);
  }
}

export async function rundownGetAll(_req: Request, res: Response<OntimeRundown>) {
  const rundown = getRundown();
  res.json(rundown);
}

export async function rundownGetNormalised(_req: Request, res: Response<RundownCached>) {
  const cachedRundown = getNormalisedRundown();
  res.json(cachedRundown);
}

export async function rundownGetById(req: Request, res: Response<OntimeRundownEntry | ErrorResponse>) {
  const { eventId } = req.params;

  try {
    const event = getEventWithId(eventId);

    if (!event) {
      res.status(404).send({ message: 'Event not found' });
      return;
    }
    res.status(200).json(event);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(500).json({ message });
  }
}

export async function rundownGetPaginated(req: Request, res: Response<RundownPaginated | ErrorResponse>) {
  const { limit, offset } = req.query;

  if (limit == null && offset == null) {
    return res.json({
      rundown: getRundown(),
      total: getRundown().length,
    });
  }

  try {
    let parsedOffset = Number(offset);
    if (Number.isNaN(parsedOffset)) {
      parsedOffset = 0;
    }
    let parsedLimit = Number(limit);
    if (Number.isNaN(parsedLimit)) {
      parsedLimit = Infinity;
    }
    const paginatedRundown = getPaginated(parsedOffset, parsedLimit);

    res.status(200).json(paginatedRundown);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).json({ message });
  }
}

export async function rundownPost(req: Request, res: Response<OntimeRundownEntry | ErrorResponse>) {
  if (failEmptyObjects(req.body, res)) {
    return;
  }

  try {
    const newEvent = await addEvent(req.body);
    res.status(201).send(newEvent);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function rundownPut(req: Request, res: Response<OntimeRundownEntry | ErrorResponse>) {
  if (failEmptyObjects(req.body, res)) {
    return;
  }

  try {
    const event = await editEvent(req.body);
    res.status(200).send(event);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function rundownBatchPut(req: Request, res: Response<MessageResponse | ErrorResponse>) {
  if (failEmptyObjects(req.body, res)) {
    return res.status(404);
  }

  try {
    const { data, ids } = req.body;
    await batchEditEvents(ids, data);
    res.status(200).send({ message: 'Batch edit successful' });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function rundownReorder(req: Request, res: Response<OntimeRundownEntry | ErrorResponse>) {
  if (failEmptyObjects(req.body, res)) {
    return;
  }

  try {
    const { eventId, from, to } = req.body;
    const event = await reorderEvent(eventId, from, to);
    res.status(200).send(event.newEvent);
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function rundownSwap(req: Request, res: Response<MessageResponse | ErrorResponse>) {
  if (failEmptyObjects(req.body, res)) {
    return;
  }

  try {
    const { from, to } = req.body;
    await swapEvents(from, to);
    res.status(200).send({ message: 'Swap successful' });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function rundownApplyDelay(req: Request, res: Response<MessageResponse | ErrorResponse>) {
  try {
    await applyDelay(req.params.eventId);
    res.status(200).send({ message: 'Delay applied' });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function rundownDelete(_req: Request, res: Response<MessageResponse | ErrorResponse>) {
  try {
    await deleteAllEvents();
    res.status(204).send({ message: 'All events deleted' });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}

export async function deletesEventById(req: Request, res: Response<MessageResponse | ErrorResponse>) {
  try {
    await deleteEvent(req.body.ids);
    res.status(204).send({ message: 'Events deleted' });
  } catch (error) {
    const message = getErrorMessage(error);
    res.status(400).send({ message });
  }
}
