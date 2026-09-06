import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';
import { steps, resetBoard } from './Memory-board';
import configText from './config.txt';
import codeText from './Memory-code.js';
import highlightText from './Memory-highlight.txt';
import descriptionText from './Memory-desc.html';
import traceText from './Memory-trace.txt';

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
