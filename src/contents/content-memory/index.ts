import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';
import { steps, resetBoard } from './board';
import configText from './config.txt';
import codeText from './Memory.js';
import highlightText from './Memory.js-ch.txt';
import descriptionText from './Memory.js-decr.html';
import traceText from './Memory.js-trace.txt';

/**
 * The compiled `content-memory` content: a direct-access memory visualization
 * of literal assignment and variable-to-variable assignment.
 */
const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'content-memory',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
};
