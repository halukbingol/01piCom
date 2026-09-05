import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';
import { steps, resetBoard } from './board';
import configText from './config.txt';
import codeText from './LLS.js';
import highlightText from './LLS.js-ch.txt';
import descriptionText from './LLS.js-decr.html';
import traceText from './LLS.js-trace.txt';

/**
 * The compiled `content-LLS` content: insert-at-head on a singly linked list.
 */
const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'content-LLS',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
};
