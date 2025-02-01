import * as net from 'net';
import { logger } from '../../../classes/Logger.js';
import { LogOrigin, TCPOutput } from 'ontime-types';
import { type RuntimeState } from '../../../stores/runtimeState.js';

import { parseTemplateNested } from '../automation.utils.js';


const connections = new Map<string, net.Socket>();

/** Estabelece conexão TCP e gerencia envio de mensagens */
export function emitTCP(output: TCPOutput, state: RuntimeState) {
  const key = `${output.targetIP}:${output.targetPort}`;

  if (!connections.has(key)) {
    const socket = new net.Socket();

    socket.connect(output.targetPort, output.targetIP, () => {
      logger.info(LogOrigin.Tx, `Connected to ${key}`);
      connections.set(key, socket);
      sendTCP(socket, output, state);
    });

    socket.on('close', () => {
      logger.info(LogOrigin.Tx, `Connection closed: ${key}`);
      connections.delete(key);
    });

    socket.on('error', (error) => {
      logger.error(LogOrigin.Tx, `TCP Error (${key}): ${error}`);
      connections.delete(key);
    });
  } else {
    const socket = connections.get(key)!;
    sendTCP(socket, output, state);
  }
}

/** Envia mensagem pela conexão existente */
function sendTCP(socket: net.Socket, output: TCPOutput, state: RuntimeState) {
  const parsedMessage = parseTemplate(output, state);
  logger.info(LogOrigin.Tx, `Sending TCP: ${parsedMessage}`);
  socket.write(`${parsedMessage}\r\n`);
}

/** Fecha conexões TCP */
export function closeAllTCPConnections() {
  connections.forEach((socket, key) => {
    logger.info(LogOrigin.Tx, `Closing connection: ${key}`);
    socket.destroy();
  });
  connections.clear();
}

/** Substitui variáveis de template na mensagem */
function parseTemplate(output: TCPOutput, state: RuntimeState): string {
  const parsedArguments = output.args ? parseTemplateNested(output.args, state) : undefined;
  return parsedArguments ?? '';
}